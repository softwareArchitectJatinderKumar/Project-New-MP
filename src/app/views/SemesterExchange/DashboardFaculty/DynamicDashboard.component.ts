import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

// Define an interface for application data for better type safety
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
  selector: 'app-DynamicDashboard',
  templateUrl: './DynamicDashboard.component.html',
  styleUrls: ['./DashboardFaculty.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class DynamicDashboardComponent implements OnInit {

  // UI / State
  pageTitle = 'Dashboard';
  isLoginFailed = false;
  AllApplications: Application[] = [];
  AllAuthorityRemarks: AuthorityRemarks[]=[];
  visibleApplications: Application[] = []; // what we bind to ngx-datatable
  ColumnMode = ColumnMode;
  loadingIndicator = false;
  private minLoadingTime = 1000; // Minimum loading time for UX (1 second)

  // Forms
  EvaluationForm!: FormGroup;
  CounsellingRemarksForm!: FormGroup;

  isdealingFaculty = false;
  isDealingAuthority = false;
  isHOD = false;
  isHoW = false;

  EmployeeCode: string | null = null;
  LoginName: string ;
  EmployeeDetails: any;  
  EmployeeName: string | null = null;
  ContactNoX: string | null = null;
  DepartmentName: string | null = null;
  UserRole: string | null = null;
  Department: string | null = null;

  EvalutionDocumentPath: File | null = null;  
  EvalutionDocumentData: string | null = null; 
  isEvaluationFormSubmitted = false; 
  isCounsellingFormSubmitted = false;

  ApplicationId: string | null = null;
  RegistrationNo: string | null = null;
  RemarksBy: string | null = null;  

  @ViewChild('EvaluationModal') EvaluationModal!: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;

  private currentModalRef: NgbModalRef | null = null; 

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

    this.title.setTitle(this.pageTitle);

    this.initializeForms(); 
    this.getToken(this.LoginName);
  }

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
      Comments: ['', Validators.required] 
    });
  }

  /**
   
   * @param loginName  
   */
  private getToken(loginName: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.authService.loginTemp(loginName).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
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
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed("Database Error");
      }
    });
  }

 
  private GetEmployeeDetails(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.mouDocumentsService.GetEmployeeDetails().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: response => {
        if (response && response.item1 && response.item1.length > 0) {
          const employee = response.item1[0];
          this.EmployeeDetails = employee;
          this.EmployeeName = employee.employeeName;
          this.EmployeeCode =  String(employee.employeeCode).trim(); // Ensure string and trim
          this.ContactNoX = employee.contactNo;
          this.Department = employee.department;
          this.DepartmentName = employee.departmentName;
          this.UserRole = employee.userRole;

          this.getSEAllApplications(); // Load applications after employee details are available
          this.getAllAuthorityRemarks(); // Already called in getToken, no need to call again here
        } else {
          this.EmployeeDetails = [];
          this.isLoginFailed = true;
          this.LoginFailed('No employee details found.');
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
 
  private getSEAllApplications(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllApplications().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: response => {
        this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
        this.enrichAndFilterApplications(); // Process applications after loading
      },
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed(err);
      }
    });
  }

 
  private enrichAndFilterApplications(): void {
    if (!this.AllApplications) {
      this.AllApplications = [];
    }

    const empCode = this.EmployeeCode ? this.EmployeeCode.trim() : null;

    // Reset global flags before re-calculating
    this.isdealingFaculty = false;
    this.isDealingAuthority = false;
    this.isHOD = false;
    this.isHoW = false;

    this.AllApplications = this.AllApplications.map((application: Application) => {
      const dealingFaculty = application.dealingFaculty ? String(application.dealingFaculty).trim() : null;
      const dealingAuthority = application.dealingAuthority ? String(application.dealingAuthority).trim() : null;
      const dealingHODId = application.dealingHODId ? String(application.dealingHODId).trim() : null;
      const dealingHow = application.dealingHow ? String(application.dealingHow).trim() : null;
      // Set per-row flags
      application.isdealingFaculty = empCode ? (dealingFaculty === empCode) : false;
      application.isDealingAuthority = empCode ? (dealingAuthority === empCode) : false;
      application.isHOD = empCode ? (dealingHODId === empCode) : false;
      application.isHoW = empCode ? (dealingHow === empCode) : false;
  // application.isHOD =true;
      // Update global flags if any application matches the role
      if (application.isdealingFaculty) this.isdealingFaculty = true;
      if (application.isDealingAuthority) this.isDealingAuthority = true;
      if (application.isHOD) this.isHOD = true;
      if (application.isHoW) this.isHoW = true;
//  this.isHOD = true;
      return application;
    });

    this.buildPageTitle();
    if (this.isdealingFaculty || this.isDealingAuthority || this.isHOD || this.isHoW) {
      this.visibleApplications = this.AllApplications.filter(a =>
        a.isdealingFaculty || a.isDealingAuthority || a.isHOD || a.isHoW
      );
    } else {
      this.visibleApplications = [...this.AllApplications];
    }

    this.cd.detectChanges(); // Ensure UI updates
  }

  
  private buildPageTitle(): void {
    const roles: string[] = [];
    if (this.isDealingAuthority) roles.push('Dealing Authority');
    if (this.isdealingFaculty) roles.push('Dealing Faculty');
    if (this.isHOD) roles.push('Head of Department');
    if (this.isHoW) roles.push('Head of Wing');

    this.pageTitle = roles.length ? `${roles.join(' & ')} Dashboard` : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  /**
   * @param application The selected application object.
   */
  GetStudentApplication(application: Application): void {
    if (this.LoginName && application.registrationNo) {
      this.router.navigateByUrl(`ApplicationDetails/${this.LoginName}/${application.registrationNo}`);
    } else {
      Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
    }
  }

  /**
   * @param application The application to disapprove.
   */
  disapproveApplication(application: Application): void {
    Swal.fire({
      title: 'Reason for Disapproval',
      input: 'text',
      inputPlaceholder: 'Enter reason here...',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (reason) => {
        if (!reason) {
          Swal.showValidationMessage('Reason is required!');
        }
        return reason;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('ApprovalRemarks', result.value);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      }
    });
  }

  /**
   * @param application The application to accept.
   */
  acceptApplication(application: Application): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this application?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Accept!',
      cancelButtonText: 'No, Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('Action', 'Accept');
        this.handleStatusChange(formData, 'Accept');
      }
    });
  }

  /**
   * Generic handler for application status changes (Accept/Disapprove).
   * @param formData The FormData object containing registration number and action.
   * @param action The action performed ('Accept' or 'Disapprove').
   */
  private handleStatusChange(formData: FormData, action: string): void {
    this.loadingIndicator = true;
    const startTime = Date.now();
    this.studentService.SendApproveRequest(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: (data: any) => {
        // console.log(JSON.stringify(data));
        if (data.item1 && data.item1.length > 0 && data.item1[0].msg === 'Approved') {
          Swal.fire('Success!', `Application ${action}ed successfully!`, 'success').then(() => {
            this.getSEAllApplications(); // Refresh data
          });
        } else if (data.item1 && data.item1.length > 0 && data.item1[0].msg === 'Disapproved') {
          Swal.fire('No Change!', 'The application status was not changed.', 'info');
        } else {
          Swal.fire('Error!', `Failed to ${action} application.`, 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error!', `An error occurred while trying to ${action} the application.`, 'error');
        console.error(`Error ${action}ing application:`, err);
      }
    });
  }

  /**
   * Forwards an application to HOD or HoW.
   * @param application The application to forward.
   * @param userAction 'Hod' to forward to HOD, 'How' to forward to HoW.
   */
  ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
    const title = userAction === 'Hod' ? 'Forward to HOD (Enter HOD UID)' : 'Forward to HoW (Enter HoW UID)';
    Swal.fire({
      title: title,
      input: 'text',
      inputPlaceholder: 'Enter User ID...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: (uid) => {
        if (!uid) {
          Swal.showValidationMessage('User ID is required!');
        }
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('HODUID', result.value); // This parameter name might need to be generic (e.g., 'TargetUID')
        formData.append('User Action', userAction); // 'Hod' or 'How'
        this.sendForwardRequest(formData);
      }
    });
  }

  /**
   * Forwards an application to a specific Faculty.
   * @param application The application to forward.
   */
  ForwardToFaculty(application: Application): void {
    Swal.fire({
      title: 'Forward to Faculty (Enter Faculty UID)',
      input: 'text',
      inputPlaceholder: 'Enter Faculty User ID...',
      showCancelButton: true,
      confirmButtonText: 'Forward',
      showLoaderOnConfirm: true,
      preConfirm: (uid) => {
        if (!uid) {
          Swal.showValidationMessage('Faculty User ID is required!');
        }
        return uid;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('RegistrationNo', application.registrationNo);
        formData.append('FacultyUID', result.value); // Assuming API expects 'FacultyUID'
        formData.append('User Action', 'Faculty'); // Indicate action is for Faculty
        this.sendForwardRequest(formData);
      }
    });
  }

  /**
   * Sends the forward request to the backend.
   * @param formData The FormData object containing forwarding details.
   */
  private sendForwardRequest(formData: FormData): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.SendForwardRequest(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: (data: any) => {
        if (data.item1 && data.item1[0] && data.item1[0].msg === 'Success') {
          Swal.fire('Success!', 'Action Applied!', 'success').then(() => {
            this.getSEAllApplications(); // Refresh data
          });
        } else {
          Swal.fire('Failed!', 'Action Failed!', 'error').then(() => {
            this.getSEAllApplications(); // Refresh data even on failure to ensure state consistency
          });
        }
      },
      error: (err) => {
        Swal.fire('Error!', 'An error occurred while forwarding the application.', 'error');
        console.error('Error forwarding application:', err);
      }
    });
  }

  /**
   * Displays a login failed message and hides the dashboard.
   * @param error The error object or message.
   */
  private LoginFailed(error: any): void {
    this.isLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid',
      // text: 'Login details are invalid or an error occurred: ' + (error?.message || error),
      icon: 'warning',
    });
    const element = document.getElementById('DealingUserDashboardId');
    if (element) {
      element.hidden = true;
    }
    this.cd.detectChanges(); // Ensure UI updates
  }

  /**
   * Opens the Evaluation Remarks modal.
   * @param application The application for which to upload remarks.
   * @param remarksBy The role submitting the remarks (e.g., 'Faculty', 'HOD').
   */
  UploadEvaluationRemarks(application: Application, remarksBy: string): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;
    this.RemarksBy = remarksBy; // Set who is submitting the remarks

    this.EvaluationForm.reset(); // Reset form state
    this.isEvaluationFormSubmitted = false; // Reset submission flag

    this.currentModalRef = this.modalService.open(this.EvaluationModal, { size: 'lg', backdrop: 'static', keyboard: false });
    this.currentModalRef.result.then(() => {
      // Modal closed, refresh data
      this.getSEAllApplications();
    }).catch(() => {
      // Modal dismissed, no action needed or specific handling
    });
    this.cd.detectChanges(); // Ensure modal content is ready
  }

  /**
   * Handles file selection for the evaluation form document.
   * Performs file size validation and converts to base64.
   * @param event The file input change event.
   */
  // onFileSelectedEvaluationForm(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   const file: File | null = (target.files && target.files.length > 0) ? target.files[0] : null;

  //   if (!file) {
  //     this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null);
  //     this.EvalutionDocumentPath = null;
  //     this.EvalutionDocumentData = null;
  //     return;
  //   }

  //   const MAX_FILE_SIZE_MB = 3;
  //   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  //   if (file.size > MAX_FILE_SIZE_BYTES) {
  //     Swal.fire({ title: `File size exceeds ${MAX_FILE_SIZE_MB}MB.`, icon: 'warning' });
  //     this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null); // Clear form control
  //     target.value = ''; // Clear file input
  //     this.EvalutionDocumentPath = null;
  //     this.EvalutionDocumentData = null;
  //     return;
  //   }

  //   this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(file.name); // Set file name for validation
  //   this.EvalutionDocumentPath = file; // Store the File object

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     // Extract base64 data (after 'base64,')
  //     this.EvalutionDocumentData = (reader.result as string).split(',')[1];
  //     this.cd.detectChanges(); // Update UI if needed
  //   };
  //   reader.readAsDataURL(file);
  // }

  /**
   * Submits the evaluation form data.
   */
  submitEvaluationForm(): void {
    this.isEvaluationFormSubmitted = true; // Mark form as submitted for validation display

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
    formData.append('RemarksBy', this.RemarksBy || 'Unknown'); // Use the dynamically set RemarksBy

    this.ServicesSM.StudentEvalutionAddNew(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: (data: any) => {
        const errorCode = data?.item1?.[0]?.returnData;
        if (errorCode > 0) {
          Swal.fire({ title: 'Success!', text: 'Evaluation Marks Updated Successfully', icon: 'success' }).then(() => {
            this.currentModalRef?.close(); // Close modal on success
          });
        } else if (errorCode === "-1") {
          Swal.fire({ title: 'Info', text: 'Evaluation Marks Already Uploaded', icon: 'info' }).then(() => {
            this.currentModalRef?.close();
          });
        }
        //  else {
        //   Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
        // }
      },
      error: (err) => {
        Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
        console.error('Error submitting evaluation:', err);
      }
    });
  }

  /**
   * Opens the Counselling Remarks modal.
   * @param application The application for which to submit/view counselling remarks.
   */
  submitCounsellingRemarks(application: Application): void {
    this.RegistrationNo = application.registrationNo;
    this.ApplicationId = application.applicationId;

    this.CounsellingRemarksForm.reset(); // Reset form state
    this.isCounsellingFormSubmitted = false; // Reset submission flag

    // If there are existing remarks, pre-fill the form for viewing/editing
    if (application.counsellingStatus === 'True' && application.counsellingRemarks) {
      this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
    }

    this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, { size: 'lg', backdrop: 'static', keyboard: false });
    this.currentModalRef.result.then(() => {
      // Modal closed, refresh data
      this.getSEAllApplications();
    }).catch(() => {
      // Modal dismissed
    });
    this.cd.detectChanges();
  }

  /**
   * Submits the counselling remarks form data.
   */
  submitCounsellingRemarksForm(): void {
    this.isCounsellingFormSubmitted = true; // Mark form as submitted for validation display

    if (this.CounsellingRemarksForm.invalid) {
      Swal.fire('Validation Error', 'Please enter your counselling remarks.', 'error');
      return;
    }

    this.loadingIndicator = true;
    const startTime = Date.now();
    const formValue = this.CounsellingRemarksForm.value;

    const formData = new FormData();
    formData.append("RegistrationNo", this.RegistrationNo || '');
    formData.append("ApplicationId", this.ApplicationId || '');
    formData.append("CounsellingRemarks", formValue.Comments);

    this.ServicesSM.UpdateCounsellingRemarks(formData).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: (data: any) => {
        let errorCode = data?.item1?.[0]?.returnId;

        if (errorCode > 0) {
          Swal.fire({ title: 'Success!', text: 'Counselling Remarks Updated Successfully', icon: 'success' }).then(() => {
            this.currentModalRef?.close(); // Close modal on success
          });
        } else if (errorCode === -1) {
          Swal.fire({ title: 'Info', text: 'Counselling Remarks Already Uploaded', icon: 'info' }).then(() => {
            this.currentModalRef?.close();
          });
        } else {
          Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
        }
      },
      error: (err) => {
        Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
        console.error('Error submitting counselling remarks:', err);
      }
    });
  }

  /**
   * Displays counselling remarks in a SweetAlert.
   * @param row The application row containing counselling remarks.
   */
  viewCounsellingRemarks(row: Application): void {
    Swal.fire({
      title: 'Counselling Remarks',
      text: row.counsellingRemarks || 'No remarks available.',
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }
 
  // Add a new property to track evaluation data
  evaluationDataMap: Map<string, any> = new Map(); // registrationNo -> evaluation data
  evaluationLoadingMap: Map<string, boolean> = new Map(); // registrationNo -> loading state

  /**
   * Checks if evaluation remarks are available for a given application.
   * @param row The application row to check.
   * @returns True if evaluation remarks exist, false otherwise.
   */
  // hasEvaluationRemarks(row: Application): boolean {
  //   const evalData = this.evaluationDataMap.get(row.registrationNo);
  //   return !!evalData && 
  //          (evalData.academicsMarks !== null || 
  //           evalData.communicationSkillsMarks !== null ||
  //           evalData.attitudeMarks !== null ||
  //           evalData.extraCurricularMarks !== null ||
  //           evalData.knowledgeMarks !== null ||
  //           evalData.comments);
  // }
  hasEvaluationRemarks(row: Application): boolean {
    const remarks = this.evaluationDataMap.get(row.registrationNo);
    // Check both the new ApprovalRemarks and the old DealingUidRemarks
    return !!(remarks?.academicsMarks !== null || remarks?.communicationSkillsMarks !== null);
  }
  evaluationData:any;
  CheckEvaluationRemarks(row: Application): boolean {
    const remarks = this.evaluationData.find((r: { registrationNo: string; }) => r.registrationNo === row.registrationNo);
    // Check both the new FacultyRemarks and the old dealingUserInterviewRemarks
    return !!(remarks?.academicsMarks !== null || remarks?.communicationSkillsMarks !== null);
  }
  /**
   * Displays Evaluation remarks in a SweetAlert.
   * This would need to fetch evaluation data from the backend
   * @param row The application row containing evaluation remarks.
   */
  viewEvaluationRemarks(row: Application): void {
   const cachedData = this.evaluationDataMap.get(row.registrationNo);
    if (cachedData) {
      this.showEvaluationDialog(cachedData);
      return;
    }

    // Set loading state for this specific registration number
    this.evaluationLoadingMap.set(row.registrationNo, true);
    this.cd.detectChanges();
    
    this.ServicesSM.getEvaluationRemarks(row.registrationNo).pipe(
      finalize(() => {
        this.evaluationLoadingMap.set(row.registrationNo, false);
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (evaluationData: any) => {
        if (evaluationData && evaluationData.item1 && evaluationData.item1.length > 0) {
          const evalData = evaluationData.item1[0];
          this.evaluationDataMap.set(row.registrationNo, evalData);
          this.showEvaluationDialog(evalData);
        } else {
          // Cache null data to avoid repeated API calls
          this.evaluationDataMap.set(row.registrationNo, {});
          Swal.fire({
            title: 'Evaluation Details',
            text: 'No evaluation data available for this application.',
            icon: 'info',
            confirmButtonText: 'Close'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Evaluation Details',
          text: 'Could not load evaluation details. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close'
        });
        console.error('Error loading evaluation details:', err);
      }
    });
  }
  // viewEvaluationRemarks(row: Application): void {
  //   // Check if we already have the data cached
  //   const cachedData = this.evaluationDataMap.get(row.registrationNo);
  //   if (cachedData && this.hasEvaluationRemarks(row)) {
  //     this.showEvaluationDialog(cachedData);
  //     return;
  //   }

  //   // Set loading state for this specific registration number
  //   this.evaluationLoadingMap.set(row.registrationNo, true);
  //   this.cd.detectChanges();
    
  //   this.ServicesSM.getEvaluationRemarks(row.registrationNo).pipe(
  //     finalize(() => {
  //       this.evaluationLoadingMap.set(row.registrationNo, false);
  //       this.cd.detectChanges();
  //     })
  //   ).subscribe({
  //     next: (evaluationData: any) => {
  //       if (evaluationData && evaluationData.item1 && evaluationData.item1.length > 0) {
  //         const evalData = evaluationData.item1[0];
  //         this.evaluationDataMap.set(row.registrationNo, evalData);
  //         this.showEvaluationDialog(evalData);
  //       } else {
  //         // Cache null data to avoid repeated API calls
  //         this.evaluationDataMap.set(row.registrationNo, {});
  //         Swal.fire({
  //           title: 'Evaluation Details',
  //           text: 'No evaluation data available for this application.',
  //           icon: 'info',
  //           confirmButtonText: 'Close'
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       Swal.fire({
  //         title: 'Evaluation Details',
  //         text: 'Could not load evaluation details. Please try again.',
  //         icon: 'error',
  //         confirmButtonText: 'Close'
  //       });
  //       console.error('Error loading evaluation details:', err);
  //     }
  //   });
  // }

  /**
   * Helper method to display evaluation details in a dialog
   * @param evalData The evaluation data to display
   */
  private showEvaluationDialog(evalData: any): void {
    const evaluationDetails = `
      Academics Marks: ${evalData.academicsMarks || 'N/A'}
      Communication Skills: ${evalData.communicationSkillsMarks || 'N/A'}
      Attitude: ${evalData.attitudeMarks || 'N/A'}
      Extra-Curricular: ${evalData.extraCurricularMarks || 'N/A'}
      Knowledge: ${evalData.knowledgeMarks || 'N/A'}
      Total Marks: ${evalData.totalMarks || 'N/A'}
      Comments: ${evalData.comments || 'No comments'}
      Remarks By: ${evalData.remarksBy || 'Unknown'}
    `;
    
    Swal.fire({
      title: 'Evaluation Details',
      html: `<pre style="text-align: left; font-family: monospace;">${evaluationDetails}</pre>`,
      icon: 'info',
      width: '600px',
      confirmButtonText: 'Close'
    });
  }
 
  /**
   * Checks if faculty remarks are available for a given application.
   * @param row The application row to check.
   * @returns True if faculty remarks exist, false otherwise.
   */
  hasFacultyRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Check both the new FacultyRemarks and the old dealingUserInterviewRemarks
    return !!(remarks?.facultyRemarks || row.dealingUserInterviewRemarks);
  }

  /**
   * Checks if HOD remarks are available for a given application.
   * @param row The application row to check.
   * @returns True if HOD remarks exist, false otherwise.
   */
  hasHODRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Check both the new HODRemarks and the old dealingHODRemarks
    return !!(remarks?.hodRemarks || row.dealingHODRemarks);
  }

  /**
   * Checks if authority remarks are available for a given application.
   * @param row The application row to check.
   * @returns True if authority remarks exist, false otherwise.
   */
  hasAuthorityRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Check both the new ApprovalRemarks and the old DealingUidRemarks
    return !!(remarks?.ApprovalRemarks || remarks?.dealingUidRemarks);
  }

  /**
   * Checks if HoW remarks are available for a given application.
   * @param row The application row to check.
   * @returns True if HoW remarks exist, false otherwise.
   */
  hasHOWRemarks(row: Application): boolean {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Check both the new HOWRemarks and the old DealingHowRemarks
    return !!(remarks?.howRemarks || remarks?.dealingHowRemarks);
  }

  /**
   * Displays Faculty remarks in a SweetAlert.
   * @param row The application row containing faculty remarks.
   */
  viewFacultyRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    const facultyRemarks = remarks?.facultyRemarks || row.dealingUserInterviewRemarks;

    Swal.fire({
        title: 'Faculty Remarks',
        text: facultyRemarks ? facultyRemarks : 'No faculty remarks available.',
        icon: 'info',
        confirmButtonText: 'Close'
    });
}


  /**
   * Displays HOD remarks in a SweetAlert.
   * @param row The application row containing HOD remarks.
   */
  viewHODRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Prioritize new HODRemarks, fallback to old dealingHODRemarks
    const hodRemarks = remarks?.hodRemarks || row.dealingHODRemarks;
    
    Swal.fire({
      title: 'HOD Remarks',
      text: hodRemarks || 'No HOD remarks available.',
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  /**
   * Displays Authority remarks in a SweetAlert.
   * @param row The application row containing authority remarks.
   */
  viewAuthorityRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Prioritize new ApprovalRemarks, fallback to old DealingUidRemarks
    const authorityRemarks = remarks?.ApprovalRemarks || remarks?.dealingUidRemarks;
    
    Swal.fire({
      title: 'Authority Remarks',
      text: authorityRemarks || 'No authority remarks available.',
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  /**
   * Displays HoW remarks in a SweetAlert.
   * @param row The application row containing HoW remarks.
   */
  viewHOWRemarks(row: Application): void {
    const remarks = this.AllAuthorityRemarks.find(r => r.registrationNo === row.registrationNo);
    // Prioritize new HOWRemarks, fallback to old DealingHowRemarks
    const howRemarks = remarks?.howRemarks || remarks?.dealingHowRemarks;
    
    Swal.fire({
      title: 'Head of Wing Remarks',
      text: howRemarks || 'No HoW remarks available.',
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }
  // Helper getters for form controls (optional, can use form.get('controlName') directly)
  get evaluationFormControls() {
    return this.EvaluationForm.controls;
  }

  get counsellingRemarksFormControls() {
    return this.CounsellingRemarksForm.controls;
  }

  /**
   * Fetches all authories Remarks .
   */
  private getAllAuthorityRemarks(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();

    this.studentService.getAllRemarks().pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(this.minLoadingTime - elapsed, 0);
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cd.detectChanges();
        }, remaining);
      })
    ).subscribe({
      next: response => {
        this.AllAuthorityRemarks = Array.isArray(response?.item1) ? response.item1 : [];
        // console.log("All Authority Remarks:", JSON.stringify(this.AllAuthorityRemarks));
      },
      error: err => {
        this.isLoginFailed = true;
        this.LoginFailed(err);
      }
    });
  }
}


// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

// // Define an interface for application data for better type safety
// interface Application {
//   applicationId: string;
//   registrationNo: string;
//   phoneNumber: string;
//   whatsAppNo: string;
//   parentContact: string;
//   counsellingStatus: string;
//   isApproved: string;
//   dealingUId: string;
//   dealingUserInterviewRemarks: string;
//   dealingHODId: string;
//   dealingHODRemarks: string;
//   dealingHow: string;
//   dealingFaculty: string;
//   dealingAuthority: string;
//   // Per-row role flags (added by enrichAndFilterApplications)
//   isdealingFaculty: boolean;
//   isDealingAuthority: boolean;
//   isHOD: boolean;
//   isHoW: boolean;
//   counsellingRemarks: string; // Assuming this property exists for viewing remarks  
// };
// interface AuthorityRemarks{
//   DealingUidRemarks :string;
//   DealingHODRemarks :string;
//   DealingHowRemarks :string;
//   DealingHODInterviewRemarks:string; 
//   DealingUserInterviewRemarks :string;
//   FacultyRemarks :string;
//   HODRemarks :string;
//   HOWRemarks :string;
//   ApprovalRemarks :string;
//   IsForwardtoHOD :string;
//   IsForwardedtoHOW :string;
//   CounsellingRemarks :string;
//   CounsellingStatus :string;
//   CounsellingDate :string;
// }

// @Component({
//   selector: 'app-DynamicDashboard',
//   templateUrl: './DynamicDashboard.component.html',
//   styleUrls: ['./DashboardFaculty.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
// })
// export class DynamicDashboardComponent implements OnInit {

//   // UI / State
//   pageTitle = 'Dashboard';
//   isLoginFailed = false;
//   AllApplications: Application[] = [];
//   AllAuthorityRemarks: AuthorityRemarks[]=[];
//   visibleApplications: Application[] = []; // what we bind to ngx-datatable
//   ColumnMode = ColumnMode;
//   loadingIndicator = false;
//   private minLoadingTime = 1000; // Minimum loading time for UX (1 second)

//   // Forms
//   EvaluationForm!: FormGroup;
//   CounsellingRemarksForm!: FormGroup;

//   // Aggregated/global flags (derived from user's roles across all applications)
//   isdealingFaculty = false;
//   isDealingAuthority = false;
//   isHOD = false;
//   isHoW = false;

//   // Employee & Login Details
//   EmployeeCode: string | null = null;
//   LoginName: string ;
//   EmployeeDetails: any; // Consider defining a more specific interface if structure is known
//   EmployeeName: string | null = null;
//   ContactNoX: string | null = null;
//   DepartmentName: string | null = null;
//   UserRole: string | null = null;
//   Department: string | null = null;

//   // File upload & evaluation form helpers
//   EvalutionDocumentPath: File | null = null; // Store the actual File object
//   EvalutionDocumentData: string | null = null; // Store base64 string
//   isEvaluationFormSubmitted = false; // Renamed for clarity
//   isCounsellingFormSubmitted = false; // Renamed for clarity

//   // Selected application data for modals
//   ApplicationId: string | null = null;
//   RegistrationNo: string | null = null;
//   RemarksBy: string | null = null; // To indicate who is submitting remarks (e.g., 'Faculty', 'HOD')

//   // ViewChild references for modals
//   @ViewChild('EvaluationModal') EvaluationModal!: TemplateRef<any>;
//   @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;

//   private currentModalRef: NgbModalRef | null = null; // To keep track of the currently open modal

//   constructor(
//     private fb: FormBuilder,
//     private cd: ChangeDetectorRef,
//     private authService: AuthService,
//     private storageService: StorageService,
//     private ServicesSM: SemesterExchangeStuDetailsService, // Used for evaluation and counselling
//     private studentService: SemesterExchangeStuDetailsService, // Used for general student services (approve/reject/forward)
//     private route: ActivatedRoute,
//     private router: Router,
//     private modalService: NgbModal,
//     private mouDocumentsService: MouDocumentsService,
//     private title: Title
//   ) { }

//   ngOnInit(): void {
//     this.LoginName = this.route.snapshot.params['LoginName'];

//     // Update static DOM elements (consider moving to a dedicated service or directive if many)
//     const stMainElement = document.getElementById('stMain') as HTMLInputElement;
//     if (stMainElement) {
//       stMainElement.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
//     }
//     const imgLogoElement = document.getElementById('imgLogo') as HTMLImageElement;
//     if (imgLogoElement) {
//       imgLogoElement.style.width = '164px';
//     }

//     this.title.setTitle(this.pageTitle);

//     this.initializeForms(); // Initialize all forms
//     this.getToken(this.LoginName); // Start authentication flow
//   }

//   /**
//    * Initializes all reactive forms used in the component.
//    */
//   private initializeForms(): void {
//     this.EvaluationForm = this.fb.group({
//       AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
//       Comments: [''],
//     });

//     // Counselling Remarks Form - only comments as per requirements
//     this.CounsellingRemarksForm = this.fb.group({
//       Comments: ['', Validators.required] // Counselling remarks are required
//     });
//   }

//   /**
//    * Attempts to log in a temporary user and saves the token.
//    * On success, fetches all applications.
//    * @param loginName The login name for authentication.
//    */
//   private getToken(loginName: string): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.authService.loginTemp(loginName).pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges(); // Ensure UI updates after loading
//         }, remaining);
//       })
//     ).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         const authToken = this.storageService.getUser();
//         if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
//           this.isLoginFailed = true;
//           this.LoginFailed('Token Expired or Invalid Login');
//         } else {
//           this.isLoginFailed = false;
//           this.GetEmployeeDetails(); // Get employee details after successful login
//           this.getAllAuthorityRemarks();
//         }
//       },
//       error: err => {
//         this.isLoginFailed = true;
//         this.LoginFailed(err);
//       }
//     });
//   }

//   /**
//    * Fetches employee details for the logged-in user.
//    * This is crucial for determining roles and filtering applications.
//    */
//   private GetEmployeeDetails(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.mouDocumentsService.GetEmployeeDetails().pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: response => {
//         if (response && response.item1 && response.item1.length > 0) {
//           const employee = response.item1[0];
//           this.EmployeeDetails = employee;
//           this.EmployeeName = employee.employeeName;
//           this.EmployeeCode = "28243";//String(employee.employeeCode).trim(); // Ensure string and trim
//           this.ContactNoX = employee.contactNo;
//           this.Department = employee.department;
//           this.DepartmentName = employee.departmentName;
//           this.UserRole = employee.userRole;

//           this.getSEAllApplications(); // Load applications after employee details are available
//           this.getAllAuthorityRemarks();
//         } else {
//           this.EmployeeDetails = [];
//           this.isLoginFailed = true;
//           this.LoginFailed('No employee details found.');
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

//   /**
//    * Fetches all semester exchange applications.
//    */
//   private getSEAllApplications(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.getAllApplications().pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: response => {
//         this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
//         this.enrichAndFilterApplications(); // Process applications after loading
//       },
//       error: err => {
//         this.isLoginFailed = true;
//         this.LoginFailed(err);
//       }
//     });
//   }

//   /**
//    * Enriches each application with per-row role flags and sets visibleApplications.
//    * If the current user has any role (HOD/HoW/Dealing), the grid will show only rows that belong to them.
//    * Otherwise, it shows all rows.
//    */
//   private enrichAndFilterApplications(): void {
//     if (!this.AllApplications) {
//       this.AllApplications = [];
//     }

//     const empCode = this.EmployeeCode ? this.EmployeeCode.trim() : null;

//     // Reset global flags before re-calculating
//     this.isdealingFaculty = false;
//     this.isDealingAuthority = false;
//     this.isHOD = false;
//     this.isHoW = false;

//     this.AllApplications = this.AllApplications.map((application: Application) => {
//       const dealingFaculty = application.dealingFaculty ? String(application.dealingFaculty).trim() : null;
//       const dealingAuthority = application.dealingAuthority ? String(application.dealingAuthority).trim() : null;
//       const dealingHODId = application.dealingHODId ? String(application.dealingHODId).trim() : null;
//       const dealingHow = application.dealingHow ? String(application.dealingHow).trim() : null;
//       // Set per-row flags
//       application.isdealingFaculty = empCode ? (dealingFaculty === empCode) : false;
//       application.isDealingAuthority = empCode ? (dealingAuthority === empCode) : false;
//       application.isHOD = empCode ? (dealingHODId === empCode) : false;
//       application.isHoW = empCode ? (dealingHow === empCode) : false;

//       // Update global flags if any application matches the role
//       if (application.isdealingFaculty) this.isdealingFaculty = true;
//       if (application.isDealingAuthority) this.isDealingAuthority = true;
//       if (application.isHOD) this.isHOD = true;
//       if (application.isHoW) this.isHoW = true;

//       return application;
//     });

//     // Build page title based on aggregated roles
//     this.buildPageTitle();

//     // Filter visible applications based on aggregated roles
//     if (this.isdealingFaculty || this.isDealingAuthority || this.isHOD || this.isHoW) {
//       this.visibleApplications = this.AllApplications.filter(a =>
//         a.isdealingFaculty || a.isDealingAuthority || a.isHOD || a.isHoW
//       );
//     } else {
//       // If user has no specific role for any application, show all
//       this.visibleApplications = [...this.AllApplications];
//     }

//     this.cd.detectChanges(); // Ensure UI updates
//   }

//   /**
//    * Dynamically builds the page title based on the user's aggregated roles.
//    */
//   private buildPageTitle(): void {
//     const roles: string[] = [];
//     if (this.isDealingAuthority) roles.push('Dealing Authority');
//     if (this.isdealingFaculty) roles.push('Dealing Faculty');
//     if (this.isHOD) roles.push('Head of Department');
//     if (this.isHoW) roles.push('Head of Wing');

//     this.pageTitle = roles.length ? `${roles.join(' & ')} Dashboard` : 'Dashboard';
//     this.title.setTitle(this.pageTitle);
//   }

//   /**
//    * Navigates to the student application details page.
//    * @param application The selected application object.
//    */
//   GetStudentApplication(application: Application): void {
//     if (this.LoginName && application.registrationNo) {
//       this.router.navigateByUrl(`ApplicationDetails/${this.LoginName}/${application.registrationNo}`);
//     } else {
//       Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
//     }
//   }

//   /**
//    * Handles the disapproval of an application.
//    * @param application The application to disapprove.
//    */
//   disapproveApplication(application: Application): void {
//     Swal.fire({
//       title: 'Reason for Disapproval',
//       input: 'text',
//       inputPlaceholder: 'Enter reason here...',
//       showCancelButton: true,
//       confirmButtonText: 'Submit',
//       showLoaderOnConfirm: true,
//       preConfirm: (reason) => {
//         if (!reason) {
//           Swal.showValidationMessage('Reason is required!');
//         }
//         return reason;
//       },
//       allowOutsideClick: () => !Swal.isLoading()
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         const formData = new FormData();
//         formData.append('RegistrationNo', application.registrationNo);
//         formData.append('ApprovalRemarks', result.value);
//         formData.append('Action', 'Disapprove');
//         this.handleStatusChange(formData, 'Disapprove');
//       }
//     });
//   }

//   /**
//    * Handles the acceptance of an application.
//    * @param application The application to accept.
//    */
//   acceptApplication(application: Application): void {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you want to accept this application?',
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, Accept!',
//       cancelButtonText: 'No, Cancel'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const formData = new FormData();
//         formData.append('RegistrationNo', application.registrationNo);
//         formData.append('Action', 'Accept');
//         this.handleStatusChange(formData, 'Accept');
//       }
//     });
//   }

//   /**
//    * Generic handler for application status changes (Accept/Disapprove).
//    * @param formData The FormData object containing registration number and action.
//    * @param action The action performed ('Accept' or 'Disapprove').
//    */
//   private handleStatusChange(formData: FormData, action: string): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.SendApproveRequest(formData).pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: (data: any) => {
//         if (data.responseData === 'Success') {
//           Swal.fire('Success!', `Application ${action}ed successfully!`, 'success').then(() => {
//             this.getSEAllApplications(); // Refresh data
//           });
//         } else if (data.responseData === 'Cancel') {
//           Swal.fire('No Change!', 'The application status was not changed.', 'info');
//         } else {
//           Swal.fire('Error!', `Failed to ${action} application.`, 'error');
//         }
//       },
//       error: (err) => {
//         Swal.fire('Error!', `An error occurred while trying to ${action} the application.`, 'error');
//         console.error(`Error ${action}ing application:`, err);
//       }
//     });
//   }

//   /**
//    * Forwards an application to HOD or HoW.
//    * @param application The application to forward.
//    * @param userAction 'Hod' to forward to HOD, 'How' to forward to HoW.
//    */
//   ForwardToHod(application: Application, userAction: 'Hod' | 'How'): void {
//     const title = userAction === 'Hod' ? 'Forward to HOD (Enter HOD UID)' : 'Forward to HoW (Enter HoW UID)';
//     Swal.fire({
//       title: title,
//       input: 'text',
//       inputPlaceholder: 'Enter User ID...',
//       showCancelButton: true,
//       confirmButtonText: 'Forward',
//       showLoaderOnConfirm: true,
//       preConfirm: (uid) => {
//         if (!uid) {
//           Swal.showValidationMessage('User ID is required!');
//         }
//         return uid;
//       },
//       allowOutsideClick: () => !Swal.isLoading()
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         const formData = new FormData();
//         formData.append('RegistrationNo', application.registrationNo);
//         formData.append('HODUID', result.value); // This parameter name might need to be generic (e.g., 'TargetUID')
//         formData.append('User Action', userAction); // 'Hod' or 'How'
//         this.sendForwardRequest(formData);
//       }
//     });
//   }

//   /**
//    * Forwards an application to a specific Faculty.
//    * @param application The application to forward.
//    */
//   ForwardToFaculty(application: Application): void {
//     Swal.fire({
//       title: 'Forward to Faculty (Enter Faculty UID)',
//       input: 'text',
//       inputPlaceholder: 'Enter Faculty User ID...',
//       showCancelButton: true,
//       confirmButtonText: 'Forward',
//       showLoaderOnConfirm: true,
//       preConfirm: (uid) => {
//         if (!uid) {
//           Swal.showValidationMessage('Faculty User ID is required!');
//         }
//         return uid;
//       },
//       allowOutsideClick: () => !Swal.isLoading()
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         const formData = new FormData();
//         formData.append('RegistrationNo', application.registrationNo);
//         formData.append('FacultyUID', result.value); // Assuming API expects 'FacultyUID'
//         formData.append('User Action', 'Faculty'); // Indicate action is for Faculty
//         this.sendForwardRequest(formData);
//       }
//     });
//   }

//   /**
//    * Sends the forward request to the backend.
//    * @param formData The FormData object containing forwarding details.
//    */
//   private sendForwardRequest(formData: FormData): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.SendForwardRequest(formData).pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: (data: any) => {
//         if (data.item1 && data.item1[0] && data.item1[0].msg === 'Success') {
//           Swal.fire('Success!', 'Action Applied!', 'success').then(() => {
//             this.getSEAllApplications(); // Refresh data
//           });
//         } else {
//           Swal.fire('Failed!', 'Action Failed!', 'error').then(() => {
//             this.getSEAllApplications(); // Refresh data even on failure to ensure state consistency
//           });
//         }
//       },
//       error: (err) => {
//         Swal.fire('Error!', 'An error occurred while forwarding the application.', 'error');
//         console.error('Error forwarding application:', err);
//       }
//     });
//   }

//   /**
//    * Displays a login failed message and hides the dashboard.
//    * @param error The error object or message.
//    */
//   private LoginFailed(error: any): void {
//     this.isLoginFailed = true;
//     Swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are invalid or an error occurred: ' + (error?.message || error),
//       icon: 'warning',
//     });
//     const element = document.getElementById('DealingUserDashboardId');
//     if (element) {
//       element.hidden = true;
//     }
//     this.cd.detectChanges(); // Ensure UI updates
//   }

//   /**
//    * Opens the Evaluation Remarks modal.
//    * @param application The application for which to upload remarks.
//    * @param remarksBy The role submitting the remarks (e.g., 'Faculty', 'HOD').
//    */
//   UploadEvaluationRemarks(application: Application, remarksBy: string): void {
//     this.RegistrationNo = application.registrationNo;
//     this.ApplicationId = application.applicationId;
//     this.RemarksBy = remarksBy; // Set who is submitting the remarks

//     this.EvaluationForm.reset(); // Reset form state
//     this.isEvaluationFormSubmitted = false; // Reset submission flag

//     this.currentModalRef = this.modalService.open(this.EvaluationModal, { size: 'lg', backdrop: 'static', keyboard: false });
//     this.currentModalRef.result.then(() => {
//       // Modal closed, refresh data
//       this.getSEAllApplications();
//     }).catch(() => {
//       // Modal dismissed, no action needed or specific handling
//     });
//     this.cd.detectChanges(); // Ensure modal content is ready
//   }

//   /**
//    * Handles file selection for the evaluation form document.
//    * Performs file size validation and converts to base64.
//    * @param event The file input change event.
//    */
//   // onFileSelectedEvaluationForm(event: Event): void {
//   //   const target = event.target as HTMLInputElement;
//   //   const file: File | null = (target.files && target.files.length > 0) ? target.files[0] : null;

//   //   if (!file) {
//   //     this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null);
//   //     this.EvalutionDocumentPath = null;
//   //     this.EvalutionDocumentData = null;
//   //     return;
//   //   }

//   //   const MAX_FILE_SIZE_MB = 3;
//   //   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

//   //   if (file.size > MAX_FILE_SIZE_BYTES) {
//   //     Swal.fire({ title: `File size exceeds ${MAX_FILE_SIZE_MB}MB.`, icon: 'warning' });
//   //     this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null); // Clear form control
//   //     target.value = ''; // Clear file input
//   //     this.EvalutionDocumentPath = null;
//   //     this.EvalutionDocumentData = null;
//   //     return;
//   //   }

//   //   this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(file.name); // Set file name for validation
//   //   this.EvalutionDocumentPath = file; // Store the File object

//   //   const reader = new FileReader();
//   //   reader.onload = () => {
//   //     // Extract base64 data (after 'base64,')
//   //     this.EvalutionDocumentData = (reader.result as string).split(',')[1];
//   //     this.cd.detectChanges(); // Update UI if needed
//   //   };
//   //   reader.readAsDataURL(file);
//   // }

//   /**
//    * Submits the evaluation form data.
//    */
//   submitEvaluationForm(): void {
//     this.isEvaluationFormSubmitted = true; // Mark form as submitted for validation display

//     if (this.EvaluationForm.invalid) {
//       Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
//       return;
//     }

//     this.loadingIndicator = true;
//     const startTime = Date.now();
//     const formValue = this.EvaluationForm.value;

//     const TotalMarks =
//       Number(formValue.AcademicsMarks) +
//       Number(formValue.CommunicationSkillsMarks) +
//       Number(formValue.AttitudeMarks) +
//       Number(formValue.ExtraCurricularMarks) +
//       Number(formValue.KnowledgeMarks);

//     const formData = new FormData();
//     formData.append('RegistrationNo', this.RegistrationNo || '');
//     formData.append('AcademicsMarks', formValue.AcademicsMarks);
//     formData.append('CommunicationSkillsMarks', formValue.CommunicationSkillsMarks);
//     formData.append('AttitudeMarks', formValue.AttitudeMarks);
//     formData.append('ExtraCurricularMarks', formValue.ExtraCurricularMarks);
//     formData.append('KnowledgeMarks', formValue.KnowledgeMarks);
//     formData.append('TotalMarks', TotalMarks.toString());
//     formData.append('Comments', formValue.Comments);
//     formData.append('RemarksBy', this.RemarksBy || 'Unknown'); // Use the dynamically set RemarksBy

//     this.ServicesSM.StudentEvalutionAddNew(formData).pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: (data: any) => {
//         const errorCode = data?.item1?.[0]?.returnData;
//         if (errorCode > 0) {
//           Swal.fire({ title: 'Success!', text: 'Evaluation Marks Updated Successfully', icon: 'success' }).then(() => {
//             this.currentModalRef?.close(); // Close modal on success
//           });
//         } else if (errorCode === -1) {
//           Swal.fire({ title: 'Info', text: 'Evaluation Marks Already Uploaded', icon: 'info' }).then(() => {
//             this.currentModalRef?.close();
//           });
//         } else {
//           Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
//         }
//       },
//       error: (err) => {
//         Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
//         console.error('Error submitting evaluation:', err);
//       }
//     });
//   }

//   /**
//    * Opens the Counselling Remarks modal.
//    * @param application The application for which to submit/view counselling remarks.
//    */
//   submitCounsellingRemarks(application: Application): void {
//     this.RegistrationNo = application.registrationNo;
//     this.ApplicationId = application.applicationId;

//     this.CounsellingRemarksForm.reset(); // Reset form state
//     this.isCounsellingFormSubmitted = false; // Reset submission flag

//     // If there are existing remarks, pre-fill the form for viewing/editing
//     if (application.counsellingStatus === 'True' && application.counsellingRemarks) {
//       this.CounsellingRemarksForm.get('Comments')?.setValue(application.counsellingRemarks);
//     }

//     this.currentModalRef = this.modalService.open(this.CounsellingRemarksModal, { size: 'lg', backdrop: 'static', keyboard: false });
//     this.currentModalRef.result.then(() => {
//       // Modal closed, refresh data
//       this.getSEAllApplications();
//     }).catch(() => {
//       // Modal dismissed
//     });
//     this.cd.detectChanges();
//   }

//   /**
//    * Submits the counselling remarks form data.
//    */
//   submitCounsellingRemarksForm(): void {
//     this.isCounsellingFormSubmitted = true; // Mark form as submitted for validation display

//     if (this.CounsellingRemarksForm.invalid) {
//       Swal.fire('Validation Error', 'Please enter your counselling remarks.', 'error');
//       return;
//     }

//     this.loadingIndicator = true;
//     const startTime = Date.now();
//     const formValue = this.CounsellingRemarksForm.value;

//     const formData = new FormData();
//     formData.append("RegistrationNo", this.RegistrationNo || '');
//     formData.append("ApplicationId", this.ApplicationId || '');
//     formData.append("CounsellingRemarks", formValue.Comments);

//     this.ServicesSM.UpdateCounsellingRemarks(formData).pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: (data: any) => {
//         let errorCode = data?.item1?.[0]?.returnId;

//         if (errorCode > 0) {
//           Swal.fire({ title: 'Success!', text: 'Counselling Remarks Updated Successfully', icon: 'success' }).then(() => {
//             this.currentModalRef?.close(); // Close modal on success
//           });
//         } else if (errorCode === -1) {
//           Swal.fire({ title: 'Info', text: 'Counselling Remarks Already Uploaded', icon: 'info' }).then(() => {
//             this.currentModalRef?.close();
//           });
//         } else {
//           Swal.fire({ title: 'Error!', text: 'Some Technical Issue Occurred', icon: 'error' });
//         }
//       },
//       error: (err) => {
//         Swal.fire({ title: 'Error!', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
//         console.error('Error submitting counselling remarks:', err);
//       }
//     });
//   }

//   /**
//    * Displays counselling remarks in a SweetAlert.
//    * @param row The application row containing counselling remarks.
//    */
//   viewCounsellingRemarks(row: Application): void {
//     Swal.fire({
//       title: 'Counselling Remarks',
//       text: row.counsellingRemarks || 'No remarks available.',
//       icon: 'info',
//       confirmButtonText: 'Close'
//     });
//   }
 

//   /**
//    * Displays Evaluation remarks in a SweetAlert.
//    * This would need to fetch evaluation data from the backend
//    * @param row The application row containing evaluation remarks.
//    */
//   viewEvaluationRemarks(row: Application): void {
//     // For now, this shows a placeholder message
//     // In a real implementation, you would fetch the evaluation data from the backend
//     this.loadingIndicator = true;
    
//     this.ServicesSM.getEvaluationRemarks(row.registrationNo).pipe(
//       finalize(() => {
//         this.loadingIndicator = false;
//         this.cd.detectChanges();
//       })
//     ).subscribe({
//       next: (evaluationData: any) => {
//         if (evaluationData && evaluationData.item1 && evaluationData.item1.length > 0) {
//           const evalData = evaluationData.item1[0];
//           const evaluationDetails = `
//             Academics Marks: ${evalData.academicsMarks || 'N/A'}
//             Communication Skills: ${evalData.communicationSkillsMarks || 'N/A'}
//             Attitude: ${evalData.attitudeMarks || 'N/A'}
//             Extra-Curricular: ${evalData.extraCurricularMarks || 'N/A'}
//             Knowledge: ${evalData.knowledgeMarks || 'N/A'}
//             Total Marks: ${evalData.totalMarks || 'N/A'}
//             Comments: ${evalData.comments || 'No comments'}
//             Remarks By: ${evalData.remarksBy || 'Unknown'}
//           `;
          
//           Swal.fire({
//             title: 'Evaluation Details',
//             html: `<pre style="text-align: left; font-family: monospace;">${evaluationDetails}</pre>`,
//             icon: 'info',
//             width: '600px',
//             confirmButtonText: 'Close'
//           });
//         } else {
//           Swal.fire({
//             title: 'Evaluation Details',
//             text: 'No evaluation data available for this application.',
//             icon: 'info',
//             confirmButtonText: 'Close'
//           });
//         }
//       },
//       error: (err) => {
//         Swal.fire({
//           title: 'Evaluation Details',
//           text: 'Could not load evaluation details. Please try again.',
//           icon: 'error',
//           confirmButtonText: 'Close'
//         });
//         console.error('Error loading evaluation details:', err);
//       }
//     });
//   }

//   /**
//    * Displays Faculty remarks in a SweetAlert.
//    * @param row The application row containing faculty remarks.
//    */
//   viewFacultyRemarks(row: Application): void {
//     Swal.fire({
//       title: 'Faculty Remarks',
//       text: row.dealingUserInterviewRemarks || 'No faculty remarks available.',
//       icon: 'info',
//       confirmButtonText: 'Close'
//     });
//   }

//   /**
//    * Displays HOD remarks in a SweetAlert.
//    * @param row The application row containing HOD remarks.
//    */
//   viewHODRemarks(row: Application): void {
//     Swal.fire({
//       title: 'HOD Remarks',
//       text: row.dealingHODRemarks || 'No HOD remarks available.',
//       icon: 'info',
//       confirmButtonText: 'Close'
//     });
//   }

//   /**
//    * Displays Authority remarks in a SweetAlert.
//    * @param row The application row containing authority remarks.
//    */
//   viewAuthorityRemarks(row: Application): void {
//     // Assuming authority remarks might be stored in a different property
//     // If not available, show a message
//     const authorityRemarks = row.dealingUserInterviewRemarks || 'No authority remarks available.';
//     Swal.fire({
//       title: 'Authority Remarks',
//       text: authorityRemarks,
//       icon: 'info',
//       confirmButtonText: 'Close'
//     });
//   }

//   // Helper getters for form controls (optional, can use form.get('controlName') directly)
//   get evaluationFormControls() {
//     return this.EvaluationForm.controls;
//   }

//   get counsellingRemarksFormControls() {
//     return this.CounsellingRemarksForm.controls;
//   }

// // If the getEvaluationRemarks method doesn't exist in the service, you'll need to add it
// // This would be added to the SemesterExchangeStuDetailsService:
// /*
// @Injectable({ providedIn: 'root' })
// export class SemesterExchangeStuDetailsService {
//   // ... existing methods ...

//   getEvaluationRemarks(registrationNo: string): Observable<any> {
//     const params = new HttpParams().set('RegistrationNo', registrationNo);
//     return this.http.get<any>(`${this.baseUrl}/GetEvaluationRemarks`, { params });
//   }
// }
// */
//   /**
//    * Fetches all authories Remarks .
//    */
//   private getAllAuthorityRemarks(): void {
//     this.loadingIndicator = true;
//     const startTime = Date.now();

//     this.studentService.getAllRemarks().pipe(
//       finalize(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(this.minLoadingTime - elapsed, 0);
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.cd.detectChanges();
//         }, remaining);
//       })
//     ).subscribe({
//       next: response => {
//         this.AllAuthorityRemarks = Array.isArray(response?.item1) ? response.item1 : [];
//         console.log(JSON.stringify(this.AllAuthorityRemarks))
//       },
//       error: err => {
//         this.isLoginFailed = true;
//         this.LoginFailed(err);
//       }
//     });
//   }


// }
