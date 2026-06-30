// ─────────────────────────────────────────────────────────────
//  Student Application Details (Details view) — Domain Models
// ─────────────────────────────────────────────────────────────

/** One display section in the review UI (e.g. "Passport Details") */
export interface FormSection {
  readonly label: string;
  readonly keys:  ReadonlyArray<string>;
}

/** One document row in the uploaded-documents panel */
export interface DocumentUpload {
  readonly key:   string;   // matches the API response field name
  readonly label: string;
  readonly icon:  string;   // Bootstrap Icon class e.g. 'bi-passport'
}

/** Slim university option from the API */
export interface UniversityOption {
  readonly universityId:   string;
  readonly universityName: string;
}

/** Student profile returned by GetStuDetailsWithImage */
export interface StudentProfile {
  readonly studentName: string;
  readonly batchYear:   string;
  readonly courseName:  string;
  readonly imageData:   string;
  readonly [key: string]: unknown;
}

/** One row from getStudentDetailsWithMarks */
export interface GradeRecord {
  readonly grade?:        string;
  readonly gradeNum?:     string;
  readonly officialCode?: string;
  readonly section?:      string;
  readonly schoolId?:     string;
  readonly cgpa?:     string;
  readonly approvedUniversity?:     string;
}

/**
 * Main application DTO from getStudentDetailsBYId.
 * Index signature allows bracket access for dynamic document key lookups.
 */
export interface ApplicationData {
  readonly acceptPolicy?:      boolean | string;
  readonly passportIssueDate?: string;
  readonly passportValidUpto?: string;
  readonly [key: string]:      unknown;
}
