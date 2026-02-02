import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
const AUTH_API = 'https://localhost:7125/';//'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';//'https://localhost:7125/';


// https://localhost:7125/api/Planning/GetDivisions

  import {
     Division,
  Criteria,
  KeyIndicator,
  Metric,
  MetricSource,
  MetricWeightage,
  Stage,
  CheckList,
  CriteriaRequest,
  KeyIndicatorRequest,
  MetricRequest,
  RenameCriteriaRequest,
  ApiResponse,
  UploadFileResponse
  } from '../_model/criteria.model';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})

export class CriteriaService {
  private readonly baseApiUrl = AUTH_API + 'api/Planning/';

  constructor(private http: HttpClient, private storageService: StorageService) { }

  /**
   * Get all divisions
   */
  getDivisions(): Observable<any> {
    // return this.http.get<Division[]>(`${this.baseApiUrl}/GetDivisions`);
      let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
        return this.http.get(
          // AUTH_API + 'api/Planning/GetSchoolDivisions',
          'https://localhost:7125/api/Planning/GetDivisions',
         {headers}
        );
  }

  GetCirteriaList(Id: any): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json'); 
      return this.http.get(
        AUTH_API + 'GetCirteriaList?DivisionId=' + Id,
       {headers}
      );   
    }

  getCriteriasByDivision(Id: any): Observable<any> {
     let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
        return this.http.get(
          // 'https://localhost:7125/api/Planning/GetCriteriasByDivision?divisionId=36
          AUTH_API + 'api/Planning/GetCriteriasByDivision?divisionId=' + Id,
         {headers}
        );
    
  }

  /**
   * Get criteria by ID
   */
  getCriteriaById(criteriaId: number): Observable<Criteria> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get<Criteria>(
      `${this.baseApiUrl} + GetCriteriaById?id=` + criteriaId,
      // AUTH_API + 'api/Placement/GetCriteriaById?id='+criteriaId,
      { headers }
    );
  }

  /**
   * Save new criteria
   */
  saveCriteria(criteria: CriteriaRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveCriteria`, criteria);
  }

  /**
   * Rename criteria
   */
  renameCriteria(request: RenameCriteriaRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/RenameCriteria`, request);
  }

  /**
   * Deactivate criteria
   */
  deactivateCriteria(criteriaId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/DeactivateCriteria`, { id: criteriaId });
  }

  /**
   * Activate criteria
   */
  activateCriteria(criteriaId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/ActivateCriteria`, { id: criteriaId });
  }

  /**
   * Upload criteria file
   */
  uploadCriteriaFile(file: File, divisionId: number): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('divisionId', divisionId.toString());
    return this.http.post<UploadFileResponse>(`${this.baseApiUrl}/UploadCriteriaFile`, formData);
  }

  // /**
  //  * Export criteria to Excel
  //  */
  // exportCriteria(divisionId: number): Observable<Blob> {
  //   return true;
  //   // const params = new HttpParams().set('divisionId', divisionId.toString());
  //   // return this.http.get(`${this.baseApiUrl}/ExportCriteria`, { params, responseType: 'blob' });
  // }

  // /**
  //  * Delete criteria
  //  */
  // deleteCriteria(criteriaId: number): Observable<ApiResponse<null>> {
  //   const params = new HttpParams().set('id', criteriaId.toString());
  //   return this.http.delete<ApiResponse<null>>(`${this.baseApiUrl}/DeleteCriteria`, { params });
  // }

  // // ==================== Key Indicator Methods ====================
  
  // /**
  //  * Get key indicators by division ID
  //  */
  // getKeyIndicatorsByDivision(divisionId: number): Observable<KeyIndicator[]> {
  //   const params = new HttpParams().set('divisionId', divisionId.toString());
  //   return this.http.get<KeyIndicator[]>(`${this.baseApiUrl}/GetKeyIndicators`, { params });
  // }

  // /**
  //  * Get key indicators by criteria ID
  //  */
  // getKeyIndicatorsByCriteria(criteriaId: number): Observable<KeyIndicator[]> {
  //   const params = new HttpParams().set('criteriaId', criteriaId.toString());
  //   return this.http.get<KeyIndicator[]>(`${this.baseApiUrl}/GetIndicatorsByCriteria`, { params });
  // }

  /**
   * Save key indicator
   */
  saveKeyIndicator(indicator: KeyIndicatorRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveKeyIndicator`, indicator);
  }

  /**
   * Rename key indicator
   */
  renameIndicator(indicatorId: number, desc: string, criteriaId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/RenameIndicator`, {
      indicatorId,
      desc,
      indicatorCriteriaId: criteriaId
    });
  }

  /**
   * Deactivate key indicator
   */
  deactivateIndicator(indicatorId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/DeactivateIndicator`, { id: indicatorId });
  }

  /**
   * Activate key indicator
   */
  activateIndicator(indicatorId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/ActivateIndicator`, { id: indicatorId });
  }

  /**
   * Upload key indicators from Excel
   */
  uploadKeyIndicatorsFile(file: File, criteriaId: number): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('criteriaId', criteriaId.toString());
    return this.http.post<UploadFileResponse>(`${this.baseApiUrl}/UploadKeyIndicatorsFile`, formData);
  }

  // ==================== Metric Master Methods ====================
  
  /**
   * Get metrics by division ID
  //  */
  // getMetricsByDivision(divisionId: number): Observable<Metric[]> {
  //   const params = new HttpParams().set('divisionId', divisionId.toString());
  //   return this.http.get<Metric[]>(`${this.baseApiUrl}/GetMetrics`, { params });
  // }

  // /**
  //  * Get metrics by indicator ID
  //  */
  // getMetricsByIndicator(indicatorId: number): Observable<Metric[]> {
  //   const params = new HttpParams().set('indicatorId', indicatorId.toString());
  //   return this.http.get<Metric[]>(`${this.baseApiUrl}/GetMetricsByIndicator`, { params });
  // }

  /**
   * Save metric
   */
  saveMetric(metric: MetricRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveMetric`, metric);
  }

  /**
   * Rename metric
   */
  renameMetric(metricId: number, desc: string, category: string, indicatorId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/RenameMetric`, {
      metricId,
      desc,
      category,
      indicatorId
    });
  }

  /**
   * Deactivate metric
   */
  deactivateMetric(metricId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/DeactivateMetric`, { id: metricId });
  }

  /**
   * Activate metric
   */
  activateMetric(metricId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/ActivateMetric`, { id: metricId });
  }

  /**
   * Upload metrics from Excel
   */
  uploadMetricsFile(file: File, indicatorId: number): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('indicatorId', indicatorId.toString());
    return this.http.post<UploadFileResponse>(`${this.baseApiUrl}/UploadMetricsFile`, formData);
  }

  // /**
  //  * Search metrics
  //  */
  // searchMetrics(metricName: string): Observable<Metric[]> {
  //   const params = new HttpParams().set('metricName', metricName);
  //   return this.http.get<Metric[]>(`${this.baseApiUrl}/SearchMetrics`, { params });
  // }

  // // ==================== Metric Source Methods ====================
  
  // /**
  //  * Get metric sources by metric ID
  //  */
  // getMetricSources(metricId: number): Observable<MetricSource[]> {
  //   const params = new HttpParams().set('metricId', metricId.toString());
  //   return this.http.get<MetricSource[]>(`${this.baseApiUrl}/GetMetricsAccreditation`, { params });
  // }

  /**
   * Save metric source
   */
  saveMetricSource(source: MetricSource): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveMetricSource`, source);
  }

  /**
   * Deactivate metric source
   */
  deactivateMetricSource(sourceId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/DeactivateMetricSource`, { id: sourceId });
  }

  /**
   * Activate metric source
   */
  activateMetricSource(sourceId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/ActivateMetricSource`, { id: sourceId });
  }

  // ==================== Metric Weightage Methods ====================
  
  // /**
  //  * Get metric weightage by indicator ID
  //  */
  // getMetricWeightage(indicatorId: number, sessionId: number): Observable<MetricWeightage[]> {
  //   const params = new HttpParams()
  //     .set('indicatorId', indicatorId.toString())
  //     .set('sessionId', sessionId.toString());
  //   return this.http.get<MetricWeightage[]>(`${this.baseApiUrl}/GetMetricsWeightage`, { params });
  // }

  /**
   * Save metric weightage
   */
  saveWeightage(weightageData: MetricWeightage[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveWeightage`, { lstUpdateData: weightageData });
  }

  // ==================== Miscellaneous Methods (Stages/Checklist) ====================
  
  // /**
  //  * Get stages by metric ID
  //  */
  // getStages(metricId: number): Observable<Stage[]> {
  //   const params = new HttpParams().set('metricId', metricId.toString());
  //   return this.http.get<Stage[]>(`${this.baseApiUrl}/GetStages`, { params });
  // }

  /**
   * Save stage
   */
  saveStage(stage: Stage): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveStage`, stage);
  }

  /**
   * Get checklists by metric ID
   */
  // getChecklists(metricId: number): Observable<CheckList[]> {
  //   const params = new HttpParams().set('metricId', metricId.toString());
  //   return this.http.get<CheckList[]>(`${this.baseApiUrl}/GetChecklists`, { params });
  // }

  /**
   * Save checklist
   */
  saveChecklist(checklist: CheckList): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveChecklist`, checklist);
  }
}
//   /**
//    * Save new criteria
//    */
//   saveCriteria(criteria: CriteriaRequest): Observable<ApiResponse<null>> {
//     return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/SaveCriteria`, criteria);
//   }

//   /**
//    * Rename criteria
//    */
//   renameCriteria(request: RenameCriteriaRequest): Observable<ApiResponse<null>> {
//     return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/RenameCriteria`, request);
//   }

//   /**
//    * Deactivate criteria
//    */
//   deactivateCriteria(criteriaId: number): Observable<ApiResponse<null>> {
//     return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/DeactivateCriteria`, { id: criteriaId });
//   }

//   /**
//    * Activate criteria
//    */
//   activateCriteria(criteriaId: number): Observable<ApiResponse<null>> {
//     return this.http.post<ApiResponse<null>>(`${this.baseApiUrl}/ActivateCriteria`, { id: criteriaId });
//   }

//   /**
//    * Upload criteria file
//    */
//   uploadCriteriaFile(file: File): Observable<UploadFileResponse> {
//     const formData = new FormData();
//     formData.append('file', file);
//     return this.http.post<UploadFileResponse>(`${this.baseApiUrl}/UploadCriteriaFile`, formData);
//   }

//   /**
//    * Delete criteria
//    */
//   // deleteCriteria(criteriaId: number): Observable<ApiResponse<null>> {
//   //   const params = new HttpParams().set('id', criteriaId.toString());
//   //   return this.http.delete<ApiResponse<null>>(`${this.baseApiUrl}/DeleteCriteria`, { params });
//   // }
// }
