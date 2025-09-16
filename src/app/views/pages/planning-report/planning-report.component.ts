import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
// import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {NgbRatingConfig} from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject, debounceTime, fromEvent, map } from 'rxjs';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-planning-report',
  templateUrl: './planning-report.component.html',
  styleUrls: ['./planning-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class PlanningReportComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  // @ViewChild('ngDatatable') ngDataTable: DataTable;
  //dtOptions: any = {};
  currentRate:any=0;
  areaFeedback:string='';
  @ViewChild('basicModal') basicModal: TemplateRef<Element>;
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;  
  form: FormGroup;
  showExcelButton:Number=0;
  isLoadderBtn:number=1;
  myArray: any[]=[];
  currentRating:Number=5;
  headHtmlData:any[]=[];
  linkedheadHtmlData:any[]=[];
  htmlData:any[]=[];
  linkedHtmlData:any[]=[];
  driveAttendance: any[]=[];
  staticArray:any=[];
  batchYearData: any=[];
  batchYearCompanyData: any=[];
  batchYearStreamData: any=[];
  streamData: any[]=[];
  selectedStream:any='';
  selectedQueryTypeArray:any;
  dExitDataAll:any[]=[];
  selectedBatchyear:any = null;
  roundData:any[] = [];
  selectedRoundData:any = null;
  selectedStreams:any = null;
  selection:any='';
  selectedReportTypeName:any='';
  isAvailable:Number = 0;
  responses: any[]=[];
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtoptions: DataTables.Settings = {};
  dtTrigger:Subject<any>=new Subject<any>();
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
  columns:any;
  loadingIndicator = false;
  reorderable = true;
  ColumnMode = ColumnMode;
  basicModalCloseResult: string = '';
  @ViewChild('search', { static: false }) search: any;
  temp:any[]=[];
  // @ViewChild(DataTable, { static: false }) table: DataTable;
  //'MoU <span class="themeClr" >Dashboard</span>'
  constructor(private fb: FormBuilder,private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private modalService: NgbModal,
    config: NgbRatingConfig,
    private changeDetectorRefs: ChangeDetectorRef,
    private deviceService: DeviceDetectorService,
    private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private placementService: PlacementService,) {
     
    
      config.max = 5;
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  rows = [
     {driveId: 1, desc: "foo", showDetail: false},
     {driveId: 2, desc: "bar", showDetail: false},
  ]

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  ngOnInit(): void {



    this.dtoptions = {
      //--- Commented lines are for show pagination
      pagingType: 'full_numbers',
      searching:true,
      paging:true,
      
      pageLength: 5,
      lengthMenu : [5, 10, 25],
      processing: true,
      lengthChange:false,
      language:{
        searchPlaceholder:'Search...'
      },
     
    };
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'OBP <span class="themeClr" >Reports</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width='164px';
    
    let loginName  = this.route.snapshot.params['loginName'];
    if(this.deviceService.isMobile()){
      (<HTMLInputElement>document.getElementById('ulMenu')).style.display='none';
      (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='block';
      
    }
    else{
      (<HTMLInputElement>document.getElementById('ulMenu')).style.display='block';
      (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='none';
    }
 //   const dataTable = new DataTable("#dataTableExample");


       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }
    

      document.querySelectorAll('.feedback li').forEach(entry => entry.addEventListener('click', e => {
        if(!entry.classList.contains('active')) {
          (<HTMLInputElement>document.querySelector('.feedback li.active')).classList.remove('active');
            entry.classList.add('active');
        }
        e.preventDefault();
    }));

  }

  panels = ['First', 'Second', 'Third'];

  selectedDate: NgbDateStruct;

  profileForm = new FormGroup({
    BatchYear: new FormControl(''),
    Company: new FormControl(''),
    //Feedback: new FormControl(''),

  });
  ExportTOExcel() {  
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
    // XLSX.writeFile(wb, 'Data.xlsx');  

    let element = document.getElementById('dataTableExample1');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
 
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 
    /* save to file */  
    XLSX.writeFile(wb, this.selectedReportTypeName +'.xlsx');


  }  

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }


  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
         this.placementService.getPlannerSession().subscribe({
           next: data => {
            
            this.batchYearData = data.item1;
            this.selectedBatchyear=data.item1[0]['id']
            this.getReportTypes();

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

  getround(){
    this.placementService.getRounds().subscribe({
      next: data => {
       
       this.roundData = data.item1;


      },
      });
  }

  changeLeagueOwner($event:any){

   // this.batchYearCompanyData = [];
    this.batchYearStreamData = [];

    if($event.batchYear != ''){
      
      this.selectedBatchyear = $event.id;
     // this.getCompany($event.batchYear);
    }

  }
  changeCompany(event:any){
    if(event  != undefined){
    if(event.id != ''){
      
      this.selection=event.id;
      this.selectedQueryTypeArray= event;
      this.selectedReportTypeName = event.queryType;
     
      if(event.isFill == false){

        (<HTMLElement>document.getElementById('stickBar')).style.cssText = 'display:block !important;';
      }
      else{
        (<HTMLElement>document.getElementById('stickBar')).style.cssText = 'display:none !important;';
      }
    //  this.getStream(event.companyId,this.selectedBatchyear);
    }
  }
  }


getReportTypes(){

//  this.ngSelectComponentStream.handleClearClick();
  this.ngSelectComponent.handleClearClick();
  this.streamData = [];
  this.placementService.getReportType().subscribe({
    next: data => {
     

     this.batchYearCompanyData = data.item1;
     this.selectedQueryTypeArray= data.item1[0];
     this.selectedReportTypeName = data.item1[0]['queryType'];
      this.selection = data.item1[0]['id'];
      debugger
      if(data.item1[0]['isFill'] == false){

        (<HTMLElement>document.getElementById('stickBar')).style.cssText = 'display:block !important;';
      }
      else{
        (<HTMLElement>document.getElementById('stickBar')).style.cssText = 'display:none !important;';
      }

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
showPlannerReportData(){
  this.myArray=[];
  this.showPlannerReportDatas();
  
  if(this.selectedQueryTypeArray['isFill'] == false){
  this.callfxn();
  }
}

rerender(): void {
 
}


updateFilter(event:any) {
  const input = event.target.value.toLowerCase();

  // filter our data
  if (input.length > 0) {
    const filtered = this.temp
      .filter(el =>
        Object.values(el).find(
          (val:any) =>
            val.toString()
              .toLowerCase()
              .indexOf(input) !== -1
        ) != undefined
      );
    this.htmlData = [...filtered]
  } else {
    this.htmlData = [...this.temp]
  }

    // whenever the filter changes, always go back to the first page
  }
  callfxn(){
    
    (<HTMLElement>document.getElementById('liNews')).style.cssText = 'margin-left: -352px;background: #435895;';
    (<HTMLElement>document.getElementById('fdNew')).style.cssText = 'display:block;';
  }
  closeData(){
    (<HTMLElement>document.getElementById('liNews')).style.cssText = 'margin-left: 4px;background: #435895;';
    (<HTMLElement>document.getElementById('fdNew')).style.cssText = 'display:none;';
  }

showPlannerReportDatas(){
  this.loadingIndicator = true;
  this.myArray=[];
  this.isLoadderBtn = 0;
  const checkData = {
    Value:'PlannerSessionId:'+this.selectedBatchyear,
    ReportId:this.selection
   }
  this.placementService.getPlannerReportData(checkData).subscribe({
    next: data => {
    //  const myTable = document.querySelector("#dataTableExample");
  //  this.dtoptions.columns=data;
    //this.table.data,this.resetData();
    this.columns =[];
    this.headHtmlData=[];
    this.htmlData =[];
    this.temp =[];
      if(data.length > 0){
        this.headHtmlData = data[0];
     //   this.columns = Object.keys(data[0]);
      this.htmlData=data;
      this.temp = data;
     this.loadingIndicator = false;
    //   setTimeout(() => {
    //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     // Destroy the table first
    //     dtInstance.destroy();
    //     // Call the dtTrigger to rerender again
    //     this.dtTrigger.next(null);
    //   });
    // }, 5000);
    
      this.showExcelButton = 1;
      this.isLoadderBtn = 1;
    //   setTimeout(() => {
    //     const dataTable = new DataTable("#dataTableExample",this.dtOptions);
    //     dataTable.initialized;
    // }, 500);
  }
  else{
    this.columns =[];
    this.htmlData=[];
    this.temp = [];
   this.loadingIndicator = false;
    this.headHtmlData = [];
   
    this.showExcelButton = 1;
    this.isLoadderBtn = 1;
   
  }
 
      
    },
    error: (err) => {  this.headHtmlData = [];
      this.htmlData=[];
      this.showExcelButton = 0;
      this.isLoadderBtn = 1;}
    
  })
  ;
}

@HostListener('click', ['$event']) gesuredZonestart(event:any) {
if(event != undefined){
  if(event != null){
    if(event.target != undefined){
      if(event.target != null){
        if(event.target.attributes != undefined){
          if(event.target.attributes != null){
            if(event.target.attributes.length > 0){
              try{
              if(event.target.classList[0].startsWith('p')){
                this.getLinkedData(event.target.classList[0]);
                event.preventDefault();
              }
              if(event.target.classList[0].startsWith('https')){
                
                window.open(event.target.classList[0], '_blank');
              }
              else{
                event.preventDefault();
               // return false;
              }
              
              }
              catch(errr:any){
                event.preventDefault();
              }
              
            }

          }
        }
      }
    }
  }
}
}

getLinkedData(val:any){
  let splitData  = val.split(',');
  const checkData = {
    Value:splitData[1],
    ProcedureName:splitData[0]
   }
  this.placementService.getLinkedQueryData(checkData).subscribe({
    next: data => {
      this.linkedheadHtmlData = data[0];
      this.linkedHtmlData=data;
      this.openBasicModal();
      setTimeout(() => {
     //   const dataTable = new DataTable("#dataTableExampleNew",this.dtOptions);
        
    }, 500);
    },
  });
  


  
}

addFeedback(){


  

  swal.fire({
    title: 'Do you want to write feedback ?',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    cancelButtonText: 'No',
    confirmButtonText: 'Submit',
    showLoaderOnConfirm: true,
    preConfirm: (login) => {
       this.areaFeedback = login;
    },
    allowOutsideClick: () => !swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      this.saveFeedBack();
      
    }
    else{
      this.areaFeedback = 'NA';
      this.saveFeedBack();
    }
  })

 


}
saveFeedBack(){
  const checkData = {
    MenuId:0,
    NavigationUrl:'/planning/planningreport',
    Rating:this.currentRating,
    Feedback:this.areaFeedback,
    OptionalParams:this.selectedReportTypeName
   }

   this.placementService.addFeedback(checkData).subscribe({
    next: data => {
      if(data.item1[0].status == true){
     

      this.selectedQueryTypeArray.isFill = true;
      (<HTMLElement>document.getElementById('liNews')).style.cssText = 'margin-left: 4px;background: #435895;';
      (<HTMLElement>document.getElementById('fdNew')).style.cssText = 'display:none;';
    let indexData =   this.batchYearCompanyData.findIndex((x: { [x: string]: any; })=>x['id']=== this.selectedQueryTypeArray['id']);
      this.batchYearCompanyData[indexData]['isFill'] = true;
      (<HTMLElement>document.getElementById('stickBar')).style.cssText = 'display:none !important;';
      swal.fire(

        {title: 'OBP Reports', text: data.item1[0]['message'], icon: 'success'}

        )
      }
      else{
        swal.fire(

          {title: 'OBP Reports', text: data.item1[0]['message'], icon: 'error'}
  
          )
      }
    },
  });
}
sshowModel(){
  alert(1);
}
ratingData(val:Number){
 
  this.currentRating = val;
}

getExactValueNew(value:any,key:any){
  if(value.indexOf('https') > -1){
    return key;
  }
  else{
    if (value.indexOf('ModalData') > -1)
    {
      
      let splitValue = value.split('ModalData');
      //let splitProcedureValue = splitValue[1].split(',');
      // return this.sanitizer.bypassSecurityTrustHtml('<a data-value (click)="showModel()" >'+splitValue[0]+'</a>');
      return splitValue[0];
    }
    else{
      return value;
    }

  }
}

getExactValue(val: any){
  
  let a = val;
  if (val.indexOf('ModalData') > -1)
  {
    
    let splitValue = val.split('ModalData');
    //let splitProcedureValue = splitValue[1].split(',');
    // return this.sanitizer.bypassSecurityTrustHtml('<a data-value (click)="showModel()" >'+splitValue[0]+'</a>');
    return splitValue[0];
  }
  else{
    return val;
  }

}

openBasicModal() {
  
  this.modalService.open(this.basicModal, {}).result.then((result) => {
    this.basicModalCloseResult = "Modal closed" + result;
  }).catch((res) => {});
}

getExactParamValue(val: any){
  
  let a = val;
  if (val.indexOf('ModalData') > -1)
  {
    
    let splitValue = val.split('ModalData');
    //let splitProcedureValue = splitValue[1].split(',');
    // return this.sanitizer.bypassSecurityTrustHtml('<a data-value (click)="showModel()" >'+splitValue[0]+'</a>');
    return splitValue[1];
  }
 
  else{
    return val;
  }
}

checkContains(val:any){
  if(val != null && val != undefined && val != ''){
  if (val.indexOf('ModalData') > -1)
  {
    return true;
  }
  else if(val.indexOf('https') > -1){
    return true;
  }
  else{
return false;
  }
}
else{
  return false;
    }

}
viewData(file:any){
  window.open(file, '_blank');
}

checkhttplink(val:any)
{
  if (val.indexOf('http') > -1)
  {
    return true;
  }
  else{
return false;
  }

}

  resetData(){
   window.location.reload();
  }


 

}
