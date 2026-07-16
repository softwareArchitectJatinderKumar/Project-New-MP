import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import * as XLSX from 'xlsx';
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
  dealingUId: string;        // Fixed: 12160 (NULL until forwarded to HoW)
  // HOD Tab XX extras (returned by GetSemesterExchangeApplicationForHOD)
  countryName: string;
  applyingOption: string;
  universityOption1: string;
  universityOption2: string;
  universityOption3: string;
  uploadedDocumentCount: string;
  cgpa: string;
  approvedUniversity: string;
  uploadedStageIDocumentCount: any;
  uploadedStageIIDocumentCount: any;
  englishTestType: any;

  resumeFileName: any;
  resumeDocumentPath: any;
  consentLetterDocumentPath: any;
  feesProofDocumentPath: any;
  passportDocumentPath: any;
  englishProofDocumentPath: any;
  affidavitPath: any;
  indeminityBondPath: any;
  offerLetterPath: any;
  outBoundTicket: any;
  returnTicketPath: any;
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
  dealingUId: string;
  // Evaluation fields are intentionally omitted here —
  // they are rendered per-row via selectedRemarksEvaluations instead.
}

export interface DocApprovalInfo {
  isApproved: string;        // 'True' | 'False' | '' (empty = pending, per your getDocStatus())
  approvalRemarks: string;
  approvedBy: string;
}

export interface DocumentRowConfig {
  label: string;         // Display text, e.g. "Resume"
  fileKey: string;        // Property on SelectedDocuments holding the file path
  approvalKey: string;    // Property on SelectedDocuments holding the DocApprovalInfo object
  docTypeParam: string;   // 'docType' string passed to approveDocument(...) — unchanged from your existing calls
}

export type RowState = 'pending' | 'approved' | 'rejected' | 'noFile';
interface Employee {
  employeeName: string;
  employeeCode: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-DynamicDashboard',
  templateUrl: './NewDashboard.html',
  styleUrls: ['../DashboardFaculty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicDashboardComponent implements OnInit {
  // added on 16-July-26
  @ViewChild('ForwardToUIDModal') ForwardToUIDModal!: TemplateRef<any>;
  SelectedRegNo: any;
  SelectedAID: any;
  employeeControl3 = new FormControl('');
  remarks3: any = '';
  filteredEmployeesData3: Employee[] = [];
  EmployeeData: Employee[] = [];
  showSuggestions3 = false;
  activeSuggestionIndex3 = -1;
  ResponsiblePerson3: any = '';
  AssignedToUid3: any = '';
  isForwardToUIDFormSubmitted: any;

  onKeydown3(event: KeyboardEvent) {

    if (!this.filteredEmployeesData3?.length) {
      return;
    }

    if (event.key === 'ArrowDown') {

      event.preventDefault();

      this.activeSuggestionIndex3 =
        (this.activeSuggestionIndex3 + 1)
        % this.filteredEmployeesData3.length;
    }

    else if (event.key === 'ArrowUp') {

      event.preventDefault();

      this.activeSuggestionIndex3 =
        (this.activeSuggestionIndex3 - 1 +
          this.filteredEmployeesData3.length)
        % this.filteredEmployeesData3.length;
    }

    else if (event.key === 'Enter') {

      event.preventDefault();

      if (
        this.activeSuggestionIndex3 >= 0 &&
        this.activeSuggestionIndex3 < this.filteredEmployeesData3.length
      ) {

        this.selectEmployee3(
          this.filteredEmployeesData3[
          this.activeSuggestionIndex3
          ]
        );
      }
    }
  }


  selectEmployee3(employee: Employee) {
    this.ResponsiblePerson3 = employee.employeeCode;
    this.AssignedToUid3 = employee.employeeCode;

    this.employeeControl3.setValue(
      `${employee.employeeName} (${employee.employeeCode})`
    );

    this.filteredEmployeesData3 = [];

    this.showSuggestions3 = false;
    
  }
newId: any;
onInput3() {
  const inputValue = (this.employeeControl3.value || '')
    .toString()
    .toLowerCase()
    .trim();

  if (inputValue) {

    this.filteredEmployeesData3 = this.EmployeeData
      .filter(employee =>
        employee.employeeName.toLowerCase().includes(inputValue) ||
        employee.employeeCode.toLowerCase().includes(inputValue)
      )
      .slice(0, 10);

    if (this.filteredEmployeesData3.length > 0) {
      this.newId = this.filteredEmployeesData3[0].employeeCode;
      
    }

    this.isForwardToUIDFormSubmitted = true;

  } else {
    this.filteredEmployeesData3 = [];
    this.newId = '';
  }

  this.showSuggestions3 = true;
  this.activeSuggestionIndex3 = -1;

  // if (this.CdealingFaculty === this.newId) {
  //   alert('Cannot be same UID');
  //   return;
  // }
}


  hideSuggestions3() {

    setTimeout(() => {

      this.showSuggestions3 = false;

    }, 200);
  }


  ForwardToUIDForm!: FormGroup;

CdealingFaculty:any;
  ForwardToFaculty(application: Application): void {
    this.CdealingFaculty= application.dealingFaculty;
    this.SelectedRegNo = application.registrationNo;
    this.SelectedAID = application.applicationId;    
    this.isForwardToUIDFormSubmitted = false;
    this.currentModalRef = this.modalService.open(this.ForwardToUIDModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    // this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => { });
    // this.cd.detectChanges();
    // Swal.fire({
    //   title: 'Forward To Faculty',
    //   input: 'text',
    //   inputPlaceholder: 'Enter Employee Code...',
    //   showCancelButton: true,
    //   confirmButtonText: 'Forward',
    //   showLoaderOnConfirm: true,
    //   preConfirm: uid => {
    //     if (!uid) Swal.showValidationMessage('Employee Code is required!');
    //     return uid;
    //   },
    //   allowOutsideClick: () => !Swal.isLoading(),
    // }).then(result => {
    //   if (result.isConfirmed && result.value) {
    //     const fd = new FormData();
    //     fd.append('RegistrationNo', application.registrationNo);
    //     fd.append('HODUID', result.value);
    //     fd.append('UserAction', 'Faculty');
    //     this.sendForwardRequest(fd);
    //   }
    // });
  }

  submitForwardToUIDForm(): void {
    if (!this.isForwardToUIDFormSubmitted) {
      this.ForwardToUIDForm.markAllAsTouched();
      return;
    } else if(this.newId==this.CdealingFaculty)
      {
        alert('use different uid');
         return;
      }
    const fd = new FormData();
    fd.append('RegistrationNo', this.SelectedRegNo);
    fd.append('HODUID', this.newId);
    fd.append('UserAction', 'Faculty');
    this.sendForwardRequest(fd);
  }


  documentRows: DocumentRowConfig[] = [
    // { label: 'Resume',          fileKey: 'resumeFileName',            approvalKey: 'resumeApproval',     docTypeParam: 'Resume' },
    // { label: 'Consent Letter',  fileKey: 'consentLetterDocumentPath', approvalKey: 'consentApproval',    docTypeParam: 'Consent Letter' },
    // { label: 'Fees Proof',      fileKey: 'feesProofDocumentPath',     approvalKey: 'feesApproval',       docTypeParam: 'Fees Proof' },
    // { label: 'Passport',        fileKey: 'passportDocumentPath',      approvalKey: 'passportApproval',   docTypeParam: 'Passport' },
    // { label: 'English Proof',   fileKey: 'englishProofDocumentPath',  approvalKey: 'englishApproval',    docTypeParam: 'English Proof' },
    // { label: 'Affidavit',       fileKey: 'affidavitPath',             approvalKey: 'affidavitApproval',  docTypeParam: 'Affidavit' },
    // { label: 'Indemnity Bond',  fileKey: 'indeminityBondPath',        approvalKey: 'indemnityApproval',  docTypeParam: 'Indemnity Bond' },
    { label: 'Offer Letter', fileKey: 'offerLetterPath', approvalKey: 'offerLetterApproval', docTypeParam: 'Offer Letter' },
    { label: 'Outbound Ticket', fileKey: 'outBoundTicket', approvalKey: 'outboundApproval', docTypeParam: 'Outbound Ticket' },
    { label: 'Return Ticket', fileKey: 'returnTicketPath', approvalKey: 'outboundApproval', docTypeParam: 'Return Ticket' },
  ];

  getFileValue(doc: DocumentRowConfig): string {
    return ((this.SelectedDocuments as any)?.[doc.fileKey] ?? '').toString().trim();
  }

  getApproval(doc: DocumentRowConfig): DocApprovalInfo {
    return (this.SelectedDocuments as any)?.[doc.approvalKey] ?? { isApproved: '', approvalRemarks: '', approvedBy: '' };
  }

  /**
   * Your getDocStatus() sends isApproved as the STRING 'True' / 'False' / '' —
   * not real booleans and not null — so normalize on that basis.
   */
  getRowState(doc: DocumentRowConfig): RowState {
    if (!this.getFileValue(doc)) return 'noFile';

    const status = (this.getApproval(doc)?.isApproved ?? '').toString().trim().toLowerCase();

    if (!status || status === 'null') return 'pending';
    return status === 'true' ? 'approved' : 'rejected';
  }

  getApprover(doc: DocumentRowConfig): string {
    const name = (this.getApproval(doc)?.approvedBy ?? '').toString().trim();
    return name || '—';
  }

  getRemarks(doc: DocumentRowConfig): string {
    const remarks = (this.getApproval(doc)?.approvalRemarks ?? '').toString().trim();
    return remarks && remarks.toLowerCase() !== 'null' ? remarks : '';
  }
  // Added  on 7-July-26
  AllApprovedDocuments: any[] = [];

  private getAllApprovedDocuments(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.GetApprovedDocumentDetails('0').pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        this.AllApprovedDocuments = Array.isArray(response?.item1) ? response.item1 : [];
        this.cd.detectChanges();
      },
      error: err => this.LoginFailed(err),
    });
  }




  // added on 3-July-26

  counsellorActiveTab: 'my' | 'allApproved' = 'my';
  // ── HOD Tab Switching ─────────────────────────────────────────────────────────

  switchCounsellorTab(tab: 'my' | 'allApproved'): void {
    this.counsellorActiveTab = tab;
    this.cd.detectChanges();
  }
  AllApprovedApplicationsforCounsellor: Application[] = [];





  uploadedStageIDocumentCount: any; uploadedStageIIDocumentCount: any;
  isEnglishDocumentUploaded: any; EnglishTestType: any;
  FilterAllHOWApplications: Application[] = [];
  searchQueryMyHod: any;

  FilterAllAuthorityApplications: Application[] = [];
  searchQueryAuthority: any;

  FilterAllFacultyApplications: Application[] = [];
  searchQueryFaculty: any;

  searchQuery: any;
  searchQuery2: any;

  /**
   * Free-text search shared by every dashboard's search box — matches the
   * query against every field's stringified value, case-insensitively.
   * Replaces what used to be five copy-pasted filter methods (one per role).
   */
  private filterBySearch(source: Application[], query: string): Application[] {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return source;
    return source.filter(item =>
      Object.values(item).some(val => val !== null && val !== undefined && String(val).toLowerCase().includes(q))
    );
  }

  searchMyHod(): void {
    this.FilterAllHOWApplications = this.filterBySearch(this.AllHOWApplications, this.searchQueryMyHod);
  }

  searchAuthority(): void {
    this.FilterAllAuthorityApplications = this.filterBySearch(this.AllAuthorityApplications, this.searchQueryAuthority);
  }

  searchFaculty(): void {
    this.FilterAllFacultyApplications = this.filterBySearch(this.AllFacultyApplications, this.searchQueryFaculty);
  }

  search(): void {
    this.FilterAllHODApplications = this.filterBySearch(this.AllHODApplications, this.searchQuery);
  }

  search2(): void {
    this.FilterAllApplications = this.filterBySearch(this.AllApplications, this.searchQuery2);
  }

  exportToExcel(data: any[]): void {
    const fileName = 'SemesterExchange-Report.xlsx';
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }

  // added on 17-6-26 
  AcceptForm!: FormGroup;

  UniversitySelected: any;
  UniversityOption1: any;
  UniversityOption2: any;
  UniversityOption3: any;
  selectedId: any;
  selectedRegNo: any;

  selectedApplication: any;

  acceptApplication(application: Application): void {

    this.selectedApplication = application;

    this.selectedId = application.applicationId;
    this.selectedRegNo = application.registrationNo;

    this.AcceptForm.reset();

    this.modalService.open(this.AcceptModal, {
      size: 'lg',
      backdrop: 'static'
    });
  }

  submitAcceptForm(): void {
    if (this.AcceptForm.invalid) {
      this.AcceptForm.markAllAsTouched();
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();

    const fd = new FormData();

    fd.append('RegistrationNo', this.selectedApplication.registrationNo);

    fd.append('UniversitySelected', this.AcceptForm.get('UniversitySelected')?.value);

    fd.append('Action', 'Accept');

    this.studentService.SendApproveRequest(fd).pipe(finalize(() => this.stopLoader(startTime)))
      .subscribe({
        next: (data: any) => {
          const msg = data?.item1?.[0]?.msg;
          if (msg === 'Approved') {
            Swal.fire(
              'Success!',
              'Application accepted successfully!',
              'success'
            ).then(() => {
              this.modalService.dismissAll();
              this.getSEAllApplications();
            });
          } else if (msg === 'Disapproved') {
            Swal.fire(
              'No Change!',
              'The application status was not changed.',
              'info'
            );
          } else {
            Swal.fire(
              'Error!',
              'Failed to accept application.',
              'error'
            );
          }
        },
        error: () => {
          Swal.fire(
            'Error!',
            'An error occurred while trying to accept the application.',
            'error'
          );
        }
      });
  }



  // ── UI / State ───────────────────────────────────────────────────────────────
  pageTitle = 'Dashboard';
  isLoginFailed = false;

  /** Raw list from getAllApplications() */
  AllApplications: Application[] = [];
  FilterAllApplications: Application[] = [];
  AllFacultyApplications: Application[] = [];
  AllAuthorityApplications: Application[] = [];
  AllHODApplications: Application[] = [];
  FilterAllHODApplications: Application[] = [];
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
  selectedRemarksCallerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor';

  /** Active tab for HOD view. */
  hodActiveTab: 'my' | 'all' | 'allApproved' = 'my';
  howActiveTab: 'my' | 'allApproved' = 'my';

  ColumnMode = ColumnMode;
  loadingIndicator = false;
  private readonly minLoadingTime = 1000;

  // ── Forms ────────────────────────────────────────────────────────────────────
  EvaluationForm!: FormGroup;
  CounsellingRemarksForm!: FormGroup;
  AddRemarksForm!: FormGroup;


  // ── Global role flags ────────────────────────────────────────────────────────
  isDealingAuthority = false;   // Counsellor
  isdealingFaculty = false;   // Faculty
  isHOD = false;
  isHoW = false;

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
  isEvaluationFormSubmitted = false;
  isCounsellingFormSubmitted = false;
  isAddRemarksFormSubmitted = false;

  // ── Selected row context (used by all modals) ────────────────────────────────
  ApplicationId: string | null = null;
  RegistrationNo: string | null = null;
  RemarksBy: string | null = null;

  // ── Modal refs ───────────────────────────────────────────────────────────────
  @ViewChild('EvaluationModal') EvaluationModal!: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;
  @ViewChild('AddRemarksModal') AddRemarksModal!: TemplateRef<any>;
  @ViewChild('ViewRemarksModal') ViewRemarksModal!: TemplateRef<any>;
  @ViewChild('AcceptModal') AcceptModal!: TemplateRef<any>;
  @ViewChild('DocumentApprovalsModal') DocumentApprovalsModal!: TemplateRef<any>;

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
  ) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];

    const stMain = document.getElementById('stMain') as HTMLInputElement;
    if (stMain) {
      stMain.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
    }
    const imgLogo = document.getElementById('imgLogo') as HTMLImageElement;
    if (imgLogo) imgLogo.style.width = '164px';

    // (<HTMLInputElement>document.getElementById('navHeader')).style.display = 'none ';
    // (<HTMLInputElement>document.getElementById('stMain')).style.display = 'none ';
    // (<HTMLInputElement>document.getElementById('imgLogo')).style.display = 'none';

    this.initializeForms();
    this.getToken(this.LoginName);
  }

  // ── Form Init ─────────────────────────────────────────────────────────────────

  private initializeForms(): void {
    // this.EvaluationForm = this.fb.group({
    //   AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
    //   CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
    //   AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
    //   ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
    //   KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
    //   Comments: [''],
    // });
    this.EvaluationForm = this.fb.group({
      AcademicsMarks: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      CommunicationSkillsMarks: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      AttitudeMarks: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      ExtraCurricularMarks: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      KnowledgeMarks: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      Comments: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.CounsellingRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });
    // this.EvaluationForm = this.fb.group({
    //   Comments: ['', Validators.required],
    // });

    this.AddRemarksForm = this.fb.group({
      Comments: ['', Validators.required],
    });
  this.AcceptForm = this.fb.group({
  UniversitySelected: [null, Validators.required]
});
    this.ForwardToUIDForm = this.fb.group({
      FacultyUId: ['', Validators.required],
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
          this.GetEmployeeData();
        }
      },
      error: () => this.LoginFailed('Database Error'),
    });
  }

  GetEmployeeData(): void {
    this.mouDocumentsService.GetEmployeeData().subscribe({
      next: response => {
        this.EmployeeData = response.item1.length > 0 ? response.item1 : [];
      },
      error: err => console.error(err)
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
          this.EmployeeDetails = emp;
          this.EmployeeName = emp.employeeName;
          this.EmployeeCode = '28243';// String(emp.employeeCode).trim(); //34923 // 33333 // 28243 // 1107 //31859
          this.ContactNoX = emp.contactNo;
          this.Department = emp.department;
          this.DepartmentName = emp.departmentName;
          this.UserRole = emp.userRole;

          // Fetch applications and remarks in parallel
          this.getSEAllApplications();
          this.getAllAuthorityRemarks();
          this.getAllApprovedDocuments();
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
        // console.log(JSON.stringify(this.AllApplications) + 'Main details of all applications')
        this.AllFacultyApplications = this.FilterAllFacultyApplications = response.item1.filter((app: { dealingFaculty: string | '', isForwardtoHOD: string | ''; }) => app.dealingFaculty == this.EmployeeCode);
        this.AllAuthorityApplications = this.FilterAllAuthorityApplications = response.item1.filter((app: { dealingAuthority: string | '', dealingFaculty: string | ''; approvedUniversity: string | ''; }) => app.dealingAuthority == this.EmployeeCode && app.approvedUniversity == null);

        this.AllHODApplications = this.FilterAllHODApplications = response.item1.filter((app: { dealingHODId: string | ''; isForwardtoHOD: string | ''; isLocked: string | ''; isApproved: string | ''; }) => app.dealingHODId == this.EmployeeCode && app.isForwardtoHOD == '1' && app.isLocked != 'True' && app.isLocked != 'False');

        this.AllHOWApplications = response.item1.filter((app: { dealingHow: string | ''; isForwardedtoHOW: string | ''; isLocked: string | ''; }) => app.dealingHow == this.EmployeeCode && app.isForwardedtoHOW == '1');
        this.AllApprovedApplications = response.item1.filter((app: { approvedUniversity: string | ''; }) => app.approvedUniversity?.length > 0);
        this.AllApprovedApplicationsforCounsellor = response.item1.filter((app: { approvedUniversity: string | ''; dealingAuthority: string | ''; }) => app.approvedUniversity?.length > 0 && app.dealingAuthority == this.EmployeeCode);

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




  private GetAllApplicationsforHOD(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplicationsforHOD().pipe(
      finalize(() => this.stopLoader(startTime))
    ).subscribe({
      next: response => {
        this.hodAllApplications = Array.isArray(response?.item1) ? response.item1 : [];

        //  this.AllApprovedApplications = response.item1.filter((app: { approvedUniversity: string | ''; }) =>app.approvedUniversity?.trim().length > 0 );

        this.AllApprovedApplications = response.item1.filter(
          (app: { approvedUniversity: string | null }) =>
            app.approvedUniversity &&
            app.approvedUniversity !== 'null' &&
            app.approvedUniversity.trim().length > 0
        );
        // this.AllApprovedApplications = response.item1.filter((app: { isLocked: any, isApproved: any ; }) => app.isLocked=='True' || app.isApproved=='True');
        this.cd.detectChanges();
      },
      error: err => this.LoginFailed(err),
    });
  }

  // ── Role Enrichment & Filtering ───────────────────────────────────────────────

  private enrichAndFilterApplications(): void {
    this.AllApplications = this.AllApplications || [];

    const emp = this.EmployeeCode ? this.EmployeeCode.trim() : null;

    // Reset all global role flags
    this.isHOD = false;
    this.isHoW = false;
    this.isdealingFaculty = false;
    this.isDealingAuthority = false;


    let hasFacultyRows = false;

    this.AllApplications = this.FilterAllApplications = this.AllApplications.map(app => {
      const authority = this.normalise(app.dealingAuthority);
      const faculty = this.normalise(app.dealingFaculty);
      const hodId = this.normalise(app.dealingHODId);
      const how = this.normalise(app.dealingHow);

      this.UniversityOption1 = this.normalise(app.universityOption1);
      this.UniversityOption2 = this.normalise(app.universityOption2);
      this.UniversityOption3 = this.normalise(app.universityOption3);
      this.uploadedStageIDocumentCount = this.normalise(app.uploadedStageIDocumentCount);
      this.uploadedStageIIDocumentCount = this.normalise(app.uploadedStageIIDocumentCount);
      this.EnglishTestType = this.normalise(app.englishTestType);

      // Counsellor row: DealingAuthority === empCode
      //   AND not acting as HOD or HoW on this same row
      app._isCounsellor =
        emp !== null &&
        authority === emp &&
        hodId !== emp &&
        how !== emp;

      // Faculty row: DealingFaculty === empCode
      //   AND not acting as HOD or HoW on this same row
      app._isFaculty =
        emp !== null &&
        faculty === emp &&
        hodId !== emp &&
        how !== emp;

      // HOD row: DealingHODId === empCode
      app._isHOD = emp !== null && hodId === emp;

      // HoW row: DealingHow === empCode
      app._isHoW = emp !== null && how === emp && hodId !== emp; // HoW role is exclusive of HOD role

      app._isHoW = emp !== null && authority !== emp && hodId !== emp && how == emp;


      if (app._isFaculty) hasFacultyRows = true;

      return app;
    });


    if (hasFacultyRows) {
      this.AllApplications.forEach(app => {
        if (app._isCounsellor) { app._isCounsellor = false; }
      });
    }

    // ── Raise global role flags from the finalised per-row values ────────────
    this.AllApplications.forEach(app => {
      if (app._isCounsellor) this.isDealingAuthority = true;
      if (app._isFaculty) this.isdealingFaculty = true;
      if (app._isHOD) this.isHOD = true;
      if (app._isHoW) this.isHoW = true;
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
    if (this.isHOD) {
      this.GetAllApplicationsforHOD();
    }

    this.visibleApplications = this.AllApplications.filter(
      a => a._isCounsellor || a._isFaculty || a._isHoW
    );
  }

  private buildPageTitle(): void {
    var roles: any = '';
    if (this.isDealingAuthority) roles = 'Counsellor';
    else if (this.isdealingFaculty) roles = 'Faculty';
    else if (this.isHOD) roles = 'HOD';
    else if (this.isHoW) roles = 'HoW';
    else if (!this.isdealingFaculty || !this.isdealingFaculty || !this.isHOD || !this.isHoW) roles = 'Semester Exchange Admin'

    this.pageTitle = roles.length
      ? `** ${roles} Dashboard **`
      : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  // ── HOD Tab Switching ─────────────────────────────────────────────────────────

  switchHodTab(tab: 'my' | 'all' | 'allApproved'): void {
    this.hodActiveTab = tab;
    this.cd.detectChanges();
  }

  // ── HOW Tab Switching ─────────────────────────────────────────────────────────

  switchHowTab(tab: 'my' | 'allApproved'): void {
    this.howActiveTab = tab;
    this.cd.detectChanges();
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  GetStudentApplication(application: Application): void {
    if (this.LoginName && application.registrationNo) {
      var Role = '';
      if (application._isHOD) Role = 'HOD';
      else if (application._isHoW) Role = 'HoW';
      else if (application._isFaculty) Role = 'Faculty';
      else if (application._isCounsellor) Role = 'Counsellor';
      this.router.navigateByUrl(
        `ApplicationDetails/${this.LoginName}/${application.registrationNo}/${Role}`
      );
    } else {
      Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
    }
  }

  // ── Accept / Reject ───────────────────────────────────────────────────────────

  // acceptApplication(application: Application): void {

  //   this.cd.detectChanges();
  //   this.modalService.open(this.AcceptModal, { size: 'lg' }).result.then((result) => {
  //     // console.log("Modal closed" + result);
  //     window.location.reload();
  //   }).catch((res) => { });
  //   // Swal.fire({
  //   //   title: 'Are you sure?',
  //   //   text: 'Do you want to accept this application?',
  //   //   icon: 'question',
  //   //   showCancelButton: true,
  //   //   confirmButtonText: 'Yes, Accept!',
  //   //   cancelButtonText: 'No, Cancel',
  //   // }).then(result => {
  //   //   if (result.isConfirmed) {
  //   //     const fd = new FormData();
  //   //     fd.append('RegistrationNo', application.registrationNo);
  //   //     fd.append('Action', 'Accept');
  //   //     this.handleStatusChange(fd, 'Accept');
  //   //   }
  //   // });
  // }

  disapproveApplication(application: Application): void {
    Swal.fire({
      title: 'Reason for Rejection',
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

  ForwardToCounsellor(application: Application): void {
    Swal.fire({
      title: 'Forward To Counsellor ',
      input: 'text',
      inputPlaceholder: 'Enter Employee Code...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: uid => {
        if (!uid) Swal.showValidationMessage('Employee Code is required!');
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RegistrationNo', application.registrationNo);
        fd.append('HODUID', result.value);
        fd.append('UserAction', 'AssignCounsellor');
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
    this.modalService.dismissAll();
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
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;
    this.RemarksBy = remarksBy;

    this.EvaluationForm.reset();
    this.isEvaluationFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.EvaluationModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => { });
    this.cd.detectChanges();
  }

  submitEvaluationForm(): void {
    this.isEvaluationFormSubmitted = true;

    if (this.EvaluationForm.invalid) {

      this.EvaluationForm.markAllAsTouched();

      return;
    }

    // if (this.EvaluationForm.invalid) {
    //   Swal.fire(
    //     'Validation Error',
    //     'Please fill in all required fields correctly.',
    //     'error'
    //   ).then(() => {
    //     window.location.reload();
    //   });
    //   return;
    // }

    this.loadingIndicator = true;
    const startTime = Date.now();

    const v = this.EvaluationForm.value;
    const total = +v.AcademicsMarks + +v.CommunicationSkillsMarks +
      +v.AttitudeMarks + +v.ExtraCurricularMarks +
      +v.KnowledgeMarks;

    const fd = new FormData();
    fd.append('RegistrationNo', this.RegistrationNo || '');
    fd.append('AcademicsMarks', v.AcademicsMarks);
    fd.append('CommunicationSkillsMarks', v.CommunicationSkillsMarks);
    fd.append('AttitudeMarks', v.AttitudeMarks);
    fd.append('ExtraCurricularMarks', v.ExtraCurricularMarks);
    fd.append('KnowledgeMarks', v.KnowledgeMarks);
    fd.append('TotalMarks', total.toString());
    fd.append('Comments', v.Comments || '');
    fd.append('RemarksBy', this.RemarksBy || 'Unknown');
    fd.append('DealingUId', this.EmployeeCode || 'Unknown');

    this.ServicesSM.StudentEvalutionAddNew(fd)
      .pipe(
        finalize(() => this.stopLoader(startTime))
      )
      .subscribe({
        next: (data: any) => {

          const code = data?.item1?.[0]?.returnData;

          if (code > 0) {

            Swal.fire(
              'Success!',
              'Evaluation Marks Updated Successfully',
              'success'
            ).then(() => {
              this.currentModalRef?.close();
              window.location.reload();
            });

          } else if (code === '-1' || code === -1) {

            Swal.fire(
              'Info',
              'Evaluation Marks Already Uploaded',
              'info'
            ).then(() => {
              this.currentModalRef?.close();
              window.location.reload();
            });

          } else {

            Swal.fire(
              'Error!',
              'Unable to complete the request.',
              'error'
            ).then(() => {
              window.location.reload();
            });

          }
        },

        error: () => {
          Swal.fire(
            'Error!',
            'Unable to complete the request. Please try again later.',
            'error'
          ).then(() => {
            window.location.reload();
          });
        }
      });
  }
  // ── Counselling Remarks (Counsellor submits) ──────────────────────────────────

  submitCounsellingRemarks(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;

    this.CounsellingRemarksForm.reset();
    this.isCounsellingFormSubmitted = false;

    // Pre-fill if already counselled
    if (this.isTrue(application.counsellingStatus) && application.counsellingRemarks) {
      this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
    }

    this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => { });
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
    fd.append('ApplicationId', this.ApplicationId || '');
    fd.append('CounsellingRemarks', this.CounsellingRemarksForm.value.Comments.trim());
    fd.append('Action', 'Counsellor');

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
    this.ApplicationId = application.applicationId;

    this.AddRemarksForm.reset();
    this.isAddRemarksFormSubmitted = false;

    this.currentModalRef = this.modalService.open(this.AddRemarksModal, {
      size: 'lg', backdrop: 'static', keyboard: false,
    });
    this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => { });
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
    fd.append('ApplicationId', this.ApplicationId || '');
    fd.append('CounsellingRemarks', this.AddRemarksForm.value.Comments.trim());
    fd.append('Action', 'Faculty');

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
  viewAllRemarks(row: Application, callerRole: 'counsellor' | 'faculty' | 'hod' | 'how' = 'counsellor'): void {
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
        applicationId: row.applicationId || first.applicationId || '',
        dealingUId: first.dealingUId || row.dealingUId || '',
        // Counselling
        counsellingRemarks: first.counsellingRemarks || row.counsellingRemarks || '',
        counsellingDate: first.counsellingDate || row.counsellingDate || '',
        counsellingDone: this.isTrue(first.counsellingStatus ?? row.counsellingStatus),

        // Faculty / Interview
        facultyRemarks:
          first.facultyRemarks || first.dealingUserInterviewRemarks || '',

        // HOD
        hodRemarks: first.hodRemarks || first.dealingHODRemarks || first.dealingHODInterviewRemarks || '',
        forwardedToHOD: this.isTrue(first.isForwardtoHOD ?? row.isForwardtoHOD),

        // HoW
        howRemarks: first.howRemarks || first.dealingHowRemarks || '',
        forwardedToHoW: this.isTrue(first.isForwardedtoHOW ?? row.isForwardedtoHOW),

        // Approval / Rejection
        approvalRemarks: first.ApprovalRemarks || row.approvalRemarks || '',
      }
      : {
        // No remarks row at all — still show the modal with inline app data
        registrationNo: row.registrationNo,
        applicationId: row.applicationId || '',
        dealingUId: '',
        counsellingRemarks: row.counsellingRemarks || '',
        counsellingDate: row.counsellingDate || '',
        counsellingDone: this.isTrue(row.counsellingStatus),
        facultyRemarks: '',
        hodRemarks: '',
        forwardedToHOD: this.isTrue(row.isForwardtoHOD),
        howRemarks: '',
        forwardedToHoW: this.isTrue(row.isForwardedtoHOW),
        approvalRemarks: row.approvalRemarks || '',
      };

    // ── All rows → one evaluation card each in the modal ────────────────────
    // Keep every row that has at least one evaluation mark populated.
    this.selectedRemarksEvaluations = allRows.filter(
      r => r.academicsMarks != null && r.academicsMarks !== ''
    );

    // alert(JSON.stringify(this.selectedRemarksEvaluations));
    // ── Open modal ───────────────────────────────────────────────────────────
    this.currentModalRef = this.modalService.open(this.ViewRemarksModal, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result.catch(() => { });
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
  hasAnyERemarks(row: Application): boolean {
    const r = this.AllAuthorityRemarks.find(x => x.dealingUserInterviewRemarks.length > 0 || x.dealingHODInterviewRemarks.length > 0);
    return !!(
      row._isFaculty || row._isHOD || row._isHoW ||
      r?.dealingUserInterviewRemarks ||
      r?.dealingHODInterviewRemarks
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
    if (this.isTrue(val)) return 'bg-success';
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

  get evaluationFormControls() { return this.EvaluationForm.controls; }
  get counsellingRemarksFormControls() { return this.CounsellingRemarksForm.controls; }
  get addRemarksFormControls() { return this.AddRemarksForm.controls; }
  get addUniversitySelectedFormControls() { return this.AcceptForm.controls; }

  // ── Error Helper ──────────────────────────────────────────────────────────────

  private LoginFailed(error: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid', icon: 'warning' });
    const el = document.getElementById('DealingUserDashboardId');
    if (el) el.hidden = true;
    this.cd.detectChanges();
  }
  SERVER_URL = 'http://172.19.2.52/umsweb/DIA/SemesterExchangedocuments/';

  documents: any[] = [];

  downloadDocument(fileName: string) {

    if (!fileName) {
      return;
    }

    window.open(
      this.SERVER_URL + fileName,
      '_blank'
    );

  }
  //  for Counsellor to Approved / Reject the Document uploaded 
  SelectedDocuments: any;
  viewAllDocuments(row: Application): void {
    const allRows: Application[] = this.AllApplications?.filter(
      x => x.registrationNo === row.registrationNo
    ) ?? [];

    // 1. Get all individual document approvals matching this application
    const appDocsApprovalList = this.AllApprovedDocuments?.filter(
      x => x.applicationId == row.applicationId
    ) ?? [];

    // console.log('appDocsApprovalList **--', JSON.stringify(this.AllApprovedDocuments));

    // Matches a documentRows entry (via its docTypeParam) against the DB's
    // DocumentName column, ignoring case and whitespace differences — the
    // DB has been observed to store the same doc type with inconsistent
    // casing across rows (e.g. 'consentLetter' vs 'ConsentLetter').
    const normaliseDocKey = (val: string | null | undefined): string =>
      (val ?? '').toLowerCase().replace(/\s+/g, '');

    const getDocStatus = (docTypeParam: string): DocApprovalInfo => {
      const key = normaliseDocKey(docTypeParam);
      const matchedDoc = appDocsApprovalList.find(d => normaliseDocKey(d.documentName) === key);
      return {
        isApproved: matchedDoc?.approvalStatus || '',
        approvalRemarks: matchedDoc?.approvalRemarks || '',
        approvedBy: matchedDoc?.approvedBy || ''
      };
    };

    const first = allRows[0];

    // Build one DocApprovalInfo per row directly from documentRows (the
    // DocumentRowConfig[] driving the modal), so every row — including any
    // added later — gets matched the same case-insensitive way, instead of
    // a hand-maintained keyword per document.
    const approvalByKey: { [approvalKey: string]: DocApprovalInfo } = {};
    this.documentRows.forEach(doc => {
      approvalByKey[doc.approvalKey] = getDocStatus(doc.docTypeParam);
    });

    // 2. Build the document details maps matching the UI structure
    if (first) {
      this.SelectedDocuments = {
        applicationId: row.applicationId || first.applicationId || '',
        dealingUId: first.dealingUId || row.dealingUId || '',

        // Document paths / filenames
        resumeFileName: first.resumeDocumentPath || row.resumeDocumentPath || '',
        consentLetterDocumentPath: first.consentLetterDocumentPath || row.consentLetterDocumentPath || '',
        feesProofDocumentPath: first.feesProofDocumentPath || row.feesProofDocumentPath || '',
        passportDocumentPath: first.passportDocumentPath || row.passportDocumentPath || '',
        englishProofDocumentPath: first.englishProofDocumentPath || row.englishProofDocumentPath || '',
        affidavitPath: first.affidavitPath || row.affidavitPath || '',
        indeminityBondPath: first.indeminityBondPath || row.indeminityBondPath || '',
        offerLetterPath: first.offerLetterPath || row.offerLetterPath || '',
        outBoundTicket: first.outBoundTicket || row.outBoundTicket || '',
        returnTicketPath: first.returnTicketPath || row.returnTicketPath || '',

        // Per-document approval info, keyed by DocumentRowConfig.approvalKey
        ...approvalByKey,

        // Fallback variables for backwards compatibility if needed elsewhere
        isApproved: appDocsApprovalList[0]?.approvalStatus || '',
        approvalRemarks: appDocsApprovalList[0]?.approvalRemarks || '',
        approvedBy: appDocsApprovalList[0]?.approvedBy || ''
      };
    } else {
      this.SelectedDocuments = {
        registrationNo: row.registrationNo,
        applicationId: row.applicationId || '',
        resumeFileName: row.resumeFileName || row.resumeDocumentPath || '',
        consentLetterDocumentPath: row.consentLetterDocumentPath || '',
        feesProofDocumentPath: row.feesProofDocumentPath || '',
        passportDocumentPath: row.passportDocumentPath || '',
        englishProofDocumentPath: row.englishProofDocumentPath || '',
        affidavitPath: row.affidavitPath || '',
        indeminityBondPath: row.indeminityBondPath || '',
        offerLetterPath: row.offerLetterPath || '',
        outBoundTicket: row.outBoundTicket || '',
        returnTicketPath: row.returnTicketPath || '',

        // Per-document approval info, keyed by DocumentRowConfig.approvalKey
        ...approvalByKey
      };
    }
    // console.log('SelectedDocuments', JSON.stringify(this.SelectedDocuments));
    // Open modal
    this.currentModalRef = this.modalService.open(this.DocumentApprovalsModal, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });
    this.currentModalRef.result.catch(() => { });
    this.cd.detectChanges();
  }

  /**
   * Handles the approval logic for a specific document
   * @param docType string identifier for the document type
   */
  approveDocument(FileName: string, DocumentName: any, ApplicationId: any, Action: any): void {

    Swal.fire({
      title: `${Action} Action`,
      text: `Application ${ApplicationId}`,
      input: 'text',
      inputPlaceholder: 'Enter Remarks',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (code) => {
        if (!code) {
          Swal.showValidationMessage('Remarks are required!');
        }
        return code;
      },

      allowOutsideClick: () => !Swal.isLoading(),

    }).then((result) => {

      if (result.isConfirmed && result.value) {

        this.loadingIndicator = true;
        const startTime = Date.now();

        const fd = new FormData();
        fd.append('ApplicationId', ApplicationId);
        fd.append('DocumentName', DocumentName);
        fd.append('FilePath', FileName);
        fd.append('ApprovedBy', this.EmployeeCode + '  ');
        fd.append('ApprovalRemarks', result.value);
        fd.append('Action', Action);

        this.studentService.UpdateDocumentStatus(fd)
          .pipe(finalize(() => this.stopLoader(startTime)))
          .subscribe({

            next: (data: any) => {

              const msg = data?.item1?.[0]?.msg;

              if (msg === 'Approved') {

                Swal.fire(
                  'Success!',
                  'Application accepted successfully!',
                  'success'
                ).then(() => {
                  this.modalService.dismissAll();
                  this.getSEAllApplications();
                });

              } else if (msg === 'Disapproved') {

                Swal.fire(
                  'Rejected!',
                  'The Document was rejected.',
                  'info'
                ).then(() => {
                  window.location.reload();
                });

              } else {

                Swal.fire(
                  'Error!',
                  'Failed to accept application.',
                  'error'
                ).then(() => {
                  window.location.reload();
                });

              }

            },

            error: () => {

              Swal.fire(
                'Error!',
                'An error occurred while trying to accept the application.',
                'error'
              ).then(() => {
                window.location.reload();
              });

            }

          });

      }

    });

  }
  /**
   * Handles the rejection logic for a specific document
   * @param docType string identifier for the document type
   */
  rejectDocument(docType: string): void {

    // 1. Update local UI state
    // this.selectedRemarks.documentStatuses[docType] = 'REJECTED';

    // OPTIONAL: Prompt the user for rejection comments
    const reason = prompt(`Enter reason for rejecting the ${docType}:`);
    if (reason !== null) {
      // this.selectedRemarks.documentStatuses[`${docType}Reason`] = reason;

      // 2. Add your backend API update logic here
      // this.documentService.updateStatus(this.selectedRemarks.id, docType, 'REJECTED', reason)
      //   .subscribe(...);
    }
  }
}
