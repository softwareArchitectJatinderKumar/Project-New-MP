import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService }                       from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService }                    from 'src/app/_services/storage.service';
import { countries }                         from '../countries-list';

import {
  ApplicationRecord,
  CourseRow,
  DocumentField,
  PickedFileState,
  StudentProfile,
  TabId,
  UniversityOption,
} from './models/student-dashboard.models';

import {
  ALWAYS_DISABLED_KEYS,
  APPLYING_OPTIONS,
  AVAILABLE_FUNDS_OPTIONS,
  CONDITIONAL_PASSPORT_KEYS,
  CONDITIONAL_RELATIVE_KEYS,
  CONDITIONAL_SCORE_KEYS,
  DOCUMENT_FIELDS,
  ENGLISH_TEST_TYPES,
  FORM_SUBMIT_FIELDS,
  LABEL_OVERRIDES,
  MAX_FILE_SIZE_BYTES,
  SAFE_FILENAME_REGEX,
  SERVER_URL,
  YES_NO_OPTIONS,
} from './constants/student-dashboard.constants';

// ─────────────────────────────────────────────────────────────
@Component({
  selector:        'app-student-dashboard-refactor',
  templateUrl:     './StudentDashboardwithTabs.components.html',
  styleUrls:       ['./StudentDashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardwithTabs implements OnInit, OnDestroy {

  // ── Static config exposed to template ─────────────────────
  readonly documentFields        = DOCUMENT_FIELDS;
  readonly applyingOptions       = APPLYING_OPTIONS;
  readonly yesNoOptions          = YES_NO_OPTIONS;
  readonly englishTestTypes      = ENGLISH_TEST_TYPES;
  readonly availableFundsOptions = AVAILABLE_FUNDS_OPTIONS;
  readonly countriesList         = countries;
  readonly serverUrl             = SERVER_URL;

  // ── UI state ───────────────────────────────────────────────
  isLoading            = false;
  isSavingCourses      = false;
  isLoginFailed        = false;
  activeTab: TabId     = 'courses';
  isCoursesSectionDisabled = false;

  // ── Forms ──────────────────────────────────────────────────
  applicationForm!: FormGroup;
  isSection1Edit   = false;
  isSection2Edit   = false;

  // ── Data ──────────────────────────────────────────────────
  applicationId    = '';
  registrationNo   = '';
  loginName        = '';

  stuApplication:    ApplicationRecord | null = null;
  universityOptions: UniversityOption[]       = [];
  studentProfile:    StudentProfile   | null  = null;
  studentImage:      string           | null  = null;

  // Picked files — one entry per documentField.key, populated by onDocumentFilePicked
  pickedFiles: Record<string, PickedFileState> = this.buildEmptyPickedFiles();

  otherDocumentKeys: string[] = [];
  courseRows:        CourseRow[] = [];

  // ── Subscription cleanup ───────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ──────────────────────────────────────────────────────────
  constructor(
    private readonly fb:             FormBuilder,
    private readonly authService:    AuthService,
    private readonly storageService: StorageService,
    private readonly studentService: SemesterExchangeStuDetailsService,
    private readonly ServicesSM:     SemesterExchangeStuDetailsService,
    private readonly route:          ActivatedRoute,
    private readonly title:          Title,
    private readonly cdr:            ChangeDetectorRef,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────

  ngOnInit(): void {
    const titleEl = document.getElementById('stMain') as HTMLElement | null;
    const logoEl  = document.getElementById('imgLogo') as HTMLImageElement | null;
    if (titleEl) titleEl.innerHTML = 'Semester <span class="text-info">Exchange</span> Student Dashboard';
    if (logoEl)  logoEl.style.width = '164px';

    const snap         = this.route.snapshot.params;
    this.loginName     = snap['LoginName']      ?? '';
    this.registrationNo = snap['RegistrationNo'] ?? '';

    this.initEmptyForm();

    if (this.loginName) {
      this.getToken(this.loginName);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Getters — conditional field visibility ─────────────────

  get showEnglishScores(): boolean {
    const t = ((this.applicationForm?.get('englishTestType')?.value as string) ?? '').toUpperCase();
    return !!t && t !== 'APPLIED' && t !== 'NA' && t !== 'NOTREQURIED' && t !== 'NOTGIVEN';
  }

  get showPassportDetails(): boolean {
    return this.applicationForm?.get('passportStatus')?.value === 'Yes';
  }

  get showRelativeDetails(): boolean {
    const name = ((this.applicationForm?.get('relativeName')?.value as string) ?? '').trim();
    return !!name && name.toUpperCase() !== 'NA';
  }

  get showSponsorDetails(): boolean {
    const fundedBy = ((this.applicationForm?.get('isSelfFunded')?.value as string) ?? '').trim();
    return !!fundedBy && fundedBy.toUpperCase() !== 'NA';
  }

  // ── Template helpers ───────────────────────────────────────

  /** Converts a camelCase key to a human-readable label */
  labelFor(key: string): string {
    return LABEL_OVERRIDES[key] ??
      key.replace(/([A-Z])/g, ' $1')
         .replace(/_/g, ' ')
         .replace(/\b\w/g, c => c.toUpperCase())
         .trim();
  }

  selectTab(tab: TabId): void {
    this.activeTab = tab;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.applicationForm?.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  getFirstError(field: string): string | null {
    const ctrl = this.applicationForm?.get(field);
    if (!ctrl?.errors) return null;
    if (ctrl.errors['required']) return `${this.labelFor(field)} is required`;
    if (ctrl.errors['email'])    return 'Invalid email address';
    return 'Invalid value';
  }

  hasUploadedDocuments(): boolean {
    if (!this.stuApplication) return false;
    return DOCUMENT_FIELDS.every(doc => {
      const existing = !!((this.stuApplication![doc.apiFileField as keyof ApplicationRecord]) as string)?.length;
      return existing || !!this.pickedFiles[doc.key]?.fileName;
    });
  }

  trackByCourseIndex(index: number): number              { return index; }
  trackByDocKey    (_: number, doc: DocumentField): string { return doc.key; }

  // ── Auth & data loading ────────────────────────────────────

  getToken(loginName: string): void {
    this.authService.loginTemp(loginName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.storageService.saveUser(data);
          const token = this.storageService.getUser();

          if (!this.storageService.isLoggedIn() || token === 'Token Expired') {
            this.loginFailed('Invalid or expired token');
          } else {
            const el = document.getElementById('stMain') as HTMLElement | null;
            if (el) el.innerHTML = 'Semester Exchange <span class="themeClr">Student Dashboard</span>';
            this.getUniversityDetails();
          }
          this.cdr.markForCheck();
        },
        error: err => { this.loginFailed(err); this.cdr.markForCheck(); },
      });
  }

  loginFailed(_err: unknown): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid!', icon: 'warning' });
    this.cdr.markForCheck();
  }

  getUniversityDetails(): void {
    this.ServicesSM.getUniversityDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.universityOptions = (response.item1 ?? []).map((u: any): UniversityOption => ({
            universityId:   u.universityId,
            universityName: u.universityName,
          }));
          this.getApplicationDetails(this.registrationNo);
          this.cdr.markForCheck();
        },
        error: () => this.getApplicationDetails(this.registrationNo),
      });
  }

  getApplicationDetails(regId: string): void {
    this.isLoading = true;
    const startTime = Date.now();

    this.studentService.getStudentDetailsBYId(regId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.item1?.length > 0) {
            this.stuApplication = response.item1[0] as ApplicationRecord;
            this.applicationId  = this.stuApplication.applicationId;

            this.detectOtherDocs();
            this.buildApplicationForm();
            this.populateForm();
            this.initCourseRows();
            this.loadStudentImage(this.stuApplication.registrationNo);
          } else {
            this.loginFailed('No application data');
          }

          const delay = Math.max(2500 - (Date.now() - startTime), 0);
          setTimeout(() => { this.isLoading = false; this.cdr.markForCheck(); }, delay);
        },
        error: err => {
          this.isLoading = false;
          this.loginFailed(err);
          this.cdr.markForCheck();
        },
      });
  }

  // ── Section 1 — Application form ──────────────────────────

  enableSection1Edit(): void {
    this.isSection1Edit = true;
    this.applicationForm.enable();
    for (const key of ALWAYS_DISABLED_KEYS) {
      this.applicationForm.get(key)?.disable();
    }
    this.cdr.markForCheck();
  }

  updateApplicationSection(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      Swal.fire({ title: 'Validation', text: 'Please fill all required fields', icon: 'warning' });
      return;
    }

    const raw      = this.applicationForm.getRawValue();
    const formData = new FormData();

    for (const key of FORM_SUBMIT_FIELDS) {
      const camel = this.toCamelCase(key);
      const value = raw[camel] ?? raw[key] ?? 'NA';
      formData.append(key, value != null ? String(value) : 'NA');
    }

    this.isLoading = true;
    const start = Date.now();

    this.studentService.updateApplicationDetails(formData)
      .pipe(
        finalize(() => {
          const remaining = Math.max(800 - (Date.now() - start), 0);
          setTimeout(() => { this.isLoading = false; this.cdr.markForCheck(); }, remaining);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resp: any) => {
          const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
          if (msg === 'Success') {
            Swal.fire({ title: 'Updated', text: 'Application details updated successfully', icon: 'success' }).then(() => {
              this.isSection1Edit = false;
              this.applicationForm.disable();
              this.getApplicationDetails(this.registrationNo);
            });
          } else {
            Swal.fire({ title: 'Error', text: 'Failed to update application', icon: 'error' });
          }
        },
        error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' }),
      });
  }

  // ── Section 2 — Documents ──────────────────────────────────

  enableSection2Edit(): void {
    this.isSection2Edit = true;
    this.cdr.markForCheck();
  }

  /**
   * Single handler for all five document file inputs.
   * Validates size, sanitises the filename, converts to base64.
   * Call from template as: (change)="onDocumentFilePicked($event, doc.key)"
   */
  onDocumentFilePicked(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3 MB. Please upload a smaller file.', icon: 'warning' });
      input.value = '';
      return;
    }

    const safeFile = this.toSafeFile(file, input);
    const reader   = new FileReader();
    reader.onload  = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.pickedFiles[key] = { file: safeFile, base64, fileName: safeFile.name };
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(safeFile);
  }

  /** Builds FormData from the DOCUMENT_FIELDS config + pickedFiles state, then calls UpdateDocuments */
  submitDocuments(): void {
    const formData = new FormData();
    formData.append('RegistrationNo', this.registrationNo || this.applicationForm?.get('registrationNo')?.value || 'NA');
    formData.append('ApplicationId',  this.applicationId  || 'NA');

    for (const doc of DOCUMENT_FIELDS) {
      const picked   = this.pickedFiles[doc.key];
      const existing = (this.stuApplication?.[doc.apiFileField as keyof ApplicationRecord] as string) ?? '';

      if (picked.file) {
        formData.append(doc.formNameField, picked.fileName ?? picked.file.name);
        formData.append(doc.formDataField, picked.base64   ?? '');
      } else {
        formData.append(doc.formNameField, existing || 'NA');
        formData.append(doc.formDataField, existing ? '' : 'NA');
      }
    }

    this.isLoading = true;
    const start = Date.now();

    this.studentService.UpdateDocuments(formData)
      .pipe(
        finalize(() => {
          const remaining = Math.max(800 - (Date.now() - start), 0);
          setTimeout(() => { this.isLoading = false; this.cdr.markForCheck(); }, remaining);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resp: any) => {
          const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
          if (msg === 'Success') {
            Swal.fire({ title: 'Documents Updated', icon: 'success' }).then(() => {
              this.isSection2Edit = false;
              this.pickedFiles    = this.buildEmptyPickedFiles();
              this.getApplicationDetails(this.registrationNo);
            });
          } else {
            Swal.fire({ title: 'Error', text: 'Failed to update documents', icon: 'error' });
          }
        },
        error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' }),
      });
  }

  // ── Courses ────────────────────────────────────────────────

  addCourseRow(): void {
    this.courseRows.push({ courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null });
  }

  removeCourseRow(index: number): void {
    this.courseRows.splice(index, 1);
  }

  onCourseFilePicked(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3 MB', icon: 'warning' });
      input.value = '';
      return;
    }

    const safeFile = this.toSafeFile(file, input);
    const reader   = new FileReader();
    reader.onload  = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.courseRows[index] = { ...this.courseRows[index], file: safeFile, fileName: safeFile.name, fileData: base64 };
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(safeFile);
  }

  downloadCourseFile(index: number, evt: Event): void {
    evt.preventDefault();
    const row = this.courseRows[index];
    if (!row.fileData || !row.fileName) {
      Swal.fire('No file available to download');
      return;
    }
    const link    = document.createElement('a');
    link.href     = 'data:application/octet-stream;base64,' + row.fileData;
    link.download = row.fileName;
    link.click();
  }

  saveAllCourseCovered(): void {
    for (let i = 0; i < this.courseRows.length; i++) {
      const r = this.courseRows[i];
      if (!r.courseName || !r.courseCode) {
        Swal.fire({ title: 'Validation', text: `Fill Course Name and Code for row ${i + 1}`, icon: 'warning' });
        return;
      }
      if (!r.fileData) {
        Swal.fire({ title: 'Validation', text: `Upload a document for row ${i + 1}`, icon: 'warning' });
        return;
      }
    }

    const formData = new FormData();
    formData.append('RegistrationNo', this.registrationNo || 'NA');

    const metadata = this.courseRows.map((r, idx) => {
      formData.append(`CourseFileData${idx}`, r.fileData  ?? 'NA');
      formData.append(`CourseFileName${idx}`, r.fileName  ?? 'NA');
      return { courseName: r.courseName, courseCode: r.courseCode, hours: r.hours ?? 0, fileName: r.fileName ?? 'NA' };
    });

    formData.append('CourseCoveredMetadata', JSON.stringify(metadata));

    this.isSavingCourses = true;
    const start = Date.now();

    this.studentService.updateApplicationDetails(formData)
      .pipe(
        finalize(() => {
          this.isSavingCourses = false;
          const remaining = Math.max(800 - (Date.now() - start), 0);
          setTimeout(() => { this.cdr.markForCheck(); }, remaining);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resp: any) => {
          const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
          if (msg === 'Success') {
            Swal.fire({ title: 'Saved', text: 'Course details uploaded successfully', icon: 'success' }).then(() => {
              this.getApplicationDetails(this.registrationNo);
            });
          } else {
            Swal.fire({ title: 'Error', text: 'Failed to save course details', icon: 'error' });
          }
        },
        error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' }),
      });
  }

  // ── Private helpers ────────────────────────────────────────

  private loadStudentImage(regno: string): void {
    if (!regno) return;
    this.ServicesSM.GetStuDetailsWithImage(regno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.item1?.length > 0) {
            this.studentProfile = response.item1[0] as StudentProfile;
            const img = this.studentProfile.imageData;
            this.studentImage = img ? `data:image/jpeg;base64,${img}` : null;
          } else {
            this.studentImage = null;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.studentImage = null;
          this.cdr.markForCheck();
        },
      });
  }

  private detectOtherDocs(): void {
    if (!this.stuApplication) return;
    const known = new Set(['feesProofDocumentPath', 'resumeDocumentPath', 'consentLetterDocumentPath', 'passportDocumentPath']);
    this.otherDocumentKeys = Object.keys(this.stuApplication)
      .filter(k => !known.has(k) && k.toLowerCase().includes('documentpath'));
  }

  /** Builds a minimal empty form so the template never hits undefined .get() calls */
  private initEmptyForm(): void {
    const controls: Record<string, any> = {};
    const allKeys = [
      'applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact',
      'applyingOption', 'universityOption1', 'universityOption2', 'universityOption3',
      'passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto',
      'isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry',
      'englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear',
      'isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail',
      'availableFunds', 'acceptPolicy',
      'relativeName', 'relativeRelation', 'relativeCountry',
    ];
    for (const key of allKeys) {
      controls[key] = key === 'acceptPolicy'
        ? [{ value: false, disabled: ALWAYS_DISABLED_KEYS.has(key) }]
        : ALWAYS_DISABLED_KEYS.has(key)
          ? [{ value: '', disabled: true }]
          : [''];
    }
    this.applicationForm = this.fb.group(controls);
    this.applicationForm.disable();
  }

  /** Rebuilds the form with real API values and validators */
  private buildApplicationForm(): void {
    const app = this.stuApplication!;
    const v   = Validators.required;
    const fv  = (k: keyof ApplicationRecord): any => app[k] ?? '';

    this.applicationForm = this.fb.group({
      applicationId:      [{ value: fv('applicationId'),  disabled: true }],
      registrationNo:     [{ value: fv('registrationNo'), disabled: ALWAYS_DISABLED_KEYS.has('registrationNo') }],
      emailId:            [{ value: fv('emailId'),        disabled: ALWAYS_DISABLED_KEYS.has('emailId') }],
      countryName:        [fv('countryName'),       v],
      whatsAppNo:         [fv('whatsAppNo'),         v],
      phoneNumber:        [fv('phoneNumber'),        v],
      parentContact:      [fv('parentContact'),      v],
      applyingOption:     [fv('applyingOption'),     v],
      universityOption1:  [fv('universityOption1'),  v],
      universityOption2:  [fv('universityOption2'),  v],
      universityOption3:  [fv('universityOption3'),  v],
      passportStatus:     [fv('passportStatus'),     v],
      passportNumber:     [fv('passportNumber')],
      passportIssueDate:  [this.formatDate(fv('passportIssueDate'))],
      passportValidUpto:  [this.formatDate(fv('passportValidUpto'))],
      isVisaRejected:     [fv('isVisaRejected'),     v],
      visaRejectedReason: [fv('visaRejectedReason')],
      visaRejectedCountry:[fv('visaRejectedCountry')],
      englishTestType:    [fv('englishTestType'),    v],
      speakingScore:      [fv('speakingScore')],
      listeningScore:     [fv('listeningScore')],
      readingScore:       [fv('readingScore')],
      writingScore:       [fv('writingScore')],
      overallScore:       [fv('overallScore')],
      englishTestYear:    [fv('englishTestYear')],
      isSelfFunded:       [fv('isSelfFunded'),       v],
      sponsorName:        [fv('sponsorName')],
      sponsorRelation:    [fv('sponsorRelation')],
      sponsorContact:     [fv('sponsorContact')],
      sponsorEmail:       [fv('sponsorEmail')],
      availableFunds:     [fv('availableFunds'),     v],
      acceptPolicy:       [{ value: this.parseAcceptPolicy(app.acceptPolicy), disabled: true }, Validators.requiredTrue],
      relativeName:       [fv('relativeName')],
      relativeRelation:   [fv('relativeRelation')],
      relativeCountry:    [fv('relativeCountry')],
    });

    this.applicationForm.disable();
    this.setupConditionalValidators();
  }

  private populateForm(): void {
    if (!this.stuApplication) return;
    const app = this.stuApplication;
    this.applicationForm.patchValue({
      ...app,
      acceptPolicy:      this.parseAcceptPolicy(app.acceptPolicy),
      passportIssueDate: this.formatDate(app.passportIssueDate),
      passportValidUpto: this.formatDate(app.passportValidUpto),
    });
  }

  /** Attaches valueChanges validators for passport, english scores, and relative details */
  private setupConditionalValidators(): void {
    const toggle = (name: string, required: boolean): void => {
      const ctrl = this.applicationForm.get(name)!;
      required ? ctrl.setValidators([Validators.required]) : ctrl.clearValidators();
      ctrl.updateValueAndValidity();
    };

    this.applicationForm.get('passportStatus')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        for (const k of CONDITIONAL_PASSPORT_KEYS) { toggle(k, val === 'Yes'); }
      });

    this.applicationForm.get('englishTestType')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        const active = val && val.toUpperCase() !== 'APPLIED' && val.toUpperCase() !== 'NA';
        for (const k of CONDITIONAL_SCORE_KEYS) { toggle(k, !!active); }
      });

    const relCtrl = this.applicationForm.get('relativeName')!;
    const applyRelative = (name: string): void => {
      const required = !!name?.trim() && name.toUpperCase() !== 'NA';
      for (const k of CONDITIONAL_RELATIVE_KEYS) { toggle(k, required); }
    };
    applyRelative(relCtrl.value);
    relCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(applyRelative);
  }

  private initCourseRows(): void {
    const covered = this.stuApplication?.courseCovered;
    if (Array.isArray(covered) && covered.length) {
      this.courseRows = covered.map(c => ({
        courseName: c.courseName ?? '',
        courseCode: c.courseCode ?? '',
        hours:      c.hours      ?? null,
        fileName:   c.fileName   ?? null,
        file:       null,
        fileData:   null,
      }));
    } else {
      this.courseRows = Array.from({ length: 3 }, () => ({
        courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null,
      }));
    }
  }

  /** Returns a File with a safe (alphanumeric) filename; patches the input FileList if renamed */
  private toSafeFile(file: File, input: HTMLInputElement): File {
    if (SAFE_FILENAME_REGEX.test(file.name)) return file;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFile = new File([file], safeName, { type: file.type });
    const dt = new DataTransfer();
    dt.items.add(safeFile);
    input.files = dt.files;
    return safeFile;
  }

  private buildEmptyPickedFiles(): Record<string, PickedFileState> {
    const map: Record<string, PickedFileState> = {};
    for (const doc of DOCUMENT_FIELDS) {
      map[doc.key] = { file: null, base64: null, fileName: null };
    }
    return map;
  }

  private parseAcceptPolicy(value: unknown): boolean {
    return value === true || value === 'true' || value === 'True' || value === 'Yes' || value === 'yes';
  }

  private formatDate(dateStr: unknown): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr as string);
    if (isNaN(d.getTime())) return null;
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private toCamelCase(key: string): string {
    return key.charAt(0).toLowerCase() + key.slice(1);
  }
}
