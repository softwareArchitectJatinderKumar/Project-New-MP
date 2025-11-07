import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';
import { forkJoin } from 'rxjs'; 
import { relative } from 'path';

@Component({
  selector: 'app-StudentApplicationDetails',
  templateUrl: './StudentApplicationDetails.component.html',
  styleUrls: ['./StudentApplicationDetails.component.css']
})
export class StudentApplicationDetailsComponent implements OnInit {

  // State & Data Properties
  loadingIndicator: boolean = false; // Tracks main form loading
  imageLoading: boolean = false;    // Tracks image loading state
  studentForm!: FormGroup;
  LoginName: any;
  RegistrationNo: any;
  stuApplication: any;
  universityOptions: any[] = [];
  studentDetailsWithImage: any;
  StudentImage: string = '';
  serverUrl: string = '';
  IsLoginFailed: boolean = false;
  folderUrl: string = ''; 
  
  // Initial Form Structure (Simplified for read-only data storage)
  private initialFormControls = {
    applicationId: [''], registrationNo: [''], emailId: [''], countryName: [''], whatsAppNo: [''], phoneNumber: [''], parentContact: [''],
    applyingOption: [''], universityOption1: [''], universityOption2: [''], universityOption3: [''],
    passportStatus: [''], passportNumber: [''], passportIssueDate: [''], passportValidUpto: [''],
    isVisaRejected: [''], visaRejectedReason: [''], visaRejectedCountry: [''],
    englishTestType: [''], speakingScore: [''], listeningScore: [''], readingScore: [''], writingScore: [''], overallScore: [''], englishTestYear: [''],
    isSelfFunded: [''], sponsorName: [''], sponsorRelation: [''], sponsorContact: [''], sponsorEmail: [''],
    availableFunds: [''], acceptPolicy: [false],
    relativeName: [''], relativeRelation: [''], relativeCountry: [''],
  };
  
  // Display Sections: Structure for displaying data in the review UI
  formSections = [
    { label: 'Personal Details', keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
    { label: 'University Preferences', keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
    { label: 'Relative at Abroad', keys: ['relativeName', 'relativeRelation', 'relativeCountry'] },
    { label: 'Passport Details', keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
    { label: 'Visa Details', keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
    { label: 'English Test Details', keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
    { label: 'Sponsor Details', keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
    { label: 'Financial & Declaration', keys: ['availableFunds']}//, 'acceptPolicy'] }    
  ];
  
  // Document links for display
  documentUploads = [
    { key: 'resumeFileName', label: 'Resume Document' },
    { key: 'feesProofFileName', label: 'Fees Proof Document' },
    { key: 'consentLetterFileName', label: 'Consent Letter' },
    { key: 'passportFileName', label: 'Passport Document' },
    { key: 'englishTestDocumentPath', label: 'English Test Proof ' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    private studentService: SemesterExchangeStuDetailsService,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { 
    this.studentForm = this.fb.group(this.initialFormControls);
    this.studentForm.disable(); // Ensure the form is read-only
  }

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];
    this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
    // this.title.setTitle('Semester Exchange Student Dashboard');
    
    this.folderUrl = this.ServicesSM.getFolderUrl();
    this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
    
    if (this.LoginName) {
      this.getToken(this.LoginName);
    }

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Application Details</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  }

   DashboardVisit() {
    this.router.navigateByUrl('FacultyDashboard' + '/' + this.LoginName);
  }
  Visit(): void{
    this.router.navigateByUrl('FacultyDashboard')
  }
  // --- Core Data Loading Logic ---
get isReadyForPrint(): boolean {
    return !this.loadingIndicator && !this.imageLoading;
}
  getToken(loginName: string): void {
    this.loadingIndicator = true;
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.IsLoginFailed = true;
          this.LoginFailed('Invalid or expired token');
        } else {
          // Load University and Application Details simultaneously
          forkJoin([
              this.ServicesSM.getUniversityDetails(),
              this.studentService.getStudentDetailsBYId(this.RegistrationNo)
          ]).subscribe(([uniResponse, appResponse]) => {
              
              // 1. Process University Details
              this.universityOptions = uniResponse.item1.map((u: any) => ({
                universityId: u.universityId,
                universityName: u.universityName
              }));

              // 2. Process Application Details
              if (appResponse.item1.length > 0) {
                  this.stuApplication = appResponse.item1[0];
                  // console.log(JSON.stringify(this.stuApplication) + ' Application Details ')
                  this.studentForm.patchValue({
                      ...this.stuApplication,
                      // Ensure boolean conversion is correct for display
                      acceptPolicy: this.stuApplication.acceptPolicy === 'Yes' || this.stuApplication.acceptPolicy === true || this.stuApplication.acceptPolicy === 'yes', 
                      passportIssueDate: this.formatDateForInput(this.stuApplication.passportIssueDate),
                      passportValidUpto: this.formatDateForInput(this.stuApplication.passportValidUpto),
                  });
              } else {
                  this.LoginFailed("No application data found.");
              }
              
              // 3. Mark main application data loaded
              this.loadingIndicator = false; 
              
              // 4. Start image loading asynchronously
              this.getStuDetailsWithImage(this.RegistrationNo);
              this.FindGradeFCount(this.RegistrationNo);
              
          }, (error) => {
              this.LoginFailed("Error fetching core application data.");
              this.loadingIndicator = false;
          });
        }
      },
      error: err => {
        this.LoginFailed(err);
        this.loadingIndicator = false;
      }
    });
  }

  /**
   * Fetches image data and updates a separate loading state.
   */
  getStuDetailsWithImage(Regno: any): void {
    this.imageLoading = true;
    this.ServicesSM.GetStuDetailsWithImage(Regno).subscribe({
      next: (response) => {
        if (response.item1.length > 0) {
          this.studentDetailsWithImage = response.item1[0];
          // console.log(JSON.stringify(this.studentDetailsWithImage)+ 'image and student details ')
          this.StudentImage = this.convertImageData(this.studentDetailsWithImage.imageData);
        }
        this.imageLoading = false;
      },
      error: () => {
        this.imageLoading = false;
      }
    });
  }

   ProgramCode:any; SectionCode:any; SchoolId: any; GradeFcount: any; studentDetailsWithMarks:any;
    FindGradeFCount(regdNo:any):void{
      this.studentService.getStudentDetailsWithMarks(regdNo).pipe()
      .subscribe({
        next: response => {
          if (response.item1.length > 0) {            
            this.studentDetailsWithMarks = response.item1;
            this.ProgramCode =  this.studentDetailsWithMarks[0].officialCode;
            this.SectionCode =  this.studentDetailsWithMarks[0].section;
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
            for (const item of  this.studentDetailsWithMarks) {
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
  // --- Reusable Utility Methods ---

  /**
   * Dynamically filters fields in the review UI based on user's choices.
   */
  public getFilteredFormSections() {
    // Read the current state of form controls
    const fundingType = this.studentForm?.get('isSelfFunded')?.value; 
    const visaRejected = this.studentForm?.get('isVisaRejected')?.value;
    const englishTestType = this.studentForm?.get('englishTestType')?.value;
    const relativeName = this.studentForm?.get('relativeName')?.value;
    const passportStatus = this.studentForm?.get('passportStatus')?.value;
    const isSelfFunded = this.studentForm?.get('isSelfFunded')?.value;

    return this.formSections.map(section => {
        // 1. Sponsor Details: Hide contact fields if funded by Self/Parent
        if (section.label === 'Sponsor Details') {
            const isSelfOrParentFunded = ['Self', 'Parent'].includes(fundingType);
            if (isSelfOrParentFunded) {
                // Keep only 'isSelfFunded'
                const filteredKeys = section.keys.filter(key => key === 'isSelfFunded');
                return { ...section, keys: filteredKeys };
            }
        }
        
        // 2. Visa Details: Hide reason/country if visa was NOT rejected
        if (section.label === 'Visa Details') {
            const isVisaNotRejected = visaRejected === 'No';
            if (isVisaNotRejected) {
                // Keep only 'isVisaRejected'
                const filteredKeys = section.keys.filter(key => key === 'isVisaRejected');
                return { ...section, keys: filteredKeys };
            }
        }

        // 3. English Test Details: Hide score details if test is not given/required/applied
        if (section.label === 'English Test Details') {
            const isScoresNotApplicable = ['NotRequried', 'NotGiven', 'Applied'].includes(englishTestType);
            if (isScoresNotApplicable) {
                // Keep only 'englishTestType'
                const filteredKeys = section.keys.filter(key => key === 'englishTestType');
                return { ...section, keys: filteredKeys };
            }
        }
        // 4. Relative at Abroad: Hide Relative details if No Relative is not  'relativeName', 'relativeRelation', 'relativeCountry'
        if (section.label === 'Relative at Abroad') {
            const isScoresNotApplicable = relativeName == null || relativeName=='';//.includes(relativeName);
            if (isScoresNotApplicable) {
                // Keep only 'englishTestType'
                const filteredKeys = section.keys.filter(key => key === 'relativeName');
                return { ...section, keys: filteredKeys };
            }
        }
        //5. Relative at Abroad: Hide Passport Details if Passport status is null or no  
        if (section.label === 'Passport Details') {
            const ispassportStatus = passportStatus == 'No' || passportStatus== null;//.includes(relativeName);
            if (ispassportStatus) {
                // Keep only 'passportStatus'
                const filteredKeys = section.keys.filter(key => key === 'passportStatus');
                return { ...section, keys: filteredKeys };
            }
        }
        //6. Relative at Abroad: Hide Sponsor Details if No Sponsor Details is found
        if (section.label === 'Sponsor Details') {
            const isSelfFundedStatus = isSelfFunded == 'NA' || isSelfFunded== null || isSelfFunded.length == 2;//.includes(relativeName);
            if (isSelfFundedStatus) {
                // Keep only 'passportStatus'
                const filteredKeys = section.keys.filter(key => key === 'isSelfFunded');
                return { ...section, keys: filteredKeys };
            }
        }

        // Return all other sections and fields as is
        return section;
    });
  }
  
  /**
   * Cleans up PascalCase/camelCase form control names for display.
   */
  beautifyLabel(label: string): string {
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace('Id', 'ID')
      .replace('No', 'No.')
      .replace('Upto', 'Up To')
      .replace('Whatsapp', 'WhatsApp')
      .trim();
  }

  convertImageData(imageData: string): string {
    return `data:image/jpeg;base64,${imageData}`;
  }
  
  private formatDateForInput(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  printDetails(): void {
    window.print();
  }

  LoginFailed(error: any): void {
    this.IsLoginFailed = true;
    this.loadingIndicator = false;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid or session expired!',
      icon: 'warning',
    });
    const element = document.getElementById('StudentDashboard');
    if (element) {
      element.hidden = true;
    }
  }
}


// import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
// import Swal from 'sweetalert2';
// import { AuthService } from 'src/app/_services/auth.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';

// @Component({
//   selector: 'app-StudentApplicationDetails',
//   templateUrl: './NewPageStudentApplicationDetails.html',
//   styleUrls: ['./StudentApplicationDetails.component.css']
// })
// export class StudentApplicationDetailsComponent implements OnInit {
//   loadingIndicator = false;
//   isAdminLocked = false;
//   studentForm: FormGroup;
//   LoginName: any;
//   RegistrationNo: any;
//   stuApplication: any = null;
//   universityOptions: any[] = [];
//   studentDetailsWithImage: any = null;
//   StudentImage: string | null = null;
//   serverUrl = '';
//   folderUrl = '';
//   IsLoginFailed = false;

//   // UI options (kept as in original)
//   applyingOptions = ['Spring', 'Fall'];
//   passportStatusOptions = ['Apply', 'Yes', 'No'];
//   visaRejectedOptions = ['Yes', 'No'];
//   englishTestTypeOptions = ['Yes', 'No', 'Applied'];
//   fundsOptions = ['upto 2 lakh', '2lakh to 4 lakh', '6lakh to 8 lakh'];
//   acceptPolicyOptions = [{ label: 'Yes', value: true }, { label: 'No', value: false }];

//   // Sections & documents — keep names same for integration
//   formSections = [
//     { label: 'Personal Details', keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
//     { label: 'University Preferences', keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
//     { label: 'Relative at Abroad', keys: ['relativeName', 'relativeRelation', 'relativeCountry'] },
//     { label: 'Passport Details', keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
//     { label: 'Visa Details', keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
//     { label: 'English Test Details', keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
//     { label: 'Sponsor Details', keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
//     { label: 'Financial & Declaration', keys: ['availableFunds', 'acceptPolicy'] }
//   ];

//   documentUploads = [
//     { key: 'resumeFileName', label: 'Resume Document' },
//     { key: 'feesProofFileName', label: 'Fees Proof Document' },
//     { key: 'consentLetterFileName', label: 'Consent Letter' },
//     { key: 'passportFileName', label: 'Passport Document' },
//     { key: 'englishTestDocumentPath', label: 'English Test Proof' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private storageService: StorageService,
//     private studentService: SemesterExchangeStuDetailsService,
//     private ServicesSM: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private title: Title,
//      private cdr: ChangeDetectorRef,
//       private zone: NgZone
//   ) {
//     // initialize to avoid template errors before async data arrives
//      this.studentForm = this.fb.group({});
//   }

//   ngOnInit(): void {
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
//     this.title.setTitle('Semester Exchange Student Dashboard');

//     if (this.LoginName) {
//       this.getToken(this.LoginName);
//       this.folderUrl = this.ServicesSM.getFolderUrl();
//       // keep same serverUrl as original integration
//       this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
//     }
//   }

//   /***** Token & Login flow (kept as requested) *****/
//   getToken(loginName: string): void {
//     this.authService.loginTemp(loginName).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         const authToken = this.storageService.getUser();
//         if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
//           this.IsLoginFailed = true;
//           this.LoginFailed('Invalid or expired token');
//         } else {
//           // keep original sequence: load universities which calls createStudentForm and then application & image
//           this.getUniversityDetails();
//         }
//       },
//       error: err => this.LoginFailed(err)
//     });

//     // keep original DOM tweaks (if used elsewhere)
//     const stMain = document.getElementById('stMain');
//     if (stMain) stMain.innerHTML = '<span class="themeClr">Application Details</span>';
//     const imgLogo = document.getElementById('imgLogo') as HTMLElement | null;
//     if (imgLogo) imgLogo.style.width = '164px';
//   }

//   LoginFailed(error: any): void {
//     this.IsLoginFailed = true;
//     Swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are invalid!',
//       icon: 'warning',
//     });
//     const element = document.getElementById('StudentDashboard');
//     if (element) element.hidden = true;
//   }

//   /***** Form creation (read-only display) *****/
//   createStudentForm(): void {
//     this.studentForm = this.fb.group({
//       applicationId: [{ value: '', disabled: true }],
//       registrationNo: [{ value: '', disabled: true }],
//       emailId: [{ value: '', disabled: true }],
//       countryName: [''],
//       whatsAppNo: [''],
//       phoneNumber: [''],
//       parentContact: [''],
//       applyingOption: [''],
//       universityOption1: [''],
//       universityOption2: [''],
//       universityOption3: [''],
//       passportStatus: [''],
//       passportNumber: [''],
//       passportIssueDate: [''],
//       passportValidUpto: [''],
//       isVisaRejected: [''],
//       visaRejectedReason: [''],
//       visaRejectedCountry: [''],
//       englishTestType: [''],
//       speakingScore: [''],
//       listeningScore: [''],
//       readingScore: [''],
//       writingScore: [''],
//       overallScore: [''],
//       englishTestYear: [''],
//       isSelfFunded: [''],
//       sponsorName: [''],
//       sponsorRelation: [''],
//       sponsorContact: [''],
//       sponsorEmail: [''],
//       availableFunds: [''],
//       acceptPolicy: [false],
//       relativeName: [{ value: '', disabled: true }],
//       relativeRelation: [{ value: '', disabled: true }],
//       relativeCountry: [{ value: '', disabled: true }],
//       // include other controls if your API returns them
//     });
//   }

//   /***** University list (uses live API call) *****/
//   getUniversityDetails(): void {
//     this.loadingIndicator = true;
//     this.ServicesSM.getUniversityDetails().subscribe({
//       next: (response: any) => {
//         const data = response.item1 || [];
//         this.universityOptions = data.map((u: any) => ({ universityId: u.universityId, universityName: u.universityName }));
//         // Build form and then fetch application & image
//         this.createStudentForm();
//         if (this.RegistrationNo) {
//           this.getApplicationDetails(this.RegistrationNo);
//           this.getStuDetailsWithImage(this.RegistrationNo);
//         }
//       },
//       error: () => {
//         this.loadingIndicator = false;
//         // show warning if needed
//       },
//       complete: () => {
//         // small delay to keep the original UX consistent
//         setTimeout(() => this.loadingIndicator = false, 500);
//       }
//     });
//   }

//   /***** Application details (live API) *****/
//   getApplicationDetails(regId: string): void {
//     if (!regId) return;
//     this.loadingIndicator = true;
//     this.studentService.getStudentDetailsBYId(regId).subscribe({
//       next: (response: any) => {
//         if (response.item1?.length > 0) {
//           this.stuApplication = response.item1[0];
//           this.isAdminLocked = !!this.stuApplication['isLocked'];

//           // patch form safely: use known control names & format dates
//           const patchObj: any = { ...this.stuApplication };
//           patchObj.acceptPolicy = this.stuApplication.acceptPolicy === 'true' || this.stuApplication.acceptPolicy === true;
//           patchObj.passportIssueDate = this.formatDateForInput(this.stuApplication.passportIssueDate);
//           patchObj.passportValidUpto = this.formatDateForInput(this.stuApplication.passportValidUpto);
//           this.studentForm.patchValue(patchObj);

//           // disable the form for read-only view
//           this.studentForm.disable();
//         } else {
//           this.LoginFailed('No application data found.');
//         }
//       },
//       error: () => this.LoginFailed('Unable to fetch application details.'),
//       complete: () => setTimeout(() => (this.loadingIndicator = false), 2500)
//     });
//   }

//   /***** Student details with image (live API) *****/
//   getStuDetailsWithImage(Regno: any): void {
//     if (!Regno) return;
//     this.ServicesSM.GetStuDetailsWithImage(Regno).subscribe({
//       next: (response: any) => {
//         if (response.item1?.length > 0) {
//           this.studentDetailsWithImage = response.item1[0];
//           if (this.studentDetailsWithImage?.imageData) {
//             this.StudentImage = this.convertImageData(this.studentDetailsWithImage.imageData);
//           }
//         }
//       },
//       error: () => {
//         // ignore image errors silently, keep UI robust
//       }
//     });
//   }

//   /***** Utilities *****/
//   formatDateForInput(dateStr: string | null): string | null {
//     if (!dateStr) return null;
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return null;
//     const yyyy = date.getFullYear();
//     const mm = (date.getMonth() + 1).toString().padStart(2, '0');
//     const dd = date.getDate().toString().padStart(2, '0');
//     return `${yyyy}-${mm}-${dd}`;
//   }

//   convertImageData(imageData: string): string {
//     // The original used base64. If API returns base64 or ArrayBuffer adapt accordingly.
//     // If imageData is already a base64 string:
//     if (!imageData) return '';
//     if (imageData.startsWith('/9j/') || imageData.startsWith('iVBORw0K')) {
//       // base64 without data URL prefix
//       const mime = imageData.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
//       return `data:${mime};base64,${imageData}`;
//     }
//     // if imageData is hex, try hex convert
//     if (/^[0-9a-fA-F]+$/.test(imageData)) {
//       const base64 = this.hexToBase64(imageData);
//       // guess mime by header
//       const mime = base64.startsWith('/9j/') ? 'image/jpeg' : (base64.startsWith('iVBORw0K') ? 'image/png' : 'application/octet-stream');
//       return `data:${mime};base64,${base64}`;
//     }
//     // fallback: return as-is
//     return imageData;
//   }

//   hexToBase64(hex: string): string {
//     const bytes: number[] = [];
//     for (let i = 0; i < hex.length; i += 2) {
//       bytes.push(parseInt(hex.substr(i, 2), 16));
//     }
//     const binary = String.fromCharCode(...bytes);
//     return btoa(binary);
//   }

//   arrayBufferToBase64(buffer: ArrayBuffer): string {
//     const byteArray = new Uint8Array(buffer);
//     const binaryString = String.fromCharCode(...byteArray);
//     return btoa(binaryString);
//   }

//   public getFilteredFormSections() {
//     const fundingType = this.studentForm?.get('isSelfFunded')?.value;
//     const excludedFundingTypes = ['Parent', 'Applied', 'No'];

//     return this.formSections.map(section => {
//       if (section.label !== 'Sponsor Details' && section.label !== 'English Test Details' && section.label !== 'Visa Details') {
//         return section;
//       }

//       if (excludedFundingTypes.includes(fundingType)) {
//         const filteredKeys = section.keys.filter(key => ['isSelfFunded', 'availableFunds', 'englishTestType', 'isVisaRejected'].includes(key));
//         return { ...section, keys: filteredKeys };
//       }
//       return section;
//     });
//   }

//   beautifyLabel(key: string): string {
//     if (!key) return '';
//     if (key === 'programCode') return 'Program';
//     const words = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
//     return words.charAt(0).toUpperCase() + words.slice(1);
//   }

//   hasDocument(key: string): boolean {
//     return !!(this.stuApplication && this.stuApplication[key]);
//   }

//   getDocumentUrl(key: string): string {
//     if (!this.stuApplication) return '#';
//     const path = this.stuApplication[key] ?? '';
//     return this.serverUrl ? `${this.serverUrl}${path}` : path;
//   }

//   getUniversityName(id: number): string {
//     const uni = this.universityOptions.find(u => u.universityId == id);
//     return uni ? uni.universityName : '-';
//   }

//   isFieldInvalid(field: string): boolean {
//     const control = this.studentForm.get(field);
//     return !!(control && control.invalid && (control.touched || control.dirty));
//   }

//   getFieldErrors(field: string) {
//     return this.studentForm.get(field)?.errors || null;
//   }

//   printDetails(): void {
//       window.print();}
//   //   this.loadingIndicator = true;
//   //   this.cdr.detectChanges();

//   //   // Give the DOM and images time to stabilize
//   //   this.zone.runOutsideAngular(() => {
//   //     setTimeout(() => {
//   //       window.print();
//   //       this.zone.run(() => {
//   //         this.loadingIndicator = false;
//   //         this.cdr.detectChanges();
//   //       });
//   //     }, 500);  
//   //   });
//   // }
// }

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
// import Swal from 'sweetalert2';
// import { AuthService } from 'src/app/_services/auth.service';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { Console } from 'console';
// import { finalize } from 'rxjs';

// @Component({
//   selector: 'app-StudentApplicationDetails',
//   templateUrl: './StudentApplicationDetails.component.html',
//   styleUrls: ['./StudentApplicationDetails.component.css']
// })
// export class StudentApplicationDetailsComponent implements OnInit {
  
//   loadingIndicator: boolean = false;
//   isAdminLocked: boolean = false;
//   studentForm!: FormGroup; isEditable = false; LoginName: any;
//   RegistrationNo: any; stuApplication: any; universityOptions: any[] = [];
//   studentDetailsWithImage: any;
//   serverUrl: string = '';
//   folderUrl: string = '';
//   IsLoginFailed: boolean = false;
//   applyingOptions = ['Spring', 'Fall'];
//   passportStatusOptions = ['Apply', 'Yes', 'No'];
//   visaRejectedOptions = ['Yes', 'No'];
//   englishTestTypeOptions = ['Yes', 'No', 'Applied'];
//   fundsOptions = ['upto 2 lakh', '2lakh to 4 lakh', '6lakh to 8 lakh'];
//   acceptPolicyOptions = [
//     { label: 'Yes', value: true },
//     { label: 'No', value: false }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private storageService: StorageService,
//     private studentService: SemesterExchangeStuDetailsService,
//     private ServicesSM: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private title: Title
//   ) { }

//   ngOnInit(): void {
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
//     this.title.setTitle('Semester Exchange Student Dashboard');

//     if (this.LoginName) {
//       this.getToken(this.LoginName);
//       this.folderUrl = this.ServicesSM.getFolderUrl();
//       this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
//       // this.serverUrl = 'http://172.19.2.52/umsweb/webftp/DIA/SemesterExchangedocuments/';
//     }
//   }
//   formSections = [
//     { label: 'Personal Details', keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
//     { label: 'University Preferences', keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
//     { label: 'Relative at Abroad', keys: ['relativeName', 'relativeRelation','relativeCountry'] },
//     { label: 'Passport Details', keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
//     { label: 'Visa Details', keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
//     { label: 'English Test Details', keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
//     { label: 'Sponsor Details', keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
//     { label: 'Financial & Declaration', keys: ['availableFunds', 'acceptPolicy'] }    
//   ];
  
//   documentUploads = [
//     { key: 'resumeFileName', label: 'Resume Document' },
//     { key: 'feesProofFileName', label: 'Fees Proof Document' },
//     { key: 'consentLetterFileName', label: 'Consent Letter' },
//     { key: 'passportFileName', label: 'Passport Document' },
//     { key: 'englishTestDocumentPath', label: 'English Test Proof ' }
//   ];
  
//   printDetails() {
//     window.print();
//   }
  
//   getToken(loginName: string): void {
//     this.authService.loginTemp(loginName).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         const authToken = this.storageService.getUser();
//         if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
//           this.IsLoginFailed = true;
//           this.LoginFailed('Invalid or expired token');
//         } else {
//           this.getUniversityDetails(); // Load universities first

//         }
//       },
//       error: err => this.LoginFailed(err)
//     });
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Application Details</span>';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//   }

//   LoginFailed(error: any): void {
//     this.IsLoginFailed = true;
//     Swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are invalid!',
//       icon: 'warning',
//     });
//     const element = document.getElementById('StudentDashboard');
//     if (element) {
//       element.hidden = true;
//     }
//   }

//   createStudentForm(): void {
//     this.studentForm = this.fb.group({
//       applicationId: [{ value: '', disabled: true }],
//       registrationNo: [{ value: '', disabled: true }],
//       emailId: [{ value: '', disabled: true }],
//       countryName: ['', Validators.required],
//       whatsAppNo: ['', Validators.required],
//       phoneNumber: ['', Validators.required],
//       parentContact: ['', Validators.required],
//       applyingOption: ['', Validators.required],
//       universityOption1: ['', Validators.required],
//       universityOption2: ['', Validators.required],
//       universityOption3: ['', Validators.required],
//       passportStatus: ['', Validators.required],
//       passportNumber: ['', Validators.required],
//       passportIssueDate: ['', Validators.required],
//       passportValidUpto: ['', Validators.required],
//       isVisaRejected: ['', Validators.required],
//       visaRejectedReason: ['', Validators.required],
//       visaRejectedCountry: ['', Validators.required],
//       englishTestType: ['', Validators.required],
//       speakingScore: ['', Validators.required],
//       listeningScore: ['', Validators.required],
//       readingScore: ['', Validators.required],
//       writingScore: ['', Validators.required],
//       overallScore: ['', Validators.required],
//       englishTestYear: ['', Validators.required],
//       isSelfFunded: ['', Validators.required],
//       sponsorName: ['', Validators.required],
//       sponsorRelation: ['', Validators.required],
//       sponsorContact: ['', Validators.required],
//       sponsorEmail: ['', [Validators.required]],
//       availableFunds: ['', Validators.required],
//       acceptPolicy: [false, Validators.requiredTrue],
//       relativeName: [{ value: '', disabled: true }], // Added for Relative at Abroad
//       relativeRelation: [{ value: '', disabled: true }], // Added for Relative at Abroad
//       relativeCountry: [{ value: '', disabled: true }], // Added for Relative at Abroad
//     });
//   }

//   getUniversityDetails(): void {
//     this.ServicesSM.getUniversityDetails().subscribe((response) => {
//       this.loadingIndicator = true;
//       const data = response.item1;
//       this.universityOptions = data.map((u: any) => ({
//         universityId: u.universityId,
//         universityName: u.universityName
//       }));
//       // console.log("UNI"+JSON.stringify(this.universityOptions));
//        this.createStudentForm(); // Ensure the form is created here
//       this.getApplicationDetails(this.RegistrationNo); // Only call this after universities are ready
//       this.getStuDetailsWithImage(this.RegistrationNo); // Only call this after universities are ready
//        // Delay hiding the loader for 2.5 seconds

//        setTimeout(() => {
//         this.loadingIndicator = false;
//       }, 3500);
//     });
//   }
 
//   private formatDateForInput(dateStr: string | null): string | null {
//     if (!dateStr) return null;
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return null; // invalid date
//     const yyyy = date.getFullYear();
//     const mm = (date.getMonth() + 1).toString().padStart(2, '0');
//     const dd = date.getDate().toString().padStart(2, '0');
//     return `${yyyy}-${mm}-${dd}`;
//   }

//   enableEdit(): void {
//     this.isEditable = true;
//     this.studentForm.enable();
//     this.studentForm.get('applicationId')?.disable();
//     this.studentForm.get('emailId')?.disable();
//     this.studentForm.get('registrationNo')?.disable();
//     this.studentForm.get('acceptPolicy')?.disable();
//     this.studentForm.get('totalCountGradeF')?.disable();
//   }
//   isLoading: boolean = false;
//   hasUploadedDocuments(): boolean {
//     if (!this.stuApplication) return false;
  
//     // Check if each document is uploaded
//     const feesProofUploaded = !!this.FeesProofFileName || this.stuApplication.feesProofFileName.length!=0 ;
//     const resumeUploaded = !!this.ResumeFileName || this.stuApplication.resumeFileName.length!=0 ;
//     const passportUploaded = !!this.PassportFileName || this.stuApplication.passportFileName.length!=0 ;
//     const consentLetterUploaded = !!this.ConsentLetterFileName ||this.stuApplication.consentLetterFileName.length!=0 ; // Optional
  
//     // Return true if all required documents are uploaded
//     return feesProofUploaded && resumeUploaded && passportUploaded && consentLetterUploaded;// if needed
//   }
//   documentTouchedMap: { [key: string]: boolean } = {};
//   onDocumentTouched(field: string): void {
//     this.documentTouchedMap[field] = true;

//     // Mark the corresponding FormControl as touched to trigger validation
//     const control = this.studentForm.get(field);
//     if (control && !control.touched) {
//       control.markAsTouched();
//     }

//   }


//   updateData(): void {
    
//     if (!this.hasUploadedDocuments()) {
//       alert('Please upload all required documents before updating.');
//       return;
//     }
    
//     if (!this.studentForm.valid) {
//       alert('Please fill all required fields.');
//       return;
//     }
//     this.isLoading = true;
//     const minLoadingTime = 2500; // 2.5 seconds
//     const startTime = Date.now();
//     const formData = new FormData();
//     if (this.studentForm.valid) {
//       const updatedData = this.studentForm.getRawValue();
//       const formData = new FormData();

//       // Append regular form fields
//       formData.append("RegistrationNo", updatedData.registrationNo);
//       formData.append("ApplicationId", updatedData.applicationId);
//       formData.append("EmailId", updatedData.emailId);
//       formData.append("CountryName", updatedData.countryName);
//       formData.append("WhatsAppNo", updatedData.whatsAppNo);
//       formData.append("PhoneNumber", updatedData.phoneNumber);
//       formData.append("ParentContact", updatedData.parentContact);
//       formData.append("ApplyingOption", updatedData.applyingOption);
//       formData.append("UniversityOption1", updatedData.universityOption1);
//       formData.append("UniversityOption2", updatedData.universityOption2);
//       formData.append("UniversityOption3", updatedData.universityOption3);
//       formData.append("PassportStatus", updatedData.passportStatus);
//       formData.append("PassportNumber", updatedData.passportNumber);
//       formData.append("PassportIssueDate", updatedData.passportIssueDate);
//       formData.append("PassportValidUpto", updatedData.passportValidUpto);
//       formData.append("IsVisaRejected", updatedData.isVisaRejected);
//       formData.append("VisaRejectedReason", updatedData.visaRejectedReason);
//       formData.append("VisaRejectedCountry", updatedData.visaRejectedCountry);
//       formData.append("EnglishTestType", updatedData.englishTestType);
//       formData.append("SpeakingScore", updatedData.speakingScore);
//       formData.append("ListeningScore", updatedData.listeningScore);
//       formData.append("ReadingScore", updatedData.readingScore);
//       formData.append("WritingScore", updatedData.writingScore);
//       formData.append("OverallScore", updatedData.overallScore);
//       formData.append("EnglishTestYear", updatedData.englishTestYear);
//       formData.append("IsSelfFunded", updatedData.isSelfFunded);
//       formData.append("SponsorName", updatedData.sponsorName);
//       formData.append("SponsorRelation", updatedData.sponsorRelation);
//       formData.append("SponsorContact", updatedData.sponsorContact);
//       formData.append("SponsorEmail", updatedData.sponsorEmail);

//       if (this.stuApplication?.resumeFileName.length == 0) {
//       formData.append("ResumeFileName", this.ResumeFileName);
//       formData.append("ResumeFileData", this.ResumeFileData);
//       }
//       if (this.stuApplication?.consentLetterFileName.length == 0) {
//         formData.append("ConsentLetterFileName", this.ConsentLetterFileName);
//         formData.append("ConsentLetterData", this.ConsentLetterData);
//       }
      
//       if (this.stuApplication?.feesProofFileName.length == 0) {
//       formData.append("FeesProofData", this.FeesProofData);
//       formData.append("FeesProofFileName", this.FeesProofFileName);
//       }
//       if (this.stuApplication?.passportFileName.length == 0) {
//       formData.append("PassportFileData", this.PassportFileData);
//       formData.append("PassportFileName", this.PassportFileName);
//       }
//       formData.append("AvailableFunds", updatedData.availableFunds);

//       // console.log('Submitting Form Data:');
//       // formData.forEach((value, key) => {
//       //   console.log(key + ':', value);
//       // });
//        const elapsed = Date.now() - startTime;
//             const remaining = Math.max(minLoadingTime - elapsed, 0);
//             setTimeout(() => {
//               this.isLoading = false;
//             }, remaining);
//       // TODO: Call API service to submit formData
//       // Example:
//       this.studentService.updateApplicationDetails(formData)
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
//             const result = data[0]?.msg;
//             if (result == 'Success') {
//               Swal.fire({
//                 title: 'User Data Updated Successfully',
//                 text: "",
//                 icon: 'success',
//               }).then(() => {
//                 window.location.reload();
//               });
//             } else if (result == 'Failed') {
//               Swal.fire({
//                 title: 'Unable to update Details ! ',
//                 text: "",
//                 icon: 'error'
//               }).then(() => {
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

//       this.isEditable = false;
//       this.studentForm.disable();

//       // alert('Ready to submit');
//     } else {
//       alert('Please fill all required fields.');
//     }
//   }

//   beautifyLabel(label: string): string {
//     return label
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/_/g, ' ')
//       .replace(/\b\w/g, char => char.toUpperCase());
//   }


//   fileDataMap: { [key: string]: string | null } = {};
//   // fileNameMap: { [key: string]: string | null } = {};
//   fileStatusMap: { [key: string]: boolean } = {};
//   uploadEnabledMap: { [key: string]: boolean } = {};


//   selectedFiles: { [key: string]: File } = {};
//   fileNameMap: { [key: string]: string } = {};


//   PassportFileData: any; PassportFileStatus: boolean = false;
//   PassportFileName: any;
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
//         this.updateButtonState(); // Call the method to update button state
//       };
//     }
//   }

//   ResumeFileData: any; ResumeFileStatus: boolean = false;
//   ResumeFileName: any;
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
//         this.updateButtonState(); // Call the method to update button state
//       };
//     }
//   }

//   FeesProofData: any; FeesProofStatus: boolean = false;
//   FeesProofFileName: any;
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
//         this.FeesProofFileName = file.name; // Set the filename
//         this.updateButtonState(); // Call the method to update button state
//       };
//     }
  
//   }

//   updateButtonState(): void {
//     // This will trigger Angular's change detection
//     this.hasUploadedDocuments();
//   }
  
//   ConsentLetterData: any; ConsentLetterStatus: boolean = false;
//   ConsentLetterFileName: any;
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
//         this.updateButtonState(); // Call the method to update button state
//       };
//     }
//   }


//   getUniversityName(id: number): string {
//     const uni = this.universityOptions.find(u => u.universityId == id);
//     return uni ? uni.universityName : '-';
//   }

//   isFieldInvalid(field: string): boolean {
//     const control = this.studentForm.get(field);
//     return !!(control && control.invalid && (control.touched || control.dirty));
//   }

//   // Get validation errors for a field
//   getFieldErrors(field: string) {
//     return this.studentForm.get(field)?.errors || null;
//   }

//   // added on 8-July-25
//   getApplicationDetails(regId: string): void {
//     this.isLoading = true;
//     this.studentService.getStudentDetailsBYId(regId).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.stuApplication = response.item1[0];
//         this.isAdminLocked = this.stuApplication['isLocked'];
       
//         this.studentForm.patchValue({
//           ...this.stuApplication,
//           acceptPolicy: this.stuApplication.acceptPolicy === 'true',
//           universityOption1: this.stuApplication.universityOption1,
//           universityOption2: this.stuApplication.universityOption2,
//           universityOption3: this.stuApplication.universityOption3,
//           relativeCountry: this.stuApplication.relativeCountry,
//           relativeName: this.stuApplication.relativeName,
//           relativeRelation: this.stuApplication.relativeRelation,
//           passportIssueDate: this.formatDateForInput(this.stuApplication.passportIssueDate),
//           passportValidUpto: this.formatDateForInput(this.stuApplication.passportValidUpto),
//         });
//         // console.log(JSON.stringify(this.stuApplication))
//         // Fetch and convert the image data 
//         // this.fetchImageData(this.stuApplication.imageData); // Pass the image data from stuApplication
//         // this.StudentImage = this.arrayBufferToBase64(this.stuApplication.imageData);
//         // this.StudentImage = this.convertImageData(this.stuApplication.imageData);
//         this.studentForm.disable();
//         setTimeout(() => {
//           this.isLoading = false;
//         }, 2500);
  
//       } else {
//         setTimeout(() => {
//           this.isLoading = false;
//         }, 2500);
//         this.LoginFailed("No application data found.");
//       }
//     });
//   }
  
//   convertImageData(imageData: string): string {
//     // Assuming imageData is in base64 format already
//     return `data:image/jpeg;base64,${imageData}`;
//   }
//   StudentImage: any='';

//   fetchImageData(hexData: string | null): void {
//     if (hexData) {
//       try {
//         const base64String = this.hexToBase64(hexData);
//         const mimeType = this.getMimeType(base64String);
//         this.StudentImage = `data:${mimeType};base64,${base64String}`;
//       } catch (error) {
//         console.error(error);
//         this.StudentImage = null; // Handle error as needed
//       }
//     } else {
//       this.StudentImage = null; // No image data available
//     }
//   }

//   getMimeType(base64String: string): string {
//     // Check the first few characters of the base64 string to determine the MIME type
//     if (base64String.startsWith('/9j/')) {
//       return 'image/gif'; // JPEG
//     } else if (base64String.startsWith('iVBORw0KGgo')) {
//       return 'image/gif'; // PNG
//     } else {
//       return 'application/octet-stream'; // Fallback for unknown types
//     }
//   }

//   hexToBase64(hex: string): string {
//     // Convert hex to a byte array
//     const bytes = [];
//     for (let i = 0; i < hex.length; i += 2) {
//       bytes.push(parseInt(hex.substr(i, 2), 16));
//     }
    
//     const binaryString = String.fromCharCode(...bytes);
    
//     return btoa(binaryString);
//   }


 

//   arrayBufferToBase64(buffer: ArrayBuffer): string {
//     const byteArray = new Uint8Array(buffer);
//     const binaryString = String.fromCharCode(...byteArray);
//     return btoa(binaryString);
//   }
  

//   getStuDetailsWithImage(Regno: any): void {
//     this.ServicesSM.GetStuDetailsWithImage(Regno).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.studentDetailsWithImage = response.item1[0];
//         // console.log(JSON.stringify(this.studentDetailsWithImage))
//         this.StudentImage = this.convertImageData(this.studentDetailsWithImage.imageData);
//       }
//     });
//   }

//   public getFilteredFormSections() {    
//     const fundingType = this.studentForm?.get('isSelfFunded')?.value; 

//     const excludedFundingTypes = ['Parent', 'Applied','No']; // Assuming 'Self' and 'Parent' are the values for self-funded/parent-sponsored

//     return this.formSections.map(section => {
//         // If it's not the 'Sponsor Details' section, return it as is
//         if (section.label !== 'Sponsor Details' && section.label!=='English Test Details' && section.label !=='Visa Details') {
//             return section;
//         }

//         if (excludedFundingTypes.includes(fundingType)  ) {
            
//             const filteredKeys = section.keys.filter(key => key === 'isSelfFunded' || key === 'availableFunds' || key=='englishTestType' || key=='isVisaRejected');
            
//             return {
//                 ...section,
//                 keys: filteredKeys
//             };
//         }
//         // if (excludedFundingTypes.includes(fundingType)) {
            
//         //     const filteredKeys = section.keys.filter(key => key === 'isSelfFunded' || key === 'availableFunds' || key=='englishTestType');
            
//         //     return {
//         //         ...section,
//         //         keys: filteredKeys
//         //     };
//         // }
        
//         // If fundingType is 'Other', return all sponsor keys
//         return section;
//     });
// }
// }
