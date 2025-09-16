import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';

import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { RMSService } from 'src/app/_services/rms.service';
@Component({
  selector: 'app-rms-pendeancy',
  templateUrl: './rms-pendeancy.component.html',
  styleUrls: ['./rms-pendeancy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class RMSPendeancyComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  TableData:any=[];
  Arr = Array; 
  TableDataCreatedBy:any=[];
  agrrentmentShowing:boolean = false;
  viewdescription:any='';
  selectCollabTypeName:any='';
  selectedSchoolDiv: any = null;
  simpleItems: any = [];
  AreaofCollaboration: any = [];
  commercialCountPage: any = [];
  AgreementType: any = [];
  enterMouName:any='';
  isCommercialShowing:any=0;
  isCommercialChecked:any='';
  //notingSheetRefNo:any='';
  FileNumber:any='';
  isInputDisabled:any=false;
  selectCollabType:any='';
  selectCollabSubType:any='';
  //selectResponsible:any='';
  ActivityResponsiblePerson:any='';
  Internalresourcepersons:any='';
  AgreementType2: any = [];
  MOUType: any = [];
  AgreementTypeDisplay2: any = [];
selectedEmmployeeResponsible:any='';
selectedEmmployeeResponsiblePlannedBy:any='';
  Activity: any = [];
  SchoolsInvolved: any = [];
 selectedAgreementType:any='';
 selectedAgreementSubType:any='';
// Aggrement Start

session: any=[];
metricbysessionid: any=[];
ActivityByAoC: any=[];
SchoolsInvolved_: any=[];
DivisionsInvolved_: any=[];
Allemployee: any=[];
eGovDivisionMaster: any=[];

Type: any=[];
commercialAmount:any='';
commercialAmountRemarks:any='';
ddlMoUName: any=[];
ddlMoUNameDetails: any=[];
roundDataBackUp:any[]=[];
ddlMoUName_ID:any=''
ActivityA:any='';
SessionA:any='Select Session'
MetricDesc:any=''
OrganizationName:any=''
ActivityType:any=''
ActivityDescription:any=''
ActivityDescription2:any=''
NoofActivities:any=''
Students:any=''
Faculty:any=''
Community:any=''
Email:any=''
isShowingUsers:any=false;
//Website:any=''
//ContactPerson:any=''
//Designation:any=''
//ContactNo:any=''
//Email:any=''
//selectedSPOC:any=''
//OrganizationCategory:any=''
ActivityStatus:any=''
PlannedDate:any=''
//MOUTimePeriod:any=''
//MOUClassification:any=''
//MOUTypeA:any=''
//CommercialInvolved:any=''
//SchoolsInvolvedA:any=''
//DivisionsInvolvedA:any=''
//AreaofCollaborationA:any=''
//ActivityA:any=''
//Aggrement END
ExternalResourcesCount:any=0;
ExternalResourcesRows:any[]=[];
commercialRows:any=1;
  form: FormGroup;
  myArray: any[]=[];
  driveAttendance: any[]=[];
  staticArray:any=[];
  getSelectedMOU:any=[];
  batchYearData: any=[];
  batchYearCompanyData: any=[];
  batchYearStreamData: any=[];
  streamData: any[]=[];
  selectedStream:any='';
  dExitDataAll:any[]=[];
  FileData:File;
  selectedBatchyear:any = null;
  roundData:any[] = [];
  selectedRoundData:any = null;
  selectedStreams:any = null;
  selection:any='';
  selectedMetric:any='';
  isAvailable:Number = 0;
  isButtonShwoing:boolean=false;
  responses: any[]=[];
  results: RESULT={
    batchYear:0,
    companyId:0,
    driveId:0,
    stream:'',
    placementSoftSkillRequestDetail:[]
  };
  showApprovalMou:any=false;
  details:Details={
    companyRemarks:'',
    facultyRemarks:'',
    feedback:'',
    roundId:0,
    totalAbsent:'',
    totalEligible:'',
    totalLeft:'',
    totalNotSelected:'',
    totalPresent:'',
    totalRegistered:'',
    totalSelected:''
  };
  @ViewChild('userPhoto') userPhoto: ElementRef;
  //'MoU <span class="themeClr" >Dashboard</span>'
  constructor(private Agreement:AgreementEntryService,
    private datePipe:DatePipe,
    private fb: FormBuilder,private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private rmsService: RMSService,) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  rows = [
     {driveId: 1, desc: "foo", showDetail: false},
     {driveId: 2, desc: "bar", showDetail: false},
  ]
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'RMS <span class="themeClr" >Pendancy</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width='164px';
    let loginName  = this.route.snapshot.params['loginName'];
 //   const dataTable = new DataTable("#dataTableExample");


       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }

    //   this.AreaofCollaboration = ['Academics', 'Admission','Events','Health','Industry','Infrastructure','Research and Development','Vendor/Contractor'];
     //  this.Activity = ['Admission Process Automation','Collaborative Online Intercultural Learning (COIL)','Community Outreach Training','Workshops','Student exchange'];
       //this.SchoolsInvolved=['School of Law','School of Mechanical Engineering','School of Polytechnic']
this.Type=['MOU','Agreement','License Deed','LoI/Term Sheet','Indemnity Bond','Affidavit'];



     
  }

  

  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        this.rmsService.getPendancyHeadWise().subscribe({
          next: dataRMS => {

debugger;

this.TableDataCreatedBy = dataRMS.item1;

          },
          
        });

      },
      error: err => {
       // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }
 

}
