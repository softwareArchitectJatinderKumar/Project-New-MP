import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { countries } from '../../countries-list';

interface DocumentField {
  key: string;
  label: string;
  fileName: string;
  fileData: string | null;
}

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-applicationData.html',
  styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent implements OnInit {
  LockedStatus: any; // added on 26-dec-25
  form!: FormGroup;
  isLoading = false;
  isSubmitted = false;
  currentStep = 0;

  RegistrationNo: string;
  ApplicationId: string | null = null;
  stuApplication: any = null;

  isEditingStep: boolean[] = [false, false, false, false, false];

  pickedFiles: {
    [key: string]: { file: File | null; base64?: string | null; fileName?: string | null };
  } = {
      consent: { file: null, base64: null, fileName: null },
      resume: { file: null, base64: null, fileName: null },
      passport: { file: null, base64: null, fileName: null },
      english: { file: null, base64: null, fileName: null },
      fees: { file: null, base64: null, fileName: null }
    };

  setActiveTab(tabKey: any): void {
    this.currentStep = tabKey;
    const tabToStepMap: { [key: string]: number } = {
      'application': 0,
      'documents': 1,
      'courses': 2
    };
    this.currentStep = tabToStepMap[tabKey] || 0;
  }
  studentDetailsWithImage: any;
  StudentImage: string | null = null;

  convertImageData(imageData: string): string {
    return imageData ? `data:image/jpeg;base64,${imageData}` : '';
  }

  getStuDetailsWithImage(Regno: any): void {
    if (!Regno) return;
    this.ServicesSM.GetStuDetailsWithImage(Regno).subscribe((response: any) => {
      if (response?.item1?.length > 0) {
        this.studentDetailsWithImage = response.item1[0];
        this.StudentImage = this.convertImageData(this.studentDetailsWithImage.imageData);
      } else {
        this.StudentImage = null;
      }
    }, () => {
      this.StudentImage = null;
    });
  }

  /**
   * Moves to a specific step index and updates the active tab accordingly.
   * @param stepIndex The index of the step (0-based) to navigate to.
   */
  goToStep(stepIndex: number): void {
    const stepToTabMap = ['application', 'documents', 'courses'];

    if (stepIndex >= 0 && stepIndex < stepToTabMap.length) {
      this.setActiveTab(stepToTabMap[stepIndex]);
    }
  }
  documentFields: DocumentField[] = [
    { key: 'consent', label: 'Consent Letter', fileName: '', fileData: null },
    { key: 'resume', label: 'Resume / CV', fileName: '', fileData: null },
    { key: 'passport', label: 'Passport Copy', fileName: '', fileData: null },
    { key: 'english', label: 'English Test Score Card', fileName: '', fileData: null },
    { key: 'fees', label: 'Fees Receipt (Optional)', fileName: '', fileData: null }
  ];
  countries = countries; // populate if needed
  uniData: any[] = []; // populate if needed

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

  stepLabels = [
    'Academic Summary',        // was step 0 (marks tables)
    'Contact Information',     // contact & relative
    'University Preferences',  // preferences
    'Passport / Visa / English / Sponsor', // personal/legal
    'Documents'                // separate card (we will show as step but documents are separate too)
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: SemesterExchangeStuDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private ServicesSM: SemesterExchangeStuDetailsService,
  ) { }


  /** ------------------- Edit Functions ------------------- */
  startEdit(step: number) {
    // Only allow editing if the step is currently visible/active and not step 0 (view only) or 4 (documents)
    if (step >= 1 && step <= 4 && this.currentStep === step) {
      this.isEditingStep[step] = true;
      this.form.enable(); // Enable the form to allow edits
    }
  }

  cancelEdit(step: number) {
    this.isEditingStep[step] = false;
    this.form.disable(); // Disable the form fields again

    // Reload form data for that step (reset to original values)
    if (this.RegistrationNo) {
      this.getApplicationDetails(this.RegistrationNo);
    }
  }


  updateStep(step: number) {
    this.isSubmitted = true;

    // Check validity of only the fields relevant to the current step
    if (!this.isCurrentStepValid(step)) {
      Swal.fire('Validation Required', 'Please fill all required fields in the current section before updating.', 'warning');
      return;
    }

    const formData = new FormData();
    const raw = this.form.getRawValue();

    // 1. RegistrationNo and ApplicationId (2 fields)
    formData.append('RegistrationNo', this.RegistrationNo || 'NA');
    if (this.ApplicationId) formData.append('ApplicationId', this.ApplicationId);

    // 2. Core data fields (33 fields)
    // REMOVED: "AcceptPolicy" (not in SP)
    // ADDED: "IsSelfFunded" (required by SP)
    const fieldsToAppend = [
      "EmailId", "CountryName", "WhatsAppNo", "PhoneNumber", "ParentContact",
      "ApplyingOption", "UniversityOption1", "UniversityOption2", "UniversityOption3",
      "PassportStatus", "PassportNumber", "PassportIssueDate", "PassportValidUpto",
      "IsVisaRejected", "VisaRejectedReason", "VisaRejectedCountry",
      "EnglishTestType",
      "SpeakingScore", "ListeningScore", "ReadingScore", "WritingScore", "OverallScore",
      "SponsorType", "AvailableFunds", "SponsorName", "SponsorRelation", 'SponsorEmail', 'SponsorContact',
      "RelativeName", "RelativeRelation", "RelativeEmail", "RelativePhone",
      // "IsSelfFunded" // <--- CRITICAL: ADDED MISSING SP PARAMETER
    ];

    fieldsToAppend.forEach(k => {
      // Safely convert value to string, defaulting to ''
      let v: any = raw[k] ?? '';
      if (v === null || v === undefined) v = '';
      formData.append(k, String(v));
    });

    // 3. Custom Mapped Fields (3 fields)
    // FIX 1: Map Angular Form Control 'RelativeCountryName' to API parameter 'RelativeCountry'
    let relativeCountryValue: any = raw['RelativeCountryName'] ?? '';
    if (relativeCountryValue === null || relativeCountryValue === undefined) relativeCountryValue = '';
    formData.append('RelativeCountry', String(relativeCountryValue));

    // FIX 2: Explicitly append EnglishTestYear
    let englishTestYearValue: any = raw['EnglishTestYear'] ?? '';
    if (englishTestYearValue === null || englishTestYearValue === undefined) englishTestYearValue = '';
    formData.append('EnglishTestYear', String(englishTestYearValue));

    // FIX 3: Map Angular Form Control 'TestName' to API parameter 'EnglishTestName' (PascalCase)
    let englishTestNameValue: any = raw['TestName'] ?? '';
    if (englishTestNameValue === null || englishTestNameValue === undefined) englishTestNameValue = '';
    formData.append('EnglishTestName', String(englishTestNameValue));

    let IsSelfFunded: any = raw['SponsorType'] ?? '';
    if (IsSelfFunded === 'Parents' || IsSelfFunded === 'Parent') IsSelfFunded = 'True';
    else if (IsSelfFunded === 'Other' || IsSelfFunded === 'other') IsSelfFunded = 'False';
    formData.append('IsSelfFunded', IsSelfFunded);


    formData.append('ResumeFileName', this.ResumeFileName || '');
    formData.append('ResumeFileData', this.ResumeFileData || '');
    formData.append('ConsentLetterFileName', this.ConsentLetterFileName || '');
    formData.append('ConsentLetterData', this.ConsentLetterData || '');
    formData.append('FeesProofFileName', this.FeesProofFileName || '');
    formData.append('FeesProofData', this.FeesProofData || '');
    formData.append('PassportFileName', this.PassportFileName || '');
    formData.append('PassportFileData', this.PassportFileData || '');
    // Total fields appended: 2 (ID) + 33 (core) + 3 (custom) + 8 (files) = 46 fields.

    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    this.isLoading = true;
    const start = Date.now();
    this.studentService.updateApplicationDetails(formData).subscribe({
      next: (resp: any) => {
        const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
        if (msg === 'Success') {
          Swal.fire('Updated', 'Details updated successfully', 'success');
          this.isEditingStep[step] = false;
          this.form.disable();
          if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
        } else {
          Swal.fire('Error', 'Failed to update', 'error');
        }
        const elapsed = Date.now() - start;
        const remaining = Math.max(800 - elapsed, 0);
        setTimeout(() => { this.isLoading = false; }, remaining);
      },
      error: () => {
        Swal.fire('Error', 'Server error while updating', 'error');
        this.isLoading = false;
      }
    });
  }
  /** ------------------- Validation Helper (NEW) ------------------- */
  // Checks only the required fields relevant to the current step's data.
  // This bypasses the global 'form.invalid' issue.
  isCurrentStepValid(step: number): boolean {
    if (!this.form) return false;

    // A map of unconditionally required field names for each step.
    const fieldsToValidate: Record<number, string[]> = {
      // Step 1: Contact & Relative Details
      1: ['EmailId', 'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 'HasRelativeDetails'],

      // Step 2: University Preferences
      2: ['ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'],

      // Step 3: Passport / Visa / English / Sponsor
      // 'AcceptPolicy' is a global requirement, so it must be valid for the final update (Step 3).
      3: ['PassportStatus', 'IsVisaRejected', 'EnglishTestType', 'SponsorType', 'AvailableFunds', 'AcceptPolicy'],
    };

    const fields = fieldsToValidate[step];
    if (!fields) return true; // Step 0 or 4 has no required field validation here

    // Check primary required fields
    for (const fieldName of fields) {
      const control = this.form.get(fieldName);

      if (control && control.invalid) {
        // Allow the button to be enabled for Steps 1 & 2 even if the 'AcceptPolicy' is the only thing invalid,
        // as the user won't be able to fix it until Step 3.
        if ((step === 1 || step === 2) && fieldName === 'AcceptPolicy') continue;
        return false;
      }
    }

    // --- Check conditional required fields (Must be manually checked since no dynamic validators are used) ---

    // Conditional Relative details check (Step 1)
    if (step === 1) {
      const hasRelativeDetails = this.form.get('HasRelativeDetails')?.value;
      if (hasRelativeDetails === 'Yes' && (!this.form.get('RelativeName')?.value || !this.form.get('RelativeRelation')?.value || !this.form.get('RelativeCountryName')?.value)) {
        return false;
      }
    }

    // Conditional Passport/Visa/English checks (Step 3)
    if (step === 3) {
      const passportStatus = this.form.get('PassportStatus')?.value;
      const isVisaRejected = this.form.get('IsVisaRejected')?.value;
      const englishTestType = this.form.get('EnglishTestType')?.value;
      // const testDate = this.form.get('TestDate')?.value;
      const englishTestYear = this.form.get('EnglishTestYear')?.value;

      // Passport details required if status is 'Yes'
      if (passportStatus === 'Yes' && (!this.form.get('PassportNumber')?.value || !this.form.get('PassportIssueDate')?.value || !this.form.get('PassportValidUpto')?.value)) {
        return false;
      }

      // Visa rejection details required if rejected is 'Yes'
      if (isVisaRejected === 'Yes' && (!this.form.get('VisaRejectedReason')?.value || !this.form.get('VisaRejectedCountry')?.value)) {
        return false;
      }
      // English test details required if appeared is 'Appeared'
      // Also add a basic check for 4-digit year format
      if (englishTestType === 'Appeared' && (!this.form.get('TestName')?.value || !englishTestYear || !/^\d{4}$/.test(String(englishTestYear)))) {
        return false;
      }
      // // English test details required if appeared is 'Appeared'
      // if (englishTestType === 'Appeared' && (!this.form.get('TestName')?.value || !testDate)) {
      //     return false;
      // }
    }

    return true;
  }
  LoginName: any; isLoginFailed: any = false;
  ngOnInit(): void {
    // registrationNo might be passed in route params (like other file)    
    this.LoginName = this.route.snapshot.params['LoginName'];
    this.RegistrationNo = this.route.snapshot.params['RegistrationNo'] || null;
    if (this.LoginName) {
      this.getToken(this.LoginName);
      this.getUniversityDetails();
    }
  }


  getToken(loginName: string): void {
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.isLoginFailed = true;
          this.loginFailed('Invalid or expired token');
        } else {
          this.getStudentDetail();
          this.buildForm();
        }
      },
      error: (err: any) => this.loginFailed(err)
    });

    const el = document.getElementById('stMain');
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange Student </span> Dashboard';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    // if (el) {
    //   el.innerHTML = 'Semester Exchange <span class="themeClr">Student Dashboard</span>';
    //   el.style.width = '164px';
    // }
  }

  loginFailed(err: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Login details are invalid!', icon: 'warning' });
    const element = document.getElementById('StudentDashboard');
    if (element) {
      element.hidden = true;
    }
    this.router.navigate(['stuPotal', this.LoginName]);
  }





  getUniversityDetails(): void {
    this.ServicesSM.getUniversityLists('').subscribe({
      next: (response: any) => {
        const data = response.item1 || [];
        this.uniData = response.item1;
      },
      error: () => {

      }
    });
  }
  // Data Properties
  studentName: any;
  courseName: any;
  cgpa: any;
  CurrentYear: any;
  CurrentTerm: any;
  ProgramCode: any;
  SectionCode: any;
  studentStatus: any;

  ContactNo: any;
  getStudentDetail(): void {
    this.isLoading = true;
    this.ServicesSM.getStudentById().pipe(finalize(() => this.isLoading = false))
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
            this.ProgramCode = stuData.programCode

            this.getApplicationDetails(this.RegistrationNo === null ? '' : this.RegistrationNo);
            this.getStuDetailsWithImage(this.RegistrationNo);

          } else {
            this.LoginFailed('Student data not found');
          }
        },
        error: err => this.LoginFailed(err)
      });
  }

  LoginFailed(_NewError: any): void {
    this.isLoginFailed = true;
    Swal.fire({ title: 'Login Failed', text: 'Invalid login or token.', icon: 'warning' });
  }
  private buildForm() {
    // Build FormGroup with all controls from Register-Form.html
    this.form = this.fb.group({
      // Contact Information
      EmailId: [this.EmailId, Validators.required],
      CountryName: ['', Validators.required],
      WhatsAppNo: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      ParentContact: ['', Validators.required],

      // Relative Details
      HasRelativeDetails: ['', Validators.required],
      RelativeName: [''],
      RelativeCountryName: [''],
      RelativeRelation: [''],
      RelativeEmail: [''],
      RelativePhone: [''],

      // University Preferences
      ApplyingOption: ['', Validators.required],
      UniversityOption1: ['', Validators.required],
      UniversityOption2: ['', Validators.required],
      UniversityOption3: ['', Validators.required],

      // Passport & Visa & English
      PassportStatus: ['', Validators.required],
      PassportNumber: [''],
      PassportIssueDate: [''],
      PassportValidUpto: [''],
      IsVisaRejected: ['', Validators.required],
      VisaRejectedReason: [''],
      VisaRejectedCountry: [''],

      EnglishTestType: ['', Validators.required],
      TestName: [''],
      EnglishTestYear: [''], //
      ListeningScore: [''],
      SpeakingScore: [''],
      ReadingScore: [''],
      WritingScore: [''],
      OverallScore: [''],

      // Sponsor / Finance / Declaration
      SponsorType: ['', Validators.required],
      SponsorName: [''],
      SponsorRelation: [''],
      SponsorContact: [''],
      SponsorEmail: [''],
      AvailableFunds: ['', Validators.required],
      AcceptPolicy: [false, Validators.requiredTrue]
    });
    this.form.disable(); // Disable form fields initially
  }
  EmailId: any;
  /** ------------------- Load existing application ------------------- */
  getApplicationDetails(regNo: string): void {
    this.isLoading = true;
    const start = Date.now();
    this.studentService.getStudentDetailsBYId(regNo).subscribe({
      next: (response: any) => {
        try {


          const applicationData = response?.item1?.[0];

          if (!applicationData) {
            this.LoginFailed('Not Valid Application')
            return; // Stop further execution in this path
          }
          this.stuApplication = response.item1[0];
          this.LockedStatus = this.stuApplication.isLocked;
          if (this.LockedStatus) {
            this.currentStep === 5;
            this.moveNextStep();
            // Swal.fire({ title: 'Application Approved', icon: 'success' }).then(() => {
            //            this.router.navigate(['SENextStep', this.LoginName, this.RegistrationNo]);
            //          });
          }
          // alert(this.LockedStatus);
          this.ApplicationId = this.stuApplication.applicationId || null;
          this.EmailId = this.stuApplication.emailId || '';
          this.SectionCode = this.stuApplication.sectionCode;
          // Patch fields into reactive form (map backend keys to form keys)
          this.form.patchValue({
            EmailId: this.stuApplication?.emailId || '',
            CountryName: this.stuApplication.countryName || '',
            WhatsAppNo: this.stuApplication.whatsAppNo || '',
            PhoneNumber: this.stuApplication.phoneNumber || '',
            ParentContact: this.stuApplication.parentContact || '',
            // Check if any relative detail exists to set the HasRelativeDetails flag
            HasRelativeDetails: this.stuApplication.relativeName == 'NA' ? 'No' : 'Yes',
            RelativeName: this.stuApplication.relativeName || '',
            RelativeCountryName: this.stuApplication.relativeCountry || '',
            RelativeRelation: this.stuApplication.relativeRelation || '',
            RelativeEmail: this.stuApplication.relativeEmail || '',
            RelativePhone: this.stuApplication.relativePhone || '',
            ApplyingOption: this.stuApplication.applyingOption || '',
            UniversityOption1: this.stuApplication.universityOption1 || '',
            UniversityOption2: this.stuApplication.universityOption2 || '',
            UniversityOption3: this.stuApplication.universityOption3 || '',
            PassportStatus: this.stuApplication.passportStatus || 'No', // Default to 'No' if null/blank
            PassportNumber: this.stuApplication.passportNumber || '',
            PassportIssueDate: this.formatDateForInput(this.stuApplication.passportIssueDate) || '',
            PassportValidUpto: this.formatDateForInput(this.stuApplication.passportValidUpto) || '',
            IsVisaRejected: this.stuApplication.isVisaRejected === 'Yes' ? 'Yes' : 'No', // Normalize to Yes/No
            VisaRejectedReason: this.stuApplication.visaRejectedReason || '',
            VisaRejectedCountry: this.stuApplication.visaRejectedCountry || '',
            EnglishTestType: this.stuApplication.englishTestType || 'Applied', // Default to 'Applied' if null/blank
            TestName: this.stuApplication.englishTestName,
            TestDate: this.formatDateForInput(this.stuApplication.englishTestYear) || '',
            EnglishTestYear: this.stuApplication.englishTestYear || '',
            ListeningScore: this.stuApplication.listeningScore || '',
            SpeakingScore: this.stuApplication.speakingScore || '',
            ReadingScore: this.stuApplication.readingScore || '',
            WritingScore: this.stuApplication.writingScore || '',
            OverallScore: this.stuApplication.overallScore || '',
            // SponsorType: (this.stuApplication.isSelfFunded=='true' || this.stuApplication.isSelfFunded=='True'|| this.stuApplication.isSelfFunded=='Yes')? 'Parents':'',
            SponsorType: this.stuApplication.sponsorRelation != 'Parent' || this.stuApplication.sponsorRelation != 'Parents' ? 'Other' : 'Parents',
            AvailableFunds: this.stuApplication.availableFunds || '',
            SponsorName: this.stuApplication.sponsorName || '',
            SponsorRelation: this.stuApplication.sponsorRelation || '',
            SponsorEmail: this.stuApplication.sponsorEmail || '',
            SponsorContact: this.stuApplication.sponsorContact || '',
            AcceptPolicy: this.stuApplication.acceptPolicy === 'true' || this.stuApplication.acceptPolicy === true || this.stuApplication.acceptPolicy === 'Yes' || this.stuApplication.acceptPolicy === 'yes'
          });

          // Re-apply form status based on current editing state
          if (!this.isEditingStep[this.currentStep] || this.LockedStatus === true) {
            this.form.disable();
          } else {
            this.form.enable();
          }


          this.populateDocumentFieldsFromApp();

        } finally {
          const elapsed = Date.now() - start;
          const remaining = Math.max(800 - elapsed, 0);
          setTimeout(() => { this.isLoading = false; }, remaining);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        Swal.fire('Error', 'Failed to load application data', 'error');
      }
    });
  }
  /** ------------------- Document Logic Refactoring ------------------- */
  SERVER_BASE_URL: any = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
  private populateDocumentFieldsFromApp(): void {
    if (!this.stuApplication) return;

    const baseUrl = this.SERVER_BASE_URL.endsWith('/') ? this.SERVER_BASE_URL : this.SERVER_BASE_URL + '/';

    this.documentFields.forEach(df => {
      let fileNameFromApi = '';
      let urlPathFromApi = '';

      switch (df.key) {
        case 'consent':
          fileNameFromApi = this.stuApplication.ConsentLetterFileName || '';
          // The API might return a path in one of these fields; if not, we use the filename
          urlPathFromApi = this.stuApplication.consentLetterDocumentPath || fileNameFromApi;
          break;
        case 'resume':
          fileNameFromApi = this.stuApplication.ResumeFileName || '';
          urlPathFromApi = this.stuApplication.resumeDocumentPath || fileNameFromApi;
          break;
        case 'passport':
          fileNameFromApi = this.stuApplication.PassportFileName || '';
          // PassportDocumentPath is explicitly mentioned as the path/URL
          urlPathFromApi = this.stuApplication.PassportDocumentPath || fileNameFromApi;
          break;
        case 'english':
          fileNameFromApi = this.stuApplication.EnglishTestFileName || '';
          urlPathFromApi = this.stuApplication.englishTestDocumentPath || fileNameFromApi;
          break;
        case 'fees':
          fileNameFromApi = this.stuApplication.FeesProofFileName || '';
          urlPathFromApi = this.stuApplication.feesProofDocumentPath || fileNameFromApi;
          break;
      }

      df.fileName = fileNameFromApi;

      // If a path/filename is available, construct the full URL.
      if (urlPathFromApi) {
        // If the path starts with http or is a root path, use it directly (assume it's the full URL)
        if (urlPathFromApi.startsWith('http') || urlPathFromApi.startsWith('/')) {
          df.fileData = urlPathFromApi;
        } else {
          // Otherwise, prepend the base URL and ensure only a single slash separates them
          df.fileData = baseUrl + urlPathFromApi;
          // Clean up any double slashes from concatenation
          df.fileData = df.fileData.replace(/([^:]\/)\/+/g, '$1');
        }
      } else {
        df.fileData = null;
      }
    });
  }

  viewDocument(df: any) {
    if (!df.fileData) {
      Swal.fire('No file available to view', '', 'info');
      return;
    }
    // df.fileData is now a URL/Path, so just open it.
    window.open(df.fileData, '_blank');
  }

  /** ------------------- Step navigation ------------------- */
  moveNextStep() {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'You are currently in edit mode. Please click "Update" to save your changes or "Cancel" to discard them before proceeding to the next step.', 'warning');
      return;
    }
    this.currentStep = 5;
    this.isSubmitted = false;

    this.form.disable();

  }

  nextStep() {
    this.isLoading = true;
    const start = Date.now();
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'You are currently in edit mode. Please click "Update" to save your changes or "Cancel" to discard them before proceeding to the next step.', 'warning');
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, this.stepLabels.length - 1);
    this.isSubmitted = false;

    this.form.disable();
    const elapsed = Date.now() - start;
    const remaining = Math.max(800 - elapsed, 0);
    setTimeout(() => { this.isLoading = false; }, remaining);
  }

  prevStep() {
    this.isLoading = true;
    const start = Date.now();
    // If the user is in edit mode, force them to Update/Cancel first
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'You are currently in edit mode. Please click "Update" to save your changes or "Cancel" to discard them before moving back.', 'warning');
      return;
    }

    if (this.currentStep >= 1) this.currentStep--;
    this.form.disable(); // Ensure form is disabled on navigation
    const elapsed = Date.now() - start;
    const remaining = Math.max(800 - elapsed, 0);
    setTimeout(() => { this.isLoading = false; }, remaining);
  }

  onFilePicked(event: any, key: string): void {
    const target = event.target as HTMLInputElement;
    const file = (target.files as FileList)[0] || null;
    if (!file) return;

    if (file.size > 3148576) {
      Swal.fire({ title: 'File size exceeds 3MB', icon: 'warning' });
      target.value = '';
      return;
    }

    const safeName = this.makeSafeFileName(file.name);
    const f = safeName === file.name ? file : new File([file], safeName, { type: file.type });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.pickedFiles[key] = { file: f, base64, fileName: f.name };

      const df = this.documentFields.find(d => d.key === key);
      if (df) {
        df.fileName = f.name;
      }

      this.uploadDocumentImmediate(key, base64, f.name);
    };
    reader.readAsDataURL(f);
  }

  private uploadDocumentImmediate(key: string, base64: string | null | undefined, fileName: string) {
    const formData = new FormData();
    formData.append('RegistrationNo', this.RegistrationNo || 'NA');
    if (this.ApplicationId) formData.append('ApplicationId', this.ApplicationId);

    // map keys to backend UpdateDocuments expected names
    const map: any = {
      consent: { fileField: 'ConsentLetterData', nameField: 'ConsentLetterFileName' },
      resume: { fileField: 'ResumeFileData', nameField: 'ResumeFileName' },
      passport: { fileField: 'PassportFileData', nameField: 'PassportFileName' },
      english: { fileField: 'EnglishProofData', nameField: 'EnglishProofFileName' },
      fees: { fileField: 'FeesProofData', nameField: 'FeesProofFileName' }
    };

    const d = map[key];
    if (!d) return;

    formData.append(d.nameField, fileName || 'NA');
    formData.append(d.fileField, base64 || '');

    this.isLoading = true;
    const start = Date.now();
    this.studentService.UpdateDocuments(formData)
      .pipe(finalize(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(800 - elapsed, 0);
        setTimeout(() => { this.isLoading = false; }, remaining);
      }))
      .subscribe({
        next: (resp: any) => {
          const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
          if (msg === 'Success') {
            Swal.fire('Uploaded', `${fileName} uploaded successfully`, 'success').then(() => {
              if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
            });
          } else {
            Swal.fire('Error', 'Failed to upload document', 'error');
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Server error while uploading document', 'error');
        }
      });
  }

  /** ------------------- Helpers ------------------- */
  formatDateForInput(dateStr: any): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  makeSafeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  toCamelCase(key: string): string {
    return key.charAt(0).toLowerCase() + key.slice(1);
  }
  PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
  ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
  FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
  ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
  EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';

  onFileSelectedPassportFile(event: any): void {
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

    this.PassportFileData = file;
    this.PassportFileStatus = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.PassportFileData = ssssArray[1];
        this.PassportFileName = file.name;
        this.updateButtonState(); // Call the method to update button state
      };
    }
  }

  onFileSelectedResumeFile(event: any): void {
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
      this.ResumeFileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
        this.ResumeFileName = validFileName;
      };

      return;
    }

    this.ResumeFileData = file;
    this.ResumeFileStatus = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ResumeFileData = ssssArray[1];
        this.ResumeFileName = file.name;
        this.updateButtonState();
      };
    }
  }
  onFileSelectedFeesProof(event: any): void {
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
      this.FeesProofStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
        this.FeesProofFileName = validFileName;
      };

      return;
    }

    this.FeesProofData = file;
    this.FeesProofStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FeesProofData = ssssArray[1];
        this.FeesProofFileName = file.name;
        this.updateButtonState();
      };
    }

  }

  updateButtonState(): void {
    this.hasUploadedDocuments();
  }
  hasUploadedDocuments(): boolean {
    if (!this.stuApplication) return false;
    const feesProofUploaded = !!this.FeesProofFileName || this.stuApplication.feesProofFileName.length != 0;
    const resumeUploaded = !!this.ResumeFileName || this.stuApplication.resumeFileName.length != 0;
    const passportUploaded = !!this.PassportFileName || this.stuApplication.passportFileName.length != 0;
    const consentLetterUploaded = !!this.ConsentLetterFileName || this.stuApplication.consentLetterFileName.length != 0; // Optional

    return feesProofUploaded && resumeUploaded && passportUploaded && consentLetterUploaded;// if needed
  }

  onFileSelectedConsentLetter(event: any): void {
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
    this.ConsentLetterStatus = true;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.ConsentLetterData = ssssArray[1];
        this.ConsentLetterFileName = file.name;
        this.updateButtonState();
      };
    }
  }
  onFileSelectedEnglishProof(event: any): void {
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
      this.EnglishProofStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.EnglishProofData = ssssArray[1];
        this.EnglishProofFileName = validFileName;
      };

      return;
    }

    this.EnglishProofData = file;
    this.EnglishProofStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.EnglishProofData = ssssArray[1];
        this.EnglishProofFileName = file.name;
        this.updateButtonState(); // Call the method to update button state
      };
    }
  }
  serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';




  Onsubmit(): void {
    if (this.RegistrationNo && this.ApplicationId) {
      const formData = new FormData();
      formData.append('RegistrationNo', this.RegistrationNo);
      formData.append('ApplicationId', this.ApplicationId);
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


      this.isLoading = true;
      const start = Date.now();
      this.studentService.UpdateDocuments(formData)
        .pipe(finalize(() => {
          const elapsed = Date.now() - start;
          const remaining = Math.max(800 - elapsed, 0);
          setTimeout(() => { this.isLoading = false; }, remaining);
        }))
        .subscribe({
          next: (resp: any) => {
            const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
            if (msg === 'Success') {
              Swal.fire({ title: 'Documents Updated', icon: 'success' }).then(() => {
                this.isEditingStep[4] = false;
                if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
              });
            } else {
              Swal.fire({ title: 'Error', text: 'Failed to update documents', icon: 'error' });
            }
          },
          error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' })
        });
    }
  }



  // Documents

  otherDocumentKeys: string[] = [];

  // Courses
  courseRows: CourseRow[] = [];
  isSavingCourses = false;




  // ---------------- COURSES ----------------
  initializeCourseRowsFromData(): void {
    if (this.stuApplication?.courseCovered && Array.isArray(this.stuApplication.courseCovered) && this.stuApplication.courseCovered.length) {
      this.courseRows = this.stuApplication.courseCovered.map((c: any) => ({
        courseName: c.courseName || '',
        courseCode: c.courseCode || '',
        hours: c.hours ?? null,
        fileName: c.fileName || null,
        file: null,
        fileData: null
      }));
    } else {
      this.courseRows = [
        { courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null },
        { courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null },
        { courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null }
      ];
    }
  }

  addCourseRow(): void {
    this.courseRows.push({ courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null });
  }

  removeCourseRow(index: number): void {
    this.courseRows.splice(index, 1);
  }

  onCourseFilePicked(event: any, index: number): void {
    const target = event.target as HTMLInputElement;
    const file = (target.files as FileList)[0] || null;
    if (!file) return;
    if (file.size > 3148576) {
      Swal.fire({ title: 'File size exceeds 3MB', icon: 'warning' });
      target.value = '';
      return;
    }
    const safeName = this.makeSafeFileName(file.name);
    const f = safeName === file.name ? file : new File([file], safeName, { type: file.type });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.courseRows[index].file = f;
      this.courseRows[index].fileName = f.name;
      this.courseRows[index].fileData = base64;
    };
    reader.readAsDataURL(f);
  }

  downloadCourseFile(index: number, evt: Event) {
    evt.preventDefault();
    const row = this.courseRows[index];
    if (!row.fileData || !row.fileName) {
      Swal.fire('No file available to download');
      return;
    }
    const link = document.createElement('a');
    link.href = 'data:application/octet-stream;base64,' + row.fileData;
    link.download = row.fileName;
    link.click();
  }

  saveAllCourseCovered(): void {
    for (let i = 0; i < this.courseRows.length; i++) {
      const r = this.courseRows[i];
      if (!r.courseName || !r.courseCode) {
        Swal.fire({ title: 'Validation', text: `Please fill Course Name and Course Code for row ${i + 1}`, icon: 'warning' });
        return;
      }
      if (!r.fileData) {
        Swal.fire({ title: 'Validation', text: `Please upload a document for row ${i + 1}`, icon: 'warning' });
        return;
      }
    }

    const formData = new FormData();
    formData.append('RegistrationNo', this.RegistrationNo || 'NA');

    const metadata: any[] = [];
    this.courseRows.forEach((r, idx) => {
      metadata.push({ courseName: r.courseName, courseCode: r.courseCode, hours: r.hours ?? 0, fileName: r.fileName || 'NA' });
      formData.append(`CourseFileData${idx}`, r.fileData || 'NA');
      formData.append(`CourseFileName${idx}`, r.fileName || 'NA');
    });

    formData.append('CourseCoveredMetadata', JSON.stringify(metadata));

    this.isSavingCourses = true;
    const start = Date.now();

    this.studentService.updateApplicationDetails(formData)
      .pipe(finalize(() => {
        this.isSavingCourses = false;
        const elapsed = Date.now() - start;
        const remaining = Math.max(800 - elapsed, 0);
        setTimeout(() => { /* noop */ }, remaining);
      }))
      .subscribe({
        next: (resp: any) => {
          const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
          if (msg === 'Success') {
            Swal.fire({ title: 'Saved', text: 'Course covered details uploaded successfully', icon: 'success' }).then(() => {
              this.getApplicationDetails(this.RegistrationNo);
            });
          } else {
            Swal.fire({ title: 'Error', text: 'Failed to save course covered details', icon: 'error' });
          }
        },
        error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' })
      });
  }

  GetStudentApplication(Regno: any): void {
    if (this.LoginName && Regno) {
      this.router.navigateByUrl(`ApplicationDetails/${this.LoginName}/${Regno}/Student`);
    } else {
      Swal.fire('Navigation Error', 'Login name or registration number is missing.', 'error');
    }
  }
}

type CourseRow = {
  courseName?: string | null;
  courseCode?: string | null;
  hours?: number | null;   // <-- allow null
  file?: File | null;
  fileName?: string | null;
  fileData?: string | null;
};


interface Application {
  applicationId: string;
  registrationNo: string;
  phoneNumber: string;
  whatsAppNo: string;
  parentContact: string;
  counsellingStatus: string;
  isApproved: string;
  dealingUId: string;
  dealingUserInterviewRemarks: string;
  dealingHODId: string;
  dealingHODRemarks: string;
  dealingHow: string;
  dealingFaculty: string;
  dealingAuthority: string;
  counsellingRemarks: string;
  isdealingFaculty: boolean;
  isDealingAuthority: boolean;
  isHOD: boolean;
  isHoW: boolean;
};