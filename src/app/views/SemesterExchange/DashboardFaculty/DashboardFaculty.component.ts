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
  selector: 'app-DashboardFaculty',
  templateUrl: './DashboardFaculty.component.html',
  styleUrls: ['./DashboardFaculty.component.css']
})
export class DashboardFacultyComponent implements OnInit {

  serverUrl: string = '';
  IsLoginFailed: boolean = false;
  AllApplications: any;
  ColumnMode = ColumnMode;
  loadingIndicator: boolean = false;
  EvaluationForm!: FormGroup;
  isDealingAuthority: boolean = false;
  isHOD: boolean = false;
  isHoW: boolean = false;
  EmployeeCode: any;
  LoginName: any;

  //   // Added on 16-july-25
  EmployeeDetails: any;
  EmployeeName: any; ContactNoX: any; DepartmentName: any; UserRole: any; isLoginFailed: any;Department:any;
  @ViewChild('EvaluationModal') EvaluationModal: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,private cd: ChangeDetectorRef,private cdRef: ChangeDetectorRef,
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
    this.getToken(this.LoginName);
    this.title.setTitle('Unified Dashboard');
    this.GetEmployeeDetails();
    this.initializeForm();
  }

  getToken(loginName: string): void {
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser (data);
        const authToken = this.storageService.getUser ();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.IsLoginFailed = true;
        } else {
          this.getSEAllApplications();
        }
      },
      error: err => {
        this.IsLoginFailed = true;
      }
    });
  }

  GetEmployeeDetails(): void {
        this.mouDocumentsService.GetEmployeeDetails().subscribe({
          next: response => {
            if (response.item1.length > 0) {
              this.EmployeeDetails = response.item1;
              // console.log(JSON.stringify(this.EmployeeDetails))
              this.EmployeeName = response.item1[0].employeeName;
              this.EmployeeCode = '31309';//response.item1[0].employeeCode;
              this.ContactNoX = response.item1[0].contactNo;
              this.Department = response.item1[0].department;
              this.DepartmentName = response.item1[0].departmentName;
              this.UserRole = response.item1[0].userRole;
              this.loadingIndicator = false;
              this.isLoginFailed = false;
              // if(this.UserRole!=null)
              // {
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

  getSEAllApplications(): void {
    this.loadingIndicator = true;
    this.studentService.getAllApplications().subscribe({
      next: response => {
        this.AllApplications = response.item1;
        console.log(JSON.stringify(this.AllApplications))
        this.loadingIndicator = false;
        this.checkUserRole();
      },
      error: err => {
        this.IsLoginFailed = true;
        this.loadingIndicator = false;
      }
    });
  }

  checkUserRole(): void {
    this.AllApplications.forEach((application: { dealingUId: any; dealingHODId: any; dealingHow: any; }) => {
      if (application.dealingUId === this.EmployeeCode) {
        this.isDealingAuthority = true;
      }
      if (application.dealingHODId === this.EmployeeCode) {
        this.isHOD = true;
      }
      if (application.dealingHow === this.EmployeeCode) {
        this.isHoW = true;
      }
    });
  }

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
  }

  GetStudentApplication(application: any): void {
    const Regno = application['registrationNo'];
    this.router.navigateByUrl('ApplicationDetails/' + this.LoginName + '/' + Regno);
  }

  disapproveApplication(application: any): void {
    Swal.fire({
      title: "Reason for Disapproval",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
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

  UploadEvaluationRemarks(application: any, RemarksBy: any): void {
    this.modalService.open(this.EvaluationModal, { size: 'sm' }).result.then(() => {
      window.location.reload();
    }).catch(() => { });
  }

  ForwardToHod(application: any, UserAction: any): void {
    Swal.fire({
      title: "Dealing Id",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
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
      if (data.item1[0].msg === 'Success') {
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


  LoginFailed(error: any): void {
    this.IsLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('UserDashboardId');
    if (element) {
      element.hidden = true;
    }
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

  ApplicationId: any;RegistrationNo:any;
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
    formData.append("RemarksBy", 'Faculty');
    
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


  submitCounsellingRemarks(application: any): void {
    // Logic to submit counselling remarks

    Swal.fire({
      title: "Counselling  Remarks",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        const Regno = application['applicationId'];
        const formData = new FormData();
        formData.append('ApplicationId', Regno);
        formData.append('CounsellingRemarks', result.value);
        
        this.handleCounsellingChange(formData);
      }
    });

 
  }

  private handleCounsellingChange(formData: FormData): void {
    this.studentService.UpdateCounsellingRemarks(formData).subscribe((data: any) => {
      if (data.responseData === 'Cancel') {
        Swal.fire('No Change!', '', 'error');
      } else {
        Swal.fire('Stored Counselling Remarks successfully!', '', 'success').then(() => {
          window.location.reload();
        });
      }
    });
  }
  
  acceptApplication(application: any): void {
    // Logic to accept the application
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
}
