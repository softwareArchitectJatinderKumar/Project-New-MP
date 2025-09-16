import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
import { SchoolDetails, UpdateSchoolData } from '../views/pages/summer-school-web/SummerSchool.model';

const AUTH_API = 'https://projectsapi.lpu.in/';


@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class SummerSchoolWebService {
  FileData: string;
  fileName: string;

  constructor(private http: HttpClient,private storageService: StorageService) { }
     GetAllSchoolData(): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json'); 
      return this.http.get(
        AUTH_API + 'api/SummerSchool/GetAllSummerSchoolData',
       {headers}
      );
    }

  addsummerSchool(dataSoft:FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/SummerSchool/SummerSchoolIncommingInsert',
      dataSoft,
     { headers }
    );
  }
  

    ApproveCheckListDocument(dataSoft: FormData): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      return this.http.post(
        AUTH_API + 'api/SemesterExchangeStudent/approveChecklistDocs', 
        dataSoft,
        { headers });
    }

    ApproveSummerSchool(dataSoft: FormData): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      return this.http.post(
        AUTH_API + 'api/SummerSchool/SummerSchoolApprove', 
        dataSoft, 
        { headers });
    }


    UpdateSchoolDetails(SchoolData: UpdateSchoolData): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json');
      return this.http.post(
        AUTH_API + 'api/SemesterExchangeStudent/UpdateSchoolDetails', SchoolData,
        { headers }
      );
    }
}
