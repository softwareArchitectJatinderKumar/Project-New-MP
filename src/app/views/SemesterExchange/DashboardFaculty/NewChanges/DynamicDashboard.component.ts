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

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Application {
  applicationId: string;
  registrationNo: string;
  phoneNumber: string;
  whatsAppNo: string;
  parentContact: string;
  counsellingStatus: string;
  isApproved: string;
  dealingUId: string;
  dealingUserInterviewRemarks: string;
  dealingHODId: string;
  dealingHODRemarks: string;
  dealingHow: string;
  dealingFaculty: string;
  dealingAuthority: string;
  counsellingRemarks: string;
  // Counsellor assignment (used in HOD XX tab)
  assignedCounsellorId: string | null;
  // Forwarding status (used in HOD XX tab)
  isForwarded: string;
  // Student name (used in HOD XX tab)
  studentName: string;
  // Per-row role flags (set by enrichAndFilterApplications)
  isdealingFaculty: boolean;
  isDealingAuthority: boolean;
  isHOD: boolean;
  isHoW: boolean;
}

interface AuthorityRemarks {
  applicationId: string;
  registrationNo: string;
  dealingUidRemarks: string;
  dealingHODRemarks: string;
  dealingHowRemarks: string;
  dealingHODInterviewRemarks: string;
  dealingUserInterviewRemarks: string;
  facultyRemarks: string;
  hodRemarks: string;
  howRemarks: string;
  ApprovalRemarks: string;
  isForwardtoHOD: string;
  isForwardedtoHOW: string;
  counsellingRemarks: string;
  counsellingStatus: string;
  counsellingDate: string;
  academicsMarks: string;
  attitudeMarks: string;
  communicationSkillsMarks: string;
  comments: string;
  extraCurricularMarks: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-DynamicDashboard',
  templateUrl: './DynamicDashboard.component.html',
  styleUrls: ['../DashboardFaculty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicDashboardComponent implements OnInit {

  // ── UI / State ──────────────────────────────────────────────────────────────
  pageTitle = 'Dashboard';
  isLoginFailed = false;
  AllApplications: Application[] = [];
  AllAuthorityRemarks: AuthorityRemarks[] = [];

  /** Applications rendered in the main (single-role) grid. */
  visibleApplications: Application[] = [];

  /**
   * HOD – Tab (X) "My Applications":
   * rows where the logged-in user is the dealing HOD.
   */
  hodMyApplications: Application[] = [];

  /**
   * HOD – Tab (XX) "All Applications":
   * all applications in the system (for counsellor assignment / overview).
   */
  hodAllApplications: Application[] = [];

  /** Active tab for HOD view: 'my' | 'all' */
  hodActiveTab: 'my' | 'all' = 'my';

  ColumnMode = ColumnMode;
  loadingIndicator = false;
  private minLoadingTime = 1000;

  // ── Forms ───────────────────────────────────────────────────────────────────
  EvaluationForm!: FormGroup;
  CounsellingRemarksForm!: FormGroup;
  AddRemarksForm!: FormGroup; // Faculty – Add Remarks / Comments

  // ── Role flags (global – true if the user has that role in ANY application) ─
  isdealingFaculty = false;
  isDealingAuthority = false;
  isHOD = false;
  isHoW = false;

  // ── Employee Info ────────────────────────────────────────────────────────────
  EmployeeCode: string | null = null;
  LoginName!: string;
  EmployeeDetails: any;
  EmployeeName: string | null = null;
  ContactNoX: string | null = null;
  DepartmentName: string | null = null;
  UserRole: string | null = null;
  Department: string | null = null;

  // ── Evaluation helpers ───────────────────────────────────────────────────────
  isEvaluationFormSubmitted = false;
  isCounsellingFormSubmitted = false;
  isAddRemarksFormSubmitted = false;

  ApplicationId: string | null = null;
  RegistrationNo: string | null = null;
  RemarksBy: string | null = null;

  evaluationDataMap: Map<string, any> = new Map();
  evaluationLoadingMap: Map<string, boolean> = new Map();
  evaluationData: any;

  // ── Modal refs ───────────────────────────────────────────────────────────────
  @ViewChild('EvaluationModal') EvaluationModal!: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;
  @ViewChild('AddRemarksModal') AddRemarksModal!: TemplateRef<any>;

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

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];

    const stMainElement = document.getElementById('stMain') as HTMLInputElement;
    if (stMainElement) {
      stMainElement.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
    }
    const imgLogoElement = document.getElementById('imgLogo') as HTMLImageElement;
    if (imgLogoElement) {
      imgLogoElement.style.width = '164px';
    }

    this.initializeForms();
    this.getToken(this.LoginName);
  }

  // ── Form Init ────────────────────────────────────────────────────────────────

  private initializeForms(): void {
    this.EvaluationForm = this.fb.group({
      AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      Comments: [''],
    });

    this.CounsellingRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });

    // Faculty – Add Remarks / Comments form
    this.AddRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });
  }

  // ── Auth / Bootstrap ──────────────────────────────────────────────────────────

  private getToken(loginName: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.authService.loginTemp(loginName).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.isLoginFailed = true;
          this.LoginFailed('Token Expired or Invalid Login');
        } else {
          this.isLoginFailed = false;
          this.GetEmployeeDetails();
          this.getAllAuthorityRemarks();
        }
      },
      error: () => {
        this.isLoginFailed = true;
        this.LoginFailed('Database Error');
      },
    });
  }

  private GetEmployeeDetails(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.mouDocumentsService.GetEmployeeDetails().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: response => {
        if (response && response.item1 && response.item1.length > 0) {
          const employee = response.item1[0];
          this.EmployeeDetails = employee;
          this.EmployeeName = employee.employeeName;
          this.EmployeeCode = '31859';// String(employee.employeeCode).trim();
          this.ContactNoX = employee.contactNo;
          this.Department = employee.department;
          this.DepartmentName = employee.departmentName;
          this.UserRole = employee.userRole;

          this.getSEAllApplications();
          this.getAllAuthorityRemarks();
        } else {
          this.EmployeeDetails = [];
          this.isLoginFailed = true;
          this.LoginFailed('No employee details found.');
        }
      },
      error: err => {
        this.LoginFailed(err);
      },
    });
  }

  // ── Data Fetch ───────────────────────────────────────────────────────────────

  private getSEAllApplications(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplicationsforHOD().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: response => {
        this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
        this.enrichAndFilterApplications();
      },
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed(err);
      },
    });
  }

  private getAllAuthorityRemarks(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllRemarks().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: response => {
        this.AllAuthorityRemarks = Array.isArray(response?.item1) ? response.item1 : [];
      },
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed(err);
      },
    });
  }

  /**
   * Fetches all applications for the HOD Tab (XX) overview grid.
   * Uses a separate endpoint so the data set is independent of the
   * role-filtered getAllApplications response.
   * Called automatically from buildVisibleApplications() once the HOD
   * role is confirmed.
   */
  private GetAllApplicationsforHOD(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplicationsforHOD().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: response => {
        this.hodAllApplications = Array.isArray(response?.item1) ? response.item1 : [];
        this.cd.detectChanges();
      },
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed(err);
      },
    });
  }

  // ── Role Enrichment & Filtering ──────────────────────────────────────────────

  /**
   * ─── How roles map to the data ───────────────────────────────────────────────
   *
   *  DealingAuthority  – per-application employee code of the COUNSELLOR
   *                      assigned to counsel that student.
   *                      A counsellor sees only the rows where their code appears here.
   *
   *  DealingFaculty    – per-application employee code of the FACULTY the
   *                      counsellor forwarded to.  NULL until forwarded.
   *                      A faculty member sees only the rows where their code appears here.
   *
   *  DealingHODId      – FIXED system-wide code (28243).
   *                      There is one HOD for the whole module. Any row whose
   *                      DealingHODId is non-null has been sent to HOD review.
   *                      The HOD user always sees ALL such rows (Tab X) and the
   *                      full application list (Tab XX via dedicated API).
   *
   *  DealingHow        – FIXED system-wide code (12160).
   *                      There is one HoW for the whole module.  NULL until the
   *                      HOD forwards the application onward.
   *                      The HoW user sees every row where DealingHow is non-null.
   *
   * Role detection strategy
   * ───────────────────────
   *  HOD and HoW are identified by comparing EmployeeCode against the two
   *  known fixed constants — NOT by scanning per-row column values (which
   *  would be unreliable because every HOD row contains the same fixed code).
   *
   *  Counsellor and Faculty ARE identified per-row because multiple counsellors
   *  and faculties can exist simultaneously with different codes.
   *
   *  Priority (applied once after employee details load):
   *    1. HOD   (empCode === HOD_CODE)
   *    2. HoW   (empCode === HOW_CODE)
   *    3. Faculty   (empCode appears in any row's DealingFaculty column)
   *    4. Counsellor (empCode appears in any row's DealingAuthority column)
   */

  /** Fixed system-wide HOD employee code. */
  private readonly HOD_CODE = '28243';

  /** Fixed system-wide HoW employee code. */
  private readonly HOW_CODE = '12160';

  private enrichAndFilterApplications(): void {
    if (!this.AllApplications) {
      this.AllApplications = [];
    }
    console.log(JSON.stringify(this.AllApplications) + ' all applications');
    const empCode = this.EmployeeCode ? this.EmployeeCode.trim() : null;

    // ── Step 1: Detect the global role from the fixed constants first ──────────
    this.isHOD            = empCode === this.HOD_CODE;
    this.isHoW            = empCode === this.HOW_CODE;
    this.isdealingFaculty = false;
    this.isDealingAuthority = false;

    // ── Step 2: Per-row enrichment ─────────────────────────────────────────────
    this.AllApplications = this.AllApplications.map((application: Application) => {
      const dealingFaculty   = application.dealingFaculty
        ? String(application.dealingFaculty).trim() : null;
      const dealingAuthority = application.dealingAuthority
        ? String(application.dealingAuthority).trim() : null;

      // HOD / HoW rows carry the fixed codes — mark every row accordingly so
      // the template can still use per-row flags for badge rendering if needed.
      application.isHOD = !!application.dealingHODId;   // true = sent to HOD review
      application.isHoW = !!application.dealingHow;      // true = forwarded to HoW

      // Per-row Counsellor / Faculty flags
      application.isDealingAuthority =
        empCode !== null && dealingAuthority === empCode;
      application.isdealingFaculty =
        empCode !== null && dealingAuthority === empCode;

      // Raise global flags for Counsellor & Faculty by scanning rows
      if (application.isDealingAuthority) this.isDealingAuthority = true;
      if (application.isdealingFaculty)   this.isdealingFaculty   = true;
      if (application.isHOD)   this.isHOD   = true;
      if (application.isHoW)   this.isHoW   = true;

      return application;
    });

    this.buildPageTitle();
    this.buildVisibleApplications();
    this.cd.detectChanges();
  }

  /**
   * Partition applications into the correct display lists per role.
   *
   *  Counsellor   → rows where DealingAuthority === empCode
   *  Faculty      → rows where DealingFaculty   === empCode
   *  HOD (Tab X)  → rows where DealingHODId is non-null (sent to HOD review)
   *  HOD (Tab XX) → dedicated API (GetAllApplicationsforHOD)
   *  HoW          → rows where DealingHow is non-null (forwarded to HoW)
   */
  private buildVisibleApplications(): void {
   
    if (this.isHOD) {
      // Tab X – all applications that have reached HOD review stage
      this.hodMyApplications = this.AllApplications.filter(
        a => a.dealingHODId !== null && a.dealingHODId !== undefined && String(a.dealingHODId).trim() !== ''
      );
      // Tab XX – dedicated API so it is not limited to the HOD-filtered set
      this.GetAllApplicationsforHOD();
      this.visibleApplications = this.hodMyApplications;

    } else if (this.isHoW) {
      // HoW sees rows that have been explicitly forwarded to HoW (DealingHow is set)
      this.visibleApplications = this.AllApplications.filter(
        a => a.dealingHow !== null && a.dealingHow !== undefined && String(a.dealingHow).trim() !== ''
      );

    } else if (this.isdealingFaculty) {
      // Faculty sees only their own rows (DealingFaculty === empCode)
      this.visibleApplications = this.AllApplications.filter(a => a.isdealingFaculty);

    } else if (this.isDealingAuthority) {
      // Counsellor sees only their own rows (DealingAuthority === empCode)
      this.visibleApplications = this.AllApplications.filter(a => a.isDealingAuthority);

    } else {
      // No recognised role — show nothing (avoids leaking data to unknown users)
      this.visibleApplications = [];
    }
  }

  private buildPageTitle(): void {
    let roleTitle = '';
    if      (this.isHOD)              roleTitle = 'Head of Department';
    else if (this.isHoW)              roleTitle = 'Head of Wing';
    else if (this.isdealingFaculty)   roleTitle = 'Dealing Faculty';
    else if (this.isDealingAuthority) roleTitle = 'Counsellor';

    this.pageTitle = roleTitle ? `** ${roleTitle} Dashboard **` : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  // ── HOD Tab Switching ────────────────────────────────────────────────────────

  switchHodTab(tab: 'my' | 'all'): void {
    this.hodActiveTab = tab;
    this.cd.detectChanges();
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  GetStudentApplication(application: Application): void {
    if (this.LoginName && application.registrationNo) {
      this.router.navigateByUrl(
        `ApplicationDetails/${this.LoginName}/${application.registrationNo}/Faculty`
      );
    } else {
      Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
    }
  }

  // ── Accept / Reject ──────────────────────────────────────────────────────────

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
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('Action', 'Accept');
        this.handleStatusChange(formData, 'Accept');
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
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('ApprovalRemarks', result.value);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      }
    });
  }

  private handleStatusChange(formData: FormData, action: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.SendApproveRequest(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: (data: any) => {
        if (data.item1?.[0]?.msg === 'Approved') {
          Swal.fire('Success!', `Application ${action}ed successfully!`, 'success').then(() =>
            this.getSEAllApplications()
          );
        } else if (data.item1?.[0]?.msg === 'Disapproved') {
          Swal.fire('No Change!', 'The application status was not changed.', 'info');
        } else {
          Swal.fire('Error!', `Failed to ${action} application.`, 'error');
        }
      },
      error: () => {
        Swal.fire('Error!', `An error occurred while trying to ${action} the application.`, 'error');
      },
    });
  }

  // ── Forwarding ───────────────────────────────────────────────────────────────

  ForwardToFaculty(application: Application): void {
    Swal.fire({
      title: 'Forward to Faculty (Enter Faculty UID)',
      input: 'text',
      inputPlaceholder: 'Enter Faculty User ID...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: uid => {
        if (!uid) Swal.showValidationMessage('Faculty User ID is required!');
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('FacultyUID', result.value);
        formData.append('UserAction', 'Faculty');
        this.sendForwardRequest(formData);
      }
    });
  }

  ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
    const title =
      userAction === 'Hod'
        ? 'Forward to HOD (Enter HOD UID)'
        : 'Forward to HoW (Enter HoW UID)';

    Swal.fire({
      title,
      input: 'text',
      inputPlaceholder: 'Enter User ID...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: uid => {
        if (!uid) Swal.showValidationMessage('User ID is required!');
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('HODUID', result.value);
        formData.append('UserAction', userAction);
        this.sendForwardRequest(formData);
      }
    });
  }

  private sendForwardRequest(formData: FormData): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.SendForwardRequest(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: (data: any) => {
        if (data.item1?.[0]?.msg === 'Success') {
          Swal.fire('Success!', 'Action Applied!', 'success').then(() =>
            this.getSEAllApplications()
          );
        } else {
          Swal.fire('Failed!', 'Action Failed!', 'error').then(() =>
            this.getSEAllApplications()
          );
        }
      },
      error: () => {
        Swal.fire('Error!', 'An error occurred while forwarding the application.', 'error');
      },
    });
  }

  // ── HOD: Assign Counsellor (Tab XX) ─────────────────────────────────────────

  /**
   * Prompts HOD to assign a counsellor UID to an application that has none.
   */
  assignCounsellor(application: Application): void {
    Swal.fire({
      title: 'Assign Counsellor',
      text: `Assign a counsellor for application ${application.applicationId}`,
      input: 'text',
      inputPlaceholder: 'Enter Counsellor Employee Code...',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      showLoaderOnConfirm: true,
      preConfirm: counsellorId => {
        if (!counsellorId) Swal.showValidationMessage('Counsellor Employee Code is required!');
        return counsellorId;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('ApplicationId', application.applicationId);
        formData.append('CounsellorUID', result.value);
        formData.append('UserAction', 'AssignCounsellor');
        this.sendForwardRequest(formData); // Reuses existing forward endpoint
      }
    });
  }

  // ── Evaluation Remarks ───────────────────────────────────────────────────────

  UploadEvaluationRemarks(application: Application, remarksBy: string): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;
    this.RemarksBy = remarksBy;

    this.EvaluationForm.reset();
    this.isEvaluationFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.EvaluationModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result
      .then(() => this.getSEAllApplications())
      .catch(() => {});
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
    const formValue = this.EvaluationForm.value;

    const TotalMarks =
      Number(formValue.AcademicsMarks) +
      Number(formValue.CommunicationSkillsMarks) +
      Number(formValue.AttitudeMarks) +
      Number(formValue.ExtraCurricularMarks) +
      Number(formValue.KnowledgeMarks);

    const formData = new FormData();
    formData.append('RegistrationNo', this.RegistrationNo || '');
    formData.append('AcademicsMarks', formValue.AcademicsMarks);
    formData.append('CommunicationSkillsMarks', formValue.CommunicationSkillsMarks);
    formData.append('AttitudeMarks', formValue.AttitudeMarks);
    formData.append('ExtraCurricularMarks', formValue.ExtraCurricularMarks);
    formData.append('KnowledgeMarks', formValue.KnowledgeMarks);
    formData.append('TotalMarks', TotalMarks.toString());
    formData.append('Comments', formValue.Comments);
    formData.append('RemarksBy', this.RemarksBy || 'Unknown');

    this.ServicesSM.StudentEvalutionAddNew(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: (data: any) => {
        const errorCode = data?.item1?.[0]?.returnData;
        if (errorCode > 0) {
          Swal.fire({ title: 'Success!', text: 'Evaluation Marks Updated Successfully', icon: 'success' }).then(
            () => this.currentModalRef?.close()
          );
        } else if (errorCode === '-1') {
          Swal.fire({ title: 'Info', text: 'Evaluation Marks Already Uploaded', icon: 'info' }).then(
            () => this.currentModalRef?.close()
          );
        }
      },
      error: () => {
        Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
      },
    });
  }

  viewEvaluationRemarks(row: Application): void {
    const cachedData = this.evaluationDataMap.get(row.registrationNo);
    if (cachedData) {
      this.showEvaluationDialog(cachedData);
      return;
    }

    this.evaluationLoadingMap.set(row.registrationNo, true);
    this.cd.detectChanges();

    this.ServicesSM.getEvaluationRemarks(row.registrationNo).pipe(
      finalize(() => {
        this.evaluationLoadingMap.set(row.registrationNo, false);
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (evaluationData: any) => {
        if (evaluationData?.item1?.length > 0) {
          const evalData = evaluationData.item1[0];
          this.evaluationDataMap.set(row.registrationNo, evalData);
          this.showEvaluationDialog(evalData);
        } else {
          this.evaluationDataMap.set(row.registrationNo, {});
          Swal.fire({
            title: 'Evaluation Details',
            text: 'No evaluation data available for this application.',
            icon: 'info',
            confirmButtonText: 'Close',
          });
        }
      },
      error: () => {
        Swal.fire({
          title: 'Evaluation Details',
          text: 'Could not load evaluation details. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close',
        });
      },
    });
  }

  private showEvaluationDialog(evalData: any): void {
    const evaluationDetails = `
Academics Marks         : ${evalData.academicsMarks || 'N/A'}
Communication Skills    : ${evalData.communicationSkillsMarks || 'N/A'}
Attitude                : ${evalData.attitudeMarks || 'N/A'}
Extra-Curricular        : ${evalData.extraCurricularMarks || 'N/A'}
Knowledge               : ${evalData.knowledgeMarks || 'N/A'}
Total Marks             : ${evalData.totalMarks || 'N/A'}
Comments                : ${evalData.comments || 'No comments'}
Remarks By              : ${evalData.remarksBy || 'Unknown'}
    `.trim();

    Swal.fire({
      title: 'Evaluation Details',
      html: `<pre style="text-align:left;font-family:monospace;font-size:13px">${evaluationDetails}</pre>`,
      icon: 'info',
      width: '600px',
      confirmButtonText: 'Close',
    });
  }

  hasEvaluationRemarks(row: Application): boolean {
    const remarks = this.evaluationDataMap.get(row.registrationNo);
    return !!(remarks?.academicsMarks !== null || remarks?.communicationSkillsMarks !== null);
  }

  CheckEvaluationRemarks(row: Application): boolean {
    const remarks = this.evaluationData?.find(
      (r: { registrationNo: string }) => r.registrationNo === row.registrationNo
    );
    return !!(remarks?.academicsMarks !== null || remarks?.communicationSkillsMarks !== null);
  }

  // ── Counselling Remarks ──────────────────────────────────────────────────────

  submitCounsellingRemarks(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;

    this.CounsellingRemarksForm.reset();
    this.isCounsellingFormSubmitted = false;

    if (application.counsellingStatus === 'True' && application.counsellingRemarks) {
      this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
    }

    this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result
      .then(() => this.getSEAllApplications())
      .catch(() => {});
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
    const formValue = this.CounsellingRemarksForm.value;

    const formData = new FormData();
    formData.append('RegistrationNo', this.RegistrationNo || '');
    formData.append('ApplicationId', this.ApplicationId || '');
    formData.append('CounsellingRemarks', formValue.Comments);

    this.ServicesSM.UpdateCounsellingRemarks(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: (data: any) => {
        const errorCode = data?.item1?.[0]?.returnId;
        if (errorCode > 0) {
          Swal.fire({ title: 'Success!', text: 'Counselling Remarks Updated Successfully', icon: 'success' }).then(
            () => this.currentModalRef?.close()
          );
        } else if (errorCode === -1) {
          Swal.fire({ title: 'Info', text: 'Counselling Remarks Already Uploaded', icon: 'info' }).then(
            () => this.currentModalRef?.close()
          );
        } else {
          Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
        }
      },
      error: () => {
        Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
      },
    });
  }

  viewCounsellingRemarks(row: Application): void {
    Swal.fire({
      title: 'Counselling Remarks',
      text: row.counsellingRemarks || 'No remarks available.',
      icon: 'info',
      confirmButtonText: 'Close',
    });
  }

  // ── Faculty: Add Remarks / Comments ─────────────────────────────────────────

  /**
   * Opens the Add Remarks modal for Faculty role.
   */
  openAddRemarksModal(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;

    this.AddRemarksForm.reset();
    this.isAddRemarksFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.AddRemarksModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result
      .then(() => this.getSEAllApplications())
      .catch(() => {});
    this.cd.detectChanges();
  }

  /**
   * Submits faculty remarks (reuses UpdateCounsellingRemarks endpoint as
   * per the "keep API endpoints the same" requirement; adjust if needed).
   */
  submitAddRemarksForm(): void {
    this.isAddRemarksFormSubmitted = true;

    if (this.AddRemarksForm.invalid) {
      Swal.fire('Validation Error', 'Please enter your remarks.', 'error');
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();
    const formValue = this.AddRemarksForm.value;

    const formData = new FormData();
    formData.append('RegistrationNo', this.RegistrationNo || '');
    formData.append('ApplicationId', this.ApplicationId || '');
    formData.append('CounsellingRemarks', formValue.Comments);

    this.ServicesSM.UpdateCounsellingRemarks(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, Math.max(this.minLoadingTime - elapsed, 0));
      })
    ).subscribe({
      next: (data: any) => {
        const errorCode = data?.item1?.[0]?.returnId;
        if (errorCode > 0) {
          Swal.fire({ title: 'Success!', text: 'Remarks Added Successfully', icon: 'success' }).then(
            () => this.currentModalRef?.close()
          );
        } else if (errorCode === -1) {
          Swal.fire({ title: 'Info', text: 'Remarks Already Submitted', icon: 'info' }).then(
            () => this.currentModalRef?.close()
          );
        } else {
          Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
        }
      },
      error: () => {
        Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
      },
    });
  }

  // ── Remarks Viewers ──────────────────────────────────────────────────────────

  hasFacultyRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    return !!(remarks?.facultyRemarks || row.dealingUserInterviewRemarks);
  }

  hasHODRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    return !!(remarks?.hodRemarks || row.dealingHODRemarks);
  }

  hasAuthorityRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    return !!(remarks?.ApprovalRemarks || remarks?.dealingUidRemarks);
  }

  hasHOWRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    return !!(remarks?.howRemarks || remarks?.dealingHowRemarks);
  }

  viewFacultyRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    const text = remarks?.dealingUserInterviewRemarks || remarks?.facultyRemarks;
    Swal.fire({ title: 'Faculty Remarks', text: text || 'No faculty remarks available.', icon: 'info', confirmButtonText: 'Close' });
  }

  viewHODRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    const text = remarks?.hodRemarks || row.dealingHODRemarks;
    Swal.fire({ title: 'HOD Remarks', text: text || 'No HOD remarks available.', icon: 'info', confirmButtonText: 'Close' });
  }

  viewAuthorityRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    const text = remarks?.ApprovalRemarks || remarks?.dealingUidRemarks;
    Swal.fire({ title: 'Authority Remarks', text: text || 'No authority remarks available.', icon: 'info', confirmButtonText: 'Close' });
  }

  viewHOWRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    const text = remarks?.howRemarks || remarks?.dealingHowRemarks;
    Swal.fire({ title: 'Head of Wing Remarks', text: text || 'No HoW remarks available.', icon: 'info', confirmButtonText: 'Close' });
  }

  // ── Form Control Getters ─────────────────────────────────────────────────────

  get evaluationFormControls() { return this.EvaluationForm.controls; }
  get counsellingRemarksFormControls() { return this.CounsellingRemarksForm.controls; }
  get addRemarksFormControls() { return this.AddRemarksForm.controls; }

  // ── Error Helper ─────────────────────────────────────────────────────────────

  private LoginFailed(error: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid', icon: 'warning' });
    const element = document.getElementById('DealingUserDashboardId');
    if (element) element.hidden = true;
    this.cd.detectChanges();
  }
}
