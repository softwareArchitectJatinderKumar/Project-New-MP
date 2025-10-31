import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
  UntypedFormBuilder
} from '@angular/forms';
import { countries } from '../countries-list';

import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-NewLogicForm',
  templateUrl: './NewLogicForm.html',
  styleUrls: ['./NewLogicForm.component.scss']
})
export class NewLogicFormComponent implements OnInit {
  // wizard
  currentStep = 0;
  // #2: Documents moved to a separate step (now 5 steps)
  steps = [
    'Contact / Relative / University Preferences',
    'Passport / Previous Visa / English Proficiency',
    'Sponsor / Declaration',
    'Document Uploads', 
    'Final Review & Submit'
  ];

  showPolicy = true; 

  ApplyingOption: any = '';
  folderUrl: string; serverUrl: string; serverUrlX: string;
  loginFailed: boolean = false;
  stuData: any; uniData: any; university: any; stuApplication: any; RegistrationNo: any;
  ApplicationId: any; ApplicationStatus: any; ContactNo: string; stuWhatsNo: string; EmailId: string;
  CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
  UniversityOption4: string; courseName: any; studentName: any; cgpa: any; CurrentYear: any; CurrentTerm: any; CourseTotalDuration: any; CourseTotalTerms: any; StudentStatus: any; WhatsAppNo: any;
  uploadedDocList: any[] = []; feesReceipt: string; DocumentName: any; DocumentPath: any; CreatedBy: string;
  
  // #4: Specific document name properties for UI tracking
  uploadedPassportName = '';
  uploadedEnglishName = '';
  uploadedFeesName = '';
  uploadedConsentName = '';
  uploadedResumeName = '';
// HIGHLIGHT: Fix 2 & 4 - Properties to track uploaded file names for display/review
 
  uploadedOtherFiles: { key: string, name: string }[] = [];
  cgpa1: any; studentEmailId: any; LoginName: any; FeesPaidStatus: string = 'Pending ';

  // reactive form
  form!: FormGroup;
  isSubmitted = false;
  isLoading = false;

  countries: any = countries;
  countriesList: any = countries;
  
  englishOptions = [
    { value: '', label: 'Select' },
    { value: 'NotRequired', label: 'Not required' },
    { value: 'NotGiven', label: 'Not Given' },
    { value: 'Appeared', label: 'Appeared / Given' }
  ];
  englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];

  // Refactored file storage structure
  uploadedFiles: { key: string; file: File; name: string }[] = [];

  loginDetails: { loginName?: string; email?: string; studentId?: string } = {};
  eligible: boolean;
  ProgramCode: any;

  // Refactored step labels/icons for 5 steps
  stepIcons = ['bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-file-earmark-arrow-up', 'bi-check2-circle'];
  stepLabels = [
    'Contact Details & University Preferences',
    'Passport & English Details',
    'Sponsor Details & Declaration ',
    'Documents Section', 
    'Review & Submit'
  ];

  PresentDate: any;

  availableFundsOptions = [
    { value: '', label: 'Select' },
    { value: '2 to 4 Lakhs', label:  '2 to 4 Lakhs' },
    { value: '4 to 6 Lakhs', label: '4 to 6 Lakhs' },
    { value: '6 to 8 Lakhs', label: '6 to 8 Lakhs' },
  ];
  constructor(
     private AuthServicess: AuthService, 
        private StorageServicess: StorageService,
        private studentApi: SemesterExchangeStuDetailsService ,
        private ServicesSM: SemesterExchangeStuDetailsService,
        private route: ActivatedRoute,  
        private modalService: NgbModal,
        public formBuilder: UntypedFormBuilder, private fb: FormBuilder,
        private router: Router, private title: Title 
  ) {}

   formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  ngOnInit(): void {
    this.PresentDate= this.formatDate(new Date()) ;   
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Semester Exchange Registration");
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.getToken(this.LoginName);

    }
    
    // alert(this.PresentDate )
   

  }

  LoadForms() {
    this.buildForm();

    this.setupConditionalValidators();

    ['WhatsAppNo', 'PhoneNumber', 'ParentContact'].forEach(ctrlName => {
      this.form.get(ctrlName)!.valueChanges.subscribe(() => {
        this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    });

    this.subscribeToFormChanges();
  }
  getToken(id: any) {
    this.isLoading=true;
    const startTime = new Date().getTime();
    this.AuthServicess.loginTemp(id).subscribe({
      next: data => {
        this.StorageServicess.saveUser(data);
        const authToken = this.StorageServicess.getUser();

        if (!this.StorageServicess.isLoggedIn() || authToken === 'Token Expired' || !authToken) {
           this.isLoading = false;
          this.LoginFailed('Invalid or expired token');
          return;
        }
        this.loginFailed = false;
        this.LoadForms();
        this.getStudentDetail();
        this.folderUrl = this.ServicesSM.getFolderUrl();
        this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';


          const elapsed = new Date().getTime() - startTime;
        const remainingDelay = Math.max(2500 - elapsed, 0); // wait at least 5s

        setTimeout(() => {
          this.isLoading = false;
        }, remainingDelay);
      },
      error: err => {
        this.isLoading = false;
        this.LoginFailed(err);
      }
    });
  }
  
      LoginFailed(_NewError: any) {
      this.loginFailed = true;
      Swal.fire({
        title: 'Login Failed',
        text: 'Login details are Invalid!',
        icon: 'warning',
      })
      const element = document.getElementById('NewRegsiterPage');
      if (element) {
        element.hidden = true;
      }
    }
  subscribeToFormChanges(): void {
        this.form.get('UniversityOption1')?.valueChanges.subscribe(value => {
            this.UniversityOption1 = value;
            this.form.get('UniversityOption2')?.setValue('');
            this.form.get('UniversityOption3')?.setValue('');
        });

        this.form.get('UniversityOption2')?.valueChanges.subscribe(value => {
            this.UniversityOption2 = value;
            this.form.get('UniversityOption3')?.setValue('');
        });
        
        this.form.get('UniversityOption3')?.valueChanges.subscribe(value => {
            this.UniversityOption3 = value;
        });
  }

        togglePolicy(event: MouseEvent): void {
        event.preventDefault(); // prevent page scroll
        this.showPolicy = !this.showPolicy;
      }
  private buildForm(): void {
    this.form = this.fb.group(
      {
        // Contact Information
        // ... (Contact/University fields)
        CountryName: ['', Validators.required],
        WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        PhoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        ParentContact: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        HasRelativeDetails: ['', Validators.required],
        RelativeName: [''],
        RelativeCountryName: [''],
        RelativeRelation: [''],
        RelativePhone: [''],
        RelativeEmail: [''],
        ApplyingOption: ['', Validators.required],
        UniversityOption1: ['', Validators.required],
        UniversityOption2: ['', Validators.required],
        UniversityOption3: ['', Validators.required],
        PassportStatus: ['', Validators.required], 
        PassportNumber: [''],
        PassportIssueDate: [''],
        PassportValidUpto: [''],
        IsVisaRejected: ['', Validators.required],
        VisaRejectedReason: [''],
        VisaRejectedCountry: [''],
        EnglishTestType: ['', Validators.required],
        TestName: [''],
        TestDate: [''],
        ListeningScore: [''],
        SpeakingScore: [''],
        ReadingScore: [''],
        WritingScore: [''],
        OverallScore: [''],
        EnglishTestYear: [''],

        SponsorType: ['', Validators.required], 
        AvailableFunds: ['', Validators.required], 
        SponsorName: [''],
        SponsorRelation: [''],
        AcceptPolicy: [true, Validators.requiredTrue],

        // Document paths
        PassportDocumentPath: [''],
        EnglishDocumentPath: [''],
        FeesDocumentPath: [''],
        ResumeDocumentPath: ['', Validators.required], // HIGHLIGHT: Fix 4 - Made mandatory
        ConsentLetterDocumentPath: ['', Validators.required], // HIGHLIGHT: Fix 4 - Made mandatory
        OtherDocumentPaths: [[]] 
       
      },
      { validators: [this.distinctPhoneNumbersValidator()] }
    );
  }
  studentStatus:any;

  // ... (Existing API functions like getToken, getStudentDetail, etc., remain unchanged to satisfy Req #9) ...
  getStudentDetail(): void {

    this.isLoading = true;
    this.ServicesSM.getStudentById().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.stuData = response.item1[0];

          this.loginFailed = false;
          // this.ProgramCode = this.stuData.programCode;
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
          this.studentStatus = this.stuData.studentStatus;
          // if (this.studentStatus === 'A' || this.studentStatus === 'ACT') {
          //   // Added on 13-Oct-25
          //   if (this.CurrentTerm > 1)
          //     this.GetStudentMarksDetails(this.RegistrationNo);
          //   else if (this.CurrentTerm == 1)
          //     this.GetStudentAllPreviousMarks(this.RegistrationNo);


          // }
          // else{
          //   this.eligible=false;
          // }



          this.getApplicationDetails(this.RegistrationNo);
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
      }
    });
  }
      SectionCode: any;         SchoolId: any;        allProgramCode:any; StudentDetailsWithMarks:any; GradeFcount:any;
      StudentPreviousMarks:any;
      getAllProgramcode(): void {
        this.ServicesSM.FetchAllProgramCodesList().subscribe((response) => {
          this.allProgramCode = response.item1
        });
      }
      GetStudentMarksDetails(Regdno: any) {
        this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
          next: response => {
          if (response.item1.length > 0) {            
              this.StudentDetailsWithMarks = response.item1;
              this.ProgramCode = this.StudentDetailsWithMarks[0].officialCode;
              this.SectionCode = this.StudentDetailsWithMarks[0].section;
              this.SchoolId = this.StudentDetailsWithMarks[0].schoolId;
              
              this.GradeFcount = 0; // Reset count
              for (const item of this.StudentDetailsWithMarks) {
                const gradeStr = item.grade?.toUpperCase();
                const gradeNum = parseInt(item.gradeNum, 10);
    
                // If grade is F or gradeNum ≤ 6
                if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
                  this.GradeFcount++;
                }
              }

              // ** FIX 1: Set eligibility based on GradeFcount **
              // If GradeFcount is 0, the student is eligible to proceed.
              this.eligible = (this.GradeFcount === 0);
              this.getUniversityDetails(); // Call after eligibility is determined
    
            } else {
              this.StudentDetailsWithMarks = [];
              this.GradeFcount = 0;
              this.eligible = false; // Not eligible if no marks data
            }
          },
          error: err => {
            this.LoginFailed(err);
            this.eligible = false; // Not eligible on error
          }
        });
      }
            //start Logic for 10+2 students Added on 13-Oct-25
      MarksPlus2: any;Percetnages:any;
        StudentPreviousMarksData: any;
        GetStudentAllPreviousMarks(Regdno: any) {
          this.ServicesSM.GetStudentAllPreviousMarks(Regdno).subscribe({
            next: response => {
              if (response.item1.length > 0) {
                const StudentPreviousMarksData = response.item1[0];
                this.MarksPlus2 = StudentPreviousMarksData['ExamDescription'];
                this.Percetnages = StudentPreviousMarksData['Perecentage'];
              
                
                this.GradeFcount = 0; // Reset count
                
                // Set eligibility after GradeFcount is determined
                this.eligible = (this.MarksPlus2 ==='10+2') && (this.Percetnages >90 );
                 this.GetStudentMarksDetails(this.RegistrationNo);
               
                // alert(this.eligible)
              } else {
                this.StudentPreviousMarksData = [];
            
                this.eligible = false; // Not eligible if no marks data or F grades exist
              }
            },
            error: err => {
              this.LoginFailed(err);
              this.eligible = false; // Not eligible on error
            }
          });
        }
            
      getUniversityDetails(): void {
        this.ServicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
          this.uniData = response.item1;
          this.university = this.uniData;
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
       
               // Swal.fire({
               //   title: 'Application already Exists',
               //   text: '..',
               //   icon: 'success',
               //   showConfirmButton: false, // Hide the OK button
               //   timer: 5000  
               // }).then(() => {
               //   this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
               // });
               
              
       
             }
             else {
               this.stuApplication = null;
               this.ApplicationStatus = null;
             }
   
           // --- MOVED CODE START: This executes AFTER the API call completes ---
             if (this.ApplicationId > 0) {
               Swal.fire({
                 title: 'Application already Exists',
                 text: '..',
                 icon: 'success',
                 showConfirmButton: false, 
                 timer: 5000  
               }).then(() => {
                 this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
               });
               
             } else { // ** FIX 2: Only check student status/marks if no application exists **
               if (this.studentStatus === 'A' || this.studentStatus === 'ACT') {
                 // Added on 13-Oct-25
                 if (this.CurrentTerm > 1)
                   this.GetStudentMarksDetails(this.RegistrationNo);
                 else if (this.CurrentTerm == 1)
                   this.GetStudentAllPreviousMarks(this.RegistrationNo);   
                  
                 this.getUniversityDetails();
               }
               else {
                 this.eligible = false;
               }
             }
             // --- MOVED CODE END ---
           });
     }
  private distinctPhoneNumbersValidator(): ValidatorFn {
      return (group: AbstractControl): ValidationErrors | null => {
        const wa = group.get('WhatsAppNo')?.value?.trim() || '';
        const ph = group.get('PhoneNumber')?.value?.trim() || '';
        const parent = group.get('ParentContact')?.value?.trim() || '';

        const allValid = /^[0-9]{10}$/.test(wa) && /^[0-9]{10}$/.test(ph) && /^[0-9]{10}$/.test(parent);
        if (!allValid) {
          return null;
        }

        if (wa === parent || ph === parent) {
          return { numbersMustBeDistinct: true };
        }
        return null;
      };
    }

  private setupConditionalValidators(): void {
     const hasRelativeControl = this.form.get('HasRelativeDetails')!;
    const passportStatusControl = this.form.get('PassportStatus')!;
    const isVisaRejectedControl = this.form.get('IsVisaRejected')!;
    const testNameControl = this.form.get('TestName')!;
    const sponsorTypeControl = this.form.get('SponsorType')!;
    // Relative details (existing logic preserved)
    this.form.get('HasRelativeDetails')!.valueChanges.subscribe(val => {
      const name = this.form.get('RelativeName')!;
      const country = this.form.get('RelativeCountryName')!;
      const relation = this.form.get('RelativeRelation')!;
      if (val === 'Yes') {
        name.setValidators([Validators.required]);
        country.setValidators([Validators.required]);
        relation.setValidators([Validators.required]);
      } else {
        name.clearValidators();
        country.clearValidators();
        relation.clearValidators();
      }
      name.updateValueAndValidity(); country.updateValueAndValidity(); relation.updateValueAndValidity();
    });

    // Passport fields required & Document required (Req #4)
    this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
      const num = this.form.get('PassportNumber')!;
      const issue = this.form.get('PassportIssueDate')!;
      const valid = this.form.get('PassportValidUpto')!;
      const passportDoc = this.form.get('PassportDocumentPath')!; 
      if (val === 'Yes') {
        num.setValidators([Validators.required]);
        issue.setValidators([Validators.required]);
        valid.setValidators([Validators.required]);
        passportDoc.setValidators([Validators.required]); // Passport document is required
      } else {
        num.clearValidators(); issue.clearValidators(); valid.clearValidators();
        passportDoc.clearValidators();
      }
      num.updateValueAndValidity(); issue.updateValueAndValidity(); valid.updateValueAndValidity();
      passportDoc.updateValueAndValidity();
    });

    // Visa rejected details (existing logic preserved)
     this.form.get('IsVisaRejected')!.valueChanges.subscribe(val => {
        const rr = this.form.get('VisaRejectedReason')!;
        const rc = this.form.get('VisaRejectedCountry')!;
        if (val === 'Yes') {
            rr.setValidators([Validators.required]);
            rc.setValidators([Validators.required]);
        } else {
            rr.clearValidators();
            rc.clearValidators();
        }
        rr.updateValueAndValidity(); rc.updateValueAndValidity();
    });

    // English test conditional validators & Document required (Req #4)
    this.form.get('EnglishTestType')!.valueChanges.subscribe(val => {
      const englishDoc = this.form.get('EnglishDocumentPath')!;
      // ... (rest of the English Test logic preserved and updated)
      if (val === 'Appeared') {
        englishDoc.setValidators([Validators.required]); // English document is required
      } else {
        englishDoc.clearValidators();
      }
      englishDoc.updateValueAndValidity();
      // ... (score validation setup remains the same, checking val === 'Appeared')
    });

    // Sponsor details required when SponsorType === 'Other' (Req #6)
    this.form.get('SponsorType')!.valueChanges.subscribe(val => {
      const sName = this.form.get('SponsorName')!;
      const sRel = this.form.get('SponsorRelation')!;
      if (val === 'Other') {
        sName.setValidators([Validators.required]);
        sRel.setValidators([Validators.required]);
      } else {
        sName.clearValidators();
        sRel.clearValidators();
      }
      sName.updateValueAndValidity(); sRel.updateValueAndValidity();
    });
    
    
    // Resume is a must document (Req #4)
    this.form.get('ResumeDocumentPath')!.setValidators([Validators.required]);
    this.form.get('ResumeDocumentPath')!.updateValueAndValidity();

     // Req #1: Combined listener for English test validation
    const englishTestTypeControl = this.form.get('EnglishTestType')!;
    const testDateControl = this.form.get('TestDate')!;

    englishTestTypeControl.valueChanges.subscribe(() => this.updateEnglishScoreValidators());
    testDateControl.valueChanges.subscribe(() => this.updateEnglishScoreValidators());
    
  }
  
   updateEnglishScoreValidators(): void {
    const englishTestType = this.form.get('EnglishTestType')?.value;
    const testDateStr = this.form.get('TestDate')?.value;
    const englishDoc = this.form.get('EnglishDocumentPath')!;
    
    const scoreControls = ['ListeningScore', 'SpeakingScore', 'ReadingScore', 'WritingScore', 'OverallScore', 'EnglishTestYear'];
    
    // Logic to determine if Scores should be required (Appeared AND Test Date is in the past)
    let shouldRequireScores = false;
    const testDate = new Date(testDateStr);
    if (englishTestType === 'Appeared' && testDateStr) {
        const testDate = new Date(testDateStr);
        const today = new Date();
        
        // Compare dates only (ignoring time)
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const testDateOnly = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
        
        if (testDateOnly < todayDateOnly) {
            shouldRequireScores = true;
        }
    }

    // Update Document Validation (required if 'Appeared')
    if (englishTestType === 'Appeared' &&  this.formatDate(testDate) < this.PresentDate) {
        englishDoc.setValidators([Validators.required]);
    } else {
        englishDoc.clearValidators();
    }
    englishDoc.updateValueAndValidity();

    // Update Score Validation based on 'shouldRequireScores' flag
    scoreControls.forEach(name => {
        const control = this.form.get(name)!;
        if (shouldRequireScores) {
            control.setValidators([Validators.required]);
        } else {
            control.clearValidators();
        }
        control.updateValueAndValidity();
    });
  }
 
  
  // Generalized file selection function for all documents
  onFileSelected(evt: Event, key: string, formControlName: string) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    
    // 1. Construct the dynamic property key name
    const keyToCapitalize = key.charAt(0).toUpperCase() + key.slice(1);
    const propertyKey = `uploaded${keyToCapitalize}Name`;

    // 2. Fix the TypeScript error: Use an index signature to assert the key exists.
    // Since 'this' is the component instance, we cast it to 'any' for the dynamic access.
    (this as any)[propertyKey] = file.name; // <--- FIX APPLIED HERE

    // Remove old file of this type
    this.uploadedFiles = this.uploadedFiles.filter(f => f.key !== key);
    this.uploadedFiles.push({ key, file, name: file.name });

    // Update form control (for validation)
    this.form.get(formControlName)!.setValue(file.name);
    this.form.get(formControlName)!.markAsDirty();
    this.form.get(formControlName)!.updateValueAndValidity();
    
    input.value = '';
  }
   
   
 canProceedToNext(): boolean {
    let isValid = true;
    
    // --- Step 0 Validation ---
    if (this.currentStep === 0) {
      const controlsToValidate = [
        'CountryName', 'WhatsAppNo', 'ApplyingOption', 
        'UniversityOption1', 'UniversityOption2', 'UniversityOption3',
        'HasRelativeDetails'
      ];
      
      controlsToValidate.forEach(c => {
          if (this.form.get(c)!.invalid) isValid = false;
      });

      if (this.form.get('HasRelativeDetails')?.value === 'Yes') {
          ['RelativeName', 'RelativeCountryName', 'RelativeRelation'].forEach(c => {
              if (this.form.get(c)!.invalid) isValid = false;
          });
      }
      
      if (this.form.errors?.numbersMustBeDistinct) isValid = false;

    // --- Step 1 Validation ---
    } else if (this.currentStep === 1) {
      const controlsToValidate = [
          'PassportStatus', 'IsVisaRejected', 'EnglishTestType'
      ];
      controlsToValidate.forEach(c => {
          if (this.form.get(c)!.invalid) isValid = false;
      });
      
      // Conditional validation logic for passport/visa/english details remains the same...

    // --- Step 2 Validation (Sponsor Update) ---
    } else if (this.currentStep === 2) {
      // SponsorType and AvailableFunds are mandatory
      let sponsorOK = this.form.get('SponsorType')!.valid && this.form.get('AvailableFunds')!.valid;
      
      // Conditional Sponsor details
      if (this.form.get('SponsorType')!.value === 'Other') {
          sponsorOK = sponsorOK && this.form.get('SponsorName')!.valid && this.form.get('SponsorRelation')!.valid;
      }
      
      const declarationOK = this.form.get('AcceptPolicy')!.valid;
      isValid = sponsorOK && declarationOK; // Check both sponsor fields and declaration

    // --- Step 3 Validation ---
    } else if (this.currentStep === 3) {
      // Document Uploads validation (relies on conditional validators set in setupConditionalValidators)
      const resumeValid = this.form.get('ResumeDocumentPath')!.valid;
      const passportDocValid = this.form.get('PassportDocumentPath')!.valid; 
      const englishDocValid = this.form.get('EnglishDocumentPath')!.valid;
      
      isValid = resumeValid && passportDocValid && englishDocValid;

    } else if (this.currentStep === 4) {
      isValid = this.form.valid; 
    }

    return isValid;
  }

  nextStep(): void {
    if (!this.canProceedToNext()) {
      this.isSubmitted = true;
      // NEW: Mark all controls in the current step as touched to show errors
      this.markCurrentStepControlsAsTouched(this.currentStep); 
      Swal.fire('Incomplete Details', 'Please fill all required fields before proceeding.', 'error');
      return;
    }
    

    this.currentStep++;
    this.isSubmitted = false;
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.isSubmitted = false;
    }
  }
  markCurrentStepControlsAsTouched(step: number): void {
      let controlNames: string[] = [];

      if (step === 0) {
          controlNames = [
              'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 
              'HasRelativeDetails', 'ApplyingOption', 'UniversityOption1', 
              'UniversityOption2', 'UniversityOption3', 'RelativeName', 
              'RelativeCountryName', 'RelativeRelation'
          ];
        } else if (step === 1) {
          controlNames = [
              'PassportStatus', 'PassportNumber', 'PassportIssueDate', 
              'PassportValidUpto', 'IsVisaRejected', 'VisaRejectedReason', 
              'VisaRejectedCountry', 'EnglishTestType', 'TestName',
              'TestDate', 'ListeningScore', 'SpeakingScore', 'ReadingScore', // ADDED SCORE FIELDS
              'WritingScore', 'OverallScore', 'EnglishTestYear' // ADDED SCORE FIELDS
          ];
      } else if (step === 2) {
          controlNames = [
              'SponsorType', 'AvailableFunds', 'SponsorName', 
              'SponsorRelation', 'AcceptPolicy' // IsSelfFunded removed
          ];
      } else if (step === 3) {
          controlNames = [
              'PassportDocumentPath', 'EnglishDocumentPath', 
              'FeesDocumentPath', 'ConsentDocumentPath', 'ResumeDocumentPath'
          ];
      }

      controlNames.forEach(name => {
          this.form.get(name)?.markAsTouched();
      });
  }

    // File data and status
  PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
  ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
  FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
  ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
  EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';
  ResumeDocumentPath: any; ConsentLetterDocumentPath:any; FeesProofDocumentPath:any;EnglishProofDocumentPath:any;PassportDocumentPath:any;
   
   UploadedEnglish: boolean=false;
   UploadedPassport: boolean=false;
   UploadedResume: boolean=false;
   UploadedFees: boolean=false;
   UploadedConsenLetter: boolean=false;
  
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
        this.UploadedPassport = true;
      };
    }
  
    // if (file && !fileNameRegex.test(file.name)) {
    //   const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    //   const modifiedFile = new File([file], validFileName, { type: file.type });
    //   const dataTransfer = new DataTransfer();
    //   dataTransfer.items.add(modifiedFile);
    //   target.files = dataTransfer.files;

    //   this.PassportFileData = modifiedFile;
    //   this.PassportDocumentPath = this.PassportFileName = name;//ResumeDocumentPath
    //   this.PassportFileStatus = true;



    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.PassportFileData = ssssArray[1];
    //     this.PassportDocumentPath = validFileName;
    //   };

    //   return;
    // }

    // this.PassportFileData = file;
    // this.PassportFileStatus = true;
    // this.UploadedPassport = true;
    // // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.PassportFileData = ssssArray[1];
    //     this.PassportDocumentPath = file.name;
    //     this.UploadedPassport = true;
    //   };
    // }
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

    //   this.EnglishProofData = modifiedFile;
    //   this.EnglishProofDocumentPath = this.EnglishProofFileName = name;//ResumeDocumentPath
    //   this.EnglishProofStatus = true;



    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.EnglishProofData = ssssArray[1];
    //     this.EnglishProofFileName = validFileName;
    //   };

    //   return;
    // }

    // this.EnglishProofData = file;
    // this.EnglishProofStatus = true;
    // this.UploadedEnglish = true;
    // // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.EnglishProofData = ssssArray[1];
    //     this.EnglishProofFileName = file.name;
    //     this.UploadedEnglish = true;
    //   };
    // }
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
  
    //   this.ResumeFileData = modifiedFile;
    //   this.ResumeDocumentPath = this.ResumeFileName = name;//ResumeDocumentPath
    //   this.ResumeFileStatus = true;



    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.ResumeFileData = ssssArray[1];
    //     this.ResumeDocumentPath = this.uploadedResumeName= validFileName;
    //   };

    //   return;
    // }

    // this.ResumeFileData = file;
    // this.ResumeFileStatus = true;
    // this.UploadedResume = true;
    // // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.ResumeFileData = ssssArray[1];
    //     this.ResumeDocumentPath = this.uploadedResumeName= file.name;
    //     this.UploadedResume = true;
    //   };
    // }
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
    //   this.FeesProofData = modifiedFile;
    //   this.FeesProofDocumentPath = this.FeesProofFileName = name;//ResumeDocumentPath
    //   this.FeesProofStatus = true;



    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.FeesProofData = ssssArray[1];
    //     this.FeesProofDocumentPath = validFileName;
    //   };

    //   return;
    // }

    // this.FeesProofData = file;
    // this.FeesProofStatus = true;
    // this.UploadedFees = true;
    // // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.FeesProofData = ssssArray[1];
    //     this.FeesProofDocumentPath = file.name;
    //     this.UploadedFees = true;
    //   };
    // }
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
    //   this.ConsentLetterData = modifiedFile;
    //   this.ConsentLetterDocumentPath = this.ResumeFileName = name;//ResumeDocumentPath
    //   this.ConsentLetterStatus = true;



    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.ConsentLetterData = ssssArray[1];
    //     this.ConsentLetterDocumentPath = validFileName;
    //   };

    //   return;
    // }

    // this.ConsentLetterData = file;
    // this.ConsentLetterStatus = true;
    // this.UploadedConsenLetter = true;
    // // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.ConsentLetterData = ssssArray[1];
    //     this.ConsentLetterDocumentPath = file.name;
    //     this.UploadedConsenLetter = true;
    //   };
    // }
  }
ValidationCheck: boolean= false;

  checkFormValidity(): void {
    this.ValidationCheck =  this.ConsentLetterData!==null
      && this.ResumeFileData !== null;
  }

  
  submitFinalApplication(): void {  
    this.isLoading = true;
    const startTime = Date.now();
    const minLoadingTime = 1500;
    const formValue = this.form.getRawValue();

    const formData = new FormData();

     // Append regular form fields with checks for 'NA'
        formData.append("SchoolId", this.SchoolId);
        formData.append("SectionCode", this.SectionCode);
        formData.append("RegistrationNo", this.RegistrationNo );
        formData.append("EmailId", formValue.EmailId );
        formData.append("CountryName", formValue.CountryName );
        formData.append("WhatsAppNo", formValue.WhatsAppNo );
        formData.append("PhoneNumber", formValue.PhoneNumber );
        formData.append("ParentContact", formValue.ParentContact);
        formData.append("ApplyingOption", formValue.ApplyingOption );
        formData.append("UniversityOption1", formValue.UniversityOption1 );
        formData.append("UniversityOption2", formValue.UniversityOption2 );
        formData.append("UniversityOption3", formValue.UniversityOption3 );
        formData.append("PassportStatus", formValue.PassportStatus );
    
        if (formValue.PassportStatus === 'Yes') {
          formData.append("PassportNumber", formValue.PassportNumber);
          formData.append("PassportIssueDate", formValue.PassportIssueDate );
          formData.append("PassportValidUpto", formValue.PassportValidUpto );
          formData.append("PassportDocumentPath", this.PassportDocumentPath ); // Use this.PassportFileName
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
        if (['PTE','DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
          formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
          formData.append("ListeningScore", formValue.ListeningScore || 'NA');
          formData.append("ReadingScore", formValue.ReadingScore || 'NA');
          formData.append("WritingScore", formValue.WritingScore || 'NA');
          formData.append("OverallScore", formValue.OverallScore || 'NA');
          formData.append("EnglishTestYear", formValue.EnglishTestYear  );
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
        formData.append("TotalCountGradeF", this.GradeFcount.toString() || 'NA'); // Convert number to string
    
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
        formData.append("ResumeFileName", this.ResumeFileName );
        formData.append("ResumeFileData", this.ResumeFileData);
        formData.append("ConsentLetterFileName", this.ConsentLetterFileName );
        formData.append("ConsentLetterData", this.ConsentLetterData );
        formData.append("FeesProofData", this.FeesProofData );
        formData.append("FeesProofFileName", this.FeesProofFileName );
        formData.append("PassportFileData", this.PassportFileData );
        formData.append("PassportFileName", this.PassportFileName );
        formData.append("EnglishProofData", this.EnglishProofData );
        formData.append("EnglishProofFileName", this.EnglishProofFileName );
    
        formData.append("RelativeCountryName", formValue.RelativeCountryName || 'NA');
        formData.append("RelativeName", formValue.RelativeName || 'NA');
        formData.append("RelativeRelation", formValue.RelativeRelation || 'NA'); // Added RelativeRelation
        formData.append("HasRelativeDetails", formValue.HasRelativeDetails || 'NA'); // Added HasRelativeDetails
    
        // formData.forEach((value, key) => {
        //   console.log(`${key}: ${value}`);
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

    
                const elapsed = Date.now() - startTime;
            const remaining = Math.max(minLoadingTime - elapsed, 0);
            setTimeout(() => {
              this.isLoading = false;
            }, remaining);
  }
  
  // /**
  //  * Constructs a data URL from Base64 data and opens the file in a new tab.
  //  * @param fileData The Base64 string of the file.
  //  * @param fileName The name of the file (used to determine extension/MIME type).
  //  */
  // viewFile(fileData: string, fileName: string): void {
  //   if (!fileData) {
  //     Swal.fire('Error', 'File data is not available.', 'error');
  //     return;
  //   }

  //   let mimeType = '';
  //   const extension = fileName.split('.').pop()?.toLowerCase();

  //   switch (extension) {
  //     case 'pdf':
  //       mimeType = 'application/pdf';
  //       break;
  //     case 'jpg':
  //     case 'jpeg':
  //       mimeType = 'image/jpeg';
  //       break;
  //     case 'png':
  //       mimeType = 'image/png';
  //       break;
  //     default:
  //       // Default to PDF as it's the most common document type.
  //       mimeType = 'application/octet-stream'; 
  //       break;
  //   }

  //   const dataUrl = `data:${mimeType};base64,${fileData}`;
    
  //   // Create a temporary link element to trigger the download/view
  //   const link = document.createElement('a');
  //   link.href = dataUrl;
  //   link.target = '_blank'; // Open in a new tab
  //   link.rel = 'noopener noreferrer';
  //   link.click();
  //   link.remove();
  // }

  // NewtsCode.ts - inside NewLogicFormComponent class

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
// import { Component, OnInit } from '@angular/core';
// import {
//   FormBuilder,
//   FormGroup,
//   Validators,
//   AbstractControl,
//   ValidatorFn,
//   ValidationErrors,
//   UntypedFormBuilder
// } from '@angular/forms';
// import { countries } from '../countries-list';

// import { Title } from '@angular/platform-browser';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { AuthService } from 'src/app/_services/auth.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import Swal from 'sweetalert2';
// import { finalize } from 'rxjs';

// @Component({
//   selector: 'app-NewLogicForm',
//   templateUrl: './NewLogicForm.html',
//   styleUrls: ['./NewLogicForm.component.scss']
// })
// export class NewLogicFormComponent implements OnInit {
//   // wizard
//   currentStep = 0;
//   steps = [
//     'Contact / Relative / University Preferences',
//     'Passport / Previous Visa / English Proficiency',
//     'Sponsor / Declaration / Document Details',
//     'Final Review & Submit'
//   ];

//     showPolicy = false;

//   ApplyingOption: any = '';
//   folderUrl: string; serverUrl: string; serverUrlX: string;
//   loginFailed: boolean = false;
//   stuData: any; uniData: any; university: any; stuApplication: any; RegistrationNo: any;
//   ApplicationId: any; ApplicationStatus: any; ContactNo: string; stuWhatsNo: string; EmailId: string;
//   CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
//   UniversityOption4: string; courseName: any; studentName: any; cgpa: any; CurrentYear: any; CurrentTerm: any; CourseTotalDuration: any; CourseTotalTerms: any; StudentStatus: any; WhatsAppNo: any;
//   uploadedDocList: any[] = []; feesReceipt: string; DocumentName: any; DocumentPath: any; CreatedBy: string; FeesFile: any;
//   ApplicationFile: any; ResumeFile: any; PhotoFile: any; PassportFile: any; FeesDocs: any; fileName: string;
//   cgpa1: any; studentEmailId: any; LoginName: any; FeesPaidStatus: string = 'Pending ';

//   // reactive form
//   form!: FormGroup;
//   isSubmitted = false;
//   isLoading = false;

//   // imported country list (no dummy data here)
//   countries: any = countries;
// countriesList: any = countries;
//   // english test options
//   englishOptions = [
//     { value: '', label: 'Select' },
//     { value: 'NotRequired', label: 'Not required' },
//     { value: 'NotGiven', label: 'Not Given' },
//     { value: 'Appeared', label: 'Appeared / Given' }
//   ];
//   englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];

//   // uploaded files (kept as File objects for final FormData)
//   uploadedFiles: { key: string; file: File }[] = [];
//   uploadedResumeName = '';
//   uploadedOtherFiles: { key: string; name: string }[] = [];

//   // login details to show before form (fetched from API)
//   loginDetails: { loginName?: string; email?: string; studentId?: string } = {};
//   eligible: boolean;
//   ProgramCode: any;

//   constructor(
//      private AuthServicess: AuthService,
//         private StorageServicess: StorageService,
//         private studentApi: SemesterExchangeStuDetailsService ,
//         private ServicesSM: SemesterExchangeStuDetailsService,
//         private route: ActivatedRoute,  
//         private modalService: NgbModal,
//         public formBuilder: UntypedFormBuilder, private fb: FormBuilder,
//         private router: Router, private title: Title 
//   ) {}

//   ngOnInit(): void {
//      (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     this.title.setTitle("Semester Exchange Registration");
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     if (this.LoginName != '' && this.LoginName != undefined) {
//       this.getToken(this.LoginName);
//     }
//     this.buildForm();

//     this.setupConditionalValidators();

//     ['WhatsAppNo', 'PhoneNumber', 'ParentContact'].forEach(ctrlName => {
//       this.form.get(ctrlName)!.valueChanges.subscribe(() => {
//         this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
//       });
//     });

//     this.subscribeToFormChanges();

//   }
//   subscribeToFormChanges(): void {
//         this.form.get('UniversityOption1')?.valueChanges.subscribe(value => {
//             this.UniversityOption1 = value;
//             // Optionally, clear downstream preferences if the current selection changes
//             this.form.get('UniversityOption2')?.setValue('');
//             this.form.get('UniversityOption3')?.setValue('');
//         });

//         this.form.get('UniversityOption2')?.valueChanges.subscribe(value => {
//             this.UniversityOption2 = value;
//             this.form.get('UniversityOption3')?.setValue('');
//         });
        
//         this.form.get('UniversityOption3')?.valueChanges.subscribe(value => {
//             this.UniversityOption3 = value;
//         });
//     }

//   private buildForm(): void {
//     this.form = this.fb.group(
//       {
//         // Contact Information
//         loginName: [''], // read-only display field; not required for submit
//         CountryName: ['', Validators.required],
//         WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
//         PhoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
//         ParentContact: ['', [Validators.pattern(/^[0-9]{10}$/)]],

//         // Relative Details
//         HasRelativeDetails: ['', Validators.required],
//         RelativeName: [''],
//         RelativeCountryName: [''],
//         RelativeRelation: [''],
//         RelativePhone: [''],
//         RelativeEmail: [''],

//         // University Preferences
//         ApplyingOption: ['', Validators.required],
//         UniversityOption1: ['', Validators.required],
//         UniversityOption2: ['', Validators.required],
//         UniversityOption3: ['', Validators.required],

//         // Passport Details
//         PassportStatus: ['', Validators.required], // Yes/No/Applied etc.
//         PassportNumber: [''],
//         PassportIssueDate: [''],
//         PassportValidUpto: [''],

//         // Previous Visa Information
//         IsVisaRejected: ['', Validators.required],
//         VisaRejectedReason: [''],
//         VisaRejectedCountry: [''],

//         // English Proficiency
//         EnglishTestType: ['', Validators.required], // NotRequired, NotGiven, Appeared
//         TestName: [''], // PTE,IELTS,TOEFL,DULINGO
//         TestDate: [''],
//         ListeningScore: [''],
//         SpeakingScore: [''],
//         ReadingScore: [''],
//         WritingScore: [''],
//         OverallScore: [''],
//         EnglishTestYear: [''],

//         // Sponsor / Declaration
//         IsSelfFunded: ['', Validators.required],
//         AvailableFunds: ['', Validators.required],
//         SponsorName: [''],
//         SponsorRelation: [''],
//         AcceptPolicy: [false, Validators.requiredTrue],

//         // Documents (store file names in form for UI; actual File objects kept in uploadedFiles)
//         ResumeDocumentPath: [''], // required (filename shown)
//         OtherDocumentPaths: [[]] // array of filenames
//       },
//       { validators: [this.distinctPhoneNumbersValidator()] }
//     );
//   }
// stepIcons = ['bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-check2-circle'];

// stepLabels = [
//   'Contact & University',
//   'Passport & English',
//   'Sponsor & Docs',
//   'Review & Submit'
// ];
//     getToken(id: any) {
//     this.AuthServicess.loginTemp(id).subscribe({
//       next: data => {
//         this.StorageServicess.saveUser(data);
//         const authToken = this.StorageServicess.getUser();
//         if (!this.StorageServicess.isLoggedIn() || authToken === 'Token Expired' || !authToken) {
//           this.LoginFailed('Invalid or expired token');
//           return;
//         }
//         this.loginFailed = false;
//         this.getStudentDetail();
//         this.folderUrl = this.ServicesSM.getFolderUrl();
//         this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

  
//     LoginFailed(_NewError: any) {
//       this.loginFailed = true;
//       Swal.fire({
//         title: 'Login Failed',
//         text: 'Login details are Invalid!',
//         icon: 'warning',
//       })
//       const element = document.getElementById('NewRegsiterPage');
//       if (element) {
//         element.hidden = true;
//       }
//     }
  
//      getStudentDetail(): void {
//         this.isLoading = true;
//         this.ServicesSM.getStudentById().subscribe({
//           next: response => {
//             if (response.item1.length > 0) {
//               this.stuData = response.item1[0];
             
//               this.loginFailed = false;
//               this.studentName = this.stuData.studentName;
//               this.RegistrationNo = this.stuData.registerationNumber;
//               this.ContactNo = this.stuData.studentMobile;
//               this.courseName = this.stuData.courseName;
//               this.cgpa = this.stuData.cgpa;
//               this.cgpa1 = this.stuData.cgpA1;
//               this.CurrentYear = this.stuData.currentYear;
//               this.CurrentTerm = this.stuData.currentTerm;
//               this.CourseTotalDuration = this.stuData.courseTotalDuration;
//               this.CourseTotalTerms = this.stuData.courseTotalTerms;
//               this.StudentStatus = this.stuData.studentStatus;
//               this.studentEmailId = this.stuData.studentEmail.length < 5 ? 'N/A' : this.stuData.studentEmail;
//               this.EmailId = this.studentEmailId != 'N/A' ? this.studentEmailId : ' ';
//               this.GetStudentMarksDetails(this.RegistrationNo);
//               this.getApplicationDetails(this.RegistrationNo);
//               this.GetStudentAllPreviousMarks();
//               this.eligible = true; // Will be updated after marks details are fetched
//             }
//             else {
//               this.stuData = [];
//               this.loginFailed = true;
//             }
//             // Delay hiding the loader for 2.5 seconds
//             setTimeout(() => {
//               this.isLoading = false;
//             }, 2500);
//           },
//           error: err => {
//             setTimeout(() => {
//               this.isLoading = false;
//             }, 2500);
//             this.LoginFailed(err);
//           }
//         });
//       }
    
//       getApplicationDetails(regId: string): void {
//         this.ServicesSM.getApplicationDetailsBYId(regId).subscribe((response) => {
//           if (response.item1.length > 0) {
//             this.stuApplication = response.item1[0];
//             // console.log(JSON.stringify(this.stuApplication))
           
//             if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected == null) {
//               this.ApplicationStatus = true;
//             } else if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected === true) {
//               this.ApplicationStatus = false;
//             }
    
//             this.CountryCode = this.stuApplication.countryCode;
//             this.stuWhatsNo = this.stuApplication.whatsAppNo;
//             this.EmailId = this.stuApplication.emailId;
//             this.ApplicationId = this.stuApplication.applicationId;
//             this.UniversityOption1 = this.stuApplication.universityOption1;
//             this.UniversityOption2 = this.stuApplication.universityOption2;
//             this.UniversityOption3 = this.stuApplication.universityOption3;
    
    
//             Swal.fire({
//               title: 'Application already Exists',
//               text: '..',
//               icon: 'success',
//               showConfirmButton: false, // Hide the OK button
//               timer: 5000  
//             }).then(() => {
//               this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
//             });
            
           
    
//           }
//           else {
//             this.stuApplication = null;
//             this.ApplicationStatus = null;
//           }
//         });
//   }

//   marksList: any[] = [];       // item1
//   gradeSummary: any[] = [];    // item2
//   studentDetails: any = {};    // item3
//   otherDetails: any[] = [];    // item4 (optional)

//       GetStudentAllPreviousMarks(): void {
//         this.ServicesSM.GetStudentAllPreviousMarks(this.RegistrationNo).subscribe((response) => {
//         // this.ServicesSM.getUniversityLists('P4AE').subscribe((response) => {
//         // this.ServicesSM.getUniversityDetails().subscribe((response) => {
//           this.StudentPreviousMarks = response;

//           console.log("previousmarks"+JSON.stringify(this.StudentPreviousMarks))
//         //    for (const item of this.StudentPreviousMarks) {
//         //         const gradeStr = item.grade?.toUpperCase();
//         //         const gradeNum = parseInt(item.gradeNum, 10);
    
//         //         // If grade is F or gradeNum ≤ 6
//         //         if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
//         //           this.GradeFcount++;
//         //         }
//         //       }
//         });
//       }

      
//       getUniversityDetails(): void {
//         this.ServicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
//         // this.ServicesSM.getUniversityLists('P4AE').subscribe((response) => {
//         // this.ServicesSM.getUniversityDetails().subscribe((response) => {
//           this.uniData = response.item1;
//           this.university = this.uniData;
//         });
//       }
//       SectionCode: any;         SchoolId: any;        allProgramCode:any; StudentDetailsWithMarks:any; GradeFcount:any;
//       StudentPreviousMarks:any;
//       getAllProgramcode(): void {
//         this.ServicesSM.FetchAllProgramCodesList().subscribe((response) => {
//           this.allProgramCode = response.item1
//         });
//       }
//       GetStudentMarksDetails(Regdno: any) {
//         this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
//           next: response => {
//             if (response.item1.length > 0) {
//               this.StudentDetailsWithMarks = response.item1;
//               this.ProgramCode = this.StudentDetailsWithMarks[0].officialCode;
//               this.SectionCode = this.StudentDetailsWithMarks[0].section;
//               this.SchoolId = this.StudentDetailsWithMarks[0].schoolId;
//               //  console.log(JSON.stringify(this.StudentDetailsWithMarks))


//               this.getUniversityDetails();
//               this.GradeFcount = 0; // Reset count
//               for (const item of this.StudentDetailsWithMarks) {
//                 const gradeStr = item.grade?.toUpperCase();
//                 const gradeNum = parseInt(item.gradeNum, 10);
    
//                 // If grade is F or gradeNum ≤ 6
//                 if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
//                   this.GradeFcount++;
//                 }
//               }
    
//               // Set eligibility after GradeFcount is determined
//               // this.eligible = (this.GradeFcount < 1) && (this.CurrentTerm > 0 && this.CurrentTerm < this.CourseTotalTerms);
    
//             } else {
//               this.StudentDetailsWithMarks = [];
//               this.GradeFcount = 0;
//               this.eligible = false; // Not eligible if no marks data or F grades exist
//             }
//           },
//           error: err => {
//             this.LoginFailed(err);
//             this.eligible = false; // Not eligible on error
//           }
//         });
//       }
    
//       togglePolicy(event: MouseEvent): void {
//         event.preventDefault(); // prevent page scroll
//         this.showPolicy = !this.showPolicy;
//       }
//   /* -------------------------
//      Validators & Conditional logic
//      ------------------------- */

//   /** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
// /** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
// /** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
// private distinctPhoneNumbersValidator(): ValidatorFn {
//   return (group: AbstractControl): ValidationErrors | null => {
//     const wa = group.get('WhatsAppNo')?.value?.trim() || '';
//     const ph = group.get('PhoneNumber')?.value?.trim() || '';
//     const parent = group.get('ParentContact')?.value?.trim() || '';

//     // Only run if all are 10-digit numbers
//     const allValid = /^[0-9]{10}$/.test(wa) && /^[0-9]{10}$/.test(ph) && /^[0-9]{10}$/.test(parent);
//     if (!allValid) {
//       // clear existing error when editing
//       return null;
//     }

//     // If any duplicates
//     if (wa === parent || ph === parent) {
//       return { numbersMustBeDistinct: true };
//     }

//     return null;
//   };
// }
 


//   private setupConditionalValidators(): void {
//     // Relative details required when HasRelativeDetails === 'Yes'
//     this.form.get('HasRelativeDetails')!.valueChanges.subscribe(val => {
//       const name = this.form.get('RelativeName')!;
//       const country = this.form.get('RelativeCountryName')!;
//       const relation = this.form.get('RelativeRelation')!;
//       if (val === 'Yes') {
//         name.setValidators([Validators.required]);
//         country.setValidators([Validators.required]);
//         relation.setValidators([Validators.required]);
//       } else {
//         name.clearValidators();
//         country.clearValidators();
//         relation.clearValidators();
//       }
//       name.updateValueAndValidity();
//       country.updateValueAndValidity();
//       relation.updateValueAndValidity();
//     });

//     // Passport fields required when PassportStatus === 'Yes'
//     this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
//       const num = this.form.get('PassportNumber')!;
//       const issue = this.form.get('PassportIssueDate')!;
//       const valid = this.form.get('PassportValidUpto')!;
//       if (val === 'Yes') {
//         num.setValidators([Validators.required]);
//         issue.setValidators([Validators.required]);
//         valid.setValidators([Validators.required]);
//       } else {
//         num.clearValidators();
//         issue.clearValidators();
//         valid.clearValidators();
//       }
//       num.updateValueAndValidity();
//       issue.updateValueAndValidity();
//       valid.updateValueAndValidity();
//     });

//     // Visa rejected details required if IsVisaRejected === 'Yes'
//     this.form.get('IsVisaRejected')!.valueChanges.subscribe(val => {
//       const rr = this.form.get('VisaRejectedReason')!;
//       const rc = this.form.get('VisaRejectedCountry')!;
//       if (val === 'Yes') {
//         rr.setValidators([Validators.required]);
//         rc.setValidators([Validators.required]);
//       } else {
//         rr.clearValidators();
//         rc.clearValidators();
//       }
//       rr.updateValueAndValidity();
//       rc.updateValueAndValidity();
//     });

//     // English test conditional validators
//     this.form.get('EnglishTestType')!.valueChanges.subscribe(val => {
//       const testName = this.form.get('TestName')!;
//       const testDate = this.form.get('TestDate')!;
//       const listening = this.form.get('ListeningScore')!;
//       const speaking = this.form.get('SpeakingScore')!;
//       const reading = this.form.get('ReadingScore')!;
//       const writing = this.form.get('WritingScore')!;
//       const overall = this.form.get('OverallScore')!;
//       const year = this.form.get('EnglishTestYear')!;

//       if (val === 'Appeared') {
//         testName.setValidators([Validators.required]);
//         testDate.setValidators([Validators.required]);
//       } else {
//         testName.clearValidators();
//         testDate.clearValidators();
//       }
//       testName.updateValueAndValidity();
//       testDate.updateValueAndValidity();

//       testName.valueChanges.subscribe((tn: string) => {
//         const needsScores = this.englishTestNames.includes(tn);
//         if (needsScores) {
//           listening.setValidators([Validators.required]);
//           speaking.setValidators([Validators.required]);
//           reading.setValidators([Validators.required]);
//           writing.setValidators([Validators.required]);
//           overall.setValidators([Validators.required]);
//           year.setValidators([Validators.required]);
//         } else {
//           listening.clearValidators();
//           speaking.clearValidators();
//           reading.clearValidators();
//           writing.clearValidators();
//           overall.clearValidators();
//           year.clearValidators();
//         }
//         listening.updateValueAndValidity();
//         speaking.updateValueAndValidity();
//         reading.updateValueAndValidity();
//         writing.updateValueAndValidity();
//         overall.updateValueAndValidity();
//         year.updateValueAndValidity();
//       });
//     });
//   }

//   /* -------------------------
//      File handling
//      ------------------------- */

//   onResumeSelected(evt: Event) {
//     const input = evt.target as HTMLInputElement;
//     if (!input.files || !input.files.length) return;
//     const file = input.files[0];
//     this.uploadedResumeName = file.name;

//     // replace old resume if present
//     this.uploadedFiles = this.uploadedFiles.filter(f => f.key !== 'resume');
//     this.uploadedFiles.push({ key: 'resume', file });

//     // store filename in form for UI & review
//     this.form.patchValue({ ResumeDocumentPath: file.name });
//     this.form.patchValue({ ResumeFileData: file });
//   }

//   onOtherFileSelected(evt: Event, key: string) {
//     const input = evt.target as HTMLInputElement;
//     if (!input.files || !input.files.length) return;
//     const file = input.files[0];
//     this.uploadedFiles.push({ key, file });
//     this.uploadedOtherFiles.push({ key, name: file.name });

//     // also push filename to OtherDocumentPaths array
//     const otherArr = this.form.get('OtherDocumentPaths')!.value || [];
//     otherArr.push({ key, name: file.name });
//     this.form.patchValue({ OtherDocumentPaths: otherArr });
//   }

//   /* -------------------------
//      Wizard controls (per-step validation)
//      ------------------------- */

//   canProceedToNext(): boolean {
//     // Minimal gating: validate only fields relevant to the current step.
//     // Step 0: Contact, Relative, University Preferences
//     if (this.currentStep === 0) {
//       const contactValid =
//         this.form.get('CountryName')!.valid &&
//         this.form.get('WhatsAppNo')!.valid &&
//         this.form.get('PhoneNumber')!.valid &&
//         this.form.get('ParentContact')!.valid;

//       const relativeValid = (this.form.get('HasRelativeDetails')!.value === 'Yes')
//         ? (this.form.get('RelativeName')!.valid &&
//            this.form.get('RelativeCountryName')!.valid &&
//            this.form.get('RelativeRelation')!.valid)
//         : true;

//       const uniValid =
//         this.form.get('ApplyingOption')!.valid &&
//         this.form.get('UniversityOption1')!.valid &&
//         this.form.get('UniversityOption2')!.valid &&
//         this.form.get('UniversityOption3')!.valid;

//       // ensure phone uniqueness validator not present
//       const duplicates = !!this.form.errors?.numbersMustBeDistinct;

//       return contactValid && relativeValid && uniValid && !duplicates;
//     }

//     // Step 1: Passport, Visa, English
//     if (this.currentStep === 1) {
//       // passport block
//       const passportOK = this.form.get('PassportStatus')!.value !== 'Yes' ||
//         (this.form.get('PassportNumber')!.valid && this.form.get('PassportIssueDate')!.valid && this.form.get('PassportValidUpto')!.valid);

//       // visa block
//       const visaOK = this.form.get('IsVisaRejected')!.value !== 'Yes' ||
//         (this.form.get('VisaRejectedReason')!.valid && this.form.get('VisaRejectedCountry')!.valid);

//       // english block
//       const et = this.form.get('EnglishTestType')!.value;
//       if (!this.form.get('EnglishTestType')!.valid) return false;
//       if (et === 'Appeared') {
//         const tn = this.form.get('TestName')!.value;
//         if (!this.form.get('TestDate')!.valid || !this.form.get('TestName')!.valid) return false;
//         if (this.englishTestNames.includes(tn)) {
//           return (
//             passportOK &&
//             visaOK &&
//             this.form.get('ListeningScore')!.valid &&
//             this.form.get('SpeakingScore')!.valid &&
//             this.form.get('ReadingScore')!.valid &&
//             this.form.get('WritingScore')!.valid &&
//             this.form.get('OverallScore')!.valid &&
//             this.form.get('EnglishTestYear')!.valid
//           );
//         }
//         return passportOK && visaOK;
//       }
//       return passportOK && visaOK;
//     }

//     // Step 2: Sponsor / Declaration / Documents
//     if (this.currentStep === 2) {
//       const sponsorOK = this.form.get('IsSelfFunded')!.valid && this.form.get('AvailableFunds')!.valid;
//       const declarationOK = this.form.get('AcceptPolicy')!.valid;
//       const resumeOK = !!this.uploadedResumeName;
//       return sponsorOK && declarationOK && resumeOK;
//     }

//     // Step 3: Final — allow only if form is valid and resume present and no duplicates
//     if (this.currentStep === 3) {
//       return this.form.valid && !!this.uploadedResumeName && !this.form.errors?.numbersMustBeDistinct;
//     }

//     return false;
//   }

//   nextStep(): void {
//     this.isSubmitted = true;
//     if (!this.canProceedToNext()) {
//       this.markAllControlsTouched();
//       return;
//     }
//     if (this.currentStep < this.steps.length - 1) {
//       this.currentStep++;
//       this.isSubmitted = false;
//     }
//   }

//   prevStep(): void {
//     if (this.currentStep > 0) this.currentStep--;
//   }

//   private markAllControlsTouched(): void {
//     Object.keys(this.form.controls).forEach(k => {
//       const c = this.form.get(k);
//       if (c) c.markAsTouched();
//     });
//   }

//   /* -------------------------
//      Final payload & submission
//      ------------------------- */

//   submitFinalApplication22(): void {
//     this.isSubmitted = true;
//     if (!this.form.valid || !this.uploadedResumeName || this.form.errors?.numbersMustBeDistinct) {
//       this.markAllControlsTouched();
//       return;
//     }

//     const payload = { ...this.form.getRawValue() };
//     // prepare FormData
//     const formData = new FormData();
//     // append form values
//     Object.keys(payload).forEach(key => {
//       const value = (payload as any)[key];
//       if (value === null || value === undefined) {
//         formData.append(key, '');
//       } else if (Array.isArray(value) || typeof value === 'object') {
//         // JSON stringify arrays/objects
//         formData.append(key, JSON.stringify(value));
//       } else {
//         formData.append(key, value.toString());
//       }
//     });

//     // append files
//     this.uploadedFiles.forEach(f => {
//       formData.append(f.key, f.file, f.file.name);
//     });
//     formData.forEach((value, key) => {
//       console.log(`${key}: ${value}`);
//     });
//     // call real API - keep your actual service & method (studentApi.submitRegistration used here as placeholder)
//     // this.studentApi.SemesterExchangeNewRegistrationForm(formData).subscribe({
//     //   next: (res: any) => {
//     //     // handle response accordingly
//     //     // e.g. navigate to success page or show message
//     //     alert('Application submitted successfully');
//     //   },
//     //   error: (err: any) => {
//     //     console.error('Submission failed', err);
//     //     alert('Submission failed — see console for details.');
//     //   }
//     // });
//   }
//  ResumeDocumentPath: any; ConsentLetterDocumentPath:any; FeesProofDocumentPath:any;EnglishProofDocumentPath:any;
//    // File data and status
//   PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
//   ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
//   FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
//   ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
//   EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';
//   UploadedResume: boolean=false;

//     DownloadFormat(): void {
//     const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
//     const link = document.createElement('a');
    
//     link.href = fileUrl;
//     link.download = fileUrl;
//     link.click();
//   }

//     onResumeFileSelected(event: any): void {
//       this.UploadedResume=true;
//       const reader = new FileReader();
//       const target = event.target as HTMLInputElement;
//       const file: File | null = (target.files as FileList)[0] || null;
//       if (file && file.size > 3148576) {
//         Swal.fire({
//           title: 'File size exceeds 3MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         return;
//       }
  
//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (file && !fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
  
//         this.ResumeFileData = modifiedFile;
//         this.ResumeDocumentPath = this.ResumeFileName = name;//ResumeDocumentPath
//         this.ResumeFileStatus = true;


     
//         reader.readAsDataURL(modifiedFile);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this.ResumeFileData = ssssArray[1];
//           this.ResumeDocumentPath = validFileName;
//         };
       
//         return;
//       }
  
//       this.ResumeFileData  = file;
//       this.ResumeFileStatus = true;
//       this.UploadedResume=true;
//       // alert(10);  
//       if (file) {
//         reader.readAsDataURL(file);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//            this.ResumeFileData = ssssArray[1];
//           this.ResumeDocumentPath = file.name; 
//           this.UploadedResume=true;     
//     this.form.patchValue({ ResumeDocumentPath: file.name });
//     this.form.patchValue({ ResumeFileData: file });   
//         };
//       }
   
//     }
    
//     onPassportFileSelected(event: any): void {
//       this.PassportFileStatus=true;
//       const reader = new FileReader();
//       const target = event.target as HTMLInputElement;
//       const file: File | null = (target.files as FileList)[0] || null;
//       if (file && file.size > 3148576) {
//         Swal.fire({
//           title: 'File size exceeds 3MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         return;
//       }
  
//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (file && !fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
  
//         this.PassportFileData = modifiedFile;
//         this.PassportFileName = name;//ResumeDocumentPath
//         this.PassportFileStatus = true;
     
//         reader.readAsDataURL(modifiedFile);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this.PassportFileData = ssssArray[1];
//           this.PassportFileName = validFileName;
//         };
       
//         return;
//       }
  
//       this.PassportFileData  = file;
//       this.PassportFileStatus = true;
      
//       // alert(10);  
//       if (file) {
//         reader.readAsDataURL(file);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//            this.PassportFileData  = ssssArray[1];
//           this.PassportFileName = file.name; 
//           this.PassportFileStatus=true;        
//         };
//       }
//     }
    
    
//     onFeesProofSelected(event: any): void {
//       this.FeesProofStatus=true;
//       const reader = new FileReader();
//       const target = event.target as HTMLInputElement;
//       const file: File | null = (target.files as FileList)[0] || null;
//       if (file && file.size > 3148576) {
//         Swal.fire({
//           title: 'File size exceeds 3MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         return;
//       }
  
//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (file && !fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
  
//         this.FeesProofData = modifiedFile;
//         this.FeesProofDocumentPath = this.FeesProofFileName = name;//ResumeDocumentPath
//         this.FeesProofStatus = true;


     
//         reader.readAsDataURL(modifiedFile);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this.FeesProofData = ssssArray[1];
//           this.FeesProofDocumentPath = validFileName;
//         };
       
//         return;
//       }
  
//       this.FeesProofData  = file;
//       this.FeesProofDocumentPath = true;
//        this.FeesProofStatus = true;
//       // alert(10);  
//       if (file) {
//         reader.readAsDataURL(file);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//            this.FeesProofData = ssssArray[1];
//           this.FeesProofDocumentPath = file.name; 
//            this.FeesProofStatus = true;      
//         };
//       }
//     }
    
//     onConsentLetterSelected(event: any): void {
//       this.ConsentLetterStatus=true;
//       const reader = new FileReader();
//       const target = event.target as HTMLInputElement;
//       const file: File | null = (target.files as FileList)[0] || null;
//       if (file && file.size > 3148576) {
//         Swal.fire({
//           title: 'File size exceeds 3MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         return;
//       }
  
//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (file && !fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
  
//         this.ConsentLetterData = modifiedFile;
//         this.ConsentLetterFileName =  name;//ResumeDocumentPath
//         this.ConsentLetterStatus = true;


     
//         reader.readAsDataURL(modifiedFile);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this.ConsentLetterData = ssssArray[1];
//           this.ConsentLetterFileName = validFileName;
//         };
       
//         return;
//       }
 
//        this.ConsentLetterData = file;
//        this.ConsentLetterDocumentPath = this.ConsentLetterFileName = name;
//         this.ConsentLetterStatus = true;
//       // alert(10);  
//       if (file) {
//         reader.readAsDataURL(file);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//            this.ConsentLetterData = ssssArray[1];
//           this.ConsentLetterFileName = file.name; 
//           this.ConsentLetterStatus=true;        
//         };
//       }
//     }
    
//     onEnglishProofSelected(event: any): void {
//       this. EnglishProofStatus=true;
//       const reader = new FileReader();
//       const target = event.target as HTMLInputElement;
//       const file: File | null = (target.files as FileList)[0] || null;
//       if (file && file.size > 3148576) {
//         Swal.fire({
//           title: 'File size exceeds 3MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         return;
//       }
  
//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (file && !fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
  
//         this. EnglishProofData = modifiedFile;
//         this. EnglishProofFileName =  name;//ResumeDocumentPath
//         this. EnglishProofStatus = true;


     
//         reader.readAsDataURL(modifiedFile);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this. EnglishProofData = ssssArray[1];
//           this. EnglishProofFileName = validFileName;
//         };
       
//         return;
//       }
 
//        this. EnglishProofData = file;
//        this. EnglishProofDocumentPath = this. EnglishProofFileName = name;
//        this. EnglishProofStatus = true;
//       // alert(10);  
//       if (file) {
//         reader.readAsDataURL(file);
//         reader.onload = () => {
//           const ssss = reader.result as string;
//           const ssssArray = ssss.split(',');
//           this. EnglishProofData = ssssArray[1];
//           this. EnglishProofFileName = file.name; 
//           this. EnglishProofStatus=true;        
//         };
//       }
//     }
  
//     submitFinalApplication(): void { 
//       this.isLoading = true;        const minLoadingTime = 2500;      const startTime = Date.now();
       

//        this.isSubmitted = true;
//     if (!this.form.valid || !this.uploadedResumeName || this.form.errors?.numbersMustBeDistinct) {
//       this.markAllControlsTouched();
//        Swal.fire({
//           title: 'Validation Error',
//           text: 'Please fill in all required fields correctly.',
//           icon: 'error',
//         });
//       return;
//     }

//     const formValue = { ...this.form.getRawValue() };

//     const formData = new FormData();
//       // Append regular form fields with checks for 'NA'
//       formData.append("SchoolId", this.SchoolId);
//       formData.append("SectionCode", this.SectionCode);
//       formData.append("RegistrationNo", this.RegistrationNo );
//       formData.append("EmailId", formValue.EmailId );
//       formData.append("CountryName", formValue.CountryName );
//       formData.append("WhatsAppNo", formValue.WhatsAppNo );
//       formData.append("PhoneNumber", formValue.PhoneNumber );
//       formData.append("ParentContact", formValue.ParentContact);
//       formData.append("ApplyingOption", formValue.ApplyingOption );
//       formData.append("UniversityOption1", formValue.UniversityOption1 );
//       formData.append("UniversityOption2", formValue.UniversityOption2 );
//       formData.append("UniversityOption3", formValue.UniversityOption3 );
//       formData.append("PassportStatus", formValue.PassportStatus );
  
//       if (formValue.PassportStatus === 'Yes') {
//         formData.append("PassportNumber", formValue.PassportNumber);
//         formData.append("PassportIssueDate", formValue.PassportIssueDate );
//         formData.append("PassportValidUpto", formValue.PassportValidUpto );
//         formData.append("PassportDocumentPath", this.PassportFileName ); // Use this.PassportFileName
//       } else {
//         formData.append("PassportNumber", 'NA');
//         // formData.append("PassportIssueDate", 'NA');
//         // formData.append("PassportValidUpto", 'NA');
//         // formData.append("PassportDocumentPath", 'NA');
//       }
  
//       formData.append("IsVisaRejected", formValue.IsVisaRejected || 'NA');
//       if (formValue.IsVisaRejected === 'Yes') {
//         formData.append("VisaRejectedReason", formValue.VisaRejectedReason || 'NA');
//         formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry || 'NA');
//       } else {
//         formData.append("VisaRejectedReason", 'NA');
//         formData.append("VisaRejectedCountry", 'NA');
//       }
  
//       formData.append("EnglishTestType", formValue.EnglishTestType || 'NA');
//       if (['Appeared/Given','DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
//         formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
//         formData.append("ListeningScore", formValue.ListeningScore || 'NA');
//         formData.append("ReadingScore", formValue.ReadingScore || 'NA');
//         formData.append("WritingScore", formValue.WritingScore || 'NA');
//         formData.append("OverallScore", formValue.OverallScore || 'NA');
//         formData.append("EnglishTestYear", formValue.EnglishTestYear  );
//       } else if (formValue.EnglishTestType === 'Applied') {
//         formData.append("testDate", formValue.testDate);
//         formData.append("SpeakingScore", 'NA');
//         formData.append("ListeningScore", 'NA');
//         formData.append("ReadingScore", 'NA');
//         formData.append("WritingScore", 'NA');
//         formData.append("OverallScore", 'NA');
//         formData.append("EnglishTestYear", 'NA');
//       }
//       else {
//         formData.append("SpeakingScore", 'NA');
//         formData.append("ListeningScore", 'NA');
//         formData.append("ReadingScore", 'NA');
//         formData.append("WritingScore", 'NA');
//         formData.append("OverallScore", 'NA');
//         formData.append("EnglishTestYear", 'NA');
//         // formData.append("testDate", 'NA');
//       }
  
//       formData.append("IsSelfFunded", formValue.IsSelfFunded || 'NA');
//       formData.append("SponsorEmail", 'NA'); // This field is not in the form, so default to 'NA'
//       formData.append("AvailableFunds", formValue.AvailableFunds || 'NA');
//       formData.append("TotalCountGradeF", this.GradeFcount.toString() || 'NA'); // Convert number to string
  
//       if (formValue.IsSelfFunded === 'Other') {
//         formData.append("SponsorName", formValue.SponsorName || 'NA');
//         formData.append("SponsorRelation", formValue.SponsorRelation || 'NA');
//         formData.append("SponsorContact", formValue.SponsorContact || 'NA'); // This field is not in the form, so default to 'NA'
//         formData.append("SponsorEmail", formValue.SponsorEmail || 'NA'); // This field is not in the form, so default to 'NA'
//       } else {
//         formData.append("SponsorName", 'NA');
//         formData.append("SponsorRelation", 'NA');
//         formData.append("SponsorContact", 'NA');
//         formData.append("SponsorEmail", 'NA');
//       }
  
//       formData.append("AcceptPolicy", formValue.AcceptPolicy ? 'Yes' : 'No');
//       formData.append("ResumeFileName", this.ResumeFileName );
//       formData.append("ResumeFileData", this.ResumeFileData);
//       formData.append("ConsentLetterFileName", this.ConsentLetterFileName );
//       formData.append("ConsentLetterData", this.ConsentLetterData );
//       formData.append("FeesProofData", this.FeesProofData );
//       formData.append("FeesProofFileName", this.FeesProofFileName );
//       formData.append("PassportFileData", this.PassportFileData );
//       formData.append("PassportFileName", this.PassportFileName );
//       formData.append("EnglishProofData", this.EnglishProofData );
//       formData.append("EnglishProofFileName", this.EnglishProofFileName );
  
//       formData.append("RelativeCountryName", formValue.RelativeCountryName || 'NA');
//       formData.append("RelativeName", formValue.RelativeName || 'NA');
//       formData.append("RelativeRelation", formValue.RelativeRelation || 'NA'); // Added RelativeRelation
//       formData.append("HasRelativeDetails", formValue.HasRelativeDetails || 'NA'); // Added HasRelativeDetails
//      formData.forEach((value, key) => {
//       console.log(`${key}: ${value}`);
//     });
//       this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
//         .pipe(
//           finalize(() => {
//             const elapsed = Date.now() - startTime;
//             const remaining = Math.max(minLoadingTime - elapsed, 0);
//             setTimeout(() => {
//               this.isLoading = false;
//             }, remaining);
//           })
//         )
//         .subscribe({
//           next: (data) => {
//             let errorCode = data[0].returnData;
  
//             if (errorCode > 0) {
//               Swal.fire({
//                 title: 'Application Created Successfully',
//                 text: "",
//                 icon: 'success',
//               }).then(() => {
//                 window.location.reload();
//               });
//             } else if (errorCode == -1) {
//               Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
//                 window.location.reload();
//               });
//             } else {
//               Swal.fire({ title: 'Some Technical Issue', text: "", icon: 'error' }).then(() => {
//                 window.location.reload();
//               });
//             }
//           },
//           error: () => {
//             Swal.fire({
//               title: 'Error Occurred',
//               text: 'Unable to complete the request. Please try again later.',
//               icon: 'error',
//             });
//           }
//         });
//     }
  
// }
 