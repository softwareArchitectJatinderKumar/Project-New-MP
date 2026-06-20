/**
 * Registration Module Models & Interfaces
 * Defines all data types for the Semester Exchange registration form
 */

// ========== Student Information ==========
export interface StudentInfo {
  loginName: string;
  registrationNo: string;
  name: string;
  courseName: string;
  cgpa: number;
  currentYear: number;
  currentTerm: string;
  programCode: string;
  sectionCode: string;
  status: string;
}

export interface StudentGradeMarks {
  [key: string]: any;
}

// ========== Registration Form Data ==========
export interface RegistrationFormData {
  // Contact Details
  countryName: string;
  emailId: string;
  whatsappNo: string;           // 14 digits international format
  phoneNumber?: string;          // 14 digits international format
  parentContact?: string;        // 14 digits international format
  
  // Relative Details
  hasRelativeDetails: boolean;
  relativeName?: string;
  relativeCountryName?: string;
  relativeRelation?: string;
  relativePhone?: string;        // 14 digits international format
  relativeEmail?: string;
  
  // University Preferences
  applyingOption: string;
  universityOption1: string;
  universityOption2: string;
  universityOption3: string;
  
  // Passport & Visa
  passportStatus: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportValidUpto?: string;
  isVisaRejected: boolean;
  visaRejectedReason?: string;
  visaRejectedCountry?: string;
  
  // English Proficiency
  englishTestType: string;
  testName?: string;
  testDate?: string;
  listeningScore?: number;
  speakingScore?: number;
  readingScore?: number;
  writingScore?: number;
  overallScore?: number;
  englishTestYear?: string;
  
  // Sponsor Details
  sponsorType: string;
  availableFunds: string;
  sponsorName?: string;
  sponsorRelation?: string;
  sponsorContact?: string;       // 14 digits international format
  sponsorEmail?: string;
  
  // Counsellor Details
  counsellingAuthority?: string;
  
  // Declaration
  acceptPolicy: boolean;
  
  // Documents
  passportDocumentPath?: string;
  englishDocumentPath?: string;
  feesDocumentPath?: string;
  resumeDocumentPath: string;
  consentLetterDocumentPath?: string;
  otherDocumentPaths?: string[];
}

// ========== API Request/Response Models ==========
export interface EligibilityCheckRequest {
  email: string;
  contactNumber: string;         // 14 digits
}

export interface EligibilityCheckResponse {
  isEligible: boolean;
  studentInfo?: StudentInfo;
  message: string;
}

export interface RegistrationSubmissionRequest {
  studentInfo: StudentInfo;
  formData: RegistrationFormData;
  documents: { [key: string]: string }; // File data
}

export interface RegistrationSubmissionResponse {
  success: boolean;
  applicationId?: string;
  message: string;
  redirectUrl?: string;
}

// ========== File Upload Models ==========
export interface UploadedFile {
  key: string;
  name: string;
  size: number;
  uploadTime: Date;
  data?: string; // Base64 encoded
}

export interface FileUploadTracker {
  resume: UploadedFile | null;
  passport: UploadedFile | null;
  english: UploadedFile | null;
  consent: UploadedFile | null;
  fees: UploadedFile | null;
  others: UploadedFile[];
}

// ========== Wizard Configuration ==========
export interface WizardStep {
  index: number;
  label: string;
  icon: string;
  completed: boolean;
}

export interface StepConfiguration {
  steps: WizardStep[];
  currentStep: number;
  stepLabels: string[];
  stepIcons: string[];
}

// ========== Dropdown Options ==========
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface CountryOption extends SelectOption {
  code?: string;
  dialCode?: string;
}

// ========== Component State ==========
export interface RegistrationState {
  isLoading: boolean;
  isSubmitted: boolean;
  isEligible: boolean;
  loginFailed: boolean;
  currentStep: number;
  studentInfo: StudentInfo | null;
  formData: RegistrationFormData | null;
  fileTracker: FileUploadTracker;
}

// ========== Validation Errors ==========
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'pattern' | 'custom' | 'phone';
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========== Counsellor & Authority ==========
export interface CounsellingAuthority {
  index: number;
  name: string;
  uid: string;
}

export interface ApplyingOption {
  value: string;
  label: string;
}

// ========== Sponsor Types ==========
export interface SponsorOption extends SelectOption {
  requiresDetails?: boolean;
}

export interface AvailableFundOption extends SelectOption {
  minAmount?: number;
  maxAmount?: number;
}

// ========== Phone Number Validation ==========
export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  originalNumber: string;
  countryCode?: string;
  areaCode?: string;
  localNumber?: string;
}

export interface CountryPhoneConfig {
  countryName: string;
  countryCode: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  pattern: RegExp;
  format: string; // e.g., "+XX XXX XXX XXXX"
}