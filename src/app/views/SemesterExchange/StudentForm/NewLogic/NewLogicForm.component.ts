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
// import { countries, Country } from '../countries-list'; // ← adjust path
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service'; // ← replace with your real service

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
  steps = [
    'Contact / Relative / University Preferences',
    'Passport / Previous Visa / English Proficiency',
    'Sponsor / Declaration / Document Details',
    'Final Review & Submit'
  ];

    showPolicy = false;

  ApplyingOption: any = '';
  folderUrl: string; serverUrl: string; serverUrlX: string;
  loginFailed: boolean = false;
  stuData: any; uniData: any; university: any; stuApplication: any; RegistrationNo: any;
  ApplicationId: any; ApplicationStatus: any; ContactNo: string; stuWhatsNo: string; EmailId: string;
  CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
  UniversityOption4: string; courseName: any; studentName: any; cgpa: any; CurrentYear: any; CurrentTerm: any; CourseTotalDuration: any; CourseTotalTerms: any; StudentStatus: any; WhatsAppNo: any;
  uploadedDocList: any[] = []; feesReceipt: string; DocumentName: any; DocumentPath: any; CreatedBy: string; FeesFile: any;
  ApplicationFile: any; ResumeFile: any; PhotoFile: any; PassportFile: any; FeesDocs: any; fileName: string;
  cgpa1: any; studentEmailId: any; LoginName: any; FeesPaidStatus: string = 'Pending ';

  // reactive form
  form!: FormGroup;
  isSubmitted = false;
  isLoading = false;

  // imported country list (no dummy data here)
  countries: any = countries;
countriesList: any = countries;
  // english test options
  englishOptions = [
    { value: '', label: 'Select' },
    { value: 'NotRequired', label: 'Not required' },
    { value: 'NotGiven', label: 'Not Given' },
    { value: 'Appeared', label: 'Appeared / Given' }
  ];
  englishTestNames = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];

  // uploaded files (kept as File objects for final FormData)
  uploadedFiles: { key: string; file: File }[] = [];
  uploadedResumeName = '';
  uploadedOtherFiles: { key: string; name: string }[] = [];

  // login details to show before form (fetched from API)
  loginDetails: { loginName?: string; email?: string; studentId?: string } = {};
  eligible: boolean;
  ProgramCode: any;

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

  ngOnInit(): void {
     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Semester Exchange Registration");
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.getToken(this.LoginName);
    }
    this.buildForm();

    this.setupConditionalValidators();

    ['WhatsAppNo', 'PhoneNumber', 'ParentContact'].forEach(ctrlName => {
      this.form.get(ctrlName)!.valueChanges.subscribe(() => {
        this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    });

    this.subscribeToFormChanges();

  }
  subscribeToFormChanges(): void {
        this.form.get('UniversityOption1')?.valueChanges.subscribe(value => {
            this.UniversityOption1 = value;
            // Optionally, clear downstream preferences if the current selection changes
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

  private buildForm(): void {
    this.form = this.fb.group(
      {
        // Contact Information
        loginName: [''], // read-only display field; not required for submit
        CountryName: ['', Validators.required],
        WhatsAppNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        PhoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        ParentContact: ['', [Validators.pattern(/^[0-9]{10}$/)]],

        // Relative Details
        HasRelativeDetails: ['', Validators.required],
        RelativeName: [''],
        RelativeCountryName: [''],
        RelativeRelation: [''],
        RelativePhone: [''],
        RelativeEmail: [''],

        // University Preferences
        ApplyingOption: ['', Validators.required],
        UniversityOption1: ['', Validators.required],
        UniversityOption2: ['', Validators.required],
        UniversityOption3: ['', Validators.required],

        // Passport Details
        PassportStatus: ['', Validators.required], // Yes/No/Applied etc.
        PassportNumber: [''],
        PassportIssueDate: [''],
        PassportValidUpto: [''],

        // Previous Visa Information
        IsVisaRejected: ['', Validators.required],
        VisaRejectedReason: [''],
        VisaRejectedCountry: [''],

        // English Proficiency
        EnglishTestType: ['', Validators.required], // NotRequired, NotGiven, Appeared
        TestName: [''], // PTE,IELTS,TOEFL,DULINGO
        TestDate: [''],
        ListeningScore: [''],
        SpeakingScore: [''],
        ReadingScore: [''],
        WritingScore: [''],
        OverallScore: [''],
        EnglishTestYear: [''],

        // Sponsor / Declaration
        IsSelfFunded: ['', Validators.required],
        AvailableFunds: ['', Validators.required],
        SponsorName: [''],
        SponsorRelation: [''],
        AcceptPolicy: [false, Validators.requiredTrue],

        // Documents (store file names in form for UI; actual File objects kept in uploadedFiles)
        ResumeDocumentPath: [''], // required (filename shown)
        OtherDocumentPaths: [[]] // array of filenames
      },
      { validators: [this.distinctPhoneNumbersValidator()] }
    );
  }

  /** Load login details from API (use your existing API call) */
  // private loadLoginDetails(): void {
  //   this.isLoading = true;
  //   // Replace studentApi.getLoginDetails() with your real API method
  //   this.studentApi.getLoginDetails().subscribe({
  //     next: (res: any) => {
  //       // assume res contains loginName, email, studentId
  //       this.loginDetails = {
  //         loginName: res?.loginName,
  //         email: res?.email,
  //         studentId: res?.studentId
  //       };
  //       // optional: patch loginName into form for display
  //       this.form.patchValue({ loginName: res?.loginName });
  //     },
  //     error: () => {
  //       // ignore silently; UI still works
  //     },
  //     complete: () => (this.isLoading = false)
  //   });
  // }
stepIcons = ['bi-person-lines-fill', 'bi-passport', 'bi-cash-stack', 'bi-check2-circle'];

stepLabels = [
  'Contact & University',
  'Passport & English',
  'Sponsor & Docs',
  'Review & Submit'
];
    getToken(id: any) {
    this.AuthServicess.loginTemp(id).subscribe({
      next: data => {
        this.StorageServicess.saveUser(data);
        const authToken = this.StorageServicess.getUser();
        if (!this.StorageServicess.isLoggedIn() || authToken === 'Token Expired' || !authToken) {
          this.LoginFailed('Invalid or expired token');
          return;
        }
        this.loginFailed = false;
        this.getStudentDetail();
        this.folderUrl = this.ServicesSM.getFolderUrl();
        this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
      },
      error: err => {
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
  
     getStudentDetail(): void {
        this.isLoading = true;
        this.ServicesSM.getStudentById().subscribe({
          next: response => {
            if (response.item1.length > 0) {
              this.stuData = response.item1[0];
             
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
              this.GetStudentMarksDetails(this.RegistrationNo);
              this.getApplicationDetails(this.RegistrationNo);
              this.eligible = true; // Will be updated after marks details are fetched
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
    
      getApplicationDetails(regId: string): void {
        this.ServicesSM.getApplicationDetailsBYId(regId).subscribe((response) => {
          if (response.item1.length > 0) {
            this.stuApplication = response.item1[0];
            // console.log(JSON.stringify(this.stuApplication))
           
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
              title: 'Application already Exists',
              text: '..',
              icon: 'success',
              showConfirmButton: false, // Hide the OK button
              timer: 5000  
            }).then(() => {
              this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
            });
            
           
    
          }
          else {
            this.stuApplication = null;
            this.ApplicationStatus = null;
          }
        });
      }
    
      getUniversityDetails(): void {
        this.ServicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
        // this.ServicesSM.getUniversityLists('P4AE').subscribe((response) => {
        // this.ServicesSM.getUniversityDetails().subscribe((response) => {
          this.uniData = response.item1;
          this.university = this.uniData;
        });
      }
      SectionCode: any;         SchoolId: any;        allProgramCode:any; StudentDetailsWithMarks:any; GradeFcount:any;
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
              //  console.log(JSON.stringify(this.StudentDetailsWithMarks))
              this.getUniversityDetails();
              this.GradeFcount = 0; // Reset count
              for (const item of this.StudentDetailsWithMarks) {
                const gradeStr = item.grade?.toUpperCase();
                const gradeNum = parseInt(item.gradeNum, 10);
    
                // If grade is F or gradeNum ≤ 6
                if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
                  this.GradeFcount++;
                }
              }
    
              // Set eligibility after GradeFcount is determined
              // this.eligible = (this.GradeFcount < 1) && (this.CurrentTerm > 0 && this.CurrentTerm < this.CourseTotalTerms);
    
            } else {
              this.StudentDetailsWithMarks = [];
              this.GradeFcount = 0;
              this.eligible = false; // Not eligible if no marks data or F grades exist
            }
          },
          error: err => {
            this.LoginFailed(err);
            this.eligible = false; // Not eligible on error
          }
        });
      }
    
      togglePolicy(event: MouseEvent): void {
        event.preventDefault(); // prevent page scroll
        this.showPolicy = !this.showPolicy;
      }
  /* -------------------------
     Validators & Conditional logic
     ------------------------- */

  /** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
/** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
/** Cross-field validator: ensure WhatsApp, Phone and ParentContact are all distinct */
private distinctPhoneNumbersValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const wa = group.get('WhatsAppNo')?.value?.trim() || '';
    const ph = group.get('PhoneNumber')?.value?.trim() || '';
    const parent = group.get('ParentContact')?.value?.trim() || '';

    // Only run if all are 10-digit numbers
    const allValid = /^[0-9]{10}$/.test(wa) && /^[0-9]{10}$/.test(ph) && /^[0-9]{10}$/.test(parent);
    if (!allValid) {
      // clear existing error when editing
      return null;
    }

    // If any duplicates
    if (wa === parent || ph === parent) {
      return { numbersMustBeDistinct: true };
    }

    return null;
  };
}

  // distinctNumberValidator(otherControl1: string, otherControl2: string) {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     if (!this.SemesterExchangeRegistration) {
  //       return null;
  //     }

  //     const currentValue = control.value;
  //     const otherValue1 = this.SemesterExchangeRegistration.get(otherControl1)?.value;
  //     const otherValue2 = this.SemesterExchangeRegistration.get(otherControl2)?.value;

  //     if (currentValue &&
  //       ((otherValue1 && currentValue === otherValue1) ||
  //         (otherValue2 && currentValue === otherValue2))) {
  //       return { numbersMustBeDistinct: true };
  //     }

  //     return null;
  //   };
  // }


  private setupConditionalValidators(): void {
    // Relative details required when HasRelativeDetails === 'Yes'
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
      name.updateValueAndValidity();
      country.updateValueAndValidity();
      relation.updateValueAndValidity();
    });

    // Passport fields required when PassportStatus === 'Yes'
    this.form.get('PassportStatus')!.valueChanges.subscribe(val => {
      const num = this.form.get('PassportNumber')!;
      const issue = this.form.get('PassportIssueDate')!;
      const valid = this.form.get('PassportValidUpto')!;
      if (val === 'Yes') {
        num.setValidators([Validators.required]);
        issue.setValidators([Validators.required]);
        valid.setValidators([Validators.required]);
      } else {
        num.clearValidators();
        issue.clearValidators();
        valid.clearValidators();
      }
      num.updateValueAndValidity();
      issue.updateValueAndValidity();
      valid.updateValueAndValidity();
    });

    // Visa rejected details required if IsVisaRejected === 'Yes'
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
      rr.updateValueAndValidity();
      rc.updateValueAndValidity();
    });

    // English test conditional validators
    this.form.get('EnglishTestType')!.valueChanges.subscribe(val => {
      const testName = this.form.get('TestName')!;
      const testDate = this.form.get('TestDate')!;
      const listening = this.form.get('ListeningScore')!;
      const speaking = this.form.get('SpeakingScore')!;
      const reading = this.form.get('ReadingScore')!;
      const writing = this.form.get('WritingScore')!;
      const overall = this.form.get('OverallScore')!;
      const year = this.form.get('EnglishTestYear')!;

      if (val === 'Appeared') {
        testName.setValidators([Validators.required]);
        testDate.setValidators([Validators.required]);
      } else {
        testName.clearValidators();
        testDate.clearValidators();
      }
      testName.updateValueAndValidity();
      testDate.updateValueAndValidity();

      // if TestName chosen and is one of known tests -> require scores & year
      testName.valueChanges.subscribe((tn: string) => {
        const needsScores = this.englishTestNames.includes(tn);
        if (needsScores) {
          listening.setValidators([Validators.required]);
          speaking.setValidators([Validators.required]);
          reading.setValidators([Validators.required]);
          writing.setValidators([Validators.required]);
          overall.setValidators([Validators.required]);
          year.setValidators([Validators.required]);
        } else {
          listening.clearValidators();
          speaking.clearValidators();
          reading.clearValidators();
          writing.clearValidators();
          overall.clearValidators();
          year.clearValidators();
        }
        listening.updateValueAndValidity();
        speaking.updateValueAndValidity();
        reading.updateValueAndValidity();
        writing.updateValueAndValidity();
        overall.updateValueAndValidity();
        year.updateValueAndValidity();
      });
    });
  }

  /* -------------------------
     File handling
     ------------------------- */

  onResumeSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.uploadedResumeName = file.name;

    // replace old resume if present
    this.uploadedFiles = this.uploadedFiles.filter(f => f.key !== 'resume');
    this.uploadedFiles.push({ key: 'resume', file });

    // store filename in form for UI & review
    this.form.patchValue({ ResumeDocumentPath: file.name });
    this.form.patchValue({ ResumeFileData: file });
  }

  onOtherFileSelected(evt: Event, key: string) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.uploadedFiles.push({ key, file });
    this.uploadedOtherFiles.push({ key, name: file.name });

    // also push filename to OtherDocumentPaths array
    const otherArr = this.form.get('OtherDocumentPaths')!.value || [];
    otherArr.push({ key, name: file.name });
    this.form.patchValue({ OtherDocumentPaths: otherArr });
  }

  /* -------------------------
     Wizard controls (per-step validation)
     ------------------------- */

  canProceedToNext(): boolean {
    // Minimal gating: validate only fields relevant to the current step.
    // Step 0: Contact, Relative, University Preferences
    if (this.currentStep === 0) {
      const contactValid =
        this.form.get('CountryName')!.valid &&
        this.form.get('WhatsAppNo')!.valid &&
        this.form.get('PhoneNumber')!.valid &&
        this.form.get('ParentContact')!.valid;

      const relativeValid = (this.form.get('HasRelativeDetails')!.value === 'Yes')
        ? (this.form.get('RelativeName')!.valid &&
           this.form.get('RelativeCountryName')!.valid &&
           this.form.get('RelativeRelation')!.valid)
        : true;

      const uniValid =
        this.form.get('ApplyingOption')!.valid &&
        this.form.get('UniversityOption1')!.valid &&
        this.form.get('UniversityOption2')!.valid &&
        this.form.get('UniversityOption3')!.valid;

      // ensure phone uniqueness validator not present
      const duplicates = !!this.form.errors?.numbersMustBeDistinct;

      return contactValid && relativeValid && uniValid && !duplicates;
    }

    // Step 1: Passport, Visa, English
    if (this.currentStep === 1) {
      // passport block
      const passportOK = this.form.get('PassportStatus')!.value !== 'Yes' ||
        (this.form.get('PassportNumber')!.valid && this.form.get('PassportIssueDate')!.valid && this.form.get('PassportValidUpto')!.valid);

      // visa block
      const visaOK = this.form.get('IsVisaRejected')!.value !== 'Yes' ||
        (this.form.get('VisaRejectedReason')!.valid && this.form.get('VisaRejectedCountry')!.valid);

      // english block
      const et = this.form.get('EnglishTestType')!.value;
      if (!this.form.get('EnglishTestType')!.valid) return false;
      if (et === 'Appeared') {
        const tn = this.form.get('TestName')!.value;
        if (!this.form.get('TestDate')!.valid || !this.form.get('TestName')!.valid) return false;
        if (this.englishTestNames.includes(tn)) {
          return (
            passportOK &&
            visaOK &&
            this.form.get('ListeningScore')!.valid &&
            this.form.get('SpeakingScore')!.valid &&
            this.form.get('ReadingScore')!.valid &&
            this.form.get('WritingScore')!.valid &&
            this.form.get('OverallScore')!.valid &&
            this.form.get('EnglishTestYear')!.valid
          );
        }
        return passportOK && visaOK;
      }
      return passportOK && visaOK;
    }

    // Step 2: Sponsor / Declaration / Documents
    if (this.currentStep === 2) {
      const sponsorOK = this.form.get('IsSelfFunded')!.valid && this.form.get('AvailableFunds')!.valid;
      const declarationOK = this.form.get('AcceptPolicy')!.valid;
      const resumeOK = !!this.uploadedResumeName;
      return sponsorOK && declarationOK && resumeOK;
    }

    // Step 3: Final — allow only if form is valid and resume present and no duplicates
    if (this.currentStep === 3) {
      return this.form.valid && !!this.uploadedResumeName && !this.form.errors?.numbersMustBeDistinct;
    }

    return false;
  }

  nextStep(): void {
    this.isSubmitted = true;
    if (!this.canProceedToNext()) {
      this.markAllControlsTouched();
      return;
    }
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.isSubmitted = false;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  private markAllControlsTouched(): void {
    Object.keys(this.form.controls).forEach(k => {
      const c = this.form.get(k);
      if (c) c.markAsTouched();
    });
  }

  /* -------------------------
     Final payload & submission
     ------------------------- */

  submitFinalApplication22(): void {
    this.isSubmitted = true;
    if (!this.form.valid || !this.uploadedResumeName || this.form.errors?.numbersMustBeDistinct) {
      this.markAllControlsTouched();
      return;
    }

    const payload = { ...this.form.getRawValue() };
    // prepare FormData
    const formData = new FormData();
    // append form values
    Object.keys(payload).forEach(key => {
      const value = (payload as any)[key];
      if (value === null || value === undefined) {
        formData.append(key, '');
      } else if (Array.isArray(value) || typeof value === 'object') {
        // JSON stringify arrays/objects
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    // append files
    this.uploadedFiles.forEach(f => {
      formData.append(f.key, f.file, f.file.name);
    });
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    // call real API - keep your actual service & method (studentApi.submitRegistration used here as placeholder)
    // this.studentApi.SemesterExchangeNewRegistrationForm(formData).subscribe({
    //   next: (res: any) => {
    //     // handle response accordingly
    //     // e.g. navigate to success page or show message
    //     alert('Application submitted successfully');
    //   },
    //   error: (err: any) => {
    //     console.error('Submission failed', err);
    //     alert('Submission failed — see console for details.');
    //   }
    // });
  }
 ResumeDocumentPath: any; ConsentLetterDocumentPath:any; FeesProofDocumentPath:any;EnglishProofDocumentPath:any;
   // File data and status
  PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
  ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
  FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
  ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
  EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';
  UploadedResume: boolean=false;

    DownloadFormat(): void {
    const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
    const link = document.createElement('a');
    
    link.href = fileUrl;
    link.download = fileUrl;
    link.click();
  }

    onResumeFileSelected(event: any): void {
      this.UploadedResume=true;
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
        this.ResumeDocumentPath = this.ResumeFileName = name;//ResumeDocumentPath
        this.ResumeFileStatus = true;


     
        reader.readAsDataURL(modifiedFile);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this.ResumeFileData = ssssArray[1];
          this.ResumeDocumentPath = validFileName;
        };
       
        return;
      }
  
      this.ResumeFileData  = file;
      this.ResumeFileStatus = true;
      this.UploadedResume=true;
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
           this.ResumeFileData = ssssArray[1];
          this.ResumeDocumentPath = file.name; 
          this.UploadedResume=true;     
    this.form.patchValue({ ResumeDocumentPath: file.name });
    this.form.patchValue({ ResumeFileData: file });   
        };
      }
   
    }
    
    onPassportFileSelected(event: any): void {
      this.PassportFileStatus=true;
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
        this.PassportFileName = name;//ResumeDocumentPath
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
  
      this.PassportFileData  = file;
      this.PassportFileStatus = true;
      
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
           this.PassportFileData  = ssssArray[1];
          this.PassportFileName = file.name; 
          this.PassportFileStatus=true;        
        };
      }
    }
    
    
    onFeesProofSelected(event: any): void {
      this.FeesProofStatus=true;
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
        this.FeesProofDocumentPath = this.FeesProofFileName = name;//ResumeDocumentPath
        this.FeesProofStatus = true;


     
        reader.readAsDataURL(modifiedFile);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this.FeesProofData = ssssArray[1];
          this.FeesProofDocumentPath = validFileName;
        };
       
        return;
      }
  
      this.FeesProofData  = file;
      this.FeesProofDocumentPath = true;
       this.FeesProofStatus = true;
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
           this.FeesProofData = ssssArray[1];
          this.FeesProofDocumentPath = file.name; 
           this.FeesProofStatus = true;      
        };
      }
    }
    
    onConsentLetterSelected(event: any): void {
      this.ConsentLetterStatus=true;
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
        this.ConsentLetterFileName =  name;//ResumeDocumentPath
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
       this.ConsentLetterDocumentPath = this.ConsentLetterFileName = name;
        this.ConsentLetterStatus = true;
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
           this.ConsentLetterData = ssssArray[1];
          this.ConsentLetterFileName = file.name; 
          this.ConsentLetterStatus=true;        
        };
      }
    }
    
    onEnglishProofSelected(event: any): void {
      this. EnglishProofStatus=true;
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
  
        this. EnglishProofData = modifiedFile;
        this. EnglishProofFileName =  name;//ResumeDocumentPath
        this. EnglishProofStatus = true;


     
        reader.readAsDataURL(modifiedFile);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this. EnglishProofData = ssssArray[1];
          this. EnglishProofFileName = validFileName;
        };
       
        return;
      }
 
       this. EnglishProofData = file;
       this. EnglishProofDocumentPath = this. EnglishProofFileName = name;
       this. EnglishProofStatus = true;
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this. EnglishProofData = ssssArray[1];
          this. EnglishProofFileName = file.name; 
          this. EnglishProofStatus=true;        
        };
      }
    }
  
    submitFinalApplication(): void { 
      this.isLoading = true;        const minLoadingTime = 2500;      const startTime = Date.now();
       

       this.isSubmitted = true;
    if (!this.form.valid || !this.uploadedResumeName || this.form.errors?.numbersMustBeDistinct) {
      this.markAllControlsTouched();
       Swal.fire({
          title: 'Validation Error',
          text: 'Please fill in all required fields correctly.',
          icon: 'error',
        });
      return;
    }

    const formValue = { ...this.form.getRawValue() };

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
        formData.append("PassportDocumentPath", this.PassportFileName ); // Use this.PassportFileName
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
      if (['Appeared/Given','DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
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
     formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
      // this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
      //   .pipe(
      //     finalize(() => {
      //       const elapsed = Date.now() - startTime;
      //       const remaining = Math.max(minLoadingTime - elapsed, 0);
      //       setTimeout(() => {
      //         this.isLoading = false;
      //       }, remaining);
      //     })
      //   )
      //   .subscribe({
      //     next: (data) => {
      //       let errorCode = data[0].returnData;
  
      //       if (errorCode > 0) {
      //         Swal.fire({
      //           title: 'Application Created Successfully',
      //           text: "",
      //           icon: 'success',
      //         }).then(() => {
      //           window.location.reload();
      //         });
      //       } else if (errorCode == -1) {
      //         Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
      //           window.location.reload();
      //         });
      //       } else {
      //         Swal.fire({ title: 'Some Technical Issue', text: "", icon: 'error' }).then(() => {
      //           window.location.reload();
      //         });
      //       }
      //     },
      //     error: () => {
      //       Swal.fire({
      //         title: 'Error Occurred',
      //         text: 'Unable to complete the request. Please try again later.',
      //         icon: 'error',
      //       });
      //     }
      //   });
    }
  
}
 