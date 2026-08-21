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
  selector: 'app-DealingUserDashboard',
  templateUrl: './DealingUserDashboard.component.html',
  styleUrls: ['./DealingUserDashboard.component.css']
})
export class DealingUserDashboardComponent implements OnInit {

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

  @ViewChild('EvaluationModal') EvaluationModal: TemplateRef<any>;

  constructor(
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    private authService: AuthService, private cd: ChangeDetectorRef,
    private storageService: StorageService,
    private studentService: SemesterExchangeStuDetailsService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService,
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
          this.GetEmployeeDetails();
          this.NewForm();
        }
      },
      error: err => this.LoginFailed(err)
    });
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'DIA<span class="themeClr"> Dashboard</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  }


  LoginFailed(error: any): void {
    this.IsLoginFailed = true;
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
  AllApplications: any;
  ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = []; loadingIndicator: boolean = false;
  getSEAllApplications(): void {
    this.loadingIndicator = true;
    this.ServicesSM.getAllApplications().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.AllApplications = response.item1;
          // console.log(JSON.stringify(this.AllApplications))
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.AllApplications[0];
          this.columns = Object.keys(this.AllApplications[0]);
          this.columns.push()


        } else {
          this.AllApplications = [];
        }
        // Delay hiding the loader for 2.5 seconds
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 2500);
      },
      error: err => {
        this.AllApplications = [];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 2500);
        this.LoginFailed(err);
      }
    });
  }
  GetStudentApplication(application: any) {
    const Regno = application['registrationNo'];
    this.router.navigateByUrl('ApplicationDetails/' + this.LoginName + '/' + Regno);
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



  viewDocument(documentPath: any) {
    const fileStr = String(documentPath ?? '').trim();
    if (!fileStr || ['na', 'n/a', 'none', 'null', 'undefined'].includes(fileStr.toLowerCase())) {
      Swal.fire({
        title: 'File Not Found',
        text: 'No document file is available for download.',
        icon: 'info',
      });
      return;
    }

    const fullUrl = fileStr.startsWith('http://') || fileStr.startsWith('https://')
      ? fileStr
      : `${this.serverUrl}${fileStr}`;

    Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while your document is being retrieved.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    this.studentService.downloadFile(fullUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const fileName = fileStr.split('/').pop() || 'Document.pdf';
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        Swal.close();
      },
      error: async (err) => {
        Swal.close();
        if (err?.error instanceof Blob) {
          try {
            const errorMsg = JSON.parse(await err.error.text());
            Swal.fire('Error', errorMsg.message || 'Download failed', 'error');
          } catch {
            Swal.fire('Error', 'Download failed', 'error');
          }
        } else {
          Swal.fire('Error', 'Could not connect to the server or download file', 'error');
        }
      },
    });
  }

  ApplicationId: any;
  UploadRemarks(a: any) {
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



  EvaluationForm!: FormGroup; isForm1Submitted: boolean = false; isSubmitted = false;
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


  // Added on 16-july-25
  EmployeeDetails: any;
  EmployeeName: any; EmployeeCode: any; ContactNoX: any; DepartmentName: any; UserRole: any; isLoginFailed: any;Department:any;
  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          // console.log(JSON.stringify(this.EmployeeDetails))
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode =response.item1[0].employeeCode;
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



}
