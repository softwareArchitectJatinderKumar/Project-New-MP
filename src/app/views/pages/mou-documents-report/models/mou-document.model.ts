// ---------------------------------------------------------------------
// Domain models for the MOU Documents Report feature.
//
// MouDocument keeps a typed surface for every field the component/template
// actually reads by name, while still allowing the backend's dynamic,
// report-only fields (rendered as auto-generated grid columns) through an
// index signature — the API response shape isn't formally documented
// elsewhere, so we type what we use rather than over-declaring.
// ---------------------------------------------------------------------
export interface MouDocument {
  id: number;
  newMouId?: string | number | null;
  mouPartnerName?: string | null;
  mouTitle?: string | null;
  mouStartDate?: string | null;
  mouEndDate?: string | null;
  mouStatus?: string | null;
  isApproved?: boolean | number | string | null;
  hasRenewal?: boolean | string | null;
  filePath?: string | null;
  newRenewalFile?: string | null;
  schoolDivisionInvolved?: string | null;
  spocName?: string | null;
  spocEmailId?: string | null;
  spocContactNo?: string | null;
  lpuSpocUID?: string | null;
  lpuSpocName?: string | null;
  lpuSpocEmail?: string | null;
  mouUploadedBy?: string | null;
  mouUploadedByUID?: string | null;
  mouApprovedBy?: string | null;
  approvedBy?: string | null;
  approvalDate?: string | null;
  createdOn?: string | null;
  createdBy?: string | null;
  disapprovalReason?: string | null;
  [key: string]: unknown;
}

export interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

export interface Employee {
  employeeName: string;
  employeeCode: string;
}

export interface ApiListResponse<T> {
  item1: T[];
}

/** Shape returned by `mouForm.getRawValue()`; mirrors the controls defined in initForm(). */
export interface MouFormRawValue {
  mouId: string | number;
  selectedDivisions: number[];
  mouOrganisation: string;
  startDate: string;
  endDate: string;
  isIndefinite: boolean;
  spocName: string;
  spocEmail: string;
  spocContact: string;
  lpuSpocName: string;
  lpuSpocUid: string;
  lpuSpocEmail: string;
  remarks: string;
}

export type StatusFilter = 'all' | 'active' | 'expired' | 'renewed';
export type ApprovalFilter = 'all' | 'approved' | 'disapproved';
