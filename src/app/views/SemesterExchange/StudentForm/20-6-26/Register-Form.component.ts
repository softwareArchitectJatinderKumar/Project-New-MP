import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { countries } from '../countries-list';

import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { start } from 'repl';

@Component({
  selector: 'app-Register-Form',
  templateUrl: './Register-Form.html',
  styleUrls: ['./NewLogicForm.component.scss']
})
export class RegisterFormcomponent implements OnInit {


  // Logic added on 5-June-26

   // add counselling authorities list
    counsellingAuthorities = [
        { index: 1, name: 'Suraj', uid: '33333' },
        { index: 2, name: 'Rupali', uid: '30922' },
        { index: 3, name: 'Divya', uid: '34923' }
    ];

    // computed flag
   get showCounsellingAuthority(): boolean {
        return true;
    
    }

 updateCounsellingAuthorityValidator() {
        const control = this.form.get('CounsellingAuthority');
        if (!control) return;
        if (this.showCounsellingAuthority) {
            control.setValidators([Validators.required]);
        } else {
            control.clearValidators();
            control.setValue('');
        }
        control.updateValueAndValidity();
    }

  // State Flags
  isLoading: boolean = false;
  loginFailed: boolean = false;
  isEligible: boolean = false; // Controls visibility of the main wizard
  currentStep: number = 0;

  // Forms
  eligibilityForm!: FormGroup; // New form for the initial check
  form!: FormGroup; // Main registration wizard form

  // Data Properties
  LoginName: any;
  RegistrationNo: any;
  studentName: any;
  courseName: any;
  cgpa: any;
  CurrentYear: any;
  CurrentTerm: any;
  ProgramCode: any;
  SectionCode: any;
  studentStatus: any;

  uniData: any;
  countries: any = countries;

  // File Upload Trackers
  uploadedResumeName: string = '';
  uploadedPassportName: string = '';
  uploadedEnglishName: string = '';
  uploadedConsentName: string = '';
  uploadedOtherFiles: { key: string, name: string }[] = [];
  uploadedFiles: { key: string; file: File; name: string }[] = [];

  // Wizard Configuration
  stepIcons = ['bi-clipboard-check', 'bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-file-earmark-arrow-up', 'bi-check2-circle'];
  stepLabels = [
    'Eligibility Checked',
    'Contact Details & Preferences',
    'Passport & English Details',
    'Sponsor Details & Declaration',
    'Documents Upload',
    'Review & Submit'
  ];

  englishOptions = [
    { value: '', label: 'Select'},
    { value: 'Applied', label: 'Applied'},
    { value: 'NotRequired', label: 'Not required'},
    { value: 'NotGiven', label: 'Not Given' },
    { value: 'Appeared', label: 'Appeared / Given'},
  ];
  englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];


  availableFundsOptions = [
    { value: '', label: 'Select' },
    { value: '2 to 4 Lakhs', label: '2 to 4 Lakhs' },
    { value: '4 to 6 Lakhs', label: '4 to 6 Lakhs' },
    { value: '6 to 8 Lakhs', label: '6 to 8 Lakhs' },
    { value: '8 to 10 Lakhs', label: '8 to 10 Lakhs' },
  ];


  isSubmitted = false;
  PresentDate: string;
  showPolicy = true;

    // --- STATE & LOADER FLAGS ---
  private readonly MIN_LOADER_TIME = 10; 
  private loaderStartTime: number = 0;

   // --- LOADER UTILITIES ---
  private startLoader(): void {
    this.isLoading = true;
    this.loaderStartTime = Date.now();
  }

  private stopLoader(): void {
    const elapsed = Date.now() - this.loaderStartTime;
    const remaining = Math.max(0, this.MIN_LOADER_TIME - elapsed);
    setTimeout(() => this.isLoading = false, remaining);
  }




  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private servicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    public fb: FormBuilder,
    private router: Router,
    private title: Title
  ) {
    this.PresentDate = this.formatDate(new Date());
    this.buildEligibilityForm();
  }

  ngOnInit(): void {
    this.PresentDate = this.formatDate(new Date());

             
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '  Semester  <span class="text-info"> Exchange  </span> Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.startLoader();
      this.getToken(this.LoginName);
      
    }
    const consentControl = this.form.get('ConsentLetterDocumentPath');
    if (consentControl) {
      consentControl.clearValidators();
      consentControl.updateValueAndValidity();
    }
  }
  private buildEligibilityForm(): void {
    this.eligibilityForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    });
  }
  private buildMainForm(): void {
    this.form = this.fb.group(
      {
        // Contact Information
        CountryName: ['', Validators.required],
        EmailId: ['', [Validators.required, Validators.email]],
        // Phone fields validated by PhoneInputComponent (NG_VALIDATORS); pattern length 8–14 digits with dial code
        WhatsAppNo: ['', [Validators.required]],
        PhoneNumber: [''],
        ParentContact: [''],
        HasRelativeDetails: ['', Validators.required],
        RelativeName: [''], RelativeCountryName: [''], RelativeRelation: [''],
        RelativePhone: [''], RelativeEmail: [''],

        // University Preferences
        ApplyingOption: ['', Validators.required],
        UniversityOption1: ['', Validators.required],
        UniversityOption2: ['', Validators.required],
        UniversityOption3: ['', Validators.required],

        // Passport & Visa
        PassportStatus: ['', Validators.required],
        PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''],
        IsVisaRejected: ['', Validators.required],
        VisaRejectedReason: [''], VisaRejectedCountry: [''],

        // English Proficiency
        EnglishTestType: ['', Validators.required],
        TestName: [''], TestDate: [''], ListeningScore: [''], SpeakingScore: [''],
        ReadingScore: [''], WritingScore: [''], OverallScore: [''], EnglishTestYear: [''],

        // Sponsor & Declaration
        SponsorType: ['', Validators.required],
        AvailableFunds: ['', Validators.required],
        SponsorName: [''],
        SponsorRelation: [''],
        AcceptPolicy: [true, Validators.requiredTrue],
        SponsorContact: [''],
        SponsorEmail: [''],
        // Document paths 
        PassportDocumentPath: [''],
        EnglishDocumentPath: [''],
        FeesDocumentPath: [''],
        ResumeDocumentPath: ['', Validators.required],
        ConsentLetterDocumentPath: [''],
        OtherDocumentPaths: [[]]

      },
      { validators: [this.distinctPhoneNumbersValidator()] }
    );
    this.setupConditionalValidators();
    this.subscribeToFormChanges();

     if (!this.form.get('CounsellingAuthority')) {
            this.form.addControl('CounsellingAuthority', this.fb.control(''));
        }
  }

  checkEligibility(): void {
    if (this.eligibilityForm.invalid) {
      this.eligibilityForm.markAllAsTouched();
      return;
    }
    
    const { email, contactNumber } = this.eligibilityForm.value;
    this.startLoader();
    this.servicesSM.getStudentById()
      .subscribe({
        next: (response: any) => {
          const studentInfo = response.item1?.[0];
          if (studentInfo) {
            this.RegistrationNo = studentInfo.registerationNumber;
            this.getToken(this.LoginName);
             this.stopLoader();
          } else {
            this.stopLoader();
            Swal.fire({ title: 'Not Eligible', text: 'Email/Contact did not match any record.', icon: 'warning' });
          }
        },
        error: () => {
          Swal.fire({ title: 'Error', text: 'Failed to verify details. Try again.', icon: 'error' });
        }
      });

  }
  ApplicationID: any;
  getTokenY(loginId: any): void {
    this.authService.loginTemp(loginId).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.buildMainForm();
        this.getStudentDetail(); 
      },
      error: () => { this.stopLoader(); this.loginFailed = true; }
    });
  }

  getToken(loginId: any): void {     
   
    this.authService.loginTemp(loginId).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
           this.loginFailed = true;
          this.LoginFailed('Invalid or expired token');                  
        } else {
            this.loginFailed = false;
            this.buildMainForm();
            this.getStudentDetail();
              
        }
      },
      error: () => { this.stopLoader(); this.loginFailed = true; }
      });
  }
  ContactNo: any;
  getStudentDetail(): void {
    this.servicesSM.getStudentById() 
      .subscribe({
        next: response => {
          if (response.item1 && response.item1.length > 0) {
            const stuData = response.item1[0];
            // console.log(JSON.stringify(stuData));
            this.studentName = stuData.studentName;
            this.ContactNo = stuData.studentMobile;
            this.RegistrationNo = stuData.registerationNumber;
            this.courseName = stuData.courseName;
            this.cgpa = stuData.cgpa;
            this.CurrentYear = stuData.currentYear;
            this.CurrentTerm = stuData.currentTerm;
            this.studentStatus = stuData.studentStatus;
            this.form.get('EmailId')?.setValue(stuData.studentEmail || this.eligibilityForm.get('email')?.value);


             this.updateCounsellingAuthorityValidator();

            this.checkApplicationStatusBeforeEligibility();
          } else {
            this.LoginFailed('Student data not found');
          }
        },
        error: err => this.LoginFailed(err)
      });
  }

  private checkApplicationStatusBeforeEligibility(): void {
    this.servicesSM.getApplicationDetailsBYId(this.RegistrationNo)     
      .subscribe({
        next: (response) => {
          const stuApplication = response.item1?.[0];
          this.ApplicationID = stuApplication?.applicationId;

          if (+(this.ApplicationID) > 0) {
            this.stopLoader();
            Swal.fire({ title: 'Application Already Exists', icon: 'success' }).then(() => {
              this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
            });
          }
          else if (this.studentStatus !== 'A') {
            this.setIneligible('Student account is not active.');
          }
          else { this.runEligibilityChecks(); }
         
        },
        error: (err) => this.LoginFailed(err)
      });
                
  }

  private runEligibilityChecks(): void {
    if (this.CurrentTerm == 1 || this.CurrentTerm == 2) {
      this.getPlusTwoMarks(this.RegistrationNo);
    }
    else if (this.CurrentTerm > 2 && +(this.cgpa) >= 6) {
      this.isEligible = true;
      this.getStudentCodeDetails(this.RegistrationNo);
    } else {
      this.servicesSM.GetStudentAllPreviousMarks(this.RegistrationNo)
     
        .subscribe({
          next: response => {
            if (!response || !response.item1?.length) {
              this.setIneligible('No previous mark records found.');
              return;
            }
            this.studentAcademicDetail = response.item4?.[0] || {};
            this.ProgramCode = this.studentAcademicDetail.PName ? this.studentAcademicDetail.PName.split(':')[0].trim() : this.ProgramCode;
            this.SectionCode = this.studentAcademicDetail.Section;
           

          }
        })
      this.setIneligible('CGPA must be more than 6 .');
     
      // this.GetStudentAllPreviousMarks(this.RegistrationNo);      
    }
  }

  getPlusTwoMarks(Regdno: any): void {    
    this.servicesSM.GetStudentAllPreviousMarks(Regdno)     
      .subscribe({
        next: response => {
          if (!response || !response.item1?.length) {
            this.setIneligible('No previous mark records found.');
            return;
          }

          const studentPreviousMarksData = response.item1;
          const plus2Record = studentPreviousMarksData.find((r: any) => r.ExamDescription === '10+2');
          const graduationRecord = studentPreviousMarksData.find((r: any) => r.ExamDescription === 'Graduation');

          const plus2Percentage = plus2Record ? parseFloat(plus2Record.Perecentage) : 0;
          const gradPercentage = graduationRecord ? parseFloat(graduationRecord.Perecentage) : NaN;


          if (!isNaN(gradPercentage)) {
            if (gradPercentage > 65) {
              this.cgpa = gradPercentage;
              this.setEligible();
            } else {
              this.setIneligible('Graduation marks must be > 65.');
            }
          }
          else if (plus2Percentage > 70) {
            this.cgpa = plus2Percentage;
            this.setEligible();
          }
          else {
            this.setIneligible('10+2 marks must be > 70.');
          }

          this.FindGradeFCount(this.RegistrationNo);
          this.getUniversityDetails();
        },
        error: err => this.LoginFailed(err)
      });
  }
 
  getApplicationDetails(regId: string): any {
    this.servicesSM.getApplicationDetailsBYId(regId).pipe(finalize(() => this.isLoading = false))
      .subscribe((response) => {
        const stuApplication = response.item1?.[0];
        this.ApplicationID = stuApplication?.applicationId;
        if (this.ApplicationID > 0) {
          Swal.fire({ title: 'Application Already Exists', icon: 'success' }).then(() => {
            this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
          });
        }
      });
    return this.ApplicationID;
  }

  getStudentCodeDetails(Regdno: any) {
    this.servicesSM.GetStudentAllPreviousMarks(Regdno)
      .subscribe({
        next: response => {
          if (!response || !response.item1?.length) {
            this.setIneligible('No previous mark records found.');
            return;
          }
          this.studentAcademicDetail = response.item4?.[0] || {};
          this.ProgramCode = this.studentAcademicDetail.PName ? this.studentAcademicDetail.PName.split(':')[0].trim() : this.ProgramCode;
          this.SectionCode = this.studentAcademicDetail.Section;
          this.FindGradeFCount(this.RegistrationNo);
          this.getUniversityDetails();
          this.setEligible();
        },
        error: err => this.LoginFailed(err)
      });
  }

  GetStudentAllPreviousMarks(Regdno: any): void {
    
    this.servicesSM.GetStudentAllPreviousMarks(Regdno)      
      .subscribe({
        next: response => {
          if (!response || !response.item1?.length) {
            this.setIneligible('No previous mark records found.');
            return;
          }
          this.studentAcademicDetail = response.item4?.[0] || {};
          this.ProgramCode = this.studentAcademicDetail.PName ? this.studentAcademicDetail.PName.split(':')[0].trim() : this.ProgramCode;
          this.SectionCode = this.studentAcademicDetail.Section;
          const studentPreviousMarksData = response.item1;
          const plus2Record = studentPreviousMarksData.find((r: any) => r.ExamDescription === '10+2');
          const GraduationRecord = studentPreviousMarksData.find((r: any) => r.ExamDescription === 'Graduation');
          const percentage = plus2Record ? parseFloat(plus2Record.Perecentage) : NaN;
          const gradPercentage = GraduationRecord ? parseFloat(GraduationRecord.Perecentage) : NaN;
          if ((!Number.isNaN(gradPercentage) && gradPercentage > 65.0)) {
            this.cgpa = gradPercentage;
            this.setEligible();
          } else if (Number.isNaN(gradPercentage) && !Number.isNaN(percentage) && percentage > 60) {
            this.cgpa = percentage;
            this.setIneligible('10+2 percentage criterion not met (required > 60.0%).');
          }
          this.getUniversityDetails();
          this.FindGradeFCount(this.RegistrationNo);
        },
        error: err => this.LoginFailed(err)
      });
  }


  getTableHeaders(obj: any): string[] {
    return Object.keys(obj);
  }
  topHeader: any = ['termId', 'courseCode', 'credit', 'gradeNum', 'grade']
  GradeFcount: any;
  studentDetailsWithMarks: any[];

  SchoolId: any;
  FindGradeFCount(regdNo: any): void {
    this.servicesSM.getStudentDetailsWithMarks(regdNo) 
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {
            this.studentDetailsWithMarks = response.item1;
            this.ProgramCode = this.studentDetailsWithMarks[0].officialCode;
            this.SectionCode = this.studentDetailsWithMarks[0].section;
            this.SchoolId = this.studentDetailsWithMarks[0].schoolId;

            this.GradeFcount = 0; // Reset count
            for (const item of this.studentDetailsWithMarks) {
              const gradeStr = item.grade?.toUpperCase();
              const gradeNum = parseInt(item.gradeNum, 10);

              if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
                this.GradeFcount++;
              }
            }

            let gradeFcount = 0;
            for (const item of this.studentDetailsWithMarks) {
              const gradeStr = item.grade?.toUpperCase();
              const gradeNum = parseInt(item.gradeNum, 10);
              if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
                gradeFcount++;
              }
            }
            // console.log(gradeFcount + ' subjects with Grade F found.' + this.GradeFcount);
          }
        },
        error: err => this.LoginFailed(err)
      });
  }
  School: any;
  private setEligible(): void {
    this.isEligible = true;
    this.currentStep = 1; // Start wizard
    
    this.School=this.studentAcademicDetail['School'];

    // alert(JSON.stringify(this.studentAcademicDetail)+' studentAcademicDetail');
    // alert(this.School + 'School Name  studentAcademicDetail' + this.RegistrationNo);
    Swal.fire({ title: 'Eligibility Confirmed', icon: 'success', timer: 500 });
       this.stopLoader();  
  }

  private setIneligible(reason: string): void {
    this.isEligible = false;
    Swal.fire({ title: 'Not Eligible', text: reason, icon: 'warning',timer: 500 });
       this.stopLoader();  
    return;
  }


  studentPreviousMarksData: any;
  studentTermsMarksData: any;
  studentTermsMarksDataX: any;
  studentGradeMarksData: any;
  studentGradeMarksDataX: any;
  studentAcademicDetail: any;
  studentAcademicDetailX: any;


  getUniversityDetails(): void {
    if (!this.ProgramCode) {
      this.servicesSM.getUniversityLists('').subscribe((response) => {
        this.uniData = response.item1;
      });
    }
    else {
      this.servicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
        this.uniData = response.item1;
      });
    }
  }
  togglePolicy(event: MouseEvent): void {
    event.preventDefault(); // prevent page scroll
    this.showPolicy = !this.showPolicy;
  }


  nextStep(): void {
     this.startLoader(); 
    if (this.currentStep === this.stepLabels.length) return;
    if (this.canProceedToNext(this.currentStep)) {
      this.currentStep++;
      this.isSubmitted = false;
    } else {
      this.isSubmitted = true;
      Swal.fire({ title: 'Validation Error', text: 'Please complete all required fields on this step.', icon: 'error' });
    }
    this.stopLoader();
  }

  prevStep(): void {
    this.startLoader();
    if (this.currentStep > 0) this.currentStep--;
    window.scrollTo(0, 0);
    this.stopLoader();
  }

  submitFinalApplication(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      Swal.fire({ title: 'Validation Error', text: 'Please complete all required fields.', icon: 'error' });
      return;
    }

     this.startLoader();
    // const formData = this.form.value; 
    const formValue = this.form.getRawValue();

    const formData = new FormData();

    // Append regular form fields with checks for 'NA'
    formData.append("SchoolId", this.SchoolId);
    formData.append("SectionCode", this.SectionCode);
    formData.append("RegistrationNo", this.RegistrationNo);
    formData.append("EmailId", formValue.EmailId);
    formData.append("CountryName", formValue.CountryName);
    formData.append("WhatsAppNo", formValue.WhatsAppNo);
    formData.append("PhoneNumber", formValue.PhoneNumber);
    formData.append("ParentContact", formValue.ParentContact);
    formData.append("ApplyingOption", formValue.ApplyingOption);
    formData.append("UniversityOption1", formValue.UniversityOption1);
    formData.append("UniversityOption2", formValue.UniversityOption2);
    formData.append("UniversityOption3", formValue.UniversityOption3);
    formData.append("PassportStatus", formValue.PassportStatus);

    if (formValue.PassportStatus === 'Yes') {
      formData.append("PassportNumber", formValue.PassportNumber);
      formData.append("PassportIssueDate", formValue.PassportIssueDate);
      formData.append("PassportValidUpto", formValue.PassportValidUpto);
      formData.append("PassportDocumentPath", this.PassportDocumentPath); // Use this.PassportFileName
    } else {
      formData.append("PassportNumber", 'NA');
      // formData.append("PassportIssueDate", 'NA');
      // formData.append("PassportValidUpto", 'NA');
      // formData.append("PassportDocumentPath", 'NA');
    }

    formData.append("IsVisaRejected", formValue.IsVisaRejected);
    if (formValue.IsVisaRejected === 'Yes') {
      formData.append("VisaRejectedReason", formValue.VisaRejectedReason);
      formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry);
    } else {
      formData.append("VisaRejectedReason", 'NA');
      formData.append("VisaRejectedCountry", 'NA');
    }

    formData.append("EnglishTestType", formValue.EnglishTestType);
    if (['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
      formData.append("EnglishTestName", formValue.TestName);
      formData.append("SpeakingScore", formValue.SpeakingScore);
      formData.append("ListeningScore", formValue.ListeningScore);
      formData.append("ReadingScore", formValue.ReadingScore);
      formData.append("WritingScore", formValue.WritingScore);
      formData.append("OverallScore", formValue.OverallScore);
      formData.append("EnglishTestYear", formValue.EnglishTestYear);
      formData.append("TestDate", formValue.TestDate);
    }
    if (formValue.EnglishTestType === 'Appeared') {
      formData.append("EnglishTestName", formValue.TestName );
      formData.append("SpeakingScore", formValue.SpeakingScore );
      formData.append("ListeningScore", formValue.ListeningScore);
      formData.append("ReadingScore", formValue.ReadingScore);
      formData.append("WritingScore", formValue.WritingScore);
      formData.append("OverallScore", formValue.OverallScore);
      formData.append("EnglishTestYear", formValue.TestDate);
      formData.append("TestDate", formValue.TestDate);
    }
    else {
      formData.append("EnglishTestName", '');
      formData.append("SpeakingScore", '');
      formData.append("ListeningScore", '');
      formData.append("ReadingScore", '');
      formData.append("WritingScore", '');
      formData.append("OverallScore", '');
      formData.append("EnglishTestYear", '');
      formData.append("TestDate", '');

    }

    formData.append("AvailableFunds", formValue.AvailableFunds);
    formData.append("TotalCountGradeF", this.GradeFcount?.toString()); // Convert number to string

    if (formValue.SponsorType === 'Other') {
      formData.append("IsSelfFunded", 'False');
      formData.append("SponsorType", 'Other');
      formData.append("SponsorName", formValue.SponsorName );
      formData.append("SponsorRelation", formValue.SponsorRelation);
      formData.append("SponsorContact", formValue.SponsorContact); // This field is not in the form, so default to 'NA'
      formData.append("SponsorEmail", formValue.SponsorEmail); // This field is not in the form, so default to 'NA'
    } else {
      formData.append("IsSelfFunded", 'True');
      formData.append("SponsorType", 'Parent');
      formData.append("SponsorName", 'Parent');
      formData.append("SponsorRelation", 'Parent');
      formData.append("SponsorContact", formValue.ParentContact);
      formData.append("SponsorEmail", 'Parent');
    }

    formData.append("AcceptPolicy", formValue.AcceptPolicy ? 'Yes' : 'No');
    formData.append("ResumeFileName", this.ResumeFileName);
    formData.append("ResumeFileData", this.ResumeFileData);
    formData.append("ConsentLetterFileName", this.ConsentLetterFileName);
    formData.append("ConsentLetterData", this.ConsentLetterData);
    formData.append("FeesProofData", this.FeesProofData);
    formData.append("FeesProofFileName", this.FeesProofFileName);
    formData.append("PassportFileData", this.PassportFileData);
    formData.append("PassportFileName", this.PassportFileName);
    formData.append("EnglishProofData", this.EnglishProofData);
    formData.append("EnglishProofFileName", this.EnglishProofFileName);

    formData.append("RelativeCountryName", formValue.RelativeCountryName);
    formData.append("RelativeName", formValue.RelativeName);
    formData.append("RelativeEmail", formValue.RelativeEmail);
    formData.append("RelativePhone", formValue.RelativePhone);
    formData.append("RelativeRelation", formValue.RelativeRelation); // Added RelativeRelation
    formData.append("HasRelativeDetails", formValue.HasRelativeDetails); // Added HasRelativeDetails

      // if counselling authority is required / selected, attach full object
        if (this.showCounsellingAuthority && this.form.value.CounsellingAuthority) {
            const sel = this.counsellingAuthorities.find(a => a.uid === this.form.value.CounsellingAuthority);
            if (sel) {
                 formData.append("counsellingAuthority",  sel.uid );
            }
        }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    this.servicesSM.SemesterExchangeNewRegistrationForm(formData)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          let errorCode = data[0]?.returnData;

          if (errorCode > 0) {
            Swal.fire({ title: 'Application Created Successfully', icon: 'success' }).then(() => {
              window.location.reload();
            });
          } else if (errorCode === -1) {
            Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
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
      this.stopLoader();
  }


  LoginFailed(_NewError: any): void {
    this.loginFailed = true;
    this.isEligible = false;
    Swal.fire({ title: 'Login Failed', text: 'Invalid login or token.', icon: 'warning' });
    this.stopLoader();  
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  subscribeToFormChanges(): void {
    ['UniversityOption1', 'UniversityOption2'].forEach(ctrlName => {
      this.form.get(ctrlName)?.valueChanges.subscribe(value => {
        if (ctrlName === 'UniversityOption1') this.form.get('UniversityOption2')?.setValue('');
        this.form.get('UniversityOption3')?.setValue('');
      });
    });
  }

  private distinctPhoneNumbersValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const wa     = (group.get('WhatsAppNo')?.value    || '').trim();
      const ph     = (group.get('PhoneNumber')?.value   || '').trim();
      const parent = (group.get('ParentContact')?.value || '').trim();

      // Only check distinctness when both WhatsApp and parent contact are provided
      if (!wa || !parent) return null;

      if (wa === parent || (ph && ph === parent)) {
        return { numbersMustBeDistinct: true };
      }
      return null;
    };
  }

  private setupConditionalValidators(): void {
    this.form.get('HasRelativeDetails')!.valueChanges.subscribe(val => {
      const controls = ['RelativeName', 'RelativeCountryName', 'RelativeRelation'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
      const controls = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    this.form.get('IsVisaRejected')!.valueChanges.subscribe(val => {
      const controls = ['VisaRejectedReason', 'VisaRejectedCountry'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    this.form.get('EnglishTestType')!.valueChanges.subscribe(() => this.updateEnglishScoreValidators());
    this.form.get('TestDate')!.valueChanges.subscribe(() => this.updateEnglishScoreValidators());

    // this.form.get('SponsorType')!.valueChanges.subscribe(val => {
    //   const controls = ['SponsorName', 'SponsorRelation'];
    //   controls.forEach(c => this.toggleRequiredValidator(c, val === 'Other'));
    // });


    this.form.get('SponsorType')!.valueChanges.subscribe(val => {

  const requiredControls = [
    'SponsorName',
    'SponsorRelation'
  ];

  requiredControls.forEach(c =>
    this.toggleRequiredValidator(c, val === 'Other')
  );

  if (val === 'Parents') {

    this.form.patchValue({
      SponsorName: '',
      SponsorRelation: '',
      SponsorContact: '',
      SponsorEmail: ''
    });

    ['SponsorName', 'SponsorRelation', 'SponsorContact', 'SponsorEmail']
      .forEach(ctrl => {
        this.form.get(ctrl)?.clearValidators();
        this.form.get(ctrl)?.updateValueAndValidity();
      });
  }
});
  }

  private toggleRequiredValidator(controlName: string, required: boolean): void {
    const control = this.form.get(controlName)!;
    required ? control.setValidators([Validators.required]) : control.clearValidators();
    control.updateValueAndValidity();
  }

  // private updateEnglishScoreValidators(): void {
  //   const englishTestType = this.form.get('EnglishTestType')?.value;
  //   const testDateStr = this.form.get('TestDate')?.value;
  //   const englishDoc = this.form.get('EnglishDocumentPath')!;
  //   const scoreControls = ['ListeningScore', 'SpeakingScore', 'ReadingScore', 'WritingScore', 'OverallScore', 'EnglishTestYear'];

  //   let shouldRequireScores = false;
  //   if (englishTestType === 'Appeared' && testDateStr) {
  //     const testDate = new Date(testDateStr);
  //     const today = new Date();
  //     const testDateOnly = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
  //     const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  //   }
  // }



  private updateEnglishScoreValidators(): void {

  const englishTestType = this.form.get('EnglishTestType')?.value;
  const englishDoc = this.form.get('EnglishDocumentPath');

  if (!englishDoc) return;

  // English Proof compulsory for Applied / Appeared
  if (englishTestType === 'Applied' || englishTestType === 'Appeared') {
    englishDoc.setValidators([Validators.required]);
  } else {
    englishDoc.clearValidators();
    englishDoc.setValue('');
    this.EnglishProofFileName = '';
    this.EnglishProofDocumentPath = '';
  }

  englishDoc.updateValueAndValidity();

  const scoreControls = [
    'TestName',
    'TestDate',
    'ListeningScore',
    'SpeakingScore',
    'ReadingScore',
    'WritingScore',
    'OverallScore'
  ];

  if (englishTestType === 'Appeared') {

    this.toggleRequiredValidator('TestName', true);
    this.toggleRequiredValidator('TestDate', true);

    const testDateStr = this.form.get('TestDate')?.value;

    if (testDateStr) {

      const testDate = new Date(testDateStr);
      const today = new Date();

      const testDateOnly = new Date(
        testDate.getFullYear(),
        testDate.getMonth(),
        testDate.getDate()
      );

      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const requireScores = testDateOnly < todayDateOnly;

      [
        'ListeningScore',
        'SpeakingScore',
        'ReadingScore',
        'WritingScore',
        'OverallScore'
      ].forEach(c => this.toggleRequiredValidator(c, requireScores));
    }
  } else {

    scoreControls.forEach(c => {
      const ctrl = this.form.get(c);
      ctrl?.clearValidators();
      ctrl?.updateValueAndValidity();
    });
  }
}
  CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
  stuData: any;
  canProceedToNext(step: number): boolean {
    const stepControls: { [key: number]: string[] } = {
      1: ['CountryName', 'WhatsAppNo', 'ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3', 'HasRelativeDetails'],
      2: ['PassportStatus', 'IsVisaRejected', 'EnglishTestType'],
      3: ['SponsorType', 'AvailableFunds', 'AcceptPolicy'],
      4: ['ResumeDocumentPath', 'ConsentLetterDocumentPath'],
      5: []
    };


    const controls = stepControls[step];
    if (!controls) return true;

    for (const controlName of controls) {
      const control = this.form.get(controlName);
      if (control?.invalid) return false;
    }

    if (step === 0 && this.form.errors?.numbersMustBeDistinct) return false;

    if (step === 1) {
      if (this.form.get('PassportStatus')?.value === 'Yes' && this.form.get('PassportDocumentPath')?.invalid) return false;
      if (this.form.get('IsVisaRejected')?.value === 'Yes' && this.form.get('VisaRejectedReason')?.invalid) return false;
    }
    if (step === 2 && this.form.get('SponsorType')?.value === 'Other' && this.form.get('SponsorName')?.invalid) return false;

    if (step === 4) {
  const englishType = this.form.get('EnglishTestType')?.value;

  if (
      (englishType === 'Applied' || englishType === 'Appeared')
      && this.form.get('EnglishDocumentPath')?.invalid
     ) {
      return false;
  }
}

    return true;
  }

  onFileSelected(evt: Event, key: string, formControlName: string): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];

    const propertyKey = `uploaded${key.charAt(0).toUpperCase() + key.slice(1)}Name`;
    (this as any)[propertyKey] = file.name;

    this.uploadedFiles = this.uploadedFiles.filter(f => f.key !== key);
    this.uploadedFiles.push({ key, file, name: file.name });

    this.form.get(formControlName)!.setValue(file.name);
    this.form.get(formControlName)!.markAsDirty();
    this.form.get(formControlName)!.updateValueAndValidity();
    input.value = '';
  }

  DownloadFormat(): void {
    const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'SE-Consent-Letter.pdf';
    link.click();
  }
  PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
  ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
  FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
  ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
  EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';
  ResumeDocumentPath: any; ConsentLetterDocumentPath: any; FeesProofDocumentPath: any; EnglishProofDocumentPath: any; PassportDocumentPath: any;

  UploadedEnglish: boolean = false;
  UploadedPassport: boolean = false;
  UploadedResume: boolean = false;
  UploadedFees: boolean = false;
  UploadedConsenLetter: boolean = false;

  onPassportFileSelected(event: any): void {
    this.UploadedPassport = true;
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
      this.PassportDocumentPath = validFileName;
      this.PassportFileName = validFileName;
      this.form.get('PassportDocumentPath')!.setValue(validFileName); // <-- CRITICAL FIX
      this.form.get('PassportDocumentPath')!.markAsDirty();
      this.form.get('PassportDocumentPath')!.updateValueAndValidity();
      this.PassportFileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.PassportFileData = ssssArray[1];
      };
      return;
    }

    this.PassportFileData = file;
    this.PassportFileStatus = true;
    this.UploadedPassport = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.PassportFileData = ssssArray[1];
        this.PassportDocumentPath = file.name;
        this.PassportFileName = file.name;
        this.form.get('PassportDocumentPath')!.setValue(file.name); // <-- CRITICAL FIX
        this.form.get('PassportDocumentPath')!.markAsDirty();
        this.form.get('PassportDocumentPath')!.updateValueAndValidity();

        this.UploadedPassport = true;
      };
    }
  }

  onEnglishFileSelected(event: any): void {
    this.UploadedEnglish = true;
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
      this.EnglishProofData = modifiedFile;
      this.EnglishProofDocumentPath = validFileName;
      this.EnglishProofFileName = validFileName;
      this.form.get('EnglishDocumentPath')!.setValue(validFileName); // <-- CRITICAL FIX
      this.EnglishProofStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.EnglishProofData = ssssArray[1];
      };
      return;
    }

    this.EnglishProofData = file;
    this.EnglishProofStatus = true;
    this.UploadedEnglish = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.EnglishProofData = ssssArray[1];
        this.EnglishProofDocumentPath = file.name;
        this.EnglishProofFileName = file.name;
        this.form.get('EnglishDocumentPath')!.setValue(file.name); // <-- CRITICAL FIX
        this.UploadedEnglish = true;
      };
    }
  }


  onResumeFileSelected(event: any): void {
    this.UploadedResume = true;
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
      this.ResumeDocumentPath = validFileName;
      this.ResumeFileName = validFileName;
      this.uploadedResumeName = validFileName;
      this.form.get('ResumeDocumentPath')!.setValue(validFileName); // <-- CRITICAL FIX
      this.ResumeFileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
      };
      return;
    }

    this.ResumeFileData = file;
    this.ResumeFileStatus = true;
    this.UploadedResume = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
        this.ResumeDocumentPath = file.name;
        this.ResumeFileName = file.name;
        this.uploadedResumeName = file.name;
        this.form.get('ResumeDocumentPath')!.setValue(file.name); // <-- CRITICAL FIX
        this.UploadedResume = true;
      };
    }


  }

  onFeesFileSelected(event: any): void {
    this.UploadedFees = true;
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
      this.FeesProofDocumentPath = validFileName;
      this.FeesProofFileName = validFileName;
      this.form.get('FeesDocumentPath')!.setValue(validFileName);
      this.FeesProofStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
      };

      return;
    }

    this.FeesProofData = file;
    this.FeesProofStatus = true;
    this.UploadedFees = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
        this.FeesProofDocumentPath = file.name;
        this.FeesProofFileName = file.name;
        this.form.get('FeesDocumentPath')!.setValue(file.name); // <-- CRITICAL FIX
        this.UploadedFees = true;
      };
    }

  }

  onConsentLetterFileSelected(event: any): void {
    this.UploadedConsenLetter = true;
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
      this.ConsentLetterDocumentPath = validFileName;
      this.ConsentLetterFileName = validFileName;
      this.form.get('ConsentLetterDocumentPath')!.setValue(validFileName);
      this.ConsentLetterStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ConsentLetterData = ssssArray[1];
      };

      return;
    }

    this.ConsentLetterData = file;
    this.ConsentLetterStatus = true;
    this.UploadedConsenLetter = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ConsentLetterData = ssssArray[1];
        this.ConsentLetterDocumentPath = file.name;
        this.ConsentLetterFileName = file.name;
        this.form.get('ConsentLetterDocumentPath')!.setValue(file.name); // <-- CRITICAL FIX
        this.UploadedConsenLetter = true;
      };
    }
  }

  /**
   * Constructs a data URL from Base64 data and opens the file in a new tab.
   * @param fileData The raw Base64 string of the file (without the 'data:...' prefix).
   * @param fileName The name of the file (used to determine extension/MIME type).
   */
  viewFile(fileData: string, fileName: string): void {
    if (!fileData) {
      Swal.fire('Error', 'File data is not available.', 'error');
      return;
    }

    let mimeType = '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'doc':
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        mimeType = 'application/octet-stream';
        break;
    }

    const dataUrl = `data:${mimeType};base64,${fileData}`;

    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
      win.document.title = fileName;
    } else {
      Swal.fire('Error', 'Could not open new window. Check your browser pop-up blocker.', 'error');
    }
  }
}






