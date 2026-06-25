import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
import { University } from '../views/pages/sm-add-new-university/university.model';
import { UniversityUpdate } from '../views/pages/sm-add-new-university/universityUpdate.model';
import { xmlUniversity } from '../views/pages/sm-add-new-university/xmlUniversity.model';
import { deleteUniversity } from '../views/pages/sm-add-new-university/deleteUniversity.model';

interface IStudentDetails {
    RegisterationNumber: string;
    Name: string;
    CGPA: number;
    FailCount: number; 
}

interface IApiTupleResponse {
    item1: any[]; // ExamDescription, University, Perecentage
    item2: any[]; // Term, coursecode, Delivered, Attended... (Course Attendance)
    item3: any[]; // GradeNum, Grade, RecordCount (Grade Summary)
    item4: IStudentDetails[]; // RegisterationNumber, Name, Section... (Student Details)
}

interface IFormattedApiResponse {
    OverallSummary: any[];
    CourseAttendance: any[];
    GradeSummary: any[];
    StudentDetails: IStudentDetails;
}




//  const AUTH_API = 'https://localhost:7135/'; //'https://projectsapi.lpu.in/';
// const AUTH_API_LOCAL = 'https://localhost:7135/'; //'https://localhost:7125/';
const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';
@Injectable({
  providedIn: 'root'
})
 
export class SemesterExchangeStuDetailsService {

  baseUrl = AUTH_API;
  baseUrlLocal = AUTH_API;
  FileData: string;
  fileName: string;

  constructor(private http: HttpClient, private storageService: StorageService) { }
  private authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiJDSUYiLCJuYmYiOjE3NTM3NzU3ODIsImV4cCI6MTc4NTMxMTc4MiwiaWF0IjoxNzUzNzc1NzgyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxMjUvIn0.9Oc0vzoLFrYmMpzfN5z9cDy-ysE3PgyxY8o4XC8ZRuI';
  // private authToken = environment.authToken;//'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiIzMTMwOSIsIkRlcGFydG1lbnROYW1lIjoiTi9BIiwiUm9sbElkIjoiNTAiLCJlbWFpbElkIjoiamF0aW5kZXIuMzEzMDlAbHB1LmNvLmluIiwiTkFNRSI6IkphdGluZGVyIEt1bWFyIiwiaXNBY3RpdmUiOiJUcnVlIiwiVW5pcXVlaWQiOiJmYzJhYjI4Yi0zYmFiLTRmNmMtOWE3MS0yNTk2OTYwZWM2ZDAiLCJJc1BhcmVudCI6IkZhbHNlIiwiVXNlclR5cGUiOiJOL0EiLCJTcGVjaWFsQmxvY2siOiJOL0EiLCJuYmYiOjE3MDc3MDc4MjksImV4cCI6MTcwNzc5NDIyOSwiaWF0IjoxNzA3NzA3ODI5LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxMjUvIn0.X8u6FgsUq2E2pmIumzLQSGKpbGIXHNETBKgxx8im6HE';
  // private authToken = this.storageService.getUser();
  // private Localtoken = environment.authToken;
  // private authToken=sessionStorage.getItem('USER_KEY');
  folderUrl = 'https://files.lpu.in/umsweb/webftp/DIA/SemesterExchangedocuments/';

  // private LocalauthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiIyNTg5OSIsIkRlcGFydG1lbnROYW1lIjoiTi9BIiwiUm9sbElkIjoiNTAiLCJlbWFpbElkIjoiamF0aW4uMjU4OTlAbHB1LmNvLmluIiwiTkFNRSI6IkphdGluIFNhcnBhbCIsImlzQWN0aXZlIjoiVHJ1ZSIsIlVuaXF1ZWlkIjoiYmRmYWU4MWQtMDUxNy00M2ZjLWFjMzctZjM0ZDExODRmZjY3IiwiSXNQYXJlbnQiOiJGYWxzZSIsIlVzZXJUeXBlIjoiTi9BIiwiU3BlY2lhbEJsb2NrIjoiTi9BIiwibmJmIjoxNzIxODgxODU1LCJleHAiOjE3NTM0MTc4NTUsImlhdCI6MTcyMTg4MTg1NSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNS8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyJ9.K8Pswv0q8MtTJ_QHOyX2TSksR6x888AdYVCqd5f1tTI';
  getFolderUrl(): string {
    return this.folderUrl;
  }


  getStudentById(): Observable<any> {
    // alert(0);
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`
      })
    };

    return this.http.get<any>(`${AUTH_API_LOCAL}api/SemesterExchangeStudent/GetStudentById`, httpOptions);
  }
  // getApplicationDetailsBYId(RegId: string): Observable<any> {
  //   var authToken = this.storageService.getUser();
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       // 'Authorization': `Bearer ${authToken}`
  //       'Authorization': `Bearer ${authToken}`
  //     })
  //   };

  //   return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/ApplicationDetailsBYId?RegNo=${RegId ? RegId : ''}`, httpOptions);
  // }
  getAllApplicationDetails(): Observable<any> {
    
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/SemesterExchangeStudent/GetAllApplicationDetails',
      { headers }
    );
  }


  GetIdWiseDocuments(aplicationId: number, regId: string): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/SemesterExchangeStudent/GetIdWiseDocuments?ApplicationId=' + aplicationId + '&RegNo=' + regId,
      { headers }
    );

    // var authToken = this.storageService.getUser();
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${authToken}`
    //   })
    // };
    // return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetIdWiseDocuments?ApplicationId=' + aplicationId + '&RegNo=' + regId, httpOptions);
  }


  GetPendigLists(aplicationId: number): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetPendingUploadList?ApplicationId=' + aplicationId, httpOptions);
  }

  GetStatusCheckListDocuments(aplicationId: number): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetStatusCheckListDocuments?ApplicationId=' + aplicationId, httpOptions);
  }


  GetIdWiseUploadedDocumentsStatus(aplicationId: number, regId: string): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetIdWiseUploadedDocumentsStatus?ApplicationId=' + aplicationId + '&RegNo=' + regId, httpOptions);
  }




  GetCheckListDocuments(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };

    // Make the HTTP GET request with the headers
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetCheckListDocuments`, httpOptions);
  }

  GetAllCheckListDocs(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };

    // Make the HTTP GET request with the headers
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetAllCheckListDocs`, httpOptions);
  }
  GetCheckListDocs(ApplicationId: any, RegNo: String): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    // Make the HTTP GET request with the headers
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetAllUploadedCheckListDocuments?ApplicationId=' + ApplicationId + '&RegNo=' + RegNo, httpOptions);
  }
  GetIdWiseUploadedDocumentList(ApplicationId: any, DocName: String): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetIdWiseUploadedDocumentList?ApplicationId=' + ApplicationId + '&docName=' + DocName, httpOptions);
  }


  getUniversityDetails(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetAllUniversityDetails`, httpOptions);
  }

  addstuEntryforApproval(dataSoft: any): Observable<any> {
    // let token = this.storageService.getUser();
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/CreateSemesterExchangeStudentData', dataSoft,
      { headers }
    );
  }
  addUniversity(universityData: University): Observable<any> {
    // let token = this.storageService.getUser();
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/CreateUniversityData', universityData,
      { headers }
    );
  }

  addSECheckListDocuments(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeCheckListDocumentInsert',
      dataSoft,
      { headers }
    );
  }


  UploadInterviewDocuments(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeUploadInterviewSchedule',
      dataSoft,
      { headers }
    );
  }

  UploadCourseMapping(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeUploadCourseMapping',
      dataSoft,
      { headers }
    );
  }


  ApproveCheckListDocument(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/approveChecklistDocs', dataSoft, { headers });
  }

  ChangeStatusCheckListDoc(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/ChangeStatusCheckListDoc', dataSoft, { headers });
  }


  // Upload Excel sheet Record data into University Database 
  createUniversityUsingExcelSheet(xmlUniversity: xmlUniversity): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      //  .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/UploadExceldata', xmlUniversity,
      { headers }
    );
  }

  // Delete Record from Database  university 
  deleteUniversityRecord(deleteUniversity: deleteUniversity): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');

    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/DeleteUniversityRecord', deleteUniversity,
      { headers }
    );
  }
  // UpdateUniversityData
  updateUniversity(universityData: UniversityUpdate): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/UpdateUniversityData', universityData,
      { headers }
    );
  }

  //  created on 20-jan-25

  UploadInterviewDocumenTwo(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeUploadInterviewSchedule2',
      dataSoft,
      { headers }
    );
  }
  // NEW WAY OF SEMESTER EXHANGE 
  getStudentDetailsWithMarks(regdno: any): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.get(
      AUTH_API + 'api/SemesterExchangeStudent/GetStudentResultWithGrades?regdno=' + regdno,
      { headers }
    );
  }


  getApplicationDetailsBYId(RegId: string): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    //GetStudentApplicationDetails?RegistrationNo=12211079
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetStudentApplicationDetails?RegistrationNo=${RegId}`, httpOptions);
  }

// New Semester Exchange System  

//1 Registration Form 

  SemesterExchangeNewRegistrationForm(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/SemesterExchangeNewRegistration', dataSoft, { headers });
  }

  //2 a Student Dashboard Get data 
  getStudentDetailsBYId(RegId: string): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    //GetStudentApplicationDetails?RegistrationNo=12211079
    return this.http.get<any>(`${AUTH_API_LOCAL}api/SemesterExchangeStudent/GetStudentDetailsById?RegistrationNo=${RegId}`, httpOptions);
    // return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetStudentDetailsById?RegistrationNo=${RegId}`, httpOptions);
  }


  //2 Student Dashboard Update UI 
  updateApplicationDetails(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/UpdateSemesterExchangeStudentDetails', dataSoft, { headers });
  }


  getAllApplications(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`
        // 'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/AllSemesterExchangeApplication`, httpOptions);
    // return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetSemesterExchangeStudentDetails`, httpOptions);
  }


    getAllApplicationsforHOD(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`
        // 'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${AUTH_API_LOCAL}api/SemesterExchangeStudent/GetSemesterExchangeApplicationForHOD?UserId=${'0'}`, httpOptions);
    // return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetSemesterExchangeStudentDetails`, httpOptions);
  }
  SendApproveRequest(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/ApproveStudent', dataSoft, { headers });
  }
  StudentEvalutionAddNew(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/InsertRecordSEInterviewEvaluation', dataSoft, { headers });
  }

// added on 26-june-25
  SendForwardRequest(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/ForwardStudenttoHOD', dataSoft, { headers });
  }
// added on 8-july-25
GetStuDetailsWithImage(RegId: string): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    //GetStudentApplicationDetails?RegistrationNo=12211079
    return this.http.get<any>(`${AUTH_API_LOCAL}api/SemesterExchangeStudent/GetStudentDetailsWithImage?RegNo=${RegId}`, httpOptions);
    // return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetStudentDetailsById?RegistrationNo=${RegId}`, httpOptions);
  }

  // added on 25-7-25

  getUniversityLists(ProgramCode: any): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetUniversityListforProgramCode?ProgramCode=${ProgramCode}`, httpOptions);
  }

  // added on 25-july-25
  FetchAllProgramCodesList(): Observable<any>{
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetAllProgramCodesList`, httpOptions);
  }
// added on 9-Aug-25

  UpdateDocuments(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/UpdateSemesterExchangeDocuments', dataSoft, { headers });
  }

  UpdateCounsellingRemarks(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/SemesterExchangeStudent/UpdateCounsellingRemarks', dataSoft, { headers });
  }

  getEvaluationRemarks(RegId:any): Observable<any>{
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetInterviewEvaluationRemarks?RegNo=${RegId}`, httpOptions);
  }

  getAllRemarks(): Observable<any>{
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetSemesterExchangeAllUserRemarks`, httpOptions);
  }

  // added on 8-sep-25
  getUniversities(): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${token}`
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(`${this.baseUrl}api/SemesterExchangeStudent/GetUniversityLists`, httpOptions);
  }


// Added on 10-oct-25
    GetStudentAllPreviousMarks(regdno: any): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.get(
      AUTH_API_LOCAL + 'api/SemesterExchangeStudent/GetStudentPreviousMarksDetails?RegistrationNo=' + regdno,
      { headers }
    );
  }


    GetStage2DocumentDetails(aplicationId: number): Observable<any> {
    var authToken = this.storageService.getUser();
    const httpOptions = {
      headers: new HttpHeaders({
        // 'Authorization': `Bearer ${authToken}`
        'Authorization': `Bearer ${authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'api/SemesterExchangeStudent/GetStage2DocumentDetails?ApplicationId=' + aplicationId , httpOptions);
  }


    // getStudentMarks(regNo: string): Observable<IFormattedApiResponse> {
    //     return this.http.get<IApiTupleResponse>(`${AUTH_API_LOCAL}/GetStudentPreviousMarksDetails?RegistrationNo=${regNo}`).pipe(
    //         map(response => {
                
    //             // Ensure all items are present and map them to meaningful names:
    //             if (!response.item1 || !response.item2 || !response.item3 || !response.item4) {
    //                 throw new Error("API response is missing one or more required datasets (item1-item4).");
    //             }

    //             return {
    //                 // Item1: OverallSummary (First dataset listed in the procedure)
    //                 OverallSummary: response.item1,

    //                 // Item2: CourseAttendance (Second dataset)
    //                 CourseAttendance: response.item2,

    //                 // Item3: GradeSummary (Third dataset)
    //                 GradeSummary: response.item3,

    //                 // Item4: StudentDetails (Fourth dataset - Assuming a single record)
    //                 StudentDetails: response.item4[0],
    //             } as IFormattedApiResponse;
    //         })
    //     );
    // }

}
