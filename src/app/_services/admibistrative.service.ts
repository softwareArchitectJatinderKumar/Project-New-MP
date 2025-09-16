import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { catchError } from 'rxjs/operators';
const AUTH_API = 'https://projectsapi.lpu.in/';

@Injectable({
  providedIn: 'root'
})
export class AdmibistrativeService {

  constructor(private http: HttpClient,private storageService: StorageService) { }
 


  getRMSCategory(startdate: string, endDate: string, maintenance: string, Rmstype:string, status: string): Observable<any> {
    const token = this.storageService.getUser();
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  
    return this.http.get(
      AUTH_API + 'api/RMS/GetRMSCategoryData',
      { 
        headers,
        params: {
          startdate:startdate,
          enddate: endDate,
          CategoryType:Rmstype,
          Maintainance:maintenance == "0"?false:true,
          Status:status
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error); // Rethrow the error or handle it as needed
      })
    );
  }



  getIQACData(startdate:any,EndDate:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/IQAC/GetIQACRecord?startdate='+startdate+'&enddate='+EndDate+'',
     {headers}
    );
  }


  getBlockmaster(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/IQAC/GetBlockMaster',
     {headers}
    );
  }

}
