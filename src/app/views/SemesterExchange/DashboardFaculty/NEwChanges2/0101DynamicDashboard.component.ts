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
// export class DynamicDashboardComponent2 implements OnInit {

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

//   /** Currently selected remarks object (bound to the View Remarks modal). */
//   selectedRemarks: AggregatedRemarks | null = null;

//   /** Active tab for HOD view. */
//   hodActiveTab: 'my' | 'all' = 'my';

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

//   // ─── Fixed system-wide codes (confirmed from live data) ──────────────────────
//   private readonly HOD_CODE = '28243';
//   private readonly HOW_CODE = '12160';

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
//           this.EmployeeCode     = '31309';// String(emp.employeeCode).trim();
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

//     this.studentService.getAllApplicationsforHOD().pipe(
//     // this.studentService.getAllApplications().pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: response => {
//         this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
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
//         this.cd.detectChanges();
//       },
//       error: err => this.LoginFailed(err),
//     });
//   }

//   // ── Role Enrichment & Filtering ───────────────────────────────────────────────

//   /**
//    * ─── Filter rules (per requirements) ────────────────────────────────────────
//    *
//    *  #1  Counsellor:
//    *        DealingAuthority === empCode
//    *        AND empCode !== DealingHODId   (not the HOD)
//    *        AND empCode !== DealingHow     (not the HoW)
//    *
//    *  #2  Faculty:
//    *        DealingFaculty === empCode
//    *        AND empCode !== DealingHODId
//    *        AND empCode !== DealingHow
//    *
//    *  #3  HOD:
//    *        DealingHODId === empCode  (i.e. empCode === '28243')
//    *        AND DealingFaculty is non-null  (faculty has been assigned)
//    *
//    *  #4  HoW:
//    *        DealingHow === empCode  (i.e. empCode === '12160')
//    *        AND DealingFaculty is non-null
//    *
//    * Detection order: HOD → HoW → Faculty → Counsellor
//    * (HOD/HoW are fixed codes so they take priority.)
//    */
//   private enrichAndFilterApplications(): void {
//     if (!this.AllApplications?.length) {
//       this.AllApplications = [];
//     }

//     const emp = this.EmployeeCode ? this.EmployeeCode.trim() : null;

//     // ── Step 1: Detect global role ────────────────────────────────────────────
//     // HOD and HoW are identified by their fixed codes alone.
//     // Counsellor / Faculty are detected by scanning rows (Step 2).
//     this.isHOD             = emp === this.HOD_CODE;
//     this.isHoW             = emp === this.HOW_CODE;
//     this.isDealingAuthority = false;
//     this.isdealingFaculty  = false;

//     // ── Step 2: Per-row flag enrichment ───────────────────────────────────────
//     this.AllApplications = this.AllApplications.map(app => {
//       const authority = app.dealingAuthority ? String(app.dealingAuthority).trim() : null;
//       const faculty   = app.dealingFaculty   ? String(app.dealingFaculty).trim()   : null;
//       const hodId     = app.dealingHODId     ? String(app.dealingHODId).trim()     : null;
//       const how       = app.dealingHow       ? String(app.dealingHow).trim()       : null;

//       const facultyAssigned = !!(faculty && faculty !== 'NULL');

//       // Per-row role flags:
//       // _isHOD / _isHoW – row qualifies for HOD/HoW review (fixed code + faculty assigned)
//       app._isHOD = emp === this.HOD_CODE && facultyAssigned;
//       app._isHoW = emp === this.HOW_CODE && facultyAssigned;

//       // _isCounsellor: their code is DealingAuthority, and they are NOT HOD or HoW
//       app._isCounsellor =
//         emp !== null &&
//         authority === emp &&
//         emp !== this.HOD_CODE &&
//         emp !== this.HOW_CODE;

//       // _isFaculty: their code is DealingFaculty, and they are NOT HOD or HoW
//       app._isFaculty =
//         emp !== null &&
//         faculty === emp &&
//         emp !== this.HOD_CODE &&
//         emp !== this.HOW_CODE;

//       // Raise global flags
//       if (app._isCounsellor) this.isDealingAuthority = true;
//       if (app._isFaculty)    this.isdealingFaculty   = true;

//       return app;
//     });

//     this.buildPageTitle();
//     this.buildVisibleApplications();
//     this.cd.detectChanges();
//   }

//   /**
//    * Partition AllApplications into the correct display lists per confirmed role.
//    *
//    *  HOD  → hodMyApplications  = rows where DealingFaculty is set (faculty assigned)
//    *          hodAllApplications = via dedicated API
//    *  HoW  → visibleApplications = rows where DealingFaculty is set
//    *  Faculty   → visibleApplications = their own rows (_isFaculty)
//    *  Counsellor → visibleApplications = their own rows (_isCounsellor)
//    */
//   private buildVisibleApplications(): void {
//     if (this.isHOD) {
//       // Tab X: all applications where a faculty has been assigned
//       // (DealingFaculty non-null means counsellor has already forwarded)
//       this.hodMyApplications = this.AllApplications.filter(a => a.dealingHODId === this.EmployeeCode );
//       // Tab XX: dedicated API
//       this.GetAllApplicationsforHOD();
//       this.visibleApplications = this.hodMyApplications;

//     } else if (this.isHoW) {
//       // HoW: rows where DealingFaculty is non-null
//       this.visibleApplications = this.AllApplications.filter(a => a._isHoW);

//     } else if (this.isdealingFaculty) {
//       // Faculty: only their forwarded rows
//       this.visibleApplications = this.AllApplications.filter(a => a._isFaculty);

//     } else if (this.isDealingAuthority) {
//       // Counsellor: only their own students
//       this.visibleApplications = this.AllApplications.filter(a => a._isCounsellor);

//     } else {
//       // Unknown role — show nothing
//       this.visibleApplications = [];
//     }
//   }

//   private buildPageTitle(): void {
//     let role = '';
//     if      (this.isHOD)              role = 'Head of Department';
//     else if (this.isHoW)              role = 'Head of Wing';
//     else if (this.isdealingFaculty)   role = 'Dealing Faculty';
//     else if (this.isDealingAuthority) role = 'Counsellor';

//     this.pageTitle = role ? `** ${role} Dashboard **` : 'Dashboard';
//     this.title.setTitle(this.pageTitle);
//   }

//   // ── HOD Tab Switching ─────────────────────────────────────────────────────────

//   switchHodTab(tab: 'my' | 'all'): void {
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
//         fd.append('FacultyUID', result.value);
//         fd.append('UserAction', 'Faculty');
//         this.sendForwardRequest(fd);
//       }
//     });
//   }

//   ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
//     const label = userAction === 'Hod' ? 'HOD' : 'Head of Wing';
//     Swal.fire({
//       title: `Forward to ${label}`,
//       input: 'text',
//       inputPlaceholder: `Enter ${label} Employee Code...`,
//       showCancelButton: true,
//       confirmButtonText: 'Forward',
//       showLoaderOnConfirm: true,
//       preConfirm: uid => {
//         if (!uid) Swal.showValidationMessage('Employee Code is required!');
//         return uid;
//       },
//       allowOutsideClick: () => !Swal.isLoading(),
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const fd = new FormData();
//         fd.append('RegistrationNo', application.registrationNo);
//         fd.append('HODUID', result.value);
//         fd.append('UserAction', userAction);
//         this.sendForwardRequest(fd);
//       }
//     });
//   }

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
//         fd.append('CounsellorUID', result.value);
//         fd.append('UserAction', 'AssignCounsellor');
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
//     const fd = new FormData();
//     fd.append('RegistrationNo',     this.RegistrationNo || '');
//     fd.append('ApplicationId',      this.ApplicationId  || '');
//     fd.append('CounsellingRemarks', this.CounsellingRemarksForm.value.Comments);

//     this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const code = data?.item1?.[0]?.returnId;
//         if (code > 0) {
//           Swal.fire('Success!', 'Counselling Remarks Updated Successfully', 'success')
//             .then(() => this.currentModalRef?.close());
//         } else if (code === -1) {
//           Swal.fire('Info', 'Counselling Remarks Already Uploaded', 'info')
//             .then(() => this.currentModalRef?.close());
//         } else {
//           Swal.fire('Error!', 'Some Technical Issue Occurred', 'error');
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
//     const fd = new FormData();
//     fd.append('RegistrationNo',     this.RegistrationNo || '');
//     fd.append('ApplicationId',      this.ApplicationId  || '');
//     fd.append('CounsellingRemarks', this.AddRemarksForm.value.Comments);

//     this.ServicesSM.UpdateCounsellingRemarks(fd).pipe(
//       finalize(() => this.stopLoader(startTime))
//     ).subscribe({
//       next: (data: any) => {
//         const code = data?.item1?.[0]?.returnId;
//         if (code > 0) {
//           Swal.fire('Success!', 'Remarks Added Successfully', 'success')
//             .then(() => this.currentModalRef?.close());
//         } else if (code === -1) {
//           Swal.fire('Info', 'Remarks Already Submitted', 'info')
//             .then(() => this.currentModalRef?.close());
//         } else {
//           Swal.fire('Error!', 'Some Technical Issue Occurred', 'error');
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
//   viewAllRemarks(row: Application): void {
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
//       forwardedToHaW: this.isTrue(r?.isForwardedtoHOW ?? row.isForwardedtoHOW),

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
