/** A single Help Desk ticket, kept in-memory by HelpDeskApi (no backend exists for this feature yet). */
export interface HelpDeskTicket {
  requestFor: string;
  id: number;
  mainMenu: string;
  submenu: string;
  subject: string;
  priority: string;
  description: string;
  filePath: string;
  status: string;
  createdBy: string;
  responsibleUserIds: string;
  createdOn: string;
  remarks?: string;
  isApproved?: string | number | boolean | null;
  approvedOn?: string;
  approvedBy?: string;
  approvalRemarks?: string;

  updatedBy?: string;
  isSrsRequired?: boolean | string | number | null;
}
export interface HelpDeskStaffDetails {
 EmployeeName: string;
 EmployeeCode: string;
 Department: string;
 
}

export type NewHelpDeskTicket = Omit<HelpDeskTicket, 'id' | 'createdAt'>;

/** Generic `{ returnData: string }` action result, mirrors the shape used by other registration features. */
export interface HelpDeskActionResult {
  returnData: string;
}

/** Criteria object driving the advanced-search panel on the "Show Requests" tab. */
export interface HelpDeskSearchCriteria {
  requestFor: string;
  subject: string;
  submenu: string;
  createdBy: string;
  startDate: string | null;
  endDate: string | null;
}

export function createEmptySearchCriteria(): HelpDeskSearchCriteria {
  return {
    requestFor: '',
    subject: '',
    submenu: '',
    createdBy: '',
    startDate: null,
    endDate: null,
  };
}
