export interface DressMaterialModel {
Quantity: any;
IsIssued: any;
IsReturned: any;
IsApproved: any;
CreatedOn: string|number|Date;
MaterialId: number;
  Action?: string;
  materialId?: any;
  material?: string;
  requestPerson?: string;
  quantity?: number;
  createdBy?: string;
  loginId?: string;
  sessionId?: number;
  isIssued?: boolean;
  isReturned?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  approvedOn?: string;
  approvedBy?: string;
  createdOn?: string;
  returnOn?: string;
  returnId?: number;
  msg?: string;
}
