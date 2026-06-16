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

 
interface AuthorityRemarks {
  registrationNo: string;
  applicationId: string;

  // Counsellor remarks
  dealingUidRemarks: string;
  counsellingRemarks: string;
  counsellingStatus: string;
  counsellingDate: string;
  dealingUId: string;
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
  // Evaluation fields are intentionally omitted here —
  // they are rendered per-row via selectedRemarksEvaluations instead.
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-HowDashboards',
  templateUrl: './HowDashboards.html',
  styleUrls: ['./DashboardFaculty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowDashboards implements OnInit {

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

  /**
   * Shared / header fields for the View Remarks modal.
   * Counselling, Faculty, HOD, HoW and Approval remarks shown once.
   */
  selectedRemarks: AggregatedRemarks | null = null;

  /**
   * All AuthorityRemarks rows for the selected registrationNo.
   * Each row represents one evaluator's marks — rendered as separate cards
   * in the modal so multiple evaluations for the same applicationId are all
   * visible.
   */
  selectedRemarksEvaluations: AuthorityRemarks[] = [];

  /**
   * Role of the user who triggered viewAllRemarks().
   * 'counsellor' → Evaluation section is HIDDEN in the modal  (req #3/#4)
   * 'faculty' | 'hod' | 'how' → Evaluation section is SHOWN
   */
  selectedRemarksCallerRole: 'how' = 'how';



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
          this.EmployeeCode     = String(emp.employeeCode).trim(); //34923 // 33333 // 28243 // 1107 //31859
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
        this.AllHOWApplications = response.item1.filter((app: { dealingHow: string | ''; isForwardedtoHOW: string | ''; }) => app.dealingHow==this.EmployeeCode);//   && app.isForwardedtoHOW=='1' );  
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

  
  

  // ── Role Enrichment & Filtering ───────────────────────────────────────────────
 
  private enrichAndFilterApplications(): void {
    this.AllApplications = this.AllApplications || [];

    const emp = this.EmployeeCode ? this.EmployeeCode.trim() : null;

    this.isHoW              = false;

    this.AllApplications = this.AllApplications.map(app => {
      const how       = this.normalise(app.dealingHow);
      app._isHoW = emp !== null && how === emp  ;// HoW role is exclusive of HOD role
 
      return app;
    });

  

    // ── Raise global role flags from the finalised per-row values ────────────
    this.AllApplications.forEach(app => {
      if (app._isHoW)        this.isHoW              = true;
    });

    this.buildPageTitle();
    this.buildVisibleApplications();
    this.cd.detectChanges();
  }

  private normalise(val: any): string | null {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    return (s === '' || s.toLowerCase() === 'null') ? null : s;
  }

  private buildVisibleApplications(): void {
    this.hodMyApplications = this.AllApplications.filter(a => this.isTrue(a.isForwardtoHOD));
    this.visibleApplications = this.AllApplications.filter(
      a =>  a._isHoW  
    );
  }
 
  private buildPageTitle(): void {
    var roles: any='';
    if (this.isHoW)              roles='HoW';    

    this.pageTitle = roles.length
      ? `** ${roles} Dashboard **`
      : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  
  // ── Navigation ────────────────────────────────────────────────────────────────

  GetStudentApplication(application: Application): void {
    if (this.LoginName && application.registrationNo) {
      var Role = '';
        if (application._isHoW) Role = 'HoW';
      
      this.router.navigateByUrl(
        `ApplicationDetails/${this.LoginName}/${application.registrationNo}/${Role}`
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
    const label = userAction === 'Hod' ? 'HOD' : 'How';
    const staticUid = userAction === 'Hod' ? '28243' : '1107';

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
        fd.append('HODUID', staticUid);
        fd.append('UserAction', userAction);
        this.sendForwardRequest(fd);
      }
    });
  }

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
          Swal.fire('Error!', msg || 'Some Technical Issue Occurred', 'error');
        }
      },
      error: () => Swal.fire('Error!', 'Unable to complete the request. Please try again later.', 'error'),
    });
  }

  // ── Unified View Remarks Modal ────────────────────────────────────────────────

  /**
   * Opens the unified View Remarks modal.
   *
   * Strategy:
   *  – selectedRemarks       → AggregatedRemarks built from the FIRST matching
   *                            AuthorityRemarks row (shared fields: counselling,
   *                            faculty, HOD, HoW, approval).  Shown once.
   *  – selectedRemarksEvaluations → ALL AuthorityRemarks rows for this
   *                            registrationNo.  Each row = one evaluator card
   *                            in the modal, so multiple evaluations (e.g.
   *                            applicationId 10 appears twice with different
   *                            marks) are ALL visible.
   *
   * @param row        The application row that was clicked.
   * @param callerRole 'counsellor' → Evaluation section hidden (req #3/#4)
   *                   'faculty' | 'hod' | 'how' → Evaluation section shown
   */
    viewAllRemarks( row: Application, callerRole: 'how' = 'how' ): void {
    this.selectedRemarksCallerRole = callerRole;

    // ── Collect ALL remarks rows for this registration number ────────────────
    const allRows: AuthorityRemarks[] = this.AllAuthorityRemarks?.filter(
      x => x.registrationNo === row.registrationNo
    ) ?? [];

    // First row drives the shared header fields (counselling, HOD, HoW etc.)
    const first = allRows[0];

    // ── Build AggregatedRemarks (shared fields only — no evaluation data) ────
    this.selectedRemarks = first
      ? {
          registrationNo: row.registrationNo,
          applicationId:  row.applicationId || first.applicationId || '',

          // Counselling
          counsellingRemarks: first.counsellingRemarks || row.counsellingRemarks || '',
          counsellingDate:    first.counsellingDate    || row.counsellingDate    || '',
          counsellingDone:    this.isTrue(first.counsellingStatus ?? row.counsellingStatus),

          // Faculty / Interview
          facultyRemarks:
            first.facultyRemarks || first.dealingUserInterviewRemarks || '',

          // HOD
          hodRemarks:      first.hodRemarks || first.dealingHODRemarks || first.dealingHODInterviewRemarks || '',
          forwardedToHOD:  this.isTrue(first.isForwardtoHOD  ?? row.isForwardtoHOD),

          // HoW
          howRemarks:      first.howRemarks || first.dealingHowRemarks || '',
          forwardedToHoW:  this.isTrue(first.isForwardedtoHOW ?? row.isForwardedtoHOW),

          // Approval / Rejection
          approvalRemarks: first.ApprovalRemarks || row.approvalRemarks || '',
        }
      : {
          // No remarks row at all — still show the modal with inline app data
          registrationNo:  row.registrationNo,
          applicationId:   row.applicationId  || '',
          counsellingRemarks: row.counsellingRemarks || '',
          counsellingDate:    row.counsellingDate    || '',
          counsellingDone:    this.isTrue(row.counsellingStatus),
          facultyRemarks:     '',
          hodRemarks:         '',
          forwardedToHOD:     this.isTrue(row.isForwardtoHOD),
          howRemarks:         '',
          forwardedToHoW:     this.isTrue(row.isForwardedtoHOW),
          approvalRemarks:    row.approvalRemarks || '',
        };

    // ── All rows → one evaluation card each in the modal ────────────────────
    // Keep every row that has at least one evaluation mark populated.
    this.selectedRemarksEvaluations = allRows.filter(
      r => r.academicsMarks != null && r.academicsMarks !== ''
    );

    // ── Open modal ───────────────────────────────────────────────────────────
    this.currentModalRef = this.modalService.open(this.ViewRemarksModal, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result.catch(() => {});
    this.cd.detectChanges();
  }

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