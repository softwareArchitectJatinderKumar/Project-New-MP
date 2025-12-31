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

  
  loadingIndicator: boolean = false; 
  imageLoading: boolean = false;    
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
    this.studentForm.disable();
  }
  Role: any = '';
  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];
    this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];    
    this.Role = this.route.snapshot.params['Role'];    
    
    this.folderUrl = this.ServicesSM.getFolderUrl();
    this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
    
    if (this.LoginName) {
      this.getToken(this.LoginName);
    }

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Application Details</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  }

   DashboardVisit() {
    if (this.Role === 'Student') {
    this.router.navigateByUrl('StudentDashboard/' + this.LoginName + '/' + this.RegistrationNo);
  }
  else{
  this.router.navigateByUrl('FacultyDashboard' + '/' + this.LoginName);
  }
  }
  Visit(): void{
    this.router.navigateByUrl('FacultyDashboard')
  }
  
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
          
          forkJoin([
              this.ServicesSM.getUniversityDetails(),
              this.studentService.getStudentDetailsBYId(this.RegistrationNo)
          ]).subscribe(([uniResponse, appResponse]) => {
              
              
              this.universityOptions = uniResponse.item1.map((u: any) => ({
                universityId: u.universityId,
                universityName: u.universityName
              }));

              
              if (appResponse.item1.length > 0) {
                  this.stuApplication = appResponse.item1[0];
                  
                  this.studentForm.patchValue({
                      ...this.stuApplication,
                      University1: this.stuApplication.UniversityOption1,
                      University2: this.stuApplication.UniversityOption2,
                      University3: this.stuApplication.UniversityOption3,
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

