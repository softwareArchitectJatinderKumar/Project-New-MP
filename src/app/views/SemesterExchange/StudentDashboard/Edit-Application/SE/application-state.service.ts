import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { countries } from './countries-list';

import {
  StudentApplication, StageDetailRow, FileSelectedEvent,
  Country, University, STEP_LABELS,
} from './models/application.models';

export type ApplicationStatus = 'Approved' | 'Rejected' | 'Pending';

/**
 * Holds all application state and every webapi call for the Semester
 * Exchange student flow. Provided at the `EditApplicationModule` level so a
 * single instance is shared by the loader (EditApplicationComponent) and
 * whichever status page (Approved/Rejected/Pending) it redirects to —
 * no data is re-fetched on that redirect.
 *
 * All webapi-calling methods here are moved verbatim from the former
 * EditApplicationComponent — same service, same method names, same params.
 */
@Injectable()
export class ApplicationStateService implements OnDestroy {
  // ── State ──────────────────────────────────────────────────────────────────
  isLoading = true;
  isTabSwitching = false;
  isSubmitted = false;
  isLoginFailed = false;
  currentStep = 0;
  isEditingStep: boolean[] = [false, false, false, false, false];

  // ── Route data ─────────────────────────────────────────────────────────────
  LoginName!: string;
  RegistrationNo!: string;
  ApplicationId!: string;

  // ── API data ───────────────────────────────────────────────────────────────
  stuApplication!: StudentApplication;
  uniData: University[] = [];
  StagesDetail: StageDetailRow[] = [];

  // ── Student display ────────────────────────────────────────────────────────
  studentName = ''; courseName = ''; cgpa = '';
  CurrentYear = ''; CurrentTerm = ''; ProgramCode = '';
  SectionCode = ''; studentStatus = '';
  StudentImage: string | null = null;
  studentDetailsWithImage: any;

  // ── Staff display ──────────────────────────────────────────────────────────
  DealingFacultyName = ''; CounsellingAuthorityName = '';
  LockedStatus = false;
  isApprovedApplication = false;
  activeMainTab: 'application' | 'stage1' | 'stage2' = 'stage1';
  ApprovedUniversity: string;

  get canEditApplication(): boolean {
    return !this.LockedStatus && !this.isApprovedApplication;
  }
  get showStage2Tab(): boolean {
    return this.LockedStatus;
  }

  // ── Config ─────────────────────────────────────────────────────────────────
  readonly countries: Country[] = countries;
  readonly stepLabels: string[] = STEP_LABELS;
  readonly localServerUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';

  // ── Form ───────────────────────────────────────────────────────────────────
  form!: FormGroup;

  /** Emits once the application's status is known/changes: 'Approved' | 'Rejected' | 'Pending'. */
  readonly statusResolved$ = new Subject<ApplicationStatus>();

  private lastEmittedStatus: ApplicationStatus | null = null;
  private initializedForLogin: string | null = null;
  private isLoadingData = false;
  /** Snapshot of the form as last loaded/saved from the server — restored on Cancel without a network round-trip. */
  private lastLoadedFormValue: Record<string, any> | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private studentService: SemesterExchangeStuDetailsService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Kicks off the full load for a login/registration pair. Safe to call more than once — skips re-fetching if already loaded for this login. */
  init(loginName: string, registrationNo: string | null): void {
    if (this.initializedForLogin === loginName) return;
    this.initializedForLogin = loginName;
    this.LoginName = loginName;
    this.RegistrationNo = registrationNo ?? (null as any);
    if (this.LoginName) {
      this.getToken(this.LoginName);
      this.getUniversityDetails();
    }
  }

  // ── Step validity (pure, no side-effects) ──────────────────────────────────
  isCurrentStepValid(step: number): boolean {
    if (!this.form) return false;
    const val = (key: string) => this.form.get(key)?.value;
    const has = (key: string) => !!val(key);

    if (step === 1) {
      const base = ['EmailId', 'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 'HasRelativeDetails'];
      if (base.some(k => !has(k))) return false;
      if (val('HasRelativeDetails') === 'Yes') {
        return has('RelativeName') && has('RelativeRelation') && has('RelativeCountryName');
      }
      return true;
    }
    if (step === 2) {
      return ['ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'].every(has);
    }
    if (step === 3) {
      if (!['PassportStatus', 'IsVisaRejected', 'EnglishTestType', 'SponsorType', 'AvailableFunds'].every(has)) return false;
      if (val('PassportStatus') === 'Yes' && (!has('PassportNumber') || !has('PassportIssueDate') || !has('PassportValidUpto'))) return false;
      if (val('IsVisaRejected') === 'Yes' && (!has('VisaRejectedReason') || !has('VisaRejectedCountry'))) return false;
      if (val('EnglishTestType') === 'Appeared' && (!has('TestName') || !/^\d{4}$/.test(String(val('EnglishTestYear') ?? '')))) return false;
      if (val('EnglishTestType') === 'Applied' && !has('TestName')) return false;
      return true;
    }
    return true;
  }

  // ── Edit controls ──────────────────────────────────────────────────────────
  startEdit(step: number): void {

    if (this.LockedStatus || this.LockedStatus == null) {
      return;
    }
    if (step >= 1 && step <= 4 && this.currentStep === step) {
      if (this.LockedStatus && !this.canEditApplication) return;
      this.isEditingStep[step] = true;
      this.form.enable();
    }
  }

  cancelEdit(step: number): void {
    this.isEditingStep[step] = false;
    // Revert any unsaved edits from the last loaded/saved snapshot — no server round-trip needed.
    if (this.lastLoadedFormValue) {
      this.form.patchValue(this.lastLoadedFormValue);
    }
    this.form.disable();
  }

  updateStep(step: number): void {
    this.isSubmitted = true;
    if (!this.isCurrentStepValid(step)) {
      Swal.fire('Validation Required', 'Please fill all required fields before updating.', 'warning');
      return;
    }
    const formData = this.buildUpdateFormData();
    this.isLoading = true;
    this.studentService.updateApplicationDetails(formData)
      .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          if (this.isMsgSuccess(resp)) {
            Swal.fire('Updated', 'Details updated successfully', 'success');
            this.isEditingStep[step] = false;
            this.form.disable();
            if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo, true);
          } else {
            Swal.fire('Error', 'Failed to update', 'error');
          }
        },
        error: () => Swal.fire('Error', 'Server error while updating', 'error'),
      });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  nextStep(): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving on.', 'warning');
      return;
    }
    if (this.currentStep < this.stepLabels.length - 1) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving back.', 'warning');
      return;
    }
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
    this.form.disable();
  }

  goToStep(index: number): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before navigating.', 'warning');
      return;
    }
    if (index <= this.currentStep && index !== this.currentStep) {
      this.currentStep = index;
      this.form?.disable();
      window.scrollTo(0, 0);
    }
  }

  setMainTab(tab: 'application' | 'stage1' | 'stage2'): void {
    if (tab === 'stage2' && !this.showStage2Tab) return;
    if (this.isEditingStep.some((e, i) => e && i >= 1 && i <= 4)) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before switching tabs.', 'warning');
      return;
    }
    this.isTabSwitching = true;
    this.form.disable();
    window.scrollTo(0, 0);
    setTimeout(() => {
      this.activeMainTab = tab;
      this.isTabSwitching = false;
    }, 80);
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  onFileSelected(event: FileSelectedEvent): void {
    const map: Record<string, { fileField: string; nameField: string }> = {
      consent: { fileField: 'ConsentLetterData', nameField: 'ConsentLetterFileName' },
      resume: { fileField: 'ResumeFileData', nameField: 'ResumeFileName' },
      passport: { fileField: 'PassportFileData', nameField: 'PassportFileName' },
      english: { fileField: 'EnglishProofData', nameField: 'EnglishProofFileName' },
      fees: { fileField: 'FeesProofData', nameField: 'FeesProofFileName' },
      affidavitPath: { fileField: 'AffidavitData', nameField: 'AffidavitPath' },
      offerLetter: { fileField: 'OfferLetterPath', nameField: 'OfferLetterPath' },
      outBoundTicket: { fileField: 'OutBoundTicket', nameField: 'OutBoundTicket' },
      returnTicket: { fileField: 'ReturnTicketPath', nameField: 'ReturnTicketPath' },
    };
    const d = map[event.key];
    if (!d) return;

    const fd = new FormData();
    fd.append('RegistrationNo', this.RegistrationNo ?? 'NA');
    if (this.ApplicationId) fd.append('ApplicationId', this.ApplicationId);
    fd.append(d.nameField, event.fileName);
    fd.append(d.fileField, event.base64);

    this.isLoading = true;
    this.studentService.UpdateDocuments(fd)
      .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          if (this.isMsgSuccess(resp)) {
            Swal.fire('Uploaded', `${event.fileName} uploaded successfully`, 'success')
              .then(() => { if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo, true); });
          } else {
            Swal.fire('Error', 'Failed to upload document', 'error');
          }
        },
        error: () => Swal.fire('Error', 'Server error while uploading', 'error'),
      });
  }

  submitDocuments(): void {
    if (!this.RegistrationNo || !this.ApplicationId) return;
    this.isLoading = true;
    const fd = new FormData();
    fd.append('RegistrationNo', this.RegistrationNo);
    fd.append('ApplicationId', this.ApplicationId);
    this.studentService.UpdateDocuments(fd)
      .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          if (this.isMsgSuccess(resp)) {
            Swal.fire({ title: 'Documents Updated', icon: 'success' })
              .then(() => { this.isEditingStep[4] = false; this.getApplicationDetails(this.RegistrationNo, true); });
          } else {
            Swal.fire({ title: 'Error', text: 'Failed to update documents', icon: 'error' });
          }
        },
        error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' }),
      });
  }

  // ── Private: Auth + Data fetching ──────────────────────────────────────────
  private getToken(loginName: string): void {
    this.authService.loginTemp(loginName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.storageService.saveUser(data);
          if (!this.storageService.isLoggedIn()) {
            this.loginFailed('Invalid or expired token'); return;
          }
          this.buildForm();
          this.getStudentDetail();
          this.getStagesDetails();
          this.updateBranding();
        },
        error: err => this.loginFailed(err),
      });
  }

  private updateBranding(): void {
    const el = document.getElementById('stMain');
    if (el) el.innerHTML = 'Semester <span class="text-info">Exchange Student</span> Dashboard';
    const logo = document.getElementById('imgLogo') as HTMLImageElement | null;
    if (logo) logo.style.width = '164px';
  }

  private getStudentDetail(): void {
    this.isLoading = true;
    this.studentService.getStudentById()
      .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const stu = response?.item1?.[0];
          if (!stu) { this.loginFailed('Student data not found'); return; }
          this.studentName = stu.studentName;
          this.RegistrationNo = stu.registerationNumber;
          this.courseName = stu.courseName;
          this.cgpa = stu.cgpa;
          this.CurrentYear = stu.currentYear;
          this.CurrentTerm = stu.currentTerm;

          this.ProgramCode = stu.programCode;
          this.getApplicationDetails(this.RegistrationNo ?? '');
          this.getStuDetailsWithImage(this.RegistrationNo);
        },
        error: err => this.loginFailed(err),
      });
  }

  /**
   * @param silent Skip the full-screen loader — used when refreshing in the background right
   * after a save/upload already showed its own loading state, to avoid a jarring double-flash.
   */
  private getApplicationDetails(regNo: string, silent = false): void {
    if (!silent) this.isLoading = true;
    this.studentService.getStudentDetailsBYId(regNo)
      .pipe(finalize(() => { if (!silent) this.isLoading = false; }), takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const app: StudentApplication = response?.item1?.[0];
          if (!app) { this.loginFailed('Not Valid Application'); return; }

          const lockState = this.resolveLockState(this.readAppFlag(app, 'isLocked', 'IsLocked'));
          // Stay on Student Dashboard — show locked tabs instead of redirecting to ApplicationDetails
          this.LockedStatus = lockState === 'locked';
          this.isApprovedApplication = app.isLocked === 'True' && app.isApproved === 'True' ? true : false;
          this.activeMainTab = 'stage1';

          this.stuApplication = app;
          this.studentStatus = app.isLocked === 'True' ? 'Approved' : app.isLocked === 'False' ? 'Rejected' : 'Pending';

          this.ApplicationId = app.applicationId;
          this.SectionCode = app.sectionCode;
          this.DealingFacultyName = app.dealingFacultyName;
          this.CounsellingAuthorityName = app.counsellingAuthorityName;
          this.ApprovedUniversity = app.approvedUniversity;
          this.isLoadingData = true;
          this.form.patchValue({
            EmailId: app.emailId ?? '',
            CountryName: app.countryName ?? '',
            WhatsAppNo: app.whatsAppNo ?? '',
            PhoneNumber: app.phoneNumber ?? '',
            ParentContact: app.parentContact ?? '',
            HasRelativeDetails: app.relativeName === 'NA' ? 'No' : 'Yes',
            RelativeName: app.relativeName ?? '',
            RelativeCountryName: app.relativeCountry ?? '',
            RelativeRelation: app.relativeRelation ?? '',
            RelativeEmail: app.relativeEmail ?? '',
            RelativePhone: app.relativePhone ?? '',
            ApplyingOption: app.applyingOption ?? '',
            UniversityOption1: app.universityOption1 ?? '',
            UniversityOption2: app.universityOption2 ?? '',
            UniversityOption3: app.universityOption3 ?? '',
            PassportStatus: app.passportStatus || 'No',
            PassportNumber: app.passportNumber ?? '',
            PassportIssueDate: this.formatDate(app.passportIssueDate),
            PassportValidUpto: this.formatDate(app.passportValidUpto),
            IsVisaRejected: app.isVisaRejected === 'Yes' ? 'Yes' : 'No',
            VisaRejectedReason: app.visaRejectedReason ?? '',
            VisaRejectedCountry: app.visaRejectedCountry ?? '',
            EnglishTestType: app.englishTestType || 'Applied',
            TestName: app.englishTestName ?? '',
            EnglishTestYear: app.englishTestYear ?? '',
            ListeningScore: app.listeningScore ?? '',
            SpeakingScore: app.speakingScore ?? '',
            ReadingScore: app.readingScore ?? '',
            WritingScore: app.writingScore ?? '',
            OverallScore: app.overallScore ?? '',
            SponsorType: app.sponsorRelation === 'Parent' || app.sponsorRelation === 'Parents' ? 'Parents' : 'Other',
            AvailableFunds: app.availableFunds ?? '',
            SponsorName: app.sponsorName ?? '',
            SponsorRelation: app.sponsorRelation ?? '',
            SponsorEmail: app.sponsorEmail ?? '',
            SponsorContact: app.sponsorContact ?? '',
            AcceptPolicy: ['true', true, 'Yes', 'yes'].includes(app.acceptPolicy as any),
          });
          this.lastLoadedFormValue = this.form.getRawValue();
          this.isLoadingData = false;

          const mayEdit = !this.LockedStatus || this.canEditApplication;
          const anyFormEditing = [1, 2, 3, 4].some(i => this.isEditingStep[i]);
          const editing = anyFormEditing && mayEdit;
          editing ? this.form.enable() : this.form.disable();

          // Notify listeners of the resolved tri-state status (Approved / Rejected / Pending)
          // so the loader (or any status page) can redirect to the matching component.
          const status = this.studentStatus as ApplicationStatus;
          if (status !== this.lastEmittedStatus) {
            this.lastEmittedStatus = status;
            this.statusResolved$.next(status);
          }
        },
        error: err => {
          console.error(err);
          Swal.fire('Error', 'Failed to load application data', 'error');
        },
      });
  }

  private getUniversityDetails(): void {
    this.studentService.getUniversityLists('')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (r: any) => this.uniData = r?.item1 ?? [] });
  }

  private getStagesDetails(): void {
    this.studentService.GetAllCheckListDocs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (r: any) => this.StagesDetail = r?.item1 ?? [] });
  }

  private getStuDetailsWithImage(regno: string): void {
    if (!regno) return;
    this.studentService.GetStuDetailsWithImage(regno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r: any) => {
          const data = r?.item1?.[0];
          this.studentDetailsWithImage = data;
          this.StudentImage = data?.imageData ? `data:image/jpeg;base64,${data.imageData}` : null;
        },
        error: () => this.StudentImage = null,
      });
  }

  // ── Private: Form ──────────────────────────────────────────────────────────
  private buildForm(): void {
    this.form = this.fb.group({
      EmailId: ['', Validators.required],
      CountryName: ['', Validators.required],
      WhatsAppNo: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      ParentContact: ['', Validators.required],
      HasRelativeDetails: ['', Validators.required],
      RelativeName: [''], RelativeCountryName: [''], RelativeRelation: [''],
      RelativeEmail: [''], RelativePhone: [''],
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],
      PassportStatus: ['', Validators.required],
      PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''],
      IsVisaRejected: ['', Validators.required],
      VisaRejectedReason: [''], VisaRejectedCountry: [''],
      EnglishTestType: ['', Validators.required],
      TestName: [''], EnglishTestYear: [''],
      ListeningScore: [''], SpeakingScore: [''],
      ReadingScore: [''], WritingScore: [''], OverallScore: [''],
      SponsorType: ['', Validators.required],
      SponsorName: [''], SponsorRelation: [''],
      SponsorContact: [''], SponsorEmail: [''],
      AvailableFunds: ['', Validators.required],
      AcceptPolicy: [false, Validators.requiredTrue],
    });
    this.form.disable();

    this.form.get('SponsorType')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        if (this.isLoadingData) return;
        const isParent = ['parent', 'parents'].includes((value ?? '').trim().toLowerCase());
        if (isParent) {
          this.form.patchValue({ SponsorName: '', SponsorRelation: '', SponsorEmail: '', SponsorContact: '' }, { emitEvent: false });
          ['SponsorName', 'SponsorRelation'].forEach(k => {
            this.form.get(k)!.clearValidators();
            this.form.get(k)!.updateValueAndValidity({ emitEvent: false });
          });
        } else {
          this.form.get('SponsorName')!.setValidators([Validators.required]);
          this.form.get('SponsorRelation')!.setValidators([Validators.required]);
          ['SponsorName', 'SponsorRelation'].forEach(k =>
            this.form.get(k)!.updateValueAndValidity({ emitEvent: false }));
        }
      });
  }

  private buildUpdateFormData(): FormData {
    const fd = new FormData();
    const raw = this.form.getRawValue();
    fd.append('RegistrationNo', this.RegistrationNo ?? 'NA');
    if (this.ApplicationId) fd.append('ApplicationId', this.ApplicationId);

    const fields = [
      'EmailId', 'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact',
      'ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3',
      'PassportStatus', 'PassportNumber', 'PassportIssueDate', 'PassportValidUpto',
      'IsVisaRejected', 'VisaRejectedReason', 'VisaRejectedCountry',
      'EnglishTestType', 'SpeakingScore', 'ListeningScore', 'ReadingScore', 'WritingScore', 'OverallScore',
      'SponsorType', 'AvailableFunds', 'SponsorName', 'SponsorRelation', 'SponsorEmail', 'SponsorContact',
      'RelativeName', 'RelativeRelation', 'RelativeEmail', 'RelativePhone',
    ];
    fields.forEach(k => fd.append(k, String(raw[k] ?? '')));
    fd.append('RelativeCountry', String(raw['RelativeCountryName'] ?? ''));
    fd.append('EnglishTestYear', String(raw['EnglishTestYear'] ?? ''));
    fd.append('EnglishTestName', String(raw['TestName'] ?? ''));

    const sponsor = raw['SponsorType'] ?? '';
    fd.append('IsSelfFunded', ['Parents', 'Parent'].includes(sponsor) ? 'True' : 'False');
    return fd;
  }

  // ── Private: Helpers ───────────────────────────────────────────────────────
  private loginFailed(err: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid!', icon: 'warning' });
    const el = document.getElementById('StudentDashboard');
    if (el) el.hidden = true;
    this.router.navigate(['stuPotal', this.LoginName]);
  }

  private isMsgSuccess(resp: any): boolean {
    return resp?.[0]?.msg === 'Success' || resp?.item1?.[0]?.msg === 'Success';
  }

  private formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private readAppFlag(app: StudentApplication, ...keys: string[]): unknown {
    for (const key of keys) {
      const val = (app as any)?.[key];
      if (val !== null && val !== undefined && String(val).trim() !== '') return val;
    }
    return null;
  }

  /** empty/null → unlocked wizard; true/1 → locked tabs; false/0 → unlocked wizard */
  private resolveLockState(isLocked: unknown): 'null' | 'locked' | 'unlocked' {
    if (isLocked === null || isLocked === undefined) return 'null';
    const raw = String(isLocked).trim();
    if (!raw) return 'null';
    const lower = raw.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return 'locked';
    if (lower === 'false' || lower === '0' || lower === 'no') return 'unlocked';
    return 'null';
  }
}
