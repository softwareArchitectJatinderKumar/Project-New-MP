import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
//const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API = 'https://projectsapi.lpu.in/'
@Injectable({
  providedIn: 'root'
})
export class CareerService {
  // LocalToken : any = environment.apiToken;
  constructor(private http: HttpClient, private storageService: StorageService) {
    //let LocalToken = environment.apiToken;
   }


  GetStudentRecord(RegistrationNumber: string): Observable<any> {
    debugger;
    let token = this.storageService.getUser();
    debugger;
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/PlacementProgramMasterListing?RegistrationNumber=' + RegistrationNumber,
      { headers }
    );
  }

  FillProgram(BatchYear: string): Observable<any> {

    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Placement/PlacementProgramMasterCategory?BatchYear=' + BatchYear,
      { headers }
    );

  }

GetCourse(ProgramName : string, BatchYear : string, RegistrationNumber : string): Observable<any> {

    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Placement/PlacementProgramByCategory?BatchYear='+ ProgramName + '&StreamId='+BatchYear+'&LoginName='+ RegistrationNumber,
      { headers }
    );
    
  }
  GetYear(RegistrationNumber : string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // api/Placement/PlacementProgramMasterBatchYear?BatchYear=12115430
      AUTH_API + 'api/Placement/PlacementProgramMasterBatchYear?BatchYear='+ RegistrationNumber,
      { headers }
    );   
  }
  
  GetHigherStudy(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // api/Placement/PlacementProgramMasterBatchYear?BatchYear=12115430
      AUTH_API + 'api/Placement/PlacementStudyType',
      { headers }
    );   
  }

}
