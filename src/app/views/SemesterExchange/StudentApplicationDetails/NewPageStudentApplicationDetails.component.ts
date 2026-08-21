import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-StudentApplicationDetailss',
  templateUrl: './NewPageStudentApplicationDetails.html',
  styleUrls: ['./StudentApplicationDetails.component.css']
})
export class NewPageStudentApplicationDetails implements OnInit {
  loadingIndicator = false;
  isAdminLocked = false;
  studentForm: FormGroup;
  LoginName: any;
  RegistrationNo: any;
  stuApplication: any = null;
  universityOptions: any[] = [];
  studentDetailsWithImage: any = null;
  StudentImage: string | null = null;
  serverUrl = '';
  folderUrl = '';
  IsLoginFailed = false;

  // UI options (kept as in original)
  applyingOptions = ['Spring', 'Fall'];
  passportStatusOptions = ['Apply', 'Yes', 'No'];
  visaRejectedOptions = ['Yes', 'No'];
  englishTestTypeOptions = ['Yes', 'No', 'Applied'];
  fundsOptions = ['upto 2 lakh', '2lakh to 4 lakh', '6lakh to 8 lakh'];
  acceptPolicyOptions = [{ label: 'Yes', value: true }, { label: 'No', value: false }];

  // Sections & documents — keep names same for integration
  formSections = [
    { label: 'Personal Details', keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
    { label: 'University Preferences', keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
    { label: 'Relative at Abroad', keys: ['relativeName', 'relativeRelation', 'relativeCountry'] },
    { label: 'Passport Details', keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
    { label: 'Visa Details', keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
    { label: 'English Test Details', keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
    { label: 'Sponsor Details', keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
    { label: 'Financial & Declaration', keys: ['availableFunds', 'acceptPolicy'] }
  ];

  documentUploads = [
    { key: 'resumeFileName', label: 'Resume Document' },
    { key: 'feesProofFileName', label: 'Fees Proof Document' },
    { key: 'consentLetterFileName', label: 'Consent Letter' },
    { key: 'passportFileName', label: 'Passport Document' },
    { key: 'englishTestDocumentPath', label: 'English Test Proof' }
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
    // initialize to avoid template errors before async data arrives
    this.studentForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.LoginName = this.route.snapshot.params['LoginName'];
    this.RegistrationNo = this.route.snapshot.params['RegistrationNo'];
    this.title.setTitle('Semester Exchange Student Dashboard');

    if (this.LoginName) {
      this.getToken(this.LoginName);
      this.folderUrl = this.ServicesSM.getFolderUrl();
      // keep same serverUrl as original integration
      this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
    }
  }

  /***** Token & Login flow (kept as requested) *****/
  getToken(loginName: string): void {
    this.authService.loginTemp(loginName).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.IsLoginFailed = true;
          this.LoginFailed('Invalid or expired token');
        } else {
          // keep original sequence: load universities which calls createStudentForm and then application & image
          this.getUniversityDetails();
        }
      },
      error: err => this.LoginFailed(err)
    });

    // keep original DOM tweaks (if used elsewhere)
    const stMain = document.getElementById('stMain');
    if (stMain) stMain.innerHTML = '<span class="themeClr">Application Details</span>';
    const imgLogo = document.getElementById('imgLogo') as HTMLElement | null;
    if (imgLogo) imgLogo.style.width = '164px';
  }

  LoginFailed(error: any): void {
    this.IsLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('StudentDashboard');
    if (element) element.hidden = true;
  }

  /***** Form creation (read-only display) *****/
  createStudentForm(): void {
    this.studentForm = this.fb.group({
      applicationId: [{ value: '', disabled: true }],
      registrationNo: [{ value: '', disabled: true }],
      emailId: [{ value: '', disabled: true }],
      countryName: [''],
      whatsAppNo: [''],
      phoneNumber: [''],
      parentContact: [''],
      applyingOption: [''],
      universityOption1: [''],
      universityOption2: [''],
      universityOption3: [''],
      passportStatus: [''],
      passportNumber: [''],
      passportIssueDate: [''],
      passportValidUpto: [''],
      isVisaRejected: [''],
      visaRejectedReason: [''],
      visaRejectedCountry: [''],
      englishTestType: [''],
      speakingScore: [''],
      listeningScore: [''],
      readingScore: [''],
      writingScore: [''],
      overallScore: [''],
      englishTestYear: [''],
      isSelfFunded: [''],
      sponsorName: [''],
      sponsorRelation: [''],
      sponsorContact: [''],
      sponsorEmail: [''],
      availableFunds: [''],
      acceptPolicy: [false],
      relativeName: [{ value: '', disabled: true }],
      relativeRelation: [{ value: '', disabled: true }],
      relativeCountry: [{ value: '', disabled: true }],
      // include other controls if your API returns them
    });
  }

  /***** University list (uses live API call) *****/
  getUniversityDetails(): void {
    this.loadingIndicator = true;
    this.ServicesSM.getUniversityDetails().subscribe({
      next: (response: any) => {
        const data = response.item1 || [];
        this.universityOptions = data.map((u: any) => ({ universityId: u.universityId, universityName: u.universityName }));
        // Build form and then fetch application & image
        this.createStudentForm();
        if (this.RegistrationNo) {
          this.getApplicationDetails(this.RegistrationNo);
          this.getStuDetailsWithImage(this.RegistrationNo);
        }
      },
      error: () => {
        this.loadingIndicator = false;
        // show warning if needed
      },
      complete: () => {
        // small delay to keep the original UX consistent
        setTimeout(() => this.loadingIndicator = false, 500);
      }
    });
  }

  /***** Application details (live API) *****/
  getApplicationDetails(regId: string): void {
    if (!regId) return;
    this.loadingIndicator = true;
    this.studentService.getStudentDetailsBYId(regId).subscribe({
      next: (response: any) => {
        if (response.item1?.length > 0) {
          this.stuApplication = response.item1[0];
          this.isAdminLocked = !!this.stuApplication['isLocked'];

          // patch form safely: use known control names & format dates
          const patchObj: any = { ...this.stuApplication };
          patchObj.acceptPolicy = this.stuApplication.acceptPolicy === 'true' || this.stuApplication.acceptPolicy === true;
          patchObj.passportIssueDate = this.formatDateForInput(this.stuApplication.passportIssueDate);
          patchObj.passportValidUpto = this.formatDateForInput(this.stuApplication.passportValidUpto);
          this.studentForm.patchValue(patchObj);

          // disable the form for read-only view
          this.studentForm.disable();
        } else {
          this.LoginFailed('No application data found.');
        }
      },
      error: () => this.LoginFailed('Unable to fetch application details.'),
      complete: () => setTimeout(() => (this.loadingIndicator = false), 2500)
    });
  }

  /***** Student details with image (live API) *****/
  getStuDetailsWithImage(Regno: any): void {
    if (!Regno) return;
    this.ServicesSM.GetStuDetailsWithImage(Regno).subscribe({
      next: (response: any) => {
        if (response.item1?.length > 0) {
          this.studentDetailsWithImage = response.item1[0];
          if (this.studentDetailsWithImage?.imageData) {
            this.StudentImage = this.convertImageData(this.studentDetailsWithImage.imageData);
          }
        }
      },
      error: () => {
        // ignore image errors silently, keep UI robust
      }
    });
  }

  /***** Utilities *****/
  formatDateForInput(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  convertImageData(imageData: string): string {
    // The original used base64. If API returns base64 or ArrayBuffer adapt accordingly.
    // If imageData is already a base64 string:
    if (!imageData) return '';
    if (imageData.startsWith('/9j/') || imageData.startsWith('iVBORw0K')) {
      // base64 without data URL prefix
      const mime = imageData.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      return `data:${mime};base64,${imageData}`;
    }
    // if imageData is hex, try hex convert
    if (/^[0-9a-fA-F]+$/.test(imageData)) {
      const base64 = this.hexToBase64(imageData);
      // guess mime by header
      const mime = base64.startsWith('/9j/') ? 'image/jpeg' : (base64.startsWith('iVBORw0K') ? 'image/png' : 'application/octet-stream');
      return `data:${mime};base64,${base64}`;
    }
    // fallback: return as-is
    return imageData;
  }

  hexToBase64(hex: string): string {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    const binaryString = String.fromCharCode(...byteArray);
    return btoa(binaryString);
  }

  /***** Section filtering (fixed malformed spread & logic) *****/
  public getFilteredFormSections() {
    const fundingType = this.studentForm?.get('isSelfFunded')?.value;
    const excludedFundingTypes = ['Parent', 'Applied', 'No'];

    return this.formSections.map(section => {
      if (section.label !== 'Sponsor Details' && section.label !== 'English Test Details' && section.label !== 'Visa Details') {
        return section;
      }

      if (excludedFundingTypes.includes(fundingType)) {
        const filteredKeys = section.keys.filter(key => ['isSelfFunded', 'availableFunds', 'englishTestType', 'isVisaRejected'].includes(key));
        return { ...section, keys: filteredKeys };
      }
      return section;
    });
  }

  beautifyLabel(key: string): string {
    if (!key) return '';
    if (key === 'programCode') return 'Program';
    const words = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  /***** Document helpers (read-only) *****/
  hasDocument(key: string): boolean {
    return !!(this.stuApplication && this.stuApplication[key]);
  }

  getDocumentUrl(key: string): string {
    if (!this.stuApplication) return '#';
    const path = this.stuApplication[key] ?? '';
    return this.serverUrl ? `${this.serverUrl}${path}` : path;
  }

  getUniversityName(id: number): string {
    const uni = this.universityOptions.find(u => u.universityId == id);
    return uni ? uni.universityName : '-';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.studentForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getFieldErrors(field: string) {
    return this.studentForm.get(field)?.errors || null;
  }

  onDownloadFile(remoteUrl: any): void {
    const fileStr = String(remoteUrl ?? '').trim();
    if (!fileStr || ['na', 'n/a', 'none', 'null', 'undefined'].includes(fileStr.toLowerCase())) {
      Swal.fire({
        title: 'File Not Found',
        text: 'No document file is available for download.',
        icon: 'info',
      });
      return;
    }

    const fullUrl = fileStr.startsWith('http://') || fileStr.startsWith('https://')
      ? fileStr
      : `${this.serverUrl}${fileStr}`;

    Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while your document is being retrieved.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    this.studentService.downloadFile(fullUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const fileName = fileStr.split('/').pop() || 'Document.pdf';
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        Swal.close();
      },
      error: async (err) => {
        Swal.close();
        if (err?.error instanceof Blob) {
          try {
            const errorMsg = JSON.parse(await err.error.text());
            Swal.fire('Error', errorMsg.message || 'Download failed', 'error');
          } catch {
            Swal.fire('Error', 'Download failed', 'error');
          }
        } else {
          Swal.fire('Error', 'Could not connect to the server or download file', 'error');
        }
      },
    });
  }

  /***** Print handler (kept) *****/
  printDetails(): void {
    window.print();
  }
}
