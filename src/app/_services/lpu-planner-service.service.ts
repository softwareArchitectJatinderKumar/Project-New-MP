import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
// const AUTH_API ='https://localhost:7125/';
const AUTH_API ='https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class LpuPlannerServiceService {
  // baseUrl = AUTH_API ;//environment.apiUrl;
  FileData: string;
  fileName: string;

  // baseUrl = environment.apiUrl;


  constructor(private http: HttpClient, private storageService: StorageService) { }
  // private authToken = environment.authToken;

  GetSchoolDivisions(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Planning/GetSchoolDivisions',
     {headers}
    );

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetSchoolDivisions', httpOptions);
  }

  GetSchoolDivisionsDepartment(Id: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Planning/GetSchoolDivisionsDepartment?Id=' + Id,
     {headers}
    );
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetSchoolDivisionsDepartment?Id=' + Id, httpOptions);
  }



  GetDecodedObpDailyFilledProgrees(UId: any, DeptCode: any, DateData: any): Observable<any> {
    debugger;
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Planning/GetDecodedObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode+ '&FilledDate=' + DateData,
      // AUTH_API + 'api/Planning/GetDecodedObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode+ '&FilledDate=' + DateData,
     {headers}
    );
  }
  GetObpDailyFilledProgrees(UId: any, DeptCode: any, DateData: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/Planning/GetDecodedObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode+ '&FilledDate=' + DateData,
      AUTH_API + 'api/Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode+ '&FilledDate=' + DateData,
     {headers}
    );
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, httpOptions);
  }
//GetAllEventsDetails

// PostDQARemarksObpDailyProgress(formData: FormData): Observable<any>{
//    let token = this.storageService.getUser();
//    let headers= new HttpHeaders()
//    .set('Authorization','Beader' + this.authToken)
//    .set('Content-Type','application/json');
//    return this.http.post(
//     AUTH_API + 'Planning/AddOBPProgressDQARemarks', formData, { headers }
//    );
//   }


  PostDQARemarksObpDailyProgress(newRemarksData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    // "Content-Type": "multipart/form-data"
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Content-Type', 'multipart/form-data');
    return this.http.post(
      AUTH_API + 'api/Planning/AddOBPProgressDQARemarks', newRemarksData, { headers }
    );
  }
  GetDQARemarsUidWiseWithAllocationId(OBPFilledDate: any, AllocationId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    // .set('Authorization', 'Bearer ' + token)
    .set('Authorization', 'Bearer ' + token)
    // .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Planning/GetOBPProgressDQARemarks?OBPFilledDate=' + OBPFilledDate+'&AllocationId='+AllocationId ,
     {headers}
    );
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, httpOptions);
  }

  GetDQARemarsUidWise(UId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    // .set('Authorization', 'Bearer ' + token)
    .set('Authorization', 'Bearer ' + token)
    // .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Planning/GetOBPProgressDQARemarks?Uid=' + UId ,
     {headers}
    );
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, httpOptions);
  }
}
