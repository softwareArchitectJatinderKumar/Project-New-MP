export interface StudentApplication {
  applicationId: string;
  emailId: string;
  phoneNumber: string;
  whatsAppNo: string;
  parentContact: string;
  countryName: string;
  relativeName: string;
  relativeCountry: string;
  relativeRelation: string;
  relativeEmail: string;
  relativePhone: string;
  applyingOption: string;
  universityOption1: string;
  universityOption2: string;
  universityOption3: string;
  passportStatus: string;
  passportNumber: string;
  passportIssueDate: string;
  passportValidUpto: string;
  isVisaRejected: string;
  visaRejectedReason: string;
  visaRejectedCountry: string;
  englishTestType: string;
  englishTestName: string;
  englishTestYear: string;
  listeningScore: string;
  speakingScore: string;
  readingScore: string;
  writingScore: string;
  overallScore: string;
  sponsorType: string;
  sponsorName: string;
  sponsorRelation: string;
  sponsorEmail: string;
  sponsorContact: string;
  availableFunds: string;
  acceptPolicy: string | boolean;
  counsellingAuthority: string;
  dealingHODId: string;
  dealingFaculty: string;
  dealingFacultyName: string;
  counsellingAuthorityName: string;
  isLocked: string;
  sectionCode: string;
  feesProofFileName: string;
  resumeFileName: string;
  passportFileName: string;
  consentLetterFileName: string;
  englishTestDocumentFile: string;
  isSelfFunded: string;
  studentGradeMarksDataX?: any[];
  courseCovered?: CourseRow[];
  approvedUniversity?: string;
}

export interface StageDetailRow {
  stage: number;
  id: number;
  documentName: string;
  forAdmin: number;
  sampleFormat: any;
  stageName: string;
  fileName?: string;
  fileObject?: File;
  file?: File;
  fileData: any;
  isUploading?: boolean;
  isUploaded?: boolean;
  document: any;
}

export interface DocumentField {
  key: string;
  label: string;
  fileName: string;
  fileData: string | null;
}

export interface CourseRow {
  courseName?: string | null;
  courseCode?: string | null;
  hours?: number | null;
  file?: File | null;
  fileName?: string | null;
  fileData?: string | null;
}

export interface Country {
  name: string;
}

export interface University {
  universityName: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FileSelectedEvent {
  key: 'fees' | 'resume' | 'consent' | 'passport' | 'english';
  file: File;
  base64: string;
  fileName: string;
}

export const ENGLISH_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select' },
  { value: 'Applied', label: 'Applied' },
  { value: 'NotRequired', label: 'Not required' },
  { value: 'NotGiven', label: 'Not Given' },
  { value: 'Appeared', label: 'Appeared / Given' },
];

export const ENGLISH_TEST_NAMES: string[] = ['PTE', 'IELTS', 'TOEFL', 'DULINGO'];

export const AVAILABLE_FUNDS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select' },
  { value: '2 to 4 Lakhs', label: '2 to 4 Lakhs' },
  { value: '4 to 6 Lakhs', label: '4 to 6 Lakhs' },
  { value: '6 to 8 Lakhs', label: '6 to 8 Lakhs' },
  { value: '8 to 10 Lakhs', label: '8 to 10 Lakhs' },
];

export const STEP_LABELS: string[] = [
  'Academic Summary',
  'Contact Information',
  'University Preferences',
  'Passport / Visa / English / Sponsor',
  'Documents',
];

export const MAX_FILE_SIZE_BYTES = 3148576; // 3 MB
