// ─────────────────────────────────────────────────────────────
//  Application Details — Domain Models
//  Single source of truth for all types used across this feature.
// ─────────────────────────────────────────────────────────────

/** One section of the review display, e.g. "Passport Details" */
export interface FormSection {
  readonly label: string;
  readonly keys:  ReadonlyArray<string>;
}

/** An uploadable document entry shown in the documents panel */
export interface DocumentUpload {
  readonly key:   string;   // matches the API response field name
  readonly label: string;
  readonly icon:  string;   // Bootstrap Icon class e.g. 'bi-passport'
}

/** Slim university option populated from the API */
export interface UniversityOption {
  readonly universityId:   string;
  readonly universityName: string;
}

/** One record from the grade/marks API response */
export interface GradeRecord {
  readonly grade?:        string;
  readonly gradeNum?:     string;
  readonly officialCode?: string;
  readonly section?:      string;
  readonly schoolId?:     string;
}

/**
 * Student profile data returned by GetStuDetailsWithImage.
 * The index signature is required so we can access properties by the
 * dynamic `doc.key` pattern used in the documents panel.
 */
export interface StudentWithImage {
  readonly studentName: string;
  readonly batchYear:   string;
  readonly courseName:  string;
  readonly imageData:   string;
  readonly [key: string]: unknown;
}

/**
 * Main application DTO from getStudentDetailsBYId.
 * Named properties cover what we explicitly read; the index signature
 * allows dynamic bracket access for document file-name fields.
 */
export interface ApplicationData {
  readonly acceptPolicy?:       boolean | string;
  readonly passportIssueDate?:  string;
  readonly passportValidUpto?:  string;
  readonly UniversityOption1?:  string;
  readonly UniversityOption2?:  string;
  readonly UniversityOption3?:  string;
  readonly [key: string]:       unknown;
}

/** Route params read from ActivatedRoute snapshot */
export interface AppRouteParams {
  readonly LoginName:      string;
  readonly RegistrationNo: string;
  readonly Role:           string;
}
