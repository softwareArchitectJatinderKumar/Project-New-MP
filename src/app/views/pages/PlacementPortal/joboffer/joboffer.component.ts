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
  selector: 'app-joboffer',
  templateUrl: './joboffer.component.html',
  styleUrls: ['./joboffer.component.css']
})
export class JobofferComponent implements OnInit {
  columns: any; headHtmlData: any[] = []; studentLists: any[];
  errorMessage: any; serverUrl: any;
  regdId: any;
  DriveId: number;
  isLoginFailed: boolean;
  // @ Input () Pid: any;
  CandidateData: any;
  CandidateDataSelectedIn: any;
  PlacementId: any;
  showNoDataFoundMessage: boolean;
  data: number;
  registrationNumber: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,

  ) { }
  companies: any;
  selectedCompany: string = '';

  formchecked = new FormGroup({

    checkbox: new FormControl('', Validators.required),
    selectedDrive: new FormControl('', Validators.required)
  })


  getRegistrationId(): void {
    this.route.params.subscribe(params => {
      this.registrationNumber = params['RegistrationId'];
      // console.log("registrationNumber  Job Offer page= " + this.registrationNumber)
      this.regdId = this.registrationNumber;
    });
  }
  ngOnInit(): void {
    this.getRegistrationId();
    debugger;
    this.GetCandidateJobData(this.registrationNumber);
  }

  Onsubmit() {
    debugger
    var XY = Number(this.formchecked.value.selectedDrive);
    this.DriveId = XY;
    // console.log("Form Data to be sent " + this.DriveId)
    if (this.DriveId > 0) {
      this.sendRequest(this.regdId,XY);
    //   this.placementPortalService.UpdatePlacementJobOffer(this.regdId, XY).subscribe((data: any) => {

    //     if (data.returnData == 'success') {
    //       swal.fire(
    //         'Accepted Your Job Offer!',
    //         '----',
    //         'success'
    //       )
    //     }
    //     else {
    //       swal.fire(
    //         'Not  changed !',
    //         '-------',
    //         'error'
    //       )
    //     }
    //   })
    //   // , setTimeout(() => {
    //   //   window.location.reload();
    //   // }, 21000);
    // }
    // else {
    //   swal.fire(
    //     'Invalod Drive Id ',
    //     '----',
    //     'warning'
    //   )
    // }
  }
}

  sendRequest(Id: any, DriveId: any)
  {
    debugger;
        const formData = new FormData();
      formData.append('regId', Id);
      formData.append('DriveId', DriveId);

      // formData.forEach((value, key) => {
      //   console.log(key, value);
      // });

      // console.log("Data got from UI" + JSON.stringify(formData));
      swal.fire({
        title: 'Are you sure want to Accept Offer  ?',
        text: 'Kindly confirm !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change it!',
        cancelButtonText: 'No, Do not Change it'
      }).then((result: any) => {
        if (result.value) {
          this.placementPortalService.UpdatePlacementJobOffer(formData).subscribe((data: any) => {
            // console.log(data[0]);
            if (data[0].returnData == 'success') {
              swal.fire(
                'Accepted the Job Offer Changed!',
                '----',
                'success'
              )
              
            }
            else {
              swal.fire(
                'Status is not changed !',
                '-------',
                'error'
              )
            }
            // window.location.reload();
            window.location.reload();
            setTimeout(() => {
              this.GetCandidateJobData(this.registrationNumber);
            }, 1500);
          })
        } else {
          swal.fire(
            'Cancelled',
            'The Job Offer is not changed',
            'error'
          )
        }
      })
    }


  GetCandidateJobData(regNo: any): void {
    debugger;
    this.placementPortalService.GetPlacementJobOfferDetails(regNo).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.CandidateData = response.item1;
          this.CandidateDataSelectedIn = response.item2;
          this.PlacementId = this.CandidateData[0].uniquePlacementId;
          this.selectedCompany = this.CandidateData[0].companyName;
          this.showNoDataFoundMessage = false;
          // console.log("Candidate Data selected in  " + JSON.stringify(this.CandidateDataSelectedIn))
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        // console.log(err)
      }
    });
  }
}
