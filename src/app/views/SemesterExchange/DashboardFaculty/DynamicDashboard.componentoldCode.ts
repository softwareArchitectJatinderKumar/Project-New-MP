
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
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';


@Component({
    selector: 'app-DynamicDashboard',
    templateUrl: './DynamicDashboard.componentOldCode.html',
    styleUrls: ['./DashboardFaculty.component.css']
})
export class DynamicDashboardComponentoldCode implements OnInit {

  // UI / State
  pageTitle = 'Dashboard';
  isLoginFailed = false;
  AllApplications: any[] = [];
  visibleApplications: any[] = []; // what we bind to ngx-datatable
  ColumnMode = ColumnMode;
  loadingIndicator = false;

  EvaluationForm!: FormGroup;

  // Aggregated/global flags
  isdealingFaculty = false;
  isDealingAuthority= false
  isHOD = false;
  isHoW = false;

  // Employee & Login
  EmployeeCode: any = null;
  LoginName: any = null;

  // Additional fields
  EmployeeDetails: any;
  EmployeeName: any;
  ContactNoX: any;
  DepartmentName: any;
  UserRole: any;
  Department: any;

  // File upload & evaluation form helpers
  EvalutionDocumentPath: any;
  EvalutionDocumentData: any;
  EvaluationFormStatus = false;
  isForm1Submitted = false;
  isSubmitted = false;

  // selected application data for evaluation modal
  ApplicationId: any;
  RegistrationNo: any;
  RemarksBy: any;

  @ViewChild('EvaluationModal') EvaluationModal!: TemplateRef<any>;
  @ViewChild('CounsellingRemarksModal') CounsellingRemarksModal!: TemplateRef<any>;

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

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>' + this.pageTitle;
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    
    this.title.setTitle(this.pageTitle);

    this.initializeForm();
    this.getToken(this.LoginName);
    this.GetEmployeeDetails();
  }

  // ---------------- AUTH / TOKEN ----------------
  getToken(loginName: string): void {
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.isLoginFailed = true;
        } else {
          // load applications after login success
          this.getSEAllApplications();
        }
      },
      error: err => {
        this.isLoginFailed = true;
      }
    });
  }

  // ---------------- EMPLOYEE DETAILS ----------------
  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response && response.item1 && response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
           
          this.EmployeeCode = response.item1[0].employeeCode ;
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.UserRole = response.item1[0].userRole;
          this.loadingIndicator = false;
          this.isLoginFailed = false;

          // If apps already loaded, enrich + filter them now
          // this.enrichAndFilterApplications();
        } else {
          this.EmployeeDetails = [];
          this.isLoginFailed = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  // ---------------- APPLICATIONS ----------------
  getSEAllApplications(): void {
    this.loadingIndicator = true;
    this.studentService.getAllApplications().subscribe({
      next: response => {
        this.AllApplications = Array.isArray(response?.item1) ? response.item1 : [];
       console.log('AllApplications loaded: ', JSON.stringify(this.AllApplications));
        this.loadingIndicator = false;

        // enrich rows with per-row flags and compute visibleApplications
        this.enrichAndFilterApplications();
        console.log("EMP"+this.EmployeeCode)
        console.log("DEALING UID" + this.isdealingFaculty)
        console.log("DEALING Authority" + this.isDealingAuthority)
        console.log("DEALING HOD" + this.isHOD)
        console.log("DEALING HOW" + this.isHoW)
      },
      error: err => {
        this.isLoginFailed = true;
        this.loadingIndicator = false;
      }
    });
  }

  /**
   * Enrich each application with per-row role flags and set visibleApplications.
   * If the current user has any role (HOD/HoW/Dealing), the grid will show only rows that belong to them.
   * Otherwise it shows all rows.
   */
  private enrichAndFilterApplications(): void {
    if (!this.AllApplications) this.AllApplications = [];
    
    const emp = this.EmployeeCode !== undefined && this.EmployeeCode !== null ? String(this.EmployeeCode).trim() : null;

    // add per-row flags
    this.AllApplications = this.AllApplications.map((application: any) => {
      const dealingFaculty = application.dealingFaculty !== undefined && application.dealingFaculty !== null ? String(application.dealingFaculty).trim() : null;
      const DealingAuthority = application.dealingAuthority !== undefined && application.dealingAuthority !== null ? String(application.dealingAuthority).trim() : null;

      const dealingHODId = application.dealingHODId !== undefined && application.dealingHODId !== null ? String(application.dealingHODId).trim() : null;
      const dealingHow = application.dealingHow !== undefined && application.dealingHow !== null ? String(application.dealingHow).trim() : null;
      const isRowDealing = emp ? dealingFaculty == emp : false;
      const isRowHOD = emp ? dealingHODId == emp : false;
      const isRowHoW = emp ? dealingHow == emp : false;
      const isDealingAuthority = emp ? DealingAuthority == emp : false;

      return {
        ...application,
        isdealingFaculty: isRowDealing,
        isHOD: isRowHOD,
        isHoW: isRowHoW,
        isDealingAuthority:isDealingAuthority
      };
    });

    // aggregated flags (legacy/global) dealingFaculty
    this.isdealingFaculty = this.AllApplications.some(a => a.isdealingFaculty);
    this.isDealingAuthority = this.AllApplications.some(a => a.isDealingAuthority);
    this.isHOD = this.AllApplications.some(a => a.isHOD);
    this.isHoW = this.AllApplications.some(a => a.isHoW);

    // Build page title
    this.buildPageTitle();

    // If user has any of the roles, show only the matched rows; otherwise show all
    if (this.isdealingFaculty || this.isHOD || this.isHoW) {
      this.visibleApplications = this.AllApplications.filter(a => a.isdealingFaculty || a.isHOD || a.isHoW);
    } else {
      this.visibleApplications = [...this.AllApplications];
    }

    // ensure change detection picks changes up (useful after async loads)
    this.cd.detectChanges();
  }

  private buildPageTitle(): void {
    const roles: string[] = [];
    if (this.isHOD) roles.push('Head of Department');
    if (this.isHoW) roles.push('Head of Wing');
    if (this.isdealingFaculty) roles.push('Dealing Faculty');
    if (this.isdealingFaculty) roles.push('Dealing Authority');

    this.pageTitle = roles.length ? `${roles.join(' & ')} Dashboard` : 'Dashboard';
    this.title.setTitle(this.pageTitle);
  }

  // ---------------- FORM / EVALUATION ----------------
  initializeForm(): void {
    this.EvaluationForm = this.fb.group({
      AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      Comments: [''],
      EvalutionDocumentPath: [null, [Validators.required]]
    });
    this.CounsellingRemarksForm = this.fb.group({
      AcademicsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      CommunicationSkillsMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      AttitudeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      ExtraCurricularMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      KnowledgeMarks: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      Comments: ['']
    });
  }

  NewForm(): void {
    this.initializeForm();
  }

  resetForm(): void {
    this.EvaluationForm.reset();
    this.CounsellingRemarksForm.reset();
  }

  get EvaluationForm1() {
    return this.EvaluationForm.controls;
  }

  get form1() {
    return this.EvaluationForm.controls;
  }
 

  get CounsellingRemarksForm1() {
    return this.CounsellingRemarksForm.controls;
  }
  get form2() {
    return this.CounsellingRemarksForm.controls;
  }
 

  // ---------------- NAVIGATION ----------------
  GetStudentApplication(application: any): void {
    const Regno = application['registrationNo'];
    this.router.navigateByUrl('ApplicationDetails/' + this.LoginName + '/' + Regno);
  }

  // ---------------- APPROVE / REJECT / FORWARD ----------------
  disapproveApplication(application: any): void {
    Swal.fire({
      title: 'Reason for Disapproval',
      input: 'text',
      showCancelButton: true
    }).then((result: any) => {
      if (result.value) {
        const Regno = application['registrationNo'];
        const formData = new FormData();
        formData.append('RegistrationNo', Regno);
        formData.append('ApprovalRemarks', result.value);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      }
    });
  }

  private handleStatusChange(formData: FormData, action: string): void {
    this.studentService.SendApproveRequest(formData).subscribe((data: any) => {
      if (data.responseData === 'Cancel') {
        Swal.fire('No Change!', '', 'error');
      } else {
        Swal.fire('Approved/Disapproved successfully!', '', 'success').then(() => {
          window.location.reload();
        });
      }
    });
  }

  acceptApplication(application: any): void {
    const Regno = application['registrationNo'];
    const formData = new FormData();
    formData.append('RegistrationNo', Regno);
    formData.append('Action', 'Accept');

    this.studentService.SendApproveRequest(formData).subscribe((data: any) => {
      if (data.responseData === 'Success') {
        Swal.fire('Application Accepted!', '', 'success').then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire('Error accepting application!', '', 'error');
      }
    });
  }

  ForwardToHod(application: any, UserAction: any): void {
    Swal.fire({
      title: 'Dealing Id',
      input: 'text',
      showCancelButton: true
    }).then((result: any) => {
      if (result.value) {
        const Regno = application['registrationNo'];
        const formData = new FormData();
        formData.append('RegistrationNo', Regno);
        formData.append('HODUID', result.value);
        formData.append('User  Action', UserAction);
        this.ForwardToHOD(formData);
      }
    });
  }

  private ForwardToHOD(formData: FormData): void {
    this.studentService.SendForwardRequest(formData).subscribe((data: any) => {
      if (data.item1 && data.item1[0] && data.item1[0].msg === 'Success') {
        Swal.fire('Action Applied!', '', 'success').then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire('Action Failed!', '', 'error').then(() => {
          window.location.reload();
        });
      }
    });
  }

  // ---------------- LOGIN FAILED ----------------
  LoginFailed(error: any): void {
    this.isLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('DealingUserDashboardId');
    if (element) {
      element.hidden = true;
    }
  }

  // ---------------- EVALUATION / UPLOAD ----------------
  UploadEvaluationRemarks(application: any, RemarksBy: any): void {
    this.RegistrationNo = application['registrationNo'];
    this.ApplicationId = application['applicationId'];
    this.RemarksBy = RemarksBy;

    this.modalService.open(this.EvaluationModal, { size: 'sm' }).result.then(() => {
      window.location.reload();
    }).catch(() => { /* ignore */ });
  }

  onFileSelectedEvaluationForm(event: any): void {
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (!file) return;

    if (file.size > 3148576) {
      Swal.fire({ title: 'File size exceeds 3MB.', icon: 'warning' });
      this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(null);
      target.value = '';
      return;
    }

    this.EvaluationForm.get('EvalutionDocumentPath')?.setValue(file.name);
    this.EvalutionDocumentPath = file;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.EvalutionDocumentPath = file.name;
      this.EvalutionDocumentData = base64Data;
    };
    reader.readAsDataURL(file);
  }

  UploadRemarks(a: any, RemarksBy: any) {
    const aa = a;
    this.RegistrationNo = aa['registrationNo'];
    this.ApplicationId = aa['applicationId'];

    this.cd.detectChanges();
    this.modalService.open(this.EvaluationModal, { size: 'sm' }).result.then((result) => {
      window.location.reload();
    }).catch(() => { /* ignore */ });
  }

  submitEvaluationForm(): void {
    this.loadingIndicator = true;
    this.isForm1Submitted = true;

    if (this.EvaluationForm.invalid) {
      this.loadingIndicator = false;
      return;
    }

    const minLoadingTime = 2500; // 2.5 seconds
    const startTime = Date.now();
    const formData = new FormData();
    const formValue = this.EvaluationForm.value;

    const TotalMarks =
      Number(formValue.AcademicsMarks) +
      Number(formValue.CommunicationSkillsMarks) +
      Number(formValue.AttitudeMarks) +
      Number(formValue.ExtraCurricularMarks) +
      Number(formValue.KnowledgeMarks);

    formData.append('RegistrationNo', this.RegistrationNo);
    formData.append('AcademicsMarks', formValue.AcademicsMarks);
    formData.append('CommunicationSkillsMarks', formValue.CommunicationSkillsMarks);
    formData.append('AttitudeMarks', formValue.AttitudeMarks);
    formData.append('ExtraCurricularMarks', formValue.ExtraCurricularMarks);
    formData.append('KnowledgeMarks', formValue.KnowledgeMarks);
    formData.append('TotalMarks', TotalMarks.toString());
    formData.append('Comments', formValue.Comments);
    formData.append('EvalutionDocumentPath', this.EvalutionDocumentPath);
    formData.append('EvalutionDocumentData', this.EvalutionDocumentData);
    formData.append('RemarksBy', 'Faculty');

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
          const errorCode = data?.item1?.[0]?.returnData;
          if (errorCode > 0) {
            Swal.fire({ title: 'Updated Evaluation Marks Successfully', icon: 'success' }).then(() => {
              window.location.reload();
            });
          } else if (errorCode === -1) {
            Swal.fire({ title: 'Already Uploaded Evaluation Marks', icon: 'error' }).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire({ title: 'Some Technical Issue', icon: 'error' }).then(() => {
              window.location.reload();
            });
          }
        },
        error: () => {
          Swal.fire({ title: 'Error Occurred', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
        }
      });
  }

  CounsellingRemarksForm!: FormGroup;
  // ---------------- COUNSELLING ----------------
  submitCounsellingRemarks(application: any): void {
    this.RegistrationNo = application['registrationNo'];
    this.ApplicationId = application['applicationId'];
    const formData = new FormData();
    formData.append('ApplicationId', this.ApplicationId );
    formData.append('CounsellingRemarks', 'SubmitCounsellingRemarks');

    // Uncomment to call API when available:
    // this.studentService.UpdateCounsellingRemarks(formData).subscribe(...);

    // current behaviour preserved
    this.cd.detectChanges();
    this.modalService.open(this.CounsellingRemarksModal, { size: 'sm' }).result.then((result) => {
      window.location.reload();
    }).catch(() => { /* ignore */ });
  }

  isForm2Submitted: boolean= false;

  submitCounsellingRemarksForm(){
    this.loadingIndicator = true;
    this.isForm2Submitted = true;
    if (this.CounsellingRemarksForm.invalid) return;
    // this.isLoading = true;
    const minLoadingTime = 2500; // 2.5 seconds
    const startTime = Date.now();
    const formData = new FormData();
    const formValue = this.CounsellingRemarksForm.value;

    // const formValue = this.SemesterExchangeRegistration.getRawValue();
    const FinalCommentRemarks = formValue.Comments  
    formData.append("RegistrationNo", this.RegistrationNo);
    formData.append("ApplicationId", this.ApplicationId);
    formData.append("CounsellingRemarks", FinalCommentRemarks);
     
    
    // console.log('Submitting Form Data:');
    // formData.forEach((value, key) => {
    //   console.log(key + ':', value);
    // });

    this.ServicesSM.UpdateCounsellingRemarks(formData) 
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
          let result = data.item1[0]['msg'];
          let errorCode = data.item1[0].returnId;
         
          if (errorCode > 0) {
            Swal.fire({
              title: 'CounsellingRemarks Updated Successfully',
              text: "",
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          } else if (errorCode == -1) {
            Swal.fire({ title: 'Already Uploaded Counselling Remarks', icon: 'error' }).then(() => {
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


  
  viewCounsellingRemarks(row: any): void {
    console.log('View Counselling Remarks', JSON.stringify(row['counsellingRemarks']));
    Swal.fire({
      title: 'CounsellingRemarks ',
      text: "" + row['counsellingRemarks'],
      icon: 'success',
    })
  }
}