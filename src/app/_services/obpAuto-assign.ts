import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

import { xmlLeftAllocation } from '../views/Multiple-Metric-Dashboard/XMLLeftTransfer.model';
import { environment } from 'src/environments/environment';
const AUTH_API = 'https://projectsapi.lpu.in/';//'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';//'https://localhost:7125/';

@Injectable({
  providedIn: 'root'
})

export class ObpAutoAssignService {

 

  constructor(private http: HttpClient, private storageService: StorageService) { }

  // private authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiIyNTg5OSIsIkRlcGFydG1lbnROYW1lIjoiTi9BIiwiUm9sbElkIjoiNTAiLCJlbWFpbElkIjoiamF0aW4uMjU4OTlAbHB1LmNvLmluIiwiTkFNRSI6IkphdGluIFNhcnBhbCIsImlzQWN0aXZlIjoiVHJ1ZSIsIlVuaXF1ZWlkIjoiYmRmYWU4MWQtMDUxNy00M2ZjLWFjMzctZjM0ZDExODRmZjY3IiwiSXNQYXJlbnQiOiJGYWxzZSIsIlVzZXJUeXBlIjoiTi9BIiwiU3BlY2lhbEJsb2NrIjoiTi9BIiwibmJmIjoxNzIxODgxODU1LCJleHAiOjE3NTM0MTc4NTUsImlhdCI6MTcyMTg4MTg1NSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNS8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyJ9.K8Pswv0q8MtTJ_QHOyX2TSksR6x888AdYVCqd5f1tTI';

  GetEmployeeDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
   .set('Authorization', 'Bearer ' + token)
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Mou/GetEmployeeDetails',
     {headers}
    );
  }

 

  GetObpMetricDetails(Id:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API_LOCAL + 'api/LpuObpAutomation/GetObpMetricDetails?MetricId='+Id, { headers }
    );
  }

  getSiteEngineers():Observable<any>  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
        AUTH_API+ 'api/LpuObpAutomation/GetSiteEngineerDTO', { headers }
    );

  }
  GetAllOBPPlannerSessions(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API+ 'api/LpuObpAutomation/GetOBPPlannerSessions', { headers }
    );
  }
  
  GetOBPQueryResultsData(Query: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API_LOCAL + 'api/LpuObpAutomation/GetQueryResultsData?queryData='+Query, { headers }
    );
  }

  CallWebApiInsertData(DataValues: FormData): Observable<any> {
    // console.log("Form Values in API HIT Services" + DataValues)
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      // AUTH_API_LOCAL + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers }
      AUTH_API_LOCAL+'api/LpuObpAutomation/OBPInsertMetricAutoIntegration',DataValues, { headers });
  }


  
  GetOBPStaffConstructionDetails(SessionId:number, IsApproved: number): Observable<any>{
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      // https://localhost:7125/api/LpuObpAutomation/GetOBPStaffConstructionDetails?SessionId=16&IsApproved=0
      AUTH_API + 'api/LpuObpAutomation/GetOBPStaffConstructionDetails?SessionId='+SessionId+'&IsApproved='+IsApproved, { headers }
    );
  }
  GetMetricStageAllocationDetails(MetricId:any): Observable<any>{
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API + 'api/LpuObpAutomation/GetMetricStageAllocationData?MetricId='+MetricId, { headers }
    );
  }



  UpdateOBPStaffConstructionDetails(DataValues: FormData): Observable<any> {
    // console.log("Form Values in API HIT Services" + DataValues)
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      // AUTH_API_LOCAL + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers }
     AUTH_API+'api/LpuObpAutomation/UpdateOBPStaffConstructionDetails',DataValues, { headers });
  }
  

  GetOBPEstateGetSupportingDocuments(AllocationId: any): Observable<any>{
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuObpAutomation/GetOBPEstateGetSupportingDocuments?AllocationId='+AllocationId, { headers }
    );
  }

  // added on 24-june-25
  GetEStateDetailsFinalVerification(SessionId:number, IsApproved: number): Observable<any>{
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      // https://localhost:7125/api/LpuObpAutomation/GetOBPStaffConstructionDetails?SessionId=16&IsApproved=0
      AUTH_API + 'api/LpuObpAutomation/GetEStateDetailsFinalVerification?SessionId='+SessionId+'&IsApproved='+IsApproved, { headers }
      // 'https://localhost:7125/api/LpuObpAutomation/GetEStateDetailsFinalVerification?SessionId='+SessionId+'&IsApproved='+IsApproved, { headers }
    );
  }
// Added on 24-june-25
GetEStateMetrticStageDetails(MetricId:any): Observable<any>{
  let token = this.storageService.getUser();
  let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
  return this.http.get(
    // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
    // 'https://localhost:7125/api/LpuObpAutomation/GetEStateMetrticStageDetails?MetricId='+MetricId, { headers }
     AUTH_API +'api/LpuObpAutomation/GetEStateMetrticStageDetails?MetricId='+MetricId, { headers }
    //  'https://localhost:7125/api/LpuObpAutomation/GetEStateMetrticStageDetails?MetricId='+MetricId, { headers }
  );
}  

UpdateOBPConstructionMetricFinalRemarks(DataValues: FormData): Observable<any> {
  // console.log("Form Values in API HIT Services" + DataValues)
  let token = this.storageService.getUser();
  let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
  return this.http.post(
    // AUTH_API_LOCAL + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers }
  //  'https://localhost:7125/api/LpuObpAutomation/UpdateOBPConstructionMetricFinalRemarks',DataValues, { headers });
    AUTH_API +'api/LpuObpAutomation/UpdateOBPConstructionMetricFinalRemarks',DataValues, { headers });
    // AUTH_API +'https://localhost:7125/api/LpuObpAutomation/UpdateOBPConstructionMetricFinalRemarks',DataValues, { headers });
}

  insertConstructionInspectionTask(DataValues: FormData): Observable<any> {
     let token = this.storageService.getUser();
    let headers = new HttpHeaders()
     .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API_LOCAL+'api/LpuObpAutomation/InsertConstructionInspectionTask',DataValues, { headers });
  }
  
 getInspectionDetails():Observable<any>  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
      return this.http.get(
     AUTH_API_LOCAL+ 'api/LpuObpAutomation/GetInspectionTask', { headers }
    );

  }

  // added 21?july/23025
   getEmployeeInspectionDetails():Observable<any>  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
      return this.http.get(
     AUTH_API_LOCAL+ 'api/LpuObpAutomation/GetEmployeeInspectionTask', { headers }
    );

  }
   UpdateConstructionInspectionTask(data: FormData): Observable<any> {
       const token = this.storageService.getUser();
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.post(
      AUTH_API_LOCAL + 'api/LpuObpAutomation/UpdateEmployeeConstructionInspectionTask',
      data,
      { headers }
    );
  }

  // Upload Excel sheet Record data into University Database 
  CreateLeftTransferDataUsingExcelSheet(LeftTransferDataXml: xmlLeftAllocation): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      //  .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      'https://localhost:7125/' +   'api/LpuObpAutomation/AddLeftTransferDataUsingExcelSheet', LeftTransferDataXml,
      { headers }
    );
  }
  // Upload Excel sheet Record data into University Database 
  InsertLeftTransferData(data: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      'https://localhost:7125/' +   'api/LpuObpAutomation/AddLeftTransferData', data,
      { headers }
    );
  }

  GetAllocationData():Observable<any>{
     let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
      return this.http.get(
     'https://localhost:7125/' + 'api/LpuObpAutomation/GetMetricAllocationData', { headers }
    );

  }
}
