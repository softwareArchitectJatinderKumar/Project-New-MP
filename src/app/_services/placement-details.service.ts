import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlacementDetailsService {
  //  const AUTH_API = 'https://localhost:44362/';
  // const AUTH_API_LOCAL = 'https://localhost:44362/';

  private AUTH_API = 'https://projectsapi.lpu.in/';
  private AUTH_API_LOCAL = 'https://projectsapi.lpu.in/'; //'https://localhost:44362/';

  private apiUrl = this.AUTH_API + 'PlacementDetails';
  // Assuming environment.apiUrl is configured, adjust if necessary.

  constructor(private http: HttpClient) {}

  getBatchYears(): Observable<any> {
    // Calling the existing endpoint that uses pGetCurrentBatchYearForDrives
    return this.http.get<any>(
      `${this.apiUrl}/Placement/PlacementBatchYears`,
    );
  }

  getStreams(): Observable<any> {
    // Calling the existing endpoint that uses pPlacementProgramMasterListing with ListType='GetStream'
    return this.http.get<any>(`${this.apiUrl}/Placement/PlacementStream`);
  }

  getSubStreams(streamList: string, batchYear: string): Observable<any> {
    let params = new HttpParams()
      .set('streamList', streamList)
      .set('batchYear', batchYear);
    return this.http.get<any>(`${this.apiUrl}/GetSubStreams`, { params });
  }

  getPlacementDetails(
    batchYear: string,
    streamId: number,
    subStreamId: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('batchYear', batchYear)
      .set('streamId', streamId.toString())
      .set('subStreamId', subStreamId);
    return this.http.get<any>(`${this.apiUrl}/GetPlacementDetails`, { params });
  }
}
