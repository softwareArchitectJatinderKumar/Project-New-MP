export const REQUEST_TYPE_OPTIONS: readonly string[] = ['UMS', 'Placement'];

/** Sub-request options, keyed by Request Type. */
export const SUB_REQUEST_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  UMS: ['One', 'Two', 'Three', 'Four', 'Five'],
  Placement: ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'],
};

/** Dummy submenu options, keyed by Request Type. */
export const SUBMENU_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  UMS: [
    'Login Issue',
    'Password Reset',
    'Fee Payment Query',
    'Course Registration',
    'Result Discrepancy',
  ],
  Placement: [
    'Resume Upload Issue',
    'Interview Scheduling',
    'Company Registration',
    'Offer Letter Issue',
    'Placement Drive Query',
  ],
};

export const RECORDS_PER_PAGE_OPTIONS: readonly number[] = [5, 10, 25, 50];

export const DEFAULT_RECORDS_PER_PAGE = 10;

/** Column order the bulk-upload sheet must follow (index -> field), and the header it maps to. */
export const TICKET_UPLOAD_COLUMNS: readonly { field: string; header: string }[] = [
  { field: 'requestFor', header: 'requestFor' },
  { field: 'subject', header: 'subject' },
  { field: 'submenu', header: 'Submenu' },
  { field: 'createdBy', header: 'CreatedBy' },
];

export const TICKET_EXPORT_COLUMNS: readonly { header: string; key: string; width: number }[] = [
  { header: 'Ticket ID', key: 'id', width: 12 },
  { header: 'Request Type', key: 'requestFor', width: 18 },
  { header: 'Sub Request', key: 'subject', width: 18 },
  { header: 'Submenu', key: 'submenu', width: 30 },
  { header: 'Created By', key: 'createdBy', width: 20 },
  { header: 'Created Date', key: 'createdDate', width: 18 },
];
