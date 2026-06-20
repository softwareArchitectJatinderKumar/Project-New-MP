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

import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';

import {
  ApplicationData,
  DocumentUpload,
  FormSection,
  GradeRecord,
  StudentProfile,
  UniversityOption,
} from './models/application-details.models';

import {
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
  SERVER_URL,
} from './constants/application-details.constants';

// ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-StudentApplicationDetails',
  templateUrl: './StudentApplicationDetails.component.html',
  styleUrls: ['./StudentApplicationDetails.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentApplicationDetailsComponent implements OnInit, OnDestroy {

  // ── Static config exposed to template ─────────────────────
  readonly documentUploads: ReadonlyArray<DocumentUpload> = DOCUMENT_UPLOADS;
  readonly sectionIcons: Readonly<Record<string, string>> = SECTION_ICONS;

  // ── Public view state ──────────────────────────────────────
  isLoading = false;
  isImageLoading = false;
  isLoginFailed = false;

  studentForm!: FormGroup;
  studentProfile: StudentProfile | null = null;
  application: ApplicationData | null = null;
  universityOptions: UniversityOption[] = [];

  // Derived display data — computed once after API data arrives
  filteredSections: FormSection[] = [];
  displayValues: Record<string, string> = {};

  // Academic / grade info
  programCode = '';
  sectionCode = '';
  schoolId = '';
  gradeFCount = 0;

  studentImage = '';
  folderUrl = '';
  readonly serverUrl = SERVER_URL;

  // ── Route params ───────────────────────────────────────────
  private loginName = '';
  private registrationNo = '';
  private role = '';

  // ── Subscription cleanup ───────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ──────────────────────────────────────────────────────────
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly studentService: SemesterExchangeStuDetailsService,
    private readonly ServicesSM: SemesterExchangeStuDetailsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.studentForm = this.fb.group(INITIAL_FORM_CONTROLS);
    this.studentForm.disable();
  }

  // ── Lifecycle ──────────────────────────────────────────────

  ngOnInit(): void {
    const snap = this.route.snapshot.params;
    this.loginName = snap['LoginName'] ?? '';
    this.registrationNo = snap['RegistrationNo'] ?? '';
    this.role = snap['Role'] ?? '';

    this.folderUrl = this.ServicesSM.getFolderUrl();

    if (this.loginName) {
      this.getToken(this.loginName);
    }

    // Legacy host-shell DOM mutations
    const titleEl = document.getElementById('stMain') as HTMLElement | null;
    const logoEl = document.getElementById('imgLogo') as HTMLImageElement | null;
    if (titleEl) titleEl.innerHTML = '<span class="themeClr">Application Details</span>';
    if (logoEl) logoEl.style.width = '164px';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Computed getters ───────────────────────────────────────

  get isReadyForPrint(): boolean {
    return !this.isLoading && !this.isImageLoading;
  }

  // ── Navigation ─────────────────────────────────────────────

  DashboardVisit(): void {
    const url = this.buildDashboardRoute();
    if (url) { this.router.navigateByUrl(url); }
  }

  // ── Template helpers ───────────────────────────────────────

  /** O(1) lookup into the pre-computed display-value map */
  displayValue(key: string): string {
    return this.displayValues[key] ?? 'N/A';
  }

  /** Converts a camelCase key to a human-readable label */
  labelFor(key: string): string {
    return LABEL_OVERRIDES[key] ??
      key.replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace('Id', 'ID').replace('No', 'No.').replace('Upto', 'Up To').replace('Whatsapp', 'WhatsApp')
        .trim();
  }

  printDetails(): void { window.print(); }

  trackBySection(_: number, section: FormSection): string { return section.label; }
  trackByKey(_: number, key: string): string { return key; }
  trackByDocKey(_: number, doc: DocumentUpload): string { return doc.key; }

  // ── API calls (signatures and logic preserved exactly) ────

  getToken(loginName: string): void {
    this.isLoading = true;

    this.authService.loginTemp(loginName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.storageService.saveUser(data);
          const authToken = this.storageService.getUser();

          if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
            this.isLoginFailed = true;
            this.loginFailed('Invalid or expired token');
            return;
          }

          this.loadCoreData();
        },
        error: err => {
          this.loginFailed(err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  getStuDetailsWithImage(regno: string): void {
    this.isImageLoading = true;

    this.ServicesSM.GetStuDetailsWithImage(regno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {
            this.studentProfile = response.item1[0] as StudentProfile;
            this.studentImage = `data:image/jpeg;base64,${this.studentProfile.imageData}`;
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
            this.sectionCode = marks[0].section ?? '';
            this.schoolId = marks[0].schoolId ?? '';
            this.gradeFCount = this.countFailingGrades(marks);
            this.cdr.markForCheck();
          }
        },
        error: err => this.loginFailed(err),
      });
  }

  LoginFailed(error: unknown): void {
    this.loginFailed(error);
  }

  // ── Private — data loading ─────────────────────────────────

  /**
   * Parallel-fetches universities + application data via forkJoin,
   * then hydrates the form and kicks off secondary loads.
   */
  private loadCoreData(): void {
    forkJoin([
      this.ServicesSM.getUniversityDetails(),
      this.studentService.getStudentDetailsBYId(this.registrationNo),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([uniResponse, appResponse]) => {
          this.universityOptions = uniResponse.item1.map((u: any): UniversityOption => ({
            universityId: u.universityId,
            universityName: u.universityName,
          }));

          if (appResponse.item1.length > 0) {
            this.application = appResponse.item1[0] as ApplicationData;
            this.hydrateForm(this.application);
            // Both derived structures depend on form values — build once here
            this.filteredSections = this.buildFilteredSections();
            this.displayValues = this.buildDisplayValues();
          } else {
            this.loginFailed('No application data found.');
          }

          this.isLoading = false;
          this.getStuDetailsWithImage(this.registrationNo);
          this.FindGradeFCount(this.registrationNo);
          this.cdr.markForCheck();
        },
        error: () => {
          this.loginFailed('Error fetching core application data.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  /** Patches the disabled form with API data */
  private hydrateForm(app: ApplicationData): void {
    this.studentForm.patchValue({
      ...app,
      University1: app['UniversityOption1'],
      University2: app['UniversityOption2'],
      University3: app['UniversityOption3'],
      acceptPolicy: app['acceptPolicy'] === 'Yes'
        || app['acceptPolicy'] === true
        || app['acceptPolicy'] === 'yes',
      passportIssueDate: this.parseDate(app['passportIssueDate'] as string | null),
      passportValidUpto: this.parseDate(app['passportValidUpto'] as string | null),
    });
  }

  // ── Private — display-value pre-computation ────────────────

  /**
   * Builds key → display-string map after form is patched.
   * Template reads are O(1) property lookups — no .get() calls at render time.
   */
  // private buildDisplayValues(): Record<string, string> {
  //   const map: Record<string, string> = {
  //     relativeNotApplicable: 'No relative abroad on record.',
  //     acceptPolicy: this.studentForm.get('acceptPolicy')?.value ? 'Accepted' : 'Not Accepted',
  //   };

  //   const allKeys = new Set(FORM_SECTIONS.flatMap(s => [...s.keys]));
  //   for (const key of allKeys) {
  //     if (!(key in map)) {
  //       map[key] = String(this.studentForm.get(key)?.value || 'N/A');
  //     }
  //   }
  //   return map;
  // }

  //   private buildDisplayValues(): Record<string, string> {
  //   const map: Record<string, string> = {
  //     relativeNotApplicable: 'No relative abroad on record.',
  //     acceptPolicy: this.studentForm.get('acceptPolicy')?.value ? 'Accepted' : 'Not Accepted',
  //     passportStatus: 'Not Available',
  //   };

  //   const allKeys = new Set(FORM_SECTIONS.flatMap(s => [...s.keys]));
  //   for (const key of allKeys) {
  //     if (key === 'isSelfFunded') {
  //       const val = this.fv('isSelfFunded').toLowerCase();
  //       // Logic: If it matches Parent list, display as 'Parents', else 'Others'
  //       map[key] = PARENT_SPONSOR_TYPES.has(val) ? 'Parents' : 'Others';
  //     } else if (!(key in map)) {
  //       map[key] = String(this.studentForm.get(key)?.value || 'N/A');
  //     }
  //   }
  //   return map;
  // }
  // Add this helper to your component for cleaner template checks



  isPassportMissing(): boolean {
    const pNo = this.studentForm.get('passportNo')?.value;
    const pIssue = this.studentForm.get('passportIssueDate')?.value;
    const pValid = this.studentForm.get('passportValidUpto')?.value;

    const isInvalid = (val: any) => !val ||
      ['na', 'n/a', 'none', ''].includes(String(val).toLowerCase().trim());

    return isInvalid(pNo) || isInvalid(pIssue) || isInvalid(pValid);
  }

  private buildDisplayValues(): Record<string, string> {
    const map: Record<string, string> = {
      relativeNotApplicable: 'No relative abroad on record.',
      acceptPolicy: this.studentForm.get('acceptPolicy')?.value ? 'Accepted' : 'Not Accepted',
    };

    const allKeys = new Set(FORM_SECTIONS.flatMap(s => [...s.keys]));

    const rawType = this.fv('isSelfFunded').toLowerCase();

  // If Parent, we don't display specific sponsor details even if they exist in the form
  const showDetail = OTHER_SPONSOR_TYPES.has(rawType);


    for (const key of allKeys) {
      if (key in map) continue;

      const rawVal = this.fv(key);

      // 1. Passport Logic: Check if all primary fields are missing/NA
      if (key === 'passportNo' || key === 'passportIssueDate' || key === 'passportValidUpto') {
        const pNo = this.fv('passportNo');
        const pIssue = this.fv('passportIssueDate');
        const pValid = this.fv('passportValidUpto');

        const isMissing = (v: string) => !v || ['na', 'n/a', ''].includes(v.toLowerCase());

        // If any of the main passport fields are missing, set a specific display string
        if (isMissing(pNo) || isMissing(pIssue) || isMissing(pValid)) {
          map[key] = 'Not Available';
        } else {
          map[key] = rawVal;
        }
      }
      // 2. Sponsor Logic
      else if (key === 'isSelfFunded') {
        map[key] = PARENT_SPONSOR_TYPES.has(rawVal.toLowerCase()) ? 'Parents' : 'Others';
      }
      // 3. Default
      else {
        map[key] = rawVal && rawVal !== 'NA' ? rawVal : 'N/A';
      }

      if (['sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'].includes(key)) {
      map[key] = showDetail ? (this.fv(key) || 'N/A') : '';
    } else {
      map[key] = String(this.studentForm.get(key)?.value || 'N/A');
    }
    }

    return map;
  }
  // ── Private — section filtering ────────────────────────────

  /**
   * Builds the filtered section list once after patchValue().
   * Each section delegates to a focused private method — one method per rule.
   */
  private buildFilteredSections(): FormSection[] {
    return FORM_SECTIONS.map(s => this.applyFilter(s));
  }

  private applyFilter(section: FormSection): FormSection {
    switch (section.label) {
      case 'Sponsor Details': return this.filterSponsorSection(section);
      case 'Visa Details': return this.filterVisaSection(section);
      case 'English Test Details': return this.filterEnglishSection(section);
      case 'Relative at Abroad': return this.filterRelativeSection(section);
      case 'Passport Details': return this.filterPassportSection(section);
      default: return { ...section };
    }
  }
  private filterSponsorSection(section: FormSection): FormSection {
  const rawType = this.fv('isSelfFunded').toLowerCase();
  
  // 1. Base keys: Always show the sponsor type selector
  let keys: string[] = ['isSelfFunded'];

  // 2. Case: Parents (Hide all extra details)
  if (PARENT_SPONSOR_TYPES.has(rawType)) {
    return { ...section, keys };
  }

  // 3. Case: Others (Show name, relation, and optionally contact/email)
  if (OTHER_SPONSOR_TYPES.has(rawType)) {
    const dynamicKeys: string[] = ['sponsorName', 'sponsorRelation'];
    
    // Check if these fields contain actual data
    if (this.fv('sponsorContact')) dynamicKeys.push('sponsorContact');
    if (this.fv('sponsorEmail'))   dynamicKeys.push('sponsorEmail');
    
    return { ...section, keys: [...keys, ...dynamicKeys] };
  }

  // Fallback: Return standard if nothing else matches
  return { ...section, keys };
}
  // private filterSponsorSection(section: FormSection): FormSection {
  //   const rawType = this.fv('isSelfFunded');
  //   const sponsorType = rawType.toLowerCase();

  //   // 1. Base initialization: Always include 'isSelfFunded'
  //   let keys: string[] = ['isSelfFunded'];

  //   // 2. Self-funded: Only this field is required
  //   if (SELF_FUNDED_VALUES.has(rawType)) {
  //     return { ...section, keys };
  //   }

  //   // 3. Parent / Parents Logic: 
  //   // If true, we only show 'isSelfFunded'. We can optionally map the display.
  //   if (PARENT_SPONSOR_TYPES.has(sponsorType)) {
  //     // If you need to force the display value to 'Parents' elsewhere, 
  //     // you would do that in your displayValues logic.
  //     return { ...section, keys };
  //   }

  //   // 4. Other / Others Logic:
  //   // If it's not self-funded or parents, treat as 'Others'.
  //   // We append additional keys for sponsor details.
  //   const additionalKeys = ['sponsorName', 'sponsorRelation'];
  //   const sponsorContact = this.fv('sponsorContact');
  //   const sponsorEmail = this.fv('sponsorEmail');

  //   if (sponsorContact) additionalKeys.push('sponsorContact');
  //   if (sponsorEmail) additionalKeys.push('sponsorEmail');

  //   return { ...section, keys: [...keys, ...additionalKeys] };
  // }
  // private filterSponsorSection(section: FormSection): FormSection {
  //   const rawType        = this.fv('isSelfFunded');
  //   const sponsorType    = rawType.toLowerCase();
  //   const sponsorContact = this.fv('sponsorContact');
  //   const sponsorEmail   = this.fv('sponsorEmail');

  //   // Self-funded: Sponsor Type field only
  //   if (SELF_FUNDED_VALUES.has(rawType)) {
  //     return { ...section, keys: ['isSelfFunded'] };
  //   }

  //   // Parent / Parents: Sponsor Type only — no further sponsor details
  //   if (PARENT_SPONSOR_TYPES.has(sponsorType)) {
  //     return { ...section, keys: ['isSelfFunded'] };
  //   }

  //   // Other / Others: type + name + relation; contact/email only when filled
  //   if (OTHER_SPONSOR_TYPES.has(sponsorType)) {
  //     const keys: string[] = ['isSelfFunded', 'sponsorName', 'sponsorRelation'];
  //     if (sponsorContact) keys.push('sponsorContact');
  //     if (sponsorEmail)   keys.push('sponsorEmail');
  //     return { ...section, keys };
  //   }

  //   return { ...section };
  // }

  private filterVisaSection(section: FormSection): FormSection {
    return this.fv('isVisaRejected') === 'No'
      ? { ...section, keys: section.keys.filter(k => k === 'isVisaRejected') }
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
      isEmpty(this.fv('relativeName')) &&
      isEmpty(this.fv('relativeRelation')) &&
      isEmpty(this.fv('relativeCountry'));
    return noRelative
      ? { ...section, keys: ['relativeNotApplicable'] }
      : { ...section };
  }

  // private filterPassportSection(section: FormSection): FormSection {
  //   return { ...section, keys: section.keys.filter(k => k !== 'passportStatus') };
  // }

  private filterPassportSection(section: FormSection): FormSection {
    const isEmpty = (v: string) => !v || v.toLowerCase() === 'na' || v.toLowerCase() === 'not applicable';

    const passportNo = this.fv('passportNo');
    const issueDate = this.fv('passportIssueDate');
    const validUpto = this.fv('passportValidUpto');

    // Check if all primary passport details are missing
    const isPassportMissing = isEmpty(passportNo) || isEmpty(issueDate) || isEmpty(validUpto);

    if (isPassportMissing) {
      // Return only the section label, or a specific "Not Available" key
      return { ...section, keys: ['passportStatus'] };
    }

    // Return all keys if data is present
    return { ...section };
  }
  // ── Private — utilities ────────────────────────────────────

  /** Read a form value as a trimmed string */
  private fv(key: string): string {
    return String(this.studentForm?.get(key)?.value ?? '').trim();
  }

  /** Counts grades of F or numeric grade ≤ 6 — single pass */
  private countFailingGrades(marks: GradeRecord[]): number {
    return marks.reduce((count, item) => {
      const gradeStr = item.grade?.toUpperCase();
      const gradeNum = parseInt(item.gradeNum ?? '', 10);
      return (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6))
        ? count + 1
        : count;
    }, 0);
  }

  /** Returns ISO yyyy-MM-dd string or null for missing / invalid dates */
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
    if (this.role === 'Student') {
      return `StudentDashboard/${this.loginName}/${this.registrationNo}`;
    }
    if (HOD_ROLES.has(this.role)) {
      return `DashboardHOD/${this.loginName}`;
    }
    return null;
  }

  private loginFailed(error: unknown): void {
    this.isLoginFailed = true;
    this.isLoading = false;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid or session expired!',
      icon: 'warning',
    });
    const el = document.getElementById('StudentDashboard');
    if (el) { el.hidden = true; }
  }
}
