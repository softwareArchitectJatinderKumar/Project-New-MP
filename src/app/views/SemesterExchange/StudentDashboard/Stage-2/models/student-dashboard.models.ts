// ─────────────────────────────────────────────────────────────
//  Student Dashboard (Stage 2) — Domain Models
// ─────────────────────────────────────────────────────────────

export type TabId = 'application' | 'documents' | 'courses';

export interface CourseRow {
  courseName: string;
  courseCode: string;
  hours:      number | null;
  file:       File   | null;
  fileName:   string | null;
  fileData:   string | null;
}

/** Metadata entry returned by the courseCovered array in the API response */
export interface CourseItem {
  courseName?: string;
  courseCode?: string;
  hours?:      number;
  fileName?:   string;
}

/** One document panel — drives both the upload UI and FormData construction */
export interface DocumentField {
  key:           string;  // key into pickedFiles map
  label:         string;  // displayed label
  apiFileField:  string;  // field name on ApplicationRecord holding the existing filename
  formNameField: string;  // FormData key for the filename sent to the API
  formDataField: string;  // FormData key for the base64 data sent to the API
}

export interface PickedFileState {
  file:     File   | null;
  base64:   string | null;
  fileName: string | null;
}

export interface UniversityOption {
  universityId:   string;
  universityName: string;
}

export interface StudentProfile {
  studentName: string;
  batchYear:   string;
  courseName:  string;
  imageData:   string;
  [key: string]: unknown;
}

export interface ApplicationRecord {
  applicationId:          string;
  registrationNo:         string;
  emailId:                string;
  countryName:            string;
  whatsAppNo:             string;
  phoneNumber:            string;
  parentContact:          string;
  applyingOption:         string;
  universityOption1:      string;
  universityOption2:      string;
  universityOption3:      string;
  passportStatus:         string;
  passportNumber:         string;
  passportIssueDate:      string;
  passportValidUpto:      string;
  isVisaRejected:         string;
  visaRejectedReason:     string;
  visaRejectedCountry:    string;
  englishTestType:        string;
  speakingScore:          string;
  listeningScore:         string;
  readingScore:           string;
  writingScore:           string;
  overallScore:           string;
  englishTestYear:        string;
  isSelfFunded:           string;
  sponsorName:            string;
  sponsorRelation:        string;
  sponsorContact:         string;
  sponsorEmail:           string;
  availableFunds:         string;
  acceptPolicy:           string | boolean;
  relativeName:           string;
  relativeRelation:       string;
  relativeCountry:        string;
  feesProofFileName:      string;
  resumeFileName:         string;
  consentLetterFileName:  string;
  passportFileName:       string;
  englishProofFileName:   string;
  courseCovered:          CourseItem[];
  [key: string]:          unknown;
}
