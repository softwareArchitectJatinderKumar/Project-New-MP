import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/_services/storage.service';

// const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API = 'https://localhost:44362/';
// const AUTH_API_LOCAL = 'https://localhost:44362/';

@Injectable({
  providedIn: 'root'
})
export class DressMaterialService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  /**
   * Generic method to call the DressMaterailOperations API.
   * Builds FormData from the provided payload object.
   */
  private callDressMaterialApi(payload: Record<string, any>): Observable<any> {
    const token = this.storageService.getUser();
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key].toString());
      }
    });

    return this.http.post(
      AUTH_API + 'api/EventManagement/DressMaterailOperations',
      formData,
      { headers }
    );
  }

  /**
   * Issue / Add a new dress material request.
   */
  issueMaterial(material: string, quantity: number, requestPerson: string): Observable<any> {
    return this.callDressMaterialApi({
      Action: 'Add',
      Material: material,
      Quantity: quantity,
      RequestPerson: requestPerson
    });
  }

  /**
   * Get all dress material records.
   */
  getAllMaterials(): Observable<any> {
    return this.callDressMaterialApi({
      Action: 'Select'
    });
  }

  /**
   * Get dress material records created by logged-in user (not returned).
   */
  getMyMaterials(): Observable<any> {
    return this.callDressMaterialApi({
      Action: 'View'
    });
  }


  getMyMaterialsForApprovals(role: string): Observable<any> {
    return this.callDressMaterialApi({
      Action: 'Select',
      UserType: role
    });
  }
  /**
   * Return a dress material by MaterialId.
   */
  returnMaterial(materialId: number): Observable<any> {
    return this.callDressMaterialApi({
      Action: 'Return',
      MaterialId: materialId
    });
  }

    ApprovalAction(materialId: number, Remarks: string, Action: string): Observable<any> {
    return this.callDressMaterialApi({
      Action: Action,
      MaterialId: materialId,
      ApprovalRemarks: Remarks,
      UserType:'Admin'
    });
  }



  
}
