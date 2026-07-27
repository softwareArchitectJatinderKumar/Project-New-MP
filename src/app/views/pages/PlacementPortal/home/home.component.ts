import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  //dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  CandidateData: any;
  showNoDataFoundMessage: boolean;
  CandidateDataOut: any;
  dataSource: any;
  CandidateDataIn: any;
  errorMessage: any;
  isLoginFailed: boolean;
  registrationNumber: any;
  DriveMessageData: any;
  Announcements: any;
  UpcomingDriveDetails: any;
  TpcDetails: any;
  SelectedStudentDetails: any;
  VisitedCompanies: any;
  MyPlacementRecords: any;
  UpcomingDriveConductDetails: any;
  PlacementId: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }

  getRegistrationId(): void{
    this.route.params.subscribe(params => {
      // const stageIdFromRoute = Number(params['stageId']);
      // this.stageId = stageIdFromRoute;
      // this.GetUploadedCheckListDocuments(stageIdFromRoute);
      // const encryptedStageId = +params['RegistrationId'];
      this.registrationNumber = +params['RegistrationId'];
      console.log("registrationNumber  Home page= " + this.registrationNumber)
    });
  }
  ngOnInit(): void {
    this.getRegistrationId();
    debugger;
    //this.GetAllStudentsCases();
    // (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Student Home <span class="themeClr">Profile </span>';
    // //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    // (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    // this.registrationNumber='12320283';//'11910459';//'12320283'; //12208517 
    this.GetCandidateData(this.registrationNumber);
    this.GetPlacementCandidateDriveMessages(this.registrationNumber, 'H');
    this.GetPlacementAnnouncements('D','S');
    this.GetUpcomingDriveDetails(this.registrationNumber);
    this.GetTPCDetails('GTPCA',this.registrationNumber);
    this.GetMyPlacementDetails(this.registrationNumber);
    this.GetUpcomingDriveConductDetails(this.registrationNumber);
  }

  GetCandidateData(regNo: any): void {
    debugger;
    this.placementPortalService.GetPlacementCandidateProfile(regNo).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.CandidateData = response.item1;
          this.CandidateDataIn = this.CandidateData[0];
          this.PlacementId= this.CandidateData[0].uniquePlacementId;
          this.showNoDataFoundMessage = false;
          // console.log("Candidate Data " + JSON.stringify(this.CandidateDataIn))
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
  refreshData() {
    console.log(" tests ")
  }

  LoginFailed(NewError: any) {
    this.errorMessage = NewError.errorMessage;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('myTabs');
    if (element) {
      element.hidden = true;
    }
  }

  GetPlacementCandidateDriveMessages(regNo: any, DriveType: any  ){
    debugger;
    this.placementPortalService.GetPlacementCandidateDriveMessages(regNo, DriveType).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.DriveMessageData = response.item1;          
          // console.log("Candidate Drive messages " + JSON.stringify(this.DriveMessageData))
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        
      }
    });
  }

  GetPlacementAnnouncements(typeId: any, UtypeId: any): void {
    debugger;
    this.placementPortalService.GetPlacementAnnouncements(typeId, UtypeId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.Announcements = response.item1;
          this.showNoDataFoundMessage = false;
          // console.log(" Data " + JSON.stringify(this.Announcements))
          
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
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  GetTPCDetails(TypeId: any, RegId: any): void {
    debugger;
    this.placementPortalService.GetTPCDetails(TypeId, RegId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.TpcDetails = response.item1;
          this.showNoDataFoundMessage = false;
          // console.log(" TPC Details " + JSON.stringify(this.TpcDetails))
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
 
  GetMyPlacementDetails(regNo: any): void {
    debugger;
    this.placementPortalService.GetMyPlacementRecords(regNo).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.MyPlacementRecords = response.item1;
          this.showNoDataFoundMessage = false;
          // console.log(" My Placement  Details " + JSON.stringify(this.MyPlacementRecords))
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


 GetUpcomingDriveConductDetails(regNo: any): void {
  debugger;
  this.placementPortalService.GetUpcomingDriveConductDetails(regNo).subscribe({
    next: response => {
      if (response.item1 && response.item1.length > 0) {
        this.UpcomingDriveConductDetails = response.item1;
        this.showNoDataFoundMessage = false;
      }
      else {
        this.showNoDataFoundMessage = true;
      }
      // console.log(" Conduct details " + JSON.stringify(this.UpcomingDriveConductDetails))
    },
    error: err => {
      this.LoginFailed(err);
    }
  });
}
}
