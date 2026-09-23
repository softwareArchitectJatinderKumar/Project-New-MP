import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlacementService } from 'src/app/_services/placement.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-placement-drive-details-modal',
  templateUrl: './placement-drive-details-modal.component.html',
  styleUrls: ['./placement-drive-details-modal.component.scss']
})
export class PlacementDriveDetailsModalComponent implements OnInit {
  @Input() driveId!: any;

  driveDetails: any = null;
  loadingIndicator: boolean = false;
  isStudent: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private placementService: PlacementService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    
    if (user && user.RegistrationNumber) {
      this.isStudent = false;
    } else {
      this.isStudent = true; // Staff
    }

    this.loadData();
  }

  loadData(): void {
    this.loadingIndicator = true;
    this.placementService.GetPlacementDrivesDetails(this.driveId).subscribe({
      next: (rawRes: any) => {
        this.loadingIndicator = false;
        
        // Helper to deeply convert keys to PascalCase
        const normalizeKeys = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(item => normalizeKeys(item));
          } else if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            for (const key of Object.keys(obj)) {
              const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
              newObj[pascalKey] = normalizeKeys(obj[key]);
            }
            return newObj;
          }
          return obj;
        };

        const res = normalizeKeys(rawRes);
        const allValues = Object.values(res);

        const findRounds = () => {
          for (const val of allValues) {
            const item: any = Array.isArray(val) ? val : [val];
            if (item.length > 0 && item[0] && (item[0].ExpectedStartTime !== undefined || item[0].IsElimination !== undefined || item[0].RoundDescription !== undefined || item[0].IsNotifyLater !== undefined)) {
              // Ensure we don't accidentally pick the single MainDetails object
              if (item[0].CompanyName === undefined && item[0].StreamName === undefined) {
                return item;
              }
            }
          }
          return [];
        };
        
        const findAttachment = () => {
          for (const val of allValues) {
            const item: any = Array.isArray(val) ? val : [val];
            if (item.length > 0 && item[0] && item[0].FileName !== undefined && item[0].CompanyName === undefined) return item[0];
          }
          return null;
        };

        const item1 = res?.Item1 || res?.Table || (res?.MainDetails ? [res.MainDetails] : null);
        const item2 = res?.Item2 || res?.Table1 || res?.JobDetails;

        if (item1 || res?.MainDetails) {
          const mainDetails = item1 ? (Array.isArray(item1) ? item1[0] : item1) : res.MainDetails;
          
          this.driveDetails = {
            MainDetails: mainDetails,
            JobDetails: item2 ? (Array.isArray(item2) ? item2 : [item2]) : [],
            Rounds: findRounds(),
            Attachment: findAttachment()
          };
        } else {
          console.warn('API structure not recognized, falling back to res:', res);
          this.driveDetails = res;
        }
      },
      error: (err: any) => {
        this.loadingIndicator = false;
        console.error('Failed to load drive details:', err);
      }
    });
  }

  downloadJD(): void {
    // Currently relying on browser print since the HTML to PDF conversion happens via DriveDetails.aspx
    // For a native API implementation, you would call a new API endpoint here that returns a PDF Blob.
    window.print();
  }
}

