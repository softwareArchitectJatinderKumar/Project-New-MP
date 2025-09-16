import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
@Component({
  selector: 'app-ConstructionRMS',
  templateUrl: './ConstructionRMS.component.html',
  styleUrls: ['./ConstructionRMS.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ConstructionRMSComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;

  selectedSchoolDiv: any = null;
  simpleItems: any = [];
  AreaofCollaboration: any = [];
  AgreementType: any = [];
  MessageType: any = [];
  Block: any = [];

  Activity: any = [];
  SchoolsInvolved: any = [];

// Aggrement Start

session: any=[];
metricbysessionid: any=[];
ActivityByAoC: any=[];
SchoolsInvolved_: any=[];
DivisionsInvolved_: any=[];
Allemployee: any=[];

//Aggrement END


  form: FormGroup;
  myArray: any[]=[];
  driveAttendance: any[]=[];
  staticArray:any=[];
  batchYearData: any=[];
  batchYearCompanyData: any=[];
  batchYearStreamData: any=[];
  streamData: any[]=[];
  selectedStream:any='';
  dExitDataAll:any[]=[];
  selectedBatchyear:any = null;
  roundData:any[] = [];
  selectedRoundData:any = null;
  selectedStreams:any = null;
  selection:any='';
  isAvailable:Number = 0;
  responses: any[]=[];
  results: RESULT={
    batchYear:0,
    companyId:0,
    driveId:0,
    stream:'',
    placementSoftSkillRequestDetail:[]
  };
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

  //'MoU <span class="themeClr" >Dashboard</span>'
  constructor(private Agreement:AgreementEntryService,
    
    private fb: FormBuilder,private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private placementService: PlacementService,) {

    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });

  }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Construction <span class="themeClr" >RMS</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width='164px';
    let loginName  = this.route.snapshot.params['loginName'];
    //   const dataTable = new DataTable("#dataTableExample");

        const dataTable = new DataTable("#dataTableExample",{

        });



       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }

       //this.AgreementType=['MOU','Credit Transfer','Semester Abroad','Agreement']
       this.MessageType=['Grievance','Request','Feedback','Enquiry']

       this.Block=['BH1','BH1','BH1','BH1']




      
       this.getSchoolsInvolved('S');
       this.getDivisionsInvolved('D');
       this.getDisplayAllemployee();
  }


  selectedDate: NgbDateStruct;
  txtVenue:any='';
  txtEvent:any='';
  selectedEmployee:any=null;
  selectedBlock:any=null;
  ddlType:any=null;
  ddlCategory:any=null;
  ddlSubCategory:any=null;


  SigningDate :NgbDateStruct;
  StartDate :NgbDateStruct;
  EndDate :NgbDateStruct;




  SubmitForm(item:any){

    
    console.log(item)

  }




  
  changeCollab(event:any){
  debugger;
  let aa = event;
  console.log(JSON.stringify(aa));
  this.getActivityByAoC(aa);


  }

  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
         this.Agreement.getRunningSession().subscribe({
           next: data => {
            debugger;
            this.session = data.item1;
            //this.getround();

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

  onSessionChange($event:any){
    console.log($event.sessionId);
    let sessionid = $event.sessionId
    this.getMetricBySessionID(sessionid);

  }

  getMetricBySessionID(sessionid:any){

    this.Agreement.getMetricBySessionID(sessionid).subscribe({
      next: data => {
  debugger;
       this.metricbysessionid = data.item1;
      },
      });
  }

  getActivityByAoC(AOC:any){
    debugger;
    let df = '';
    for(let i=0; i < AOC.length; i++){
      df += AOC[i] + ','
    }
    const checkData = {
      area:df,
     
     }

    this.Agreement.getActivityByAoC(checkData).subscribe({
      next: data => {
      debugger;
       this.ActivityByAoC = data.item1;
      },
      });
  }

  getSchoolsInvolved(type:any){
    debugger;
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {
      debugger;
       this.SchoolsInvolved_ = data.item1;
      },
      });
  }

  getDivisionsInvolved(type:any){
    debugger;
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {
      debugger;
       this.DivisionsInvolved_ = data.item1;
      },
      });
  }

  getDisplayAllemployee(){
    this.Agreement.getDisplayAllemployee().subscribe({
      next: data => {
       
  debugger;
       this.Allemployee = data.item1;
  
  
      },
      });
  }




  changeLeagueOwner($event:any){

    this.batchYearCompanyData = [];
    this.batchYearStreamData = [];

    if($event.batchYear != ''){
      
      this.selectedBatchyear = $event.batchYear;
      this.getCompany($event.batchYear);
    }

  }

  changeCompany(event:any){
    if(event  != undefined){
    if(event.companyId != ''){
      
      this.selection=event.companyId;
      this.getStream(event.companyId,this.selectedBatchyear);
    }
  }
  }

  changeCompanyStream(event:any){
    
    if(event != undefined){
    this.selectedStream = '';
    for(let i=0; i < event.length; i++){
      this.selectedStream += event[i]['stream'] + ',';
    }
    this.selectedStream.substring(0, this.selectedStream.length - 1);
  }
  }

getCompany(batchYear:any){

  this.ngSelectComponentStream.handleClearClick();
  this.ngSelectComponent.handleClearClick();
  this.streamData = [];
  this.placementService.getCompanyByBatchyears(batchYear).subscribe({
    next: data => {
     

     this.batchYearCompanyData = data.item1;


    },
    });
}

getStream(companyId:any,batchYear:any){
  this.ngSelectComponentStream.handleClearClick();
  this.placementService.getStreamByBatchyears(batchYear,companyId).subscribe({
    next: data => {
     
     this.batchYearStreamData = data.item1;


    },
    });
}

showDriveData(){
  this.myArray=[];
}


onSubmit11(driveId:string,stream:string){
  const checkData = {
    DriveId:driveId.toString(),
    BatchYear:this.selectedBatchyear,
    CompanyId:this.selection,
    Stream:stream
   }

   this.placementService.updateFinalSubmitSoftSkillData(checkData).subscribe({
    next: data => {
      if(data.item1[0]['status'] == false){
        swal.fire(

          {title: 'Placement Drive Final Submission', text: data.item1[0]['message'], icon: 'error'}
  
          );
         
      }
      else{
        (<HTMLInputElement>document.getElementById('dvDriveData'+driveId)).style.display='none';
        swal.fire(
          {title: 'Placement Drive Final Submission', text: data.item1[0]['message'], icon: 'success'}
  
          );
          this.resetData();


      }
      },
    });
}










  resetData(){

    this.ngSelectComponentStream.handleClearClick();
    this.ngSelectComponent.handleClearClick();
    this.batchYearCompanyData = [];
    this.batchYearStreamData = [];
    this.streamData = [];
    this.myArray=[];
    this.selectedBatchyear = null;
  }






}
