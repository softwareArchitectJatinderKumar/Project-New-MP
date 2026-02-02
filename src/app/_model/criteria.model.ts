/**
 * Criteria Master Models - Updated for API response (camelCase)
 * Includes all models for Criteria Master, Key Indicator, Metric, and related entities
 */

export interface Division {
  id: number;
  name: string;
}

export interface Criteria {
  id: number;
  criteriaDesc: string | null;
  isActive: boolean | null;
  weightage: number | null;
  divisionId: number | null;
  name: string;  // API returns 'name' field
}

export interface KeyIndicator {
  id: number;
  indicatorDesc: string;
  isActive: boolean | null;
  criteriaId: number | null;
  criteriaDesc?: string;
  weightage?: number;
}

export interface Metric {
  id: number;
  metricDesc: string;
  category: string;  // A, B, AB, C
  isActive: boolean | null;
  indicatorId: number | null;
  metricFormula?: string;
  metricFinal?: number;
  sourceDivLevel?: number;
  otherDivLevel?: number;
  schoolLevel?: number;
  allocationId?: number;
  metricPriority?: string;  // L, M, H
  meetingQuarter1?: boolean;
  meetingQuarter2?: boolean;
  meetingQuarter3?: boolean;
  meetingQuarter4?: boolean;
  isExclusive?: boolean;
  isMandatory?: boolean;
  umsPath?: string;
}

export interface MetricSource {
  id: number;
  name: string;
  metricId: number;
  isActive: boolean | null;
}

export interface MetricWeightage {
  metricId: number;
  metricDesc: string;
  weightage: number;
  sessionId?: number;
}

export interface Stage {
  id: number;
  stageName: string;
  metricId: number;
  isActive: boolean | null;
  orderNo?: number;
}

export interface CheckList {
  id: number;
  checklistName: string;
  metricId: number;
  isActive: boolean | null;
}

// Request/Response interfaces
export interface CriteriaRequest {
  criteriaDesc: string;
  divisionId: number;
  isActive?: boolean;
}

export interface KeyIndicatorRequest {
  indicatorDesc: string;
  criteriaId: number;
  isActive?: boolean;
}

export interface MetricRequest {
  metricDesc: string;
  indicatorId: number;
  category?: string;
  metricFormula?: string;
  metricFinal?: number;
  sourceDivLevel?: number;
  otherDivLevel?: number;
  schoolLevel?: number;
  metricPriority?: string;
  meetingQuarter1?: boolean;
  meetingQuarter2?: boolean;
  meetingQuarter3?: boolean;
  meetingQuarter4?: boolean;
  isExclusive?: boolean;
  isMandatory?: boolean;
  umsPath?: string;
  isActive?: boolean;
}

export interface RenameCriteriaRequest {
  criteriaId: number;
  desc: string;
  divId: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  hasErrors?: boolean;
  errors?: string[];
}

export interface UploadFileResponse {
  hasErrors: boolean;
  errors?: string[];
  records?: Array<{ 
    id?: number;
    description: string; 
    rowNumber: number 
  }>;
  message?: string;
}

export interface GridResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}


// /**
//  * Criteria Master Models
//  * Refactored from frmCriteriaMaster.aspx.cs for Angular 14+
//  */

// export interface Division {
//   id: number;
//   name: string;
// }

// export interface Criteria {
//   id: number;
//   criteriaDesc: string | null;
//   isActive: boolean | null;
//   weightage: number | null;
//   divisionId: number | null;
//   name: string;
// }

// export interface CriteriaRequest {
//   criteriaDesc: string;
//   divisionId: number;
//   isActive?: boolean;
// }

// export interface RenameCriteriaRequest {
//   criteriaId: number;
//   desc: string;
//   divId: number;
// }

// export interface IdRequest {
//   id: number;
// }

// export interface ApiResponse<T> {
//   message?: string;
//   data?: T;
//   hasErrors?: boolean;
//   errors?: string[];
// }

// export interface UploadFileResponse {
//   hasErrors: boolean;
//   errors?: string[];
//   criterias?: Array<{ Criteria: string; RowNumber: number }>;
//   message?: string;
// }
