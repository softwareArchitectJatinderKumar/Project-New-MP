// ─────────────────────────────────────────────────────────────
//  Student Application Details (Details view) — Feature Constants
//  All static config lives here; nothing duplicated in the component.
// ─────────────────────────────────────────────────────────────

import { DocumentUpload, FormSection } from '../models/application-details.models';

// ── Server ────────────────────────────────────────────────────
export const SERVER_URL = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';

// ── Section definitions ───────────────────────────────────────
export const FORM_SECTIONS: ReadonlyArray<FormSection> = [
  { label: 'Personal Details',        keys: ['applicationId', 'registrationNo', 'emailId', 'countryName', 'whatsAppNo', 'phoneNumber', 'parentContact'] },
  { label: 'University Preferences',  keys: ['applyingOption', 'universityOption1', 'universityOption2', 'universityOption3'] },
  { label: 'Relative at Abroad',      keys: ['relativeName', 'relativeRelation', 'relativeCountry', 'relativeEmail', 'relativePhone'] },
  { label: 'Passport Details',        keys: ['passportStatus', 'passportNumber', 'passportIssueDate', 'passportValidUpto'] },
  { label: 'Visa Details',            keys: ['isVisaRejected', 'visaRejectedReason', 'visaRejectedCountry'] },
  { label: 'English Test Details',    keys: ['englishTestType', 'speakingScore', 'listeningScore', 'readingScore', 'writingScore', 'overallScore', 'englishTestYear'] },
  { label: 'Sponsor Details',         keys: ['isSelfFunded', 'sponsorName', 'sponsorRelation', 'sponsorContact', 'sponsorEmail'] },
  { label: 'Financial & Declaration', keys: ['availableFunds'] },
];

// ── Document panels ───────────────────────────────────────────
export const DOCUMENT_UPLOADS: ReadonlyArray<DocumentUpload> = [
  { key: 'resumeFileName',          label: 'Resume Document',     icon: 'bi-file-person'       },
  { key: 'feesProofFileName',       label: 'Fees Proof Document', icon: 'bi-receipt'            },
  { key: 'consentLetterFileName',   label: 'Consent Letter',      icon: 'bi-file-earmark-check' },
  { key: 'passportFileName',        label: 'Passport Document',   icon: 'bi-passport'           },
  { key: 'englishTestDocumentPath', label: 'English Test Proof',  icon: 'bi-translate'          },
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

/** Score sub-fields hidden when test status makes them irrelevant */
export const SCORE_FIELDS = new Set<string>([
  'speakingScore', 'readingScore', 'writingScore',
  'listeningScore', 'overallScore', 'englishTestYear',
]);

/** englishTestType values that mean "no scores to show" */
export const NO_SCORE_TEST_TYPES = new Set<string>([
  'NotRequried', 'NotRequired', 'NotGiven', 'Applied',
]);

/**
 * isSelfFunded truthy API values.
 * fv() always returns String(value).trim(), so all entries are strings.
 * 'true' covers a boolean true that was serialised by patchValue.
 */
export const SELF_FUNDED_VALUES = new Set<string>(['true', 'True', 'Yes']);

/** sponsorName values meaning parent-funded */
export const PARENT_SPONSOR_TYPES = new Set<string>(['parent', 'parents']);

/** sponsorName values meaning external sponsor */
export const OTHER_SPONSOR_TYPES = new Set<string>(['other', 'others']);

/** Roles that navigate to the HOD dashboard */
export const HOD_ROLES = new Set<string>(['HoW', 'HOD', 'Counsellor', 'Faculty']);

// ── Human-readable label overrides ───────────────────────────
export const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  isVisaRejected:        'Is Visa Rejected?',
  relativeNotApplicable: 'Relative at Abroad',
  isSelfFunded:          'Sponsor Type',
  acceptPolicy:          'Declaration Statement',
};

// ── Initial (empty) form control map ─────────────────────────
export const INITIAL_FORM_CONTROLS = {
  applicationId: [''], registrationNo: [''], emailId:     [''],
  countryName:   [''], whatsAppNo:     [''], phoneNumber: [''], parentContact:    [''],
  applyingOption: [''], universityOption1: [''], universityOption2: [''], universityOption3: [''],
  passportStatus: [''], passportNumber: [''], passportIssueDate: [''], passportValidUpto: [''],
  isVisaRejected: [''], visaRejectedReason: [''], visaRejectedCountry: [''],
  englishTestType: [''], speakingScore: [''], listeningScore: [''],
  readingScore:    [''], writingScore:  [''], overallScore:   [''], englishTestYear: [''],
  isSelfFunded:   [''], sponsorName:   [''], sponsorRelation: [''],
  sponsorContact: [''], sponsorEmail:  [''],
  availableFunds: [''], acceptPolicy:  [false as boolean | string],
  relativeName:   [''], relativeRelation: [''], relativeCountry: [''],
  relativeEmail:  [''], relativePhone:  [''],
} as const;
