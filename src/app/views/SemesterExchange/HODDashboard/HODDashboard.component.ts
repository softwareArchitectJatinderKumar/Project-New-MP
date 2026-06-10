import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';



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

@Component({
  selector: 'app-HODDashboard',
  templateUrl: './HODDashboard.component.html',
  styleUrls: ['./HODDashboard.component.css']
})
export class HODDashboardComponent implements OnInit {

  serverUrl: string = '';
  folderUrl: string = '';
  IsLoginFailed: boolean = false;
  // Dropdown values
  applyingOptions = ['Spring', 'Fall'];
  passportStatusOptions = ['Apply', 'Yes', 'No'];
  visaRejectedOptions = ['Yes', 'No'];
  englishTestTypeOptions = ['Yes', 'No', 'Applied'];
  fundsOptions = ['upto 2 lakh', '2lakh to 4 lakh', '6lakh to 8 lakh'];
  acceptPolicyOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  LoginName: any;
  RegistrationNo: any;

  evaluationDataMap: Map<string, any> = new Map();
  evaluationLoadingMap: Map<string, boolean> = new Map();
  evaluationData: any;



  // ── Evaluation helpers ───────────────────────────────────────────────────────
  isEvaluationFormSubmitted = false;
  isCounsellingFormSubmitted = false;
  isAddRemarksFormSubmitted = false;



  @ViewChild('EvaluationModal') EvaluationModal: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;
  @ViewChild('AddRemarksModal') AddRemarksModal!: TemplateRef<any>;


  // ── HOD Tab Switching ────────────────────────────────────────────────────────

  // AllApplications: Application[] = [];
  AllAuthorityRemarks: AuthorityRemarks[] = [];

  /** Applications rendered in the main (single-role) grid. */
  visibleApplications: Application[] = [];
  AllApplicationsHOD: Application[] = [];

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


  private minLoadingTime = 1000;
  currentModalRef: any;


  // ── HOD Tab Switching ────────────────────────────────────────────────────────

  switchHodTab(tab: 'my' | 'all'): void {
    this.hodActiveTab = tab;
    this.cd.detectChanges();
  }


  // ── Forms ───────────────────────────────────────────────────────────────────
  EvaluationForm!: FormGroup;
  CounsellingRemarksForm!: FormGroup;
  AddRemarksForm!: FormGroup; // Faculty – Add Remarks / Comments

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


  // / ── Evaluation Remarks ───────────────────────────────────────────────────────

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
      .catch(() => { });
    this.cd.detectChanges();
  }

  // submitEvaluationForm(): void {
  //   this.isEvaluationFormSubmitted = true;

  //   if (this.EvaluationForm.invalid) {
  //     Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
  //     return;
  //   }

  //   this.loadingIndicator = true;
  //   const startTime = Date.now();
  //   const formValue = this.EvaluationForm.value;

  //   const TotalMarks =
  //     Number(formValue.AcademicsMarks) +
  //     Number(formValue.CommunicationSkillsMarks) +
  //     Number(formValue.AttitudeMarks) +
  //     Number(formValue.ExtraCurricularMarks) +
  //     Number(formValue.KnowledgeMarks);

  //   const formData = new FormData();
  //   formData.append('RegistrationNo', this.RegistrationNo || '');
  //   formData.append('AcademicsMarks', formValue.AcademicsMarks);
  //   formData.append('CommunicationSkillsMarks', formValue.CommunicationSkillsMarks);
  //   formData.append('AttitudeMarks', formValue.AttitudeMarks);
  //   formData.append('ExtraCurricularMarks', formValue.ExtraCurricularMarks);
  //   formData.append('KnowledgeMarks', formValue.KnowledgeMarks);
  //   formData.append('TotalMarks', TotalMarks.toString());
  //   formData.append('Comments', formValue.Comments);
  //   formData.append('RemarksBy', this.RemarksBy || 'Unknown');

  //   this.ServicesSM.StudentEvalutionAddNew(formData).pipe(
  //     finalize(() => {
  //       const elapsed = Date.now() - startTime;
  //       setTimeout(() => {
  //         this.loadingIndicator = false;
  //         this.cd.detectChanges();
  //       }, Math.max(this.minLoadingTime - elapsed, 0));
  //     })
  //   ).subscribe({
  //     next: (data: any) => {
  //       const errorCode = data?.item1?.[0]?.returnData;
  //       if (errorCode > 0) {
  //         Swal.fire({ title: 'Success!', text: 'Evaluation Marks Updated Successfully', icon: 'success' }).then(
  //           () => this.currentModalRef?.close()
  //         );
  //       } else if (errorCode === '-1') {
  //         Swal.fire({ title: 'Info', text: 'Evaluation Marks Already Uploaded', icon: 'info' }).then(
  //           () => this.currentModalRef?.close()
  //         );
  //       }
  //     },
  //     error: () => {
  //       Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
  //     },
  //   });
  // }

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
      .catch(() => { });
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

  getAllApplicationsforHOD(): void {
    this.loadingIndicator = true;
    this.ServicesSM.getAllApplicationsforHOD().subscribe({
      next: response => {
        if (Array.isArray(response.item1) && response.item1.length > 0) {
          this.AllApplicationsHOD = response.item1;
          // console.log(JSON.stringify(this.AllApplications))
          if (this.AllApplicationsHOD.length > 0) {
            // this.headHtmlData = this.AllApplicationsHOD[0];
            this.columns = Object.keys(this.headHtmlData);
          } else {
            this.headHtmlData = [];
            this.columns = [];
          }
        } else {
          this.AllApplications = [];
          this.headHtmlData = [];
          this.columns = [];
        }

        // Delay hiding the loader for 1.5 seconds
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      },
      error: err => {
        this.AllApplicationsHOD = [];
        this.headHtmlData = [];
        this.columns = [];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 2500);
        this.LoginFailed(err);
      }
    });
  }

  
  constructor(
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    private authService: AuthService, private cd: ChangeDetectorRef,
    private storageService: StorageService,
    private studentService: SemesterExchangeStuDetailsService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];
    this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
    this.title.setTitle('Semester Exchange Student Dashboard');

    if (this.LoginName) {
      this.getToken(this.LoginName);
      this.folderUrl = this.ServicesSM.getFolderUrl();
      this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
      // this.serverUrl = 'http://172.19.2.52/umsweb/webftp/DIA/SemesterExchangedocuments/';
    }
  }

  getToken(loginName: string): void {
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        // console.log(authToken)
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.IsLoginFailed = true;
          this.LoginFailed('Invalid or expired token');
        } else {
          this.getSEAllApplications(); // Load universities first
          // Load universities first
          this.NewForm();
        }
      },
      error: err => this.LoginFailed(err)
    });
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">HOD </span> Dashboard';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  }


  LoginFailed(error: any): void {
    this.IsLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('HodDashboardId');
    if (element) {
      element.hidden = true;
    }
  } 

  AllApplications: any;
  ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = []; loadingIndicator: boolean = false;

  getSEAllApplications(): void {
    this.loadingIndicator = true;
    this.ServicesSM.getAllApplications().subscribe({
      next: response => {
        if (Array.isArray(response.item1) && response.item1.length > 0) {
          this.AllApplications = response.item1;
          if (this.AllApplications.length > 0) {
            this.headHtmlData = this.AllApplications[0];
            this.columns = Object.keys(this.headHtmlData);
          } else {
            this.headHtmlData = [];
            this.columns = [];
          }
           this.getAllApplicationsforHOD();
        } else {
          this.AllApplications = [];
          this.headHtmlData = [];
          this.columns = [];
        }

        // Delay hiding the loader for 1.5 seconds
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      },
      error: err => {
        this.AllApplications = [];
        this.headHtmlData = [];
        this.columns = [];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 2500);
        this.LoginFailed(err);
      }
    });
  }

 

    GetStudentApplication(application: Application): void {
      if (this.LoginName && application.registrationNo) {
        this.router.navigateByUrl(`ApplicationDetails/${this.LoginName}/${application.registrationNo}/Faculty`);
      } else {
        Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
      }
    }
  


  approveApplication(application: any) {
    // Implement approval logic here
    const Regno = application['registrationNo'];
    const formData = new FormData();
    formData.append('RegistrationNo', Regno);
    formData.append('Action', 'Approve');

    Swal.fire({
      title: 'Are you sure you want to change the status?',
      text: 'Kindly confirm if the document is valid!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept current changes!',
      cancelButtonText: 'No, do not change it'
    }).then((result: any) => {
      if (result.value) {
        this.handleStatusChange(formData, 'Approve');
      } else {
        this.showCancelledSwal();
      }
    });
  }
  Reason: any;
  disapproveApplication(application: any) {
    // Implement disapproval logic here
    Swal.fire({
      title: "Reason for Disapproval",
      // text: "Disapproval reason",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        const Regno = application['registrationNo'];
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('RegistrationNo', Regno);
        formData.append('ApprovalRemarks', this.Reason);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      } else {
        this.showCancelledSwal();
      }
    });
  }
  private handleStatusChange(formData: FormData, action: string) {
    this.ServicesSM.SendApproveRequest(formData).subscribe((data: any) => {
      if (action === 'Approve' && data.responseData === 'Cancel') {
        Swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        Swal.fire(
          ' Approved/Disapproved successfully !',
          '',
          'success'
        ).then(() => {
          window.location.reload();
        });
      }
    });
  }

  private showCancelledSwal() {
    Swal.fire(
      'Cancelled',
      ' ',
      'error'
    );
  }



  viewDocument(documentPath: string) {
    if (!documentPath || documentPath === 'undefined' || documentPath.trim() === '') {
      alert('No document available.');
      return;
    }
    // In real app, replace with the actual URL or blob viewer
    alert(`Viewing document: ${documentPath}`);
    // Example - open in new tab if URL present:
    window.open(`${this.serverUrl}${documentPath}`, '_blank');
  }

  ApplicationId: any;
  RemarksBy: any;
  UploadRemarks(a: any, RemarksBy: any) {
    let aa = a;
    // alert(JSON.stringify(aa))
    this.RegistrationNo = aa['registrationNo'];
    this.ApplicationId = aa['applicationId'];

    this.cd.detectChanges();
    // this.modalService.open(this.EvaluationModal, { size: 'sm' })
    this.modalService.open(this.EvaluationModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
      window.location.reload();
    }).catch((res) => { });
  }



  isForm1Submitted: boolean = false; isSubmitted = false;
  NewForm() {
    this.EvaluationForm = this.fb.group({
      AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      Comments: [''],
      EvalutionDocumentPath: [null, [Validators.required]]
    });

  }
  resetForm() {
    this.EvaluationForm.reset();
  }
  get EvaluationForm1() {
    return this.EvaluationForm.controls;
  }
  get form1() {
    return this.EvaluationForm.controls;
  }


  EvalutionDocumentPath: any; EvaluationFormStatus: boolean = false;
  EvalutionDocumentData: any;

  onFileSelectedEvaluationForm(event: any): void {
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (!file) return;

    if (file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB.',
        icon: 'warning'
      });
      this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null);
      target.value = '';
      return;
    }

    this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(file.name);  // Dummy value for validation
    this.EvalutionDocumentPath = file;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.EvalutionDocumentPath = file.name;
      this.EvalutionDocumentData = base64Data;
    };
    reader.readAsDataURL(file);
  }


  submitEvaluationForm() {
    this.loadingIndicator = true;
    this.isForm1Submitted = true;
    if (this.EvaluationForm.invalid) return;
    // this.isLoading = true;
    const minLoadingTime = 2500; // 2.5 seconds
    const startTime = Date.now();
    const formData = new FormData();
    const formValue = this.EvaluationForm.value;

    // const formValue = this.SemesterExchangeRegistration.getRawValue();
    const TotalMarks =
      Number(formValue.AcademicsMarks) +
      Number(formValue.CommunicationSkillsMarks) +
      Number(formValue.AttitudeMarks) +
      Number(formValue.ExtraCurricularMarks) +
      Number(formValue.KnowledgeMarks);
    // alert(TotalMarks)
    // Append regular form fields
    formData.append("RegistrationNo", this.RegistrationNo);
    formData.append("AcademicsMarks", formValue.AcademicsMarks);
    formData.append("CommunicationSkillsMarks", formValue.CommunicationSkillsMarks);
    formData.append("AttitudeMarks", formValue.AttitudeMarks);
    formData.append("ExtraCurricularMarks", formValue.ExtraCurricularMarks);
    formData.append("KnowledgeMarks", formValue.KnowledgeMarks);
    formData.append("TotalMarks", TotalMarks.toString());
    formData.append("Comments", formValue.Comments);
    formData.append("EvalutionDocumentPath", this.EvalutionDocumentPath);
    formData.append("EvalutionDocumentData", this.EvalutionDocumentData);
    formData.append("RemarksBy", 'HOD');

    // console.log('Submitting Form Data:');
    // formData.forEach((value, key) => {
    //   console.log(key + ':', value);
    // });

    this.ServicesSM.StudentEvalutionAddNew(formData)
      .pipe(
        finalize(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(minLoadingTime - elapsed, 0);
          setTimeout(() => {
            this.loadingIndicator = false;
          }, remaining);
        })
      )
      .subscribe({
        next: (data) => {
          // let result = data.item1[0]['msg'];
          let errorCode = data.item1[0].returnData;

          if (errorCode > 0) {
            Swal.fire({
              title: 'Updated Evolution Marks Successfully',
              text: "",
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          } else if (errorCode == -1) {
            Swal.fire({ title: 'Already Uploaded Evolution Marks', icon: 'error' }).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire({ title: 'Some Technical Issue', text: "", icon: 'error' }).then(() => {
              window.location.reload();
            });
          }
        },
        error: () => {
          Swal.fire({
            title: 'Error Occurred',
            text: 'Unable to complete the request. Please try again later.',
            icon: 'error',
          });
        }
      });
  }


  HODID: any;
  ForwardToHod(application: any, UserAction: any) {
    // Implement disapproval logic here
    Swal.fire({
      title: "Dealing Id",
      // text: "Disapproval reason",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        const Regno = application['registrationNo'];
        this.HODID = result.value;
        const formData = new FormData();
        formData.append('RegistrationNo', Regno);
        formData.append('HODUID', this.HODID);
        formData.append('UserAction', UserAction);
        this.ForwardToHOD(formData);
      } else {
        this.showCancelledSwal();
      }
    });
  }




  private ForwardToHOD(formData: FormData) {
    this.ServicesSM.SendForwardRequest(formData).subscribe((data: any) => {
      // alert(JSON.stringify(data))
      if (data.item1[0].msg === 'Success') {
        Swal.fire(
          ' Action Applied !',
          '',
          'success'
        ).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire(
          'Action Failed !',
          '',
          'error'
        ).then(() => {
          window.location.reload();
        });
      }
    });
  }
}
