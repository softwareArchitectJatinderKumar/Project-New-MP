import { Component, OnInit } from '@angular/core';
import { countries } from './countries-list';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
// Import necessary RxJS operators
import { catchError, finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import swal from 'sweetalert2'; // Use swal/SweetAlert2 for alerts

// --- MOCK INTERFACES (Replace with your actual response interfaces) ---

interface Country {
  name: string;
  code: string;
}

interface StudentBasicDetails {
  studentName: string;
  registerationNumber: string;
  studentMobile: string;
  courseName: string;
  cgpa: string;
  cgpA1: string;
  currentYear: number;
  currentTerm: number;
  courseTotalDuration: number;
  courseTotalTerms: number;
  studentStatus: string;
  studentEmail: string;
  // OfficialCode (ProgramCode) might come from this or Marks API
}

interface StudentMarksDetails {
  officialCode: string; // ProgramCode
  section: string;
  schoolId: number;
  grade?: string;
  gradeNum?: string;
}

interface ApplicationDetails {
  applicationId: number;
  isRejected: boolean | null;
  countryCode: string;
  whatsAppNo: string;
  emailId: string;
  universityOption1: string;
  universityOption2: string;
  universityOption3: string;
}

interface University {
  universityName: string;
}

// NOTE: Assume 'SemesterExchangeStuDetailsService' and 'countriesList' exist and are provided via the environment.

// -------------------------------------------------------------------

@Component({
  selector: 'StudentForm',
  templateUrl: './abc.component.html',
  styleUrls: ['./StudentForm.component.scss'],
  // Inject your services here (ServicesSM is SemesterExchangeStuDetailsService)
  // providers: [SemesterExchangeStuDetailsService] 
})
export class abcStudentFormComponent implements OnInit {
  
  // --- Component State and Dynamic Data ---
  isLoading: boolean = true; // Controls full page loader
  loginFailed: boolean = false;
  eligible: boolean = false; 

  // Student Details (Dynamically fetched)
  studentName: string = '';
  RegistrationNo: string = ''; // Key identifier
  courseName: string = '';
  cgpa: string = '';
  ProgramCode: string = ''; // officialCode
  SectionCode: string = '';
  CurrentTerm: number = 0;
  CourseTotalTerms: number = 0;
  GradeFcount: number = 0;
  EmailId: string = ' ';
  
  // Dropdown Data (Dynamically fetched)
  // countriesList: Country[] = []; // Fetched via API, mocked here for interfaces
  countriesList: any = countries;
  uniData: University[] = [];
  allProgramCode: any[] = [];
  
  // Form State
  currentStep: number = 1;
  totalSteps: number = 4; 
  PassportStatus: 'Yes' | 'No' | 'Applied' = 'No';
  IsSelfFunded: 'Parent' | 'Relative' | 'Other' | '' = 'Parent';
  showPolicy: boolean = false;
  SemesterExchangeRegistration!: FormGroup;
  isFormSubmitted: boolean = false;

  // Mock Service Instance (Replace with actual Angular Dependency Injection)
  // private ServicesSM: SemesterExchangeStuDetailsService; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // Replace the following mock structure with your actual injected service
    private ServicesSM:  SemesterExchangeStuDetailsService,
  ) { 
    // Mocking for countriesList (In a real app, this should also be fetched via API)
    this.countriesList =countries;
  }

  ngOnInit(): void {
    // Start the consolidated data loading process on initialization
    this.loadInitialData();
  }

  // Helper to get form controls easily (f['controlName'])
  get f() { return this.SemesterExchangeRegistration.controls; }

  // -------------------------------------------------------------------
  // --- RXJS REFACTORING FOR DATA FETCHING (Replaces getStudentDetail, GetStudentMarksDetails, getApplicationDetails) ---
  // -------------------------------------------------------------------

  private LoginFailed(err: any): void {
    console.error('API Error:', err);
    // You can use the swal from the original code here if needed
    // swal.fire({ title: 'Error', text: 'An error occurred during login/data retrieval.', icon: 'error' });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.loginFailed = false;

    // 1. Fetch Student Basic Details
    this.ServicesSM.getStudentById().pipe(
      // 1a. Map basic student data and check for empty response
      tap(response => {
        if (response.item1.length === 0) {
          throw new Error('No student data found.');
        }
        const stuData: StudentBasicDetails = response.item1[0];
        
        this.studentName = stuData.studentName;
        this.RegistrationNo = stuData.registerationNumber;
        this.courseName = stuData.courseName;
        this.cgpa = stuData.cgpa;
        this.CurrentTerm = stuData.currentTerm;
        this.CourseTotalTerms = stuData.courseTotalTerms;
        
        // Handle Email logic (kept from original code)
        const studentEmail = stuData.studentEmail;
        this.EmailId = (studentEmail && studentEmail.length >= 5) ? studentEmail : ' ';
      }),

      // 2. Chain to fetch Student Marks Details (uses RegistrationNo set in step 1)
      switchMap(() => this.getStudentMarksAndEligibility(this.RegistrationNo)),

      // 3. Chain to check for existing application and handle redirection
      switchMap((eligibilityResult) => this.checkExistingApplication(this.RegistrationNo, eligibilityResult)),
      
      // Handle all errors from any step
      catchError(error => {
        if (error.message === 'No student data found.') {
          this.loginFailed = true;
        } else if (error.message === 'Application exists.') {
          // This is a success condition wrapped in an error for flow control, handled in the subscription
        } else {
          this.LoginFailed(error);
        }
        return of(null); // Return observable of null to complete gracefully
      }),

      // 4. Ensure loading state is reset with a delay
      finalize(() => {
        // Delay hiding the loader for 2.5 seconds as requested in original code
        setTimeout(() => {
          this.isLoading = false;
        }, 2500); 
      })

    ).subscribe({
      next: (result) => {
        // If execution reaches here, no application exists and eligibility is determined
        if (this.eligible) {
          this.initForm(); // Initialize form only if eligible
          this.getUniversityDetails(); // Load supporting lists
        }
      },
      error: (error) => {
        // Catch errors not handled by catchError, especially the redirection one
        if (error.message === 'Application exists.') {
          // Handle successful redirection case here (as per original logic using swal)
          swal.fire({
            title: 'Application already Exists',
            text: 'You will be redirected to the dashboard.',
            icon: 'success',
            showConfirmButton: false,
            timer: 5000 
          }).then(() => {
            // NOTE: Replace 'LoginName' with your actual stored user identifier
            this.router.navigate(['StudentDashboard', 'LoginNamePlaceholder', this.RegistrationNo]);
          });
        }
      }
    });
  }

  /**
   * Fetches marks, calculates F grades, sets ProgramCode, and determines eligibility.
   */
  private getStudentMarksAndEligibility(Regdno: string): Observable<boolean> {
    return this.ServicesSM.getStudentDetailsWithMarks(Regdno).pipe(
      tap(response => {
        const StudentDetailsWithMarks: StudentMarksDetails[] = response.item1;
        
        if (StudentDetailsWithMarks.length > 0) {
          const firstDetail = StudentDetailsWithMarks[0];
          this.ProgramCode = firstDetail.officialCode;
          this.SectionCode = firstDetail.section;
          // ... map SchoolId here if needed

          // Logic to calculate F grades
          let fCount = 0;
          for (const item of StudentDetailsWithMarks) {
            const gradeStr = item.grade?.toUpperCase();
            const gradeNum = parseInt(item.gradeNum as string, 10);

            // If grade is F or gradeNum ≤ 6 (kept from original logic)
            if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
              fCount++;
            }
          }
          this.GradeFcount = fCount;
          
          // Set eligibility: Less than 1 F grade AND current term is within limits (kept from original eligibility logic)
          this.eligible = true;//(this.GradeFcount < 1) && (this.CurrentTerm > 0 && this.CurrentTerm < this.CourseTotalTerms); 

        } else {
          this.eligible = false;
        }
      }),
      switchMap(() => of(this.eligible)), // Pass eligibility status down the chain
      catchError(err => {
        this.eligible = false;
        console.error('Failed to fetch student marks:', err);
        return of(false);
      })
    );
  }

  /**
   * Checks for an existing application and throws an error if found to redirect.
   */
  private checkExistingApplication(regId: string, isEligible: boolean): Observable<boolean> {
    if (!isEligible) {
        // If not eligible, no need to check for existing application, but allow the chain to complete
        return of(false);
    }
    
    return this.ServicesSM.getApplicationDetailsBYId(regId).pipe(
      tap(response => {
        if (response.item1.length > 0) {
          const stuApplication: ApplicationDetails = response.item1[0];
          
          // If application exists (ID > 0), trigger redirection logic
          if (stuApplication.applicationId > 0) {
            // Throwing an error here is an established RxJS pattern to break the pipe and handle the 'success-redirection' case in the main subscribe/error block.
            throw new Error('Application exists.'); 
          }
        }
      }),
      switchMap(() => of(false)), // If no application found, proceed
      catchError(err => {
        // Pass the specific redirection error up the chain
        if (err.message === 'Application exists.') {
          throw err; 
        }
        // If other API errors occur, log and assume no existing application
        console.error('Application status check failed:', err);
        return of(false);
      })
    );
  }

  /**
   * Fetches independent lists using forkJoin for parallel loading.
   */
  getUniversityDetails(): void {
    // 1. Fetch University List (depends on ProgramCode, which is now set)
    const uniList$ = this.ServicesSM.getUniversityLists(this.ProgramCode).pipe(
      tap(response => {
        this.uniData = response.item1;
      }),
      catchError(err => { console.error('Uni list failed:', err); return of(null); })
    );

    // 2. Fetch All Program Codes List
    const programCodes$ = this.ServicesSM.FetchAllProgramCodesList().pipe(
      tap(response => {
        this.allProgramCode = response.item1;
      }),
      catchError(err => { console.error('Program code list failed:', err); return of(null); })
    );

    // Combine both API calls
    forkJoin([uniList$, programCodes$]).subscribe();
  }
  
  // -------------------------------------------------------------------
  // --- FORM INITIALIZATION AND VALIDATION (As previously refactored) ---
  // -------------------------------------------------------------------

  initForm(): void {
    this.SemesterExchangeRegistration = this.fb.group({
      // === STEP 1: Contact & Relative ===
      CountryName: ['', Validators.required],
      WhatsAppNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      // ParentContact requires custom validation to be distinct
      ParentContact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), this.distinctNumbersValidator()]],
      HasRelativeDetails: ['No', Validators.required],
      // #2: Relative Email & Phone are NOT required
      RelativeName: [''], RelativeCountryName: [''], RelativeRelation: [''],
      EmailId: [this.EmailId], RelativePhone: [''], // Default EmailId from student details

      // === STEP 2: University Preferences ===
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],
      RegistrationNo: [this.RegistrationNo],

      // === STEP 3: Passport & Visa ===
      PassportStatus: ['No', Validators.required],
      PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''], PassportDocumentPath: [''],
      IsVisaRejected: ['No', Validators.required],
      VisaRejectedReason: [''], VisaRejectedCountry: [''],

      // === STEP 4: English Proficiency & Sponsor & Documents & Declaration ===
      EnglishTestType: ['', Validators.required],
      testDate: [''], ListeningScore: [''], ReadingScore: [''], WritingScore: [''], SpeakingScore: [''],
      OverallScore: [''], EnglishTestYear: [''], EnglishProofDocumentPath: [''],

      // Sponsor
      IsSelfFunded: ['Parent', Validators.required],
      AvailableFunds: ['', Validators.required],
      SponsorName: [''], SponsorRelation: [''],

      // Documents & Declaration
      FeesProofDocumentPath: [''],
      ResumeDocumentPath: ['', Validators.required], // #4: Resume is REQUIRED
      ConsentLetterDocumentPath: ['', Validators.required],
      AcceptPolicy: [false, Validators.requiredTrue]
    });
    this.setupConditionalValidation();
  }

  distinctNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) return null;

      const whatsapp = form.get('WhatsAppNo')?.value;
      const phone = form.get('PhoneNumber')?.value;
      const parentContact = control.value;

      if (whatsapp && phone && parentContact && (whatsapp === parentContact || phone === parentContact)) {
        return { numbersMustBeDistinct: true };
      }
      return null;
    };
  }
  
  setupConditionalValidation(): void {
    // #3: English Proficiency Test Logic
    this.f['EnglishTestType'].valueChanges.subscribe(value => {
      const dateControl = this.f['testDate'];
      const scoreControls = ['ListeningScore', 'ReadingScore', 'WritingScore', 'SpeakingScore', 'OverallScore', 'EnglishTestYear'];
      
      const isTestGiven = ['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(value);
      const isTestAppliedOrAppeared = ['Applied', 'Appeared'].includes(value);

      // 1. Test Date: Required if Applied or Appeared
      dateControl.setValidators(isTestAppliedOrAppeared ? Validators.required : null);
      dateControl.updateValueAndValidity();

      // 2. Scores: Required if PTE, IELTS, DULINGO, TOFEL
      scoreControls.forEach(key => {
        const control = this.f[key];
        control.setValidators(isTestGiven ? Validators.required : null);
        control.updateValueAndValidity();
      });
    });

    // Passport Logic: Required fields if status is 'Yes'
    this.f['PassportStatus'].valueChanges.subscribe(value => {
      const isYes = value === 'Yes';
      const passportFields = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'];
      passportFields.forEach(key => {
        this.f[key].setValidators(isYes ? Validators.required : null);
        this.f[key].updateValueAndValidity();
      });
    });

    // Visa Rejection Logic: Required fields if rejected
    this.f['IsVisaRejected'].valueChanges.subscribe(value => {
      const isYes = value === 'Yes';
      const visaFields = ['VisaRejectedReason', 'VisaRejectedCountry'];
      visaFields.forEach(key => {
        this.f[key].setValidators(isYes ? Validators.required : null);
        this.f[key].updateValueAndValidity();
      });
    });

    // Sponsor Logic: Required fields if type is 'Other'
    this.f['IsSelfFunded'].valueChanges.subscribe(value => {
      const isOther = value === 'Other';
      const sponsorFields = ['SponsorName', 'SponsorRelation'];
      sponsorFields.forEach(key => {
        this.f[key].setValidators(isOther ? Validators.required : null);
        this.f[key].updateValueAndValidity();
      });
    });
  }


  // -------------------------------------------------------------------
  // --- WIZARD NAVIGATION & SUBMISSION ---
  // -------------------------------------------------------------------

  getStepControls(step: number): string[] {
    // List of required controls for each step, including conditional ones.
    switch (step) {
      case 1:
        return ['CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 'HasRelativeDetails'];
      case 2:
        return ['ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'];
      case 3:
        let controls3 = ['PassportStatus', 'IsVisaRejected'];
        if (this.f['PassportStatus'].value === 'Yes') { controls3.push('PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'); }
        if (this.f['IsVisaRejected'].value === 'Yes') { controls3.push('VisaRejectedReason', 'VisaRejectedCountry'); }
        return controls3;
      case 4:
        let controls4 = ['EnglishTestType', 'IsSelfFunded', 'AvailableFunds', 'ResumeDocumentPath', 'ConsentLetterDocumentPath', 'AcceptPolicy'];
        const testType = this.f['EnglishTestType'].value;
        if (['Applied', 'Appeared'].includes(testType)) { controls4.push('testDate'); }
        if (['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(testType)) { controls4.push('ListeningScore', 'ReadingScore', 'WritingScore', 'SpeakingScore', 'OverallScore', 'EnglishTestYear'); }
        if (this.f['IsSelfFunded'].value === 'Other') { controls4.push('SponsorName', 'SponsorRelation'); }
        return controls4;
      default: return [];
    }
  }

  isStepValid(step: number): boolean {
    const controls = this.getStepControls(step);
    for (const key of controls) {
      if (this.f[key].invalid) { return false; }
    }
    return true;
  }

  markStepControlsAsTouched(step: number): void {
    const controls = this.getStepControls(step);
    controls.forEach(key => {
      this.f[key].markAsTouched();
    });
  }

  nextStep(): void {
    this.markStepControlsAsTouched(this.currentStep);
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  onFileSelected(event: any, fieldName: string): void {
    if (event.target.files.length > 0) {
      // For demonstration, we just store the filename for validation
      this.f[fieldName].setValue(event.target.files[0].name); 
      this.f[fieldName].markAsDirty();
      this.f[fieldName].updateValueAndValidity();
    }
  }

  DownloadFormat(): void {
    const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'SE-Consent-Letter.pdf';
    link.click();
  }

  togglePolicy(event: Event): void {
    event.preventDefault();
    this.showPolicy = !this.showPolicy;
  }

  Onsubmit(): void {
    this.isFormSubmitted = true;
    this.markStepControlsAsTouched(this.currentStep);

    if (this.SemesterExchangeRegistration.valid) {
      this.isLoading = true;
      console.log('Final Form Data:', this.SemesterExchangeRegistration.value);
      // Actual API call to save the data (e.g., this.ServicesSM.saveApplication(this.SemesterExchangeRegistration.value).subscribe(...))
      setTimeout(() => {
        this.isLoading = false;
        swal.fire('Success', 'Application Submitted Successfully!', 'success');
      }, 2000);
    } else {
      console.log('Form is invalid. Review errors.');
      // Navigate to the first invalid step
      for (let i = 1; i <= this.totalSteps; i++) {
        if (!this.isStepValid(i)) {
          this.currentStep = i;
          break;
        }
      }
      window.scrollTo(0, 0);
      swal.fire('Validation Error', 'Please correct the errors in the form before submitting.', 'error');
    }
  }
}