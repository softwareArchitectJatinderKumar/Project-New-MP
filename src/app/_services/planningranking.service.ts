import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://localhost:7125/';

@Injectable({
  providedIn: 'root'
})
export class PlanningrankingService {

  constructor(private http: HttpClient,private storageService: StorageService) {}


  getwinglist(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/GetWingListPlanningRanking',
     {headers}
    );
  }

  getplannerScoreRankingCalculation(data:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    
    return this.http.post(
      AUTH_API + 'api/Planning/GetPlannerScoreRankingCalculation',data,
     {headers}
    );
  }

    GetHeadMappings(): Observable<any> {
      let token = this.storageService.getUser();
      let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json'); 
  
      //httpOptions.headers.set('Authentication', 'Bearer ' + token);
      return this.http.get(
        AUTH_API_LOCAL + 'api/Planning/GetHeadMappingWithAssistant',
       {headers}
      );
    }

    InsertHeadMapping(data: FormData): Observable<any> {
       let token = this.storageService.getUser();
          let headers = new HttpHeaders()
            // .set('Authorization', 'Bearer ' + authToken)
            .set('Authorization', 'Bearer ' + token)
          return this.http.post(
             AUTH_API_LOCAL + 'api/Planning/InsertHeadMapping',
            data,
            { headers }
          ); 
    }
    updateRecord(data: FormData): Observable<any> {
       let token = this.storageService.getUser();
          let headers = new HttpHeaders()
            // .set('Authorization', 'Bearer ' + authToken)
            .set('Authorization', 'Bearer ' + token)
          return this.http.post(
             AUTH_API_LOCAL + 'api/Planning/UpdateHeadMapping',
            data,
            { headers }
          ); 
    }
  
}
