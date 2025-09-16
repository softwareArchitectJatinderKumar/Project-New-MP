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
  selector: 'app-details-updation',
  templateUrl: './details-updation.component.html',
  styleUrls: ['./details-updation.component.css']
})
export class DetailsUpdationComponent implements OnInit {
  //dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  showNoDataFoundMessage: boolean;
  EmailId: any; Mobile: any; LinkedInUrl: any;SkypId: any; MicrosoftId: any; WhatsAppNo: any; AadhaarNo: any; PanCardNo: any; DrivingLicenseNo: any; PassportNo: any;
  dataSource: any;
  errorMessage: any;
  isLoginFailed: boolean;
  CompanyDriveDetails: any;
  placementId: number;
  CandidateContactData: any;
  CandidateContactDataIn: any;
  CandidateData: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }


  ngOnInit(): void {
    debugger;
    this.route.params.subscribe(params => {
      // const stageIdFromRoute = Number(params['stageId']);
      // this.stageId = stageIdFromRoute;
      // this.GetUploadedCheckListDocuments(stageIdFromRoute);
      const encryptedStageId = params['PlacementId'];
      this.placementId = Number(encryptedStageId);
      console.log("PlacementID  Update Contact page= " + this.placementId)
      this.GetCandidateContactData(this.placementId);
    });
  }


  GetCandidateContactData(Pid: any): void {
    debugger;
    this.placementPortalService.GetPlacementCanidateContactDetails(Pid).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.CandidateContactData = response.item1;
          this.showNoDataFoundMessage = false;
          console.log("Candidate ContactData Data " + JSON.stringify(this.CandidateContactData))
          this.EmailId = this.CandidateContactData[0].emailId; 
          this.Mobile = this.CandidateContactData[0].mobile; 
          this.LinkedInUrl = this.CandidateContactData[0].linkedInUrl; 
          this.SkypId = this.CandidateContactData[0].skypeId; 
          this.WhatsAppNo = this.CandidateContactData[0].whatsAppNo; 
          this.MicrosoftId = this.CandidateContactData[0].microsoftId; 
          this.PanCardNo = this.CandidateContactData[0].panCardNo; 
          this.AadhaarNo = this.CandidateContactData[0].aadhaarNo;
          this.DrivingLicenseNo = this.CandidateContactData[0].drivingLicenseNo;
          this.PassportNo = this.CandidateContactData[0].passportNo;
          
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  LoginFailed(err: any) {
    console.log('Error.' + err);
  }

  UpdateDetails(StudentDetails: any){
    // debugger;
    // console.log(" DATA to Update = "+ JSON.stringify(StudentDetails));
    this.placementPortalService.UpdateStudentDetails(StudentDetails).subscribe({
      next: data => {
        debugger;
        // console.log(data)
        if (data[0]['returnData'] === '-1') {
          swal.fire(
            { title: 'Something Went Wrong', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        else {
          swal.fire(
            { title: 'Updation Done : = ', text: data[0]['returnData'], icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        }

      }
    })
  }


}
