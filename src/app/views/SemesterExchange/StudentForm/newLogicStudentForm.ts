// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { Title } from '@angular/platform-browser';
// import { ActivatedRoute, Router } from '@angular/router';
// import { WizardComponent as ArchWizardComponent } from 'angular-archwizard';

// // Assuming 'countries-list' file exists in the same directory and exports 'countries'
// import { countries } from './countries-list'; 

// import { AuthService } from 'src/app/_services/auth.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import Swal from 'sweetalert2';

// // Utility type for better type safety
// interface UploadedFile {
//   name: string;
//   file: File | null;
//   isRequired: boolean;
//   uploaded: boolean;
// }

// @Component({
//   selector: 'StudentForm',
//   templateUrl: './NewStudentForm.component.html',
//   styleUrls: ['./StudentForm.component.scss'],
// })
// export class StudentFormComponent implements OnInit {
//   // Wizard reference for programmatic navigation
//   @ViewChild(ArchWizardComponent)
//   public wizard!: ArchWizardComponent;

//   // Form Groups for each step
//   personalDetailsForm!: FormGroup;
//   universityPassportForm!: FormGroup;
//   englishSponsorForm!: FormGroup;
//   documentUploadForm!: FormGroup;

//   // Helper properties
//   countriesList: any = countries;
//   isLoading: boolean = false;
//   loginFailed: boolean = false;
//   eligible: boolean = false;
//   isFormSubmitted: boolean = false; // The corrected single flag (replaces isForm1Submitted)

//   // Data properties (example mock data)
//   studentName: string = 'N/A';
//   RegistrationNo: string = 'N/A';
//   courseName: string = 'N/A';
//   cgpa: string = 'N/A';
//   uniData: any[] = [{ universityName: 'Uni A' }, { universityName: 'Uni B' }, { universityName: 'Uni C' }]; 

//   uploadedFiles: { [key: string]: UploadedFile } = {
//     // CV/Resume is required
//     resume: { name: '', file: null, isRequired: true, uploaded: false },
//     passport: { name: '', file: null, isRequired: false, uploaded: false },
//     englishProof: { name: '', file: null, isRequired: false, uploaded: false },
//     feesProof: { name: '', file: null, isRequired: false, uploaded: false },
//     consentLetter: { name: '', file: null, isRequired: false, uploaded: false },
//     other: { name: '', file: null, isRequired: false, uploaded: false },
//   };

//   englishStatuses = ['Select', 'Not required', 'Not Given', 'Appeared/Given'];
//   englishTestNames = ['PTE', 'IELTS', 'TOFEL', 'DULINGO'];


//   constructor(
//     private fb: FormBuilder,
//     private AuthServicess: AuthService,
//     private StorageServicess: StorageService,
//     private ServicesSM: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private title: Title
//   ) {}

//   ngOnInit(): void {
//     this.title.setTitle('New Application Registration Wizard');
//     this.initForms();
//     // Mocking successful initial check
//     this.eligible = true;
//     this.studentName = 'John Doe';
//     this.RegistrationNo = '12345678';
//   }

//   // Custom Validator to ensure ParentContact is distinct from WhatsAppNo and PhoneNumber
//   public static distinctNumbersValidator(group: AbstractControl): ValidationErrors | null {
//     const whatsAppNo = group.get('WhatsAppNo')?.value;
//     const phoneNumber = group.get('PhoneNumber')?.value;
//     const parentContact = group.get('ParentContact')?.value;

//     let hasDistinctError = false;

//     // Check if ParentContact is the same as either personal number
//     if (parentContact && (parentContact === whatsAppNo || parentContact === phoneNumber)) {
//       hasDistinctError = true;
//     }

//     return hasDistinctError ? { numbersMustBeDistinct: true } : null;
//   }

//   // Initialize all FormGroups
//   initForms(): void {
//     // STEP 1: Personal Details
//     this.personalDetailsForm = this.fb.group({
//       // Section 1: Contact Information (Required & Distinct Validation)
//       CountryName: ['', Validators.required],
//       WhatsAppNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//       PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//       ParentContact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      
//       // Section 2: Relative Details (Conditional Validation)
//       HasRelative: ['No', Validators.required], // Renamed from HasRelativeDetails to HasRelative
//       RelativeName: [''], // Required conditionally
//       RelativeRelation: [''], // Required conditionally
//       RelativeCountryName: [''], // Required conditionally
//       EmailId: [''], // Optional
//       RelativePhone: ['', Validators.pattern('^[0-9]{10}$')], // Optional
      
//       // Section 3: Student Information (Read-only/Hidden data)
//       RegistrationNo: [this.RegistrationNo],
//     }, { validators: StudentFormComponent.distinctNumbersValidator });


//     // STEP 2: University Preferences & Passport Details
//     this.universityPassportForm = this.fb.group({
//       ApplyingOption: ['', Validators.required],
//       UniversityOption1: ['', Validators.required],
//       UniversityOption2: ['', Validators.required],
//       UniversityOption3: ['', Validators.required],
//       PassportStatus: ['', Validators.required],
//       PassportNumber: [''],
//       PassportIssueDate: [''],
//       PassportValidUpto: [''],
//       IsVisaRejected: ['', Validators.required],
//       VisaRejectedReason: [''],
//       VisaRejectedCountry: [''],
//     });

//     // STEP 3: English Proficiency & Sponsor
//     this.englishSponsorForm = this.fb.group({
//       EnglishProficiencyStatus: ['Select', Validators.required],
//       testName: [''],
//       testDate: [''],
//       ListeningScore: [''],
//       SpeakingScore: [''],
//       ReadingScore: [''],
//       WritingScore: [''],
//       OverallScore: [''],
//       EnglishTestYear: [''],
//       IsSelfFunded: ['', Validators.required],
//       SponsorName: [''],
//       SponsorRelation: [''],
//       AvailableFunds: ['', Validators.required],
//       AcceptPolicy: [false, Validators.requiredTrue],
//     });


//     // STEP 4: Document Details
//     this.documentUploadForm = this.fb.group({
//       // Control to check if required files are selected
//       resumePath: ['', this.uploadedFiles.resume.isRequired ? Validators.required : null],
//     });

//     // Setup the conditional validation logic
//     this.setupConditionalValidation();
//   }

//   // Logic to set conditional validators (Passport, Visa, English, Relative)
//   setupConditionalValidation(): void {

//     // Relative Details Conditional Validation
//     this.personalDetailsForm.get('HasRelative')?.valueChanges.subscribe(value => {
//       const name = this.personalDetailsForm.get('RelativeName');
//       const relation = this.personalDetailsForm.get('RelativeRelation');
//       const country = this.personalDetailsForm.get('RelativeCountryName');
//       const controls = [name, relation, country];

//       if (value === 'Yes') {
//         controls.forEach(control => control?.setValidators(Validators.required));
//       } else {
//         controls.forEach(control => control?.clearValidators());
//       }
//       controls.forEach(control => control?.updateValueAndValidity());
//     });
    
//     // Passport Status Conditional Validation
//     this.universityPassportForm.get('PassportStatus')?.valueChanges.subscribe(value => {
//       const requiredControls = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto'];
      
//       requiredControls.forEach(controlName => {
//         const control = this.universityPassportForm.get(controlName);
//         if (value === 'Yes') {
//           control?.setValidators(Validators.required);
//         } else {
//           control?.clearValidators();
//         }
//         control?.updateValueAndValidity();
//       });
//     });

//     // Visa Rejection Conditional Validation
//     this.universityPassportForm.get('IsVisaRejected')?.valueChanges.subscribe(value => {
//       const requiredControls = ['VisaRejectedReason', 'VisaRejectedCountry'];
      
//       requiredControls.forEach(controlName => {
//         const control = this.universityPassportForm.get(controlName);
//         if (value === 'Yes') {
//           control?.setValidators(Validators.required);
//         } else {
//           control?.clearValidators();
//         }
//         control?.updateValueAndValidity();
//       });
//     });

//     // English Proficiency Conditional Validation
//     this.englishSponsorForm.get('EnglishProficiencyStatus')?.valueChanges.subscribe(value => {
//         const requiredControls = ['testName', 'testDate', 'ListeningScore', 'SpeakingScore', 'ReadingScore', 'WritingScore', 'OverallScore', 'EnglishTestYear'];
        
//         requiredControls.forEach(controlName => {
//             const control = this.englishSponsorForm.get(controlName);
//             if (value === 'Appeared/Given') {
//                 control?.setValidators(Validators.required);
//             } else {
//                 control?.clearValidators();
//             }
//             control?.updateValueAndValidity();
//         });
//     });

//     // Sponsor Conditional Validation
//     this.englishSponsorForm.get('IsSelfFunded')?.valueChanges.subscribe(value => {
//         const requiredControls = ['SponsorName', 'SponsorRelation'];
        
//         requiredControls.forEach(controlName => {
//             const control = this.englishSponsorForm.get(controlName);
//             if (value === 'Other') {
//                 control?.setValidators(Validators.required);
//             } else {
//                 control?.clearValidators();
//             }
//             control?.updateValueAndValidity();
//         });
//     });
//   }

//   // File handling
//   onFileSelected(event: any, docType: keyof typeof this.uploadedFiles): void {
//     const file: File = event.target.files[0];

//     if (file) {
//       this.uploadedFiles[docType].file = file;
//       this.uploadedFiles[docType].name = file.name;
//       this.uploadedFiles[docType].uploaded = true;
//     } else {
//       this.uploadedFiles[docType].file = null;
//       this.uploadedFiles[docType].name = '';
//       this.uploadedFiles[docType].uploaded = false;
//     }
    
//     // Manually trigger validation for the resume field in the Document form
//     if (docType === 'resume') {
//         this.documentUploadForm.get('resumePath')?.patchValue(this.uploadedFiles.resume.name);
//         this.documentUploadForm.get('resumePath')?.updateValueAndValidity();
//     }
//   }
  
//   // Custom form control accessors (Replacing the erroneous 'form1')
//   get pd() { return this.personalDetailsForm.controls; }
//   get up() { return this.universityPassportForm.controls; }
//   get es() { return this.englishSponsorForm.controls; }
//   get du() { return this.documentUploadForm.controls; }

//   // Navigation and Submission Logic
//   goToNextStep(wizard: ArchWizardComponent): void {
//     const currentStepIndex = wizard.currentStepIndex;
//     let currentForm: FormGroup;

//     switch (currentStepIndex) {
//       case 0: currentForm = this.personalDetailsForm; break;
//       case 1: currentForm = this.universityPassportForm; break;
//       case 2: currentForm = this.englishSponsorForm; break;
//       case 3: currentForm = this.documentUploadForm; break;
//       default: return;
//     }

//     // Set the single submission flag to true to display errors
//     this.isFormSubmitted = true; 
//     currentForm.markAllAsTouched();

//     if (currentForm.valid) {
//       wizard.goToNextStep();
//       this.isFormSubmitted = false; // Reset flag for next step's initial view
//     } else {
//       Swal.fire({
//         icon: 'error',
//         title: 'Validation Error',
//         text: 'Please complete all required fields and fix the errors before proceeding.',
//       });
//     }
//   }
  
//   goToPreviousStep(wizard: ArchWizardComponent): void {
//     wizard.goToPreviousStep();
//   }

//   // Final Submit Action (Replacing the erroneous 'Onsubmit()')
//   createApplication(): void {
//     // Logic to compile all form data and files for final submission (e.g., via API)
//     if (!this.personalDetailsForm.valid || !this.universityPassportForm.valid || !this.englishSponsorForm.valid || !this.documentUploadForm.valid) {
//         // Run validation on all forms one last time
//         this.isFormSubmitted = true; 
//         this.personalDetailsForm.markAllAsTouched();
//         this.universityPassportForm.markAllAsTouched();
//         this.englishSponsorForm.markAllAsTouched();
//         this.documentUploadForm.markAllAsTouched();

//         Swal.fire({
//             icon: 'error',
//             title: 'Incomplete Application',
//             text: 'One or more steps contain errors. Please navigate back to review.',
//         });
//         return;
//     }
    
//     this.isLoading = true;
    
//     // Placeholder for actual API call
//     console.log('Final Application Data:', {
//         ...this.personalDetailsForm.value,
//         ...this.universityPassportForm.value,
//         ...this.englishSponsorForm.value,
//         uploadedFiles: Object.values(this.uploadedFiles).filter(doc => doc.uploaded),
//     });

//     setTimeout(() => {
//         Swal.fire({
//             icon: 'success',
//             title: 'Application Created!',
//             text: 'Your registration application has been submitted successfully.',
//         });
//         this.isLoading = false;
//         // Optionally redirect user
//         // this.router.navigate(['/dashboard']); 
//     }, 2000); // Simulate API delay
//   }
// }
// // import { Component, OnInit } from '@angular/core';
// // import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// // import { Title } from '@angular/platform-browser';
// // import { ActivatedRoute, Router } from '@angular/router';
// // import Swal from 'sweetalert2';
// // import { finalize } from 'rxjs';
// // import { AuthService } from 'src/app/_services/auth.service';
// // import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// // import { StorageService } from 'src/app/_services/storage.service';
// // import { countries } from './countries-list';

// // @Component({
// //   selector: 'StudentForm',
// //   templateUrl: './newLogicStudentForm.html',
// //   styleUrls: ['./StudentForm.component.scss'],
// // })
// // export class StudentFormComponent implements OnInit {
// //   countriesList: any = countries;
// //   SemesterExchangeRegistration!: FormGroup;
// //   isForm1Submitted: boolean = false;
// //   isLoading: boolean = false;
// //   eligible: boolean = false;
// //   showPolicy = false;
// //   LoginName: any;
// //   studentName: any;
// //   RegistrationNo: any;
// //   courseName: any;
// //   cgpa: any;
// //   SchoolId: any;
// //   SectionCode: any;
// //   ProgramCode: any;
// //   uniData: any;
// //   PassportStatus: string = '';
// //   IsVisaRejected: any = '';
// //   EnglishTestType: any = '';
// //   IsSelfFunded: any = '';
// //   GradeFcount: number = 0;
// //   UploadedResume: boolean = false;

// //   PassportFileData: any = '';
// //   PassportFileName: any = '';
// //   PassportFileStatus: boolean = false;

// //   ResumeFileData: any = '';
// //   ResumeFileName: any = '';
// //   ResumeFileStatus: boolean = false;

// //   FeesProofData: any = '';
// //   FeesProofFileName: any = '';
// //   FeesProofStatus: boolean = false;

// //   ConsentLetterData: any = '';
// //   ConsentLetterFileName: any = '';
// //   ConsentLetterStatus: boolean = false;

// //   EnglishProofData: any = '';
// //   EnglishProofFileName: any = '';
// //   EnglishProofStatus: boolean = false;
// //     loginFailed: boolean;

// //   constructor(
// //     private fb: FormBuilder,
// //     private title: Title,
// //     private route: ActivatedRoute,
// //     private router: Router,
// //     private AuthServicess: AuthService,
// //     private StorageServicess: StorageService,
// //     private ServicesSM: SemesterExchangeStuDetailsService
// //   ) {}

// //   ngOnInit(): void {
// //     (<HTMLInputElement>document.getElementById('stMain'))?.insertAdjacentHTML('beforeend', '');
// //     this.title.setTitle('Semester Exchange Registration');
// //     this.LoginName = this.route.snapshot.params['LoginName'];
// //     this.initForm();
// //     if (this.LoginName) {
// //       this.getToken(this.LoginName);
// //     } else {
// //       this.LoadNewForm();
// //     }
// //   }

// //   private initForm(): void {
// //     this.SemesterExchangeRegistration = this.fb.group(
// //       {
// //         RegistrationNo: [''],
// //         CountryName: ['', Validators.required],
// //         WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{6,15}$/)]],
// //         PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{6,15}$/)]],
// //         ParentContact: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{6,15}$/)]],
// //         HasRelativeDetails: ['', Validators.required],
// //         EmailId: [''],
// //         RelativePhone: [''],
// //         RelativeName: [''],
// //         RelativeCountryName: [''],
// //         RelativeRelation: [''],
// //         ApplyingOption: ['', Validators.required],
// //         UniversityOption1: ['', Validators.required],
// //         UniversityOption2: ['', Validators.required],
// //         UniversityOption3: ['', Validators.required],
// //         PassportStatus: ['', Validators.required],
// //         PassportNumber: [''],
// //         PassportIssueDate: [''],
// //         PassportValidUpto: [''],
// //         PassportDocumentPath: [''],
// //         IsVisaRejected: ['', Validators.required],
// //         VisaRejectedReason: [''],
// //         VisaRejectedCountry: [''],
// //         EnglishTestType: ['', Validators.required],
// //         AppearedTestType: [''],
// //         testDate: [''],
// //         ListeningScore: [''],
// //         SpeakingScore: [''],
// //         ReadingScore: [''],
// //         WritingScore: [''],
// //         OverallScore: [''],
// //         EnglishTestYear: [''],
// //         IsSelfFunded: ['', Validators.required],
// //         SponsorName: [''],
// //         SponsorRelation: [''],
// //         AvailableFunds: ['', Validators.required],
// //         AcceptPolicy: [false, Validators.requiredTrue],
// //         FeesProofDocumentPath: [''],
// //         EnglishProofDocumentPath: [''],
// //         ResumeDocumentPath: [''],
// //         ConsentLetterDocumentPath: [''],
// //       },
// //       {
// //         validators: [this.phoneDistinctValidator()],
// //       }
// //     );

// //     this.SemesterExchangeRegistration.get('HasRelativeDetails')?.valueChanges.subscribe((val) => {
// //       const emailCtrl = this.SemesterExchangeRegistration.get('EmailId');
// //       const rName = this.SemesterExchangeRegistration.get('RelativeName');
// //       const rRel = this.SemesterExchangeRegistration.get('RelativeRelation');
// //       const rCountry = this.SemesterExchangeRegistration.get('RelativeCountryName');
// //       const rPhone = this.SemesterExchangeRegistration.get('RelativePhone');
// //       if (val === 'No') {
// //         emailCtrl?.clearValidators();
// //         rName?.clearValidators();
// //         rRel?.clearValidators();
// //         rCountry?.clearValidators();
// //         rPhone?.clearValidators();
// //         emailCtrl?.patchValue('NA');
// //         rName?.patchValue('NA');
// //         rRel?.patchValue('NA');
// //         rCountry?.patchValue('NA');
// //         rPhone?.patchValue('NA');
// //       } else {
// //         emailCtrl?.setValidators([Validators.email]);
// //         rName?.setValidators([Validators.required]);
// //         rRel?.setValidators([Validators.required]);
// //         rCountry?.setValidators([Validators.required]);
// //         if (emailCtrl?.value === 'NA') emailCtrl.patchValue('');
// //         if (rName?.value === 'NA') rName.patchValue('');
// //         if (rRel?.value === 'NA') rRel.patchValue('');
// //         if (rCountry?.value === 'NA') rCountry.patchValue('');
// //         if (rPhone?.value === 'NA') rPhone.patchValue('');
// //       }
// //       emailCtrl?.updateValueAndValidity();
// //       rName?.updateValueAndValidity();
// //       rRel?.updateValueAndValidity();
// //       rCountry?.updateValueAndValidity();
// //       rPhone?.updateValueAndValidity();
// //     });

// //     this.SemesterExchangeRegistration.get('PassportStatus')?.valueChanges.subscribe((val) => {
// //       const passportNumber = this.SemesterExchangeRegistration.get('PassportNumber');
// //       const passportIssueDate = this.SemesterExchangeRegistration.get('PassportIssueDate');
// //       const passportValidUpto = this.SemesterExchangeRegistration.get('PassportValidUpto');
// //       const passportDocument = this.SemesterExchangeRegistration.get('PassportDocumentPath');
// //       if (val === 'Yes') {
// //         passportNumber?.setValidators([Validators.required]);
// //         passportIssueDate?.setValidators([Validators.required]);
// //         passportValidUpto?.setValidators([Validators.required]);
// //         passportDocument?.setValidators([Validators.required]);
// //       } else {
// //         passportNumber?.clearValidators();
// //         passportIssueDate?.clearValidators();
// //         passportValidUpto?.clearValidators();
// //         passportDocument?.clearValidators();
// //       }
// //       passportNumber?.updateValueAndValidity();
// //       passportIssueDate?.updateValueAndValidity();
// //       passportValidUpto?.updateValueAndValidity();
// //       passportDocument?.updateValueAndValidity();
// //     });

// //     this.SemesterExchangeRegistration.get('IsVisaRejected')?.valueChanges.subscribe((val) => {
// //       const reason = this.SemesterExchangeRegistration.get('VisaRejectedReason');
// //       const vCountry = this.SemesterExchangeRegistration.get('VisaRejectedCountry');
// //       if (val === 'Yes') {
// //         reason?.setValidators([Validators.required]);
// //         vCountry?.setValidators([Validators.required]);
// //       } else {
// //         reason?.clearValidators();
// //         vCountry?.clearValidators();
// //       }
// //       reason?.updateValueAndValidity();
// //       vCountry?.updateValueAndValidity();
// //     });

// //     this.SemesterExchangeRegistration.get('EnglishTestType')?.valueChanges.subscribe((val) => {
// //       this.EnglishTestType = val;
// //       const appearedTypeControl = this.SemesterExchangeRegistration.get('AppearedTestType');
// //       const testDateControl = this.SemesterExchangeRegistration.get('testDate');
// //       const listening = this.SemesterExchangeRegistration.get('ListeningScore');
// //       const speaking = this.SemesterExchangeRegistration.get('SpeakingScore');
// //       const reading = this.SemesterExchangeRegistration.get('ReadingScore');
// //       const writing = this.SemesterExchangeRegistration.get('WritingScore');
// //       const overall = this.SemesterExchangeRegistration.get('OverallScore');
// //       const testYear = this.SemesterExchangeRegistration.get('EnglishTestYear');
// //       if (val === 'Appeared') {
// //         appearedTypeControl?.setValidators([Validators.required]);
// //         testDateControl?.setValidators([Validators.required]);
// //       } else if (val === 'Applied') {
// //         appearedTypeControl?.clearValidators();
// //         testDateControl?.setValidators([Validators.required]);
// //         listening?.clearValidators();
// //         speaking?.clearValidators();
// //         reading?.clearValidators();
// //         writing?.clearValidators();
// //         overall?.clearValidators();
// //         testYear?.clearValidators();
// //       } else {
// //         appearedTypeControl?.clearValidators();
// //         testDateControl?.clearValidators();
// //         listening?.clearValidators();
// //         speaking?.clearValidators();
// //         reading?.clearValidators();
// //         writing?.clearValidators();
// //         overall?.clearValidators();
// //         testYear?.clearValidators();
// //       }
// //       appearedTypeControl?.updateValueAndValidity();
// //       testDateControl?.updateValueAndValidity();
// //       listening?.updateValueAndValidity();
// //       speaking?.updateValueAndValidity();
// //       reading?.updateValueAndValidity();
// //       writing?.updateValueAndValidity();
// //       overall?.updateValueAndValidity();
// //       testYear?.updateValueAndValidity();
// //     });

// //     this.SemesterExchangeRegistration.get('AppearedTestType')?.valueChanges.subscribe((val) => {
// //       const listening = this.SemesterExchangeRegistration.get('ListeningScore');
// //       const speaking = this.SemesterExchangeRegistration.get('SpeakingScore');
// //       const reading = this.SemesterExchangeRegistration.get('ReadingScore');
// //       const writing = this.SemesterExchangeRegistration.get('WritingScore');
// //       const overall = this.SemesterExchangeRegistration.get('OverallScore');
// //       const testYear = this.SemesterExchangeRegistration.get('EnglishTestYear');
// //       const testsRequiringScores = ['PTE', 'IELTS', 'TOEFL', 'DUOLINGO', 'DULINGO'];
// //       if (testsRequiringScores.includes(val)) {
// //         listening?.setValidators([Validators.required]);
// //         speaking?.setValidators([Validators.required]);
// //         reading?.setValidators([Validators.required]);
// //         writing?.setValidators([Validators.required]);
// //         overall?.setValidators([Validators.required]);
// //         testYear?.setValidators([Validators.required]);
// //       } else {
// //         listening?.clearValidators();
// //         speaking?.clearValidators();
// //         reading?.clearValidators();
// //         writing?.clearValidators();
// //         overall?.clearValidators();
// //         testYear?.clearValidators();
// //       }
// //       listening?.updateValueAndValidity();
// //       speaking?.updateValueAndValidity();
// //       reading?.updateValueAndValidity();
// //       writing?.updateValueAndValidity();
// //       overall?.updateValueAndValidity();
// //       testYear?.updateValueAndValidity();
// //     });

// //     this.SemesterExchangeRegistration.get('IsSelfFunded')?.valueChanges.subscribe((val) => {
// //       const sponsorName = this.SemesterExchangeRegistration.get('SponsorName');
// //       const sponsorRelation = this.SemesterExchangeRegistration.get('SponsorRelation');
// //       if (val === 'Other' || val === 'Relative') {
// //         sponsorName?.setValidators([Validators.required]);
// //         sponsorRelation?.setValidators([Validators.required]);
// //       } else {
// //         sponsorName?.clearValidators();
// //         sponsorRelation?.clearValidators();
// //       }
// //       sponsorName?.updateValueAndValidity();
// //       sponsorRelation?.updateValueAndValidity();
// //     });
// //   }

// //   private phoneDistinctValidator() {
// //     return (group: AbstractControl): ValidationErrors | null => {
// //       const normalize = (v: any) => (v || '').toString().replace(/\D/g, '');
// //       const w = normalize(group.get('WhatsAppNo')?.value);
// //       const p = normalize(group.get('PhoneNumber')?.value);
// //       const parent = normalize(group.get('ParentContact')?.value);
// //       const duplicates = new Set<string>();
// //       if (w && p && w === p) duplicates.add('WhatsAppPhoneDuplicate');
// //       if (w && parent && w === parent) duplicates.add('WhatsAppParentDuplicate');
// //       if (p && parent && p === parent) duplicates.add('PhoneParentDuplicate');
// //       if (duplicates.size > 0) {
// //         if (w && w === p) {
// //           group.get('PhoneNumber')?.setErrors({ numbersMustBeDistinct: true });
// //           group.get('WhatsAppNo')?.setErrors({ numbersMustBeDistinct: true });
// //         }
// //         if (w && w === parent) {
// //           group.get('WhatsAppNo')?.setErrors({ numbersMustBeDistinct: true });
// //           group.get('ParentContact')?.setErrors({ numbersMustBeDistinct: true });
// //         }
// //         if (p && p === parent) {
// //           group.get('PhoneNumber')?.setErrors({ numbersMustBeDistinct: true });
// //           group.get('ParentContact')?.setErrors({ numbersMustBeDistinct: true });
// //         }
// //         return { numbersMustBeDistinct: true };
// //       } else {
// //         const controls = ['WhatsAppNo', 'PhoneNumber', 'ParentContact'];
// //         controls.forEach((c) => {
// //           const ctrl = group.get(c);
// //           if (ctrl?.errors && ctrl.errors['numbersMustBeDistinct']) {
// //             const { numbersMustBeDistinct, ...rest } = ctrl.errors;
// //             if (Object.keys(rest).length === 0) ctrl.setErrors(null);
// //             else ctrl.setErrors(rest as ValidationErrors);
// //           }
// //         });
// //         return null;
// //       }
// //     };
// //   }

// //   get form1() {
// //     return this.SemesterExchangeRegistration.controls;
// //   }

// //   getToken(id: any) {
// //     this.AuthServicess.loginTemp(id).subscribe({
// //       next: (data) => {
// //         this.StorageServicess.saveUser(data);
// //         const authToken = this.StorageServicess.getUser();
// //         if (!this.StorageServicess.isLoggedIn() || authToken === 'Token Expired' || !authToken) {
// //           this.LoginFailed('Invalid or expired token');
// //           return;
// //         }
// //         this.loginFailed = false;
// //         this.getStudentDetail();
// //       },
// //       error: (err) => {
// //         this.LoginFailed(err);
// //       },
// //     });
// //   }

// //   LoadNewForm() {}

// //   getStudentDetail(): void {
// //     this.isLoading = true;
// //     this.ServicesSM.getStudentById()
// //       .pipe(finalize(() => (this.isLoading = false)))
// //       .subscribe({
// //         next: (response) => {
// //           if (response.item1 && response.item1.length > 0) {
// //             const stu = response.item1[0];
// //             this.studentName = stu.studentName;
// //             this.RegistrationNo = stu.registerationNumber;
// //             this.ProgramCode = stu.officialCode;
// //             this.SectionCode = stu.section;
// //             this.SchoolId = stu.schoolId;
// //             this.courseName = stu.courseName;
// //             this.cgpa = stu.cgpa;
// //             this.eligible = true;
// //           } else {
// //             this.eligible = false;
// //           }
// //         },
// //         error: (err) => {
// //           this.LoginFailed(err);
// //         },
// //       });
// //   }

// //   togglePolicy(event: MouseEvent): void {
// //     event.preventDefault();
// //     this.showPolicy = !this.showPolicy;
// //   }

// //   onResumeFileSelected(event: any): void {
// //     this.onFileSelected(event, 'resume');
// //   }

// //   onFileSelected(event: any, fileType: 'passport' | 'resume' | 'feesProof' | 'consentLetter' | 'englishProof'): void {
// //     const reader = new FileReader();
// //     const target = event.target as HTMLInputElement;
// //     const file: File | null = (target.files as FileList)[0] || null;
// //     if (file && file.size > 3148576) {
// //       Swal.fire({
// //         title: 'File size exceeds 3MB. Please upload a smaller file.',
// //         text: 'Invalid File size',
// //         icon: 'warning',
// //       });
// //       target.value = '';
// //       this.assignFileData(fileType, '', '', false);
// //       return;
// //     }
// //     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
// //     if (file && !fileNameRegex.test(file.name)) {
// //       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
// //       const modifiedFile = new File([file], validFileName, { type: file.type });
// //       reader.readAsDataURL(modifiedFile);
// //       reader.onload = () => {
// //         const base64String = (reader.result as string).split(',')[1];
// //         this.assignFileData(fileType, base64String, validFileName, true);
// //       };
// //       return;
// //     }
// //     if (file) {
// //       reader.readAsDataURL(file);
// //       reader.onload = () => {
// //         const base64String = (reader.result as string).split(',')[1];
// //         this.assignFileData(fileType, base64String, file.name, true);
// //       };
// //     } else {
// //       this.assignFileData(fileType, '', '', false);
// //     }
// //   }

// //   private assignFileData(fileType: 'passport' | 'resume' | 'feesProof' | 'consentLetter' | 'englishProof', data: any, name: any, status: boolean): void {
// //     switch (fileType) {
// //       case 'passport':
// //         this.PassportFileData = data;
// //         this.PassportFileName = name;
// //         this.PassportFileStatus = status;
// //         if (status) this.SemesterExchangeRegistration.get('PassportDocumentPath')?.setValue(name);
// //         else this.SemesterExchangeRegistration.get('PassportDocumentPath')?.setValue('');
// //         break;
// //       case 'resume':
// //         this.ResumeFileData = data;
// //         this.ResumeFileName = name;
// //         this.ResumeFileStatus = status;
// //         this.UploadedResume = status;
// //         if (status) this.SemesterExchangeRegistration.get('ResumeDocumentPath')?.setValue(name);
// //         else this.SemesterExchangeRegistration.get('ResumeDocumentPath')?.setValue('');
// //         break;
// //       case 'feesProof':
// //         this.FeesProofData = data;
// //         this.FeesProofFileName = name;
// //         this.FeesProofStatus = status;
// //         if (status) this.SemesterExchangeRegistration.get('FeesProofDocumentPath')?.setValue(name);
// //         else this.SemesterExchangeRegistration.get('FeesProofDocumentPath')?.setValue('');
// //         break;
// //       case 'consentLetter':
// //         this.ConsentLetterData = data;
// //         this.ConsentLetterFileName = name;
// //         this.ConsentLetterStatus = status;
// //         if (status) this.SemesterExchangeRegistration.get('ConsentLetterDocumentPath')?.setValue(name);
// //         else this.SemesterExchangeRegistration.get('ConsentLetterDocumentPath')?.setValue('');
// //         break;
// //       case 'englishProof':
// //         this.EnglishProofData = data;
// //         this.EnglishProofFileName = name;
// //         this.EnglishProofStatus = status;
// //         if (status) this.SemesterExchangeRegistration.get('EnglishProofDocumentPath')?.setValue(name);
// //         else this.SemesterExchangeRegistration.get('EnglishProofDocumentPath')?.setValue('');
// //         break;
// //     }
// //   }

// //   Onsubmit(): void {
// //     this.isForm1Submitted = true;
// //     if (!this.ResumeFileStatus) {
// //       Swal.fire({ title: 'Resume Required', text: 'Please upload your CV / Resume.', icon: 'error' });
// //       return;
// //     }
// //     if (this.SemesterExchangeRegistration.invalid) {
// //       this.SemesterExchangeRegistration.markAllAsTouched();
// //       Swal.fire({ title: 'Validation Error', text: 'Please fill in all required fields correctly.', icon: 'error' });
// //       return;
// //     }
// //     this.isLoading = true;
// //     const minLoadingTime = 2500;
// //     const startTime = Date.now();
// //     const formData = new FormData();
// //     const formValue = this.SemesterExchangeRegistration.value;

// //     formData.append('SchoolId', this.SchoolId || 'NA');
// //     formData.append('SectionCode', this.SectionCode || 'NA');
// //     formData.append('RegistrationNo', this.RegistrationNo || 'NA');
// //     formData.append('EmailId', formValue.EmailId || 'NA');
// //     formData.append('CountryName', formValue.CountryName || 'NA');
// //     formData.append('WhatsAppNo', formValue.WhatsAppNo || 'NA');
// //     formData.append('PhoneNumber', formValue.PhoneNumber || 'NA');
// //     formData.append('ParentContact', formValue.ParentContact || 'NA');
// //     formData.append('ApplyingOption', formValue.ApplyingOption || 'NA');
// //     formData.append('UniversityOption1', formValue.UniversityOption1 || 'NA');
// //     formData.append('UniversityOption2', formValue.UniversityOption2 || 'NA');
// //     formData.append('UniversityOption3', formValue.UniversityOption3 || 'NA');
// //     formData.append('PassportStatus', formValue.PassportStatus || 'NA');

// //     if (formValue.PassportStatus === 'Yes') {
// //       formData.append('PassportNumber', formValue.PassportNumber || 'NA');
// //       formData.append('PassportIssueDate', formValue.PassportIssueDate || 'NA');
// //       formData.append('PassportValidUpto', formValue.PassportValidUpto || 'NA');
// //       formData.append('PassportFileName', this.PassportFileName || 'NA');
// //       formData.append('PassportFileData', this.PassportFileData || 'NA');
// //     } else {
// //       formData.append('PassportNumber', 'NA');
// //       formData.append('PassportIssueDate', 'NA');
// //       formData.append('PassportValidUpto', 'NA');
// //       formData.append('PassportFileName', 'NA');
// //       formData.append('PassportFileData', 'NA');
// //     }

// //     formData.append('IsVisaRejected', formValue.IsVisaRejected || 'NA');
// //     if (formValue.IsVisaRejected === 'Yes') {
// //       formData.append('VisaRejectedReason', formValue.VisaRejectedReason || 'NA');
// //       formData.append('VisaRejectedCountry', formValue.VisaRejectedCountry || 'NA');
// //     } else {
// //       formData.append('VisaRejectedReason', 'NA');
// //       formData.append('VisaRejectedCountry', 'NA');
// //     }

// //     formData.append('EnglishTestType', formValue.EnglishTestType || 'NA');
// //     if (['PTE', 'DULINGO', 'DUOLINGO', 'IELTS', 'TOFEL', 'TOEFL'].includes(formValue.EnglishTestType)) {
// //       formData.append('SpeakingScore', formValue.SpeakingScore || 'NA');
// //       formData.append('ListeningScore', formValue.ListeningScore || 'NA');
// //       formData.append('ReadingScore', formValue.ReadingScore || 'NA');
// //       formData.append('WritingScore', formValue.WritingScore || 'NA');
// //       formData.append('OverallScore', formValue.OverallScore || 'NA');
// //       formData.append('EnglishTestYear', formValue.EnglishTestYear || 'NA');
// //       formData.append('testDate', formValue.testDate || 'NA');
// //       formData.append('AppearedTestType', formValue.AppearedTestType || 'NA');
// //     } else if (formValue.EnglishTestType === 'Applied') {
// //       formData.append('testDate', formValue.testDate || 'NA');
// //       formData.append('SpeakingScore', 'NA');
// //       formData.append('ListeningScore', 'NA');
// //       formData.append('ReadingScore', 'NA');
// //       formData.append('WritingScore', 'NA');
// //       formData.append('OverallScore', 'NA');
// //       formData.append('EnglishTestYear', 'NA');
// //       formData.append('AppearedTestType', 'NA');
// //     } else {
// //       formData.append('SpeakingScore', 'NA');
// //       formData.append('ListeningScore', 'NA');
// //       formData.append('ReadingScore', 'NA');
// //       formData.append('WritingScore', 'NA');
// //       formData.append('OverallScore', 'NA');
// //       formData.append('EnglishTestYear', 'NA');
// //       formData.append('testDate', 'NA');
// //       formData.append('AppearedTestType', 'NA');
// //     }

// //     formData.append('IsSelfFunded', formValue.IsSelfFunded || 'NA');
// //     if (formValue.IsSelfFunded === 'Other' || formValue.IsSelfFunded === 'Relative') {
// //       formData.append('SponsorName', formValue.SponsorName || 'NA');
// //       formData.append('SponsorRelation', formValue.SponsorRelation || 'NA');
// //     } else {
// //       formData.append('SponsorName', 'NA');
// //       formData.append('SponsorRelation', 'NA');
// //     }

// //     formData.append('AvailableFunds', formValue.AvailableFunds || 'NA');
// //     formData.append('AcceptPolicy', formValue.AcceptPolicy ? 'Yes' : 'No');

// //     formData.append('ResumeFileName', this.ResumeFileName || 'NA');
// //     formData.append('ResumeFileData', this.ResumeFileData || 'NA');

// //     formData.append('ConsentLetterFileName', this.ConsentLetterFileName || 'NA');
// //     formData.append('ConsentLetterData', this.ConsentLetterData || 'NA');

// //     formData.append('FeesProofFileName', this.FeesProofFileName || 'NA');
// //     formData.append('FeesProofData', this.FeesProofData || 'NA');

// //     formData.append('EnglishProofFileName', this.EnglishProofFileName || 'NA');
// //     formData.append('EnglishProofData', this.EnglishProofData || 'NA');

// //     formData.append('HasRelativeDetails', formValue.HasRelativeDetails || 'NA');
// //     formData.append('RelativeCountryName', formValue.RelativeCountryName || 'NA');
// //     formData.append('RelativeName', formValue.RelativeName || 'NA');
// //     formData.append('RelativeRelation', formValue.RelativeRelation || 'NA');
// //     formData.append('RelativePhone', formValue.RelativePhone || 'NA');
// //     formData.append('EmailId', formValue.EmailId || 'NA');

// //     this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
// //       .pipe(
// //         finalize(() => {
// //           const elapsed = Date.now() - startTime;
// //           const remaining = Math.max(minLoadingTime - elapsed, 0);
// //           setTimeout(() => {
// //             this.isLoading = false;
// //           }, remaining);
// //         })
// //       )
// //       .subscribe({
// //         next: (data: any) => {
// //           const errorCode = data?.[0]?.returnData ?? -999;
// //           if (errorCode > 0) {
// //             Swal.fire({ title: 'Application Created Successfully', icon: 'success' }).then(() => {
// //               window.location.reload();
// //             });
// //           } else if (errorCode === -1) {
// //             Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => window.location.reload());
// //           } else {
// //             Swal.fire({ title: 'Some Technical Issue', icon: 'error' }).then(() => window.location.reload());
// //           }
// //         },
// //         error: () => {
// //           Swal.fire({ title: 'Error Occurred', text: 'Unable to complete the request. Please try again later.', icon: 'error' });
// //         },
// //       });
// //   }

// //   LoginFailed(_NewError: any) {
// //     this.loginFailed = true;
// //     Swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
// //     const element = document.getElementById('NewRegsiterPage');
// //     if (element) element.hidden = true;
// //   }

// //   DownloadFormat(): void {
// //     const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
// //     const link = document.createElement('a');
// //     link.href = fileUrl;
// //     link.download = fileUrl;
// //     link.click();
// //   }
// // }
