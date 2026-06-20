// ─────────────────────────────────────────────────────────────
//  Application Details — Feature Constants
//  All static config lives here; nothing is duplicated in the
//  component class, making each piece independently changeable.
// ─────────────────────────────────────────────────────────────

import { DocumentUpload, FormSection } from '../models/application-details.models';

// ── Section definitions ───────────────────────────────────────
export const FORM_SECTIONS: ReadonlyArray<FormSection> = [
  { label: 'Personal Details',        keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
  { label: 'University Preferences',  keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
  { label: 'Relative at Abroad',      keys: ['relativeName', 'relativeRelation', 'relativeCountry'] },
  { label: 'Passport Details',        keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
  { label: 'Visa Details',            keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
  { label: 'English Test Details',    keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
  { label: 'Sponsor Details',         keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
  { label: 'Financial & Declaration', keys: ['availableFunds'] },
];

// ── Document panels ───────────────────────────────────────────
export const DOCUMENT_UPLOADS: ReadonlyArray<DocumentUpload> = [
  { key: 'resumeFileName',          label: 'Resume / CV',        icon: 'bi-file-person'        },
  { key: 'feesProofFileName',       label: 'Fees Proof',         icon: 'bi-receipt'             },
  { key: 'consentLetterFileName',   label: 'Consent Letter',     icon: 'bi-file-earmark-check'  },
  { key: 'passportFileName',        label: 'Passport Copy',      icon: 'bi-passport'            },
  { key: 'englishTestDocumentPath', label: 'English Test Proof', icon: 'bi-translate'           },
];

// ── Section → Bootstrap Icon mapping ─────────────────────────
export const SECTION_ICONS: Readonly<Record<string, string>> = {
  'Personal Details':        'bi-person-fill',
  'University Preferences':  'bi-building',
  'Relative at Abroad':      'bi-people-fill',
  'Passport Details':        'bi-passport',
  'Visa Details':            'bi-card-checklist',
  'English Test Details':    'bi-translate',
  'Sponsor Details':         'bi-cash-stack',
  'Financial & Declaration': 'bi-shield-check',
};

// ── Set-based lookup tables (O(1) vs O(n) Array.includes) ────
/** Score sub-fields hidden when the test status makes them irrelevant */
export const SCORE_FIELDS = new Set<string>([
  'speakingScore', 'readingScore', 'writingScore',
  'listeningScore', 'overallScore', 'englishTestYear',
]);

/** englishTestType values for which score fields are hidden */
export const NO_SCORE_TEST_TYPES = new Set<string>([
  'NotRequried', 'NotRequired', 'NotGiven', 'Applied',
]);

/** isSelfFunded truthy API values (API returns string, not boolean) */
export const SELF_FUNDED_VALUES = new Set<string>(['True', 'Yes', 'true']);

/** sponsorName values that indicate parent-funded — show name only */
export const PARENT_SPONSOR_TYPES = new Set<string>(['parent', 'parents']);

/** sponsorName values that indicate external sponsor — show contact details */
export const OTHER_SPONSOR_TYPES = new Set<string>(['other', 'others']);

// ── Human-readable label overrides (camelCase key → display string) ──
export const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  isVisaRejected:        'Is Visa Rejected?',
  relativeNotApplicable: 'Relative at Abroad',
  sponsorName:           'Sponsor Type',
  acceptPolicy:          'Declaration Statement',
};

// ── Roles that navigate to the HOD dashboard ─────────────────
export const HOD_ROLES = new Set<string>(['HoW', 'HOD', 'Counsellor', 'Faculty']);

// ── Blank form control values (centralised so the shape is typed) ──
export const INITIAL_FORM_CONTROLS = {
  applicationId: [''], registrationNo: [''], emailId:        [''],
  countryName:   [''], whatsAppNo:     [''], phoneNumber:    [''], parentContact:   [''],
  applyingOption: [''], universityOption1: [''], universityOption2: [''], universityOption3: [''],
  passportStatus: [''], passportNumber: [''], passportIssueDate: [''], passportValidUpto: [''],
  isVisaRejected: [''], visaRejectedReason: [''], visaRejectedCountry: [''],
  englishTestType: [''], speakingScore: [''], listeningScore: [''],
  readingScore:    [''], writingScore:  [''], overallScore:   [''], englishTestYear: [''],
  isSelfFunded:   [''], sponsorName:   [''], sponsorRelation: [''],
  sponsorContact: [''], sponsorEmail:  [''],
  availableFunds: [''], acceptPolicy:  [false as boolean | string],
  relativeName:   [''], relativeRelation: [''], relativeCountry: [''],
} as const;

// ── Document server base URL ──────────────────────────────────
export const DOCUMENT_SERVER_URL = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
