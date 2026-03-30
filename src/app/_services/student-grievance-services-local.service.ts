
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

const AUTH_API = 'https://projectsapi.lpu.in/api/';
const AUTH_APILOCAL = 'https://projectsapi.lpu.in/api/';


@Injectable({
  providedIn: 'root'
})
 
export class StudentGrievanceServicesLocalService {
  baseUrl = 'https://projectsapi.lpu.in/';
  FileData: string;
  fileName: string;
  constructor(private http: HttpClient, private storageService: StorageService) { }
 

  GetAllStudentsCases(): Observable<any> {
     let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
        return this.http.get(
          AUTH_API + 'StudentGrievance/Get',
         {headers}
        );
  }


  GetAllStudentsCasesRemarks(id: any): Observable<any> {
    
     let token = this.storageService.getUser();
        let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json'); 
        return this.http.get(
          AUTH_APILOCAL + 'StudentGrievance/GetStudentGrievanceRemarksDetails?Id=' + id,
         {headers}
        );


     
  }



  folderUrl = 'http://files.lpu.in/umsweb/webftp/MOUDocuments/';

  getFolderUrl(): string {
    return this.folderUrl;
  }
}