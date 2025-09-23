
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

import { University } from '../views/pages/sm-add-new-university/university.model';
import { environment } from 'src/environments/environment';
const AUTH_API = 'https://projectsapi.lpu.in/api/';
const AUTH_APILOCAL = 'https://projectsapi.lpu.in/api/';



@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class StudentGrievanceServicesLocalService {
  baseUrl = 'https://projectsapi.lpu.in/';
  FileData: string;
  fileName: string;
  constructor(private http: HttpClient, private storageService: StorageService) { }
  // private authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiIzMTMwOSIsIkRlcGFydG1lbnROYW1lIjoiTi9BIiwiUm9sbElkIjoiNTAiLCJlbWFpbElkIjoiamF0aW5kZXIuMzEzMDlAbHB1LmNvLmluIiwiTkFNRSI6IkphdGluZGVyIEt1bWFyIiwiaXNBY3RpdmUiOiJUcnVlIiwiVW5pcXVlaWQiOiJmYzJhYjI4Yi0zYmFiLTRmNmMtOWE3MS0yNTk2OTYwZWM2ZDAiLCJJc1BhcmVudCI6IkZhbHNlIiwiVXNlclR5cGUiOiJOL0EiLCJTcGVjaWFsQmxvY2siOiJOL0EiLCJuYmYiOjE3MDc3MDc4MjksImV4cCI6MTcwNzc5NDIyOSwiaWF0IjoxNzA3NzA3ODI5LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxMjUvIn0.X8u6FgsUq2E2pmIumzLQSGKpbGIXHNETBKgxx8im6HE';
  // private authToken = environment.authToken;

 

  GetAllStudentsCases(): Observable<any> {
     let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
        return this.http.get(
          AUTH_API + 'StudentGrievance/Get',
          // AUTH_API + 'api/Planning/GeteGovDivisionMaster',
         {headers}
        );
  }


  GetAllStudentsCasesRemarks(id: any): Observable<any> {
    
     let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
    
        //httpOptions.headers.set('Authentication', 'Bearer ' + token);
        return this.http.get(
          AUTH_APILOCAL + 'StudentGrievance/GetStudentGrievanceRemarksDetails?Id=' + id,
          // AUTH_API + 'api/Planning/GeteGovDivisionMaster', /GetDisplayemployeeByEmpDepartment?empCode='+empCode,
         {headers}
        );


    // let token = this.storageService.getUser();
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + token)
    //   .set('Accept', '*/*',);
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${token}`
    //   })
    // };
    // return this.http.get<any>(`${AUTH_APILOCAL}StudentGrievance/GetStudentGrievanceRemarksDetails?Id=${id}`, httpOptions);
  }



  // Semester Exchange and Summer school 


  folderUrl = 'http://172.19.2.206/umsweb/webftp/MOUDocuments/';

  // Method to get folder URL
  getFolderUrl(): string {
    return this.folderUrl;
  }

  // getStudentById(RegId: string): Observable<any> {
  //   // Create an HttpHeaders object with the Authorization header
  //   debugger;

  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/GetStudentById?RegId=${RegId}`, httpOptions);
  // }
  // getApplicationDetailsBYId(RegId: string): Observable<any> {
  //   debugger;
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/ApplicationDetailsBYId?RegNo=${RegId ? RegId : ''}`, httpOptions);
  // }
  // getAllApplicationDetails(): Observable<any> {
  //   debugger;
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/GetAllApplicationDetails`, httpOptions);
  // }


  // GetIdWiseDocuments(aplicationId: number, regId: string): Observable<any> {
  //   debugger;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetIdWiseDocuments?ApplicationId=' + aplicationId + '&RegNo=' + regId, httpOptions);
  // }


  // GetPendigLists(aplicationId: number): Observable<any> {
  //   debugger;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetPendingUploadList?ApplicationId=' + aplicationId, httpOptions);
  // }

  // GetStatusCheckListDocuments(aplicationId: number): Observable<any> {
  //   debugger;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetStatusCheckListDocuments?ApplicationId=' + aplicationId, httpOptions);
  // }


  // GetIdWiseUploadedDocumentsStatus(aplicationId: number, regId: string): Observable<any> {
  //   debugger;
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetIdWiseUploadedDocumentsStatus?ApplicationId=' + aplicationId + '&RegNo=' + regId, httpOptions);
  // }




  // GetCheckListDocuments(): Observable<any> {
  //   debugger;
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/GetCheckListDocuments`, httpOptions);
  // }

  // GetAllCheckListDocs(): Observable<any> {
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/GetAllCheckListDocs`, httpOptions);
  // }
  // GetCheckListDocs(ApplicationId: any, RegNo: String): Observable<any> {
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetAllUploadedCheckListDocuments?ApplicationId=' + ApplicationId + '&RegNo=' + RegNo, httpOptions);
  // }
  // // GetIdWiseUploadedDocumentList(ApplicationId: any, DocName: String): Observable<any> {
  // GetIdWiseUploadedDocumentList(ApplicationId: any, DocName: String): Observable<any> {
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(this.baseUrl + 'SemesterExchangeStudent/GetIdWiseUploadedDocumentList?ApplicationId=' + ApplicationId + '&docName=' + DocName, httpOptions);
  // }


  // getUniversityDetails(): Observable<any> {
  //   // Create an HttpHeaders object with the Authorization header
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };

  //   // Make the HTTP GET request with the headers
  //   return this.http.get<any>(`${this.baseUrl}SemesterExchangeStudent/GetAllUniversityDetails`, httpOptions);
  // }

  // addstuEntryforApproval(dataSoft: any): Observable<any> {
  //   // let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   //httpOptions.headers.set('Authentication', 'Bearer ' + token);
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/CreateSemesterExchangeStudentData', dataSoft,
  //     { headers }
  //   );
  // }
  // addUniversity(universityData: University): Observable<any> {
  //   // let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   //httpOptions.headers.set('Authentication', 'Bearer ' + token);
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/CreateUniversityData', universityData,
  //     { headers }
  //   );
  // }

  // addSECheckListDocuments(dataSoft: FormData): Observable<any> {
  //   debugger;
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeCheckListDocumentInsert',
  //     dataSoft,
  //     { headers }
  //   );
  // }


  // UploadInterviewDocuments(dataSoft: FormData): Observable<any> {
  //   debugger;
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeUploadInterviewSchedule',
  //     dataSoft,
  //     { headers }
  //   );
  // }
  // ApproveCheckListDocument(dataSoft: FormData): Observable<any> {
  //   debugger;
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/approveChecklistDocs', dataSoft, { headers });
  // }

  // ChangeStatusCheckListDoc(dataSoft: FormData): Observable<any> {
  //   debugger;
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //   return this.http.post(
  //     AUTH_API + 'api/SemesterExchangeStudent/ChangeStatusCheckListDoc', dataSoft, { headers });
  // }
}
