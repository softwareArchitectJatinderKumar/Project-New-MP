import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
@Component({
  selector: 'app-detail-drive-messages',
  templateUrl: './detail-drive-messages.component.html',
  styleUrls: ['./detail-drive-messages.component.scss']
})
export class DetailDriveMessagesComponent implements OnInit {
  DriveMessageData: any;
  showNoDataFoundMessage: boolean;

  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.GetPlacementCandidateDriveMessages('11910459', 'A');
  }
  registrationNumber(registrationNumber: any, arg1: string) {
    throw new Error('Method not implemented.');
  }


  GetPlacementCandidateDriveMessages(regNo: any, DriveType: any  ){
    debugger;
    this.placementPortalService.GetPlacementCandidateDriveMessages(regNo, DriveType).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.DriveMessageData = response.item1;          
          console.log("Candidate Drive messages " + JSON.stringify(this.DriveMessageData))
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        
      }
    });
  }

  
  exportToExcel(): void {
    const fileName = 'DriveMessagesDetails.xlsx';
    const exportedData = this.DriveMessageData.map((item: { subject: any; entryDate: any;  }) => ({
      applicationId: item.subject, 
      studentName: item.entryDate, 
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.uploadedDocList);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

}
