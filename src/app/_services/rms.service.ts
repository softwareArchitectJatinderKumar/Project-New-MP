import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

@Injectable({
  providedIn: 'root',
})
export class RMSService {
  constructor(private http: HttpClient,private storageService: StorageService) {}

  getdashboardData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      // AUTH_API + 'api/RMS/Get',
      AUTH_API_LOCAL + 'api/RMS/Get',
     {headers}
    );
  }

  getInvolvementData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      // AUTH_API + 'api/RMS/GetInvolvementData',
      AUTH_API_LOCAL  + 'api/RMS/GetInvolvementData',
     {headers}
    );
  }

  getParentRMSByDealingOfficial(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMSTouch/GetParentRMSByDealingOfficial',
     {headers}
    );
  }

  getParentRMSChatByMessageId(messageId:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMSTouch/GetParentRMSChatByMessageId?messageId='+messageId+'',
     {headers}
     
    );
  }


  getPendancyHeadWise(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetPendancyHeadWise',
     {headers}
     
    );
  }


  
  getMtsRMSCategories(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSCategories',
     {headers}
     
    );
  }

  getMtsRMSMessageType(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSMessageType',
     {headers}
     
    );
  }


  getBlockData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token); // DEveloper Name Jatinder31309
    return this.http.get(
      AUTH_API + 'api/RMS/GetBlocks',
     {headers}
     
    );
  }


  getStundentHostel(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetStudentHostelDetails',
     {headers}
     
    );
  }

  getOtherRooms(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetOtherRoomDetails',
     {headers}
     
    );
  }


  getStudentStaffList(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/RMS/GetStudentStaffList',
     {headers}
     
    );
  }

  checkDuplicateRMS(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/RMS/CheckDuplicateRMS',dataSoft,
     {headers}
    );
  }
    

  getRMSTelephonicDSRDateWise(startdate:any,EndDate:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSDSRDateWise?startdate='+startdate+'&enddate='+EndDate+'',
     {headers}
    );
  }


  getStudentRMSMasterCategory(): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/StudentRMSMasterCategory',
     {headers}
    );
  }

// Developer Name Jatinder31309
  getStudentRMSCategory(catName:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/StudentRMSCategory?categoryName='+catName,
     {headers}
    );
  }


  getStudentRMSSubCategory(catid:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/StudentRMSSubCategory?categoryId='+catid,
     {headers}
    );
  }


  getStudentRMSScanner(masterId:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/RMSScannerStudent?masterId='+masterId,
     {headers}
    );
  }

  addQRScanner(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/RMS/AddedQrScannerData',dataSoft,
     {headers}
    );
  }


  addQRStudentsScanner(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/RMS/AddStudentRMSScannerData',dataSoft,
     {headers}
    );
  }


  getQRScanner(): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/StudentRMSScannerData',
     {headers}
    );
  }

 updateQRScanner(id:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/UpdateScannerStatus?id='+id,
     {headers}
    );
  }

  // getModeratorBoard(): Observable<any> {
  //   return this.http.get(API_URL + 'mod', { responseType: 'text' });
  // }
  
  GetUIDWiseRMSDealingOfficialReport(startdate:any,EndDate:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
       AUTH_API + 'api/RMS/GetRMSDealingOfficialReport?startdate='+startdate+'&enddate='+EndDate+'',
      // AUTH_API_LOCAL + 'api/RMS/GetRMSDealingOfficialReport?startdate='+startdate+'&enddate='+EndDate,
     {headers}
    );
  }
  GetUIDWiseRMSDSRRatingReport(startdate:any,EndDate:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSDealingOfficialReport?startdate='+startdate+'&enddate='+EndDate+'',
      // AUTH_API_LOCAL + 'api/RMS/GetRMSDSRRatingDetails?startdate='+startdate+'&enddate='+EndDate,
     {headers}
    );
  }
  GetRMSDSRRatingDataDetails(startdate:any,EndDate:any, Remarks: any, LoginName: any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSDSRRatingDataDetails?startdate='+startdate+'&enddate='+EndDate+'&LoginName='+LoginName+'&Remarks='+Remarks,
      // AUTH_API_LOCAL + 'api/RMS/GetRMSDSRRatingDataDetails?startdate='+startdate+'&enddate='+EndDate+'&LoginName='+LoginName+'&Remarks='+Remarks,
     {headers}
    );
  }
  GetDistanceRMSODLOLDetails(startdate:any,EndDate:any): Observable<any> 
  {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/RMS/GetDistanceRMSODLOLData?startdate='+startdate+'&enddate='+EndDate,
      // AUTH_API_LOCAL + 'api/RMS/GetDistanceRMSODLOLData?startdate='+startdate+'&enddate='+EndDate,
       
     {headers}
    );
  }
}



