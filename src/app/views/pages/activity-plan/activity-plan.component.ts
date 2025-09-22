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
@Component({
  selector: 'app-activity-plan',
  templateUrl: './activity-plan.component.html',
  styleUrls: ['./activity-plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class AgreementActivityPlanComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  TableData: any = [];
  Arr = Array;
  TableDataCreatedBy: any = [];
  agrrentmentShowing: boolean = false;
  viewdescription: any = '';
  selectCollabTypeName: any = '';
  selectedSchoolDiv: any = null;
  simpleItems: any = [];
  AreaofCollaboration: any = [];
  commercialCountPage: any = [];
  AgreementType: any = [];
  enterMouName: any = '';
  isCommercialShowing: any = 0;
  isCommercialChecked: any = '';
  //notingSheetRefNo:any='';
  FileNumber: any = '';
  isInputDisabled: any = false;
  selectCollabType: any = '';
  selectCollabSubType: any = '';
  //selectResponsible:any='';
  ActivityResponsiblePerson: any = '';
  Internalresourcepersons: any = '';
  AgreementType2: any = [];
  MOUType: any = [];
  AgreementTypeDisplay2: any = [];
  selectedEmmployeeResponsible: any = '';
  selectedEmmployeeResponsiblePlannedBy: any = '';
  Activity: any = [];
  SchoolsInvolved: any = [];
  selectedAgreementType: any = '';
  selectedAgreementSubType: any = '';
  // Aggrement Start

  session: any = [];
  metricbysessionid: any = [];
  ActivityByAoC: any = [];
  SchoolsInvolved_: any = [];
  DivisionsInvolved_: any = [];
  Allemployee: any = [];
  AllDepartmentemployee: any = [];
  eGovDivisionMaster: any = [];

  Type: any = [];
  commercialAmount: any = '';
  commercialAmountRemarks: any = '';
  ddlMoUName: any = [];
  ddlMoUNameDetails: any = [];
  roundDataBackUp: any[] = [];
  ddlMoUName_ID: any = ''
  ActivityA: any = '';
  SessionA: any = 'Select Session'
  MetricDesc: any = ''
  OrganizationName: any = ''
  ActivityType: any = ''
  ActivityDescription: any = ''
  ActivityDescription2: any = ''
  NoofActivities: any = ''
  Students: any = ''
  Faculty: any = ''
  Community: any = ''
  Email: any = ''
  isShowingUsers: any = false;
  //Website:any=''
  //ContactPerson:any=''
  //Designation:any=''
  //ContactNo:any=''
  //Email:any=''
  //selectedSPOC:any=''
  //OrganizationCategory:any=''
  ActivityStatus: any = ''
  PlannedDate: any = ''
  //MOUTimePeriod:any=''
  //MOUClassification:any=''
  //MOUTypeA:any=''
  //CommercialInvolved:any=''
  //SchoolsInvolvedA:any=''
  //DivisionsInvolvedA:any=''
  //AreaofCollaborationA:any=''
  //ActivityA:any=''
  //Aggrement END
  ExternalResourcesCount: any = 0;
  ExternalResourcesRows: any[] = [];
  commercialRows: any = 1;
  form: FormGroup;
  myArray: any[] = [];
  driveAttendance: any[] = [];
  staticArray: any = [];
  getSelectedMOU: any = [];
  batchYearData: any = [];
  batchYearCompanyData: any = [];
  batchYearStreamData: any = [];
  streamData: any[] = [];
  selectedStream: any = '';
  dExitDataAll: any[] = [];
  FileData: File;
  selectedBatchyear: any = null;
  roundData: any[] = [];
  selectedRoundData: any = null;
  selectedStreams: any = null;
  selection: any = '';
  selectedMetric: any = '';
  isAvailable: Number = 0;
  isButtonShwoing: boolean = false;
  responses: any[] = [];
  results: RESULT = {
    batchYear: 0,
    companyId: 0,
    driveId: 0,
    stream: '',
    placementSoftSkillRequestDetail: []
  };
  showApprovalMou: any = false;
  details: Details = {
    companyRemarks: '',
    facultyRemarks: '',
    feedback: '',
    roundId: 0,
    totalAbsent: '',
    totalEligible: '',
    totalLeft: '',
    totalNotSelected: '',
    totalPresent: '',
    totalRegistered: '',
    totalSelected: ''
  };
  @ViewChild('userPhoto') userPhoto: ElementRef;
  //'MoU <span class="themeClr" >Dashboard</span>'
  constructor(private Agreement: AgreementEntryService,
    private datePipe: DatePipe,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private route: ActivatedRoute, private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private placementService: PlacementService,) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  rows = [
    { driveId: 1, desc: "foo", showDetail: false },
    { driveId: 2, desc: "bar", showDetail: false },
  ]
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'MOU/Agreement <span class="themeClr" >Punching</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];
    //   const dataTable = new DataTable("#dataTableExample");


    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }

    //   this.AreaofCollaboration = ['Academics', 'Admission','Events','Health','Industry','Infrastructure','Research and Development','Vendor/Contractor'];
    //  this.Activity = ['Admission Process Automation','Collaborative Online Intercultural Learning (COIL)','Community Outreach Training','Workshops','Student exchange'];
    //this.SchoolsInvolved=['School of Law','School of Mechanical Engineering','School of Polytechnic']
    this.Type = ['MOU', 'Agreement', 'License Deed', 'LoI/Term Sheet', 'Indemnity Bond', 'Affidavit'];


    this.AgreementType2 = [
      {
        key: "Agreement",
        value: "Service",
      },
      {
        key: "Agreement",
        value: "Programme",
      },
      {
        key: "Agreement",
        value: "Non-Disclosure",
      },
      {
        key: "Agreement",
        value: "Facilities/Procurement",
      },
      {
        key: "Agreement",
        value: "Maintenance",
      },
      {
        key: "Agreement",
        value: "Network Connection",
      },
      {
        key: "Agreement",
        value: "ATM/Bank",
      },
      {
        key: "Agreement",
        value: "Mobile Tower",
      },
      {
        key: "Agreement",
        value: "Publisher",
      },
      {
        key: "Agreement",
        value: "Waste Management",
      },
      {
        key: "MOU",
        value: "Academics",
      },
      {
        key: "MOU",
        value: "Admission",
      },
      {
        key: "MOU",
        value: "Events",
      },
      {
        key: "MOU",
        value: "Health",
      },
      {
        key: "MOU",
        value: "Industry",
      },
      {
        key: "MOU",
        value: "Infrastructure",
      },
      {
        key: "MOU",
        value: "Placements",
      },
      {
        key: "MOU",
        value: "Research and Development",
      },
    ];


  }

  panels = ['First', 'Second', 'Third'];

  selectedDate: NgbDateStruct;
  MoUStartDate: NgbDateStruct;
  MoUEndDate: NgbDateStruct;
  ActivityStartDate: NgbDateStruct;
  ActivityEndDate: NgbDateStruct;
  NewActivityStartDate: NgbDateStruct;
  NewActivityEndDate: NgbDateStruct;

  profileForm = new FormGroup({
    BatchYear: new FormControl(''),
    Company: new FormControl(''),
    //Feedback: new FormControl(''),

  });


  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }



  // changeCollab(event:any){

  // let aa = event;
  // console.log(JSON.stringify(aa));
  // let df = '';
  // for(let i=0; i < event.length; i++){
  //   df += event[i]['areaId'] + ','
  // }
  // this.AreaofCollaborationA = df;
  // this.getActivityByAoC(aa);


  // }



  // changeSchoolInvolved(event:any){

  //   let df = '';
  // for(let i=0; i < event.length; i++){
  //   df += event[i]['id'] + ','
  // }
  // this.SchoolsInvolvedA = df;
  // }

  changeExternal() {
    debugger;
    this.ExternalResourcesRows = [];
    if (this.ExternalResourcesCount <= 20) {
      for (let i = 0; i < this.ExternalResourcesCount; i++) {
        let a = { number: '1' };
        this.ExternalResourcesRows.push(a);
      }
    }
    else {
      swal.fire('Max Limit Crossed', 'Keep Your Limit Less Than 20')
      this.ExternalResourcesCount = '';
    }




  }



  // VerifyData(){
  //   if(this.notingSheetRefNo != ''){
  //     this.isInputDisabled = true;
  //     const checkData1 = {
  //       RefNo:this.notingSheetRefNo

  //      }

  //      this.Agreement.verifyMouData(checkData1).subscribe({
  //       next: data => {

  //         this.isInputDisabled = false;
  //         if(data.item1[0]['status'] == -1){
  //         swal.fire(

  //           {title: 'Noting Sheet', text: data.item1[0]['message'], icon: 'error'}

  //           );
  //         }
  //         else
  //         {
  //           this.getVerifyNotingSheetData(data.item1[0]['message']);


  //         }
  //       },
  //     });
  //   }

  // }

  viewdesc(val: any) {
    this.viewdescription = val;
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {

      console.log("Modal closed" + result);
    }).catch((res) => { });

  }
  addCommercialRow() {
    this.commercialRows += 1;
    //this.commercialCountPage.push(this.commercialRows);
  }

  minusCommercialRow() {
    this.commercialRows = this.commercialRows - 1;
    //this.commercialCountPage.push(this.commercialRows);
  }

  // getVerifyNotingSheetData(msg:any){



  //   const checkData1 = {
  //     RefNo:this.notingSheetRefNo

  //    }
  //   this.Agreement.getverifyMouNotingData(checkData1).subscribe({
  //     next: data => {

  //       this.TableData=data.item1;
  //       swal.fire(

  //         {title: 'Noting Sheet', text: msg, icon: 'success'}
  //         );
  //       this.showApprovalMou = true;
  //     },
  //   });
  // }

  resetNoting() {
    window.location.reload();
  }



  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        this.getMoUByloginName('25899');

      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }
  getAreaCollab() {

    this.Agreement.getCollabArea().subscribe({
      next: data => {

        this.AreaofCollaboration = data.item1;

        this.getSchoolsInvolved('S');



        //this.getround();

      },
      error: err => {
        this.getSchoolsInvolved('S');
      }
    });
  }

  onSessionChange($event: any) {
    // console.log($event.sessionId);
    let sessionid = $event.sessionId
    this.SessionA = sessionid;
    this.getMetricBySessionID(sessionid);

  }

  onddlMoUName($event: any) {

    console.log($event.id);
    if ($event != undefined) {
      if ($event != '') {
        this.ddlMoUName_ID = $event.id;
        this.getMoUById(this.ddlMoUName_ID);
      }
    }
  }

  getMetricBySessionID(sessionid: any) {

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getMetricBySessionID(sessionid).subscribe({
      next: data => {


        this.metricbysessionid = data.item1;


      },
    });
  }

  getActivityByAoC(AOC: any) {

    let df = '';
    for (let i = 0; i < AOC.length; i++) {
      df += AOC[i]['areaId'] + ','
    }
    const checkData = {
      area: df,

    }
    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getActivityByAoC(checkData).subscribe({
      next: data => {

        this.ActivityByAoC = data.item1;
      },
    });
  }

  getSchoolsInvolved(type: any) {


    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {

        this.SchoolsInvolved_ = data.item1;
        this.getDivisionsInvolved('D');

      },
      error: err => {
        this.getDivisionsInvolved('D');
      }
    });
  }

  getDivisionsInvolved(type: any) {


    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getSchoolsAndDivisionInvolved(type).subscribe({
      next: data => {

        this.DivisionsInvolved_ = data.item1;
        this.getDisplayAllemployee();


      },
      error: err => {
        this.getDisplayAllemployee();


      }
    });
  }

  getMoUByloginName(loginName: any) {

    this.Agreement.getMoUByloginNameAll().subscribe({
      next: data => {


        this.ddlMoUName = data.item1;

        this.getDisplayAllemployee();
      },
    });
  }
  changeActivityNew(event: any) {
    debugger;
    //   let df = '';
    // for(let i=0; i < event.length; i++){
    //   df += event[i]['areaId'] + ','
    // }
    this.ActivityA = event['areaId'];
  }

  getMoUById(id: any) {

    this.Agreement.getMoUDetailById(id).subscribe({
      next: data => {
        const newTHis = this;
        debugger;

        this.ddlMoUNameDetails = data.item1;
        this.selectCollabType = this.ddlMoUNameDetails[0]['type'];


        let ddd = this.ddlMoUNameDetails[0]['collabId'].split(',');
        //let  commericialInvolvedData = this.roundDataBackUp;
        //  for(let i =0; i < ddd.length; i++){
        //   commericialInvolvedData.push({
        //   area:ddd[i],
        //  });
        // }

        let df = '';
        for (let i = 0; i < ddd.length; i++) {
          df += ddd[i] + ','
        }
        const checkData = {
          area: df,
          areaActivity: this.ddlMoUNameDetails[0]['activityId'],

        }

        this.Agreement.getActivityByAoCCollab(checkData).subscribe({
          next: data => {
            for (let j = 0; j < data.item1.length; j++) {

            }
            this.ActivityByAoC = data.item1;
          },
        });
        this.isShowingUsers = this.ddlMoUNameDetails[0]['isEligible']
        this.FileNumber = this.ddlMoUNameDetails[0]['fileNumber'];
        this.OrganizationName = this.ddlMoUNameDetails[0]['organizationName'];
        let startDate = this.datePipe.transform(this.ddlMoUNameDetails[0]['startDate'], "yyyy-MM-dd");
        // newTHis.datePipe.transform(this.ddlMoUNameDetails[0]['startDate'],"yyyy-MM-dd")?.getFullYear(),
        //       startDate.getMonth() + 1,
        //       startDate.getDate()
        const ngbDate: NgbDateStruct = {
          year: new Date(this.ddlMoUNameDetails[0]['startDate'])?.getFullYear(),
          month: new Date(this.ddlMoUNameDetails[0]['startDate'])?.getMonth() + 1,
          day: new Date(this.ddlMoUNameDetails[0]['startDate'])?.getDate(),
        }

        const ngbDate1: NgbDateStruct = {
          year: new Date(this.ddlMoUNameDetails[0]['endDate'])?.getFullYear(),
          month: new Date(this.ddlMoUNameDetails[0]['endDate'])?.getMonth() + 1,
          day: new Date(this.ddlMoUNameDetails[0]['endDate'])?.getDate(),
        }
        this.MoUStartDate = ngbDate;
        this.MoUEndDate = ngbDate1;
      },
    });
  }

  getDisplayAllemployee() {

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getDisplayAllemployee().subscribe({
      next: data => {


        this.Allemployee = data.item1;
        // this.geteGovDivisionMaster();

        this.getDisplayAllemployeeByNormailUID("");


      },
      error: err => {
        //  this.geteGovDivisionMaster();


      }
    });
  }


  getDisplayAllemployeeByNormailUID(empId: any) {

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.getDisplayAllemployeeByNormalUID(empId).subscribe({
      next: data => {


        this.AllDepartmentemployee = data.item1;
        // this.geteGovDivisionMaster();




      },
      error: err => {
        //  this.geteGovDivisionMaster();


      }
    });
  }


  geteGovDivisionMaster() {

    //this.ngSelectComponentStream.handleClearClick();
    //this.ngSelectComponent.handleClearClick();
    //this.streamData = [];
    this.Agreement.geteGovDivisionMaster().subscribe({
      next: data => {


        this.eGovDivisionMaster = data.item1;
        this.getMoUByloginName(28289);

        // this.getDisplayAllemployee();

      },
      error: err => {
        this.getMoUByloginName(28289);


      }
    });
  }




  getround() {
    this.placementService.getRounds().subscribe({
      next: data => {

        this.roundData = data.item1;


      },
    });
  }

  changeLeagueOwner($event: any) {

    this.batchYearCompanyData = [];
    this.batchYearStreamData = [];

    if ($event.batchYear != '') {

      this.selectedBatchyear = $event.batchYear;
      this.getCompany($event.batchYear);
    }

  }
  changeCompany(event: any) {

    if (event != undefined) {
      if (event.metricId != '') {

        this.selectedMetric = event.metricId;
        //  this.getStream(event.companyId,this.selectedBatchyear);
      }
    }
  }

  changeSchoolDivision(event: any) {

    if (event != undefined) {
      if (event.id != '') {

        this.selectedSchoolDiv = event.id;
        //  this.getStream(event.companyId,this.selectedBatchyear);
      }
    }
  }

  changeCompanyStream(event: any) {

    //selectedSPOC
    //   if(event != undefined){
    //  if(event.emp_code != ''){
    //   this.selectedSPOC = event.emp_code;
    //  }

    // }
  }


  onFileSelected(e: any) {

    console.log(e);
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.FileData = file;

  }
  onchangeAgreementTypes(event: any) {

    // key: "Agreement",
    // value: "Service",

    this.selectedAgreementType = event;
    let a = this.AgreementType2.filter((x: { key: any; }) => x.key == event);
    this.selectCollabTypeName = event;
    if (a.length > 0) {
      this.AgreementTypeDisplay2 = a;
      this.agrrentmentShowing = true;
    }
    else {
      this.agrrentmentShowing = false;

    }
    if (event === 'Agreement') {

    }
    else {
    }


  }
  changeResponsible(event: any) {

    this.selectedEmmployeeResponsible = event.emp_code;
  }

  changeResponsiblePlanned(event: any) {

    this.selectedEmmployeeResponsiblePlannedBy = event.emp_code;
    this.getDisplayAllemployeeByNormailUID(event.emp_code);
  }

  changeSubType(event: any) {

    this.selectedAgreementSubType = event.value;
  }

  getCompany(batchYear: any) {

    this.ngSelectComponentStream.handleClearClick();
    this.ngSelectComponent.handleClearClick();
    this.streamData = [];
    this.placementService.getCompanyByBatchyears(batchYear).subscribe({
      next: data => {


        this.batchYearCompanyData = data.item1;


      },
    });
  }

  getStream(companyId: any, batchYear: any) {
    this.ngSelectComponentStream.handleClearClick();
    this.placementService.getStreamByBatchyears(batchYear, companyId).subscribe({
      next: data => {

        this.batchYearStreamData = data.item1;


      },
    });
  }
  AddMouApprovalData() {
    debugger
    this.isButtonShwoing = true;
    if (this.ddlMoUName_ID === '') {
      swal.fire(

        { title: 'MOU Agreement Planned Activity', text: 'Please select mou name !', icon: 'error' }

      );
      this.isButtonShwoing = false;
    }
    else if (this.isShowingUsers === true) {
      if (this.selectedEmmployeeResponsiblePlannedBy === '') {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please select Planned Activity User !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else {
        if (this.ActivityA == '') {
          swal.fire(

            { title: 'MOU Agreement Planned Activity', text: 'Please select Mou Activity Type !', icon: 'error' }

          );
          this.isButtonShwoing = false;
        }
        else if (this.ActivityStartDate === undefined) {
          swal.fire(

            { title: 'MOU Agreement Planned Activity', text: 'Please select Start Date !', icon: 'error' }

          );
          this.isButtonShwoing = false;
        }
        else if (this.ActivityEndDate === undefined) {
          swal.fire(

            { title: 'MOU Agreement Planned Activity', text: 'Please select End Date !', icon: 'error' }

          );
          this.isButtonShwoing = false;
        }
        else if (this.selectedEmmployeeResponsible === '') {
          swal.fire(

            { title: 'MOU Agreement Planned Activity', text: 'Please select Responsible Person !', icon: 'error' }

          );
          this.isButtonShwoing = false;
        }
        else if (this.ActivityDescription2 === '') {
          swal.fire(

            { title: 'MOU Agreement Planned Activity', text: 'Please enter planned activity description !', icon: 'error' }

          );
          this.isButtonShwoing = false;
        }
        else {
          const denominations =
          {

            MasterId: this.ddlMoUName_ID,
            ActivityId: this.ActivityA,
            StartDate: `${this.ActivityStartDate.year}-${this.ActivityStartDate.month}-${this.ActivityStartDate.day}`,
            EndDate: `${this.ActivityEndDate.year}-${this.ActivityEndDate.month}-${this.ActivityEndDate.day}`,
            ResponsiblePerson: this.selectedEmmployeeResponsible,
            Descriptions: this.ActivityDescription2,
            CreatedBy: this.selectedEmmployeeResponsiblePlannedBy.toString()
          }

          this.responses = [];
          this.responses.push(denominations);

          this.Agreement.addMouActivityPlannedEntry(this.responses[0]).subscribe({
            next: data => {
              swal.fire({ title: 'MOU Activity Planned ', text: 'Mou Agreeement Planned Activity Successfully  !', icon: 'success' }).then(function () {
                window.location.reload();
              });
              //  this.resetNoting()
            },
          });

        }
      }
    }
    else {

      if (this.ActivityA == '') {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please select Mou Activity Type !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else if (this.ActivityStartDate === undefined) {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please select Start Date !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else if (this.ActivityEndDate === undefined) {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please select End Date !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else if (this.selectedEmmployeeResponsible === '') {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please select Responsible Person !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else if (this.ActivityDescription2 === '') {
        swal.fire(

          { title: 'MOU Agreement Planned Activity', text: 'Please enter planned activity description !', icon: 'error' }

        );
        this.isButtonShwoing = false;
      }
      else {
        const denominations =
        {

          MasterId: this.ddlMoUName_ID,
          ActivityId: this.ActivityA,
          StartDate: `${this.ActivityStartDate.year}-${this.ActivityStartDate.month}-${this.ActivityStartDate.day}`,
          EndDate: `${this.ActivityEndDate.year}-${this.ActivityEndDate.month}-${this.ActivityEndDate.day}`,
          ResponsiblePerson: this.selectedEmmployeeResponsible,
          Descriptions: this.ActivityDescription2,
          CreatedBy: ''
        }

        this.responses = [];
        this.responses.push(denominations);

        this.Agreement.addMouActivityPlannedEntry(this.responses[0]).subscribe({
          next: data => {
            swal.fire({ title: 'MOU Activity Planned ', text: 'Mou Agreeement Planned Activity Successfully  !', icon: 'success' }).then(function () {
              window.location.reload();
            });
            //this.resetNoting()
          },
        });

      }


    }


  }

  AddMouEntryData1(user: any) {
    // console.log(user)
  }

  MouActivityData() {

  }
  // AddMouEntryData(){

  //   let fMoUID = this.ddlMoUName_ID;
  //   let fSession =this.SessionA;
  //   let fMetricDesc = this.selectedMetric;

  //    let fSigningDate =  this.SigningDate; 
  //  let fStartDate = this.StartDate;

  //  let fEndDate= this.EndDate;

  //  let fOrganizationName = this.OrganizationName
  //  let fOrganizationCategory=this.OrganizationCategory

  //  let fWebsite = this.Website

  //  let fContactPerson = this.ContactPerson

  //  let fDesignation= this.Designation

  //  let fContactNo = this.ContactNo

  //  let fEmail = this.Email

  //  let fselectedSchoolDiv = this.selectedSchoolDiv

  //  let fselectedSPOC=this.selectedSPOC


  //  let fMOUTimePeriod=this.MOUTimePeriod

  //  let fMOUClassification=this.MOUClassification
  //  let fMOUTypeA=this.MOUTypeA


  //  let fCommercialInvolved=this.isCommercialShowing

  //  let fAreaofCollaborationA=this.AreaofCollaborationA
  //  let fActivityA=this.ActivityA

  //  let fSchoolsInvolvedA=this.SchoolsInvolvedA
  //  let fDivisionsInvolvedA=this.DivisionsInvolvedA
  //   if(this.ddlMoUName_ID===''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select mou name !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.SessionA===''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Session !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.selectedMetric===''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Metric !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.SigningDate === undefined){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Signing Date !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.StartDate === undefined){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Start Date !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.EndDate === undefined){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select End Date !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.OrganizationName === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter Organization Name !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.OrganizationCategory === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Organization Category !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }

  //   else if(this.ContactPerson === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter organization Contact Person !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.Designation === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter organization Designation !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.ContactNo === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter organization Contact No !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.Email === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter organization Email !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.selectedSchoolDiv === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select School/Division !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.selectedSPOC === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please enter SPOC !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.MOUTimePeriod === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select MOU Time Period !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.MOUClassification === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select MOU Classification !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.MOUTypeA === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select MOU Type !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.isCommercialChecked  != 'Yes'){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Commercial Showing !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.AreaofCollaborationA === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Area of Collaboration !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.ActivityA === ''){
  //     swal.fire(

  //       {title: 'MOU Punching ', text: 'Please select Area of Collaboration Activity !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.SchoolsInvolvedA === ''){
  //     swal.fire(

  //       {title: 'MOU Punching', text: 'Please select Involved Schools!', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else if(this.DivisionsInvolvedA === ''){
  //     swal.fire(

  //       {title: 'MOU Punching ', text: 'Please Involved Divisions !', icon: 'error'}

  //       );
  //       this.isButtonShwoing = false;
  //   }
  //   else{
  // const denominations =
  // {

  //   MasterId:fMoUID,
  //   SessionId:fSession,
  //   MetricId:fMetricDesc,
  //   SigningDate:`${this.SigningDate.year}-${this.SigningDate.month}-${this.SigningDate.day}`,
  //   StartDate:`${this.StartDate.year}-${this.StartDate.month}-${this.StartDate.day}`,
  //   EndDate:`${this.EndDate.year}-${this.EndDate.month}-${this.EndDate.day}`,
  //   OrganizationName:fOrganizationName,
  //   Website:fWebsite,
  //   OrganizationContactPerson:fContactPerson,
  //   Designation:fDesignation,
  //   ContactNumber:fContactNo,
  //   Email:fEmail,
  //   DivisionSchoolId:fselectedSchoolDiv,
  //   ResponsibleSPOC:fselectedSPOC,
  //   OrganizationCategory:fOrganizationCategory,
  //   MOUTimePeriod:fMOUTimePeriod,
  //   MOUClassification:fMOUClassification,
  //   MOUType:fMOUTypeA,
  //   CommercialInvolved:fCommercialInvolved,
  //   SchoolsInvolved:fSchoolsInvolvedA,
  //   DivisionsInvolved:fDivisionsInvolvedA,
  //   AreaofCollaborationID:fAreaofCollaborationA,
  //   ActivityType:fActivityA,

  //   commericialInvolved:[{}]};
  // for(let i=0; i < this.commercialRows; i++){
  // let ind = i+1;

  // denominations.commericialInvolved.push({
  //   masterId:fMoUID,
  //   commericialAmount:(<HTMLInputElement>document.getElementById('txtCoomercialAmount'+ind)).value,
  //   commericialAmountRemarks:(<HTMLInputElement>document.getElementById('txtCoomercialAmountRemarks'+ind)).value,
  // });


  //   if(this.isCommercialShowing == true){

  //     if(denominations.commericialInvolved.length === 1){
  //       swal.fire(

  //         {title: 'MOU Punching ', text: 'Please enter commercial involved details !', icon: 'error'}

  //         );

  //     }
  //     else{

  //       //denominations.commericialInvolved.splice(0, 1 );
  //     }
  //   }
  //   else{
  //     //denominations.commericialInvolved.splice(0, 1 );
  //   }


  // }

  // this.responses = [];
  // this.responses.push(denominations);

  // this.Agreement.addMouEntry(this.responses[0]).subscribe({
  //   next: data => {
  //     swal.fire(

  //       {title: 'MOU Punching ', text: 'Mou Agreeement Punched Successfully  !', icon: 'success'}

  //       );
  //       this.resetNoting()
  //   },
  // });



  //   }




  // //   const data =  {
  // //  MoUID:fMoUID,
  // //  Session:fSession,
  // //  MetricDesc:fMetricDesc,
  // //  SigningDate:fSigningDate,
  // //  StartDate:fStartDate,
  // //  EndDate:fEndDate,
  // //  OrganizationName:fOrganizationName,
  // //  Website:fWebsite,
  // //  ContactPerson:fContactPerson,
  // //  Designation:fDesignation,
  // //  ContactNo:fContactNo,
  // //  Email:fEmail,
  // //  SelectedSchoolDiv:fselectedSchoolDiv,
  // //  selectedSPOC:fselectedSPOC,
  // //  OrganizationCategory:fOrganizationCategory,
  // //  MOUTimePeriod:fMOUTimePeriod,
  // //  MOUClassification:fMOUClassification,
  // //  MOUTypeA:fMOUTypeA,
  // //  CommercialInvolved:fCommercialInvolved,
  // //  SchoolsInvolvedA:fSchoolsInvolvedA,
  // //  DivisionsInvolvedA:fDivisionsInvolvedA,
  // //  AreaofCollaborationA:fAreaofCollaborationA,
  // //  ActivityA:fActivityA



  // //   }

  //  // console.log(data)
  // }

  onSubmit11(driveId: string, stream: string) {
    const checkData = {
      DriveId: driveId.toString(),
      BatchYear: this.selectedBatchyear,
      CompanyId: this.selection,
      Stream: stream
    }

    this.placementService.updateFinalSubmitSoftSkillData(checkData).subscribe({
      next: data => {
        if (data.item1[0]['status'] == false) {
          swal.fire(

            { title: 'Placement Drive Final Submission', text: data.item1[0]['message'], icon: 'error' }

          );

        }
        else {
          (<HTMLInputElement>document.getElementById('dvDriveData' + driveId)).style.display = 'none';
          swal.fire(
            { title: 'Placement Drive Final Submission', text: data.item1[0]['message'], icon: 'success' }

          );
          this.resetData();


        }
      },
    });
  }
  onchangeCheck($event: any) {

    if ($event.target.checked) {
      (<HTMLInputElement>document.getElementById('chkFinalSubmit' + $event.target.defaultValue)).style.display = 'block';
    }
    else {
      (<HTMLInputElement>document.getElementById('chkFinalSubmit' + $event.target.defaultValue)).style.display = 'none';
    }
  }


  changeCommercialInvolved($event: any) {
    this.isCommercialChecked = 'Yes';
    if ($event != undefined) {
      if ($event.target != undefined) {
        if ($event.target.value == 'Yes') {
          this.isCommercialShowing = true;

        }
        else {
          this.isCommercialShowing = false;
        }
      }

    }
  }

  getDriveStream(companyId: any, batchYear: any, stream: any) {
    this.myArray = [];
    this.placementService.getDriveByStreamBatchyears(batchYear, companyId, stream).subscribe({
      next: data => {

        this.streamData = data.item1;
        const key = 'driveId';
        const arrayUniqueByKey = [...new Map(this.streamData.map(item =>
          [item[key], item])).values()];

        let dids = '';
        for (let j = 0; j < arrayUniqueByKey.length; j++) {
          dids += arrayUniqueByKey[j]['driveId'] + ',';
        }
        const checkData = {
          DriveId: dids,
          BatchYear: this.selectedBatchyear,
          CompanyId: this.selection,
          Stream: this.selectedStream
        }
        this.placementService.getSoftSkillData(checkData).subscribe({
          next: data => {

            this.dExitDataAll = data.item1;
            let dExistData = data.item1;
            for (let pp = 0; pp < dExistData.length; pp++) {
              (<HTMLInputElement>document.getElementById('chk' + dExistData[pp]['driveId'])).style.display = 'none';
              if (dExistData[pp]['finalSubmit'] == true) {
                (<HTMLInputElement>document.getElementById('dvDriveData' + dExistData[pp]['driveId'])).innerHTML = '<span style="color:red;text-align:center;">Above Drive Round Data Already Final Submitted !</span>';
                (<HTMLInputElement>document.getElementById('chk' + dExistData[pp]['driveId'])).style.display = 'none';
              }

              //this.myArray.findIndex(x => x.driveId ===driveId);
              let aa = this.streamData.findIndex(x => x.driveId == dExistData[pp].driveId)
              this.streamData[aa].showDetail = true;
            }
            for (let p = 0; p < dExistData.length; p++) {
              let bb = 0;
              // if(dExistData[p].totalEligible == 'NA'){
              //       bb=0;
              // }
              // else{
              //   bb=1;
              // }




              this.placementService.getDriveAttendanceDetails(dExistData[p].driveId, dExistData[p].roundId).subscribe({
                next: dataAtt => {

                  if (dataAtt.item1.length == 0) {
                    this.isAvailable = 0;
                    this.myArray.push({ "roundData": this.isAvailable, "driveId": dExistData[p].driveId, "stream": dExistData[p].stream, "value": dExistData[p].roundId, "roundname": dExistData[p].roundName, "roundid": dExistData[p].roundId });
                  }
                  else {
                    this.isAvailable = 1;
                    this.myArray.push({ "roundData": this.isAvailable, "driveId": dExistData[p].driveId, "stream": dExistData[p].stream, "value": dExistData[p].roundId, "roundname": dExistData[p].roundName, "roundid": dExistData[p].roundId });
                  }



                  for (let i = 0; i < dataAtt.item1.length; i++) {
                    let f = this.driveAttendance.filter(x => x['roundId'] == dExistData[p].roundId && x['driveId'] == dExistData[p].driveId);
                    if (f.length == 0) {

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


  alfterTimerData() {
    for (let i = 0; i < this.myArray.length; i++) {
      //  let checkdataExist = this.myArray.filter(x=>x.driveId == dExistData[p].driveId && x.value==dExistData[p].roundId);
      let ddd = this.dExitDataAll.filter(x => x['driveId'] == this.myArray[i]['driveId'] && x['roundId'] == this.myArray[i]['value']);
      if (this.myArray[i]['roundData'] == false) {


        (<HTMLInputElement>document.getElementById('txtEligible' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalEligible'];
        (<HTMLInputElement>document.getElementById('txtTotalRegistered' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalRegistered'];
        (<HTMLInputElement>document.getElementById('txtTotalPresent' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalPresent'];
        (<HTMLInputElement>document.getElementById('txtTotalSelected' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalSelected'];
        (<HTMLInputElement>document.getElementById('txtTotalAbsent' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalAbsent'];
        (<HTMLInputElement>document.getElementById('txtTotalNotSelected' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalNotSelected'];
        (<HTMLInputElement>document.getElementById('txtTotalLeft' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['totalLeft'];

        // (<HTMLInputElement>document.getElementById('txtEligible'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalRegistered'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalPresent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalAbsent'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalNotSelected'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;
        // (<HTMLInputElement>document.getElementById('txtTotalLeft'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = true;




      }


      (<HTMLInputElement>document.getElementById('CompanyRemarks' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['companyFeedback'];
      (<HTMLInputElement>document.getElementById('FacultyRemarks' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['facultyFeedback'];
      (<HTMLInputElement>document.getElementById('Feedback' + this.myArray[i]['driveId'] + this.myArray[i]['roundid'])).value = ddd[0]['feedback'];


      // (<HTMLInputElement>document.getElementById('CompanyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled = ddd[0]['companyFeedback']==''?false:true;
      // (<HTMLInputElement>document.getElementById('FacultyRemarks'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled =  ddd[0]['facultyFeedback']==''?false:true;
      // (<HTMLInputElement>document.getElementById('Feedback'+this.myArray[i]['driveId']+this.myArray[i]['roundid'])).disabled =  ddd[0]['feedback']==''?false:true;

    }
  }
  addCreds(driveId: any) {

    let aaaaa = this.selectedRoundData;
    this.isAvailable = 0;
    let aa = this.streamData.filter(x => x['driveId'] == driveId);
    if (aa.length > 0) {


      let aa1 = this.myArray.filter(x => x['driveId'] == driveId);
      if (aa1.length == 0) {
        let dtaNew = this.roundData.filter(x => x.parameterid == this.selectedRoundData);
        //let dataAtt = this.getAttendance(driveId,this.selectedRoundData);

        this.placementService.getDriveAttendanceDetails(driveId, this.selectedRoundData).subscribe({
          next: dataAtt => {

            if (dataAtt.item1.length == 0) {
              this.isAvailable = 0;
            }
            else {
              this.isAvailable = 1;
            }

            for (let i = 0; i < dataAtt.item1.length; i++) {
              let f = this.driveAttendance.filter(x => x['roundId'] == this.selectedRoundData && x['driveId'] == driveId);
              if (f.length == 0) {

                this.driveAttendance.push(dataAtt.item1[i]);
              }
            }
            this.myArray.push({ "roundData": this.isAvailable, "driveId": driveId, "stream": aa[0].stream, "value": this.selectedRoundData, "roundname": dtaNew[0]['parametername'], "roundid": dtaNew[0]['parameterid'] });

          },
        });




      }
      else {

        let indexFound = this.streamData.filter(x => x.driveId === driveId && x.value === this.selectedRoundData);
        if (indexFound.length == 0) {
          let dtaNew = this.roundData.filter(x => x.parameterid == this.selectedRoundData);
          this.placementService.getDriveAttendanceDetails(driveId, this.selectedRoundData).subscribe({
            next: dataAtt => {

              if (dataAtt.item1.length == 0) {
                this.isAvailable = 0;
              }
              else {
                this.isAvailable = 1;
              }

              for (let i = 0; i < dataAtt.item1.length; i++) {
                let f = this.driveAttendance.filter(x => x['roundId'] == this.selectedRoundData && x['driveId'] == driveId);
                if (f.length == 0) {

                  this.driveAttendance.push(dataAtt.item1[i]);
                }
              }
              this.myArray.push({ "roundData": this.isAvailable, "driveId": driveId, "stream": aa[0].stream, "value": this.selectedRoundData, "roundname": dtaNew[0]['parametername'], "roundid": dtaNew[0]['parameterid'] });


            },
          });

        }
        //  this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])+1


      }
    }

  }

  getAttendance(driveId: any, roundId: any): any {
    return this.placementService.getDriveAttendanceDetails(driveId, roundId).subscribe({
      next: data => {

        return data


      },
    });
  }

  removeCreds(driveId: any) {
    let aa = this.streamData.filter(x => x['driveId'] == driveId);
    if (aa.length > 0) {
      //let aa1 = this.myArray.filter(x=>x['driveId']==driveId);
      let lastElement = this.myArray.length - 1;
      let dd = [];
      for (let i = 0; i < this.myArray.length; i++) {
        if (i != lastElement) {
          dd.push(this.myArray[i]);
        }
      }
      this.myArray = dd;

      //let indexFound = this.myArray.findIndex(x => x.driveId ===driveId);
      //this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])-1;
      // this.myArray.splice( lastElement, 1 );

    }

  }


  resetData() {
    this.ngSelectComponentStream.handleClearClick();
    this.ngSelectComponent.handleClearClick();
    this.batchYearCompanyData = [];
    this.batchYearStreamData = [];
    this.streamData = [];
    this.myArray = [];
    this.selectedBatchyear = null;
  }

  getDriveData(driveId: any) {

    this.staticArray = [];
    if (this.myArray.length > 0) {
      this.staticArray = this.myArray.filter(x => x['driveId'] == driveId);
      // if(a.length > 0){
      // for(let i=0; i < a[0]['value']; i++){
      //   this.staticArray.push(1);
      // }
    }

    return this.staticArray;
  }


  getRoundDriveData(driveId: any, roundId: any) {
    this.staticArray = [];
    if (this.driveAttendance.length > 0) {
      return this.driveAttendance.filter(x => x['roundId'] == roundId && x['driveId'] == driveId);
      // if(a.length > 0){
      // for(let i=0; i < a[0]['value']; i++){
      //   this.staticArray.push(1);
      // }
    }
    else {
      return [];
    }


  }

}
