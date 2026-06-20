// ─────────────────────────────────────────────────────────────
//  Student Dashboard (Stage 2) — Feature Constants
// ─────────────────────────────────────────────────────────────

import { DocumentField } from '../models/student-dashboard.models';

// ── Server ────────────────────────────────────────────────────
export const SERVER_URL = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';

// ── File validation ───────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES  = 3_148_576;                // 3 MB
export const SAFE_FILENAME_REGEX  = /^[a-zA-Z0-9._-]+$/;

// ── Form controls that must remain disabled in edit mode ──────
export const ALWAYS_DISABLED_KEYS = new Set<string>([
  'registrationNo', 'emailId', 'applicationId', 'acceptPolicy',
]);

// ── Conditional validator targets ─────────────────────────────
export const CONDITIONAL_PASSPORT_KEYS = ['passportNumber', 'passportIssueDate', 'passportValidUpto'] as const;
export const CONDITIONAL_SCORE_KEYS    = ['speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] as const;
export const CONDITIONAL_RELATIVE_KEYS = ['relativeRelation', 'relativeCountry'] as const;

// ── Document panel config ─────────────────────────────────────
// Single source of truth: drives both the upload UI and FormData assembly.
export const DOCUMENT_FIELDS: ReadonlyArray<DocumentField> = [
  { key: 'feesProof',    label: 'Fees Proof Document', apiFileField: 'feesProofFileName',     formNameField: 'FeesProofFileName',     formDataField: 'FeesProofData'     },
  { key: 'resume',       label: 'Resume Document',      apiFileField: 'resumeFileName',        formNameField: 'ResumeFileName',        formDataField: 'ResumeFileData'    },
  { key: 'consent',      label: 'Consent Letter',       apiFileField: 'consentLetterFileName', formNameField: 'ConsentLetterFileName', formDataField: 'ConsentLetterData' },
  { key: 'passport',     label: 'Passport File',        apiFileField: 'passportFileName',      formNameField: 'PassportFileName',      formDataField: 'PassportFileData'  },
  { key: 'englishProof', label: 'English Test Proof',   apiFileField: 'englishProofFileName',  formNameField: 'EnglishProofFileName',  formDataField: 'EnglishProofData'  },
];

// ── FormData field names for the application update API ───────
export const FORM_SUBMIT_FIELDS = [
  'RegistrationNo', 'ApplicationId', 'EmailId', 'CountryName', 'WhatsAppNo',
  'PhoneNumber', 'ParentContact', 'ApplyingOption', 'UniversityOption1',
  'UniversityOption2', 'UniversityOption3', 'PassportStatus', 'PassportNumber',
  'PassportIssueDate', 'PassportValidUpto', 'IsVisaRejected', 'VisaRejectedReason',
  'VisaRejectedCountry', 'EnglishTestType', 'SpeakingScore', 'ListeningScore',
  'ReadingScore', 'WritingScore', 'OverallScore', 'EnglishTestYear',
  'IsSelfFunded', 'SponsorName', 'SponsorRelation', 'SponsorContact', 'SponsorEmail',
  'AvailableFunds', 'RelativeName', 'RelativeRelation', 'RelativeCountry',
] as const;

// ── Select options ────────────────────────────────────────────
export const APPLYING_OPTIONS        = ['Spring', 'Fall'] as const;
export const YES_NO_OPTIONS          = ['Yes', 'No'] as const;
export const AVAILABLE_FUNDS_OPTIONS = ['2 to 4 Lakhs', '4 to 6 Lakhs', '6 to 8 Lakhs'] as const;

export const ENGLISH_TEST_TYPES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'NotRequried', label: 'Not Required'    },
  { value: 'NotGiven',    label: 'Not Given'        },
  { value: 'Applied',     label: 'Applied'          },
  { value: 'Appeared',    label: 'Appeared / Given' },
  { value: 'PTE',         label: 'PTE'              },
  { value: 'DULINGO',     label: 'DUOLINGO'         },
  { value: 'IELTS',       label: 'IELTS'            },
  { value: 'TOFEL',       label: 'TOEFL'            },
];

// ── Human-readable label overrides ───────────────────────────
export const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  isSelfFunded:    'Sponsor Type',
  isVisaRejected:  'Is Visa Rejected?',
  acceptPolicy:    'Declaration Status',
  whatsAppNo:      'WhatsApp No.',
  phoneNumber:     'Phone No.',
  parentContact:   'Parent Contact No.',
  registrationNo:  'Registration No.',
  emailId:         'Email ID',
  applicationId:   'Application ID',
};
