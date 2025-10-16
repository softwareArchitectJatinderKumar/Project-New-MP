import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { countries } from './countries-list';
import { SemesterExchangeFormComponent } from '../../pages/SemesterExchangeForm/SemesterExchangeForm.component';


@Component({
  selector: 'StudentForm',
  templateUrl: './NewStudentForm.component.html',
  // templateUrl: './StudentForm.component.html',
  styleUrls: ['./StudentForm.component.scss'],
})
export class StudentFormComponent implements OnInit {
onFileSelectedFeesProof($event: Event) {
throw new Error('Method not implemented.');
}
onFileSelectedResumeFile($event: Event) {
throw new Error('Method not implemented.');
}
onFileSelectedConsentLetter($event: Event) {
throw new Error('Method not implemented.');
}
onFileSelectedPassportFile($event: Event) {
throw new Error('Method not implemented.');
}

countriesList: any = countries;
// &&  formatDate(form.get('TestDate')?.value) < PresentDate

  EnglishTestType: any = ''; IsSelfFunded: any = ''; IsVisaRejected: any = '';
  PassportDocumentPath: any = ''; EnglishTest: any='';

  SemesterExchangeRegistration!: FormGroup;
  isForm1Submitted: boolean = false;
  isLoading: boolean = false;
  eligible: boolean = false; // Initialize eligible to false
PassportNumber: any;
PassportIssueDate: any;
PassportValidUpto: any;
VisaRejectionReason: any;

  get form1() {
    return this.SemesterExchangeRegistration.controls;
  }
  
  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }


  PresentDate = new Date();  
  isTestDateBeforePresent(): boolean {
    const testDateValue = this.SemesterExchangeRegistration.get('testDate')?.value;
    if (!testDateValue) return false; 
    const testDate = new Date(testDateValue);
    if (isNaN(testDate.getTime())) return false;
    return testDate < this.PresentDate;
  }
  showPolicy = true;

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

  // Passport and Visa related properties
  PassportStatus: string = '';
  VisaRejected: string = '';

  // File data and status
  PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
  ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
  FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
  ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
  EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';

  // Student Marks Details
  StudentDetailsWithMarks: any = [];
  GradeFcount: number = 0; // Initialize GradeFcount
  ProgramCode: any;

  constructor(
    private AuthServicess: AuthService,
    private StorageServicess: StorageService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public formBuilder: UntypedFormBuilder, private fb: FormBuilder,
    private router: Router, private title: Title) { }

  ngOnInit(): void {
    //  this.PresentDate= this.formatDate(new Date()) ;   
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Semester Exchange Registration");
    this.LoginName = this.route.snapshot.params['LoginName'];
    if (this.LoginName != '' && this.LoginName != undefined) {
      this.getToken(this.LoginName);
    }
    this.LoadNewForm();
  }

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

  distinctNumberValidator(otherControl1: string, otherControl2: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.SemesterExchangeRegistration) {
        return null;
      }

      const currentValue = control.value;
      const otherValue1 = this.SemesterExchangeRegistration.get(otherControl1)?.value;
      const otherValue2 = this.SemesterExchangeRegistration.get(otherControl2)?.value;

      if (currentValue &&
        ((otherValue1 && currentValue === otherValue1) ||
          (otherValue2 && currentValue === otherValue2))) {
        return { numbersMustBeDistinct: true };
      }

      return null;
    };
  }

  LoadNewForm() {
    this.SemesterExchangeRegistration = this.fb.group({
      RegistrationNo: [''],
      CountryName: ['', Validators.required],
      WhatsAppNo: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        // this.distinctNumberValidator('PhoneNumber', 'ParentContact')
      ]],
      PhoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        // this.distinctNumberValidator('WhatsAppNo', 'ParentContact')
      ]],
      ParentContact: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        this.distinctNumberValidator('WhatsAppNo', 'PhoneNumber')
      ]],
      // Relative Details Section
      HasRelativeDetails: ['', Validators.required],
      EmailId: [''],
      RelativePhone: ['', [Validators.pattern('^[0-9]{10}$')]],
      RelativeName: ['', Validators.required],
      RelativeRelation: ['', Validators.required],
      RelativeCountryName: ['', Validators.required],

      // University Preferences
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],

      // Passport Details
      PassportStatus: ['', Validators.required],
      PassportNumber: [''],
      PassportIssueDate: [''],
      PassportValidUpto: [''],
      PassportDocumentPath: [''],

      // Visa Information
      IsVisaRejected: ['', Validators.required],
      VisaRejectedReason: [''],
      VisaRejectedCountry: [''],

      // English Details
      EnglishTestType: ['', Validators.required],
      EnglishTest: ['', Validators.required ],
      ListeningScore: [''],
      SpeakingScore: [''],
      ReadingScore: [''],
      WritingScore: [''],
      OverallScore: [''],
      EnglishTestYear: [''],
      testDate: [''], // Added for English test date

      // Sponsor Information
      IsSelfFunded: ['', Validators.required],
      SponsorName: [''],
      SponsorRelation: [''],
      AvailableFunds: ['', Validators.required],

      // Legal Policy
      AcceptPolicy: [true, Validators.requiredTrue],

      // Documents
      FeesProofDocumentPath: [''],
      EnglishProofDocumentPath: [''],
      ResumeDocumentPath: [''],
      ConsentLetterDocumentPath: ['']
    });

    // Initial setup for relative details fields
    this.SemesterExchangeRegistration.get('HasRelativeDetails')?.valueChanges.subscribe(value => {
      // const emailControl = this.SemesterExchangeRegistration.get('EmailId');
      const relativeNameControl = this.SemesterExchangeRegistration.get('RelativeName');
      const relativeRelationControl = this.SemesterExchangeRegistration.get('RelativeRelation');
      const relativeCountryControl = this.SemesterExchangeRegistration.get('RelativeCountryName');

      if (value === 'No') {
        // emailControl?.clearValidators();
        relativeNameControl?.clearValidators();
        relativeRelationControl?.clearValidators();
        relativeCountryControl?.clearValidators();

        // emailControl?.patchValue('NA');
        relativeNameControl?.patchValue('NA');
        relativeRelationControl?.patchValue('NA');
        relativeCountryControl?.patchValue('NA');
      } else {
        // emailControl?.setValidators([Validators.required, Validators.email]);
        relativeNameControl?.setValidators([Validators.required]);
        relativeRelationControl?.setValidators([Validators.required]);
        relativeCountryControl?.setValidators([Validators.required]);

        // Clear 'NA' values if 'Yes' is selected
        // if (emailControl?.value === 'NA') emailControl?.patchValue('');
        if (relativeNameControl?.value === 'NA') relativeNameControl?.patchValue('');
        if (relativeRelationControl?.value === 'NA') relativeRelationControl?.patchValue('');
        if (relativeCountryControl?.value === 'NA') relativeCountryControl?.patchValue('');
      }
      // emailControl?.updateValueAndValidity();
      relativeNameControl?.updateValueAndValidity();
      relativeRelationControl?.updateValueAndValidity();
      relativeCountryControl?.updateValueAndValidity();
    });

    // Conditional validation for Passport details
    this.SemesterExchangeRegistration.get('PassportStatus')?.valueChanges.subscribe(value => {
      const passportNumberControl = this.SemesterExchangeRegistration.get('PassportNumber');
      const passportIssueDateControl = this.SemesterExchangeRegistration.get('PassportIssueDate');
      const passportValidUptoControl = this.SemesterExchangeRegistration.get('PassportValidUpto');
      const passportDocumentPathControl = this.SemesterExchangeRegistration.get('PassportDocumentPath');

      if (value === 'Yes') {
        passportNumberControl?.setValidators([Validators.required]);
        passportIssueDateControl?.setValidators([Validators.required]);
        passportValidUptoControl?.setValidators([Validators.required]);
        passportDocumentPathControl?.setValidators([Validators.required]);
      } else {
        passportNumberControl?.clearValidators();
        passportIssueDateControl?.clearValidators();
        passportValidUptoControl?.clearValidators();
        passportDocumentPathControl?.clearValidators();
      }
      passportNumberControl?.updateValueAndValidity();
      passportIssueDateControl?.updateValueAndValidity();
      passportValidUptoControl?.updateValueAndValidity();
      passportDocumentPathControl?.updateValueAndValidity();
    });

    // Conditional validation for Visa Rejected details
    this.SemesterExchangeRegistration.get('IsVisaRejected')?.valueChanges.subscribe(value => {
      const visaRejectedReasonControl = this.SemesterExchangeRegistration.get('VisaRejectedReason');
      const visaRejectedCountryControl = this.SemesterExchangeRegistration.get('VisaRejectedCountry');

      if (value === 'Yes') {
        visaRejectedReasonControl?.setValidators([Validators.required]);
        visaRejectedCountryControl?.setValidators([Validators.required]);
      } else {
        visaRejectedReasonControl?.clearValidators();
        visaRejectedCountryControl?.clearValidators();
      }
      visaRejectedReasonControl?.updateValueAndValidity();
      visaRejectedCountryControl?.updateValueAndValidity();
    });

    // Conditional validation for English Test details
    this.SemesterExchangeRegistration.get('EnglishTestType')?.valueChanges.subscribe(value => {
      const listeningScoreControl = this.SemesterExchangeRegistration.get('ListeningScore');
      const speakingScoreControl = this.SemesterExchangeRegistration.get('SpeakingScore');
      const readingScoreControl = this.SemesterExchangeRegistration.get('ReadingScore');
      const writingScoreControl = this.SemesterExchangeRegistration.get('WritingScore');
      const overallScoreControl = this.SemesterExchangeRegistration.get('OverallScore');
      const englishTestYearControl = this.SemesterExchangeRegistration.get('EnglishTestYear');
      const testDateControl = this.SemesterExchangeRegistration.get('testDate');

      if (['PTE','DULINGO', 'IELTS', 'TOFEL'].includes(value)) {
        listeningScoreControl?.setValidators([Validators.required]);
        speakingScoreControl?.setValidators([Validators.required]);
        readingScoreControl?.setValidators([Validators.required]);
        writingScoreControl?.setValidators([Validators.required]);
        overallScoreControl?.setValidators([Validators.required]);
        englishTestYearControl?.setValidators([Validators.required]);
        testDateControl?.clearValidators(); // Clear if previously set by 'Applied'
      } else if (value === 'Applied') {
        testDateControl?.setValidators([Validators.required]);
        listeningScoreControl?.clearValidators();
        speakingScoreControl?.clearValidators();
        readingScoreControl?.clearValidators();
        writingScoreControl?.clearValidators();
        overallScoreControl?.clearValidators();
        englishTestYearControl?.clearValidators();
      } else {
        listeningScoreControl?.clearValidators();
        speakingScoreControl?.clearValidators();
        readingScoreControl?.clearValidators();
        writingScoreControl?.clearValidators();
        overallScoreControl?.clearValidators();
        englishTestYearControl?.clearValidators();
        testDateControl?.clearValidators();
      }
      listeningScoreControl?.updateValueAndValidity();
      speakingScoreControl?.updateValueAndValidity();
      readingScoreControl?.updateValueAndValidity();
      writingScoreControl?.updateValueAndValidity();
      overallScoreControl?.updateValueAndValidity();
      englishTestYearControl?.updateValueAndValidity();
      testDateControl?.updateValueAndValidity();
    });

    // Conditional validation for Sponsor details
    this.SemesterExchangeRegistration.get('IsSelfFunded')?.valueChanges.subscribe(value => {
      const sponsorNameControl = this.SemesterExchangeRegistration.get('SponsorName');
      const sponsorRelationControl = this.SemesterExchangeRegistration.get('SponsorRelation');

      if (value === 'Other') {
        sponsorNameControl?.setValidators([Validators.required]);
        sponsorRelationControl?.setValidators([Validators.required]);
      } else {
        sponsorNameControl?.clearValidators();
        sponsorRelationControl?.clearValidators();
      }
      sponsorNameControl?.updateValueAndValidity();
      sponsorRelationControl?.updateValueAndValidity();
    });
  }
  studentStatus: any;

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
                showConfirmButton: false, // Hide the OK button
                timer: 5000  
              }).then(() => {
                this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
              });
              
            }
            if (this.studentStatus === 'A' || this.studentStatus === 'ACT') {
              // Added on 13-Oct-25
              if (this.CurrentTerm > 1)
                this.GetStudentMarksDetails(this.RegistrationNo);
              else if (this.CurrentTerm == 1)
                this.GetStudentAllPreviousMarks(this.RegistrationNo);               
            }
            else {
              this.eligible = false;
            }
            // --- MOVED CODE END ---
          });
    }
  // getApplicationDetails(regId: string): void {
  //   this.ServicesSM.getApplicationDetailsBYId(regId).subscribe((response) => {
  //     if (response.item1.length > 0) {
  //       this.stuApplication = response.item1[0];
  //       // console.log(JSON.stringify(this.stuApplication))
       
  //       if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected == null) {
  //         this.ApplicationStatus = true;
  //       } else if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected === true) {
  //         this.ApplicationStatus = false;
  //       }

  //       this.CountryCode = this.stuApplication.countryCode;
  //       this.stuWhatsNo = this.stuApplication.whatsAppNo;
  //       this.EmailId = this.stuApplication.emailId;
  //       this.ApplicationId = this.stuApplication.applicationId;
  //       this.UniversityOption1 = this.stuApplication.universityOption1;
  //       this.UniversityOption2 = this.stuApplication.universityOption2;
  //       this.UniversityOption3 = this.stuApplication.universityOption3;       
  //     }
  //     else {
  //       this.stuApplication = null;
  //       this.ApplicationStatus = null;
  //     }

  //     if (this.ApplicationId > 0) {
  //           Swal.fire({
  //             title: 'Application already Exists',
  //             text: '..',
  //             icon: 'success',
  //             showConfirmButton: false, // Hide the OK button
  //             timer: 5000
  //           }).then(() => {
  //             this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
  //           });
  //         }
  //         else if (this.studentStatus === 'A' || this.studentStatus === 'ACT') {
  //           // Added on 13-Oct-25
  //           if (this.CurrentTerm > 1)
  //             this.GetStudentMarksDetails(this.RegistrationNo);
  //           else if (this.CurrentTerm == 1)
  //             this.GetStudentAllPreviousMarks(this.RegistrationNo);
  //         }
  //         else {
  //           this.eligible = false;
  //         }
  //   });
  // }

  getUniversityDetails(): void {
    this.ServicesSM.getUniversityLists(this.ProgramCode).subscribe((response) => {
      this.uniData = response.item1;
      this.university = this.uniData;
    });
  }
  SectionCode: any;
  SchoolId: any;
  allProgramCode:any;
  getAllProgramcode(): void {
    this.ServicesSM.FetchAllProgramCodesList().subscribe((response) => {
      this.allProgramCode = response.item1
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
          this.eligible = (this.MarksPlus2 ==='10+2') && (this.Percetnages >70 );
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

  //    ended Added on 13-Oct-25
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
          this.eligible = (this.GradeFcount < 1) && (this.CurrentTerm > 0 && this.CurrentTerm < this.CourseTotalTerms);

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
  ResumeDocumentPath: any; ConsentLetterDocumentPath:any; FeesProofDocumentPath:any;EnglishProofDocumentPath:any;

  onFileSelected(event: any, fileType: 'passport' | 'resume' | 'feesProof' | 'consentLetter' | 'englishProof'): void {
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

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.assignFileData(fileType, base64String, validFileName, true);
      };
      return;
    }

    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.assignFileData(fileType, base64String, file.name, true);
      };
    } else {
      this.assignFileData(fileType, '', '', false); // Clear data if no file selected
    }
  }

  private assignFileData(fileType: 'passport' | 'resume' | 'feesProof' | 'consentLetter' |'englishProof', data: any, name: any, status: boolean): void {
    switch (fileType) {
      case 'passport':
        this.PassportFileData = data;
        this.PassportFileName = name;
        this.PassportFileStatus = status;
        break;
      case 'resume':
        this.ResumeFileData = data;
        this.ResumeDocumentPath = this.ResumeFileName = name;//ResumeDocumentPath
        this.ResumeFileStatus = status;
        break;
      case 'feesProof':
        this.FeesProofData = data;
        this.FeesProofFileName = name;
        this.FeesProofStatus = status;
        break;
      case 'consentLetter':
        this.ConsentLetterData = data;
       this.ConsentLetterDocumentPath = this.ConsentLetterFileName = name;
        this.ConsentLetterStatus = status;
        break;
      case 'englishProof':
        this.EnglishProofData = data;
        this.EnglishProofFileName = name;
        this.EnglishProofStatus = status;
        break;
    }
  }
  UploadedResume: boolean=false;

    onResumeFileSelected(event: any): void {
      this.UploadedResume=true;
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
        };
      }
    }
    


  Onsubmit(): void {
    this.isForm1Submitted = true;
    if (this.SemesterExchangeRegistration.invalid) {
      // Mark all controls as touched to display validation messages
      this.SemesterExchangeRegistration.markAllAsTouched();
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
      });
      return;
    }

    this.isLoading = true;
    const minLoadingTime = 2500; // 2.5 seconds
    const startTime = Date.now();
    const formData = new FormData();
    const formValue = this.SemesterExchangeRegistration.value;

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

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
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

  onRelativeDetailsChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const emailControl = this.SemesterExchangeRegistration.get('EmailId');
    const relativeNameControl = this.SemesterExchangeRegistration.get('RelativeName');
    const relativeRelationControl = this.SemesterExchangeRegistration.get('RelativeRelation');
    const relativeCountryControl = this.SemesterExchangeRegistration.get('RelativeCountryName');

    if (selectedValue === 'No') {
      emailControl?.clearValidators();
      relativeNameControl?.clearValidators();
      relativeRelationControl?.clearValidators();
      relativeCountryControl?.clearValidators();

      emailControl?.patchValue('NA');
      relativeNameControl?.patchValue('NA');
      relativeRelationControl?.patchValue('NA');
      relativeCountryControl?.patchValue('NA');
    } else {
      emailControl?.setValidators([Validators.required, Validators.email]);
      relativeNameControl?.setValidators([Validators.required]);
      relativeRelationControl?.setValidators([Validators.required]);
      relativeCountryControl?.setValidators([Validators.required]);

      // Clear 'NA' values if 'Yes' is selected
      if (emailControl?.value === 'NA') emailControl?.patchValue('');
      if (relativeNameControl?.value === 'NA') relativeNameControl?.patchValue('');
      if (relativeRelationControl?.value === 'NA') relativeRelationControl?.patchValue('');
      if (relativeCountryControl?.value === 'NA') relativeCountryControl?.patchValue('');
    }
    emailControl?.updateValueAndValidity();
    relativeNameControl?.updateValueAndValidity();
    relativeRelationControl?.updateValueAndValidity();
    relativeCountryControl?.updateValueAndValidity();
  }
// added on 1-oct-25
  DownloadFormat(): void {
    const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
    const link = document.createElement('a');
    
    link.href = fileUrl;
    link.download = fileUrl;
    link.click();
  }
}



// import { Component, OnInit } from '@angular/core';
// import { countries } from './countries-list';
// import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
// import { Router } from '@angular/router';
// // Import necessary RxJS operators
// import { catchError, finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import swal from 'sweetalert2'; // Use swal/SweetAlert2 for alerts

// // --- MOCK INTERFACES (Replace with your actual response interfaces) ---

// interface Country {
//   name: string;
//   code: string;
// }

// interface StudentBasicDetails {
//   studentName: string;
//   registerationNumber: string;
//   studentMobile: string;
//   courseName: string;
//   cgpa: string;
//   cgpA1: string;
//   currentYear: number;
//   currentTerm: number;
//   courseTotalDuration: number;
//   courseTotalTerms: number;
//   studentStatus: string;
//   studentEmail: string;
//   // OfficialCode (ProgramCode) might come from this or Marks API
// }

// interface StudentMarksDetails {
//   officialCode: string; // ProgramCode
//   section: string;
//   schoolId: number;
//   grade?: string;
//   gradeNum?: string;
// }

// interface ApplicationDetails {
//   applicationId: number;
//   isRejected: boolean | null;
//   countryCode: string;
//   whatsAppNo: string;
//   emailId: string;
//   universityOption1: string;
//   universityOption2: string;
//   universityOption3: string;
// }

// interface University {
//   universityName: string;
// }

// // NOTE: Assume 'SemesterExchangeStuDetailsService' and 'countriesList' exist and are provided via the environment.

// // -------------------------------------------------------------------

// @Component({
//   selector: 'StudentForm',
//   templateUrl: './NewStudentForm.component.html',
//   styleUrls: ['./StudentForm.component.scss'],
//   // Inject your services here (ServicesSM is SemesterExchangeStuDetailsService)
//   // providers: [SemesterExchangeStuDetailsService] 
// })
// export class StudentFormComponent implements OnInit {
  
//   // --- Component State and Dynamic Data ---
//   isLoading: boolean = true; // Controls full page loader
//   loginFailed: boolean = false;
//   eligible: boolean = false; 

//   // Student Details (Dynamically fetched)
//   studentName: string = '';
//   RegistrationNo: string = ''; // Key identifier
//   courseName: string = '';
//   cgpa: string = '';
//   ProgramCode: string = ''; // officialCode
//   SectionCode: string = '';
//   CurrentTerm: number = 0;
//   CourseTotalTerms: number = 0;
//   GradeFcount: number = 0;
//   EmailId: string = ' ';
  
//   // Dropdown Data (Dynamically fetched)
//   // countriesList: Country[] = []; // Fetched via API, mocked here for interfaces
//   countriesList: any = countries;
//   uniData: University[] = [];
//   allProgramCode: any[] = [];
  
//   // Form State
//   currentStep: number = 1;
//   totalSteps: number = 4; 
//   PassportStatus: 'Yes' | 'No' | 'Applied' = 'No';
//   IsSelfFunded: 'Parent' | 'Relative' | 'Other' | '' = 'Parent';
//   showPolicy: boolean = false;
//   SemesterExchangeRegistration!: FormGroup;
//   isFormSubmitted: boolean = false;

//   // Mock Service Instance (Replace with actual Angular Dependency Injection)
//   // private ServicesSM: SemesterExchangeStuDetailsService; 

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     // Replace the following mock structure with your actual injected service
//     private ServicesSM:  SemesterExchangeStuDetailsService,
//   ) { 
//     // Mocking for countriesList (In a real app, this should also be fetched via API)
//     this.countriesList =countries;
//   }

//   ngOnInit(): void {
//     // Start the consolidated data loading process on initialization
//     this.loadInitialData();
//   }

//   // Helper to get form controls easily (f['controlName'])
//   get f() { return this.SemesterExchangeRegistration.controls; }

//   // -------------------------------------------------------------------
//   // --- RXJS REFACTORING FOR DATA FETCHING (Replaces getStudentDetail, GetStudentMarksDetails, getApplicationDetails) ---
//   // -------------------------------------------------------------------

//   private LoginFailed(err: any): void {
//     console.error('API Error:', err);
//     // You can use the swal from the original code here if needed
//     // swal.fire({ title: 'Error', text: 'An error occurred during login/data retrieval.', icon: 'error' });
//   }

//   loadInitialData(): void {
//     this.isLoading = true;
//     this.loginFailed = false;

//     // 1. Fetch Student Basic Details
//     this.ServicesSM.getStudentById().pipe(
//       // 1a. Map basic student data and check for empty response
//       tap(response => {
//         if (response.item1.length === 0) {
//           throw new Error('No student data found.');
//         }
//         const stuData: StudentBasicDetails = response.item1[0];
        
//         this.studentName = stuData.studentName;
//         this.RegistrationNo = stuData.registerationNumber;
//         this.courseName = stuData.courseName;
//         this.cgpa = stuData.cgpa;
//         this.CurrentTerm = stuData.currentTerm;
//         this.CourseTotalTerms = stuData.courseTotalTerms;
        
//         // Handle Email logic (kept from original code)
//         const studentEmail = stuData.studentEmail;
//         this.EmailId = (studentEmail && studentEmail.length >= 5) ? studentEmail : ' ';
//       }),

//       // 2. Chain to fetch Student Marks Details (uses RegistrationNo set in step 1)
//       switchMap(() => this.getStudentMarksAndEligibility(this.RegistrationNo)),

//       // 3. Chain to check for existing application and handle redirection
//       switchMap((eligibilityResult) => this.checkExistingApplication(this.RegistrationNo, eligibilityResult)),
      
//       // Handle all errors from any step
//       catchError(error => {
//         if (error.message === 'No student data found.') {
//           this.loginFailed = true;
//         } else if (error.message === 'Application exists.') {
//           // This is a success condition wrapped in an error for flow control, handled in the subscription
//         } else {
//           this.LoginFailed(error);
//         }
//         return of(null); // Return observable of null to complete gracefully
//       }),

//       // 4. Ensure loading state is reset with a delay
//       finalize(() => {
//         // Delay hiding the loader for 2.5 seconds as requested in original code
//         setTimeout(() => {
//           this.isLoading = false;
//         }, 2500); 
//       })

//     ).subscribe({
//       next: (result) => {
//         // If execution reaches here, no application exists and eligibility is determined
//         if (this.eligible) {
//           this.initForm(); // Initialize form only if eligible
//           this.getUniversityDetails(); // Load supporting lists
//         }
//       },
//       error: (error) => {
//         // Catch errors not handled by catchError, especially the redirection one
//         if (error.message === 'Application exists.') {
//           // Handle successful redirection case here (as per original logic using swal)
//           swal.fire({
//             title: 'Application already Exists',
//             text: 'You will be redirected to the dashboard.',
//             icon: 'success',
//             showConfirmButton: false,
//             timer: 5000 
//           }).then(() => {
//             // NOTE: Replace 'LoginName' with your actual stored user identifier
//             this.router.navigate(['StudentDashboard', 'LoginNamePlaceholder', this.RegistrationNo]);
//           });
//         }
//       }
//     });
//   }

//   /**
//    * Fetches marks, calculates F grades, sets ProgramCode, and determines eligibility.
//    */
//   private getStudentMarksAndEligibility(Regdno: string): Observable<boolean> {
//     return this.ServicesSM.getStudentDetailsWithMarks(Regdno).pipe(
//       tap(response => {
//         const StudentDetailsWithMarks: StudentMarksDetails[] = response.item1;
        
//         if (StudentDetailsWithMarks.length > 0) {
//           const firstDetail = StudentDetailsWithMarks[0];
//           this.ProgramCode = firstDetail.officialCode;
//           this.SectionCode = firstDetail.section;
//           // ... map SchoolId here if needed

//           // Logic to calculate F grades
//           let fCount = 0;
//           for (const item of StudentDetailsWithMarks) {
//             const gradeStr = item.grade?.toUpperCase();
//             const gradeNum = parseInt(item.gradeNum as string, 10);

//             // If grade is F or gradeNum ≤ 6 (kept from original logic)
//             if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
//               fCount++;
//             }
//           }
//           this.GradeFcount = fCount;
          
//           // Set eligibility: Less than 1 F grade AND current term is within limits (kept from original eligibility logic)
//           this.eligible = true;//(this.GradeFcount < 1) && (this.CurrentTerm > 0 && this.CurrentTerm < this.CourseTotalTerms); 

//         } else {
//           this.eligible = false;
//         }
//       }),
//       switchMap(() => of(this.eligible)), // Pass eligibility status down the chain
//       catchError(err => {
//         this.eligible = false;
//         console.error('Failed to fetch student marks:', err);
//         return of(false);
//       })
//     );
//   }

//   /**
//    * Checks for an existing application and throws an error if found to redirect.
//    */
//   private checkExistingApplication(regId: string, isEligible: boolean): Observable<boolean> {
//     if (!isEligible) {
//         // If not eligible, no need to check for existing application, but allow the chain to complete
//         return of(false);
//     }
    
//     return this.ServicesSM.getApplicationDetailsBYId(regId).pipe(
//       tap(response => {
//         if (response.item1.length > 0) {
//           const stuApplication: ApplicationDetails = response.item1[0];
          
//           // If application exists (ID > 0), trigger redirection logic
//           if (stuApplication.applicationId > 0) {
//             // Throwing an error here is an established RxJS pattern to break the pipe and handle the 'success-redirection' case in the main subscribe/error block.
//             throw new Error('Application exists.'); 
//           }
//         }
//       }),
//       switchMap(() => of(false)), // If no application found, proceed
//       catchError(err => {
//         // Pass the specific redirection error up the chain
//         if (err.message === 'Application exists.') {
//           throw err; 
//         }
//         // If other API errors occur, log and assume no existing application
//         console.error('Application status check failed:', err);
//         return of(false);
//       })
//     );
//   }

//   /**
//    * Fetches independent lists using forkJoin for parallel loading.
//    */
//   getUniversityDetails(): void {
//     // 1. Fetch University List (depends on ProgramCode, which is now set)
//     const uniList$ = this.ServicesSM.getUniversityLists(this.ProgramCode).pipe(
//       tap(response => {
//         this.uniData = response.item1;
//       }),
//       catchError(err => { console.error('Uni list failed:', err); return of(null); })
//     );

//     // 2. Fetch All Program Codes List
//     const programCodes$ = this.ServicesSM.FetchAllProgramCodesList().pipe(
//       tap(response => {
//         this.allProgramCode = response.item1;
//       }),
//       catchError(err => { console.error('Program code list failed:', err); return of(null); })
//     );

//     // Combine both API calls
//     forkJoin([uniList$, programCodes$]).subscribe();
//   }
  
//   // -------------------------------------------------------------------
//   // --- FORM INITIALIZATION AND VALIDATION (As previously refactored) ---
//   // -------------------------------------------------------------------

//   initForm(): void {
//     this.SemesterExchangeRegistration = this.fb.group({
//       // === STEP 1: Contact & Relative ===
//       CountryName: ['', Validators.required],
//       WhatsAppNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//       PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//       // ParentContact requires custom validation to be distinct
//       ParentContact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), this.distinctNumbersValidator()]],
//       HasRelativeDetails: ['No', Validators.required],
//       // #2: Relative Email & Phone are NOT required
//       RelativeName: [''], RelativeCountryName: [''], RelativeRelation: [''],
//       EmailId: [this.EmailId], RelativePhone: [''], // Default EmailId from student details

//       // === STEP 2: University Preferences ===
//       ApplyingOption: ['', Validators.required],
//       UniversityOption1: ['', Validators.required],
//       UniversityOption2: ['', Validators.required],
//       UniversityOption3: ['', Validators.required],
//       RegistrationNo: [this.RegistrationNo],

//       // === STEP 3: Passport & Visa ===
//       PassportStatus: ['No', Validators.required],
//       PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''], PassportDocumentPath: [''],
//       IsVisaRejected: ['No', Validators.required],
//       VisaRejectedReason: [''], VisaRejectedCountry: [''],

//       // === STEP 4: English Proficiency & Sponsor & Documents & Declaration ===
//       EnglishTestType: ['', Validators.required],
//       testDate: [''], ListeningScore: [''], ReadingScore: [''], WritingScore: [''], SpeakingScore: [''],
//       OverallScore: [''], EnglishTestYear: [''], EnglishProofDocumentPath: [''],

//       // Sponsor
//       IsSelfFunded: ['Parent', Validators.required],
//       AvailableFunds: ['', Validators.required],
//       SponsorName: [''], SponsorRelation: [''],

//       // Documents & Declaration
//       FeesProofDocumentPath: [''],
//       ResumeDocumentPath: ['', Validators.required], // #4: Resume is REQUIRED
//       ConsentLetterDocumentPath: ['', Validators.required],
//       AcceptPolicy: [false, Validators.requiredTrue]
//     });
//     this.setupConditionalValidation();
//   }

//   distinctNumbersValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//       const form = control.parent;
//       if (!form) return null;

//       const whatsapp = form.get('WhatsAppNo')?.value;
//       const phone = form.get('PhoneNumber')?.value;
//       const parentContact = control.value;

//       if (whatsapp && phone && parentContact && (whatsapp === parentContact || phone === parentContact)) {
//         return { numbersMustBeDistinct: true };
//       }
//       return null;
//     };
//   }
  
//   setupConditionalValidation(): void {
//     // #3: English Proficiency Test Logic
//     this.f['EnglishTestType'].valueChanges.subscribe(value => {
//       const dateControl = this.f['testDate'];
//       const scoreControls = ['ListeningScore', 'ReadingScore', 'WritingScore', 'SpeakingScore', 'OverallScore', 'EnglishTestYear'];
      
//       const isTestGiven = ['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(value);
//       const isTestAppliedOrAppeared = ['Applied', 'Appeared'].includes(value);

//       // 1. Test Date: Required if Applied or Appeared
//       dateControl.setValidators(isTestAppliedOrAppeared ? Validators.required : null);
//       dateControl.updateValueAndValidity();

//       // 2. Scores: Required if PTE, IELTS, DULINGO, TOFEL
//       scoreControls.forEach(key => {
//         const control = this.f[key];
//         control.setValidators(isTestGiven ? Validators.required : null);
//         control.updateValueAndValidity();
//       });
//     });

//     // Passport Logic: Required fields if status is 'Yes'
//     this.f['PassportStatus'].valueChanges.subscribe(value => {
//       const isYes = value === 'Yes';
//       const passportFields = ['PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'];
//       passportFields.forEach(key => {
//         this.f[key].setValidators(isYes ? Validators.required : null);
//         this.f[key].updateValueAndValidity();
//       });
//     });

//     // Visa Rejection Logic: Required fields if rejected
//     this.f['IsVisaRejected'].valueChanges.subscribe(value => {
//       const isYes = value === 'Yes';
//       const visaFields = ['VisaRejectedReason', 'VisaRejectedCountry'];
//       visaFields.forEach(key => {
//         this.f[key].setValidators(isYes ? Validators.required : null);
//         this.f[key].updateValueAndValidity();
//       });
//     });

//     // Sponsor Logic: Required fields if type is 'Other'
//     this.f['IsSelfFunded'].valueChanges.subscribe(value => {
//       const isOther = value === 'Other';
//       const sponsorFields = ['SponsorName', 'SponsorRelation'];
//       sponsorFields.forEach(key => {
//         this.f[key].setValidators(isOther ? Validators.required : null);
//         this.f[key].updateValueAndValidity();
//       });
//     });
//   }


//   // -------------------------------------------------------------------
//   // --- WIZARD NAVIGATION & SUBMISSION ---
//   // -------------------------------------------------------------------

//   getStepControls(step: number): string[] {
//     // List of required controls for each step, including conditional ones.
//     switch (step) {
//       case 1:
//         return ['CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 'HasRelativeDetails'];
//       case 2:
//         return ['ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'];
//       case 3:
//         let controls3 = ['PassportStatus', 'IsVisaRejected'];
//         if (this.f['PassportStatus'].value === 'Yes') { controls3.push('PassportNumber', 'PassportIssueDate', 'PassportValidUpto', 'PassportDocumentPath'); }
//         if (this.f['IsVisaRejected'].value === 'Yes') { controls3.push('VisaRejectedReason', 'VisaRejectedCountry'); }
//         return controls3;
//       case 4:
//         let controls4 = ['EnglishTestType', 'IsSelfFunded', 'AvailableFunds', 'ResumeDocumentPath', 'ConsentLetterDocumentPath', 'AcceptPolicy'];
//         const testType = this.f['EnglishTestType'].value;
//         if (['Applied', 'Appeared'].includes(testType)) { controls4.push('testDate'); }
//         if (['PTE', 'DULINGO', 'IELTS', 'TOFEL'].includes(testType)) { controls4.push('ListeningScore', 'ReadingScore', 'WritingScore', 'SpeakingScore', 'OverallScore', 'EnglishTestYear'); }
//         if (this.f['IsSelfFunded'].value === 'Other') { controls4.push('SponsorName', 'SponsorRelation'); }
//         return controls4;
//       default: return [];
//     }
//   }

//   isStepValid(step: number): boolean {
//     const controls = this.getStepControls(step);
//     for (const key of controls) {
//       if (this.f[key].invalid) { return false; }
//     }
//     return true;
//   }

//   markStepControlsAsTouched(step: number): void {
//     const controls = this.getStepControls(step);
//     controls.forEach(key => {
//       this.f[key].markAsTouched();
//     });
//   }

//   nextStep(): void {
//     this.markStepControlsAsTouched(this.currentStep);
//     if (this.isStepValid(this.currentStep)) {
//       this.currentStep++;
//       window.scrollTo(0, 0);
//     }
//   }

//   prevStep(): void {
//     if (this.currentStep > 1) {
//       this.currentStep--;
//       window.scrollTo(0, 0);
//     }
//   }

//   onFileSelected(event: any, fieldName: string): void {
//     if (event.target.files.length > 0) {
//       // For demonstration, we just store the filename for validation
//       this.f[fieldName].setValue(event.target.files[0].name); 
//       this.f[fieldName].markAsDirty();
//       this.f[fieldName].updateValueAndValidity();
//     }
//   }

//   DownloadFormat(): void {
//     const fileUrl = `assets/SemesterExchange/SE-Consent-Letter.pdf`;
//     const link = document.createElement('a');
//     link.href = fileUrl;
//     link.download = 'SE-Consent-Letter.pdf';
//     link.click();
//   }

//   togglePolicy(event: Event): void {
//     event.preventDefault();
//     this.showPolicy = !this.showPolicy;
//   }

//   Onsubmit(): void {
//     this.isFormSubmitted = true;
//     this.markStepControlsAsTouched(this.currentStep);

//     if (this.SemesterExchangeRegistration.valid) {
//       this.isLoading = true;
//       console.log('Final Form Data:', this.SemesterExchangeRegistration.value);
//       // Actual API call to save the data (e.g., this.ServicesSM.saveApplication(this.SemesterExchangeRegistration.value).subscribe(...))
//       setTimeout(() => {
//         this.isLoading = false;
//         swal.fire('Success', 'Application Submitted Successfully!', 'success');
//       }, 2000);
//     } else {
//       console.log('Form is invalid. Review errors.');
//       // Navigate to the first invalid step
//       for (let i = 1; i <= this.totalSteps; i++) {
//         if (!this.isStepValid(i)) {
//           this.currentStep = i;
//           break;
//         }
//       }
//       window.scrollTo(0, 0);
//       swal.fire('Validation Error', 'Please correct the errors in the form before submitting.', 'error');
//     }
//   }
// }

// import { Component, OnInit, TemplateRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
// import { Title } from '@angular/platform-browser';
// import { ActivatedRoute } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { DataTable } from 'simple-datatables';
// import { AuthService } from 'src/app/_services/auth.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';

// import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
// import swal from 'sweetalert2';
// import { Router } from '@angular/router';
// import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import Swal from 'sweetalert2';
// import { finalize } from 'rxjs';
// import { countries } from '../countries-list';
// import { SemesterExchangeFormComponent } from '../../pages/SemesterExchangeForm/SemesterExchangeForm.component';


// @Component({
//   selector: 'StudentForm',
//   templateUrl: './StudentForm.component.html',
//   styleUrls: ['./StudentForm.component.scss'],
// })
// export class StudentFormComponent implements OnInit {

//   countries = countries;

//   EnglishTestType: any = ''; IsSelfFunded: any = ''; IsVisaRejected: any = ''; FeesProofDocumentPath: any = ''; ResumeDocumentPath: any = ''; ConsentLetterDocumentPath: any = '';
//   PassportDocumentPath: any = '';
//   NewExchangeRegistration(arg0: any) { throw new Error('Method not implemented.'); }


//   SemesterExchangeRegistration!: FormGroup; isForm1Submitted: boolean = false; isSubmitted = false;
//   isLoading: boolean = false;
//   get form1() {
//     return this.SemesterExchangeRegistration.controls;
//   }

//   showPolicy = false;
//   feeReceiptFile: File | null = null;
//   cvResumeFile: File | null = null;
//   consentLetterFile: File | null = null;


//   togglePolicy(event: MouseEvent): void {
//     event.preventDefault(); // prevent page scroll
//     this.showPolicy = !this.showPolicy;
//   }


//   showTable: boolean = true; PhoneNumber: any; parentContact: any;
//   ApplyingOption: any = '';
//     folderUrl: string; serverUrl: string; serverUrlX: string;  
//   documentForm: FormGroup; loginFailed: boolean = false;
//   checkListUploadedDocs: any; stuData: any; uniData: any; university: any; stuApplication: any; RegistrationNo: any;
//   ApplicationId: any; ApplicationStatus: any; ContactNo: string; stuWhatsNo: string; EmailId: string;
//   CountryCode: string; UniversityOption1: string = ''; UniversityOption2: string = ''; UniversityOption3: string = '';
//   UniversityOption4: string; courseName: any; studentName: any; cgpa: any; CurrentYear: any; CurrentTerm: any; CourseTotalDuration: any; CourseTotalTerms: any; StudentStatus: any; WhatsAppNo: any;
//   uploadedDocList: any[] = []; feesReceipt: string; DocumentName: any; DocumentPath: any; CreatedBy: string; FeesFile: any;
//   ApplicationFile: any; ResumeFile: any; PhotoFile: any; PassportFile: any; FeesDocs: any; fileName: string;
//   cgpa1: any; studentEmailId: any; LoginName: any; Elgible: boolean = false; FeesPaidStatus: string = 'Pending ';
//   isDisabled: any = 'true';
//   // showPolicy: boolean = false;

//   // Inside your component class (e.g., ApplicationFormComponent)
//   englishProficiency: string = '';
//   listeningScore!: number;
//   speakingScore!: number;
//   readingScore!: number;
//   writingScore!: number;
//   overallScore!: number;
//   testYear!: number;
//   testDate!: string;

//   AvailableFunds: string = '';
//   sponsorType: string = '';
//   otherSponsorName: string = '';
//   otherSponsorRelation: string = '';
//   otherSponsorAmount: string = '';
//   ColumnMode = ColumnMode; columns: any;
//   loadingIndicator: boolean;

//   constructor(
//     private AuthServicess: AuthService,
//     private StorageServicess: StorageService,
//     private ServicesSM: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private modalService: NgbModal,
//     public formBuilder: UntypedFormBuilder, private fb: FormBuilder,
//     private router: Router, private title: Title) { }
//   ngOnInit(): void {
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span>Registration';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     this.title.setTitle("Semester Exchange Registration");
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     if (this.LoginName != '' && this.LoginName != undefined) {
//       this.getToken(this.LoginName);
//     }
//     // this.initForm();
//     this.LoadNewForm();
//   }



//   getToken(id: any) {
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
 
//   distinctNumberValidator(otherControl1: string, otherControl2: string) {
//     return (control: AbstractControl): ValidationErrors | null => {
//       if (!this.SemesterExchangeRegistration) {
//         return null;
//       }
  
//       const currentValue = control.value;
//       const otherValue1 = this.SemesterExchangeRegistration.get(otherControl1)?.value;
//       const otherValue2 = this.SemesterExchangeRegistration.get(otherControl2)?.value;
  
//       if (currentValue && 
//          ((otherValue1 && currentValue === otherValue1) || 
//           (otherValue2 && currentValue === otherValue2))) {
//         return { numbersMustBeDistinct: true };
//       }
  
//       return null;
//     };
//   }
  
  
//   LoadNewForm() {
//     this.SemesterExchangeRegistration = this.fb.group({
//       RegistrationNo: [''],
//       CountryName: ['', Validators.required],
//       WhatsAppNo: ['', [
//         Validators.required,
//         Validators.pattern('^[0-9]{10,15}$'),
//         this.distinctNumberValidator('PhoneNumber', 'ParentContact')
//       ]],
//       PhoneNumber: ['', [
//         Validators.required,
//         Validators.pattern('^[0-9]{10,15}$'),
//         this.distinctNumberValidator('WhatsAppNo', 'ParentContact')
//       ]],
//       ParentContact: ['', [
//         Validators.required,
//         Validators.pattern('^[0-9]{10,15}$'),
//         this.distinctNumberValidator('WhatsAppNo', 'PhoneNumber')
//       ]],
//       // Relative Details Section
//       HasRelativeDetails: ['', Validators.required],
//       EmailId: ['', [Validators.required, Validators.email]],
//       RelativeName: ['', Validators.required],
//       RelativeRelation: ['', Validators.required],
//       RelativeCountryName: ['', Validators.required],
  
//       // University Preferences
//       ApplyingOption: ['', Validators.required],
//       UniversityOption1: ['', Validators.required],
//       UniversityOption2: ['', Validators.required],
//       UniversityOption3: ['', Validators.required],
  
//       // Passport Details
//       PassportStatus: ['', Validators.required],
//       PassportNumber: [''],
//       PassportIssueDate: [''],
//       PassportValidUpto: [''],
//       PassportDocumentPath: [''],
  
//       // Visa Information
//       IsVisaRejected: ['', Validators.required],
//       VisaRejectedReason: [''],
//       VisaRejectedCountry: [''],
  
//       // English Details  
//       EnglishTestType: ['', Validators.required],
//       ListeningScore: [''],
//       SpeakingScore: [''],
//       ReadingScore: [''],
//       WritingScore: [''],
//       OverallScore: [''],
//       EnglishTestYear: [''],
//       testDate: [''], // Added for English test date
  
//       // Sponsor Information
//       IsSelfFunded: ['', Validators.required],
//       SponsorName: [''],
//       SponsorRelation: [''],
//       AvailableFunds: ['', Validators.required],
  
//       // Legal Policy
//       AcceptPolicy: [false, Validators.requiredTrue],
  
//       // Documents
//       FeesProofDocumentPath: [''],
//       ResumeDocumentPath: [''],
//       ConsentLetterDocumentPath: ['']
//     });
//   }
  
//   getStudentDetail(): void {
//     this.isLoading = true;
//     this.ServicesSM.getStudentById().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.stuData = response.item1[0];
         
//           this.loginFailed = false;
//           this.studentName = this.stuData.studentName;
//           this.RegistrationNo = this.stuData.registerationNumber;
//           this.ContactNo = this.stuData.studentMobile;
//           this.courseName = this.stuData.courseName;
//           this.cgpa = this.stuData.cgpa;
//           this.cgpa1 = this.stuData.cgpA1;
//           this.CurrentYear = this.stuData.currentYear;
//           this.CurrentTerm = this.stuData.currentTerm;
//           this.CourseTotalDuration = this.stuData.courseTotalDuration;
//           this.CourseTotalTerms = this.stuData.courseTotalTerms;
//           this.StudentStatus = this.stuData.studentStatus;
//           this.studentEmailId = this.stuData.studentEmail.length < 5 ? 'N/A' : this.stuData.studentEmail;
//           this.EmailId = this.studentEmailId != 'N/A' ? this.studentEmailId : ' ';
//           this.GetStudentMarksDetails(this.RegistrationNo);
//           this.getApplicationDetails(this.RegistrationNo);
//           this.getUniversityDetails();

//           if (this.CurrentTerm > 1 && this.CurrentTerm < this.CourseTotalTerms || this.GradeFcount==0) {
//             this.Elgible = true; 
           
//           }
//           else {
//             this.Elgible = false;
//           }

         
//           // this.processCgpaSemesters(this.stuData);
         
//         }
//         else {
//           this.stuData = [];
//           this.loginFailed = true;
//         }
//          // Delay hiding the loader for 2.5 seconds
//          setTimeout(() => {
//           this.isLoading = false;
//         }, 2500);
//       },
//       error: err => {
//         setTimeout(() => {
//           this.isLoading = false;
//         }, 2500);
//         this.LoginFailed(err);
//         // this.loginFailed = true;
//       }
//     });
//   }

//   getApplicationDetails(regId: string): void {
//     this.ServicesSM.getApplicationDetailsBYId(regId).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.stuApplication = response.item1[0];

//         if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected == null) {
//           this.ApplicationStatus = true;
//         } else if (this.stuApplication.applicationId > 0 && this.stuApplication.isRejected === true) {
//           this.ApplicationStatus = false;
//         }

//         this.CountryCode = this.stuApplication.countryCode;
//         this.stuWhatsNo = this.stuApplication.whatsAppNo;
//         this.EmailId = this.stuApplication.emailId;
//         this.ApplicationId = this.stuApplication.applicationId;
//         this.UniversityOption1 = this.stuApplication.universityOption1;
//         this.UniversityOption2 = this.stuApplication.universityOption2;
//         this.UniversityOption3 = this.stuApplication.universityOption3;
//         console.log("stuApplication" + JSON.stringify(this.stuApplication));
//         Swal.fire({
//           title: 'Application Verified',
//           text: 'Do you want to proceed to your Student Dashboard?',
//           icon: 'info',
//           showCancelButton: true,
//           confirmButtonText: 'Yes, Proceed',
//           cancelButtonText: 'No, Stay Here'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             this.router.navigate(['StudentDashboard', this.LoginName, this.RegistrationNo]);
//           }
//         });

//       }
//       else {
//         this.stuApplication = null;
//         this.ApplicationStatus = null;
//       }
//     });
//   }


//   getUniversityDetails(): void {
//     this.ServicesSM.getUniversityDetails().subscribe((response) => {
//       this.uniData = response.item1;
//       this.university = this.uniData;
//       // console.log(JSON.stringify(this.uniData))
//     });
//   }

//   processCgpaSemesters(data: any): void {
//     this.semesterCgpaList = [];
//     this.lowCgpaCount = 0;
//     this.eligible = true;

//     for (let i = 1; i <= 12; i++) {
//       const key = `cgpA${i}`;
//       const cgpa = data[key] !== null ? Number(data[key]) : null;

//       this.semesterCgpaList.push({ semester: i, cgpa });

//       if (cgpa !== null && cgpa < 6) {
//         this.lowCgpaCount++;
//         this.eligible = false;
//       }
//     }
//   }

//   ProgramCode: any;
//   GetStudentMarksDetails(Regdno: any) {
//     this.ServicesSM.getStudentDetailsWithMarks(Regdno).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.StudentDetailsWithMarks = response.item1;
//           console.log("Marks data " + JSON.stringify(this.StudentDetailsWithMarks))
//           // Exclude unwanted columns
//           this.ProgramCode= this.StudentDetailsWithMarks[0].officialCode;
//           const excludeKeys = [
//             "registerationNumber", "srno", "termId", "courseCode", "course", "credit", "grade",
//             "marksMax", "marksObtd", "status", "id", "isSummerTermGiven", "summerTermCourseCode",
//             "examCentreAddressID", "astricPrint", "examGroup", "gradeNum", "tgpa", "cgpa", "failCount",
//             "failCountStatus", "semester", "dsrnO", "eg", "camm", "camo", "ettmm", "ettmo",
//             "etpmm", "etpmo", "colCode", "sgpa"
//           ];
//           const allKeys = Object.keys(this.StudentDetailsWithMarks[0]);
//           this.columns = allKeys.filter(key => !excludeKeys.includes(key));

//           // Initialize counters and storage
//           this.GradeFcount = 0;
//           this.FGradesWithSemesterCourse = [];
//           const groupMap = new Map<string, { semester: string; course: string; count: number }>();

//           for (const item of this.StudentDetailsWithMarks) {
//             const gradeStr = item.grade?.toUpperCase();
//             const gradeNum = parseInt(item.gradeNum, 10);
           
//             // If grade is F or gradeNum ≤ 6
//             if (gradeStr === 'F' || (!isNaN(gradeNum) && gradeNum <= 6)) {
//               this.GradeFcount++;

//               // Store full semester-course entries (previous logic)
//               this.FGradesWithSemesterCourse.push({
//                 semester: item.semester,
//                 course: `${item.courseCode} :: ${item.course}`,
//                 grade: item.grade,
//                 gradeNum: item.gradeNum,
               
//               });

//               // Group by semester-course for count (new logic)
//               const key = `${item.semester}::${item.courseCode}::${item.course}`;
//               if (groupMap.has(key)) {
//                 groupMap.get(key)!.count += 1;
//               } else {
//                 groupMap.set(key, {
//                   semester: item.semester,
//                   course: `${item.courseCode} :: ${item.course}`,
//                   count: 1
//                 });
//               }
//             }
//           }

//           this.FGradeGroupedDetails = Array.from(groupMap.values());
//           alert(`F Grades: ${this.GradeFcount}, Program Code: ${this.ProgramCode}`);
//         } else {
//           this.StudentDetailsWithMarks = [];
//           this.GradeFcount = 0;
//           this.FGradeGroupedDetails = [];
//           this.FGradesWithSemesterCourse = [];
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

//   GetIdWiseUploadedDocumentList(Id: any, Doc: any): void {
//     this.ServicesSM.GetIdWiseUploadedDocumentList(Id, '').subscribe((response) => {
//       this.uploadedDocList = response.item1;
//       console.log(" Uploaded Doc " + JSON.stringify(this.uploadedDocList))
//       const document = this.uploadedDocList.find(doc => doc.documentName === 'Fees Paid' && doc.isAPproved === true);

//       // console.log("Docs " + JSON.stringify(document));
//       if (document) {
//         this.FeesPaidStatus = 'Received the Payment ';
//         console.log('No document found with DocumentName="Fees Paid" and isApproved=true.' + this.FeesPaidStatus);
//       } else {
//         this.FeesPaidStatus = 'Pending Payment ';
//         console.log('No document found with DocumentName="Fees Paid" and isApproved=true.' + this.FeesPaidStatus);
//       }


//     });
//   }

//   handleConditionalFields() {
//     this.documentForm.get('englishProficiency')?.valueChanges.subscribe(value => {
//       const showTestDetails = value === 'Yes';
//       const showApplied = value === 'Applied';

//       const testControls = ['listeningScore', 'speakingScore', 'readingScore', 'writingScore', 'overallScore', 'testYear'];
//       const appliedControls = ['testDate'];

//       testControls.forEach(control => {
//         const ctrl = this.documentForm.get(control);
//         if (ctrl) {
//           ctrl.clearValidators();
//           if (showTestDetails) {
//             ctrl.setValidators([Validators.required]);
//           }
//           ctrl.updateValueAndValidity();
//         }
//       });

//       const testDateCtrl = this.documentForm.get('testDate');
//       if (testDateCtrl) {
//         testDateCtrl.clearValidators();
//         if (showApplied) {
//           testDateCtrl.setValidators([Validators.required]);
//         }
//         testDateCtrl.updateValueAndValidity();
//       }
//     });

//     this.documentForm.get('sponsorType')?.valueChanges.subscribe(value => {
//       const otherSelected = value === 'Other';
//       const nameCtrl = this.documentForm.get('otherSponsorName');
//       const relationCtrl = this.documentForm.get('otherSponsorRelation');

//       if (nameCtrl && relationCtrl) {
//         nameCtrl.clearValidators();
//         relationCtrl.clearValidators();

//         if (otherSelected) {
//           nameCtrl.setValidators([Validators.required]);
//           relationCtrl.setValidators([Validators.required]);
//         }

//         nameCtrl.updateValueAndValidity();
//         relationCtrl.updateValueAndValidity();
//       }
//     });
//   }



//   PassportFileData: any=''; PassportFileStatus: boolean = false;
//   PassportFileName: any='';
//   onFileSelectedPassportFile(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       Swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }
//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.PassportFileData = modifiedFile;
//       this.PassportFileStatus = true;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.PassportFileData = ssssArray[1];
//         this.PassportFileName = validFileName;
//       };

//       return;
//     }

//     this.PassportFileData = file;
//     this.PassportFileStatus = true;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.PassportFileData = ssssArray[1];
//         this.PassportFileName = file.name;
//       };
//     }
//   }

//   ResumeFileData: any=''; ResumeFileStatus: boolean = false;
//   ResumeFileName: any='';
//   onFileSelectedResumeFile(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       Swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }
//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.ResumeFileData = modifiedFile;
//       this.ResumeFileStatus = true;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.ResumeFileData = ssssArray[1];
//         this.ResumeFileName = validFileName;
//       };

//       return;
//     }

//     this.ResumeFileData = file;
//     this.ResumeFileStatus = true;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.ResumeFileData = ssssArray[1];
//         this.ResumeFileName = file.name;
//       };
//     }
//   }

//   FeesProofData: any=''; FeesProofStatus: boolean = false;
//   FeesProofFileName: any='';
//   onFileSelectedFeesProof(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       Swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }
//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.FeesProofData = modifiedFile;
//       this.FeesProofStatus = true;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.FeesProofData = ssssArray[1];
//         this.FeesProofFileName = validFileName;
//       };

//       return;
//     }

//     this.FeesProofData = file;
//     this.FeesProofStatus = true;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.FeesProofData = ssssArray[1];
//         this.FeesProofFileName = file.name;
//       };
//     }
//   }


//   ConsentLetterData: any=''; ConsentLetterStatus: boolean = false;
//   ConsentLetterFileName: any='';
//   onFileSelectedConsentLetter(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       Swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }
//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.ConsentLetterData = modifiedFile;
//       this.ConsentLetterStatus = true;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.ConsentLetterData = ssssArray[1];
//         this.ConsentLetterFileName = validFileName;
//       };

//       return;
//     }

//     this.ConsentLetterData = file;
//     this.ConsentLetterStatus = true;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.ConsentLetterData = ssssArray[1];
//         this.ConsentLetterFileName = file.name;
//       };
//     }
//   }

//   Onsubmit(): void {
//     this.isForm1Submitted = true;
//     if (this.SemesterExchangeRegistration.invalid) return;
//     this.isLoading = true;
//     const minLoadingTime = 2500; // 2.5 seconds
//     const startTime = Date.now();
//     const formData = new FormData();
//     const formValue = this.SemesterExchangeRegistration.value;

//     // Append regular form fields with checks for 'NA'
//     formData.append("RegistrationNo", this.RegistrationNo || 'NA');
//     formData.append("EmailId", formValue.EmailId || 'NA');
//     formData.append("CountryName", formValue.CountryName || 'NA');
//     formData.append("WhatsAppNo", formValue.WhatsAppNo || 'NA');
//     formData.append("PhoneNumber", formValue.PhoneNumber || 'NA');
//     formData.append("ParentContact", formValue.ParentContact || 'NA');
//     formData.append("ApplyingOption", formValue.ApplyingOption || 'NA');
//     formData.append("UniversityOption1", formValue.UniversityOption1 || 'NA');
//     formData.append("UniversityOption2", formValue.UniversityOption2 || 'NA');
//     formData.append("UniversityOption3", formValue.UniversityOption3 || 'NA');
//     formData.append("PassportStatus", formValue.PassportStatus || 'NA');

//     if (this.PassportStatus === 'Yes') {
//         formData.append("PassportNumber", formValue.PassportNumber || 'NA');
//         formData.append("PassportIssueDate", formValue.PassportIssueDate || 'NA');
//         formData.append("PassportValidUpto", formValue.PassportValidUpto || 'NA');
//         formData.append("PassportDocumentPath", this.selectedPassportFile || 'NA');
//     } else {
//         formData.append("PassportNumber", 'NA');
//         formData.append("PassportIssueDate", 'NA');
//         formData.append("PassportValidUpto", 'NA');
//         formData.append("PassportDocumentPath", 'NA');
//     }

//     formData.append("IsVisaRejected", formValue.IsVisaRejected || 'NA');
//     if (this.IsVisaRejected === 'Yes') {
//         formData.append("VisaRejectedReason", formValue.VisaRejectedReason || 'NA');
//         formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry || 'NA');
//     } else {
//         formData.append("VisaRejectedReason", 'NA');
//         formData.append("VisaRejectedCountry", 'NA');
//     }

//     formData.append("EnglishTestType", formValue.EnglishTestType || 'NA');
//     if (['DULINGO', 'IELTS', 'TOFEL'].includes(formValue.EnglishTestType)) {
//         formData.append("SpeakingScore", formValue.SpeakingScore || 'NA');
//         formData.append("ListeningScore", formValue.ListeningScore || 'NA');
//         formData.append("ReadingScore", formValue.ReadingScore || 'NA');
//         formData.append("WritingScore", formValue.WritingScore || 'NA');
//         formData.append("OverallScore", formValue.OverallScore || 'NA');
//         formData.append("EnglishTestYear", formValue.EnglishTestYear || 'NA');
//     } else {
//         formData.append("SpeakingScore", 'NA');
//         formData.append("ListeningScore", 'NA');
//         formData.append("ReadingScore", 'NA');
//         formData.append("WritingScore", 'NA');
//         formData.append("OverallScore", 'NA');
//         formData.append("EnglishTestYear", 'NA');
//     }

//     formData.append("IsSelfFunded", formValue.IsSelfFunded || 'NA');
//     formData.append("SponsorEmail", 'NA');
//     formData.append("AvailableFunds", formValue.AvailableFunds || 'NA');
//     formData.append("TotalCountGradeF", this.GradeFcount || 'NA');

//     if (formValue.IsSelfFunded === 'Other') {
//         formData.append("SponsorName", formValue.SponsorName || 'NA');
//         formData.append("SponsorRelation", formValue.SponsorRelation || 'NA');
//         formData.append("SponsorContact", formValue.SponsorContact || 'NA');
//         formData.append("SponsorEmail", formValue.SponsorEmail || 'NA');
//     } else {
//         formData.append("SponsorName", 'NA');
//         formData.append("SponsorRelation", 'NA');
//         formData.append("SponsorContact", 'NA');
//     }

//     formData.append("AcceptPolicy", formValue.AcceptPolicy ? 'Yes' : 'No');
//     formData.append("ResumeFileName", this.ResumeFileName || 'NA');
//     formData.append("ResumeFileData", this.ResumeFileData || 'NA');
//     formData.append("ConsentLetterFileName", this.ConsentLetterFileName || 'NA');
//     formData.append("ConsentLetterData", this.ConsentLetterData || 'NA');
//     formData.append("FeesProofData", this.FeesProofData || 'NA');
//     formData.append("FeesProofFileName", this.FeesProofFileName || 'NA');
//     formData.append("PassportFileData", this.PassportFileData || 'NA');
//     formData.append("PassportFileName", this.PassportFileName || 'NA');

//     formData.append("RelativeCountryName", formValue.RelativeCountryName || 'NA');
//     formData.append("RelativeName", formValue.RelativeName || 'NA');
//     formData.append("AvailableFunds", formValue.AvailableFunds || 'NA');

//     this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
//       .pipe(
//         finalize(() => {
//           const elapsed = Date.now() - startTime;
//           const remaining = Math.max(minLoadingTime - elapsed, 0);
//           setTimeout(() => {
//             this.isLoading = false;
//           }, remaining);
//         })
//       )
//       .subscribe({
//         next: (data) => {
//           let errorCode = data[0].returnData;

//           if (errorCode > 0) {
//             Swal.fire({
//               title: 'Application Created Successfully',
//               text: "",
//               icon: 'success',
//             }).then(() => {
//               window.location.reload();
//             });
//           } else if (errorCode == -1) {
//             Swal.fire({ title: 'User  Already Exists', icon: 'error' }).then(() => {
//               window.location.reload();
//             });
//           } else {
//             Swal.fire({ title: 'Some Technical Issue', text: "", icon: 'error' }).then(() => {
//               window.location.reload();
//             });
//           }
//         },
//         error: () => {
//           Swal.fire({
//             title: 'Error Occurred',
//             text: 'Unable to complete the request. Please try again later.',
//             icon: 'error',
//           });
//         }
//       });
// }

//   // Onsubmit(): void {
//   //   this.isForm1Submitted = true;
//   //   if (this.SemesterExchangeRegistration.invalid) return;
//   //   this.isLoading = true;
//   //   const minLoadingTime = 2500; // 2.5 seconds
//   //   const startTime = Date.now();
//   //   const formData = new FormData();
//   //   const formValue = this.SemesterExchangeRegistration.value;

//   //   // const formValue = this.SemesterExchangeRegistration.getRawValue();

//   //   // Append regular form fields
//   //   formData.append("RegistrationNo", this.RegistrationNo);
//   //   formData.append("EmailId", formValue.EmailId);
//   //   formData.append("CountryName", formValue.CountryName);
//   //   formData.append("WhatsAppNo", formValue.WhatsAppNo);
//   //   formData.append("PhoneNumber", formValue.PhoneNumber);
//   //   formData.append("ParentContact", formValue.ParentContact);
//   //   formData.append("ApplyingOption", formValue.ApplyingOption);
//   //   formData.append("UniversityOption1", formValue.UniversityOption1);
//   //   formData.append("UniversityOption2", formValue.UniversityOption2);
//   //   formData.append("UniversityOption3", formValue.UniversityOption3);
//   //   formData.append("PassportStatus", formValue.PassportStatus);
//   //   if (this.PassportStatus == 'Yes') {
//   //     formData.append("PassportNumber", formValue.PassportNumber);
//   //     formData.append("PassportIssueDate", formValue.PassportIssueDate);
//   //     formData.append("PassportValidUpto", formValue.PassportValidUpto);
//   //     formData.append("PassportDocumentPath", this.selectedPassportFile);
//   //   }
//   //   else {
//   //     formData.append("PassportNumber", 'NA');
//   //     formData.append("PassportIssueDate", 'NA');
//   //     formData.append("PassportValidUpto", 'NA');
//   //     formData.append("PassportDocumentPath", 'NA');
//   //   }
//   //   formData.append("IsVisaRejected", formValue.IsVisaRejected);
//   //   if (this.IsVisaRejected == 'Yes') {
//   //     formData.append("VisaRejectedReason", formValue.VisaRejectedReason);
//   //     formData.append("VisaRejectedCountry", formValue.VisaRejectedCountry);
//   //   }
//   //   else {
//   //     formData.append("VisaRejectedReason", 'NA');
//   //     formData.append("VisaRejectedCountry", 'NA');
//   //   }
//   //   formData.append("EnglishTestType", formValue.EnglishTestType);
//   //   if (formValue.EnglishTestType == 'DULINGO' || formValue.EnglishTestType == 'DULINGO' || formValue.EnglishTestType == 'IELTS' ||formValue.EnglishTestType == 'TOFEL' ) {
//   //     formData.append("SpeakingScore", formValue.SpeakingScore);
//   //     formData.append("ListeningScore", formValue.ListeningScore);
//   //     formData.append("ReadingScore", formValue.ReadingScore);
//   //     formData.append("WritingScore", formValue.WritingScore);
//   //     formData.append("OverallScore", formValue.OverallScore);
//   //     formData.append("EnglishTestYear", formValue.EnglishTestYear);
//   //   }
//   //   else {
//   //     formData.append("SpeakingScore", 'NA');
//   //     formData.append("ListeningScore", 'NA');
//   //     formData.append("ReadingScore", 'NA');
//   //     formData.append("WritingScore", 'NA');
//   //     formData.append("OverallScore", 'NA');
//   //     formData.append("EnglishTestYear", 'NA');
//   //   }
//   //   formData.append("IsSelfFunded", formValue.IsSelfFunded);
//   //   formData.append("SponsorEmail", 'NA');
//   //   formData.append("AvailableFunds", formValue.AvailableFunds);
//   //   formData.append("TotalCountGradeF", this.GradeFcount);
//   //   if (formValue.IsSelfFunded == 'Other') {
//   //     formData.append("SponsorName", formValue.SponsorName);
//   //     formData.append("SponsorRelation", formValue.SponsorRelation);
//   //     formData.append("SponsorContact", formValue.SponsorContact);
//   //     formData.append("SponsorEmail", formValue.SponsorEmail);
//   //   }
//   //   else {
//   //     formData.append("SponsorName", 'NA');
//   //     formData.append("SponsorRelation", 'NA');
//   //     formData.append("SponsorContact", 'NA');
//   //   }
//   //   formData.append("AcceptPolicy", formValue.AcceptPolicy);
//   //   formData.append("ResumeFileName", this.ResumeFileName);
//   //   formData.append("ResumeFileData", this.ResumeFileData);
//   //   formData.append("ConsentLetterFileName", this.ConsentLetterFileName);
//   //   formData.append("ConsentLetterData", this.ConsentLetterData);
//   //   formData.append("FeesProofData", this.FeesProofData);
//   //   formData.append("FeesProofFileName", this.FeesProofFileName);
//   //   formData.append("PassportFileData", this.PassportFileData);
//   //   formData.append("PassportFileName", this.PassportFileName);

//   //   formData.append("RelativeCountryName", formValue.RelativeCountryName);
//   //   formData.append("RelativeName", formValue.RelativeName);
//   //   formData.append("AvailableFunds", formValue.AvailableFunds);

//   //   // console.log('Submitting Form Data:');
//   //   // formData.forEach((value, key) => {
//   //   //   console.log(key + ':', value);
//   //   // });
//   //   this.ServicesSM.SemesterExchangeNewRegistrationForm(formData)
//   //     .pipe(
//   //       finalize(() => {
//   //         const elapsed = Date.now() - startTime;
//   //         const remaining = Math.max(minLoadingTime - elapsed, 0);
//   //         setTimeout(() => {
//   //           this.isLoading = false;
//   //         }, remaining);
//   //       })
//   //     )
//   //     .subscribe({
//   //       next: (data) => {
//   //         // let result = data.item1[0]['msg'];
//   //         let errorCode = data[0].returnData;

//   //         if (errorCode > 0) {
//   //           Swal.fire({
//   //             title: 'Application Created Successfully',
//   //             text: "",
//   //             icon: 'success',
//   //           }).then(() => {
//   //             window.location.reload();
//   //           });
//   //         } else if (errorCode == -1) {
//   //           Swal.fire({ title: 'User Already Exists', icon: 'error' }).then(() => {
//   //             window.location.reload();
//   //           });
//   //         } else {
//   //           Swal.fire({ title: 'Some Technical Issue', text: "", icon: 'error' }).then(() => {
//   //             window.location.reload();
//   //           });
//   //         }
//   //       },
//   //       error: () => {
//   //         Swal.fire({
//   //           title: 'Error Occurred',
//   //           text: 'Unable to complete the request. Please try again later.',
//   //           icon: 'error',
//   //         });
//   //       }
//   //     });
//   // }


//   LoginFailed(_NewError: any) {
//     this.loginFailed = true;
//     swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are Invalid!',
//       icon: 'warning',
//     })
//     const element = document.getElementById('NewRegsiterPage');
//     if (element) {
//       element.hidden = true;
//     }
//   }

//   semesterCgpaList: { semester: number, cgpa: number | null }[] = [];
//   lowCgpaCount: number = 0;
//   eligible: boolean = true;


//   VisitUrl(Id: any, name: any, Sufix: any) {
//     this.router.navigateByUrl(Sufix + '/' + name + '/' + Id).then(() => {
//       // window.location.reload();
//     });
//   }

//   PassportStatus: string = '';
//   PassportNumber: string = '';
//   PassportIssueDate: string = '';
//   PassportValidUpto: string = '';
//   VisaRejected: string = '';
//   VisaRejectionReason: string = '';
//   VisaRejectionCountry: string = '';


//   headHtmlData: any;
//   StudentDetailsWithMarks: any = [];
//   GradeFcount: any = '';
//   FGradesWithSemesterCourse: { semester: string, course: string, grade: string, gradeNum: string }[] = [];
//   FGradeGroupedDetails: { semester: string, course: string, count: number }[] = [];

//   EnglishProficiency = '';
//   AvailableFund: number | null = null;
//   Budget: number | null = null;
//   AcceptPolicy = false;

//   // Dynamic English proficiency options (depends on some condition)
//   englishProficiencyOptions: string[] = [];

//   // Flags for Available Fund and Feed Receipt
//   isFundRequired = false;
//   feedReceiptRequired = true; // assume it's required, adjust as needed
//   feedReceiptMissing = true; // true if no file selected

//   // Flags for Available Fund and Feed Receipt
//   setEnglishProficiencyOptions() {
//     // Example logic, update based on your business rules
//     if (this.SomeCondition()) {
//       this.englishProficiencyOptions = ['IELTS', 'TOEFL', 'PTE'];
//     } else {
//       this.englishProficiencyOptions = ['Basic', 'Intermediate', 'Advanced'];
//     }
//   }

//   SomeCondition(): boolean {
//     // Replace with your condition (e.g., country selected, applying option)
//     return true;
//   }

//   onFeedReceiptChange(event: any) {
//     const file = event.target.files[0];
//     this.feedReceiptMissing = !file; // set flag based on whether a file is selected
//   }
//   applicationForm!: FormGroup;

//   isControlInvalid(controlName: string): boolean {
//     const control = this.applicationForm.get(controlName);
//     return !!(control && control.invalid && (control.dirty || control.touched));
//   }
//   selectedPassportFile: any = '';
//   onPassportFileSelected(event: Event) {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.selectedPassportFile = modifiedFile;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedPassportFile = ssssArray[1];
//         this.fileName = validFileName;
//       };
//       return;
//     }

//     this.selectedPassportFile = file;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedPassportFile = ssssArray[1];
//         this.fileName = file.name;
//         // alert(10);  

//       };
//     }
//   }
//   selectedFileConsentLetter: any = '';
//   onConsentLetterSelected(event: Event) {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.selectedFileConsentLetter = modifiedFile;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedFileConsentLetter = ssssArray[1];
//         this.fileName = validFileName;
//       };
//       return;
//     }

//     this.selectedFileConsentLetter = file;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedFileConsentLetter = ssssArray[1];
//         this.fileName = file.name;
//         // alert(10);  

//       };
//     }
//   }
//   selectedResumeDocumentFile: any = '';
//   onResumeDocumentFileSelected(event: Event) {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.selectedResumeDocumentFile = modifiedFile;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedResumeDocumentFile = ssssArray[1];
//         this.fileName = validFileName;
//       };
//       return;
//     }

//     this.selectedResumeDocumentFile = file;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedResumeDocumentFile = ssssArray[1];
//         this.fileName = file.name;
//         // alert(10);  

//       };
//     }
//   }
//   selectedFeesProofFile: any = '';

//   onFeesProofFileSelected(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;
//     if (file && file.size > 3148576) {
//       swal.fire({
//         title: 'File size exceeds 3MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.selectedFeesProofFile = modifiedFile;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedFeesProofFile = ssssArray[1];
//         this.fileName = validFileName;
//       };
//       return;
//     }

//     this.selectedFeesProofFile = file;
//     // alert(10);  
//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.selectedFeesProofFile = ssssArray[1];
//         this.fileName = file.name;
//         // alert(10);  

//       };
//     }
//   }
//   passportNumberValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const status = this.applicationForm.get('PassportStatus')?.value;
//       if (status === 'Yes' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   passportDateValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const status = this.applicationForm.get('PassportStatus')?.value;
//       if (status === 'Yes' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   visaRejectionReasonValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const rejected = this.applicationForm.get('VisaRejected')?.value;
//       if (rejected === 'Yes' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   visaRejectionCountryValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const rejected = this.applicationForm.get('VisaRejected')?.value;
//       if (rejected === 'Yes' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   englishScoreValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const prof = this.applicationForm.get('englishProficiency')?.value;
//       if (prof === 'Yes' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   englishTestDateValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const prof = this.applicationForm.get('englishProficiency')?.value;
//       if (prof === 'Applied' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   otherSponsorNameValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const sponsorType = this.applicationForm.get('sponsorType')?.value;
//       if (sponsorType === 'Other' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   otherSponsorRelationValidator(control: AbstractControl) {
//     if (this.applicationForm) {
//       const sponsorType = this.applicationForm.get('sponsorType')?.value;
//       if (sponsorType === 'Other' && !control.value) {
//         return { required: true };
//       }
//     }
//     return null;
//   }

//   onSubmit() {
//     if (this.applicationForm.invalid) {
//       this.applicationForm.markAllAsTouched();
//       alert('Please fill all required fields correctly.');
//       return;
//     }
//     // console.log('Form submitted', this.applicationForm.value);
//     alert('Application submitted successfully!');
//   }




//   onRelativeDetailsChange(event: Event) {
//     const selectedValue = (event.target as HTMLSelectElement).value;
//     if (selectedValue === 'No') {
//         this.SemesterExchangeRegistration.patchValue({
//             EmailId: 'NA',
//             RelativeName: 'NA',
//             RelativeCountryName: 'NA'
//         });
//     } else {
//         // Optionally clear the fields if "Yes" is selected
//         this.SemesterExchangeRegistration.patchValue({
//             EmailId: '',
//             RelativeName: '',
//             RelativeCountryName: ''
//         });
//     }
// }

// }
