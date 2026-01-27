import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/_services/storage.service';
import { environment } from 'src/environments/environment';

const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/api/';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class LpuPlannerServicesService {
 // baseUrl = environment.apiUrl;
  FileData: string;
  fileName: string;

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

  

  GetObpDailyFilledProgrees(UId: any, DeptCode: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, 
     {headers}
    );
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Authorization': `Bearer ${this.authToken}`
    //   })
    // };
    // return this.http.get<any>(AUTH_API + 'Planning/GetObpDailyFilledProgrees?UID=' + UId + '&DCode=' + DeptCode, httpOptions);
  }



  
  GetCirteriaList(Id: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/Planning/GetCirteriaList?DivisionId=' + Id,
     {headers}
    );   
  }

}
