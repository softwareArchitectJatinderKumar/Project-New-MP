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
  selector: 'app-familydetails',
  templateUrl: './familydetails.component.html',
  styleUrls: ['./familydetails.component.css']
})
export class FamilydetailsComponent implements OnInit {
  showNoDataFoundMessage: boolean; selectData: any;
  Father: any; FatherName: any; FatherAge: any; FatherOccupation: any; FatherContact: any; FatherEmpolyer: any; FatherEmployerAddress: any; FatherEmaiId: any;
  Mother: any; MotherName: any;  MotherAge: any; MotherContact: any; MotherOccupation: any; MotherEmpolyer: any; MotherEmployerAddress: any; MotherEmaiId: any;
  dataSource: any;    errorMessage: any;    isLoginFailed: boolean;   CompanyDriveDetails: any;
  placementId: number;    FamilyData: any;     
  RelationI: any;
  FatherStatus: any;
  RelationII: any;
  MotherStatus: any;
  RelationX: any;
  selectDataName: any;
  selectDataAge: any;
  selectDataStatus: any;
  selectDataContact: any;
  selectDataOccupation: any;
  selectDataEmpolyer: any;
  selectDataEmployerAddress: any;
  selectDataEmaiId: any;
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
      const encryptedStageId = params['PlacementId'];
      this.placementId = Number(encryptedStageId);
      console.log("PlacementID  Update Contact page= " + this.placementId)
      this.GetCandidateFamilyData(this.placementId);
    });
  }
  rows: any[] = [{ relation: '', Name: '', Age: '', Status: '', ContactNumber: '', Occupation:'', EmployerName:'',EmployerAddress:'',EmailId: '' }];

  addRow() {
    this.rows.push({ relation: '', Name: '', Age: '', Status: '', ContactNumber: '', Occupation:'', EmployerName:'',EmployerAddress:'',EmailId: '' });
  }

  deleteRow() {
    if(this.rows.length > 2)
    this.rows.splice(1);
  }

  GetCandidateFamilyData(Pid: any): void {
    debugger;
    // GetPlacementCandidateFamilyFriendsDetails?PId=455274
    this.placementPortalService.GetFamilyFriendsDetails(Pid).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.FamilyData = response.item1;
          this.Father = this.FamilyData.filter((item: { relationship: string; }) => item.relationship.toLocaleLowerCase()=='father');
          this.Mother = this.FamilyData.filter((item: { relationship: string; }) => item.relationship.toLocaleLowerCase()=='mother');
          this.selectData= this.FamilyData.filter((item: { relationship: string; }) => item.relationship.toLocaleLowerCase()=='select');

          this.RelationI=this.Father[0].relationship;  this.FatherName= this.Father[0].name;          this.FatherAge= this.Father[0].age;
          this.FatherStatus=this.Father[0].status; this.FatherContact= this.Father[0].contactNumber; 
          this.FatherOccupation= this.Father[0].designation; this.FatherEmpolyer= this.Father[0].employerName; 
          this.FatherEmployerAddress= this.Father[0].employerAddress;
           this.FatherEmaiId=this.Father[0].emailId;


          this.RelationII=this.Mother[0].relationship;  this.MotherName= this.Mother[0].name;          this.MotherAge= this.Mother[0].age;
          this.MotherStatus=this.Mother[0].status; this.MotherContact= this.Mother[0].contactNumber; 
          this.MotherOccupation= this.Mother[0].designation; this.MotherEmpolyer= this.Mother[0].employerName; 
          this.MotherEmployerAddress= this.Mother[0].employerAddress;
           this.MotherEmaiId=this.Mother[0].emailId;


          this.RelationX=this.selectData[0].relationship;  this.selectDataName= this.selectData[0].name;   
          this.selectDataAge= this.selectData[0].age; this.selectDataStatus=this.selectData[0].status; 
          this.selectDataContact= this.selectData[0].contactNumber;   this.selectDataEmaiId=this.selectData[0].emailId;
          this.selectDataOccupation= this.selectData[0].designation; this.selectDataEmpolyer= this.selectData[0].employerName; 
          this.selectDataEmployerAddress= this.selectData[0].employerAddress;
          

          // this.MotherName= this.Mother.name;          this.MotherAge= this.Mother.age; this.MotherContact= this.Mother.contactNumber; 
          // this.MotherOccupation= this.Mother.designation; this.MotherEmployerAddress= this.Mother.employerAddress; this.MotherEmaiId=this.Mother.emailId;

          this.showNoDataFoundMessage = false;
          console.log("Candidate FamilyData  " + JSON.stringify(this.FamilyData))
          console.log("Candidate Father  " + JSON.stringify(this.Father) + " Name " + this.FatherName)
          console.log("Candidate Mother  " + JSON.stringify(this.Mother))
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

  UpdateFamilyDetails(StudentFamilyDetails: any){
    // debugger;
    console.log(" DATA to Update = "+ JSON.stringify(StudentFamilyDetails));
    // this.placementPortalService.UpdateCandidateFamilyFriendsDetails(StudentFamilyDetails).subscribe({
    //   next: data => {
    //     debugger;
    //     // console.log(data)
    //     if (data[0]['returnData'] === '-1') {
    //       swal.fire(
    //         { title: 'Something Went Wrong', icon: 'error' }
    //       ), setTimeout(() => {
    //         window.location.reload();
    //       }, 2000);
    //     }
    //     else {
    //       swal.fire(
    //         { title: 'Updation Done : = ', text: data[0]['returnData'], icon: 'success' }
    //       ), setTimeout(() => {
    //         window.location.reload();
    //       }, 2000);
    //     }

    //   }
    // })
  }

}
