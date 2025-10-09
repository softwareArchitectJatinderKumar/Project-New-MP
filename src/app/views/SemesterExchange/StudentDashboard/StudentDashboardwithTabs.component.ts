import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

// keep the same service imports as your project
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';
import { countries } from '../countries-list'; // Assuming countries-list.ts exists and exports 'countries'


type CourseRow = {
  courseName?: string |null;
  courseCode?: string  | null;
  hours?: number | null;   // <-- allow null
  file?: File | null;
  fileName?: string | null;
  fileData?: string | null;
};

 
  @Component({
    selector: 'app-student-dashboard-refactor',
    templateUrl: './StudentDashboardwithTabs.components.html',
    styleUrls: ['./StudentDashboard.component.css']
  })

  
 
 
    export class StudentDashboardwithTabs implements OnInit {
      countriesList: any = countries; // Ensure 'countries' is correctly imported
      // UI / state
      isLoading = false;
      isSavingCourses = false;
      isLoginFailed = false;
      activeTab: 'application' | 'documents' | 'courses' = 'application';
    
      // Forms and toggles
      applicationForm!: FormGroup;
      isSection1Edit = false;
      isSection2Edit = false;
      ApplicationId:any;
      // Data
      stuApplication: any;
      universityOptions: any[] = [];
      serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
    
      // Keys (used in template)
      personalKeys = ['registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'];
      // Added relative keys here for consistency, though they are explicitly defined in HTML
      relativeKeys = ['relativeName', 'relativeRelation', 'relativeCountry']; 
      universityKeys = ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'];
      passportKeys = ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'];
      visaKeys = ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'];
      englishKeys = ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'];
      sponsorKeys = ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'];
      financeKeys = ['availableFunds', 'acceptPolicy'];//, 'totalCountGradeF'
      alwaysDisabledKeys = ['registrationNo', 'emailId', 'applicationId', 'acceptPolicy'];// , 'totalCountGradeF'
    
      applyingOptions = ['Spring', 'Fall'];
      YesNoOptions = ['Yes', 'No'];
    
      // Documents
      documentFields = [
        { key: 'feesProof', label: 'Fees Proof Document' },
        { key: 'resume', label: 'Resume Document' },
        { key: 'consent', label: 'Consent Letter' },
        { key: 'passport', label: 'Passport Document' }
      ];
      pickedFiles: { [key: string]: { file: File | null, base64?: string | null, fileName?: string | null } } = {
        feesProof: { file: null, base64: null, fileName: null },
        resume: { file: null, base64: null, fileName: null },
        consent: { file: null, base64: null, fileName: null },
        passport: { file: null, base64: null, fileName: null }
      };
      otherDocumentKeys: string[] = [];
    
      // Courses
      courseRows: CourseRow[] = [];
    
      // route params
      LoginName: any;
      RegistrationNo: any;
    
      // student image
      studentDetailsWithImage: any;
      StudentImage: string | null = null;
    
      constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private storageService: StorageService,
        private studentService: SemesterExchangeStuDetailsService,
        private ServicesSM: SemesterExchangeStuDetailsService,
        private route: ActivatedRoute,
        private title: Title
      ) { }
    
      ngOnInit(): void {
       
    
        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester <span class="text-info">Exchange </span> Student Dashboard' ;
        (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
        this.title.setTitle('Student Dashboard');
        // Create at least an empty form to avoid template errors
        this.initializeEmptyForm();
    
        this.LoginName = this.route.snapshot.params['LoginName'];
        this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
    
        if (this.LoginName) {
          this.getToken(this.LoginName);
        }
      }
    
      private initializeEmptyForm(): void {
        // Build an empty form with all personalKeys controls to avoid undefined .get()
        const controls: any = {};
        // Include new relative keys in the allKeys array
        const allKeys = [...this.personalKeys, ...this.relativeKeys, ...this.universityKeys, ...this.passportKeys, ...this.visaKeys, ...this.englishKeys, ...this.sponsorKeys, ...this.financeKeys, 'applicationId'];
        allKeys.forEach(key => {
          // For checkbox acceptPolicy we initialize false
          if (key === 'acceptPolicy') {
            controls[key] = [{ value: false, disabled: this.alwaysDisabledKeys.includes(key) }];
          } else if (this.alwaysDisabledKeys.includes(key)) {
            controls[key] = [{ value: '', disabled: true }];
          } else {
            controls[key] = [''];
          }
        });
        this.applicationForm = this.fb.group(controls);
        this.applicationForm.disable(); // default disabled
      }
    
      // ---------------- AUTH & INITIAL LOAD ----------------
      getToken(loginName: string): void {
        this.authService.loginTemp(loginName).subscribe({
          next: data => {
            this.storageService.saveUser(data);
            const authToken = this.storageService.getUser();
            if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
              this.isLoginFailed = true;
              this.loginFailed('Invalid or expired token');
            } else {
              this.getUniversityDetails();
            }
          },
          error: err => this.loginFailed(err)
        });
    
        const el = document.getElementById('stMain');
        if (el) el.innerHTML = 'Semester Exchange <span class="themeClr">Student Dashboard</span>';
      }
    
      loginFailed(err: any): void {
        this.isLoginFailed = true;
        Swal.fire({ title: 'Login Failed', text: 'Login details are invalid!', icon: 'warning' });
      }
    
      getUniversityDetails(): void {
        this.ServicesSM.getUniversityDetails().subscribe({
          next: (response: any) => {
            const data = response.item1 || [];
            this.universityOptions = data.map((u: any) => ({ universityId: u.universityId, universityName: u.universityName }));
            this.getApplicationDetails(this.RegistrationNo);
          },
          error: () => {
            this.getApplicationDetails(this.RegistrationNo);
          }
        });
      }
    
      getApplicationDetails(regId: string): void {
        this.isLoading = true;
        this.studentService.getStudentDetailsBYId(regId).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response?.item1?.length > 0) {
              this.stuApplication = response.item1[0];
              // console.log(JSON.stringify(this.stuApplication))
              this.ApplicationId = this.stuApplication.applicationId;
              this.detectOtherDocs();
              this.buildApplicationForm();     // re-build form with real values
              this.populateForms();            // patch values
              this.initializeCourseRowsFromData();
              this.getStuDetailsWithImage(this.stuApplication.registrationNo); // load photo
            } else {
              this.loginFailed('No application data');
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.loginFailed(err);
          }
        });
      }
    
      detectOtherDocs(): void {
        if (!this.stuApplication) return;
        const known = ['feesProofDocumentPath', 'resumeDocumentPath', 'consentLetterDocumentPath', 'passportDocumentPath'];
        this.otherDocumentKeys = Object.keys(this.stuApplication).filter(k => !known.includes(k) && k.toLowerCase().includes('documentpath'));
      }
    
      // ---------------- FORM BUILD ----------------
      private buildApplicationForm(): void {
        // Build fresh form with controls and validators using stuApplication values
        const cfg: any = {
          applicationId: [{ value: this.stuApplication?.applicationId || '', disabled: true }],
          registrationNo: [{ value: this.stuApplication?.registrationNo || '', disabled: this.alwaysDisabledKeys.includes('registrationNo') }],
          emailId: [{ value: this.stuApplication?.emailId || '', disabled: this.alwaysDisabledKeys.includes('emailId') }],
          countryName: [this.stuApplication?.countryName || '', Validators.required],
          whatsAppNo: [this.stuApplication?.whatsAppNo || '', Validators.required],
          phoneNumber: [this.stuApplication?.phoneNumber || '', Validators.required],
          parentContact: [this.stuApplication?.parentContact || '', Validators.required],
          applyingOption: [this.stuApplication?.applyingOption || '', Validators.required],
          universityOption1: [this.stuApplication?.universityOption1 || '', Validators.required],
          universityOption2: [this.stuApplication?.universityOption2 || '', Validators.required],
          universityOption3: [this.stuApplication?.universityOption3 || '', Validators.required],
          passportStatus: [this.stuApplication?.passportStatus || '', Validators.required],
          passportNumber: [this.stuApplication?.passportNumber || '', Validators.required],
          passportIssueDate: [this.formatDateForInput(this.stuApplication?.passportIssueDate) || '', Validators.required],
          passportValidUpto: [this.formatDateForInput(this.stuApplication?.passportValidUpto) || '', Validators.required],
          isVisaRejected: [this.stuApplication?.isVisaRejected || '', Validators.required],
          visaRejectedReason: [this.stuApplication?.visaRejectedReason || ''],
          visaRejectedCountry: [this.stuApplication?.visaRejectedCountry || ''],
          englishTestType: [this.stuApplication?.englishTestType || '', Validators.required],
          speakingScore: [this.stuApplication?.speakingScore || ''],
          listeningScore: [this.stuApplication?.listeningScore || ''],
          readingScore: [this.stuApplication?.readingScore || ''],
          writingScore: [this.stuApplication?.writingScore || ''],
          overallScore: [this.stuApplication?.overallScore || ''],
          englishTestYear: [this.stuApplication?.englishTestYear || ''],
          isSelfFunded: [this.stuApplication?.isSelfFunded || '', Validators.required],
          sponsorName: [this.stuApplication?.sponsorName || ''],
          sponsorRelation: [this.stuApplication?.sponsorRelation || ''],
          sponsorContact: [this.stuApplication?.sponsorContact || ''],
          sponsorEmail: [this.stuApplication?.sponsorEmail || ''],
          availableFunds: [this.stuApplication?.availableFunds || '', Validators.required],
          acceptPolicy: [this.stuApplication?.acceptPolicy === 'true' || false, Validators.requiredTrue],
          // totalCountGradeF: [this.stuApplication?.totalCountGradeF || '', Validators.required]
          relativeName: [this.stuApplication?.relativeName || ''],
          relativeRelation: [this.stuApplication?.relativeRelation || ''],
          relativeCountry: [this.stuApplication?.relativeCountry || ''],
        };
    
        this.applicationForm = this.fb.group(cfg);
        this.applicationForm.disable();
      }
    
      populateForms(): void {
        if (!this.applicationForm) return;
        this.applicationForm.patchValue({
          ...this.stuApplication,
          acceptPolicy: this.stuApplication?.acceptPolicy === 'Yes' || this.stuApplication?.acceptPolicy === 'yes' ,
          passportIssueDate: this.formatDateForInput(this.stuApplication?.passportIssueDate),
          passportValidUpto: this.formatDateForInput(this.stuApplication?.passportValidUpto),
          relativeName: this.stuApplication?.relativeName,
          relativeRelation: this.stuApplication?.relativeRelation,
          relativeCountry: this.stuApplication?.relativeCountry,
          policyAccepted: this.stuApplication?.policyAccepted,
        });
      }
    
      // ---------------- TABS ----------------
      selectTab(tab: 'application' | 'documents' | 'courses'): void {
        this.activeTab = tab;
      }
    
      // ---------------- SECTION 1 ----------------
      enableSection1Edit(): void {
        this.isSection1Edit = true;
        this.applicationForm.enable();
        this.alwaysDisabledKeys.forEach(k => {
          const c = this.applicationForm.get(k);
          if (c) c.disable();
        });
      }
    
      isFieldInvalidApplication(field: string): boolean {
        const control = this.applicationForm?.get(field);
        return !!(control && control.invalid && (control.touched || control.dirty));
      }
    
      getFirstErrorApplication(field: string): string | null {
        const control = this.applicationForm?.get(field);
        if (!control || !control.errors) return null;
        if (control.errors.required) return `${this.beautifyLabel(field)} is required`;
        if (control.errors.email) return 'Invalid email';
        return 'Invalid';
      }
    
      updateApplicationSection(): void {
        if (this.applicationForm.invalid) {
          this.applicationForm.markAllAsTouched();
          Swal.fire({ title: 'Validation', text: 'Please fill required fields', icon: 'warning' });
          return;
        }
    
        const formData = new FormData();
        const raw = this.applicationForm.getRawValue();
        const fieldsToAppend = [
          "RegistrationNo", "ApplicationId", "EmailId", "CountryName", "WhatsAppNo",
          "PhoneNumber", "ParentContact", "ApplyingOption", "UniversityOption1",
          "UniversityOption2", "UniversityOption3", "PassportStatus", "PassportNumber",
          "PassportIssueDate", "PassportValidUpto", "IsVisaRejected", "VisaRejectedReason",
          "VisaRejectedCountry", "EnglishTestType", "SpeakingScore", "ListeningScore",
          "ReadingScore", "WritingScore", "OverallScore", "EnglishTestYear",
          "IsSelfFunded", "SponsorName", "SponsorRelation", "SponsorContact", "SponsorEmail",
          "AvailableFunds", //, "TotalCountGradeF"
          "RelativeName",      "RelativeRelation", "RelativeCountry"
        ];
    
        fieldsToAppend.forEach(k => {
          const value = raw[this.toCamelCase(k)] ?? raw[k] ?? 'NA';
          formData.append(k, value !== null && value !== undefined ? String(value) : 'NA');
        });
    
        this.isLoading = true;
        const start = Date.now();
        this.studentService.updateApplicationDetails(formData)
          .pipe(finalize(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(800 - elapsed, 0);
            setTimeout(() => { this.isLoading = false; }, remaining);
          }))
          .subscribe({
            next: (resp: any) => {
              const msg = resp?.[0]?.msg || resp?.item1?.[0]?.msg;
              if (msg === 'Success') {
                Swal.fire({ title: 'Updated', text: 'Application details updated successfully', icon: 'success' }).then(() => {
                  this.isSection1Edit = false;
                  this.applicationForm.disable();
                  this.getApplicationDetails(this.RegistrationNo);
                });
              } else {
                Swal.fire({ title: 'Error', text: 'Failed to update application', icon: 'error' });
              }
            },
            error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' })
          });
      }
    
      // ---------------- SECTION 2 (Documents) ----------------
      enableSection2Edit(): void {
        this.isSection2Edit = true;
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
        };
        reader.readAsDataURL(f);
      }
    
      updateDocumentsSection(): void {
        const formData = new FormData();
        formData.append('RegistrationNo', this.RegistrationNo || (this.applicationForm?.get('registrationNo')?.value || 'NA'));
    
        const docsMap = [
          { key: 'feesProof', fileField: 'FeesProofData', nameField: 'FeesProofFileName' },
          { key: 'resume', fileField: 'ResumeFileData', nameField: 'ResumeFileName' },
          { key: 'consent', fileField: 'ConsentLetterData', nameField: 'ConsentLetterFileName' },
          { key: 'passport', fileField: 'PassportFileData', nameField: 'PassportFileName' }
        ];
    
        docsMap.forEach(d => {
          const picked = this.pickedFiles[d.key];
          if (picked && picked.file) {
            formData.append(d.nameField, picked.fileName || picked.file.name);
            formData.append(d.fileField, picked.base64 || '');
          } else {
            const existingPath = this.getExistingDocPathForKey(d.key);
            if (!existingPath) {
              formData.append(d.nameField, 'NA');
              formData.append(d.fileField, 'NA');
            }
          }
        });
    
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
                  this.isSection2Edit = false;
                  this.getApplicationDetails(this.RegistrationNo);
                });
              } else {
                Swal.fire({ title: 'Error', text: 'Failed to update documents', icon: 'error' });
              }
            },
            error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' })
          });
      }
    
      getDocumentPath(key: string): string | null {
        if (!this.stuApplication) return null;
        switch (key) {
          case 'feesProof': return this.stuApplication.feesProofDocumentPath;
          case 'resume': return this.stuApplication.resumeDocumentPath;
          case 'consent': return this.stuApplication.consentLetterDocumentPath;
          case 'passport': return this.stuApplication.passportDocumentPath;
          default: return this.stuApplication?.[key] ?? null;
        }
      }
    
      private getExistingDocPathForKey(key: string): string | null {
        return this.getDocumentPath(key);
      }
    
  
    // // File data and status
    PassportFileData: any = ''; PassportFileStatus: boolean = false; PassportFileName: any = '';
    ResumeFileData: any = ''; ResumeFileStatus: boolean = false; ResumeFileName: any = '';
    FeesProofData: any = ''; FeesProofStatus: boolean = false; FeesProofFileName: any = '';
    ConsentLetterData: any = ''; ConsentLetterStatus: boolean = false; ConsentLetterFileName: any = '';
    EnglishProofData: any = ''; EnglishProofStatus: boolean = false; EnglishProofFileName: any = '';
  
  
    // PassportFileData: any; PassportFileStatus: boolean = false;
    // PassportFileName: any;
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
      // alert(10);  
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
  
    // ResumeFileData: any; ResumeFileStatus: boolean = false;
    // ResumeFileName: any;
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
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this.ResumeFileData = ssssArray[1];
          this.ResumeFileName = file.name;
          this.updateButtonState(); // Call the method to update button state
        };
      }
    }
  
    // FeesProofData: any; FeesProofStatus: boolean = false;
    // FeesProofFileName: any;
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
          this.FeesProofFileName = file.name; // Set the filename
          this.updateButtonState(); // Call the method to update button state
        };
      }
    
    }
  
    updateButtonState(): void {
      // This will trigger Angular's change detection
      this.hasUploadedDocuments();
    }
    hasUploadedDocuments(): boolean {
      if (!this.stuApplication) return false;
    
      // Check if each document is uploaded
      const feesProofUploaded = !!this.FeesProofFileName || this.stuApplication.feesProofFileName.length!=0 ;
      const resumeUploaded = !!this.ResumeFileName || this.stuApplication.resumeFileName.length!=0 ;
      const passportUploaded = !!this.PassportFileName || this.stuApplication.passportFileName.length!=0 ;
      const consentLetterUploaded = !!this.ConsentLetterFileName ||this.stuApplication.consentLetterFileName.length!=0 ; // Optional
    
      // Return true if all required documents are uploaded
      return feesProofUploaded && resumeUploaded && passportUploaded && consentLetterUploaded;// if needed
    }
    
    // ConsentLetterData: any; ConsentLetterStatus: boolean = false;
    // ConsentLetterFileName: any;
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
      // alert(10);  
      if (file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const ssss = reader.result as string;
          const ssssArray = ssss.split(',');
          this.ConsentLetterData = ssssArray[1];
          this.ConsentLetterFileName = file.name;
          this.updateButtonState(); // Call the method to update button state
        };
      }
    }
    
    // EnglishProofData: any; EnglishProofStatus: boolean = false;
    // EnglishProofFileName: any;
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
  
  
    Onsubmit(): void {
      const formData = new FormData();
      formData.append('RegistrationNo', this.RegistrationNo);   
      formData.append('ApplicationId', this.ApplicationId);   
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
                this.isSection2Edit = false;
                this.getApplicationDetails(this.RegistrationNo);
              });
            } else {
              Swal.fire({ title: 'Error', text: 'Failed to update documents', icon: 'error' });
            }
          },
          error: () => Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' })
        });
    }
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
  
    // ---------------- HELPERS ----------------
    beautifyLabel(label: string): string {
      if (!label) return label;
      return label.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  
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
  }
  