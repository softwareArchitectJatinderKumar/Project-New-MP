// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subject } from 'rxjs';
// import { finalize, takeUntil } from 'rxjs/operators';
// import Swal from 'sweetalert2';

// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { countries } from './countries-list';

// import {
//   StudentApplication, StageDetailRow, CourseRow, FileSelectedEvent,
//   Country, University, STEP_LABELS,
// } from './models/application.models';

// @Component({
//   selector: 'app-edit-application',
//   templateUrl: './Edit-applicationData.html',
//   styleUrls: ['./edit-application.component.scss'],
// })
// export class EditApplicationComponent implements OnInit, OnDestroy {
//   // ── State ──────────────────────────────────────────────────────────────────
//   isLoading = false;
//   isSubmitted = false;
//   isLoginFailed = false;
//   currentStep = 0;
//   isEditingStep: boolean[] = [false, false, false, false, false];

//   // ── Route data ─────────────────────────────────────────────────────────────
//   LoginName!: string;
//   RegistrationNo!: string;
//   ApplicationId!: string;

//   // ── API data ───────────────────────────────────────────────────────────────
//   stuApplication!: StudentApplication;
//   uniData: University[] = [];
//   StagesDetail: StageDetailRow[] = [];
//   StageDocumentData: StageDetailRow[] = [];
//   courseRows: CourseRow[] = [];
//   isSavingCourses = false;

//   // ── Stage 2 specific data ──────────────────────────────────────────────────
//   stage2RequiredDocuments: StageDetailRow[] = []; // All required Stage 2 docs
//   stage2DocumentMap: Map<string, StageDetailRow> = new Map(); // For quick lookup of uploaded docs

//   // ── Student display ────────────────────────────────────────────────────────
//   studentName = ''; courseName = ''; cgpa = '';
//   CurrentYear = ''; CurrentTerm = ''; ProgramCode = '';
//   SectionCode = ''; studentStatus = '';
//   StudentImage: string | null = null;
//   studentDetailsWithImage: any;
//   EmailId = '';

//   // ── Staff display ──────────────────────────────────────────────────────────
//   DealingFacultyName = ''; CounsellingAuthorityName = '';
//   LockedStatus = false;
//   isApprovedApplication = false;
//   activeMainTab: 'application' | 'stage1' | 'stage2' | 'course' = 'application';
//   CounsellingAuthority: any; DealingHodId: any; DealingFaculty: any;
//   ApprovedUniversity: string;
//   IsApproved: string | number | boolean | null | undefined;

//   /** Locked + not approved → edit allowed on My Application & Stage I */
//   // get canEditApplication(): boolean {
//   //   return this.LockedStatus && !this.isApprovedApplication;
//   // }

//     get canEditApplication(): boolean {
//     return !this.LockedStatus && !this.isApprovedApplication;
//   }
//   get showStage2Tab(): boolean {
//     return this.LockedStatus;
//   }

//   get showCourseTab(): boolean {
//     return this.LockedStatus;
//   }

//   // ── Config ─────────────────────────────────────────────────────────────────
//   readonly countries: Country[] = countries;
//   readonly stepLabels: string[] = STEP_LABELS;
//   readonly localServerUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
//   readonly serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';

//   // ── Form ───────────────────────────────────────────────────────────────────
//   form!: FormGroup;

//   private isLoadingData = false;
//   private readonly destroy$ = new Subject<void>();

//   constructor(
//     private fb: FormBuilder,
//     private studentService: SemesterExchangeStuDetailsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private authService: AuthService,
//     private storageService: StorageService,
//   ) {}
  
//   // ── Lifecycle ──────────────────────────────────────────────────────────────
//   ngOnInit(): void {
//     this.LoginName = this.route.snapshot.params['LoginName'];
//     this.RegistrationNo = this.route.snapshot.params['RegistrationNo'] ?? null;
//     if (this.LoginName) {
//       this.getToken(this.LoginName);
//       this.getUniversityDetails();
//     }
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ── Step validity (pure, no side-effects) ──────────────────────────────────
//   isCurrentStepValid(step: number): boolean {
//     if (!this.form) return false;
//     const val = (key: string) => this.form.get(key)?.value;
//     const has = (key: string) => !!val(key);

//     if (step === 1) {
//       const base = ['EmailId', 'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact', 'HasRelativeDetails'];
//       if (base.some(k => !has(k))) return false;
//       if (val('HasRelativeDetails') === 'Yes') {
//         return has('RelativeName') && has('RelativeRelation') && has('RelativeCountryName');
//       }
//       return true;
//     }
//     if (step === 2) {
//       return ['ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3'].every(has);
//     }
//     if (step === 3) {
//       if (!['PassportStatus', 'IsVisaRejected', 'EnglishTestType', 'SponsorType', 'AvailableFunds'].every(has)) return false;
//       if (val('PassportStatus') === 'Yes' && (!has('PassportNumber') || !has('PassportIssueDate') || !has('PassportValidUpto'))) return false;
//       if (val('IsVisaRejected') === 'Yes' && (!has('VisaRejectedReason') || !has('VisaRejectedCountry'))) return false;
//       if (val('EnglishTestType') === 'Appeared' && (!has('TestName') || !/^\d{4}$/.test(String(val('EnglishTestYear') ?? '')))) return false;
//       if (val('EnglishTestType') === 'Applied' && !has('TestName')) return false;
//       return true;
//     }
//     return true;
//   }

//   // ── Edit controls ──────────────────────────────────────────────────────────
//   startEdit(step: number): void {
//     if (step >= 1 && step <= 4 && (this.LockedStatus ? this.activeMainTab === 'application' : this.currentStep === step)) {
//       if (this.LockedStatus && !this.canEditApplication) return;
//       this.isEditingStep[step] = true;
//       this.form.enable();
//     }
//   }

//   cancelEdit(step: number): void {
//     this.isEditingStep[step] = false;
//     this.form.disable();
//     if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
//   }

//   updateStep(step: number): void {
//     this.isSubmitted = true;
//     if (!this.isCurrentStepValid(step)) {
//       Swal.fire('Validation Required', 'Please fill all required fields before updating.', 'warning');
//       return;
//     }
//     const formData = this.buildUpdateFormData();
//     this.isLoading = true;
//     this.studentService.updateApplicationDetails(formData)
//       .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Updated', 'Details updated successfully', 'success');
//             this.isEditingStep[step] = false;
//             this.form.disable();
//             if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
//           } else {
//             Swal.fire('Error', 'Failed to update', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error while updating', 'error'),
//       });
//   }

//   // ── Navigation ─────────────────────────────────────────────────────────────
//   nextStep(): void {
//     if (this.isEditingStep[this.currentStep]) {
//       Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving on.', 'warning');
//       return;
//     }
//     if (this.currentStep < this.stepLabels.length - 1) {
//       this.currentStep++;
//       window.scrollTo(0, 0);
//     }
//   }

//   prevStep(): void {
//     if (this.currentStep > 0) this.currentStep--;
//     window.scrollTo(0, 0);
//   }

//   goToStep(step: number): void {
//     if (this.isEditingStep[this.currentStep]) {
//       Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving on.', 'warning');
//       return;
//     }
//     if (step < this.currentStep || step === this.currentStep) {
//       this.currentStep = step;
//       window.scrollTo(0, 0);
//     }
//   }

//   // ── Tab switching (locked mode) ─────────────────────────────────────────────
//   setMainTab(tab: 'application' | 'stage1' | 'stage2' | 'course'): void {
//     if (this.isEditingStep.some(e => e)) {
//       Swal.fire('Please Update or Cancel', 'Save or cancel changes before switching tabs.', 'warning');
//       return;
//     }
//     this.activeMainTab = tab;
//   }

//   // ── Viewing ────────────────────────────────────────────────────────────────
//   viewDocument(doc: any): void {
//     if (!doc || !doc.document) {
//       Swal.fire('Error', 'Document not found', 'error');
//       return;
//     }
//     const fileUrl = this.serverUrl + doc.document;
//     window.open(fileUrl, '_blank');
//   }

//   // ── File operations ─────────────────────────────────────────────────────────
//   onFileSelected(event: FileSelectedEvent): void {
//     if (!event || !event.file) return;
//     const isLoading = (state: boolean) => this.isLoading = state;
//     isLoading(true);
//     this.studentService.uploadStudentDocument(event.file, this.RegistrationNo, this.ApplicationId ?? 'NA')
//       .pipe(finalize(() => isLoading(false)), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Uploaded', 'Document uploaded successfully', 'success');
//             this.isEditingStep[4] = false;
//             if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
//           } else {
//             Swal.fire('Error', 'Failed to upload', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error while uploading', 'error'),
//       });
//   }

//   onStageFilePicked(event: FileSelectedEvent): void {
//     if (!event || !event.file) return;
//     const isLoading = (state: boolean) => this.isLoading = state;
//     isLoading(true);
//     this.studentService.uploadStudentDocument(event.file, this.RegistrationNo, this.ApplicationId ?? 'NA')
//       .pipe(finalize(() => isLoading(false)), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Uploaded', 'Document uploaded successfully', 'success');
//             this.getStageDocumentDetails();
//             this.mapStage2Documents(); // Re-map after upload
//           } else {
//             Swal.fire('Error', 'Failed to upload', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error while uploading', 'error'),
//       });
//   }

//   uploadStageDocumentRow(event: any): void {
//     if (!event || !event.file) return;
//     const isLoading = (state: boolean) => this.isLoading = state;
//     isLoading(true);
//     this.studentService.uploadStudentDocument(event.file, this.RegistrationNo, this.ApplicationId ?? 'NA')
//       .pipe(finalize(() => isLoading(false)), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Uploaded', 'Document uploaded successfully', 'success');
//             this.getStageDocumentDetails();
//             this.mapStage2Documents(); // Re-map after upload
//           } else {
//             Swal.fire('Error', 'Failed to upload', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error while uploading', 'error'),
//       });
//   }

//   onCourseFilePicked(event: FileSelectedEvent): void {
//     if (!event || !event.rowIndex === undefined || !event.file) return;
//     const isLoading = (state: boolean) => this.isSavingCourses = state;
//     isLoading(true);
//     this.studentService.uploadCourseFile(event.file, this.RegistrationNo, this.ApplicationId ?? 'NA', event.rowIndex)
//       .pipe(finalize(() => isLoading(false)), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Uploaded', 'Course file uploaded', 'success');
//             this.initCourseRows();
//           } else {
//             Swal.fire('Error', 'Upload failed', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error', 'error'),
//       });
//   }

//   addCourseRow(): void {
//     if (this.courseRows.length < 5) {
//       this.courseRows = [...this.courseRows, { courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null }];
//     }
//   }

//   removeCourseRow(index: number): void {
//     if (this.courseRows.length > 1) {
//       this.courseRows.splice(index, 1);
//       this.courseRows = [...this.courseRows];
//     }
//   }

//   saveAllCourseCovered(): void {
//     if (!this.courseRows.some(r => r.courseName || r.courseCode)) {
//       Swal.fire('Validation', 'Add at least one course', 'warning');
//       return;
//     }
//     const isLoading = (state: boolean) => this.isSavingCourses = state;
//     isLoading(true);
//     const fd = new FormData();
//     fd.append('RegistrationNo', this.RegistrationNo ?? 'NA');
//     if (this.ApplicationId) fd.append('ApplicationId', this.ApplicationId);
//     fd.append('courses', JSON.stringify(this.courseRows.map(r => ({
//       courseName: r.courseName || '',
//       courseCode: r.courseCode || '',
//       hours: r.hours || 0,
//     }))));
//     this.studentService.updateCoursesCovered(fd)
//       .pipe(finalize(() => isLoading(false)), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Saved', 'Courses saved successfully', 'success');
//             this.initCourseRows();
//           } else {
//             Swal.fire('Error', 'Failed to save', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error', 'error'),
//       });
//   }

//   submitDocuments(): void {
//     this.isLoading = true;
//     this.studentService.submitApplicationDocuments(this.RegistrationNo, this.ApplicationId ?? 'NA')
//       .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           if (this.isMsgSuccess(resp)) {
//             Swal.fire('Submitted', 'Documents submitted successfully', 'success');
//             this.isEditingStep[4] = false;
//             if (this.RegistrationNo) this.getApplicationDetails(this.RegistrationNo);
//           } else {
//             Swal.fire('Error', 'Failed to submit', 'error');
//           }
//         },
//         error: () => Swal.fire('Error', 'Server error', 'error'),
//       });
//   }

//   // ── Document helper methods ────────────────────────────────────────────────
//   /**
//    * Check if a document is uploaded for Stage 2
//    * @param documentName The document name (e.g., 'Affidavit', 'Indeminity Bond')
//    * @returns The uploaded document if found, null otherwise
//    */
//   getUploadedStage2Document(documentName: string): StageDetailRow | null {
//     return this.stage2DocumentMap.get(documentName) || null;
//   }

//   /**
//    * Check if a Stage 2 document is missing (not uploaded)
//    * @param documentName The document name to check
//    * @returns true if document is missing, false if uploaded
//    */
//   isStage2DocumentMissing(documentName: string): boolean {
//     return !this.stage2DocumentMap.has(documentName);
//   }

//   /**
//    * Get all Stage 2 documents that are missing (not uploaded)
//    * @returns Array of missing document names
//    */
//   getMissingStage2Documents(): string[] {
//     return this.stage2RequiredDocuments
//       .map(doc => doc.documentName)
//       .filter(name => this.isStage2DocumentMissing(name));
//   }

//   // ── Authentication & Data Loading ──────────────────────────────────────────
//   getToken(loginName: string): void {
//     this.isLoading = true;
//     this.studentService.getStudentToken(loginName)
//       .pipe(finalize(() => this.isLoading = false), takeUntil(this.destroy$))
//       .subscribe({
//         next: (resp: any) => {
//           const data = resp?.[0] || resp?.item1?.[0] || null;
//           if (data && data.id) {
//             this.RegistrationNo = data.registrationNo;
//             this.ApplicationId = data.applicationId;
//             this.getApplicationDetails(this.RegistrationNo);
//           } else {
//             this.loginFailed(resp);
//           }
//         },
//         error: (err: any) => this.loginFailed(err),
//       });
//   }

//   getApplicationDetails(regno: string): void {
//     if (!regno) return;
//     this.isLoadingData = true;
//     this.buildForm();
//     this.studentService.getApplicationDetails(regno)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response: any) => {
//           const app = response?.item1?.[0];
//           if (!app) {
//             this.loginFailed(null);
//             return;
//           }

//           this.stuApplication = app;
//           this.ApplicationId ??= app.applicationId;

//           this.studentName = app.studentName ?? '';
//           this.courseName = app.courseName ?? '';
//           this.cgpa = app.cgpa ?? '';
//           this.CurrentYear = app.currentYear ?? '';
//           this.CurrentTerm = app.currentTerm ?? '';
//           this.ProgramCode = app.programCode ?? '';
//           this.SectionCode = app.sectionCode ?? '';
//           this.studentStatus = app.studentStatus ?? '';
//           this.EmailId = app.emailId ?? '';

//           this.DealingFacultyName = app.dealingFacultyName ?? '';
//           this.CounsellingAuthorityName = app.counsellingAuthorityName ?? '';
//           this.CounsellingAuthority = app.counsellingAuthority ?? null;
//           this.DealingHodId = app.dealingHodId ?? null;
//           this.DealingFaculty = app.dealingFaculty ?? null;
//           this.ApprovedUniversity = app.approvedUniversity ?? '';
//           this.IsApproved = this.readAppFlag(app, 'isApproved', 'IsApproved');
//           this.isApprovedApplication = this.isApprovedValue(this.IsApproved);

//           const lockState = this.resolveLockState(app.isLocked);
//           if (lockState === 'locked') this.LockedStatus = true;
//           else if (lockState === 'unlocked') this.LockedStatus = false;

//           this.form.patchValue({
//             EmailId: app.emailId ?? '', CountryName: app.countryName ?? '', WhatsAppNo: app.whatsAppNo ?? '',
//             PhoneNumber: app.phoneNumber ?? '', ParentContact: app.parentContact ?? '',
//             HasRelativeDetails: app.hasRelativeDetails ?? '', RelativeName: app.relativeName ?? '',
//             RelativeRelation: app.relativeRelation ?? '', RelativeCountryName: app.relativeCountry ?? '',
//             RelativeEmail: app.relativeEmail ?? '', RelativePhone: app.relativePhone ?? '',
//             ApplyingOption: app.applyingOption ?? '', UniversityOption1: app.universityOption1 ?? '',
//             UniversityOption2: app.universityOption2 ?? '', UniversityOption3: app.universityOption3 ?? '',
//             PassportStatus: app.passportStatus ?? '', PassportNumber: app.passportNumber ?? '',
//             PassportIssueDate: this.formatDate(app.passportIssueDate), PassportValidUpto: this.formatDate(app.passportValidUpto),
//             IsVisaRejected: app.isVisaRejected ?? '', VisaRejectedReason: app.visaRejectedReason ?? '',
//             VisaRejectedCountry: app.visaRejectedCountry ?? '', EnglishTestType: app.englishTestType ?? '',
//             TestName: app.englishTestName ?? '', EnglishTestYear: app.englishTestYear ?? '',
//             ListeningScore: app.listeningScore ?? '', SpeakingScore: app.speakingScore ?? '',
//             ReadingScore: app.readingScore ?? '', WritingScore: app.writingScore ?? '', OverallScore: app.overallScore ?? '',
//             SponsorType: app.sponsorType ?? '', SponsorName: app.sponsorName ?? '', SponsorRelation: app.sponsorRelation ?? '',
//             SponsorContact: app.sponsorContact ?? '', SponsorEmail: app.sponsorEmail ?? '', AvailableFunds: app.availableFunds ?? '',
//             AcceptPolicy: !!app.acceptPolicy,
//           }, { emitEvent: false });

//           this.getStuDetailsWithImage(regno);
//           this.getStagesDetails();

//           const mayEdit = !this.LockedStatus || this.canEditApplication;
//           const anyFormEditing = [1, 2, 3, 4].some(i => this.isEditingStep[i]);
//           const editing = anyFormEditing && mayEdit;
//           editing ? this.form.enable() : this.form.disable();

//           this.initCourseRows();
//           this.getStageDocumentDetails();
        
//         },
//         error: err => {
//           console.error(err);
//           Swal.fire('Error', 'Failed to load application data', 'error');
//         },
//       });
//   }

//   private getUniversityDetails(): void {
//     this.studentService.getUniversityLists('')
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({ next: (r: any) => this.uniData = r?.item1 ?? [] });
//   }

//   private getStagesDetails(): void {
//     this.studentService.GetAllCheckListDocs()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({ 
//         next: (r: any) => {
//           this.StagesDetail = r?.item1 ?? [];
//           this.mapStage2Documents(); // Re-map when stages details change
//         }
//       });
//   }

//   /**
//    * Fetch Stage 2 uploaded documents from API
//    * This calls GetStage2DocumentDetails and then maps the data
//    */
//   getStageDocumentDetails(): void {
//     if (!this.ApplicationId) return;
//     this.studentService.GetStage2DocumentDetails(+this.ApplicationId).subscribe({
//       next: (response: any) => {
//         this.StageDocumentData = response.item1 || [];
//         console.log('Stage 2 Uploaded Documents:', JSON.stringify(this.StageDocumentData));
//         this.mapStage2Documents(); // Re-map after fetching new data
//       },
//       error: (err) => {
//         console.error('Error fetching Stage 2 documents:', err);
//         this.StageDocumentData = [];
//         this.mapStage2Documents(); // Ensure map is updated even on error
//       }
//     });
//   }

//   /**
//    * Map Stage 2 documents into required vs uploaded
//    * This creates:
//    * - stage2RequiredDocuments: All docs from StagesDetail that belong to Stage II
//    * - stage2DocumentMap: Quick lookup map of uploaded documents by name
//    */
//   private mapStage2Documents(): void {
//     // Filter for Stage II documents from StagesDetail
//     this.stage2RequiredDocuments = this.StagesDetail
//       .filter(doc => doc.stageName?.toLowerCase().includes('stage ii') || doc.stageName?.toLowerCase().includes('stage 2'))
//       .sort((a, b) => (a.documentName ?? '').localeCompare(b.documentName ?? ''));

//     // Create a map of uploaded Stage 2 documents by documentName for quick lookup
//     this.stage2DocumentMap.clear();
//     this.StageDocumentData.forEach(uploadedDoc => {
//       const key = uploadedDoc.documentName?.trim() || '';
//       if (key) {
//         this.stage2DocumentMap.set(key, uploadedDoc);
//       }
//     });

//     console.log('Stage 2 Required Documents:', this.stage2RequiredDocuments);
//     console.log('Stage 2 Document Map Keys:', Array.from(this.stage2DocumentMap.keys()));
//   }

//   private getStuDetailsWithImage(regno: string): void {
//     if (!regno) return;
//     this.studentService.GetStuDetailsWithImage(regno)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (r: any) => {
//           const data = r?.item1?.[0];
//           this.studentDetailsWithImage = data;
//           this.StudentImage = data?.imageData ? `data:image/jpeg;base64,${data.imageData}` : null;
//         },
//         error: () => this.StudentImage = null,
//       });
//   }

//   // ── Private: Form ──────────────────────────────────────────────────────────
//   private buildForm(): void {
//     this.form = this.fb.group({
//       EmailId: ['', Validators.required],
//       CountryName: ['', Validators.required],
//       WhatsAppNo: ['', Validators.required],
//       PhoneNumber: ['', Validators.required],
//       ParentContact: ['', Validators.required],
//       HasRelativeDetails: ['', Validators.required],
//       RelativeName: [''], RelativeCountryName: [''], RelativeRelation: [''],
//       RelativeEmail: [''], RelativePhone: [''],
//       ApplyingOption: ['', Validators.required],
//       UniversityOption1: ['', Validators.required],
//       UniversityOption2: ['', Validators.required],
//       UniversityOption3: ['', Validators.required],
//       PassportStatus: ['', Validators.required],
//       PassportNumber: [''], PassportIssueDate: [''], PassportValidUpto: [''],
//       IsVisaRejected: ['', Validators.required],
//       VisaRejectedReason: [''], VisaRejectedCountry: [''],
//       EnglishTestType: ['', Validators.required],
//       TestName: [''], EnglishTestYear: [''],
//       ListeningScore: [''], SpeakingScore: [''],
//       ReadingScore: [''], WritingScore: [''], OverallScore: [''],
//       SponsorType: ['', Validators.required],
//       SponsorName: [''], SponsorRelation: [''],
//       SponsorContact: [''], SponsorEmail: [''],
//       AvailableFunds: ['', Validators.required],
//       AcceptPolicy: [false, Validators.requiredTrue],
//     });
//     this.form.disable();

//     this.form.get('SponsorType')!.valueChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((value: string) => {
//         if (this.isLoadingData) return;
//         const isParent = ['parent', 'parents'].includes((value ?? '').trim().toLowerCase());
//         if (isParent) {
//           this.form.patchValue({ SponsorName: '', SponsorRelation: '', SponsorEmail: '', SponsorContact: '' }, { emitEvent: false });
//           ['SponsorName', 'SponsorRelation'].forEach(k => {
//             this.form.get(k)!.clearValidators();
//             this.form.get(k)!.updateValueAndValidity({ emitEvent: false });
//           });
//         } else {
//           this.form.get('SponsorName')!.setValidators([Validators.required]);
//           this.form.get('SponsorRelation')!.setValidators([Validators.required]);
//           ['SponsorName', 'SponsorRelation'].forEach(k =>
//             this.form.get(k)!.updateValueAndValidity({ emitEvent: false }));
//         }
//       });
//   }

//   private buildUpdateFormData(): FormData {
//     const fd = new FormData();
//     const raw = this.form.getRawValue();
//     fd.append('RegistrationNo', this.RegistrationNo ?? 'NA');
//     if (this.ApplicationId) fd.append('ApplicationId', this.ApplicationId);

//     const fields = [
//       'EmailId', 'CountryName', 'WhatsAppNo', 'PhoneNumber', 'ParentContact',
//       'ApplyingOption', 'UniversityOption1', 'UniversityOption2', 'UniversityOption3',
//       'PassportStatus', 'PassportNumber', 'PassportIssueDate', 'PassportValidUpto',
//       'IsVisaRejected', 'VisaRejectedReason', 'VisaRejectedCountry',
//       'EnglishTestType', 'SpeakingScore', 'ListeningScore', 'ReadingScore', 'WritingScore', 'OverallScore',
//       'SponsorType', 'AvailableFunds', 'SponsorName', 'SponsorRelation', 'SponsorEmail', 'SponsorContact',
//       'RelativeName', 'RelativeRelation', 'RelativeEmail', 'RelativePhone',
//     ];
//     fields.forEach(k => fd.append(k, String(raw[k] ?? '')));
//     fd.append('RelativeCountry', String(raw['RelativeCountryName'] ?? ''));
//     fd.append('EnglishTestYear', String(raw['EnglishTestYear'] ?? ''));
//     fd.append('EnglishTestName', String(raw['TestName'] ?? ''));

//     const sponsor = raw['SponsorType'] ?? '';
//     fd.append('IsSelfFunded', ['Parents', 'Parent'].includes(sponsor) ? 'True' : 'False');
//     return fd;
//   }

//   // ── Private: Helpers ───────────────────────────────────────────────────────
//   private initCourseRows(): void {
//     const courses = this.stuApplication?.courseCovered;
//     this.courseRows = Array.isArray(courses) && courses.length
//       ? courses.map((c: any) => ({ courseName: c.courseName, courseCode: c.courseCode, hours: c.hours ?? null, fileName: c.fileName ?? null, file: null, fileData: null }))
//       : [1, 2, 3].map(() => ({ courseName: '', courseCode: '', hours: null, file: null, fileName: null, fileData: null }));
//   }

//   private loginFailed(err: any): void {
//     this.isLoginFailed = true;
//     Swal.fire({ title: 'Login Failed', text: 'Login details are invalid!', icon: 'warning' });
//     const el = document.getElementById('StudentDashboard');
//     if (el) el.hidden = true;
//     this.router.navigate(['stuPotal', this.LoginName]);
//   }

//   private isMsgSuccess(resp: any): boolean {
//     return resp?.[0]?.msg === 'Success' || resp?.item1?.[0]?.msg === 'Success';
//   }

//   private formatDate(dateStr: any): string {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return '';
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
//   }

//   private isApprovedValue(value: unknown): boolean {
//     if (value === null || value === undefined) return false;
//     const s = String(value).trim().toLowerCase();
//     return s === '1' || s === 'true' || s === 'yes';
//   }

//   private readAppFlag(app: StudentApplication, ...keys: string[]): unknown {
//     for (const key of keys) {
//       const val = (app as any)?.[key];
//       if (val !== null && val !== undefined && String(val).trim() !== '') return val;
//     }
//     return null;
//   }

//   /** empty/null → unlocked wizard; true/1 → locked tabs; false/0 → unlocked wizard */
//   private resolveLockState(isLocked: unknown): 'null' | 'locked' | 'unlocked' {
//     if (isLocked === null || isLocked === undefined) return 'null';
//     const raw = String(isLocked).trim();
//     if (!raw) return 'null';
//     const lower = raw.toLowerCase();
//     if (lower === 'true' || lower === '1' || lower === 'yes') return 'locked';
//     if (lower === 'false' || lower === '0' || lower === 'no') return 'unlocked';
//     return 'null';
//   }
// }
