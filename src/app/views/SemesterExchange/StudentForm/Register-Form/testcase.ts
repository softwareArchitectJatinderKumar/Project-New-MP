
// import { Component, OnInit } from '@angular/core';
// import {
//   FormBuilder,
//   FormGroup,
//   Validators,
//   AbstractControl,
//   ValidatorFn,
//   ValidationErrors,
// } from '@angular/forms';
// import { countries } from '../countries-list';
// import { Title } from '@angular/platform-browser';
// import { ActivatedRoute, Router } from '@angular/router';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AuthService } from 'src/app/_services/auth.service';
// import Swal from 'sweetalert2';
// import { finalize } from 'rxjs';

// @Component({
//   selector: 'app-Register-Form',
//   templateUrl: ' ',
//   styleUrls: ['']
// })
// export class RegisterFormcomponent implements OnInit {

  
//   studentPreviousMarksData: any;
//   studentTermsMarksData: any;
//   studentTermsMarksDataX: any;
//   studentGradeMarksData: any;
//   studentGradeMarksDataX: any;
//   studentAcademicDetail: any;
//   studentAcademicDetailX: any;

//   // --- STATE & LOADER FLAGS ---
//   isLoading: boolean = false;
//   loginFailed: boolean = false;
//   isEligible: boolean = false; 
//   currentStep: number = 1;
//   isSubmitted = false;
//   showPolicy = true;
//   private readonly MIN_LOADER_TIME = 25; 
//   private loaderStartTime: number = 0;

//   // --- FORMS ---
//   eligibilityForm!: FormGroup;
//   form!: FormGroup;

//   // --- DATA PROPERTIES ---
//   LoginName: any;
//   RegistrationNo: any;
//   studentName: any;
//   courseName: any;
//   cgpa: any;
//   CurrentYear: any;
//   CurrentTerm: any;
//   ProgramCode: any;
//   SectionCode: any;
//   studentStatus: any;
//   ApplicationID: any;
//   SchoolId: any;
//   GradeFcount: any = 0;
//   PresentDate: string;
//   uniData: any;
//   countries: any = countries;

//   // --- ACADEMIC DATA ---
//   studentDetailsWithMarks: any[] = [];
//   // studentAcademicDetail: any;
//   topHeader: any = ['termId', 'courseCode', 'credit', 'gradeNum', 'grade'];

//   // --- FILE DATA (BASE64) ---
//   uploadedResumeName: string = '';
//   PassportFileData: any = ''; PassportFileName: any = '';
//   ResumeFileData: any = ''; ResumeFileName: any = '';
//   FeesProofData: any = ''; FeesProofFileName: any = '';
//   ConsentLetterData: any = ''; ConsentLetterFileName: any = '';
//   EnglishProofData: any = ''; EnglishProofFileName: any = '';

 
  
//   UploadedEnglish = false; UploadedPassport = false;
//   UploadedResume = false; UploadedFees = false; UploadedConsentLetter = false;

//   // --- WIZARD CONFIG ---
//   stepIcons = ['bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-file-earmark-arrow-up', 'bi-check2-circle'];
//   stepLabels = ['Eligibility Checked', 'Contact Details & Preferences', 'Passport & English Details', 'Sponsor Details & Declaration', 'Documents Upload', 'Review & Submit'];
//   englishOptions = [
//     { value: '', label: 'Select' }, { value: 'Applied', label: 'Applied' }, 
//     { value: 'NotRequired', label: 'Not required' }, { value: 'NotGiven', label: 'Not Given' }, 
//     { value: 'Appeared', label: 'Appeared / Given' }
//   ];
//  availableFundsOptions = [{ value: '', label: 'Select' }, { value: '2 to 4 Lakhs', label: '2 to 4 Lakhs' }, { value: '4 to 6 Lakhs', label: '4 to 6 Lakhs' }, { value: '6 to 8 Lakhs', label: '6 to 8 Lakhs' }];

 
//   viewFile(fileData: string, fileName: string): void {
//     const win = window.open();
//     const mime = fileName.endsWith('pdf') ? 'application/pdf' : 'image/jpeg';
//     win?.document.write(`<iframe src="data:${mime};base64,${fileData}" style="width:100%;height:100%;"></iframe>`);
//   }
//   constructor(
//     private authService: AuthService,
//     private storageService: StorageService,
//     private servicesSM: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     public fb: FormBuilder,
//     private router: Router,
//     private title: Title
//   ) {
//     this.PresentDate = new Date().toISOString().split('T')[0];
//     this.buildEligibilityForm();
//   }

//   ngOnInit(): void {
//     const mainHeader = document.getElementById('stMain');
//     if (mainHeader) mainHeader.innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     if (this.LoginName) {
//       this.startLoader(); // #1: LOADING DETAILS TRIGGER
//       this.getToken(this.LoginName);
//     }
//   }

//   // --- LOADER UTILITIES ---
//   private startLoader(): void {
//     this.isLoading = true;
//     this.loaderStartTime = Date.now();
//   }

//   private stopLoader(): void {
//     const elapsed = Date.now() - this.loaderStartTime;
//     const remaining = Math.max(0, this.MIN_LOADER_TIME - elapsed);
//     setTimeout(() => this.isLoading = false, remaining);
//   }

//   // --- DYNAMIC UI HELPERS ---
//   getTableHeaders(obj: any): string[] {
//     return obj ? Object.keys(obj) : [];
//   }

//   togglePolicy(event: MouseEvent): void {
//     event.preventDefault();
//     this.showPolicy = !this.showPolicy;
//   }

//   // --- CONDITIONAL VALIDATORS ---
//   setupConditionalValidators(): void {
//     // Passport Status logic (Fixes #2 in your query)
//     this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
//       const passportControls = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'];
//       passportControls.forEach(c => this.toggleRequiredValidator(c, val === 'Yes'));
//     });

//     // English Test logic (Fixes Score Card data)
//     this.form.get('EnglishTestType')!.valueChanges.subscribe(() => this.updateEnglishScoreValidators());
//   }

// private updateEnglishScoreValidators(): void {
//   const type = this.form.get('EnglishTestType')?.value;
//   // Included all score fields and the document path for validation
//   const scoreControls = [
//     'ListeningScore', 'SpeakingScore', 'ReadingScore', 
//     'WritingScore', 'OverallScore', 'EnglishTestYear', 'EnglishDocumentPath'
//   ];

//   const isTestSelected = ['PTE', 'IELTS', 'TOEFL', 'DULINGO', 'Appeared'].includes(type);

//   scoreControls.forEach(controlName => {
//     const control = this.form.get(controlName);
//     if (control) {
//       if (isTestSelected) {
//         control.setValidators([Validators.required]);
//       } else {
//         control.clearValidators();
//       }
//       control.updateValueAndValidity({ emitEvent: false });
//     }
//   });
// }

//   private toggleRequiredValidator(controlName: string, required: boolean): void {
//     const control = this.form.get(controlName);
//     if (control) {
//       required ? control.setValidators([Validators.required]) : control.clearValidators();
//       control.updateValueAndValidity({ emitEvent: false });
//     }
//   }

//   // --- ELIGIBILITY & NAVIGATION ---
//   checkEligibility(): void {
//     if (this.eligibilityForm.invalid) {
//       this.eligibilityForm.markAllAsTouched();
//       return;
//     }
//     this.startLoader(); // #2: CHECKING ELIGIBILITY TRIGGER
//     this.servicesSM.getStudentById().subscribe({
//       next: (response: any) => {
//         const studentInfo = response.item1?.[0];
//         if (studentInfo) {
//           this.RegistrationNo = studentInfo.registerationNumber;
//           this.getToken(this.LoginName);
//         } else {
//           this.stopLoader();
//           Swal.fire({ title: 'Not Eligible', text: 'Record not found.', icon: 'warning' });
//         }
//       },
//       error: () => { this.stopLoader(); Swal.fire('Error', 'Verification failed', 'error'); }
//     });
//   }

//   nextStep(): void {
//     this.startLoader(); // #3: NAVIGATION TRIGGER
//     if (this.canProceedToNext(this.currentStep)) {
//       this.currentStep++;
//       this.isSubmitted = false;
//       window.scrollTo(0, 0);
//     } else {
//       this.isSubmitted = true;
//       Swal.fire('Validation Error', 'Please complete required fields', 'error');
//     }
//     this.stopLoader();
//   }

//   prevStep(): void {
//     this.startLoader(); // #3: NAVIGATION TRIGGER
//     if (this.currentStep > 0) this.currentStep--;
//     window.scrollTo(0, 0);
//     this.stopLoader();
//   }

//   // --- SUBMISSION ---

  
//    submitFinalApplication(): void {
//     this.isSubmitted = true;
//     if (this.form.invalid) return;

//     this.startLoader(); // #4: FINAL SUBMISSION TRIGGER
//     this.isLoading = true;
//     // const formData = this.form.value; 
//     const formValue = this.form.getRawValue();

//     const formData = new FormData();

//     // Append regular form fields with checks for 'NA'
//     formData.append("SchoolId", this.SchoolId);
//     formData.append("SectionCode", this.SectionCode);
//     formData.append("RegistrationNo", this.RegistrationNo);
//     formData.append("EmailId", formValue.EmailId);
//     formData.append("CountryName", formValue.CountryName);
//     formData.append("WhatsAppNo", formValue.WhatsAppNo);
//     formData.append("PhoneNumber", formValue.PhoneNumber);
//     formData.append("ParentContact", formValue.ParentContact);
//     formData.append("ApplyingOption", formValue.ApplyingOption);
//     formData.append("UniversityOption1", formValue.UniversityOption1);
//     formData.append("UniversityOption2", formValue.UniversityOption2);
//     formData.append("UniversityOption3", formValue.UniversityOption3);
//     formData.append("PassportStatus", formValue.PassportStatus);

//     if (formValue.PassportStatus === 'Yes') {
//       formData.append("PassportNumber", formValue.PassportNumber);
//       formData.append("PassportIssueDate", formValue.PassportIssueDate);
//       formData.append("PassportValidUpto", formValue.PassportValidUpto);
//       formData.append("PassportDocumentPath", this.PassportDocumentPath); // Use this.PassportFileName
//     } else {
//       formData.append("PassportNumber", 'NA');
//       // formData.append("PassportIssueDate", 'NA');
//       // formData.append("PassportValidUpto", 'NA');
//       // formData.append("PassportDocumentPath", 'NA');
//     }

//     formData.append("IsVisaRejected", formValue.IsVisaRejected || 'NA');
//     if (formValue.IsVisaRejected === 'Yes') {
//       formData.append("VisaRejectedReason", formValue.VisaRejectedReason || 'NA');
//       formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry || 'NA');
//     } else {
//       formData.append("VisaRejectedReason", 'NA');
//       formData.append("VisaRejectedCountry", 'NA');
//     }

//     formData.append("EnglishTestType", formValue.EnglishTestType || 'NA');
//     if (['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
//       formData.append("EnglishTestName", formValue.TestName || 'NA');
//       formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
//       formData.append("ListeningScore", formValue.ListeningScore || 'NA');
//       formData.append("ReadingScore", formValue.ReadingScore || 'NA');
//       formData.append("WritingScore", formValue.WritingScore || 'NA');
//       formData.append("OverallScore", formValue.OverallScore || 'NA');
//       formData.append("EnglishTestYear", formValue.EnglishTestYear);
//       formData.append("TestDate", formValue.TestDate);
//     }
//     if (formValue.EnglishTestType === 'Appeared') {
//       formData.append("EnglishTestName", formValue.TestName || 'NA');
//       formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
//       formData.append("ListeningScore", formValue.ListeningScore || 'NA');
//       formData.append("ReadingScore", formValue.ReadingScore || 'NA');
//       formData.append("WritingScore", formValue.WritingScore || 'NA');
//       formData.append("OverallScore", formValue.OverallScore || 'NA');
//       formData.append("EnglishTestYear", formValue.TestDate);
//       formData.append("TestDate", formValue.TestDate);
//     }
//     else {
//       formData.append("EnglishTestName", 'NA');
//       formData.append("SpeakingScore", 'NA');
//       formData.append("ListeningScore", 'NA');
//       formData.append("ReadingScore", 'NA');
//       formData.append("WritingScore", 'NA');
//       formData.append("OverallScore", 'NA');
//       formData.append("EnglishTestYear", 'NA');
//       formData.append("TestDate", 'NA');

//     }

//     formData.append("AvailableFunds", formValue.AvailableFunds);
//     formData.append("TotalCountGradeF", this.GradeFcount?.toString()); // Convert number to string

//     if (formValue.SponsorType === 'Other') {
//       formData.append("IsSelfFunded", 'False');
//       formData.append("SponsorType", 'Other');
//       formData.append("SponsorName", formValue.SponsorName || 'NA');
//       formData.append("SponsorRelation", formValue.SponsorRelation || 'NA');
//       formData.append("SponsorContact", formValue.SponsorContact || 'NA'); // This field is not in the form, so default to 'NA'
//       formData.append("SponsorEmail", formValue.SponsorEmail); // This field is not in the form, so default to 'NA'
//     } else {
//       formData.append("IsSelfFunded", 'True');
//       formData.append("SponsorType", 'Parent');
//       formData.append("SponsorName", 'Parent');
//       formData.append("SponsorRelation", 'Parent');
//       formData.append("SponsorContact", formValue.ParentContact);
//       formData.append("SponsorEmail", 'Parent');
//     }

//     formData.append("AcceptPolicy", formValue.AcceptPolicy ? 'Yes' : 'No');
//     formData.append("ResumeFileName", this.ResumeFileName);
//     formData.append("ResumeFileData", this.ResumeFileData);
//     formData.append("ConsentLetterFileName", this.ConsentLetterFileName);
//     formData.append("ConsentLetterData", this.ConsentLetterData);
//     formData.append("FeesProofData", this.FeesProofData);
//     formData.append("FeesProofFileName", this.FeesProofFileName);
//     formData.append("PassportFileData", this.PassportFileData);
//     formData.append("PassportFileName", this.PassportFileName);
//     formData.append("EnglishProofData", this.EnglishProofData);
//     formData.append("EnglishProofFileName", this.EnglishProofFileName);

//     formData.append("RelativeCountryName", formValue.RelativeCountryName || 'NA');
//     formData.append("RelativeName", formValue.RelativeName || 'NA');
//     formData.append("RelativeEmail", formValue.RelativeEmail || 'NA');
//     formData.append("RelativePhone", formValue.RelativePhone || 'NA');
//     formData.append("RelativeRelation", formValue.RelativeRelation || 'NA'); // Added RelativeRelation
//     formData.append("HasRelativeDetails", formValue.HasRelativeDetails || 'NA'); // Added HasRelativeDetails

//     // formData.forEach((value, key) => {
//     //   console.log(`${key}: ${value}`);
//     // });
//     this.servicesSM.SemesterExchangeNewRegistrationForm(formData)
//       .pipe(
//         finalize(() => this.isLoading = false)
//       )
//       .subscribe({
//         next: (data) => {
//           let errorCode = data[0]?.returnData;

//           if (errorCode > 0) {
//             Swal.fire({ title: 'Application Created Successfully', icon: 'success' }).then(() => {
//               window.location.reload();
//             });
//           } else if (errorCode === -1) {
//             Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
//               window.location.reload();
//             });
//           } else {
//             Swal.fire({ title: 'Some Technical Issue', icon: 'error' }).then(() => {
//               window.location.reload();
//             });
//           }
//         },
//         error: () => {
//           Swal.fire({ title: 'Error Occurred', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
//         }
//       });
//   }


//   // submitFinalApplication(): void {
//   //   this.isSubmitted = true;
//   //   if (this.form.invalid) return;

//   //   this.startLoader(); // #4: FINAL SUBMISSION TRIGGER
//   //   const val = this.form.getRawValue();
//   //   const formData = new FormData();
    
//   //   formData.append("RegistrationNo", this.RegistrationNo);
//   //   formData.append("UniversityOption1", val.UniversityOption1);
//   //   formData.append("UniversityOption2", val.UniversityOption2);
//   //   formData.append("UniversityOption3", val.UniversityOption3);
    
//   //   // Base64 File mapping
//   //   formData.append("ResumeFileData", this.ResumeFileData);
//   //   formData.append("ResumeFileName", this.ResumeFileName);
//   //   formData.append("PassportFileData", this.PassportFileData);
//   //   formData.append("PassportFileName", this.PassportFileName);
//   //   formData.append("EnglishProofData", this.EnglishProofData);
//   //   formData.append("EnglishProofFileName", this.EnglishProofFileName);

//   //   this.servicesSM.SemesterExchangeNewRegistrationForm(formData)
//   //     .pipe(finalize(() => this.stopLoader()))
//   //     .subscribe({
//   //       next: (res) => {
//   //         if (res[0]?.returnData > 0) {
//   //           Swal.fire('Success', 'Application Submitted', 'success').then(() => window.location.reload());
//   //         }
//   //       }
//   //     });
//   // }

//   // --- CORE DATA HANDLING ---
//   getToken(loginId: any): void {
//     this.authService.loginTemp(loginId).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         this.buildMainForm();
//         this.getStudentDetail(); 
//       },
//       error: () => { this.stopLoader(); this.loginFailed = true; }
//     });
//   }

//   getStudentDetail(): void {
//     this.servicesSM.getStudentById().subscribe({
//       next: response => {
//         const stuData = response.item1?.[0];
//         if (stuData) {
//           // this.studentName = stuData.studentName;
//           // this.RegistrationNo = stuData.registerationNumber;
//           // this.courseName = stuData.courseName;
//           // this.cgpa = stuData.cgpa;
//             this.studentName = stuData.studentName;
//             this.ContactNo = stuData.studentMobile;
//             this.RegistrationNo = stuData.registerationNumber;
//             this.courseName = stuData.courseName;
//             this.cgpa = stuData.cgpa;
//             this.CurrentYear = stuData.currentYear;
//             this.CurrentTerm = stuData.currentTerm;
//             this.studentStatus = stuData.studentStatus;
//             this.form.get('EmailId')?.setValue(stuData.studentEmail || this.eligibilityForm.get('email')?.value);
//           this.checkApplicationStatusBeforeEligibility();
//         }
//       }
//     });
//   }

//   checkApplicationStatusBeforeEligibility(): void {
//     this.servicesSM.getApplicationDetailsBYId(this.RegistrationNo).subscribe(res => {
//       this.ApplicationID = res.item1?.[0]?.applicationId;
//       if (+(this.ApplicationID) > 0) {
//         this.stopLoader();
//         this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
//       } else {
//         this.runEligibilityChecks();
//       }
//     });
//   }

//     runEligibilityChecks(): void {
//     this.servicesSM.GetStudentAllPreviousMarks(this.RegistrationNo).subscribe(res => {
//       this.studentGradeMarksDataX = res.item1 || [];
//       this.studentAcademicDetail = res.item4?.[0] || {};
//       this.ProgramCode = this.studentAcademicDetail.PName?.split(':')[0].trim();
//       this.SectionCode = this.studentAcademicDetail.Section;
//       this.getUniversityDetails();
//       this.FindGradeFCount(this.RegistrationNo);
//       this.isEligible = true;
//       this.stopLoader(); // #1 Ends
//     });
//   }
 
//   getUniversityDetails(): void {
//     this.servicesSM.getUniversityLists(this.ProgramCode || '').subscribe(res => this.uniData = res.item1);
//   }

//   FindGradeFCount(regdNo: any): void {
//     this.servicesSM.getStudentDetailsWithMarks(regdNo).subscribe(res => {
//       this.studentDetailsWithMarks = res.item1 || [];
//       this.GradeFcount = this.studentDetailsWithMarks.filter(i => 
//         i.grade?.toUpperCase() === 'F' || +i.gradeNum <= 6
//       ).length;
//     });
//   }

//   private buildEligibilityForm(): void {
//     this.eligibilityForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
//     });
//   }

//   private buildMainForm(): void {
//     this.form = this.fb.group({
//       CountryName: ['', Validators.required],
//       EmailId: ['', [Validators.required, Validators.email]],
//       WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
//       PhoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
//       ParentContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
//       ApplyingOption: ['', Validators.required],
//       UniversityOption1: ['', Validators.required],
//       UniversityOption2: ['', Validators.required],
//       UniversityOption3: ['', Validators.required],
//       PassportStatus: ['', Validators.required],
//       PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''], PassportDocumentPath: [''],
//       IsVisaRejected: ['', Validators.required],
//       EnglishTestType: ['', Validators.required],
//       ListeningScore: [''], SpeakingScore: [''], ReadingScore: [''], WritingScore: [''], OverallScore: [''], EnglishTestYear: [''], EnglishDocumentPath: [''],
//       SponsorType: ['', Validators.required],
//       AvailableFunds: ['', Validators.required],
//       AcceptPolicy: [true, Validators.requiredTrue],
//       ResumeDocumentPath: ['', Validators.required]
//     }, { validators: [this.distinctPhoneNumbersValidator()] });
    
//     this.setupConditionalValidators();
//     this.subscribeToFormChanges();
//   }

//   private subscribeToFormChanges(): void {
//     this.form.get('UniversityOption1')?.valueChanges.subscribe(() => {
//       this.form.get('UniversityOption2')?.setValue('');
//       this.form.get('UniversityOption3')?.setValue('');
//     });
//   }

//   canProceedToNext(step: number): boolean {
//     const config: any = {
//       1: ['CountryName', 'WhatsAppNo', 'ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'],
//       2: ['PassportStatus', 'IsVisaRejected', 'EnglishTestType'],
//       3: ['SponsorType', 'AvailableFunds', 'AcceptPolicy'],
//       4: ['ResumeDocumentPath']
//     };
//     const controls = config[step] || [];
//     return controls.every((c: string) => this.form.get(c)?.valid);
//   }

//   private distinctPhoneNumbersValidator(): ValidatorFn {
//     return (group: AbstractControl): ValidationErrors | null => {
//       const wa = group.get('WhatsAppNo')?.value;
//       const parent = group.get('ParentContact')?.value;
//       return wa && parent && wa === parent ? { numbersMustBeDistinct: true } : null;
//     };
//   }

//   // --- FILE HANDLING ---
//   PassportDocumentPath: string = '';
//   EnglishDocumentPath: string = '';
//   ResumeDocumentPath: string = '';
//   FeesDocumentPath: string = '';
//   ConsentLetterDocumentPath: string = '';
//   onPassportFileSelected(event: any): void { this.processFile(event, 'Passport'); }
//   onEnglishFileSelected(event: any): void { this.processFile(event, 'English'); }
//   onResumeFileSelected(event: any): void { this.processFile(event, 'Resume'); }
//   onFeesFileSelected(event: any): void { this.processFile(event, 'Fees'); }
//   onConsentLetterFileSelected(event: any): void { this.processFile(event, 'ConsentLetter'); }

//   private processFile(event: any, type: string): void {
//     const target = event.target as HTMLInputElement;
//     const file = target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       const base64 = (reader.result as string).split(',')[1];
//       const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      
//       if (type === 'Passport') { 
//         this.PassportFileData = base64; 
//         this.PassportFileName = this.PassportDocumentPath = name; 
//         this.form.get('PassportDocumentPath')?.setValue(name);
//         this.UploadedPassport = true;
//       }
//       if (type === 'English') { 
//         this.EnglishProofData = base64; 
//         this.EnglishProofFileName = this.EnglishDocumentPath = name; 
//         this.form.get('EnglishDocumentPath')?.setValue(name);
//         this.UploadedEnglish = true;
//       }
//       if (type === 'Resume') {
//         this.ResumeFileData = base64;
//         this.ResumeFileName = this.ResumeDocumentPath = name;
//         this.form.get('ResumeDocumentPath')?.setValue(name);
//         this.UploadedResume = true;
//       }
//       if (type === 'Fees') {
//         this.FeesProofData = base64;
//         this.FeesProofFileName = this.FeesDocumentPath = name;
//         this.UploadedFees = true;
//       }
//       if (type === 'ConsentLetter') {
//         this.ConsentLetterData = base64;
//         this.ConsentLetterFileName = this.ConsentLetterDocumentPath = name;
//         this.UploadedConsentLetter = true;
//       }
      
//     };
//     reader.readAsDataURL(file);
//   }

//    CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
//   englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];ContactNo:any;
//     DownloadFormat(): void {
//     const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
//     const link = document.createElement('a');
//     link.href = fileUrl;
//     link.download = 'SE-Consent-Letter.pdf';
//     link.click();
//   }
// }
