import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
import { CotnactDetails, FamilyFriendsDetails } from '../views/pages/PlacementPortal/details-updation/Details.model';
const AUTH_API = 'https://projectsapi.lpu.in/';
// const AUTH_API_LOCAL = 'https://localhost:7125/';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class PlacementPortalService {
  baseUrl = AUTH_API;// environment.apiUrl;
  FileData: string;
  fileName: string;

  constructor(private http: HttpClient, private storageService: StorageService) { }
  // private authToken = environment.authToken;

  private authToken = this.storageService.getUser();
  GetSchoolDivisions(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'Planning/GetSchoolDivisions', httpOptions);
  }

  GetSchoolDivisionsDepartment(Id: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'Planning/GetSchoolDivisionsDepartment?Id=' + Id, httpOptions);
  }

  //GetObpDailyFilledProgrees?UID=16262&DCode=D-DIT-DSDV

  GetObpDailyFilledProgrees(UId: any, DeptCode: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, httpOptions);
  }

  GetPlacementCandidateProfile(RegNo: String): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    // Make the HTTP GET request with the headers PlacementPortal/GetPlacementCandidateProfile?regNo=10800001
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCandidateProfile?regNo=' + RegNo, httpOptions);
  }


  GetPlacementNonRegisteredDetails(dateData: any, LoginId: any, BatchYear: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    // Make the HTTP GET request with the headers PlacementPortal/GetPlacementCandidateProfile?regNo=10800001 GetPlacementCandidateDetails?date=2024-01-01&LoginName=17377&BatchYear=2024
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCandidateDetails?date=' + dateData + '&LoginName=' + LoginId + '&BatchYear=' + BatchYear, httpOptions);
  }


  GetPlacementCandidateDriveMessages(LoginId: any, Type: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCandidateDriveMessages?LoginName=' + LoginId + '&DriveType=' + Type, httpOptions);
  }

  //PlacementPortal/GetPlacementAnnouncements?RegId=11910490
  GetPlacementAnnouncements(TypeId: string, UTypeId: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementAnnouncements?TypeId=' + TypeId + '&UTypeId=' + UTypeId, httpOptions);
  }

  // for Upcomming Placement Drives  
  GetUpcomingDriveDetails(RegNo: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetUpcomingDriveDetails?Regid=' + RegNo, httpOptions);
  }

  // for TPC Placement Details
  GetTPCDetails(TypeId: string, RegId: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetTPCDetails?TypeId=' + TypeId + '&RegId=' + RegId, httpOptions);
  }


  // Selected Student Details from Database 
  GetSelectedStudentsDetails(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetSelectedStudentsDetails', httpOptions);
  }

  // Selected Student Details from Database 
  GetPlacementRecentVisitedCompanies(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementRecentVisitedCompanies', httpOptions);
  }


  // for Upcomming Placement Conduct 
  GetMyPlacementRecords(RegNo: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetMyPlacementRecords?Regid=' + RegNo, httpOptions);
  }

  // for Upcomming Placement Conduct 
  GetUpcomingDriveConductDetails(RegNo: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetUpcomingDriveConductDetails?Regid=' + RegNo, httpOptions);
  }


  // for Company Drive Details 
  GetPlacementCompanyDriveDetails(DriveId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCompanyDriveDetails?DriveId=' + DriveId, httpOptions);
  }
  GetPlacementCanidateContactDetails(Pid: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCanidateContactDetails?Pid=' + Pid, httpOptions);
  }

  UpdateStudentDetails(StudentDetails: CotnactDetails): Observable<any> {
    // let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      this.baseUrl + 'PlacementPortal/UpdatePlacementCandidateContactDetails', StudentDetails,
      { headers }
    );
  }


  GetPlacementCandidateDutyLeave(RegNo: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCandidateDutyLeave?Regid=' + RegNo, httpOptions);
  }


  // GetPlacementCandidateFamilyFriendsDetails?PId=455274
  GetFamilyFriendsDetails(Pid: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementCandidateFamilyFriendsDetails?PId=' + Pid, httpOptions);
  }


  UpdateCandidateFamilyFriendsDetails(StudentFamilyDetails: FamilyFriendsDetails): Observable<any> {
    // let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      this.baseUrl + 'PlacementPortal/UpdateCandidateFamilyFriendsDetails', StudentFamilyDetails,
      { headers }
    );
  }


  GetPlacementJobOfferDetails(RegNo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetPlacementJobOfferDetails?Regid=' + RegNo, httpOptions);
  }


  //UpdatePlacementJobOfferAcceptance?regId=11910459&DriveId=30517
  // UpdatePlacementJobOffer(RegId: any, DriveId: number) {
  UpdatePlacementJobOffer(dataSoft: FormData) {
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
    // return this.http.post(
    //   this.baseUrl + 'PlacementPortal/UpdatePlacementJobOfferAcceptance?regId=' + RegId + '&DriveId=' + DriveId,
    //   { headers }
    // );
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.authToken)
    return this.http.post(
      this.baseUrl + 'PlacementPortal/UpdatePlacementJobOfferAcceptance', dataSoft, { headers });
  }

  // mark attendance for drives
  GetDriveDetails(RegId: any, TypeId: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    // GetDriveDetails?RegId=11910459&TypeId=S
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetDriveDetails?RegId=' + RegId + '&TypeId=' + TypeId, httpOptions);
  }
  GetRoundDetails(DriveId: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    };
    // GetDriveDetails?RegId=11910459&TypeId=S  GetRoundDetails?DriveId=348295' 
    return this.http.get<any>(this.baseUrl + 'PlacementPortal/GetRoundDetails?DriveId=' + DriveId , httpOptions);
  }









}
