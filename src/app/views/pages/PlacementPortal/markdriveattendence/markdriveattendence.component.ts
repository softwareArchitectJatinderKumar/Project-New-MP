import { FormControl, FormGroup } from '@angular/forms';
import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
  selector: 'app-markdriveattendence',
  templateUrl: './markdriveattendence.component.html',
  styleUrls: ['./markdriveattendence.component.css']
})
export class MarkdriveattendenceComponent implements OnInit {
  registrationNumber: any;
  regdId: any;
  DriveDropDown: any;
  RoundDetails: any;
  showNoDataFoundMessage: boolean;
  selectedId: number;
  DriveId: number;


  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,

  ) { }

  
  getRegistrationId(): void {
    this.route.params.subscribe(params => {
      this.registrationNumber = params['RegistrationId'];
    //  console.log("registrationNumber  Job Offer page= " + this.registrationNumber)
      this.regdId = this.registrationNumber;
    });
  }
  ngOnInit(): void {
    this.getRegistrationId();
    this.GetDropDownDetails(this.regdId,'S');
  }
  
  GetDriveCode(event: Event) {
    debugger;
    const selectElement = event.target as HTMLSelectElement; const selectedValue = selectElement.value;
    const DriveId = Array.from(selectElement.options).findIndex(option => option.value === selectedValue);
    if (DriveId !== -1) {
      selectElement.selectedIndex = DriveId;
      this.selectedId = parseInt(selectedValue, 10);
      this.DriveId = this.selectedId;
      this.GetRoundDetails(this.DriveId);
    }
  }


  GetRoundDetails(DriveCode: number) {
    debugger;
    this.placementPortalService.GetRoundDetails(DriveCode).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.RoundDetails = response.item1;
          console.log("RoundDetails Drive Data  " + JSON.stringify(this.RoundDetails))
        }
        else {
          this.RoundDetails=null;
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        console.log(err)
      }
    });
  }

  GetDropDownDetails(regdId: any, Type: any) {
    debugger;
    this.placementPortalService.GetDriveDetails(regdId,Type).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.DriveDropDown = response.item1;
          console.log("DropDown Drive Data  " + JSON.stringify(this.DriveDropDown))
        }
        else {
          this.DriveDropDown=null;
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        console.log(err)
      }
    });
  }



  placementForm = new FormGroup({
    DriveDropDown: new FormControl('Select', Validators.required),
    RoundDetails: new FormControl('Select', Validators.required),
    mannualMark: new FormControl('', Validators.required)
  })

  OnSubmit() {
    console.warn('data submited')
  }
}
