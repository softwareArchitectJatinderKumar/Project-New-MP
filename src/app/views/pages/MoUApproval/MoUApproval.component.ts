import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
@Component({
  selector: 'app-MoUApproval',
  templateUrl: './MoUApproval.component.html',
  styleUrls: ['./MoUApproval.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MoUApprovalComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('smModal') modelSmall: TemplateRef<any>;
  @ViewChild('chatModal') chatModal: TemplateRef<any>;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;

  selectedSchoolDiv: any = null;
  simpleItems: any = [];
  AreaofCollaboration: any = [];
  AgreementType: any = [];
  isShowingForwardDiv:boolean= false;
  AgreementType2: any = [];
  AgreementTypeDisplay2: any = [];
  selectedTableId:any=0;
  Activity: any = [];
  SchoolsInvolved: any = [];
  viewdescription:any='';


// Aggrement Start
TableData:any=[];
ApprovedTableData:any=[];
RejectedTableData:any=[];
session: any=[];
metricbysessionid: any=[];
ActivityByAoC: any=[];
SchoolsInvolved_: any=[];
DivisionsInvolved_: any=[];
Allemployee: any=[];
eGovDivisionMaster: any=[];

Type: any=[];

//Aggrement END

//MoUApproval Start

Status:any=''
Remarks:any=''
forwardtoEmployee:any=''
selectedRowId:Number=0;

//MoUApproval End


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
  defaultNavActiveId = 1;
 isApprovalDivShowing:any=false;
 isAlreadyForward:any=false;
  forwardUserId:any='';
  forwardUserRemarks:any='';
  MessageId:any=null;
  TicketNo:any=null;

  PChat:any=null;
  
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
    private modalService: NgbModal,
    private fb: FormBuilder,private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private placementService: PlacementService,) {
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
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'MoU <span class="themeClr" >Approval</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width='164px';
    let loginName  = this.route.snapshot.params['loginName'];
 //   const dataTable = new DataTable("#dataTableExample");
debugger;
        // var hangoutButton = document.querySelector(".btnClickNew");

        // hangoutButton.addEventListener("click", this.modifyText, false);
        

       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }

    //   this.AreaofCollaboration = ['Academics', 'Admission','Events','Health','Industry','Infrastructure','Research and Development','Vendor/Contractor'];
     //  this.Activity = ['Admission Process Automation','Collaborative Online Intercultural Learning (COIL)','Community Outreach Training','Workshops','Student exchange'];
       //this.SchoolsInvolved=['School of Law','School of Mechanical Engineering','School of Polytechnic']
     
  }

  handleClick(){
    alert(1);
  }

  modifyText(){
    alert(1);
  }

  selectedDate: NgbDateStruct;

  profileForm = new FormGroup({
    BatchYear: new FormControl(''),
    Company: new FormControl(''),
    //Feedback: new FormControl(''),

  });


  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }

  ngAfterViewInit(): void {

    // Show chat-content when clicking on chat-item for tablet and mobile devices
    document.querySelectorAll('.chat-list .chat-item').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelector('.chat-content')!.classList.toggle('show');
      })
    });

  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector('.chat-content')!.classList.toggle('show');
  }

  
  changeCollab(event:any){
  debugger;
  let aa = event;
  // console.log(JSON.stringify(aa));
  this.getActivityByAoC(aa);


  }

  viewdesc(val:any){
    this.viewdescription = val;
    let data = this.ApprovedTableData.filter((x: { id: any; })=>x.id===parseInt(val));
    this.viewdescription=data[0]['forwardUserRemarks'];
    this.modalService.open(this.viewDescModal, {size: 'sm'}).result.then((result) => {

      // console.log("Modal closed" + result);
    }).catch((res) => {});

  }

  viewRdesc(val:any){
    this.viewdescription = val;
    let data = this.RejectedTableData.filter((x: { id: any; })=>x.id===parseInt(val));
    this.viewdescription=data[0]['forwardUserRemarks'];
    this.modalService.open(this.viewDescModal, {size: 'sm'}).result.then((result) => {

      console.log("Modal closed" + result);
    }).catch((res) => {});

  }

  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
         this.Agreement.getMouAgreementMaster().subscribe({
           next: data => {
            this.TableData = data.item1.filter((obj:any) => {
              return (obj.isVetting === null && obj.isForwardUser== false) || (obj.forwardUserVetting === null && obj.isForwardUser== true);
              });
            //this.getround();
            //this.getAreaCollab();
            //this.getSchoolsInvolved('S');
            //this.getDivisionsInvolved('D');
            this.getDisplayAllemployeebyUID();
            
            //this.geteGovDivisionMaster();
             debugger;
           this.ApprovedTableData = data.item1.filter((obj:any) => {
            return (obj.isVetting === '1' && obj.isForwardUser== false) ||  (obj.forwardUserVetting === 'True' && obj.isForwardUser== true);
            });

            this.RejectedTableData = data.item1.filter((obj:any) => {
              return (obj.isVetting === '0' && obj.isForwardUser== false) ||  (obj.forwardUserVetting === 'False' && obj.isForwardUser== true);
              });

              setTimeout(() => {
              
                const dataTable = new DataTable("#dataTableExample");
                // const button1 = <HTMLElement>document.querySelectorAll("button");
                // button1.addEventListener("click", this.handleClick);
                

                document.querySelectorAll('button').forEach(occurence => {
                  occurence.addEventListener('click', (e:any) => {
                    debugger;
                    if(e.target['innerText']=='Take Action'){
                    debugger;
                    this.openSmModal(e.target['name']);
                    }
                    else if(e.target['innerText']=='Chat'){
                      this.openChatModal(e.target['name']);
                    }
                    else if(e.target['innerText']=='View Remarks'){
                      this.viewdesc(e.target['name']);
                    }
                    else if(e.target['innerText']=='View Rejected Remarks'){
                      this.viewRdesc(e.target['name']);
                    }
                    //alert('A link was clicked');
                  });
                });

            }, 1000);

            
            // const dataTable = new DataTable("#dataTableExample",{
              
            //   //data:this.TableData
            //  });

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

  first(){
    setTimeout(() => {
      const dataTable = new DataTable("#dataTableExample");
      document.querySelectorAll('button').forEach(occurence => {
        occurence.addEventListener('click', (e:any) => {
          debugger;
          if(e.target['innerText']=='Take Action'){
          debugger;
          this.openSmModal(e.target['name']);
          }
          else if(e.target['innerText']=='Chat'){
            this.openChatModal(e.target['name']);
          }
          else if(e.target['innerText']=='View Remarks'){
            this.viewdesc(e.target['name']);
          }
          else if(e.target['innerText']=='View Rejected Remarks'){
            this.viewRdesc(e.target['name']);
          }
          //alert('A link was clicked');
        });
      });
  }, 200);
  }

  second(){
    setTimeout(() => {
      const dataTable = new DataTable("#dataTableApproved");
      document.querySelectorAll('button').forEach(occurence => {
        occurence.addEventListener('click', (e:any) => {
          debugger;
          if(e.target['innerText']=='Take Action'){
          debugger;
          this.openSmModal(e.target['name']);
          }
          else if(e.target['innerText']=='Chat'){
            this.openChatModal(e.target['name']);
          }
          else if(e.target['innerText']=='View Remarks'){
            this.viewdesc(e.target['name']);
          }
          else if(e.target['innerText']=='View Rejected Remarks'){
            this.viewRdesc(e.target['name']);
          }
          //alert('A link was clicked');
        });
      });
  }, 200);
  }

  third(){
    setTimeout(() => {
      const dataTable = new DataTable("#dataTableRejected");
      document.querySelectorAll('button').forEach(occurence => {
        occurence.addEventListener('click', (e:any) => {
          debugger;
          if(e.target['innerText']=='Take Action'){
          debugger;
          this.openSmModal(e.target['name']);
          }
          else if(e.target['innerText']=='Chat'){
            this.openChatModal(e.target['name']);
          }
          else if(e.target['innerText']=='View Remarks'){
            this.viewdesc(e.target['name']);
          }
          else if(e.target['innerText']=='View Rejected Remarks'){
            this.viewRdesc(e.target['name']);
          }
          //alert('A link was clicked');
        });
      });
  }, 200);
  }

  openSmModal(val:any) {
    debugger;
    this.selectedTableId = val;
    let aaa = this.TableData.filter((x: { id: any; })=>x.id===parseInt(val));
    if(aaa.length > 0){
      let b = aaa[0]['forwardUserVetting'];
      if(b == null && aaa[0]['isForwardUser'] === false){
          this.isApprovalDivShowing = false;
      }
      else{
        if(b == null && aaa[0]['isForwardUser'] === true){
          this.isApprovalDivShowing = true;
        }
        else{
        this.isApprovalDivShowing = true;
        }
      }

      if(aaa[0]['isForwardUser'] === false){
        this.isShowingForwardDiv  = true;
      if(aaa[0]['forwardToUID'] == null){
        this.isAlreadyForward = false;
        this.forwardUserId = '';
      }
      else{
        this.isAlreadyForward = true;
        this.forwardUserId = aaa[0]['forwardToUIDName'];
        this.forwardUserRemarks = aaa[0]['forwardUserRemarks'];
        
      }
    }
    else{
      this.isShowingForwardDiv  = false;
      this.isAlreadyForward = false;
      this.forwardUserId = '';
    }
    }
    this.selectedRowId = val;
    this.modalService.open(this.modelSmall, {size: 'sm'}).result.then((result) => {

      console.log("Modal closed" + result);
    }).catch((res) => {});
  }

  openChatModal(val:any) {
    debugger;
    
    this.selectedRowId = val;
    this.modalService.open(this.chatModal, {size: 'sm'}).result.then((result) => {

      console.log("Modal closed" + result);
    }).catch((res) => {});
  }

  OnForwardChange(event:any){
    debugger;
    this.forwardtoEmployee = event.emp_code;


  }

  onSubmitStatus(){
    debugger;
    let aaa = this.TableData.filter((x: { id: any; })=>x.id===parseInt(this.selectedTableId));

  if(this.Status == ''){
    swal.fire(

      {title: 'Mou Approval Action', text: 'Please select Approval/Rejected Status !', icon: 'error'}

      );
  }
  else if(this.Remarks == ''){
    swal.fire(

      {title: 'Mou Approval Action', text: 'Please enter approval/reject remarks !', icon: 'error'}

      );
  }
  else{

    const checkData1 = {
      ID:Number(this.selectedRowId),
      IsVetting:this.Status == 'Approve' ? true :false,
      Remarks:this.Remarks,
      Type:'R',
      isForwardUser:aaa[0]['isForwardUser']
     }

     this.Agreement.updateMouApprovalSTatus(checkData1).subscribe({
      next: data => {
      debugger;
      swal.fire(

        {title: 'Mou Approval Action', text: data.item1[0]['msg'], icon: 'success'}
  
        ).then(function(){ 
          location.reload();
          }
       );
        let loginName  = this.route.snapshot.params['loginName'];
         //   const dataTable = new DataTable("#dataTableExample");
        debugger;
        // var hangoutButton = document.querySelector(".btnClickNew");

        // hangoutButton.addEventListener("click", this.modifyText, false);
       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }
      },
      });


    }
  
 
  }

  onSubmitForward(){
    if(this.forwardtoEmployee == ''){
      swal.fire(
  
        {title: 'Mou Forward  Action', text: 'Please select Employee !', icon: 'error'}
  
        );
    }
    else{
      const ForwardData = {
        ID:Number(this.selectedRowId),
        ForwardToUID:String(this.forwardtoEmployee),
        Type:'F'
       }
debugger;
       this.Agreement.updateMouApprovalSTatus(ForwardData).subscribe({
        next: data => {
        debugger;
        swal.fire(
  
          {title: 'Mou Forward Action', text: data.item1[0]['msg'], icon: 'success'}
    
          );
          let loginName  = this.route.snapshot.params['loginName'];
           //   const dataTable = new DataTable("#dataTableExample");
          debugger;
          // var hangoutButton = document.querySelector(".btnClickNew");
  
          // hangoutButton.addEventListener("click", this.modifyText, false);
         if(loginName != '' && loginName != undefined){
          this.getToken(loginName);
         }
        },
        });
    }
  }

  
  getAreaCollab(){
    debugger;
    this.Agreement.getCollabArea().subscribe({
      next: data => {
       debugger;
       this.AreaofCollaboration = data.item1;
       //this.getround();

      },
      });
  }

  onSessionChange($event:any){
    console.log($event.sessionId);
    let sessionid = $event.sessionId
    this.getMetricBySessionID(sessionid);

  }

  getMetricBySessionID(sessionid:any){

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
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
      df += AOC[i]['areaId'] + ','
    }
    const checkData = {
      area:df,
     
     }
    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getActivityByAoC(checkData).subscribe({
      next: data => {
      debugger;
       this.ActivityByAoC = data.item1;
      },
      });
  }

  getSchoolsInvolved(type:any){
    debugger;

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {
      debugger;
       this.SchoolsInvolved_ = data.item1;
      },
      });
  }

  getDivisionsInvolved(type:any){
    debugger;

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {
      debugger;
       this.DivisionsInvolved_ = data.item1;
      },
      });
  }
  

  getDisplayAllemployeebyUID(){

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getDisplayAllemployeeByUID().subscribe({
      next: data => {
       
  debugger;
       this.Allemployee = data.item1;
  
  
      },
      });
  }


  getDisplayAllemployee(){

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getDisplayAllemployee().subscribe({
      next: data => {
       
  debugger;
       this.Allemployee = data.item1;
  
  
      },
      });
  }

  geteGovDivisionMaster(){

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.geteGovDivisionMaster().subscribe({
      next: data => {
       
  debugger;
       this.eGovDivisionMaster = data.item1;
  
  
      },
      });
  }




  getround(){
    this.placementService.getRounds().subscribe({
      next: data => {
       
       this.roundData = data.item1;


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
  onchangeAgreementTypes(event:any){
    debugger;
    // key: "Agreement",
    // value: "Service",
    let a = this.AgreementType2.filter((x: { key: any; })=>x.key==event);
    this.AgreementTypeDisplay2 = a;
    debugger;

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
  this.getDriveStream(this.selection,this.selectedBatchyear,this.selectedStream);
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
onchangeCheck($event:any){
  
  if($event.target.checked){
    (<HTMLInputElement>document.getElementById('chkFinalSubmit'+$event.target.defaultValue)).style.display='block';
  }
  else{
    (<HTMLInputElement>document.getElementById('chkFinalSubmit'+$event.target.defaultValue)).style.display='none';
  }
}
getDriveStream(companyId:any,batchYear:any,stream:any){
  this.myArray=[];
  this.placementService.getDriveByStreamBatchyears(batchYear,companyId,stream).subscribe({
    next: data => {
     
     this.streamData = data.item1;
     const key = 'driveId';
     const arrayUniqueByKey = [...new Map(this.streamData.map(item =>
      [item[key], item])).values()];

      let dids = '';
      for(let j=0; j < arrayUniqueByKey.length; j++){
          dids += arrayUniqueByKey[j]['driveId'] + ',';
      }
     const checkData = {
      DriveId:dids,
      BatchYear:this.selectedBatchyear,
      CompanyId:this.selection,
      Stream:this.selectedStream
     }
     this.placementService.getSoftSkillData(checkData).subscribe({
      next: data => {
       
       this.dExitDataAll = data.item1;
       let dExistData = data.item1;
       for(let pp=0;pp<dExistData.length; pp++){
        (<HTMLInputElement>document.getElementById('chk'+dExistData[pp]['driveId'])).style.display='none';
        if(dExistData[pp]['finalSubmit'] == true){
        (<HTMLInputElement>document.getElementById('dvDriveData'+dExistData[pp]['driveId'])).innerHTML='<span style="color:red;text-align:center;">Above Drive Round Data Already Final Submitted !</span>';
        (<HTMLInputElement>document.getElementById('chk'+dExistData[pp]['driveId'])).style.display='none';
        }
        
        //this.myArray.findIndex(x => x.driveId ===driveId);
        let aa =  this.streamData.findIndex(x=>x.driveId==dExistData[pp].driveId)
        this.streamData[aa].showDetail = true;
       }
       for(let p=0;p<dExistData.length; p++){
        let bb = 0;
        // if(dExistData[p].totalEligible == 'NA'){
        //       bb=0;
        // }
        // else{
        //   bb=1;
        // }


       

        this.placementService.getDriveAttendanceDetails(dExistData[p].driveId,dExistData[p].roundId).subscribe({
          next: dataAtt => {
      
            if(dataAtt.item1.length == 0){
              this.isAvailable=0;
              this.myArray.push({"roundData":this.isAvailable,"driveId":dExistData[p].driveId,"stream":dExistData[p].stream, "value":dExistData[p].roundId,"roundname":dExistData[p].roundName,"roundid":dExistData[p].roundId});
            }
            else{
              this.isAvailable=1;
              this.myArray.push({"roundData":this.isAvailable,"driveId":dExistData[p].driveId,"stream":dExistData[p].stream, "value":dExistData[p].roundId,"roundname":dExistData[p].roundName,"roundid":dExistData[p].roundId});
            }

          
          
            for(let i=0; i < dataAtt.item1.length; i++){
              let f = this.driveAttendance.filter(x=> x['roundId']==dExistData[p].roundId && x['driveId']== dExistData[p].driveId);
              if(f.length ==0){
                
                 this.driveAttendance.push(dataAtt.item1[i]);
              }
                 }
                //  this.myArray.push({"roundData":this.isAvailable,"driveId":driveId,"stream":aa[0].stream, "value":this.selectedRoundData,"roundname":dtaNew[0]['parametername'],"roundid":dtaNew[0]['parameterid']});
               // this.myArray.push({"roundData":this.isAvailable,"driveId":dExistData[p].driveId,"stream":dExistData[p].stream, "value":dExistData[p].roundId,"roundname":dExistData[p].roundName,"roundid":dExistData[p].roundId});
      
          },
        });

       
        
       }
       setTimeout(() => {

          
          this.alfterTimerData();

          // if(thi)
        

          
      }, 1000);
      },
      });

    },
    });
}


alfterTimerData(){
  for(let i=0 ; i < this.myArray.length; i++){
  //  let checkdataExist = this.myArray.filter(x=>x.driveId == dExistData[p].driveId && x.value==dExistData[p].roundId);
  let ddd = this.dExitDataAll.filter(x=>x['driveId']==this.myArray[i]['driveId'] && x['roundId']==this.myArray[i]['value']);
      if(this.myArray[i]['roundData'] == false){

        
    (<HTMLInputElement>document.getElementById('txtEligible'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value = ddd[0]['totalEligible'];
    (<HTMLInputElement>document.getElementById('txtTotalRegistered'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['totalRegistered'];
    (<HTMLInputElement>document.getElementById('txtTotalPresent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value=ddd[0]['totalPresent'];
    (<HTMLInputElement>document.getElementById('txtTotalSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['totalSelected'];
    (<HTMLInputElement>document.getElementById('txtTotalAbsent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['totalAbsent'];
    (<HTMLInputElement>document.getElementById('txtTotalNotSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['totalNotSelected'];
    (<HTMLInputElement>document.getElementById('txtTotalLeft'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['totalLeft'];

    // (<HTMLInputElement>document.getElementById('txtEligible'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalRegistered'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalPresent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalAbsent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalNotSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
    // (<HTMLInputElement>document.getElementById('txtTotalLeft'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;




      }
     
    
    (<HTMLInputElement>document.getElementById('CompanyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value = ddd[0]['companyFeedback'];
    (<HTMLInputElement>document.getElementById('FacultyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value =ddd[0]['facultyFeedback'];
    (<HTMLInputElement>document.getElementById('Feedback'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).value= ddd[0]['feedback'];
      

    // (<HTMLInputElement>document.getElementById('CompanyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = ddd[0]['companyFeedback']==''?false:true;
    // (<HTMLInputElement>document.getElementById('FacultyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled =  ddd[0]['facultyFeedback']==''?false:true;
    // (<HTMLInputElement>document.getElementById('Feedback'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled =  ddd[0]['feedback']==''?false:true;
      
  }
}
  addCreds(driveId:any){
    
    let aaaaa = this.selectedRoundData;
    this.isAvailable=0;
    let aa = this.streamData.filter(x=>x['driveId']==driveId);
    if(aa.length > 0){


    let aa1 = this.myArray.filter(x=>x['driveId']==driveId);
if(aa1.length == 0){
  let dtaNew = this.roundData.filter(x=>x.parameterid == this.selectedRoundData);
  //let dataAtt = this.getAttendance(driveId,this.selectedRoundData);

  this.placementService.getDriveAttendanceDetails(driveId,this.selectedRoundData).subscribe({
    next: dataAtt => {

      if(dataAtt.item1.length == 0){
        this.isAvailable=0;
      }
      else{
        this.isAvailable=1;
      }

      for(let i=0; i < dataAtt.item1.length; i++){
        let f = this.driveAttendance.filter(x=> x['roundId']==this.selectedRoundData && x['driveId']== driveId);
        if(f.length ==0){

           this.driveAttendance.push(dataAtt.item1[i]);
        }
           }
           this.myArray.push({"roundData":this.isAvailable,"driveId":driveId,"stream":aa[0].stream, "value":this.selectedRoundData,"roundname":dtaNew[0]['parametername'],"roundid":dtaNew[0]['parameterid']});

    },
  });




}
else{

  let indexFound = this.streamData.filter(x => x.driveId ===driveId && x.value ===this.selectedRoundData);
  if(indexFound.length == 0){
    let dtaNew = this.roundData.filter(x=>x.parameterid == this.selectedRoundData);
    this.placementService.getDriveAttendanceDetails(driveId,this.selectedRoundData).subscribe({
      next: dataAtt => {

        if(dataAtt.item1.length == 0){
          this.isAvailable=0;
        }
        else{
          this.isAvailable=1;
        }

        for(let i=0; i < dataAtt.item1.length; i++){
          let f = this.driveAttendance.filter(x=> x['roundId']==this.selectedRoundData && x['driveId']== driveId);
          if(f.length ==0){

             this.driveAttendance.push(dataAtt.item1[i]);
          }
             }
    this.myArray.push({"roundData":this.isAvailable,"driveId":driveId,"stream":aa[0].stream, "value":this.selectedRoundData,"roundname":dtaNew[0]['parametername'],"roundid":dtaNew[0]['parameterid']});


      },
    });

  }
//  this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])+1


}
    }

}

getAttendance(driveId:any,roundId:any):any{
  return this.placementService.getDriveAttendanceDetails(driveId,roundId).subscribe({
    next: data => {
     
return data


    },
    });
}

  removeCreds(driveId:any){
    let aa = this.streamData.filter(x=>x['driveId']==driveId);
    if(aa.length > 0){
      //let aa1 = this.myArray.filter(x=>x['driveId']==driveId);
      let lastElement = this.myArray.length - 1;
      let dd = [];
      for(let i =0; i < this.myArray.length; i++){
        if(i != lastElement){
        dd.push(this.myArray[i]);
        }
      }
      this.myArray = dd;

      //let indexFound = this.myArray.findIndex(x => x.driveId ===driveId);
      //this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])-1;
     // this.myArray.splice( lastElement, 1 );

    }

  }

  onSubmit1(){
    
    let aa = this.myArray;
    const key = 'driveId';
    this.responses = [];
const arrayUniqueByKey = [...new Map(this.myArray.map(item =>
  [item[key], item])).values()];
    // this.responses.push
    

    for(let i=0; i < arrayUniqueByKey.length; i++){
        let dId = arrayUniqueByKey[i]['driveId'];
         const denominations =
        {batchYear:this.selectedBatchyear,companyId:this.selection,stream:this.selectedStream,driveId:dId,placementSoftSkillRequestDetail:[{}]};

        // this.results.batchYear = this.selectedBatchyear;
        // this.results.companyId = this.selection;
        // this.results.stream = this.selectedStream;
        // this.results.driveId = dId;

        let filterDriveRecord = this.myArray.filter(y=>y['driveId']==dId);
        denominations.placementSoftSkillRequestDetail = [];
        denominations.stream=filterDriveRecord[0].stream;
        for(let z=0; z<filterDriveRecord.length; z++){


          // this.details.companyRemarks = (<HTMLInputElement>document.getElementById('CompanyRemarks'+filterDriveRecord[z]['roundid'])).value;
          // this.details.facultyRemarks = (<HTMLInputElement>document.getElementById('FacultyRemarks'+filterDriveRecord[z]['roundid'])).value;
          // this.details.feedback = (<HTMLInputElement>document.getElementById('Feedback'+filterDriveRecord[z]['roundid'])).value;
          // this.details.roundId = filterDriveRecord[z]['roundid'];
          if(filterDriveRecord[z]['roundData'] == '0')
          {


            denominations.placementSoftSkillRequestDetail.push({
              companyRemarks:(<HTMLInputElement>document.getElementById('CompanyRemarks'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              facultyRemarks:(<HTMLInputElement>document.getElementById('FacultyRemarks'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              feedback:(<HTMLInputElement>document.getElementById('Feedback'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              roundId:filterDriveRecord[z]['roundid'],
              totalEligible :(<HTMLInputElement>document.getElementById('txtEligible'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalRegistered :(<HTMLInputElement>document.getElementById('txtTotalRegistered'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalPresent :(<HTMLInputElement>document.getElementById('txtTotalPresent'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalSelected:(<HTMLInputElement>document.getElementById('txtTotalSelected'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalAbsent :(<HTMLInputElement>document.getElementById('txtTotalAbsent'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalNotSelected :(<HTMLInputElement>document.getElementById('txtTotalNotSelected'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              totalLeft :(<HTMLInputElement>document.getElementById('txtTotalLeft'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
            });
            //this.results.placementSoftSkillRequestDetail.push(denominationsData);

            //this.details.totalEligible =(<HTMLInputElement>document.getElementById('txtEligible'+filterDriveRecord[z]['roundid'])).value;
           // this.details.totalRegistered =(<HTMLInputElement>document.getElementById('txtTotalRegistered'+filterDriveRecord[z]['roundid'])).value;
            // this.details.totalPresent =(<HTMLInputElement>document.getElementById('txtTotalPresent'+filterDriveRecord[z]['roundid'])).value;
            // this.details.totalSelected =(<HTMLInputElement>document.getElementById('txtTotalSelected'+filterDriveRecord[z]['roundid'])).value;
            // this.details.totalAbsent =(<HTMLInputElement>document.getElementById('txtTotalAbsent'+filterDriveRecord[z]['roundid'])).value;
            // this.details.totalNotSelected =(<HTMLInputElement>document.getElementById('txtTotalNotSelected'+filterDriveRecord[z]['roundid'])).value;
            // this.details.totalLeft =(<HTMLInputElement>document.getElementById('txtTotalLeft'+filterDriveRecord[z]['roundid'])).value;
          }
          else{
            denominations.placementSoftSkillRequestDetail.push({
              companyRemarks:(<HTMLInputElement>document.getElementById('CompanyRemarks'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              facultyRemarks:(<HTMLInputElement>document.getElementById('FacultyRemarks'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              feedback:(<HTMLInputElement>document.getElementById('Feedback'+filterDriveRecord[z]['driveId']+filterDriveRecord[z]['roundid'])).value,
              roundId:filterDriveRecord[z]['roundid'],
              totalEligible :'NA',
              totalRegistered :'NA',
              totalPresent :'NA',
              totalSelected:'NA',
              totalAbsent :'NA',
              totalNotSelected :'NA',
              totalLeft :'NA',
            });
          }
          //this.results.placementSoftSkillRequestDetail.push(this.details);

        }
        this.responses.push(denominations);

    }
    
    let a = this.responses;
    console.log(this.responses);
    
    this.placementService.addSoftSkillData(this.responses).subscribe({
      next: data => {
       
       this.ngSelectComponentStream.handleClearClick();
       this.ngSelectComponent.handleClearClick();
       this.batchYearCompanyData = [];
       this.batchYearStreamData = [];
       this.streamData = [];
       this.myArray=[];
       this.selectedBatchyear = null;
       swal.fire(

        {title: 'Placement Drive Feedback', text: 'Data Saved Successfully !', icon: 'success'}

        )

      },
     error:res=>{
      swal.fire(

        {title: 'Placement Drive Feedback', text: 'SOmething wring try again later !', icon: 'error'}

        )
     },
      });
    //console.warn(JSON.stringify(this.responses));

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

  getDriveData(driveId:any){
    
    this.staticArray = [];
    if(this.myArray.length > 0){
      this.staticArray =  this.myArray.filter(x=>x['driveId']==driveId);
    // if(a.length > 0){
    // for(let i=0; i < a[0]['value']; i++){
    //   this.staticArray.push(1);
    // }
  }

    return this.staticArray;
  }


  getRoundDriveData(driveId:any,roundId:any){
    this.staticArray = [];
    if(this.driveAttendance.length > 0){
      return   this.driveAttendance.filter(x=>x['roundId']==roundId  && x['driveId']==driveId);
    // if(a.length > 0){
    // for(let i=0; i < a[0]['value']; i++){
    //   this.staticArray.push(1);
    // }
  }
  else{
return [];
  }


  }

}
