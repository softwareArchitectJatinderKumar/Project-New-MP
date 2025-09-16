import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTable } from 'simple-datatables';
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';

import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
@Component({
  selector: 'oldStudentForm',
  templateUrl: './oldStudentForm.component.html',
  styleUrls: ['./oldStudentForm.component.scss']
})
export class StudentFormComponent implements OnInit {

  EnglishTestType: any = ''; IsSelfFunded: any = ''; IsVisaRejected: any = ''; FeesProofDocumentPath: any = ''; ResumeDocumentPath: any = ''; ConsentLetterDocumentPath: any = '';
  PassportDocumentPath: any = '';
  NewExchangeRegistration(arg0: any) { throw new Error('Method not implemented.'); }


  SemesterExchangeRegistration!: FormGroup; isForm1Submitted: boolean = false; isSubmitted = false;
  isLoading: boolean = false;
  get form1() {
    return this.SemesterExchangeRegistration.controls;
  }
  LoadNewForm() {
    this.SemesterExchangeRegistration = this.fb.group({
      RegistrationNo: [''],
      CountryCode: ['', Validators.required],
      CountryName: ['', Validators.required],
      WhatsAppNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      ParentContact: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      EmailId: ['', [Validators.required, Validators.email]],
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],

      PassportStatus: ['', Validators.required],
      PassportNumber: [''],
      PassportIssueDate: [''],
      PassportValidUpto: [''],
      PassportDocumentPath: [''],

      IsVisaRejected: ['', Validators.required],
      VisaRejectedReason: [''],
      VisaRejectedCountry: [''],

      EnglishTestType: ['', Validators.required],
      SpeakingScore: [''],
      ListeningScore: [''],
      ReadingScore: [''],
      WritingScore: [''],
      OverallScore: [''],
      EnglishTestYear: [''],
      EnglishTestDocumentPath: [''],

      IsSelfFunded: ['', Validators.required],
      SponsorName: [''],
      SponsorRelation: [''],
      SponsorContact: [''],
      AvailableFunds: ['', Validators.required],
      AcceptPolicy: [false, Validators.requiredTrue],

      FeesProofDocumentPath: [''],
      ResumeDocumentPath: [''],
      ConsentLetterDocumentPath: [''],
      TotalCountGradeF: [''],
    });


  }
  showPolicy = false;
  feeReceiptFile: File | null = null;
  cvResumeFile: File | null = null;
  consentLetterFile: File | null = null;


  togglePolicy(event: MouseEvent): void {
    event.preventDefault(); // prevent page scroll
    this.showPolicy = !this.showPolicy;
  }


  showTable: boolean = true; PhoneNumber: any; parentContact: any;
  ApplyingOption: any = '';
  data: any[] = [0, 1, 2, 3, 4, 5, 6, 7]; // for sending the inner component
  // data: any[] = ['0','1','2','3','4','5','6','7','8']; // for sending the inner component
  StageName: any[] = []; folderUrl: string; serverUrl: string; serverUrlX: string; allDocumentsUploaded: boolean;
  documentForm: FormGroup; loginFailed: boolean = false;
  allcheckListDocs: { [key: string]: { documentName: string, filePath: string, isAPproved: boolean } } = {};
  checkListDocs: any[] = [{ documentName: 'Document 1', forAdmin: false, isApproved: false }];
  ngbNavLink: any; activeNavItem: any; ContinueNextBtn: Boolean = false; defaultNavActiveId: any;
  checkListUploadedDocs: any; stuData: any; uniData: any; university: any; stuApplication: any; RegistrationNo: any;
  ApplicationId: any; ApplicationStatus: any; ContactNo: string; stuWhatsNo: string; EmailId: string;
  CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
  UniversityOption4: string; courseName: any; studentName: any; cgpa: any; CurrentYear: any; CurrentTerm: any; CourseTotalDuration: any; CourseTotalTerms: any; StudentStatus: any; WhatsAppNo: any;
  uploadedDocList: any[] = []; feesReceipt: string; DocumentName: any; DocumentPath: any; CreatedBy: string; FeesFile: any;
  ApplicationFile: any; ResumeFile: any; PhotoFile: any; PassportFile: any; FeesDocs: any; fileName: string;
  cgpa1: any; studentEmailId: any; LoginName: any; Elgible: boolean = false; SchoolName: any; FeesPaidStatus: string = 'Pending ';
  isDisabled: any = 'true';
  // showPolicy: boolean = false;

  // Inside your component class (e.g., ApplicationFormComponent)
  englishProficiency: string = '';
  listeningScore!: number;
  speakingScore!: number;
  readingScore!: number;
  writingScore!: number;
  overallScore!: number;
  testYear!: number;
  testDate!: string;

  AvailableFunds: string = '';
  sponsorType: string = '';
  otherSponsorName: string = '';
  otherSponsorRelation: string = '';
  otherSponsorAmount: string = '';
  ColumnMode = ColumnMode; columns: any;
  loadingIndicator: boolean;

  constructor(
    private AuthServicess: AuthService,
    private StorageServicess: StorageService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public formBuilder: UntypedFormBuilder, private fb: FormBuilder,
    private router: Router, private title: Title) { }
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Semester Exchange Registration");
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.getToken(this.LoginName);
    }
    // this.initForm();
    this.LoadNewForm();
  }



  getToken(id: any) {
    this.AuthServicess.loginTemp(id).subscribe({
      next: data => {
        this.StorageServicess.saveUser(data);
        const authToken = this.StorageServicess.getUser();
        // Check for failed login cases
        if (!this.StorageServicess.isLoggedIn() || authToken === 'Token Expired' || !authToken) {
          this.LoginFailed('Invalid or expired token');
          return; // Stop further execution
        }

        // Token is valid, proceed
        this.loginFailed = false;
        this.getStudentDetail();
        this.folderUrl = this.ServicesSM.getFolderUrl();
        this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
        this.allDocumentsUploaded = false;
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
  handleConditionalFields() {
    this.documentForm.get('englishProficiency')?.valueChanges.subscribe(value => {
      const showTestDetails = value === 'Yes';
      const showApplied = value === 'Applied';

      const testControls = ['listeningScore', 'speakingScore', 'readingScore', 'writingScore', 'overallScore', 'testYear'];
      const appliedControls = ['testDate'];

      testControls.forEach(control => {
        const ctrl = this.documentForm.get(control);
        if (ctrl) {
          ctrl.clearValidators();
          if (showTestDetails) {
            ctrl.setValidators([Validators.required]);
          }
          ctrl.updateValueAndValidity();
        }
      });

      const testDateCtrl = this.documentForm.get('testDate');
      if (testDateCtrl) {
        testDateCtrl.clearValidators();
        if (showApplied) {
          testDateCtrl.setValidators([Validators.required]);
        }
        testDateCtrl.updateValueAndValidity();
      }
    });

    this.documentForm.get('sponsorType')?.valueChanges.subscribe(value => {
      const otherSelected = value === 'Other';
      const nameCtrl = this.documentForm.get('otherSponsorName');
      const relationCtrl = this.documentForm.get('otherSponsorRelation');

      if (nameCtrl && relationCtrl) {
        nameCtrl.clearValidators();
        relationCtrl.clearValidators();

        if (otherSelected) {
          nameCtrl.setValidators([Validators.required]);
          relationCtrl.setValidators([Validators.required]);
        }

        nameCtrl.updateValueAndValidity();
        relationCtrl.updateValueAndValidity();
      }
    });
  }



  PassportFileData: any; PassportFileStatus: boolean = false;
  PassportFileName: any;
  onFileSelectedPassportFile(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.PassportFileData = modifiedFile;
      this.PassportFileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.PassportFileData = ssssArray[1];
        this.PassportFileName = validFileName;
      };

      return;
    }

    this.PassportFileData = file;
    this.PassportFileStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.PassportFileData = ssssArray[1];
        this.PassportFileName = file.name;
      };
    }
  }

  ResumeFileData: any; ResumeFileStatus: boolean = false;
  ResumeFileName: any;
  onFileSelectedResumeFile(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.ResumeFileData = modifiedFile;
      this.ResumeFileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
        this.ResumeFileName = validFileName;
      };

      return;
    }

    this.ResumeFileData = file;
    this.ResumeFileStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
        this.ResumeFileName = file.name;
      };
    }
  }

  FeesProofData: any; FeesProofStatus: boolean = false;
  FeesProofFileName: any;
  onFileSelectedFeesProof(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.FeesProofData = modifiedFile;
      this.FeesProofStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
        this.FeesProofFileName = validFileName;
      };

      return;
    }

    this.FeesProofData = file;
    this.FeesProofStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
        this.FeesProofFileName = file.name;
      };
    }
  }


  ConsentLetterData: any; ConsentLetterStatus: boolean = false;
  ConsentLetterFileName: any;
  onFileSelectedConsentLetter(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.ConsentLetterData = modifiedFile;
      this.ConsentLetterStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ConsentLetterData = ssssArray[1];
        this.ConsentLetterFileName = validFileName;
      };

      return;
    }

    this.ConsentLetterData = file;
    this.ConsentLetterStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ConsentLetterData = ssssArray[1];
        this.ConsentLetterFileName = file.name;
      };
    }
  }



  Onsubmit(): void {
    this.isForm1Submitted = true;
    if (this.SemesterExchangeRegistration.invalid) return;
    this.isLoading = true;
    const minLoadingTime = 2500; // 2.5 seconds
    const startTime = Date.now();
    const formData = new FormData();
    const formValue = this.SemesterExchangeRegistration.value;

    // const formValue = this.SemesterExchangeRegistration.getRawValue();

    // Append regular form fields
    formData.append("RegistrationNo", this.RegistrationNo);
    formData.append("EmailId", formValue.EmailId);
    formData.append("CountryCode", formValue.CountryCode);
    formData.append("CountryName", formValue.CountryName);
    formData.append("WhatsAppNo", formValue.WhatsAppNo);
    formData.append("PhoneNumber", formValue.PhoneNumber);
    formData.append("ParentContact", formValue.ParentContact);
    formData.append("ApplyingOption", formValue.ApplyingOption);
    formData.append("UniversityOption1", formValue.UniversityOption1);
    formData.append("UniversityOption2", formValue.UniversityOption2);
    formData.append("UniversityOption3", formValue.UniversityOption3);
    formData.append("PassportStatus", formValue.PassportStatus);
    if (this.PassportStatus == 'Yes') {
      formData.append("PassportNumber", formValue.PassportNumber);
      formData.append("PassportIssueDate", formValue.PassportIssueDate);
      formData.append("PassportValidUpto", formValue.PassportValidUpto);
      formData.append("PassportDocumentPath", this.selectedPassportFile);
    }
    else {
      formData.append("PassportNumber", 'NA');
      formData.append("PassportIssueDate", 'NA');
      formData.append("PassportValidUpto", 'NA');
      formData.append("PassportDocumentPath", 'NA');
    }
    formData.append("IsVisaRejected", formValue.IsVisaRejected);
    if (this.IsVisaRejected == 'Yes') {
      formData.append("VisaRejectedReason", formValue.VisaRejectedReason);
      formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry);
    }
    else {
      formData.append("VisaRejectedReason", 'NA');
      formData.append("VisaRejectedCountry", 'NA');
    }
    formData.append("EnglishTestType", formValue.EnglishTestType);
    if (formValue.EnglishTestType == 'Yes') {
      formData.append("SpeakingScore", formValue.SpeakingScore);
      formData.append("ListeningScore", formValue.ListeningScore);
      formData.append("ReadingScore", formValue.ReadingScore);
      formData.append("WritingScore", formValue.WritingScore);
      formData.append("OverallScore", formValue.OverallScore);
      formData.append("EnglishTestYear", formValue.EnglishTestYear);
    }
    else {
      formData.append("SpeakingScore", 'NA');
      formData.append("ListeningScore", 'NA');
      formData.append("ReadingScore", 'NA');
      formData.append("WritingScore", 'NA');
      formData.append("OverallScore", 'NA');
      formData.append("EnglishTestYear", 'NA');
    }
    formData.append("IsSelfFunded", formValue.IsSelfFunded);
    formData.append("SponsorEmail", 'NA');
    formData.append("AvailableFunds", formValue.AvailableFunds);
    formData.append("TotalCountGradeF", this.GradeFcount);
    if (formValue.IsSelfFunded == 'Other') {
      formData.append("SponsorName", formValue.SponsorName);
      formData.append("SponsorRelation", formValue.SponsorRelation);
      formData.append("SponsorContact", formValue.SponsorContact);
      formData.append("SponsorEmail", formValue.SponsorEmail);
    }
    else {
      formData.append("SponsorName", 'NA');
      formData.append("SponsorRelation", 'NA');
      formData.append("SponsorContact", 'NA');
    }
    formData.append("AcceptPolicy", formValue.AcceptPolicy);


    formData.append("ResumeFileName", this.ResumeFileName);
    formData.append("ResumeFileData", this.ResumeFileData);
    formData.append("ConsentLetterFileName", this.ConsentLetterFileName);
    formData.append("ConsentLetterData", this.ConsentLetterData);
    formData.append("FeesProofData", this.FeesProofData);
    formData.append("FeesProofFileName", this.FeesProofFileName);
    formData.append("PassportFileData", this.PassportFileData);
    formData.append("PassportFileName", this.PassportFileName);

    formData.append("AvailableFunds", formValue.AvailableFunds);

    // console.log('Submitting Form Data:');
    // formData.forEach((value, key) => {
    //   console.log(key + ':', value);
    // });
    this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
      .pipe(
        finalize(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(minLoadingTime - elapsed, 0);
          setTimeout(() => {
            this.isLoading = false;
          }, remaining);
        })
      )
      .subscribe({
        next: (data) => {
          // let result = data.item1[0]['msg'];
          let errorCode = data[0].returnData;

          if (errorCode > 0) {
            Swal.fire({
              title: 'Application Created Successfully',
              text: "",
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          } else if (errorCode == -1) {
            Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
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


  LoginFailed(_NewError: any) {
    this.loginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('NewRegsiterPage');
    if (element) {
      element.hidden = true;
    }
  }
  getStudentDetail(): void {
    this.isLoading = true;
    this.ServicesSM.getStudentById().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.stuData = response.item1[0];
          // console.log(JSON.stringify(this.stuData))
          this.loginFailed = false;
          this.studentName = this.stuData.studentName;
          this.RegistrationNo = this.stuData.registerationNumber;
          this.ContactNo = this.stuData.studentMobile;
          this.courseName = this.stuData.courseName;
          this.cgpa = this.stuData.cgpa;
          this.cgpa1 = this.stuData.cgpA1;
          this.CurrentYear = this.stuData.currentYear;
          this.CurrentTerm = this.stuData.currentTerm;
          this.CourseTotalDuration = this.stuData.courseTotalDuration;
          this.CourseTotalTerms = this.stuData.courseTotalTerms;
          this.StudentStatus = this.stuData.studentStatus;
          this.studentEmailId = this.stuData.studentEmail.length < 5 ? 'N/A' : this.stuData.studentEmail;
          this.EmailId = this.studentEmailId != 'N/A' ? this.studentEmailId : ' ';
          this.SchoolName = this.stuData.schoolName;
          if (this.CurrentTerm > 1 && this.CurrentTerm < this.CourseTotalTerms) {
            this.Elgible = true;
          }
          else {
            this.Elgible = false;
          }

          this.getApplicationDetails(this.RegistrationNo);
          this.getUniversityDetails();
          // this.getAllCheckListDocs();
          this.processCgpaSemesters(this.stuData);
          this.GetStudentMarksDetails(this.RegistrationNo);
        }
        else {
          this.stuData = [];
          this.loginFailed = true;
        }
         // Delay hiding the loader for 2.5 seconds
         setTimeout(() => {
          this.isLoading = false;
        }, 2500);
      },
      error: err => {
        setTimeout(() => {
          this.isLoading = false;
        }, 2500);
        this.LoginFailed(err);
        // this.loginFailed = true;
      }
    });
  }

  semesterCgpaList: { semester: number, cgpa: number | null }[] = [];
  lowCgpaCount: number = 0;
  eligible: boolean = true;

  processCgpaSemesters(data: any): void {
    this.semesterCgpaList = [];
    this.lowCgpaCount = 0;
    this.eligible = true;

    for (let i = 1; i <= 12; i++) {
      const key = `cgpA${i}`;
      const cgpa = data[key] !== null ? Number(data[key]) : null;

      this.semesterCgpaList.push({ semester: i, cgpa });

      if (cgpa !== null && cgpa < 6) {
        this.lowCgpaCount++;
        this.eligible = false;
      }
    }
  }
  VisitUrl(Id: any, name: any, Sufix: any) {
    this.router.navigateByUrl(Sufix + '/' + name + '/' + Id).then(() => {
      // window.location.reload();
    });
  }
  getApplicationDetails(regId: string): void {
    this.ServicesSM.getApplicationDetailsBYId(regId).subscribe((response) => {
      if (response.item1.length > 0) {
        this.stuApplication = response.item1[0];

        if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected == null) {
          this.ApplicationStatus = true;
        } else if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected === true) {
          this.ApplicationStatus = false;
        }

        this.CountryCode = this.stuApplication.countryCode;
        this.stuWhatsNo = this.stuApplication.whatsAppNo;
        this.EmailId = this.stuApplication.emailId;
        this.ApplicationId = this.stuApplication.applicationId;
        this.UniversityOption1 = this.stuApplication.universityOption1;
        this.UniversityOption2 = this.stuApplication.universityOption2;
        this.UniversityOption3 = this.stuApplication.universityOption3;

        Swal.fire({
          title: 'Application Verified',
          text: 'Do you want to proceed to your Student Dashboard?',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Yes, Proceed',
          cancelButtonText: 'No, Stay Here'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
          }
        });

      }
      else {
        // this.stuApplication.applicationStatus = null;
        this.stuApplication = null;
        this.ApplicationStatus = null;
        // this.getStudentDetail(regId);
        // console.log(JSON.stringify(this.stuData));

        // console.log(JSON.stringify(this.uniData));
      }
    });
  }


  getUniversityDetails(): void {
    this.ServicesSM.getUniversityDetails().subscribe((response) => {
      this.uniData = response.item1;
      this.university = this.uniData;
      // console.log(JSON.stringify(this.uniData))
    });
  }



  GetIdWiseUploadedDocumentList(Id: any, Doc: any): void {
    this.ServicesSM.GetIdWiseUploadedDocumentList(Id, '').subscribe((response) => {
      this.uploadedDocList = response.item1;
      // console.log(" Uploaded Doc " + JSON.stringify(this.uploadedDocList))
      const document = this.uploadedDocList.find(doc => doc.documentName === 'Fees Paid' && doc.isAPproved === true);

      // console.log("Docs " + JSON.stringify(document));
      if (document) {
        this.FeesPaidStatus = 'Received the Payment ';
        console.log('No document found with DocumentName="Fees Paid" and isApproved=true.' + this.FeesPaidStatus);
      } else {
        this.FeesPaidStatus = 'Pending Payment ';
        console.log('No document found with DocumentName="Fees Paid" and isApproved=true.' + this.FeesPaidStatus);
      }


    });
  }
  PassportStatus: string = '';
  PassportNumber: string = '';
  PassportIssueDate: string = '';
  PassportValidUpto: string = '';
  VisaRejected: string = '';
  VisaRejectionReason: string = '';
  VisaRejectionCountry: string = '';

  // onPassportFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // Handle file upload logic here
  //   }
  // }
  headHtmlData: any;
  StudentDetailsWithMarks: any = [];
  GradeFcount: any = '';
  FGradesWithSemesterCourse: { semester: string, course: string, grade: string, gradeNum: string }[] = [];
  FGradeGroupedDetails: { semester: string, course: string, count: number }[] = [];

  GetStudentMarksDetails(Regdno: any) {
    // this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
    //   next: response => {
    //     if (response.item1.length > 0) {
    //       this.StudentDetailsWithMarks = response.item1;
    //       console.log(JSON.stringify(this.StudentDetailsWithMarks));
    //       // Filter subjects with gradeNum <= 6
    //       const lowGrades = this.StudentDetailsWithMarks.filter((item: { gradeNum: any; }) => {
    //         const grade = Number(item.gradeNum);
    //         return !isNaN(grade) && grade <= 6;
    //       });

    //       // Count those grades
    //       this.GradeFcount = lowGrades.length;

    //       // Store semester + gradeNum for each
    //       this.LowGradeList = lowGrades.map((item: { semester: any; gradeNum: any; }) => ({
    //         semester: item.semester,
    //         gradeNum: item.gradeNum
    //       }));

    //       // Exclude unwanted columns
    //       const excludeKeys = [
    //         "registerationNumber", "srno", "termId", 
    //         // "courseCode", "course", "credit", "grade",   "examGroup",  "failCount", "failCountStatus", "semester",
    //         "marksMax", "marksObtd", "status", "id", "isSummerTermGiven", "summerTermCourseCode","gradeNum", "tgpa", "cgpa",
    //         "examCentreAddressID", "astricPrint",
    //         "dsrnO", "eg", "camm", "camo", "ettmm", "ettmo",
    //         "etpmm", "etpmo", "colCode", "sgpa"
    //       ];

    //       const allKeys = Object.keys(this.StudentDetailsWithMarks[0]);
    //       this.columns = allKeys.filter(key => !excludeKeys.includes(key));
    //     } else {
    //       this.StudentDetailsWithMarks = [];
    //       this.GradeFcount = 0;
    //       this.LowGradeList = [];
    //     }
    //   },
    //   error: err => {
    //     this.LoginFailed(err);
    //   }
    // });

    //     this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
    //       next: response => {
    //         if (response.item1.length > 0) {
    //           this.StudentDetailsWithMarks = response.item1;

    //           // Filter F grades
    //           const fGradeItems = this.StudentDetailsWithMarks.filter((item: { grade: string; }) => item.grade?.toUpperCase() === 'F');

    //           // Count of total F grades
    //           this.GradeFcount = fGradeItems.length;

    //           // Map to group F grades by semester and course
    //           const groupMap = new Map<string, { semester: string; course: string; count: number }>();

    //           fGradeItems.forEach((item: { semester: any; courseCode: any; course: any; }) => {
    //             const key = `${item.semester}::${item.courseCode}::${item.course}`;
    //             if (groupMap.has(key)) {
    //               groupMap.get(key)!.count += 1;
    //             } else {
    //               groupMap.set(key, {
    //                 semester: item.semester,
    //                 course: `${item.courseCode} :: ${item.course}`,
    //                 count: 1
    //               });
    //             }
    //           });

    //           // Convert map to array for display
    //           this.FGradeGroupedDetails = Array.from(groupMap.values());

    //           // Exclude unwanted columns
    //           const excludeKeys = [
    //             "registerationNumber", "srno", "termId", 
    //             // "courseCode", "course", "credit", "grade",   "examGroup",  "failCount", "failCountStatus", "semester",
    //             "marksMax", "marksObtd", "status", "id", "isSummerTermGiven", "summerTermCourseCode","gradeNum", "tgpa", "cgpa",
    //             "examCentreAddressID", "astricPrint",
    //             "dsrnO", "eg", "camm", "camo", "ettmm", "ettmo",
    //             "etpmm", "etpmo", "colCode", "sgpa"
    //           ];
    //           const allKeys = Object.keys(this.StudentDetailsWithMarks[0]);
    //       this.columns = allKeys.filter(key => !excludeKeys.includes(key));
    //     } else {
    //       this.StudentDetailsWithMarks = [];
    //       this.GradeFcount = 0;
    //       this.FGradeGroupedDetails = [];
    //     }
    //   },
    //   error: err => {
    //     this.LoginFailed(err);
    //   }
    // });



    this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.StudentDetailsWithMarks = response.item1;

          // Exclude unwanted columns
          const excludeKeys = [
            "registerationNumber", "srno", "termId", "courseCode", "course", "credit", "grade",
            "marksMax", "marksObtd", "status", "id", "isSummerTermGiven", "summerTermCourseCode",
            "examCentreAddressID", "astricPrint", "examGroup", "gradeNum", "tgpa", "cgpa", "failCount",
            "failCountStatus", "semester", "dsrnO", "eg", "camm", "camo", "ettmm", "ettmo",
            "etpmm", "etpmo", "colCode", "sgpa"
          ];
          const allKeys = Object.keys(this.StudentDetailsWithMarks[0]);
          this.columns = allKeys.filter(key => !excludeKeys.includes(key));

          // Initialize counters and storage
          this.GradeFcount = 0;
          this.FGradesWithSemesterCourse = [];
          const groupMap = new Map<string, { semester: string; course: string; count: number }>();

          for (const item of this.StudentDetailsWithMarks) {
            const gradeStr = item.grade?.toUpperCase();
            const gradeNum = parseInt(item.gradeNum, 10);

            // If grade is F or gradeNum ≤ 6
            if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
              this.GradeFcount++;

              // Store full semester-course entries (previous logic)
              this.FGradesWithSemesterCourse.push({
                semester: item.semester,
                course: `${item.courseCode} :: ${item.course}`,
                grade: item.grade,
                gradeNum: item.gradeNum
              });

              // Group by semester-course for count (new logic)
              const key = `${item.semester}::${item.courseCode}::${item.course}`;
              if (groupMap.has(key)) {
                groupMap.get(key)!.count += 1;
              } else {
                groupMap.set(key, {
                  semester: item.semester,
                  course: `${item.courseCode} :: ${item.course}`,
                  count: 1
                });
              }
            }
          }

          this.FGradeGroupedDetails = Array.from(groupMap.values());
        } else {
          this.StudentDetailsWithMarks = [];
          this.GradeFcount = 0;
          this.FGradeGroupedDetails = [];
          this.FGradesWithSemesterCourse = [];
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });

  }

  EnglishProficiency = '';
  AvailableFund: number | null = null;
  Budget: number | null = null;
  AcceptPolicy = false;

  // Dynamic English proficiency options (depends on some condition)
  englishProficiencyOptions: string[] = [];

  // Flags for Available Fund and Feed Receipt
  isFundRequired = false;
  feedReceiptRequired = true; // assume it's required, adjust as needed
  feedReceiptMissing = true; // true if no file selected

  // Flags for Available Fund and Feed Receipt
  setEnglishProficiencyOptions() {
    // Example logic, update based on your business rules
    if (this.SomeCondition()) {
      this.englishProficiencyOptions = ['IELTS', 'TOEFL', 'PTE'];
    } else {
      this.englishProficiencyOptions = ['Basic', 'Intermediate', 'Advanced'];
    }
  }

  SomeCondition(): boolean {
    // Replace with your condition (e.g., country selected, applying option)
    return true;
  }

  onFeedReceiptChange(event: any) {
    const file = event.target.files[0];
    this.feedReceiptMissing = !file; // set flag based on whether a file is selected
  }
  applicationForm!: FormGroup;

  NewWayFor() {
    this.applicationForm = this.fb.group({
      CountryCode: ['', Validators.required],
      WhatsAppNo: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      parentContact: ['', Validators.required],
      EmailId: ['', [Validators.required, Validators.email]],
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],
      CreatedBy: [''],
      RegistrationNo: [''],
      ContactNo: [''],
      PassportStatus: ['', Validators.required],
      PassportNumber: ['',],
      PassportIssueDate: ['',],
      PassportValidUpto: ['',],
      VisaRejected: ['', Validators.required],
      VisaRejectionReason: ['',],
      VisaRejectionCountry: ['',],
      englishProficiency: ['', Validators.required],
      listeningScore: [''],
      speakingScore: ['',],
      readingScore: ['',],
      writingScore: ['',],
      overallScore: ['',],
      testYear: ['',],
      testDate: ['',],
      sponsorType: ['', Validators.required],
      AvailableFunds: ['', Validators.required],
      otherSponsorName: ['',],
      otherSponsorRelation: ['',],
      AcceptPolicy: [false, Validators.requiredTrue]
    });


  }

  isControlInvalid(controlName: string): boolean {
    const control = this.applicationForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  selectedPassportFile: any = '';
  onPassportFileSelected(event: Event) {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.selectedPassportFile = modifiedFile;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedPassportFile = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }

    this.selectedPassportFile = file;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedPassportFile = ssssArray[1];
        this.fileName = file.name;
        // alert(10);  

      };
    }
  }
  selectedFileConsentLetter: any = '';
  onConsentLetterSelected(event: Event) {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.selectedFileConsentLetter = modifiedFile;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedFileConsentLetter = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }

    this.selectedFileConsentLetter = file;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedFileConsentLetter = ssssArray[1];
        this.fileName = file.name;
        // alert(10);  

      };
    }
  }
  selectedResumeDocumentFile: any = '';
  onResumeDocumentFileSelected(event: Event) {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.selectedResumeDocumentFile = modifiedFile;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedResumeDocumentFile = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }

    this.selectedResumeDocumentFile = file;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedResumeDocumentFile = ssssArray[1];
        this.fileName = file.name;
        // alert(10);  

      };
    }
  }
  selectedFeesProofFile: any = '';
  // onFeesProofFileSelected(event: Event) {
  //   alert(0)
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length) {
  //     this.selectedFeesProofFile = input.files[0];
  //     this.SemesterExchangeRegistration.patchValue({
  //       FeesProofDocumentPath: this.selectedFeesProofFile.name // or some metadata
  //     });
  //   }
  // }

  onFeesProofFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.selectedFeesProofFile = modifiedFile;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedFeesProofFile = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }

    this.selectedFeesProofFile = file;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.selectedFeesProofFile = ssssArray[1];
        this.fileName = file.name;
        // alert(10);  

      };
    }
  }
  passportNumberValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const status = this.applicationForm.get('PassportStatus')?.value;
      if (status === 'Yes' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  passportDateValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const status = this.applicationForm.get('PassportStatus')?.value;
      if (status === 'Yes' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  visaRejectionReasonValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const rejected = this.applicationForm.get('VisaRejected')?.value;
      if (rejected === 'Yes' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  visaRejectionCountryValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const rejected = this.applicationForm.get('VisaRejected')?.value;
      if (rejected === 'Yes' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  englishScoreValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const prof = this.applicationForm.get('englishProficiency')?.value;
      if (prof === 'Yes' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  englishTestDateValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const prof = this.applicationForm.get('englishProficiency')?.value;
      if (prof === 'Applied' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  otherSponsorNameValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const sponsorType = this.applicationForm.get('sponsorType')?.value;
      if (sponsorType === 'Other' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  otherSponsorRelationValidator(control: AbstractControl) {
    if (this.applicationForm) {
      const sponsorType = this.applicationForm.get('sponsorType')?.value;
      if (sponsorType === 'Other' && !control.value) {
        return { required: true };
      }
    }
    return null;
  }

  onSubmit() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
      return;
    }
    console.log('Form submitted', this.applicationForm.value);
    alert('Application submitted successfully!');
  }


  // onFileChange(event: Event, fileType: string): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length) {
  //     const file = input.files[0];
  //     console.log(`${fileType} file selected:`, file.name);
  //     // Further processing
  //   }
  // }

  // togglePolicy(): void {
  //   this.showPolicy = !this.showPolicy;
  // }
}
