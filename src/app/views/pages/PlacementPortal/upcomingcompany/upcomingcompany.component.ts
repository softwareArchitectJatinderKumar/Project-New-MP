import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
@Component({
  selector: 'app-upcomingcompany',
  templateUrl: './upcomingcompany.component.html',
  styleUrls: ['./upcomingcompany.component.css']
})
export class UpcomingcompanyComponent implements OnInit {
  @ Input() Item : any;
  UpcomingDriveDetails: any;
  showNoDataFoundMessage: boolean;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }

  ngOnInit(): void {
    console.log("Registeration no in child component is given as "+this.Item)
    this.GetUpcomingDriveDetails(this.Item);
  }

  GetUpcomingDriveDetails(regNo: any): void {
    debugger;
    this.placementPortalService.GetUpcomingDriveDetails(regNo).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.UpcomingDriveDetails = response.item1;
          this.showNoDataFoundMessage = false;
        }
        else {
          this.showNoDataFoundMessage = true;
          this.UpcomingDriveDetails =[];
        }
        console.log("Upcomming Placement Drives details " + JSON.stringify(this.UpcomingDriveDetails));
      },
      error: err => {
        console.log(err);
      }
    });
  }

}
