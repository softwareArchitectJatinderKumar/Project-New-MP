import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
import { xmlEvents } from '../views/pages/content/xmlEvents.model';
const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';

// const AUTH_API = 'https://localhost:7135/';
// const AUTH_API_LOCAL = 'https://localhost:7135/';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class LpuEventManagementService {
  FileData: string;
  fileName: string;

  constructor(private http: HttpClient, private storageService: StorageService) { }
  //private token = environment.authToken;

  EventManagementNewEvent(dataSoft: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/EventManagement/EventManagementNewEvent',
      dataSoft,
      { headers }
    );
  }

  GetAllEventsDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      //  'https://localhost:7125/api/EventManagement/GetAllEventsDetails', 
      AUTH_API + 'api/EventManagement/GetAllEventsDetails', 
     {headers}
    );
  }


  ChangeStatus(dataSoft: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    // .set('Authorization', 'Bearer ' + this.token)
    return this.http.post(
      AUTH_API + 'api/EventManagement/ApprovalAction', 
      dataSoft, 
      { headers });
      // // Create an HttpHeaders object with the Authorization header
      // debugger;
      // let headers = new HttpHeaders()
      //   .set('Authorization', 'Bearer ' + this.authToken)
  }

  GetAllEventsData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/EventManagement/GetAllEvents', 
     {headers}
    );
  }

  GetCurrentPlannerSession(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API + 'api/EventManagement/GetCurrentPlannerSession', 
     {headers}
    );
  }
  GetOBPProperties(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API+ 'api/EventManagement/GetEventOBPProperties', 
     {headers}
    );
  }


  // Added on 21- july-25
  UpdateEventDetailsforGivenId(dataSoft: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/EventManagement/UpdateEventDetails',
      //  'https://localhost:7125/api/EventManagement/UpdateEventDetails',
      dataSoft,
      { headers }
    );
  }
// Added on 22-July-25
  // Upload Excel sheet Record data into University Database 
  CreateEventsUsingExcelSheet(xmlEvents: xmlEvents): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      //  .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API +   'api/EventManagement/AddEventsUsingExcelSheet', xmlEvents,
      { headers }
    );
  }

  // added on 31-July-26

    EventCategoryProperties(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API_LOCAL+ 'api/EventManagement/GetEventCategoryProperties', 
     {headers}
    );
  }
    EventModeProperties(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 
    return this.http.get(
      AUTH_API_LOCAL+ 'api/EventManagement/GetEventModeProperties', 
     {headers}
    );
  }
}
