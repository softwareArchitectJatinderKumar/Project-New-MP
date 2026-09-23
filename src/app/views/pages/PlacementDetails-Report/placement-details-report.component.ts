import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementDetailsService } from 'src/app/_services/placement-details.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import { PlacementService } from 'src/app/_services/placement.service';
import { PlacementDriveCandidatesModalComponent } from './placement-drive-candidates-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlacementDriveDetailsModalComponent } from './placement-drive-details-modal.component';

@Component({
  selector: 'app-placement-details-report',
  templateUrl: './placement-details-report.component.html',
  styleUrls: ['./placement-details-report.component.scss'],
})
export class PlacementDetailsReportComponent implements OnInit {
  loginName: string = '';
  isLoginFailed: boolean = false;
  errorMessage: string = '';

  batchYears: any[] = [];
  streams: any[] = [];
  subStreams: any[] = [];

  selectedBatchYear: string = '0';
  selectedStreamId: number = 0;
  selectedSubStreamId: string = '0';

  placementDetails: any[] = [];
  loadingIndicator: boolean = false;

  ColumnMode = ColumnMode;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private placementDetailsService: PlacementDetailsService,
    private placementService: PlacementService,
     private modalService: NgbModal,
  ) { }
  serverUrl: any;
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML =
      '<span class="themeClr" > Coordinator </span> Document<span class="themeClr" > Search </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width =
      '164px';
    this.loadingIndicator = false;
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    } else {
      this.LoginFailed('Invalid Login Details');
    }
  }

  getToken(id: string): void {
    this.authService.loginTemp(id).subscribe({
      next: (data) => {
        this.isLoginFailed = false;
        this.loadInitialData();
      },
      error: (err) => {
        this.LoginFailed(err);
      },
    });
  }

  LoginFailed(NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('adminPage');
    if (element) {
      element.hidden = true;
    }
  }

  DocumentsData: any;
  filteredMouDocumentsData: any;
  dataSource: any;
  showNoDataFoundMessage: boolean = false;

  loadInitialData(): void {
    this.placementService.getBatchYears().subscribe({
      next: (res) => {
        if (res && res.item1) {
          this.batchYears = res.item1;
        } else if (Array.isArray(res)) {
          this.batchYears = res;
        } else {
          this.batchYears = [];
        }
        this.LoadStreams();
      },
      error: (err) => console.error('BatchYears Error:', err),
    });
  }

  LoadStreams(): void {
    this.placementService.getStreams().subscribe({
      next: (res) => {
        if (res && res.item1) {
          this.streams = res.item1;
        }
      },
      error: (err) => console.error(err),
    });
  }

  onBatchYearChange(event: any) {
    this.selectedBatchYear = event.target.value;
  }


  onStreamChange(event: any) {
    this.selectedSubStreamId = event.target.value;

    this.placementService
      .getSubStreams(this.selectedStreamId.toString(), this.selectedBatchYear)
      .subscribe({
        next: (res) => {
          if (res && res.item1) {
            this.subStreams = res.item1;
          } else if (Array.isArray(res)) {
            this.subStreams = res;
          } else {
            this.subStreams = [];
          }
        },
        error: (err) => console.error('SubStreams Error:', err),
      });
  }
 

  // Called when the Sub Stream dropdown selection changes
  onSubStreamChange(): void {
    // Add any logic needed when sub stream changes
  }

  showDetails(): void {
    if (!this.selectedBatchYear || this.selectedBatchYear === '0') {
      swal.fire('Warning', 'Select Batch Year', 'warning');
      return;
    }

    const subStreamIdsStr = this.selectedSubStreamId;

    this.loadingIndicator = true;
    this.placementService
      .getPlacementData(
        this.selectedBatchYear,
        this.selectedStreamId,
        subStreamIdsStr,
      )
      .subscribe({
        next: (res) => {
          this.loadingIndicator = false;
          if (res && res.item1) {
            this.placementDetails = res.item1;
          } else if (Array.isArray(res)) {
            this.placementDetails = res;
          } else {
            this.placementDetails = [];
          }
        },
        error: (err) => {
          this.loadingIndicator = false;
          console.error(err);
          swal.fire('Error', 'Failed to fetch details.', 'error');
        },
      });
  }

  exportToExcel(): void {
    if (this.placementDetails.length === 0) {
      swal.fire('Warning', 'No records to export!', 'warning');
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.placementDetails);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PlacementDetails');
    XLSX.writeFile(wb, 'PlacementDetails.xlsx');
  }



    openCandidatesModal(driveId: number, type: string): void {
    const modalRef = this.modalService.open(PlacementDriveCandidatesModalComponent, { size: 'xl' });
    modalRef.componentInstance.driveId = driveId;
    modalRef.componentInstance.type = type;
  }


    openDriveDetailsModal(driveId: number): void {
    const modalRef = this.modalService.open(PlacementDriveDetailsModalComponent, { size: 'lg' });
    modalRef.componentInstance.driveId = driveId;
  }
  
}
