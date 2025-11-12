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

@Component({
  selector: 'app-Register-Form',
  templateUrl: './Register-Form.html',
  styleUrls: ['./NewLogicForm.component.scss']
})
export class RegisterFormcomponent implements OnInit {

  // State Flags
  isLoading: boolean = false;
  loginFailed: boolean = false;
  isEligible: boolean = false; // Controls visibility of the main wizard
  currentStep: number = 1;

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
  stepIcons = ['bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-file-earmark-arrow-up', 'bi-check2-circle'];
  stepLabels = [
    'Eligibility Checked',
    'Contact Details & Preferences',
    'Passport & English Details',
    'Sponsor Details & Declaration',
    'Documents Upload',
    'Review & Submit'
  ];

  englishOptions = [
    { value: '', label: 'Select' },
    { value: 'Applied', label: 'Applied' },
    { value: 'NotRequired', label: 'Not required' },
    { value: 'NotGiven', label: 'Not Given' },
    { value: 'Appeared', label: 'Appeared / Given' },
  ];
  englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];


  availableFundsOptions = [
    { value: '', label: 'Select' },
    { value: '2 to 4 Lakhs', label: '2 to 4 Lakhs' },
    { value: '4 to 6 Lakhs', label: '4 to 6 Lakhs' },
    { value: '6 to 8 Lakhs', label: '6 to 8 Lakhs' },
  ];


  isSubmitted = false;
  PresentDate: string;
  showPolicy = true;

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
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    // this.title.setTitle("**Semester Exchange Registration**");
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.getToken(this.LoginName);

    }
    const consentControl = this.form.get('ConsentLetterDocumentPath');
    if (consentControl) {
      consentControl.clearValidators();
      consentControl.updateValueAndValidity();
    }
  }

  // --- Form Initialization ---
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
        EmailId: ['', Validators.required],
        // EmailId: [this.eligibilityForm.get('email')?.value, Validators.required],
        WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        PhoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        ParentContact: ['', [Validators.pattern(/^[0-9]{10}$/)]],
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
        SponsorName: [''], SponsorRelation: [''],
        AcceptPolicy: [false, Validators.requiredTrue],

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
  }

  // --- Eligibility Check Flow (Req #1) ---

  checkEligibility(): void {
    if (this.eligibilityForm.invalid) {
      this.eligibilityForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, contactNumber } = this.eligibilityForm.value;

    // Use a placeholder API to get LoginName based on contact/email, as a starting point 
    // before running the authentication flow. Assuming this is a necessary step.
    // this.servicesSM.getStudentIdByContact(email, contactNumber) 
    this.servicesSM.getStudentById()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          const studentInfo = response.item1?.[0]; // Assuming response structure

          if (studentInfo) {
            this.RegistrationNo = studentInfo.registerationNumber;
            this.getToken(this.LoginName); // Start the detailed eligibility check
          } else {
            Swal.fire({ title: 'Not Eligible', text: 'Email/Contact did not match any record.', icon: 'warning' });
          }
        },
        error: () => {
          Swal.fire({ title: 'Error', text: 'Failed to verify details. Try again.', icon: 'error' });
        }
      });
  }
  // checkEligibility(): void {
  //   if (this.eligibilityForm.invalid) {
  //     this.eligibilityForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isLoading = true;
  //   const { email, contactNumber } = this.eligibilityForm.value;

  //   // Assuming a new endpoint is used to get LoginName based on contact details
  //   this.servicesSM.checkBasicEligibility(email, contactNumber) 
  //     .pipe(
  //       finalize(() => this.isLoading = false)
  //     )
  //     .subscribe({
  //       next: (response: any) => {
  //         const studentInfo = response.item1?.[0];

  //         if (studentInfo && studentInfo.loginName) {
  //           this.LoginName = studentInfo.loginName;
  //           this.RegistrationNo = studentInfo.registrationNo;
  //           this.getToken(this.LoginName); // Start the detailed eligibility check using original API flow
  //         } else {
  //           Swal.fire({ title: 'Not Eligible', text: 'Email/Contact did not match any record.', icon: 'warning' });
  //         }
  //       },
  //       error: () => {
  //         Swal.fire({ title: 'Error', text: 'Failed to verify details. Try again.', icon: 'error' });
  //       }
  //     });
  // }

  // --- Core API Flow (Maintaining Original Endpoints) ---

  getToken(loginId: any): void {
    this.isLoading = true;
    this.authService.loginTemp(loginId).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: data => {
          this.storageService.saveUser(data);
          if (this.storageService.isLoggedIn()) {
            this.loginFailed = false;
            this.buildMainForm();
            this.getStudentDetail(); // Kicks off the detailed eligibility checks
          } else {
            this.LoginFailed('Authentication failed');
          }
        },
        error: err => this.LoginFailed(err)
      });
  }
  ContactNo: any;
  getStudentDetail(): void {
    this.isLoading = true;
    this.servicesSM.getStudentById().pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {
            const stuData = response.item1[0];
            this.studentName = stuData.studentName;
            this.ContactNo = stuData.studentMobile;
            this.RegistrationNo = stuData.registerationNumber;
            this.courseName = stuData.courseName;
            this.cgpa = stuData.cgpa;
            this.CurrentYear = stuData.currentYear;
            this.CurrentTerm = stuData.currentTerm;
            this.studentStatus = stuData.studentStatus;

            this.form.get('EmailId')?.setValue(stuData.studentEmail || this.eligibilityForm.get('email')?.value);

            this.getApplicationDetails(this.RegistrationNo); // Continue eligibility chain
          } else {
            this.LoginFailed('Student data not found');
          }
        },
        error: err => this.LoginFailed(err)
      });
  }

  getApplicationDetails(regId: string): void {
    this.isLoading = true;
    this.servicesSM.getApplicationDetailsBYId(regId).pipe(finalize(() => this.isLoading = false))
      .subscribe((response) => {
        const stuApplication = response.item1?.[0];

        if (stuApplication?.applicationId > 0) {
          Swal.fire({ title: 'Application Already Exists', icon: 'success' }).then(() => {
            this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
          });
          return;
        }

        // --- Core Eligibility Checks (CGPA & Status) ---
        if (+(this.cgpa) < 7 || (this.studentStatus !== 'A' && this.studentStatus !== 'ACT')) {
          this.GetStudentAllPreviousMarks(this.RegistrationNo);
          this.isEligible = false;
          // Swal.fire({ title: 'Not Eligible', text: 'Low CGPA or Inactive status.', icon: 'warning' });
          return;
        }

        // Continue to Grade check
        // if (this.CurrentTerm > 1) {
        //     this.GetStudentMarksDetails(this.RegistrationNo);
        // } else if (this.CurrentTerm === 1) {
        this.GetStudentAllPreviousMarks(this.RegistrationNo);
        // } else {
        //      this.isEligible = true;
        this.getUniversityDetails();
        // }
      });
  }
  getTableHeaders(obj: any): string[] {
    return Object.keys(obj);
  }
  topHeader: any = ['termId', 'courseCode', 'credit', 'gradeNum', 'grade']
  GradeFcount: any;
  studentDetailsWithMarks: any[];
  // GetStudentMarksDetails(Regdno: any): void {
  //   this.isLoading = true;
  //   this.servicesSM.getStudentDetailsWithMarks(Regdno).pipe(finalize(() => this.isLoading = false))
  //   .subscribe({
  //     next: response => {
  //       if (response.item1.length > 0) {            
  //         this.studentDetailsWithMarks = response.item1;
  //         this.ProgramCode =  this.studentDetailsWithMarks[0].officialCode;
  //         this.SectionCode =  this.studentDetailsWithMarks[0].section;


  //         this.GradeFcount = 0; // Reset count
  //             for (const item of this.studentDetailsWithMarks) {
  //               const gradeStr = item.grade?.toUpperCase();
  //               const gradeNum = parseInt(item.gradeNum, 10);

  //               // If grade is F or gradeNum ≤ 6
  //               if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
  //                 this.GradeFcount++;
  //               }
  //             }

  //         let gradeFcount = 0; 
  //         for (const item of  this.studentDetailsWithMarks) {
  //           const gradeStr = item.grade?.toUpperCase();
  //           const gradeNum = parseInt(item.gradeNum, 10);
  //           if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
  //             gradeFcount++;
  //           }
  //         }

  //         if (gradeFcount > 1) {
  //           this.isEligible = false;
  //           Swal.fire({ title: 'Not Eligible', text: 'More than one failure grade found.', icon: 'warning' });
  //         } else {
  //           this.isEligible = true;
  //           this.getUniversityDetails();
  //         }
  //       } else {
  //         this.isEligible = false;
  //         Swal.fire({ title: 'Not Eligible', text: 'Could not fetch marks data.', icon: 'warning' });
  //       }
  //     },
  //     error: err => this.LoginFailed(err)
  //   });
  // }
  SchoolId: any;
  FindGradeFCount(regdNo: any): void {
    this.servicesSM.getStudentDetailsWithMarks(regdNo).pipe(finalize(() => this.isLoading = false))
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

              // If grade is F or gradeNum ≤ 6
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
          }
        },
        error: err => this.LoginFailed(err)
      });
  }
  // Add this variable definition to your class if it doesn't exist
  private setEligible(): void {
    this.isEligible = true;
    this.currentStep = 1; // Start wizard
    Swal.fire({ title: 'Eligibility Confirmed', icon: 'success', timer: 1500 });
  }

  /**
   * Sets the state to ineligible and displays an error message.
   */
  private setIneligible(reason: string): void {
    this.isEligible = false;
    Swal.fire({ title: 'Not Eligible', text: reason, icon: 'warning' });
  }

  // Refactored GetStudentAllPreviousMarks function
  GetStudentAllPreviousMarks(Regdno: any): void {
    this.isLoading = true;

    this.servicesSM.GetStudentAllPreviousMarks(Regdno)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: response => {

          // 1. Basic check for data existence
          if (!response || !response.item1?.length) {
            this.setIneligible('No previous mark records found.');
            return;
          }

          // 2. Fetch Academic Details (Needed for ProgramCode, Section, etc., if other functions rely on it)
          this.studentAcademicDetail = response.item4?.[0] || {};
          this.ProgramCode = this.studentAcademicDetail.PName ? this.studentAcademicDetail.PName.split(':')[0].trim() : this.ProgramCode;
          this.SectionCode = this.studentAcademicDetail.Section;

          // 3. Find 10+2 record and percentage
          const studentPreviousMarksData = response.item1;
          const plus2Record = studentPreviousMarksData.find((r: any) => r.ExamDescription === '10+2');
          const percentage = plus2Record ? parseFloat(plus2Record.Perecentage) : NaN;

          // 4. Perform Term 1 eligibility check: 10+2 marks > 69.5%
          if (percentage > 69.5) {
            // Set CGPA placeholder to the percentage (as requested in original logic)
            this.cgpa = percentage;
            this.setEligible();
          } else {
            // Set CGPA placeholder even if ineligible
            this.cgpa = percentage;
            this.setIneligible('10+2 percentage criterion not met (required > 69.5%).');
          }

          // 5. Post Check Action: Always attempt to fetch university details if data exists
          this.getUniversityDetails();
          
          // NOTE: The separate FindGradeFCount() call is removed here as its logic 
          // should be entirely contained within GetStudentMarksDetails() which handles CurrentTerm > 1.
        },
        error: err => this.LoginFailed(err)
      });
  }
  //   GetStudentAllPreviousMarks(Regdno: any): void {
  //   this.isLoading = true;

  //   this.servicesSM.GetStudentAllPreviousMarks(Regdno)
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: response => {
  //         if (response && response.item1?.length > 0) {

  //           // --------------- Previous Marks (10th / 10+2) ----------------
  //           this.studentPreviousMarksData = response.item1;
  //           console.log('Previous Marks:', JSON.stringify(this.studentPreviousMarksData));
  //           // Find 10+2 record if available
  //           const plus2Record = this.studentPreviousMarksData.find((r: any) => r.ExamDescription === '10+2');
  //           const percentage = plus2Record ? parseFloat(plus2Record.Perecentage) : 0;

  //           // --------------- Term Marks ----------------
  //           this.studentTermsMarksData = response.item2?.[0] || {};
  //           this.studentTermsMarksDataX = response.item2 || {};
  //           console.log('Term Marks:', JSON.stringify(this.studentTermsMarksDataX));
  //           console.log('Term Marks:', JSON.stringify(this.studentTermsMarksData));

  //           // --------------- Grade Details ----------------
  //           this.studentGradeMarksData = response.item3?.[0] || {};
  //           this.studentGradeMarksDataX = response.item3 || {};
  //           console.log('Grade Marks:', JSON.stringify(this.studentGradeMarksDataX));
  //           console.log('Grade Marks:', JSON.stringify(this.studentGradeMarksData));

  //           const grade = this.studentGradeMarksData.Grade || '';
  //           const gradeCount = Number(this.studentGradeMarksData.RecordCount || 0);

  //           // --------------- Academic Details ----------------
  //           this.studentAcademicDetail = response.item4?.[0] || {};
  //           this.studentAcademicDetailX = response.item4 || {};
  //           console.log('Academic Details:', JSON.stringify(this.studentAcademicDetail));
  //           console.log('Academic Details:', JSON.stringify(this.studentAcademicDetailX));
  //           this.SectionCode= this.studentAcademicDetail.Section;
  //           const parts = this.studentAcademicDetail.PName.split(':');
  //           this.ProgramCode = parts[0].trim(); // "P13C"


  //           // --------------- Eligibility Logic ----------------
  //           const currentTerm = Number(this.studentAcademicDetail.Term || this.CurrentTerm || 0);
  //           const failCount = Number(this.studentAcademicDetail.FailCount || 0);

  //           if (currentTerm === 1 && percentage > 69.5) {
  //             // First term students: based on +2 marks
  //             this.cgpa=percentage;
  //             this.isEligible = true;
  //           } 
  //           else if (currentTerm > 1 && grade !== 'F' && failCount === 0 && gradeCount > 0) {
  //             // Senior terms: based on grade record and fail count
  //             this.cgpa=percentage;
  //             this.isEligible = true;
  //           } 
  //           else {
  //             // alert(grade+'Grade'+percentage +''+ this.cgpa + ' GC'+ gradeCount + 'Cuurent Term'+currentTerm)
  //             this.cgpa=percentage;
  //             this.isEligible = false;
  //             Swal.fire({
  //               title: 'Not Eligible',
  //               text: 'Eligibility criteria not met. Please check your marks or grade records.',
  //               icon: 'warning'
  //             });
  //             this.FindGradeFCount(Regdno);
  //           }

  //           // --------------- Post Check Actions ----------------
  //           if (this.isEligible) {
  //             this.getUniversityDetails();
  //           }

  //         } else {
  //           this.isEligible = false;
  //           Swal.fire({
  //             title: 'Not Eligible',
  //             text: 'No previous mark records found.',
  //             icon: 'warning'
  //           });
  //         }
  //         this.FindGradeFCount(Regdno);
  //       },
  //       error: err => this.LoginFailed(err)
  //     });
  // }

  studentPreviousMarksData: any;
  studentTermsMarksData: any;
  studentTermsMarksDataX: any;
  studentGradeMarksData: any;
  studentGradeMarksDataX: any;
  studentAcademicDetail: any;
  studentAcademicDetailX: any;
  // GetStudentAllPreviousMarks(Regdno: any): void {
  //   this.isLoading = true;
  //   this.servicesSM.GetStudentAllPreviousMarks(Regdno).pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: response => {
  //         if (response.item1.length > 0) {
  //           this.studentPreviousMarksData = response.item1[0];
  //           console.log(JSON.stringify(response.item1))
  //           const marksPlus2 = this.studentPreviousMarksData['ExamDescription'];
  //           const percentages = this.studentPreviousMarksData['Perecentage'];

  //           this.studentTermsMarksData = response.item2[0];
  //           console.log(JSON.stringify(this.studentTermsMarksData))

  //           this.studentGradeMarksData = response.item3[0];
  //           console.log(JSON.stringify(this.studentGradeMarksData))
  //           const grade = this.studentGradeMarksData['Grade'];
  //           const gradeCount = this.studentGradeMarksData['RecordCount'];

  //           this.studentAcademicDetail = response.item4[0];

  //           console.log(JSON.stringify(this.studentAcademicDetail))
  //           if (this.CurrentTerm == 1 && marksPlus2 === '10+2' && percentages > 70) {
  //             this.isEligible = true;
  //           }
  //           else if (this.CurrentTerm > 1 && grade === 'F' && gradeCount == 0) {
  //             this.isEligible = true;
  //           }
  //           else {
  //             Swal.fire({ title: 'Not Eligible', text: 'Marks Criteria not met.', icon: 'warning' });
  //           }


  //           this.getUniversityDetails();
  //         } else {
  //           this.isEligible = false;
  //           Swal.fire({ title: 'Not Eligible', text: 'Could not fetch previous marks.', icon: 'warning' });
  //         }
  //       },
  //       error: err => this.LoginFailed(err)
  //     });
  // }

  getUniversityDetails(): void {
    if (!this.ProgramCode) return;
    this.servicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
      this.uniData = response.item1;
    });
  }
  togglePolicy(event: MouseEvent): void {
    event.preventDefault(); // prevent page scroll
    this.showPolicy = !this.showPolicy;
  }
  // --- Wizard Navigation and Submission ---

  nextStep(): void {
    if (this.currentStep === this.stepLabels.length) return;
    if (this.canProceedToNext(this.currentStep)) {
      this.currentStep++;
      this.isSubmitted = false;
    } else {
      this.isSubmitted = true;
      Swal.fire({ title: 'Validation Error', text: 'Please complete all required fields on this step.', icon: 'error' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitFinalApplication(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      Swal.fire({ title: 'Validation Error', text: 'Please complete all required fields.', icon: 'error' });
      return;
    }

    this.isLoading = true;
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

    formData.append("IsVisaRejected", formValue.IsVisaRejected || 'NA');
    if (formValue.IsVisaRejected === 'Yes') {
      formData.append("VisaRejectedReason", formValue.VisaRejectedReason || 'NA');
      formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry || 'NA');
    } else {
      formData.append("VisaRejectedReason", 'NA');
      formData.append("VisaRejectedCountry", 'NA');
    }

    formData.append("EnglishTestType", formValue.EnglishTestType || 'NA');
    if (['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
      formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
      formData.append("ListeningScore", formValue.ListeningScore || 'NA');
      formData.append("ReadingScore", formValue.ReadingScore || 'NA');
      formData.append("WritingScore", formValue.WritingScore || 'NA');
      formData.append("OverallScore", formValue.OverallScore || 'NA');
      formData.append("EnglishTestYear", formValue.EnglishTestYear);
    } else if (formValue.EnglishTestType === 'Applied') {
      formData.append("testDate", formValue.testDate);
      formData.append("SpeakingScore", 'NA');
      formData.append("ListeningScore", 'NA');
      formData.append("ReadingScore", 'NA');
      formData.append("WritingScore", 'NA');
      formData.append("OverallScore", 'NA');
      formData.append("EnglishTestYear", 'NA');
    }
    else {
      formData.append("SpeakingScore", 'NA');
      formData.append("ListeningScore", 'NA');
      formData.append("ReadingScore", 'NA');
      formData.append("WritingScore", 'NA');
      formData.append("OverallScore", 'NA');
      formData.append("EnglishTestYear", 'NA');
      // formData.append("testDate", 'NA');
    }

    formData.append("IsSelfFunded", formValue.IsSelfFunded || 'NA');
    formData.append("SponsorEmail", 'NA'); // This field is not in the form, so default to 'NA'
    formData.append("AvailableFunds", formValue.AvailableFunds || 'NA');
    formData.append("TotalCountGradeF", this.GradeFcount?.toString() || 'NA'); // Convert number to string

    if (formValue.IsSelfFunded === 'Other') {
      formData.append("SponsorName", formValue.SponsorName || 'NA');
      formData.append("SponsorRelation", formValue.SponsorRelation || 'NA');
      formData.append("SponsorContact", formValue.SponsorContact || 'NA'); // This field is not in the form, so default to 'NA'
      formData.append("SponsorEmail", formValue.SponsorEmail || 'NA'); // This field is not in the form, so default to 'NA'
    } else {
      formData.append("SponsorName", 'NA');
      formData.append("SponsorRelation", 'NA');
      formData.append("SponsorContact", 'NA');
      formData.append("SponsorEmail", 'NA');
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

    formData.append("RelativeCountryName", formValue.RelativeCountryName || 'NA');
    formData.append("RelativeName", formValue.RelativeName || 'NA');
    formData.append("RelativeRelation", formValue.RelativeRelation || 'NA'); // Added RelativeRelation
    formData.append("HasRelativeDetails", formValue.HasRelativeDetails || 'NA'); // Added HasRelativeDetails

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
  }

  // --- Helper Functions and Validators ---

  LoginFailed(_NewError: any): void {
    this.loginFailed = true;
    this.isEligible = false;
    Swal.fire({ title: 'Login Failed', text: 'Invalid login or token.', icon: 'warning' });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  subscribeToFormChanges(): void {
    // Logic to clear subsequent university options when a higher preference changes
    ['UniversityOption1', 'UniversityOption2'].forEach(ctrlName => {
      this.form.get(ctrlName)?.valueChanges.subscribe(value => {
        if (ctrlName === 'UniversityOption1') this.form.get('UniversityOption2')?.setValue('');
        this.form.get('UniversityOption3')?.setValue('');
      });
    });
  }

  private distinctPhoneNumbersValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const wa = group.get('WhatsAppNo')?.value?.trim() || '';
      const ph = group.get('PhoneNumber')?.value?.trim() || '';
      const parent = group.get('ParentContact')?.value?.trim() || '';

      const allValid = /^[0-9]{10}$/.test(wa) && /^[0-9]{10}$/.test(ph) && /^[0-9]{10}$/.test(parent);
      if (!allValid) return null;

      if (wa === parent || ph === parent) {
        return { numbersMustBeDistinct: true };
      }
      return null;
    };
  }

  private setupConditionalValidators(): void {
    // Relative details
    this.form.get('HasRelativeDetails')!.valueChanges.subscribe(val => {
      const controls = ['RelativeName', 'RelativeCountryName', 'RelativeRelation'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    // Passport details
    this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
      const controls = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    // Visa rejected details
    this.form.get('IsVisaRejected')!.valueChanges.subscribe(val => {
      const controls = ['VisaRejectedReason', 'VisaRejectedCountry'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
    });

    // English test conditional validators
    this.form.get('EnglishTestType')!.valueChanges.subscribe(() => this.updateEnglishScoreValidators());
    this.form.get('TestDate')!.valueChanges.subscribe(() => this.updateEnglishScoreValidators());

    // Sponsor details
    this.form.get('SponsorType')!.valueChanges.subscribe(val => {
      const controls = ['SponsorName', 'SponsorRelation'];
      controls.forEach(c => this.toggleRequiredValidator(c, val === 'Other'));
    });
  }

  private toggleRequiredValidator(controlName: string, required: boolean): void {
    const control = this.form.get(controlName)!;
    required ? control.setValidators([Validators.required]) : control.clearValidators();
    control.updateValueAndValidity();
  }

  private updateEnglishScoreValidators(): void {
    const englishTestType = this.form.get('EnglishTestType')?.value;
    const testDateStr = this.form.get('TestDate')?.value;
    const englishDoc = this.form.get('EnglishDocumentPath')!;
    const scoreControls = ['ListeningScore', 'SpeakingScore', 'ReadingScore', 'WritingScore', 'OverallScore', 'EnglishTestYear'];

    let shouldRequireScores = false;
    if (englishTestType === 'Appeared' && testDateStr) {
      const testDate = new Date(testDateStr);
      const today = new Date();
      const testDateOnly = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // if (testDateOnly < todayDateOnly) {
      //   shouldRequireScores = true;
      // }
    }

    // this.toggleRequiredValidator('EnglishDocumentPath', englishTestType === 'Appeared' && shouldRequireScores);
    // scoreControls.forEach(name => this.toggleRequiredValidator(name, shouldRequireScores));
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

    // Check conditional fields (e.g., required passport fields, sponsor name)
    if (step === 1) {
      if (this.form.get('PassportStatus')?.value === 'Yes' && this.form.get('PassportDocumentPath')?.invalid) return false;
      if (this.form.get('IsVisaRejected')?.value === 'Yes' && this.form.get('VisaRejectedReason')?.invalid) return false;
      // English document check is handled by validators via updateEnglishScoreValidators
    }
    if (step === 2 && this.form.get('SponsorType')?.value === 'Other' && this.form.get('SponsorName')?.invalid) return false;

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


  // File data and status
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
      // FIX: Ensure correct variable is used and form control is updated
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
        // FIX: Ensure form control is updated
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
      // FIX: Ensure correct variable is used and form control is updated
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
        // FIX: Ensure form control is updated
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
      // FIX: Ensure correct variable is used and form control is updated
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
        // FIX: Ensure form control is updated
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
      // FIX: Ensure correct variable is used and form control is updated
      this.FeesProofDocumentPath = validFileName;
      this.FeesProofFileName = validFileName;
      this.form.get('FeesDocumentPath')!.setValue(validFileName); // <-- CRITICAL FIX
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
        // FIX: Ensure form control is updated
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
      // FIX: Ensure correct variable is used and form control is updated
      this.ConsentLetterDocumentPath = validFileName;
      this.ConsentLetterFileName = validFileName;
      this.form.get('ConsentLetterDocumentPath')!.setValue(validFileName); // <-- CRITICAL FIX
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
        // FIX: Ensure form control is updated
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
    // Use the file name extension to reliably determine the MIME type
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
        // Modern browsers usually don't display DOCX inline, but setting the MIME helps.
        // It may prompt a download instead of an inline view.
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        // Use a generic MIME type as a fallback
        mimeType = 'application/octet-stream';
        break;
    }

    // CRITICAL FIX: The data URL must be constructed with the correct MIME type
    const dataUrl = `data:${mimeType};base64,${fileData}`;

    // Open the data URL in a new tab
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
      // Optional: Add a title for clarity
      win.document.title = fileName;
    } else {
      Swal.fire('Error', 'Could not open new window. Check your browser pop-up blocker.', 'error');
    }
  }
}