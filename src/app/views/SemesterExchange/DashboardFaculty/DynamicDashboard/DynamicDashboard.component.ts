import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/**
 * Matches the columns returned by getAllApplications() and
 * getAllApplicationsforHOD() (GetSemesterExchangeApplicationForHOD).
 *
 * Column-to-role mapping (confirmed from live data):
 *
 *  DealingAuthority  – Employee code of the COUNSELLOR for that student.
 *                      Multiple counsellors exist (30922, 31859, 33333 …).
 *                      NULL means no counsellor assigned yet.
 *
 *  DealingFaculty    – Employee code of the FACULTY the counsellor forwarded to.
 *                      NULL until the counsellor explicitly forwards.
 *
 *  DealingHODId      – Fixed system-wide HOD code (28243).
 *                      Non-null means the application has been sent to HOD.
 *
 *  DealingHow        – Fixed system-wide HoW code (12160).
 *                      Non-null means the HOD has forwarded to HoW.
 *
 *  IsForwardtoHOD    – 1 when counsellor has forwarded to HOD.
 *  IsForwardedtoHOW  – 1 when HOD has forwarded to HoW.
 *  CounsellingStatus – 1 = counselled, 0 = not yet counselled.
 *  CounsellingRemarks / CounsellingDate – set by counsellor.
 */
interface Application {
  // Core identity
  applicationId: string;
  registrationNo: string;
  studentName: string;
  // Contact
  phoneNumber: string;
  whatsAppNo: string;
  parentContact: string;
  emailId: string;

  // Status flags (raw values from DB — may be numeric string or boolean string)
  isApproved: string;       // 1 / 0 / NULL
  isLocked: string;
  approvalRemarks: string;

  // Counselling
  counsellingStatus: string;    // 1 / 0
  counsellingRemarks: string;
  counsellingDate: string;

  // Forwarding
  isForwardtoHOD: string;       // 1 / NULL
  isForwardedtoHOW: string;     // 1 / NULL

  // Role columns
  dealingAuthority: string;   // Counsellor emp code
  dealingFaculty: string;     // Faculty emp code (NULL until forwarded)
  dealingHODId: string;       // Fixed: 28243 (NULL until forwarded to HOD)
  dealingHow: string;         // Fixed: 12160 (NULL until forwarded to HoW)

  // HOD Tab XX extras (returned by GetSemesterExchangeApplicationForHOD)
  countryName: string;
  applyingOption: string;
  universityOption1: string;
  universityOption2: string;
  universityOption3: string;

  // ── Runtime flags set by enrichAndFilterApplications() ──────────────────
  _isCounsellor: boolean;
  _isFaculty: boolean;
  _isHOD: boolean;
  _isHoW: boolean;
}

/**
 * Matches the remarks row returned by getAllRemarks().
 * The HOD Tab XX data already embeds CounsellingRemarks inline.
 * AllAuthorityRemarks covers evaluation and interview remarks.
 */
interface AuthorityRemarks {
  registrationNo: string;
  applicationId: string;

  // Counsellor remarks
  dealingUidRemarks: string;
  counsellingRemarks: string;
  counsellingStatus: string;
  counsellingDate: string;

  // Faculty interview remarks
  dealingUserInterviewRemarks: string;
  facultyRemarks: string;

  // HOD remarks
  dealingHODRemarks: string;
  dealingHODInterviewRemarks: string;
  hodRemarks: string;
  isForwardtoHOD: string;

  // HoW remarks
  dealingHowRemarks: string;
  howRemarks: string;
  isForwardedtoHOW: string;

  // Approval / rejection
  ApprovalRemarks: string;

  // Evaluation marks (HOD / HoW fill these)
  academicsMarks: string;
  communicationSkillsMarks: string;
  attitudeMarks: string;
  extraCurricularMarks: string;
  knowledgeMarks: string;
  totalMarks: string;
  comments: string;
  remarksBy: string;
}

/** Aggregated view of ALL remarks for one registration number. */
interface AggregatedRemarks {
  registrationNo: string;
  applicationId: string;
  // Counselling
  counsellingRemarks: string;
  counsellingDate: string;
  counsellingDone: boolean;
  // Faculty
  facultyRemarks: string;
  // HOD
  hodRemarks: string;
  forwardedToHOD: boolean;
  // HoW
  howRemarks: string;
  forwardedToHoW: boolean;
  // Approval
  approvalRemarks: string;
  // Evaluation
  academicsMarks: string;
  communicationSkillsMarks: string;
  attitudeMarks: string;
  extraCurricularMarks: string;
  knowledgeMarks: string;
  totalMarks: string;
  evaluationComments: string;
  evaluationBy: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-DynamicDashboard',
  templateUrl: './NewDashboard.html',
  styleUrls: ['../DashboardFaculty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicDashboardComponent implements OnInit {

  // ── UI / State ───────────────────────────────────────────────────────────────
  pageTitle = 'Dashboard';
  isLoginFailed = false;

  /** Raw list from getAllApplications() */
  AllApplications: Application[] = [];
  AllFacultyApplications: Application[] = [];
  AllAuthorityApplications: Application[] = [];
  AllHODApplications: Application[] = [];
  AllHOWApplications: Application[] = [];

  /** Raw remarks list from getAllRemarks() */
  AllAuthorityRemarks: AuthorityRemarks[] = [];

  /**
   * Applications shown in the single-grid dashboards
   * (Counsellor / Faculty / HoW).
   */
  visibleApplications: Application[] = [];

  /** HOD – Tab (X): Applications that have reached HOD review stage. */
  hodMyApplications: Application[] = [];

  /**
   * HOD – Tab (XX): Full list from GetSemesterExchangeApplicationForHOD().
   * Contains all applications with extended columns for overview.
   */
  hodAllApplications: Application[] = [];
  AllApprovedApplications: Application[] = [];

  /** Currently selected remarks object (bound to the View Remarks modal). */
  selectedRemarks: AggregatedRemarks | null = null;

  /**
   * Role of the user who triggered viewAllRemarks().
   * 'counsellor' → Evaluation section is HIDDEN in the modal  (req #3/#4)
   * 'faculty' | 'hod' | 'how' → Evaluation section is SHOWN
   */
  selectedRemarksCallerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor';

  /** Active tab for HOD view. */
  hodActiveTab: 'my' | 'all' | 'allApproved' = 'my';

  ColumnMode = ColumnMode;
  loadingIndicator = false;
  private readonly minLoadingTime = 1000;

  // ── Forms ────────────────────────────────────────────────────────────────────
  EvaluationForm!: FormGroup;
  CounsellingRemarksForm!: FormGroup;
  AddRemarksForm!: FormGroup;

  // ── Global role flags ────────────────────────────────────────────────────────
  isDealingAuthority = false;   // Counsellor
  isdealingFaculty   = false;   // Faculty
  isHOD              = false;
  isHoW              = false;

  // ── Employee info ────────────────────────────────────────────────────────────
  EmployeeCode: string | null = null;
  LoginName!: string;
  EmployeeDetails: any;
  EmployeeName: string | null = null;
  ContactNoX: string | null = null;
  DepartmentName: string | null = null;
  UserRole: string | null = null;
  Department: string | null = null;

  // ── Form submission flags ────────────────────────────────────────────────────
  isEvaluationFormSubmitted  = false;
  isCounsellingFormSubmitted = false;
  isAddRemarksFormSubmitted  = false;

  // ── Selected row context (used by all modals) ────────────────────────────────
  ApplicationId: string | null = null;
  RegistrationNo: string | null = null;
  RemarksBy: string | null = null;

  // ── Modal refs ───────────────────────────────────────────────────────────────
  @ViewChild('EvaluationModal')        EvaluationModal!: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;
  @ViewChild('AddRemarksModal')        AddRemarksModal!: TemplateRef<any>;
  @ViewChild('ViewRemarksModal')       ViewRemarksModal!: TemplateRef<any>;

  private currentModalRef: NgbModalRef | null = null;

  // ─────────────────────────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private storageService: StorageService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private studentService: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService,
    private title: Title
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];

    const stMain = document.getElementById('stMain') as HTMLInputElement;
    if (stMain) {
      stMain.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
    }
    const imgLogo = document.getElementById('imgLogo') as HTMLImageElement;
    if (imgLogo) imgLogo.style.width = '164px';

    this.initializeForms();
    this.getToken(this.LoginName);
  }

  // ── Form Init ─────────────────────────────────────────────────────────────────

  private initializeForms(): void {
    this.EvaluationForm = this.fb.group({
      AcademicsMarks:           [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      AttitudeMarks:            [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      ExtraCurricularMarks:     [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      KnowledgeMarks:           [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      Comments: [''],
    });

    this.CounsellingRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });

    this.AddRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });
  }

  // ── Auth / Bootstrap ──────────────────────────────────────────────────────────

  private getToken(loginName: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.authService.loginTemp(loginName).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.LoginFailed('Token Expired or Invalid Login');
        } else {
          this.isLoginFailed = false;
          this.GetEmployeeDetails();
        }
      },
      error: () => this.LoginFailed('Database Error'),
    });
  }

  private GetEmployeeDetails(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.mouDocumentsService.GetEmployeeDetails().pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        if (response?.item1?.length > 0) {
          const emp = response.item1[0];
          this.EmployeeDetails  = emp;
          this.EmployeeName     = emp.employeeName;
          this.EmployeeCode     = '34923';// String(emp.employeeCode).trim();
          this.ContactNoX       = emp.contactNo;
          this.Department       = emp.department;
          this.DepartmentName   = emp.departmentName;
          this.UserRole         = emp.userRole;

          // Fetch applications and remarks in parallel
          this.getSEAllApplications();
          this.getAllAuthorityRemarks();
        } else {
          this.LoginFailed('No employee details found.');
        }
      },
      error: err => this.LoginFailed(err),
    });
  }

  // ── Data Fetch ────────────────────────────────────────────────────────────────

  private getSEAllApplications(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplicationsforHOD().pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];

        this.AllFacultyApplications = response.item1.filter((app: { dealingFaculty: string | ''; }) => app.dealingFaculty==this.EmployeeCode);
        this.AllAuthorityApplications =  response.item1.filter((app: { dealingAuthority: string | ''; }) => app.dealingAuthority==this.EmployeeCode);
        this.AllHODApplications = response.item1.filter((app: { dealingHODId: string | ''; isForwardtoHOD: string | ''; }) => app.dealingHODId==this.EmployeeCode && app.isForwardtoHOD=='1');
        this.AllHOWApplications = response.item1.filter((app: { dealingHow: string | ''; isForwardedtoHOW: string | ''; }) => app.dealingHow==this.EmployeeCode && app.isForwardedtoHOW=='1');  
         this.AllApprovedApplications = response.item1.filter((app: { approvedUniversity: string | ''; }) => app.approvedUniversity?.length > 0);
        this.enrichAndFilterApplications();
      },
      error: err => this.LoginFailed(err),
    });
  }

  private getAllAuthorityRemarks(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllRemarks().pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        this.AllAuthorityRemarks = Array.isArray(response?.item1) ? response.item1 : [];
        this.cd.detectChanges();
      },
      error: err => this.LoginFailed(err),
    });
  }

  /**
   * HOD Tab (XX) — uses the dedicated endpoint
   * GetSemesterExchangeApplicationForHOD() which returns ALL applications
   * with extended columns (DealingAuthority, CounsellingRemarks, etc.).
   * Called only once the HOD role is confirmed.
   */
  private GetAllApplicationsforHOD(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplicationsforHOD().pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        this.hodAllApplications = Array.isArray(response?.item1) ? response.item1 : [];
        this.AllApprovedApplications = response.item1.filter((app: { approvedUniversity: string | ''; }) => app.approvedUniversity?.length > 0);
        this.cd.detectChanges();
      },
      error: err => this.LoginFailed(err),
    });
  }

  // ── Role Enrichment & Filtering ───────────────────────────────────────────────

  /**
   * ─── Column → Role mapping (confirmed from live API data) ───────────────────
   *
   *  DealingAuthority  – per-application Counsellor employee code.
   *                      Multiple counsellors exist (30922, 31859, 33333 …).
   *                      NULL = not yet assigned.
   *
   *  DealingFaculty    – per-application Faculty employee code.
   *                      NULL until the counsellor forwards.
   *
   *  DealingHODId      – per-application HOD employee code.
   *                      NOT a fixed system-wide code — confirmed values include
   *                      22413, 28243, 31309. Set when isForwardtoHOD = true.
   *
   *  DealingHow        – per-application HoW employee code.
   *                      NULL until HOD forwards to HoW.
   *
   * ─── Key insight from live data (empCode 31309) ─────────────────────────────
   *
   *  A single employee can hold MULTIPLE roles across different applications:
   *    • App 2: DealingHODId = 31309  → HOD for that application
   *    • App 3: DealingAuthority = 31309 AND DealingHODId = 31309
   *             → Counsellor AND HOD for that application
   *    • App 4: DealingHODId = 31309  → HOD for that application
   *
   *  The OLD winner-takes-all priority (HOD > HoW > Faculty > Counsellor)
   *  caused the Faculty/Counsellor dashboard to never render because the
   *  global isHOD flag was raised first, swallowing all other roles.
   *
   * ─── Fix: ALL role flags are independent booleans ───────────────────────────
   *
   *  Each flag is raised independently. buildVisibleApplications() and the HTML
   *  template show EVERY dashboard for which the user has at least one row.
   *  This means a user who is HOD on some apps AND Counsellor on others sees
   *  BOTH the HOD section and the Counsellor section simultaneously.
   *
   * ─── Per-row filter rules (per requirements) ────────────────────────────────
   *
   *  Counsellor row  : DealingAuthority === empCode
   *                    AND DealingHODId  !== empCode  (not acting as HOD on this row)
   *                    AND DealingHow    !== empCode  (not acting as HoW on this row)
   *
   *  Faculty row     : DealingFaculty   === empCode
   *                    AND DealingHODId  !== empCode
   *                    AND DealingHow    !== empCode
   *
   *  HOD row         : DealingHODId     === empCode
   *
   *  HoW row         : DealingHow       === empCode
   */
  private enrichAndFilterApplications(): void {
    this.AllApplications = this.AllApplications || [];

    const emp = this.EmployeeCode ? this.EmployeeCode.trim() : null;

    // Reset all global role flags
    this.isHOD              = false;
    this.isHoW              = false;
    this.isdealingFaculty   = false;
    this.isDealingAuthority = false;

    // ── Pass 1: compute raw per-row flags; detect whether employee has any Faculty rows ──
    // We must complete a full scan first before applying the Faculty-wins-over-Counsellor
    // priority rule, because that decision depends on the aggregate across ALL rows.
    let hasFacultyRows = false;

    this.AllApplications = this.AllApplications.map(app => {
      const authority = this.normalise(app.dealingAuthority);
      const faculty   = this.normalise(app.dealingFaculty);
      const hodId     = this.normalise(app.dealingHODId);
      const how       = this.normalise(app.dealingHow);

      // Counsellor row: DealingAuthority === empCode
      //   AND not acting as HOD or HoW on this same row
      app._isCounsellor =
        emp !== null &&
        authority === emp &&
        hodId !== emp &&
        how   !== emp;

      // Faculty row: DealingFaculty === empCode
      //   AND not acting as HOD or HoW on this same row
      app._isFaculty =
        emp !== null &&
        faculty === emp &&
        hodId !== emp &&
        how   !== emp;

      // HOD row: DealingHODId === empCode
      app._isHOD = emp !== null && hodId === emp;

      // HoW row: DealingHow === empCode
      app._isHoW = emp !== null && how === emp;

      if (app._isFaculty) hasFacultyRows = true;

      return app;
    });

    // ── Pass 2: apply Faculty-wins-over-Counsellor priority rule ────────────
    // Business rule: if this employee has ANY Faculty rows across the dataset,
    // suppress all their Counsellor rows so only ONE dashboard renders.
    // HOD and HoW are independent roles and are never suppressed by this rule.
    if (hasFacultyRows) {
      this.AllApplications.forEach(app => {
        if (app._isCounsellor) { app._isCounsellor = false; }
      });
    }

    // ── Raise global role flags from the finalised per-row values ────────────
    this.AllApplications.forEach(app => {
      if (app._isCounsellor) this.isDealingAuthority = true;
      if (app._isFaculty)    
        this.isdealingFaculty   = true;
      if (app._isHOD)        this.isHOD              = true;
      if (app._isHoW)        this.isHoW              = true;
    });

    this.buildPageTitle();
    this.buildVisibleApplications();
    this.cd.detectChanges();
  }

  /**
   * Trims a value and returns null if it is empty, 'NULL', 'null', or undefined.
   */
  private normalise(val: any): string | null {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    return (s === '' || s.toLowerCase() === 'null') ? null : s;
  }

  /**
   * Populate display lists for EVERY role the user holds.
   *
   * Because a single employee can be HOD on some applications and Counsellor
   * (or Faculty) on others, ALL four lists are populated independently.
   * The HTML template renders each dashboard section conditionally — if the
   * user has rows in more than one list, they see more than one section.
   *
   *  hodMyApplications   – rows where _isHOD  (shown in HOD Tab I)
   *  hodAllApplications  – from dedicated API  (shown in HOD Tab II)
   *  visibleApplications – union of _isHoW + _isFaculty + _isCounsellor rows
   *                        (each role block in the template filters its own subset)
   *
   * The template uses *ngIf per role and filters [rows] inline so each grid
   * only shows rows that belong to it.
   */
  private buildVisibleApplications(): void {
    // HOD section — rows where isForwardtoHOD is truthy
    this.hodMyApplications = this.AllApplications.filter(a => this.isTrue(a.isForwardtoHOD));
    // HOD Tab II — dedicated API (only call if HOD role is active)
    if (this.isHOD) {
      this.GetAllApplicationsforHOD();
    }

    // Single visibleApplications list holds ALL non-HOD rows for this user.
    // The template then filters per role using the per-row flags.
    this.visibleApplications = this.AllApplications.filter(
      a => a._isCounsellor || a._isFaculty || a._isHoW  
    );
  }
// private buildPageTitle(): void {
//   // Role display order: Faculty > Counsellor > HOD > HoW
//   // isDealingAuthority is only true when the employee is a pure Counsellor
//   // (no Faculty rows), so no special suppression is needed here.
//   const roleMap: Record<string, string> = {
//     isdealingFaculty:   'Faculty',
//     isDealingAuthority: 'Counsellor',
//     isHOD:              'HOD',
//     isHoW:              'HoW',
//   };

//   const activeRoles = Object.keys(roleMap)
//     .filter(key => (this as any)[key])
//     .map(key => roleMap[key]);

//   this.pageTitle = activeRoles.length
//     ? `** ${activeRoles.join(' | ')} Dashboard **`
//     : 'Dashboard';
//   this.title.setTitle(this.pageTitle);
// }
  private buildPageTitle(): void {
    var roles: any='';
    if (this.isDealingAuthority) roles='Counsellor';
    if (this.isdealingFaculty)   roles='Faculty';
    if (this.isHOD)             roles='HOD';
    if (this.isHoW)              roles='HoW';    

    this.pageTitle = roles.length
      ? `** ${roles} Dashboard **`
      : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  // ── HOD Tab Switching ─────────────────────────────────────────────────────────

  switchHodTab(tab: 'my' | 'all'| 'allApproved'): void {
    this.hodActiveTab = tab;
    this.cd.detectChanges();
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  GetStudentApplication(application: Application): void {
    if (this.LoginName && application.registrationNo) {
      this.router.navigateByUrl(
        `ApplicationDetails/${this.LoginName}/${application.registrationNo}/Faculty`
      );
    } else {
      Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
    }
  }

  // ── Accept / Reject ───────────────────────────────────────────────────────────

  acceptApplication(application: Application): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this application?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Accept!',
      cancelButtonText: 'No, Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('Action', 'Accept');
        this.handleStatusChange(fd, 'Accept');
      }
    });
  }

  disapproveApplication(application: Application): void {
    Swal.fire({
      title: 'Reason for Disapproval',
      input: 'text',
      inputPlaceholder: 'Enter reason here...',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: reason => {
        if (!reason) Swal.showValidationMessage('Reason is required!');
        return reason;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('ApprovalRemarks', result.value);
        fd.append('Action', 'Disapprove');
        this.handleStatusChange(fd, 'Disapprove');
      }
    });
  }

  private handleStatusChange(formData: FormData, action: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.SendApproveRequest(formData).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: (data: any) => {
        const msg = data?.item1?.[0]?.msg;
        if (msg === 'Approved') {
          Swal.fire('Success!', `Application ${action}ed successfully!`, 'success')
            .then(() => this.getSEAllApplications());
        } else if (msg === 'Disapproved') {
          Swal.fire('No Change!', 'The application status was not changed.', 'info');
        } else {
          Swal.fire('Error!', `Failed to ${action} application.`, 'error');
        }
      },
      error: () => Swal.fire('Error!', `An error occurred while trying to ${action} the application.`, 'error'),
    });
  }

  // ── Forwarding ────────────────────────────────────────────────────────────────

  ForwardToFaculty(application: Application): void {
    Swal.fire({
      title: 'Forward to Faculty',
      input: 'text',
      inputPlaceholder: 'Enter Faculty Employee Code...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: uid => {
        if (!uid) Swal.showValidationMessage('Faculty Employee Code is required!');
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('HODUID', result.value);
        fd.append('UserAction', 'Faculty');
        this.sendForwardRequest(fd);
      }
    });
  }
ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
  const label = userAction === 'Hod' ? 'HOD' : 'Head of Wing';
  const staticUid = '28243'; // Hardcoded fallback processor code

  Swal.fire({
    title: `Forward to ${label}`,
    text: `Are you sure you want to forward this application to the designated ${label}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Forward',
    cancelButtonText: 'Cancel',
    allowOutsideClick: () => !Swal.isLoading()
  }).then(result => {
    if (result.isConfirmed) {
      const fd = new FormData();
      fd.append('RegistrationNo', application.registrationNo);
      fd.append('HODUID', staticUid); // Automatically injects the static tracking value
      fd.append('UserAction', userAction);
      
      this.sendForwardRequest(fd);
    }
  });
}
  // ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
  //   const label = userAction === 'Hod' ? 'HOD' : 'Head of Wing';
  //   Swal.fire({
  //     title: `Forward to ${label}`,
  //     input: 'text',
  //     inputPlaceholder: `Enter ${label} Employee Code...`,
  //     showCancelButton: true,
  //     confirmButtonText: 'Forward',
  //     showLoaderOnConfirm: true,
  //     preConfirm: uid => {
  //       if (!uid) Swal.showValidationMessage('Employee Code is required!');
  //       return uid;
  //     },
  //     allowOutsideClick: () => !Swal.isLoading(),
  //   }).then(result => {
  //     if (result.isConfirmed && result.value) {
  //       const fd = new FormData();
  //       fd.append('RegistrationNo', application.registrationNo);
  //       fd.append('HODUID', result.value);
  //       fd.append('UserAction', userAction);
  //       this.sendForwardRequest(fd);
  //     }
  //   });
  // }

  private sendForwardRequest(formData: FormData): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.SendForwardRequest(formData).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: (data: any) => {
        if (data?.item1?.[0]?.msg === 'Success') {
          Swal.fire('Success!', 'Action Applied!', 'success').then(() => this.getSEAllApplications());
        } else {
          Swal.fire('Failed!', 'Action Failed!', 'error').then(() => this.getSEAllApplications());
        }
      },
      error: () => Swal.fire('Error!', 'An error occurred while forwarding the application.', 'error'),
    });
  }

  // ── HOD: Assign Counsellor (Tab XX) ──────────────────────────────────────────

  assignCounsellor(application: Application): void {
    Swal.fire({
      title: 'Assign Counsellor',
      text: `Application ${application.applicationId} — Registration: ${application.registrationNo}`,
      input: 'text',
      inputPlaceholder: 'Enter Counsellor Employee Code...',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      showLoaderOnConfirm: true,
      preConfirm: code => {
        if (!code) Swal.showValidationMessage('Counsellor Employee Code is required!');
        return code;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('ApplicationId', application.applicationId);
        fd.append('HODUID', result.value);
        fd.append('UserAction', 'AssignCounsellor');
        this.sendForwardRequest(fd);
      }
    });
  }
  assignFaculty(application: Application): void {
    Swal.fire({
      title: 'Assign Faculty',
      text: `Application ${application.applicationId} — Registration: ${application.registrationNo}`,
      input: 'text',
      inputPlaceholder: 'Enter Faculty Employee Code...',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      showLoaderOnConfirm: true,
      preConfirm: code => {
        if (!code) Swal.showValidationMessage('Faculty Employee Code is required!');
        return code;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('ApplicationId', application.applicationId);
        fd.append('HODUID', result.value);
        fd.append('UserAction', 'Faculty');
        this.sendForwardRequest(fd);
      }
    });
  }

  // ── Evaluation Remarks ────────────────────────────────────────────────────────

  UploadEvaluationRemarks(application: Application, remarksBy: string): void {
    alert(remarksBy);
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId  = application.applicationId;
    this.RemarksBy      = remarksBy;

    this.EvaluationForm.reset();
    this.isEvaluationFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.EvaluationModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
    this.cd.detectChanges();
  }

  submitEvaluationForm(): void {
    this.isEvaluationFormSubmitted = true;
    if (this.EvaluationForm.invalid) {
      Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();
    const v = this.EvaluationForm.value;
    const total = +v.AcademicsMarks + +v.CommunicationSkillsMarks +
                  +v.AttitudeMarks  + +v.ExtraCurricularMarks + +v.KnowledgeMarks;

    const fd = new FormData();
    fd.append('RegistrationNo',           this.RegistrationNo || '');
    fd.append('AcademicsMarks',           v.AcademicsMarks);
    fd.append('CommunicationSkillsMarks', v.CommunicationSkillsMarks);
    fd.append('AttitudeMarks',            v.AttitudeMarks);
    fd.append('ExtraCurricularMarks',     v.ExtraCurricularMarks);
    fd.append('KnowledgeMarks',           v.KnowledgeMarks);
    fd.append('TotalMarks',               total.toString());
    fd.append('Comments',                 v.Comments || '');
    fd.append('RemarksBy',               this.RemarksBy || 'Unknown');
    fd.append('DealingUId',               this.EmployeeCode || 'Unknown');

    this.ServicesSM.StudentEvalutionAddNew(fd).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: (data: any) => {
        const code = data?.item1?.[0]?.returnData;
        if (code > 0) {
          Swal.fire('Success!', 'Evaluation Marks Updated Successfully', 'success')
            .then(() => this.currentModalRef?.close());
        } else if (code === '-1') {
          Swal.fire('Info', 'Evaluation Marks Already Uploaded', 'info')
            .then(() => this.currentModalRef?.close());
        }
      },
      error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
    });
  }

  // ── Counselling Remarks (Counsellor submits) ──────────────────────────────────

  submitCounsellingRemarks(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId  = application.applicationId;

    this.CounsellingRemarksForm.reset();
    this.isCounsellingFormSubmitted = false;

    // Pre-fill if already counselled
    if (this.isTrue(application.counsellingStatus) && application.counsellingRemarks) {
      this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
    }

    this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
    this.cd.detectChanges();
  }

  submitCounsellingRemarksForm(): void {
    this.isCounsellingFormSubmitted = true;
    if (this.CounsellingRemarksForm.invalid) {
      Swal.fire('Validation Error', 'Please enter your counselling remarks.', 'error');
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();

    /**
     * SP: pUpdateSECounsellingRemarks
     * Action = 'Counsellor' → routes to CounsellingRemarks column.
     * The SP appends server-side: ISNULL(CounsellingRemarks,'') + @FormattedRemarks
     * where @FormattedRemarks includes a timestamp + LoginName header.
     * Frontend sends ONLY the new text — no client-side concatenation needed.
     * Success response: { Msg: 'Success', ReturnId: '<ApplicationId>' }
     * Failure response: { Msg: 'Failed: ...', ReturnId: -1 }
     */
    const fd = new FormData();
    fd.append('ApplicationId',      this.ApplicationId  || '');
    fd.append('CounsellingRemarks', this.CounsellingRemarksForm.value.Comments.trim());
    fd.append('Action',             'Counsellor');

    this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: (data: any) => {
        const msg = data?.item1?.[0]?.msg ?? data?.item1?.[0]?.Msg;
        if (msg === 'Success') {
          Swal.fire('Success!', 'Counselling Remarks Saved Successfully', 'success')
            .then(() => this.currentModalRef?.close());
        } else {
          Swal.fire('Error!', msg || 'Some Technical Issue Occurred', 'error');
        }
      },
      error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
    });
  }

  // ── Faculty: Add Remarks ──────────────────────────────────────────────────────

  openAddRemarksModal(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId  = application.applicationId;

    this.AddRemarksForm.reset();
    this.isAddRemarksFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.AddRemarksModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
    this.cd.detectChanges();
  }

  submitAddRemarksForm(): void {
    this.isAddRemarksFormSubmitted = true;
    if (this.AddRemarksForm.invalid) {
      Swal.fire('Validation Error', 'Please enter your remarks.', 'error');
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();

    /**
     * SP: pUpdateSECounsellingRemarks
     * Action = 'Faculty' → routes to DealingUidRemarks column.
     * The SP appends server-side with a timestamp + LoginName header:
     *   DealingUidRemarks = ISNULL(DealingUidRemarks,'') + @FormattedRemarks
     * Frontend sends ONLY the new text — the SP owns the append logic.
     * Success response: { Msg: 'Success', ReturnId: '<ApplicationId>' }
     * Failure response: { Msg: 'Failed: ...', ReturnId: -1 }
     */
    const fd = new FormData();
    fd.append('ApplicationId',      this.ApplicationId  || '');
    fd.append('CounsellingRemarks', this.AddRemarksForm.value.Comments.trim());
    fd.append('Action',             'Faculty');

    this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: (data: any) => {
        const msg = data?.item1?.[0]?.msg ?? data?.item1?.[0]?.Msg;
        if (msg === 'Success') {
          Swal.fire('Success!', 'Remarks Saved Successfully', 'success')
            .then(() => this.currentModalRef?.close());
        } else {
          // Display the SP failure message directly so the user knows what went wrong
          Swal.fire('Error!', msg || 'Some Technical Issue Occurred', 'error');
        }
      },
      error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
    });
  }

  // ── Unified View Remarks Modal ────────────────────────────────────────────────

  /**
   * Builds AggregatedRemarks for the selected row by joining on RegistrationNo
   * across AllAuthorityRemarks (and the inline counselling fields on the row),
   * then opens the unified View Remarks modal.
   *
   * All remark types shown in one modal:
   *   – Counselling Remarks (from counsellor, date included)
   *   – Faculty / Interview Remarks
   *   – HOD Remarks
   *   – HoW Remarks
   *   – Approval / Rejection Remarks
   *   – Evaluation Marks breakdown
   */
  /**
   * Opens the unified View Remarks modal.
   *
   * @param row        The application row that was clicked.
   * @param callerRole Role of the user opening the modal:
   *                   'counsellor' → Evaluation Marks section is hidden  (req #3/#4)
   *                   'faculty' | 'hod' | 'how' → Evaluation Marks are shown
   */

  viewAllRemarks(
  row: Application,
  callerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor'
): void {
  this.selectedRemarksCallerRole = callerRole;

  // Find the matching remarks row safely (fallback to undefined for new applications)
  const r = this.AllAuthorityRemarks?.find(
    x => x.registrationNo === row.registrationNo
  );

  this.selectedRemarks = {
    registrationNo: row.registrationNo,
    applicationId:  row.applicationId || r?.applicationId || '',

    // 1. Counselling — Inline application row fields map to table flags
    counsellingRemarks: r?.counsellingRemarks || row.counsellingRemarks || '',
    counsellingDate:    r?.counsellingDate    || row.counsellingDate    || '',
    counsellingDone:    this.isTrue(r?.counsellingStatus ?? row.counsellingStatus ),

    // 2. Faculty / Interview Remarks
    facultyRemarks:
      r?.facultyRemarks || r?.dealingUserInterviewRemarks  || '',

    // 3. HOD Remarks & Forwarding Status
    hodRemarks:      r?.hodRemarks || r?.dealingHODRemarks || r?.dealingHODInterviewRemarks   || '',
    forwardedToHOD:  this.isTrue(r?.isForwardtoHOD ?? row.isForwardtoHOD),

    // 4. HoW Remarks & Forwarding Status (Mapped to structural columns 3 & 11)
    howRemarks:      r?.howRemarks || r?.dealingHowRemarks || r?.dealingHowRemarks ||  '',
    forwardedToHoW:  this.isTrue(r?.isForwardedtoHOW   ?? row.isForwardedtoHOW),

    // 5. Final Status Actions
    approvalRemarks: r?.ApprovalRemarks   || row.approvalRemarks || '',

    // 6. Evaluation metrics breakdowns
    academicsMarks:           r?.academicsMarks            || '',
    communicationSkillsMarks: r?.communicationSkillsMarks  || '',
    attitudeMarks:            r?.attitudeMarks             || '',
    extraCurricularMarks:     r?.extraCurricularMarks      || '',
    knowledgeMarks:           r?.knowledgeMarks            || '',
    totalMarks:               r?.totalMarks                || '',
    evaluationComments:       r?.comments                  || '',
    evaluationBy:             r?.remarksBy                 || '',
  } as any;

  // Render trigger configuration
  this.currentModalRef = this.modalService.open(this.ViewRemarksModal, {
    size: 'xl', 
    backdrop: 'static', 
    keyboard: false,
  });
  
  this.currentModalRef.result.catch(() => {});
  this.cd.detectChanges();
}
  // viewAllRemarks(
  //   row: Application,
  //   callerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor'
  // ): void {
  //   this.selectedRemarksCallerRole = callerRole;

  //   // Find the matching remarks row (may be undefined for new applications)
  //   const r = this.AllAuthorityRemarks.find(
  //     x => x.registrationNo === row.registrationNo
  //   );

  //   this.selectedRemarks = {
  //     registrationNo: row.registrationNo,
  //     applicationId:  row.applicationId,

  //     // Counselling — inline on the application row AND in remarks table
  //     counsellingRemarks: r?.counsellingRemarks || row.counsellingRemarks || '',
  //     counsellingDate:    r?.counsellingDate    || row.counsellingDate    || '',
  //     counsellingDone:    this.isTrue(r?.counsellingStatus ?? row.counsellingStatus),

  //     // Faculty interview remarks
  //     facultyRemarks:
  //       r?.dealingUserInterviewRemarks || r?.facultyRemarks || '',

  //     // HOD remarks
  //     hodRemarks:      r?.dealingHODRemarks || r?.hodRemarks || r?.dealingHODInterviewRemarks || '',
  //     forwardedToHOD:  this.isTrue(r?.isForwardtoHOD  ?? row.isForwardtoHOD),

  //     // HoW remarks
  //     howRemarks:     r?.dealingHowRemarks || r?.howRemarks || '',
  //     forwardedToHoW: this.isTrue(r?.isForwardedtoHOW ?? row.isForwardedtoHOW),

  //     // Approval / rejection
  //     approvalRemarks: r?.ApprovalRemarks || row.approvalRemarks || '',

  //     // Evaluation
  //     academicsMarks:           r?.academicsMarks           || '',
  //     communicationSkillsMarks: r?.communicationSkillsMarks || '',
  //     attitudeMarks:            r?.attitudeMarks            || '',
  //     extraCurricularMarks:     r?.extraCurricularMarks     || '',
  //     knowledgeMarks:           r?.knowledgeMarks           || '',
  //     totalMarks:               r?.totalMarks               || '',
  //     evaluationComments:       r?.comments                 || '',
  //     evaluationBy:             r?.remarksBy                || '',
  //   } as any;

  //   this.currentModalRef = this.modalService.open(this.ViewRemarksModal, {
  //     size: 'xl', backdrop: 'static', keyboard: false,
  //   });
  //   this.currentModalRef.result.catch(() => {});
  //   this.cd.detectChanges();
  // }

  /** Returns true if any remark type has content for this row. */
  hasAnyRemarks(row: Application): boolean {
    const r = this.AllAuthorityRemarks.find(x => x.registrationNo === row.registrationNo);
    return !!(
      row.counsellingRemarks ||
      r?.counsellingRemarks ||
      r?.dealingUserInterviewRemarks || r?.facultyRemarks ||
      r?.dealingHODRemarks || r?.hodRemarks ||
      r?.dealingHowRemarks || r?.howRemarks ||
      r?.ApprovalRemarks ||
      row.approvalRemarks ||
      r?.academicsMarks
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  /**
   * Normalises truthy DB values: 1, '1', 'True', true → true.
   */
  isTrue(val: any): boolean {
    if (val === null || val === undefined) return false;
    const s = String(val).trim().toLowerCase();
    return s === '1' || s === 'true';
  }

  /** Converts isApproved (1/0/NULL) to a human label. */
  approvalLabel(val: string): string {
    if (this.isTrue(val)) return 'Approved';
    if (val === '0' || val === 'False' || val === 'false') return 'Rejected';
    return 'Pending';
  }

  approvalClass(val: string): string {
    if (this.isTrue(val))                                   return 'bg-success';
    if (val === '0' || val === 'False' || val === 'false') return 'bg-danger';
    return 'bg-warning text-dark';
  }

  counsellingLabel(val: string): string {
    return this.isTrue(val) ? 'Counselled' : 'Pending';
  }

  private stopLoader(startTime: number): void {
    const elapsed = Date.now() - startTime;
    setTimeout(() => {
      this.loadingIndicator = false;
      this.cd.detectChanges();
    }, Math.max(this.minLoadingTime - elapsed, 0));
  }

  // ── Form Control Getters ──────────────────────────────────────────────────────

  get evaluationFormControls()       { return this.EvaluationForm.controls; }
  get counsellingRemarksFormControls(){ return this.CounsellingRemarksForm.controls; }
  get addRemarksFormControls()       { return this.AddRemarksForm.controls; }

  // ── Error Helper ──────────────────────────────────────────────────────────────

  private LoginFailed(error: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid', icon: 'warning' });
    const el = document.getElementById('DealingUserDashboardId');
    if (el) el.hidden = true;
    this.cd.detectChanges();
  }
}

// import {
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   OnInit,
//   TemplateRef,
//   ViewChild,
// } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
// import Swal from 'sweetalert2';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { finalize } from 'rxjs';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

// // ─── Interfaces ───────────────────────────────────────────────────────────────

// /**
//  * Matches the columns returned by getAllApplications() and
//  * getAllApplicationsforHOD() (GetSemesterExchangeApplicationForHOD).
//  *
//  * Column-to-role mapping (confirmed from live data):
//  *
//  *  DealingAuthority  – Employee code of the COUNSELLOR for that student.
//  *                      Multiple counsellors exist (30922, 31859, 33333 …).
//  *                      NULL means no counsellor assigned yet.
//  *
//  *  DealingFaculty    – Employee code of the FACULTY the counsellor forwarded to.
//  *                      NULL until the counsellor explicitly forwards.
//  *
//  *  DealingHODId      – Fixed system-wide HOD code (28243).
//  *                      Non-null means the application has been sent to HOD.
//  *
//  *  DealingHow        – Fixed system-wide HoW code (12160).
//  *                      Non-null means the HOD has forwarded to HoW.
//  *
//  *  IsForwardtoHOD    – 1 when counsellor has forwarded to HOD.
//  *  IsForwardedtoHOW  – 1 when HOD has forwarded to HoW.
//  *  CounsellingStatus – 1 = counselled, 0 = not yet counselled.
//  *  CounsellingRemarks / CounsellingDate – set by counsellor.
//  */
// interface Application {
//   // Core identity
//   applicationId: string;
//   registrationNo: string;
//   studentName: string;
//   // Contact
//   phoneNumber: string;
//   whatsAppNo: string;
//   parentContact: string;
//   emailId: string;

//   // Status flags (raw values from DB — may be numeric string or boolean string)
//   isApproved: string;       // 1 / 0 / NULL
//   isLocked: string;
//   approvalRemarks: string;

//   // Counselling
//   counsellingStatus: string;    // 1 / 0
//   counsellingRemarks: string;
//   counsellingDate: string;

//   // Forwarding
//   isForwardtoHOD: string;       // 1 / NULL
//   isForwardedtoHOW: string;     // 1 / NULL

//   // Role columns
//   dealingAuthority: string;   // Counsellor emp code
//   dealingFaculty: string;     // Faculty emp code (NULL until forwarded)
//   dealingHODId: string;       // Fixed: 28243 (NULL until forwarded to HOD)
//   dealingHow: string;         // Fixed: 12160 (NULL until forwarded to HoW)

//   // HOD Tab XX extras (returned by GetSemesterExchangeApplicationForHOD)
//   countryName: string;
//   applyingOption: string;
//   universityOption1: string;
//   universityOption2: string;
//   universityOption3: string;

//   // ── Runtime flags set by enrichAndFilterApplications() ──────────────────
//   _isCounsellor: boolean;
//   _isFaculty: boolean;
//   _isHOD: boolean;
//   _isHoW: boolean;
// }

// /**
//  * Matches the remarks row returned by getAllRemarks().
//  * The HOD Tab XX data already embeds CounsellingRemarks inline.
//  * AllAuthorityRemarks covers evaluation and interview remarks.
//  */
// interface AuthorityRemarks {
//   registrationNo: string;
//   applicationId: string;

//   // Counsellor remarks
//   dealingUidRemarks: string;
//   counsellingRemarks: string;
//   counsellingStatus: string;
//   counsellingDate: string;

//   // Faculty interview remarks
//   dealingUserInterviewRemarks: string;
//   facultyRemarks: string;

//   // HOD remarks
//   dealingHODRemarks: string;
//   dealingHODInterviewRemarks: string;
//   hodRemarks: string;
//   isForwardtoHOD: string;

//   // HoW remarks
//   dealingHowRemarks: string;
//   howRemarks: string;
//   isForwardedtoHOW: string;

//   // Approval / rejection
//   ApprovalRemarks: string;

//   // Evaluation marks (HOD / HoW fill these)
//   academicsMarks: string;
//   communicationSkillsMarks: string;
//   attitudeMarks: string;
//   extraCurricularMarks: string;
//   knowledgeMarks: string;
//   totalMarks: string;
//   comments: string;
//   remarksBy: string;
// }

// /** Aggregated view of ALL remarks for one registration number. */
// interface AggregatedRemarks {
//   registrationNo: string;
//   applicationId: string;
//   // Counselling
//   counsellingRemarks: string;
//   counsellingDate: string;
//   counsellingDone: boolean;
//   // Faculty
//   facultyRemarks: string;
//   // HOD
//   hodRemarks: string;
//   forwardedToHOD: boolean;
//   // HoW
//   howRemarks: string;
//   forwardedToHoW: boolean;
//   // Approval
//   approvalRemarks: string;
//   // Evaluation
//   academicsMarks: string;
//   communicationSkillsMarks: string;
//   attitudeMarks: string;
//   extraCurricularMarks: string;
//   knowledgeMarks: string;
//   totalMarks: string;
//   evaluationComments: string;
//   evaluationBy: string;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// @Component({
//   selector: 'app-DynamicDashboard',
//   templateUrl: './DynamicDashboard.component.html',
//   styleUrls: ['../DashboardFaculty.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class DynamicDashboardComponent implements OnInit {

//   // ── UI / State ───────────────────────────────────────────────────────────────
//   pageTitle = 'Dashboard';
//   isLoginFailed = false;

//   /** Raw list from getAllApplications() */
//   AllApplications: Application[] = [];

//   /** Raw remarks list from getAllRemarks() */
//   AllAuthorityRemarks: AuthorityRemarks[] = [];

//   /**
//    * Applications shown in the single-grid dashboards
//    * (Counsellor / Faculty / HoW).
//    */
//   visibleApplications: Application[] = [];

//   /** HOD – Tab (X): Applications that have reached HOD review stage. */
//   hodMyApplications: Application[] = [];

//   /**
//    * HOD – Tab (XX): Full list from GetSemesterExchangeApplicationForHOD().
//    * Contains all applications with extended columns for overview.
//    */
//   hodAllApplications: Application[] = [];
//   AllApprovedApplications: Application[] = [];

//   /** Currently selected remarks object (bound to the View Remarks modal). */
//   selectedRemarks: AggregatedRemarks | null = null;

//   /**
//    * Role of the user who triggered viewAllRemarks().
//    * 'counsellor' → Evaluation section is HIDDEN in the modal  (req #3/#4)
//    * 'faculty' | 'hod' | 'how' → Evaluation section is SHOWN
//    */
//   selectedRemarksCallerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor';

//   /** Active tab for HOD view. */
//   hodActiveTab: 'my' | 'all' | 'allApproved' = 'my';

//   ColumnMode = ColumnMode;
//   loadingIndicator = false;
//   private readonly minLoadingTime = 1000;

//   // ── Forms ────────────────────────────────────────────────────────────────────
//   EvaluationForm!: FormGroup;
//   CounsellingRemarksForm!: FormGroup;
//   AddRemarksForm!: FormGroup;

//   // ── Global role flags ────────────────────────────────────────────────────────
//   isDealingAuthority = false;   // Counsellor
//   isdealingFaculty   = false;   // Faculty
//   isHOD              = false;
//   isHoW              = false;

//   // ── Employee info ────────────────────────────────────────────────────────────
//   EmployeeCode: string | null = null;
//   LoginName!: string;
//   EmployeeDetails: any;
//   EmployeeName: string | null = null;
//   ContactNoX: string | null = null;
//   DepartmentName: string | null = null;
//   UserRole: string | null = null;
//   Department: string | null = null;

//   // ── Form submission flags ────────────────────────────────────────────────────
//   isEvaluationFormSubmitted  = false;
//   isCounsellingFormSubmitted = false;
//   isAddRemarksFormSubmitted  = false;

//   // ── Selected row context (used by all modals) ────────────────────────────────
//   ApplicationId: string | null = null;
//   RegistrationNo: string | null = null;
//   RemarksBy: string | null = null;

//   // ── Modal refs ───────────────────────────────────────────────────────────────
//   @ViewChild('EvaluationModal')        EvaluationModal!: TemplateRef<any>;
//   @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;
//   @ViewChild('AddRemarksModal')        AddRemarksModal!: TemplateRef<any>;
//   @ViewChild('ViewRemarksModal')       ViewRemarksModal!: TemplateRef<any>;

//   private currentModalRef: NgbModalRef | null = null;

//   // ─────────────────────────────────────────────────────────────────────────────

//   constructor(
//     private fb: FormBuilder,
//     private cd: ChangeDetectorRef,
//     private authService: AuthService,
//     private storageService: StorageService,
//     private ServicesSM: SemesterExchangeStuDetailsService,
//     private studentService: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private modalService: NgbModal,
//     private mouDocumentsService: MouDocumentsService,
//     private title: Title
//   ) {}

//   // ── Lifecycle ─────────────────────────────────────────────────────────────────

//   ngOnInit(): void {
//     this.LoginName = this.route.snapshot.params['LoginName'];

//     const stMain = document.getElementById('stMain') as HTMLInputElement;
//     if (stMain) {
//       stMain.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
//     }
//     const imgLogo = document.getElementById('imgLogo') as HTMLImageElement;
//     if (imgLogo) imgLogo.style.width = '164px';

//     this.initializeForms();
//     this.getToken(this.LoginName);
//   }

//   // ── Form Init ─────────────────────────────────────────────────────────────────

//   private initializeForms(): void {
//     this.EvaluationForm = this.fb.group({
//       AcademicsMarks:           [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       AttitudeMarks:            [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       ExtraCurricularMarks:     [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       KnowledgeMarks:           [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       Comments: [''],
//     });

//     this.CounsellingRemarksForm = this.fb.group({
//       Comments: ['', Validators.required],
//     });

//     this.AddRemarksForm = this.fb.group({
//       Comments: ['', Validators.required],
//     });
//   }

//   // ── Auth / Bootstrap ──────────────────────────────────────────────────────────

//   private getToken(loginName: string): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.authService.loginTemp(loginName).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         const authToken = this.storageService.getUser();
//         if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
//           this.LoginFailed('Token Expired or Invalid Login');
//         } else {
//           this.isLoginFailed = false;
//           this.GetEmployeeDetails();
//         }
//       },
//       error: () => this.LoginFailed('Database Error'),
//     });
//   }

//   private GetEmployeeDetails(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.mouDocumentsService.GetEmployeeDetails().pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: response => {
//         if (response?.item1?.length > 0) {
//           const emp = response.item1[0];
//           this.EmployeeDetails  = emp;
//           this.EmployeeName     = emp.employeeName;
//           this.EmployeeCode     = '28243';// String(emp.employeeCode).trim();
//           this.ContactNoX       = emp.contactNo;
//           this.Department       = emp.department;
//           this.DepartmentName   = emp.departmentName;
//           this.UserRole         = emp.userRole;

//           // Fetch applications and remarks in parallel
//           this.getSEAllApplications();
//           this.getAllAuthorityRemarks();
//         } else {
//           this.LoginFailed('No employee details found.');
//         }
//       },
//       error: err => this.LoginFailed(err),
//     });
//   }

//   // ── Data Fetch ────────────────────────────────────────────────────────────────

//   private getSEAllApplications(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.getAllApplications().pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: response => {
//         this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
//         // console.log(JSON.stringify(this.AllApplications, null, 2));
//         this.enrichAndFilterApplications();
//       },
//       error: err => this.LoginFailed(err),
//     });
//   }

//   private getAllAuthorityRemarks(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.getAllRemarks().pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: response => {
//         this.AllAuthorityRemarks = Array.isArray(response?.item1) ? response.item1 : [];
//         this.cd.detectChanges();
//       },
//       error: err => this.LoginFailed(err),
//     });
//   }

//   /**
//    * HOD Tab (XX) — uses the dedicated endpoint
//    * GetSemesterExchangeApplicationForHOD() which returns ALL applications
//    * with extended columns (DealingAuthority, CounsellingRemarks, etc.).
//    * Called only once the HOD role is confirmed.
//    */
//   private GetAllApplicationsforHOD(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.getAllApplicationsforHOD().pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: response => {
//         this.hodAllApplications = Array.isArray(response?.item1) ? response.item1 : [];
//         // this.AllApprovedApplications =  response.item1.filter((app: { approvedUniversity: string | ''; }) => app.approvedUniversity?.length > 0) ;
//         this.AllApprovedApplications = this.hodAllApplications.filter( (app: any) => app.approvedUniversity && app.approvedUniversity.trim().length > 0 );
//         this.cd.detectChanges();
//       },
//       error: err => this.LoginFailed(err),
//     });
//   }

//   // ── Role Enrichment & Filtering ───────────────────────────────────────────────

//   /**
//    * ─── Column → Role mapping (confirmed from live API data) ───────────────────
//    *
//    *  DealingAuthority  – per-application Counsellor employee code.
//    *                      Multiple counsellors exist (30922, 31859, 33333 …).
//    *                      NULL = not yet assigned.
//    *
//    *  DealingFaculty    – per-application Faculty employee code.
//    *                      NULL until the counsellor forwards.
//    *
//    *  DealingHODId      – per-application HOD employee code.
//    *                      NOT a fixed system-wide code — confirmed values include
//    *                      22413, 28243, 31309. Set when isForwardtoHOD = true.
//    *
//    *  DealingHow        – per-application HoW employee code.
//    *                      NULL until HOD forwards to HoW.
//    *
//    * ─── Key insight from live data (empCode 31309) ─────────────────────────────
//    *
//    *  A single employee can hold MULTIPLE roles across different applications:
//    *    • App 2: DealingHODId = 31309  → HOD for that application
//    *    • App 3: DealingAuthority = 31309 AND DealingHODId = 31309
//    *             → Counsellor AND HOD for that application
//    *    • App 4: DealingHODId = 31309  → HOD for that application
//    *
//    *  The OLD winner-takes-all priority (HOD > HoW > Faculty > Counsellor)
//    *  caused the Faculty/Counsellor dashboard to never render because the
//    *  global isHOD flag was raised first, swallowing all other roles.
//    *
//    * ─── Fix: ALL role flags are independent booleans ───────────────────────────
//    *
//    *  Each flag is raised independently. buildVisibleApplications() and the HTML
//    *  template show EVERY dashboard for which the user has at least one row.
//    *  This means a user who is HOD on some apps AND Counsellor on others sees
//    *  BOTH the HOD section and the Counsellor section simultaneously.
//    *
//    * ─── Per-row filter rules (per requirements) ────────────────────────────────
//    *
//    *  Counsellor row  : DealingAuthority === empCode
//    *                    AND DealingHODId  !== empCode  (not acting as HOD on this row)
//    *                    AND DealingHow    !== empCode  (not acting as HoW on this row)
//    *
//    *  Faculty row     : DealingFaculty   === empCode
//    *                    AND DealingHODId  !== empCode
//    *                    AND DealingHow    !== empCode
//    *
//    *  HOD row         : DealingHODId     === empCode
//    *
//    *  HoW row         : DealingHow       === empCode
//    */
//   private enrichAndFilterApplications(): void {
//     this.AllApplications = this.AllApplications || [];

//     const emp = this.EmployeeCode ? this.EmployeeCode.trim() : null;

//     // Reset all global role flags
//     this.isHOD              = false;
//     this.isHoW              = false;
//     this.isdealingFaculty   = false;
//     this.isDealingAuthority = false;

//     this.AllApplications = this.AllApplications.map(app => {
//       const authority = this.normalise(app.dealingAuthority);
//       const faculty   = this.normalise(app.dealingFaculty);
//       const hodId     = this.normalise(app.dealingHODId);
//       const how       = this.normalise(app.dealingHow);

//       // ── Per-row flags ────────────────────────────────────────────────────────
//       app._isCounsellor =
//         emp !== null &&
//         authority === emp &&
//         hodId !== emp &&
//         how   !== emp;

//           // Faculty row: DealingFaculty === empCode
//   //              AND this row's HOD/HoW is someone else
//       app._isFaculty =
//         emp !== null &&
//         faculty === emp &&
//         authority !== emp &&
//         hodId !== emp &&
//         how   !== emp;

//       // HOD row: DealingHODId === empCode
//       app._isHOD = emp !== null && hodId === emp;

//       // HoW row: DealingHow === empCode
//       app._isHoW = emp !== null && how === emp;

    
//       // Counsellor row: DealingAuthority === empCode
//       //                 AND this row's HOD/HoW is someone else
//       //                 (if empCode IS the HOD for this row, that row shows in
//       //                  the HOD grid — not duplicated in Counsellor grid)
  

//       // Raise global flags independently — ALL matching roles are shown
//       if (app._isCounsellor) this.isDealingAuthority = true;
//       if (app._isFaculty)    this.isdealingFaculty   = true;
//       if (app._isHOD)        this.isHOD              = true;
//       if (app._isHoW)        this.isHoW              = true;

//       return app;
//     });

//     this.buildPageTitle();
//     this.buildVisibleApplications();
//     this.cd.detectChanges();
//   }

//   /**
//    * Trims a value and returns null if it is empty, 'NULL', 'null', or undefined.
//    */
//   private normalise(val: any): string | null {
//     if (val === null || val === undefined) return null;
//     const s = String(val).trim();
//     return (s === '' || s.toLowerCase() === 'null') ? null : s;
//   }

//   /**
//    * Populate display lists for EVERY role the user holds.
//    *
//    * Because a single employee can be HOD on some applications and Counsellor
//    * (or Faculty) on others, ALL four lists are populated independently.
//    * The HTML template renders each dashboard section conditionally — if the
//    * user has rows in more than one list, they see more than one section.
//    *
//    *  hodMyApplications   – rows where _isHOD  (shown in HOD Tab I)
//    *  hodAllApplications  – from dedicated API  (shown in HOD Tab II)
//    *  visibleApplications – union of _isHoW + _isFaculty + _isCounsellor rows
//    *                        (each role block in the template filters its own subset)
//    *
//    * The template uses *ngIf per role and filters [rows] inline so each grid
//    * only shows rows that belong to it.
//    */
//   private buildVisibleApplications(): void {
//     // HOD section — rows where DealingHODId === empCode
//     this.hodMyApplications = this.AllApplications.filter(a => a.isForwardtoHOD=='1' );
//     if (this.isHOD) {
//       this.GetAllApplicationsforHOD();
//     }

//     // Single visibleApplications list holds ALL non-HOD rows for this user.
//     // The template then filters per role using the per-row flags.
//     this.visibleApplications = this.AllApplications.filter(
//       a => a._isCounsellor || a._isFaculty || a._isHoW  
//     );
//   }
// private buildPageTitle(): void {
//   const roleMap: Record<string, string> = {
//     isDealingAuthority: 'Counsellor',
//     isHOD: 'HOD',
//     isHoW: 'HoW',
//     isdealingFaculty: 'Faculty'
//   };

//   // Find the first active role key where the component property evaluates to true
//   const activeRoleKey = Object.keys(roleMap).find(key => (this as any)[key]);
//   const roleName = activeRoleKey ? roleMap[activeRoleKey] : '';

//   this.pageTitle = roleName ? `** ${roleName} Dashboard **` : 'Dashboard';
//   this.title.setTitle(this.pageTitle);
// }
//   // private buildPageTitle(): void {
//   //   var roles: any='';
//   //   if (this.isDealingAuthority) roles='Counsellor';
//   //   if (this.isHOD)             roles='HOD';
//   //   if (this.isHoW)              roles='HoW';    
//   //   if (this.isdealingFaculty)   roles='Faculty';

//   //   this.pageTitle = roles.length
//   //     ? `** ${roles} Dashboard **`
//   //     : 'Dashboard';
//   //   this.title.setTitle(this.pageTitle);
//   // }

//   // ── HOD Tab Switching ─────────────────────────────────────────────────────────

//   switchHodTab(tab: 'my' | 'all'| 'allApproved'): void {
//     this.hodActiveTab = tab;
//     this.cd.detectChanges();
//   }

//   // ── Navigation ────────────────────────────────────────────────────────────────

//   GetStudentApplication(application: Application): void {
//     if (this.LoginName && application.registrationNo) {
//       this.router.navigateByUrl(
//         `ApplicationDetails/${this.LoginName}/${application.registrationNo}/Faculty`
//       );
//     } else {
//       Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
//     }
//   }

//   // ── Accept / Reject ───────────────────────────────────────────────────────────

//   acceptApplication(application: Application): void {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you want to accept this application?',
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, Accept!',
//       cancelButtonText: 'No, Cancel',
//     }).then(result => {
//       if (result.isConfirmed) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('Action', 'Accept');
//         this.handleStatusChange(fd, 'Accept');
//       }
//     });
//   }

//   disapproveApplication(application: Application): void {
//     Swal.fire({
//       title: 'Reason for Disapproval',
//       input: 'text',
//       inputPlaceholder: 'Enter reason here...',
//       showCancelButton: true,
//       confirmButtonText: 'Submit',
//       showLoaderOnConfirm: true,
//       preConfirm: reason => {
//         if (!reason) Swal.showValidationMessage('Reason is required!');
//         return reason;
//       },
//       allowOutsideClick: () => !Swal.isLoading(),
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('ApprovalRemarks', result.value);
//         fd.append('Action', 'Disapprove');
//         this.handleStatusChange(fd, 'Disapprove');
//       }
//     });
//   }

//   private handleStatusChange(formData: FormData, action: string): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.SendApproveRequest(formData).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const msg = data?.item1?.[0]?.msg;
//         if (msg === 'Approved') {
//           Swal.fire('Success!', `Application ${action}ed successfully!`, 'success')
//             .then(() => this.getSEAllApplications());
//         } else if (msg === 'Disapproved') {
//           Swal.fire('No Change!', 'The application status was not changed.', 'info');
//         } else {
//           Swal.fire('Error!', `Failed to ${action} application.`, 'error');
//         }
//       },
//       error: () => Swal.fire('Error!', `An error occurred while trying to ${action} the application.`, 'error'),
//     });
//   }

//   // ── Forwarding ────────────────────────────────────────────────────────────────

//   ForwardToFaculty(application: Application): void {
//     Swal.fire({
//       title: 'Forward to Faculty',
//       input: 'text',
//       inputPlaceholder: 'Enter Faculty Employee Code...',
//       showCancelButton: true,
//       confirmButtonText: 'Forward',
//       showLoaderOnConfirm: true,
//       preConfirm: uid => {
//         if (!uid) Swal.showValidationMessage('Faculty Employee Code is required!');
//         return uid;
//       },
//       allowOutsideClick: () => !Swal.isLoading(),
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('HODUID', result.value);
//         fd.append('UserAction', 'Faculty');
//         this.sendForwardRequest(fd);
//       }
//     });
//   }
// ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
//   const label = userAction === 'Hod' ? 'HOD' : 'Head of Wing';
//   const staticUid = '28243'; // Hardcoded fallback processor code

//   Swal.fire({
//     title: `Forward to ${label}`,
//     text: `Are you sure you want to forward this application to the designated ${label}?`,
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, Forward',
//     cancelButtonText: 'Cancel',
//     allowOutsideClick: () => !Swal.isLoading()
//   }).then(result => {
//     if (result.isConfirmed) {
//       const fd = new FormData();
//       fd.append('RegistrationNo', application.registrationNo);
//       fd.append('HODUID', staticUid); // Automatically injects the static tracking value
//       fd.append('UserAction', userAction);
      
//       this.sendForwardRequest(fd);
//     }
//   });
// }
//   // ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
//   //   const label = userAction === 'Hod' ? 'HOD' : 'Head of Wing';
//   //   Swal.fire({
//   //     title: `Forward to ${label}`,
//   //     input: 'text',
//   //     inputPlaceholder: `Enter ${label} Employee Code...`,
//   //     showCancelButton: true,
//   //     confirmButtonText: 'Forward',
//   //     showLoaderOnConfirm: true,
//   //     preConfirm: uid => {
//   //       if (!uid) Swal.showValidationMessage('Employee Code is required!');
//   //       return uid;
//   //     },
//   //     allowOutsideClick: () => !Swal.isLoading(),
//   //   }).then(result => {
//   //     if (result.isConfirmed && result.value) {
//   //       const fd = new FormData();
//   //       fd.append('RegistrationNo', application.registrationNo);
//   //       fd.append('HODUID', result.value);
//   //       fd.append('UserAction', userAction);
//   //       this.sendForwardRequest(fd);
//   //     }
//   //   });
//   // }

//   private sendForwardRequest(formData: FormData): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.SendForwardRequest(formData).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         if (data?.item1?.[0]?.msg === 'Success') {
//           Swal.fire('Success!', 'Action Applied!', 'success').then(() => this.getSEAllApplications());
//         } else {
//           Swal.fire('Failed!', 'Action Failed!', 'error').then(() => this.getSEAllApplications());
//         }
//       },
//       error: () => Swal.fire('Error!', 'An error occurred while forwarding the application.', 'error'),
//     });
//   }

//   // ── HOD: Assign Counsellor (Tab XX) ──────────────────────────────────────────

//   assignCounsellor(application: Application): void {
//     Swal.fire({
//       title: 'Assign Counsellor',
//       text: `Application ${application.applicationId} — Registration: ${application.registrationNo}`,
//       input: 'text',
//       inputPlaceholder: 'Enter Counsellor Employee Code...',
//       showCancelButton: true,
//       confirmButtonText: 'Assign',
//       showLoaderOnConfirm: true,
//       preConfirm: code => {
//         if (!code) Swal.showValidationMessage('Counsellor Employee Code is required!');
//         return code;
//       },
//       allowOutsideClick: () => !Swal.isLoading(),
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('ApplicationId', application.applicationId);
//         fd.append('HODUID', result.value);
//         fd.append('UserAction', 'AssignCounsellor');
//         this.sendForwardRequest(fd);
//       }
//     });
//   }
//   assignFaculty(application: Application): void {
//     Swal.fire({
//       title: 'Assign Faculty',
//       text: `Application ${application.applicationId} — Registration: ${application.registrationNo}`,
//       input: 'text',
//       inputPlaceholder: 'Enter Faculty Employee Code...',
//       showCancelButton: true,
//       confirmButtonText: 'Assign',
//       showLoaderOnConfirm: true,
//       preConfirm: code => {
//         if (!code) Swal.showValidationMessage('Faculty Employee Code is required!');
//         return code;
//       },
//       allowOutsideClick: () => !Swal.isLoading(),
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('ApplicationId', application.applicationId);
//         fd.append('HODUID', result.value);
//         fd.append('UserAction', 'Faculty');
//         this.sendForwardRequest(fd);
//       }
//     });
//   }

//   // ── Evaluation Remarks ────────────────────────────────────────────────────────

//   UploadEvaluationRemarks(application: Application, remarksBy: string): void {
//     this.RegistrationNo = application.registrationNo;
//     this.ApplicationId  = application.applicationId;
//     this.RemarksBy      = remarksBy;

//     this.EvaluationForm.reset();
//     this.isEvaluationFormSubmitted = false;

//     this.currentModalRef = this.modalService.open(this.EvaluationModal, {
//       size: 'lg', backdrop: 'static', keyboard: false,
//     });
//     this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
//     this.cd.detectChanges();
//   }

//   submitEvaluationForm(): void {
//     this.isEvaluationFormSubmitted = true;
//     if (this.EvaluationForm.invalid) {
//       Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
//       return;
//     }

//     this.loadingIndicator = true;
//     const startTime = Date.now();
//     const v = this.EvaluationForm.value;
//     const total = +v.AcademicsMarks + +v.CommunicationSkillsMarks +
//                   +v.AttitudeMarks  + +v.ExtraCurricularMarks + +v.KnowledgeMarks;

//     const fd = new FormData();
//     fd.append('RegistrationNo',           this.RegistrationNo || '');
//     fd.append('AcademicsMarks',           v.AcademicsMarks);
//     fd.append('CommunicationSkillsMarks', v.CommunicationSkillsMarks);
//     fd.append('AttitudeMarks',            v.AttitudeMarks);
//     fd.append('ExtraCurricularMarks',     v.ExtraCurricularMarks);
//     fd.append('KnowledgeMarks',           v.KnowledgeMarks);
//     fd.append('TotalMarks',               total.toString());
//     fd.append('Comments',                 v.Comments || '');
//     fd.append('RemarksBy',               this.RemarksBy || 'Unknown');
//     fd.append('DealingUId',               this.EmployeeCode || 'Unknown');

//     this.ServicesSM.StudentEvalutionAddNew(fd).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const code = data?.item1?.[0]?.returnData;
//         if (code > 0) {
//           Swal.fire('Success!', 'Evaluation Marks Updated Successfully', 'success')
//             .then(() => this.currentModalRef?.close());
//         } else if (code === '-1') {
//           Swal.fire('Info', 'Evaluation Marks Already Uploaded', 'info')
//             .then(() => this.currentModalRef?.close());
//         }
//       },
//       error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
//     });
//   }

//   // ── Counselling Remarks (Counsellor submits) ──────────────────────────────────

//   submitCounsellingRemarks(application: Application): void {
//     this.RegistrationNo = application.registrationNo;
//     this.ApplicationId  = application.applicationId;

//     this.CounsellingRemarksForm.reset();
//     this.isCounsellingFormSubmitted = false;

//     // Pre-fill if already counselled
//     if (this.isTrue(application.counsellingStatus) && application.counsellingRemarks) {
//       this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
//     }

//     this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, {
//       size: 'lg', backdrop: 'static', keyboard: false,
//     });
//     this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
//     this.cd.detectChanges();
//   }

//   submitCounsellingRemarksForm(): void {
//     this.isCounsellingFormSubmitted = true;
//     if (this.CounsellingRemarksForm.invalid) {
//       Swal.fire('Validation Error', 'Please enter your counselling remarks.', 'error');
//       return;
//     }

//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     /**
//      * SP: pUpdateSECounsellingRemarks
//      * Action = 'Counsellor' → routes to CounsellingRemarks column.
//      * The SP appends server-side: ISNULL(CounsellingRemarks,'') + @FormattedRemarks
//      * where @FormattedRemarks includes a timestamp + LoginName header.
//      * Frontend sends ONLY the new text — no client-side concatenation needed.
//      * Success response: { Msg: 'Success', ReturnId: '<ApplicationId>' }
//      * Failure response: { Msg: 'Failed: ...', ReturnId: -1 }
//      */
//     const fd = new FormData();
//     fd.append('ApplicationId',      this.ApplicationId  || '');
//     fd.append('CounsellingRemarks', this.CounsellingRemarksForm.value.Comments.trim());
//     fd.append('Action',             'Counsellor');

//     this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const msg = data?.item1?.[0]?.msg ?? data?.item1?.[0]?.Msg;
//         if (msg === 'Success') {
//           Swal.fire('Success!', 'Counselling Remarks Saved Successfully', 'success')
//             .then(() => this.currentModalRef?.close());
//         } else {
//           Swal.fire('Error!', msg || 'Some Technical Issue Occurred', 'error');
//         }
//       },
//       error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
//     });
//   }

//   // ── Faculty: Add Remarks ──────────────────────────────────────────────────────

//   openAddRemarksModal(application: Application): void {
//     this.RegistrationNo = application.registrationNo;
//     this.ApplicationId  = application.applicationId;

//     this.AddRemarksForm.reset();
//     this.isAddRemarksFormSubmitted = false;

//     this.currentModalRef = this.modalService.open(this.AddRemarksModal, {
//       size: 'lg', backdrop: 'static', keyboard: false,
//     });
//     this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => {});
//     this.cd.detectChanges();
//   }

//   submitAddRemarksForm(): void {
//     this.isAddRemarksFormSubmitted = true;
//     if (this.AddRemarksForm.invalid) {
//       Swal.fire('Validation Error', 'Please enter your remarks.', 'error');
//       return;
//     }

//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     /**
//      * SP: pUpdateSECounsellingRemarks
//      * Action = 'Faculty' → routes to DealingUidRemarks column.
//      * The SP appends server-side with a timestamp + LoginName header:
//      *   DealingUidRemarks = ISNULL(DealingUidRemarks,'') + @FormattedRemarks
//      * Frontend sends ONLY the new text — the SP owns the append logic.
//      * Success response: { Msg: 'Success', ReturnId: '<ApplicationId>' }
//      * Failure response: { Msg: 'Failed: ...', ReturnId: -1 }
//      */
//     const fd = new FormData();
//     fd.append('ApplicationId',      this.ApplicationId  || '');
//     fd.append('CounsellingRemarks', this.AddRemarksForm.value.Comments.trim());
//     fd.append('Action',             'Faculty');

//     this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const msg = data?.item1?.[0]?.msg ?? data?.item1?.[0]?.Msg;
//         if (msg === 'Success') {
//           Swal.fire('Success!', 'Remarks Saved Successfully', 'success')
//             .then(() => this.currentModalRef?.close());
//         } else {
//           // Display the SP failure message directly so the user knows what went wrong
//           Swal.fire('Error!', msg || 'Some Technical Issue Occurred', 'error');
//         }
//       },
//       error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
//     });
//   }

//   // ── Unified View Remarks Modal ────────────────────────────────────────────────

//   /**
//    * Builds AggregatedRemarks for the selected row by joining on RegistrationNo
//    * across AllAuthorityRemarks (and the inline counselling fields on the row),
//    * then opens the unified View Remarks modal.
//    *
//    * All remark types shown in one modal:
//    *   – Counselling Remarks (from counsellor, date included)
//    *   – Faculty / Interview Remarks
//    *   – HOD Remarks
//    *   – HoW Remarks
//    *   – Approval / Rejection Remarks
//    *   – Evaluation Marks breakdown
//    */
//   /**
//    * Opens the unified View Remarks modal.
//    *
//    * @param row        The application row that was clicked.
//    * @param callerRole Role of the user opening the modal:
//    *                   'counsellor' → Evaluation Marks section is hidden  (req #3/#4)
//    *                   'faculty' | 'hod' | 'how' → Evaluation Marks are shown
//    */
//   viewAllRemarks(
//     row: Application,
//     callerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor'
//   ): void {
//     this.selectedRemarksCallerRole = callerRole;

//     // Find the matching remarks row (may be undefined for new applications)
//     const r = this.AllAuthorityRemarks.find(
//       x => x.registrationNo === row.registrationNo
//     );

//     this.selectedRemarks = {
//       registrationNo: row.registrationNo,
//       applicationId:  row.applicationId,

//       // Counselling — inline on the application row AND in remarks table
//       counsellingRemarks: r?.counsellingRemarks || row.counsellingRemarks || '',
//       counsellingDate:    r?.counsellingDate    || row.counsellingDate    || '',
//       counsellingDone:    this.isTrue(r?.counsellingStatus ?? row.counsellingStatus),

//       // Faculty interview remarks
//       facultyRemarks:
//         r?.dealingUserInterviewRemarks || r?.facultyRemarks || '',

//       // HOD remarks
//       hodRemarks:      r?.dealingHODRemarks || r?.hodRemarks || r?.dealingHODInterviewRemarks || '',
//       forwardedToHOD:  this.isTrue(r?.isForwardtoHOD  ?? row.isForwardtoHOD),

//       // HoW remarks
//       howRemarks:     r?.dealingHowRemarks || r?.howRemarks || '',
//       forwardedToHoW: this.isTrue(r?.isForwardedtoHOW ?? row.isForwardedtoHOW),

//       // Approval / rejection
//       approvalRemarks: r?.ApprovalRemarks || row.approvalRemarks || '',

//       // Evaluation
//       academicsMarks:           r?.academicsMarks           || '',
//       communicationSkillsMarks: r?.communicationSkillsMarks || '',
//       attitudeMarks:            r?.attitudeMarks            || '',
//       extraCurricularMarks:     r?.extraCurricularMarks     || '',
//       knowledgeMarks:           r?.knowledgeMarks           || '',
//       totalMarks:               r?.totalMarks               || '',
//       evaluationComments:       r?.comments                 || '',
//       evaluationBy:             r?.remarksBy                || '',
//     } as any;

//     this.currentModalRef = this.modalService.open(this.ViewRemarksModal, {
//       size: 'xl', backdrop: 'static', keyboard: false,
//     });
//     this.currentModalRef.result.catch(() => {});
//     this.cd.detectChanges();
//   }

//   /** Returns true if any remark type has content for this row. */
//   hasAnyRemarks(row: Application): boolean {
//     const r = this.AllAuthorityRemarks.find(x => x.registrationNo === row.registrationNo);
//     return !!(
//       row.counsellingRemarks ||
//       r?.counsellingRemarks ||
//       r?.dealingUserInterviewRemarks || r?.facultyRemarks ||
//       r?.dealingHODRemarks || r?.hodRemarks ||
//       r?.dealingHowRemarks || r?.howRemarks ||
//       r?.ApprovalRemarks ||
//       row.approvalRemarks ||
//       r?.academicsMarks
//     );
//   }

//   // ── Helpers ───────────────────────────────────────────────────────────────────

//   /**
//    * Normalises truthy DB values: 1, '1', 'True', true → true.
//    */
//   isTrue(val: any): boolean {
//     if (val === null || val === undefined) return false;
//     const s = String(val).trim().toLowerCase();
//     return s === '1' || s === 'true';
//   }

//   /** Converts isApproved (1/0/NULL) to a human label. */
//   approvalLabel(val: string): string {
//     if (this.isTrue(val)) return 'Approved';
//     if (val === '0' || val === 'False' || val === 'false') return 'Rejected';
//     return 'Pending';
//   }

//   approvalClass(val: string): string {
//     if (this.isTrue(val))                                   return 'bg-success';
//     if (val === '0' || val === 'False' || val === 'false') return 'bg-danger';
//     return 'bg-warning text-dark';
//   }

//   counsellingLabel(val: string): string {
//     return this.isTrue(val) ? 'Counselled' : 'Pending';
//   }

//   private stopLoader(startTime: number): void {
//     const elapsed = Date.now() - startTime;
//     setTimeout(() => {
//       this.loadingIndicator = false;
//       this.cd.detectChanges();
//     }, Math.max(this.minLoadingTime - elapsed, 0));
//   }

//   // ── Form Control Getters ──────────────────────────────────────────────────────

//   get evaluationFormControls()       { return this.EvaluationForm.controls; }
//   get counsellingRemarksFormControls(){ return this.CounsellingRemarksForm.controls; }
//   get addRemarksFormControls()       { return this.AddRemarksForm.controls; }

//   // ── Error Helper ──────────────────────────────────────────────────────────────

//   private LoginFailed(error: any): void {
//     this.isLoginFailed = true;
//     Swal.fire({ title: 'Login Failed', text: 'Login details are invalid', icon: 'warning' });
//     const el = document.getElementById('DealingUserDashboardId');
//     if (el) el.hidden = true;
//     this.cd.detectChanges();
//   }
// }
