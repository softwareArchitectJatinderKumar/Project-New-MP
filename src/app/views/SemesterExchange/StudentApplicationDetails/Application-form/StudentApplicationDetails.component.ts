import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService }                       from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService }                    from 'src/app/_services/storage.service';

import {
  ApplicationData,
  AppRouteParams,
  DocumentUpload,
  FormSection,
  GradeRecord,
  StudentWithImage,
  UniversityOption,
} from './models/application-details.models';

import {
  DOCUMENT_SERVER_URL,
  DOCUMENT_UPLOADS,
  FORM_SECTIONS,
  HOD_ROLES,
  INITIAL_FORM_CONTROLS,
  LABEL_OVERRIDES,
  NO_SCORE_TEST_TYPES,
  OTHER_SPONSOR_TYPES,
  PARENT_SPONSOR_TYPES,
  SCORE_FIELDS,
  SECTION_ICONS,
  SELF_FUNDED_VALUES,
} from './constants/application-details.constants';

// ─────────────────────────────────────────────────────────────
@Component({
  selector:        'app-StudentApplicationDetails',
  templateUrl:     './StudentApplicationDetails.component.html',
  styleUrls:       ['./StudentApplicationDetails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentApplicationDetailsComponent implements OnInit, OnDestroy {

  // ── Static config exposed to template (readonly refs to module constants) ──
  readonly documentUploads: ReadonlyArray<DocumentUpload> = DOCUMENT_UPLOADS;
  readonly sectionIcons:    Readonly<Record<string, string>> = SECTION_ICONS;

  // ── Public view state ──────────────────────────────────────
  isLoading      = false;
  isImageLoading = false;
  hasLoginFailed = false;

  studentForm!: FormGroup;
  studentInfo:  StudentWithImage | null = null;
  application:  ApplicationData  | null = null;
  universityOptions: UniversityOption[] = [];

  // Derived display data — computed once after API data arrives
  filteredSections: FormSection[]          = [];
  displayValues:    Record<string, string> = {};

  // Academic info from the grade/marks API
  programCode = '';
  sectionCode = '';
  schoolId    = '';
  gradeFCount = 0;

  studentImage = '';
  serverUrl    = '';
  folderUrl    = '';

  // ── Route params ───────────────────────────────────────────
  private params!: AppRouteParams;

  // ── Subscription management ────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ──────────────────────────────────────────────────────────
  constructor(
    private readonly fb:             FormBuilder,
    private readonly authService:    AuthService,
    private readonly storageService: StorageService,
    private readonly studentService: SemesterExchangeStuDetailsService,
    private readonly ServicesSM:     SemesterExchangeStuDetailsService,
    private readonly route:          ActivatedRoute,
    private readonly router:         Router,
    private readonly title:          Title,
    private readonly cdr:            ChangeDetectorRef,
  ) {
    this.studentForm = this.fb.group(INITIAL_FORM_CONTROLS);
    this.studentForm.disable();
  }

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    const snap = this.route.snapshot.params;
    this.params = {
      LoginName:      snap['LoginName']      ?? '',
      RegistrationNo: snap['RegistrationNo'] ?? '',
      Role:           snap['Role']           ?? '',
    };

    this.folderUrl = this.ServicesSM.getFolderUrl();
    this.serverUrl = DOCUMENT_SERVER_URL;

    if (this.params.LoginName) {
      this.getToken(this.params.LoginName);
    }

    // Legacy DOM mutations required by the host page shell
    // const titleEl = document.getElementById('stMain') as HTMLElement | null;
    // const logoEl  = document.getElementById('imgLogo') as HTMLImageElement | null;
    // if (titleEl) titleEl.innerHTML = '<span class="themeClr">Application Details</span>';
    // if (logoEl)  logoEl.style.width = '164px';



     const el = document.getElementById('stMain');
    const navel = document.getElementById('navHeader');
    if (el) el.innerHTML = 'Semester <span class="text-info">Exchange Student</span> Dashboard';
    if (navel) navel.style.display = 'none';
    const logo = document.getElementById('imgLogo') as HTMLImageElement | null;
    if (logo) logo.style.width = '164px';

    (<HTMLInputElement>document.getElementById('navHeader')).style.display = 'none ';
    (<HTMLInputElement>document.getElementById('stMain')).style.display = 'none ';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.display = 'none';


  }

  ngOnDestroy(): void {
    // Cancels all in-flight HTTP requests tied to this component
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Navigation ─────────────────────────────────────────────
  DashboardVisit(): void {
    const route = this.buildDashboardRoute();
    if (route) { this.router.navigateByUrl(route); }
  }

  Visit(): void {
    this.router.navigateByUrl('FacultyDashboard');
  }

  // ── Computed getters ───────────────────────────────────────
  get isReadyForPrint(): boolean {
    return !this.isLoading && !this.isImageLoading;
  }

  // ── Template helpers ───────────────────────────────────────

  /** O(1) lookup into the pre-computed display-value map */
  displayValue(key: string): string {
    return this.displayValues[key] ?? '—';
  }

  /** Converts a camelCase key to a human-readable label (mirrors BeautifyLabelPipe) */
  labelFor(key: string): string {
    return LABEL_OVERRIDES[key] ??
      key.replace(/([A-Z])/g, ' $1')
         .replace(/_/g, ' ')
         .replace(/\b\w/g, c => c.toUpperCase())
         .replace('Id', 'ID').replace('No', 'No.').replace('Upto', 'Up To').replace('Whatsapp', 'WhatsApp')
         .trim();
  }

  trackBySection(_: number, section: FormSection): string  { return section.label; }
  trackByKey    (_: number, key: string): string           { return key; }
  trackByDocKey (_: number, doc: DocumentUpload): string   { return doc.key; }

  // ── Actions ────────────────────────────────────────────────
  printDetails(): void { window.print(); }

  // ── API calls (logic + signatures preserved exactly) ──────

  getToken(loginName: string): void {
    this.isLoading = true;

    this.authService.loginTemp(loginName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.storageService.saveUser(data);
          const authToken = this.storageService.getUser();

          if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
            this.hasLoginFailed = true;
            this.handleLoginFailure('Invalid or expired token');
            return;
          }

          this.loadCoreApplicationData();
        },
        error: err => {
          this.handleLoginFailure(err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  getStuDetailsWithImage(Regno: string): void {
    this.isImageLoading = true;

    this.ServicesSM.GetStuDetailsWithImage(Regno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {
            this.studentInfo  = response.item1[0] as StudentWithImage;
            this.studentImage = `data:image/jpeg;base64,${this.studentInfo.imageData}`;
          }
          this.isImageLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isImageLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  FindGradeFCount(regdNo: string): void {
    this.studentService.getStudentDetailsWithMarks(regdNo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {
            const marks = response.item1 as GradeRecord[];
            this.programCode = marks[0].officialCode ?? '';
            this.sectionCode = marks[0].section      ?? '';
            this.schoolId    = marks[0].schoolId     ?? '';
            this.gradeFCount = this.countFailingGrades(marks);
            this.cdr.markForCheck();
          }
        },
        error: err => this.handleLoginFailure(err),
      });
  }

  LoginFailed(error: unknown): void {
    this.handleLoginFailure(error);
  }

  // ── Private — data loading ─────────────────────────────────

  /**
   * Parallel-fetches universities and the student's application,
   * then populates the form and kicks off secondary data loads.
   */
  private loadCoreApplicationData(): void {
    forkJoin([
      this.ServicesSM.getUniversityDetails(),
      this.studentService.getStudentDetailsBYId(this.params.RegistrationNo),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([uniResponse, appResponse]) => {
          this.universityOptions = uniResponse.item1.map((u: any): UniversityOption => ({
            universityId:   u.universityId,
            universityName: u.universityName,
          }));

          if (appResponse.item1.length > 0) {
            this.application = appResponse.item1[0] as ApplicationData;
            this.hydrateForm(this.application);
            // Both derived structures depend on form values — compute once here
            this.filteredSections = this.buildFilteredSections();
            this.displayValues    = this.buildDisplayValues();
          } else {
            this.handleLoginFailure('No application data found.');
          }

          this.isLoading = false;
          // Secondary requests run independently after the form is ready
          this.getStuDetailsWithImage(this.params.RegistrationNo);
          this.FindGradeFCount(this.params.RegistrationNo);
          this.cdr.markForCheck();
        },
        error: () => {
          this.handleLoginFailure('Error fetching core application data.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  /** Patches the disabled form with API data, normalising dates and booleans */
  private hydrateForm(app: ApplicationData): void {
    this.studentForm.patchValue({
      ...app,
      University1:       app['UniversityOption1'],
      University2:       app['UniversityOption2'],
      University3:       app['UniversityOption3'],
      acceptPolicy:      app['acceptPolicy'] === 'Yes'
                      || app['acceptPolicy'] === true
                      || app['acceptPolicy'] === 'yes',
      passportIssueDate: this.parseDate(app['passportIssueDate'] as string | null),
      passportValidUpto: this.parseDate(app['passportValidUpto'] as string | null),
    });
  }

  // ── Private — display-value pre-computation ────────────────

  /**
   * Builds a flat key → display-string map so the template never
   * calls studentForm.get() directly; all reads are O(1) hash lookups.
   */
  private buildDisplayValues(): Record<string, string> {
    const map: Record<string, string> = {
      relativeNotApplicable: 'No relative abroad on record.',
      acceptPolicy: this.studentForm.get('acceptPolicy')?.value
        ? 'Accepted'
        : 'Not Accepted',
    };

    const allKeys = new Set(FORM_SECTIONS.flatMap(s => [...s.keys]));
    for (const key of allKeys) {
      if (!(key in map)) {
        map[key] = String(this.studentForm.get(key)?.value || '—');
      }
    }
    return map;
  }

  // ── Private — section filtering ────────────────────────────

  /**
   * Delegates each section to a dedicated filter method.
   * Adding a new filtering rule = add/edit one focused method.
   */
  private buildFilteredSections(): FormSection[] {
    return FORM_SECTIONS.map(s => this.applyFilterForSection(s));
  }

  private applyFilterForSection(section: FormSection): FormSection {
    switch (section.label) {
      case 'Sponsor Details':      return this.filterSponsorSection(section);
      case 'Visa Details':         return this.filterVisaSection(section);
      case 'English Test Details': return this.filterEnglishSection(section);
      case 'Relative at Abroad':   return this.filterRelativeSection(section);
      case 'Passport Details':     return this.filterPassportSection(section);
      default:                     return { ...section };
    }
  }

  private filterSponsorSection(section: FormSection): FormSection {
    const isSelfFunded   = this.fv('isSelfFunded');
    const sponsorName    = this.fv('sponsorName').toLowerCase();
    const sponsorContact = this.fv('sponsorContact');
    const sponsorEmail   = this.fv('sponsorEmail');

    // Self-funded or parent-funded: show the sponsor type label only
    if (SELF_FUNDED_VALUES.has(isSelfFunded) || PARENT_SPONSOR_TYPES.has(sponsorName)) {
      return { ...section, keys: ['sponsorName'] };
    }

    // External sponsor: show name + relation, and optionally contact/email if present
    if (OTHER_SPONSOR_TYPES.has(sponsorName)) {
      const keys = ['sponsorName', 'sponsorRelation'];
      if (sponsorContact.trim()) keys.push('sponsorContact');
      if (sponsorEmail.trim())   keys.push('sponsorEmail');
      return { ...section, keys };
    }

    return { ...section };
  }

  private filterVisaSection(section: FormSection): FormSection {
    return this.fv('isVisaRejected') === 'No'
      ? { ...section, keys: ['isVisaRejected'] }
      : { ...section };
  }

  private filterEnglishSection(section: FormSection): FormSection {
    return NO_SCORE_TEST_TYPES.has(this.fv('englishTestType'))
      ? { ...section, keys: section.keys.filter(k => !SCORE_FIELDS.has(k)) }
      : { ...section };
  }

  private filterRelativeSection(section: FormSection): FormSection {
    const isEmpty = (v: string) => !v || v === 'NA';
    const noRelative =
      isEmpty(this.fv('relativeName'))    &&
      isEmpty(this.fv('relativeRelation')) &&
      isEmpty(this.fv('relativeCountry'));
    return noRelative
      ? { ...section, keys: ['relativeNotApplicable'] }
      : { ...section };
  }

  private filterPassportSection(section: FormSection): FormSection {
    return { ...section, keys: section.keys.filter(k => k !== 'passportStatus') };
  }

  // ── Private — utilities ────────────────────────────────────

  /** Short alias: read a form value as a trimmed string */
  private fv(key: string): string {
    return String(this.studentForm?.get(key)?.value ?? '').trim();
  }

  /** Counts grades of F or numeric grade ≤ 6 */
  private countFailingGrades(marks: GradeRecord[]): number {
    return marks.reduce((count, item) => {
      const gradeStr = item.grade?.toUpperCase();
      const gradeNum = parseInt(item.gradeNum ?? '', 10);
      return (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6))
        ? count + 1
        : count;
    }, 0);
  }

  /** Returns ISO yyyy-MM-dd or null for invalid/missing dates */
  private parseDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }

  /** Returns the correct dashboard URL for the current role, or null */
  private buildDashboardRoute(): string | null {
    if (this.params.Role === 'Student') {
      return `StudentDashboard/${this.params.LoginName}/${this.params.RegistrationNo}`;
    }
    if (HOD_ROLES.has(this.params.Role)) {
      return `DashboardHOD/${this.params.LoginName}`;
    }
    return null;
  }

  private handleLoginFailure(error: unknown): void {
    this.hasLoginFailed = true;
    this.isLoading      = false;
    Swal.fire({
      title: 'Login Failed',
      text:  'Login details are invalid or session expired!',
      icon:  'warning',
    });
    const el = document.getElementById('StudentDashboard');
    if (el) { el.hidden = true; }
  }
}
