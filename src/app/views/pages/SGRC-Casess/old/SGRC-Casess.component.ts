// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
// import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { DataTable } from "simple-datatables";
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { PlacementService } from 'src/app/_services/placement.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import * as XLSX from 'xlsx';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT } from '@angular/common';
// import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
// import swal from 'sweetalert2';
// import { StudentGrievanceServicesService } from 'src/app/_services/student-grievance-services.service';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { fromEvent } from 'rxjs';
// import { map, debounceTime } from 'rxjs/operators';
// @Component({
//   selector: 'app-SGRC-Casess',
//   templateUrl: './SGRC-Casess.component.html',
//   styleUrls: ['./SGRC-Casess.component.scss'],
//   changeDetection: ChangeDetectionStrategy.Default
// })

// export class SGRCComponenent implements OnInit {
//   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
//   @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
//   @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
//   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
//   @ViewChild('search', { static: false }) search: any;
//   @ViewChild('searchOpen', { static: false }) searchOpen: any;
//   @ViewChild('searchClose', { static: false }) searchClose: any;
//   selectedSchoolDiv: any = null;
//   simpleItems: any = [];
//   AreaofCollaboration: any = [];
//   AgreementType: any = [];
//   MessageType: any = [];
//   Block: any = [];
//   loadingIndicator = false;
//   Activity: any = [];
//   SchoolsInvolved: any = [];
//   isInputDisabled:boolean = false;
//   // Aggrement Start

//   ticketNumbers:any='';

//   session: any = [];
//   metricbysessionid: any = [];
//   ActivityByAoC: any = [];
//   SchoolsInvolved_: any = [];
//   DivisionsInvolved_: any = [];
//   Allemployee: any = [];

//   //Aggrement END
// sgrcStatus:any='';
// sgrcRemarks:any='';
//   form: FormGroup;
//   myArray: any[] = [];
//   driveAttendance: any[] = [];
//   staticArray: any = [];
//   batchYearData: any = [];
//   batchYearCompanyData: any = [];
//   batchYearStreamData: any = [];
//   streamData: any[] = [];
//   selectedStream: any = '';
//   dExitDataAll: any[] = [];
//   selectedBatchyear: any = null;
//   roundData: any[] = [];
//   selectedRoundData: any = null;
//   selectedStreams: any = null;
//   selection: any = '';
//   isAvailable: Number = 0;
//   responses: any[] = [];
//   results: RESULT = {
//     batchYear: 0,
//     companyId: 0,
//     driveId: 0,
//     stream: '',
//     placementSoftSkillRequestDetail: []
//   };
//   details: Details = {
//     companyRemarks: '',
//     facultyRemarks: '',
//     feedback: '',
//     roundId: 0,
//     totalAbsent: '',
//     totalEligible: '',
//     totalLeft: '',
//     totalNotSelected: '',
//     totalPresent: '',
//     totalRegistered: '',
//     totalSelected: ''
//   };
//   ColumnMode = ColumnMode;
//   columns:any;
//   headHtmlData:any[]=[];
//   studentLists: any[];
//   studentListsOpenCases: any[];
//   studentListsClosedCases: any[];


//   tmpstudentLists: any[];
//   tmpstudentListsOpenCases: any[];
//   tmpstudentListsClosedCases: any[];


//   dataSource: MatTableDataSource<any>;
//   dataSourceOpen: MatTableDataSource<any>;
//   dataSourceClose: MatTableDataSource<any>;
//   // displayedColumns: string[] = ['applicationId', 'registerationNumber', 'studentName', 'courseName', 'batchYear', 'documentName', 'filePath', 'isAPproved', 'actions'];
//   displayedColumns: string[] = ['srno', 'ticketNumber', 'name', 'phone', 'subject', 'nature', 'subject', 'status', 'actions'];//,'description'
//   @ViewChild('paginator') paginator: MatPaginator;
//   @ViewChild('sort') sort: MatSort;

//   @ViewChild('paginator1') paginator1: MatPaginator;
//   @ViewChild('sort1') sort1: MatSort;


//   @ViewChild('paginator2') paginator2: MatPaginator;
//   @ViewChild('sort2') sort2: MatSort;

  
//   //'MoU <span class="themeClr" >Dashboard</span>'
//   constructor(private Agreement: AgreementEntryService,
//     private studendGservice: StudentGrievanceServicesService,
//     private fb: FormBuilder, private cdRef: ChangeDetectorRef,
//     @Inject(DOCUMENT) document: Document,
//     private route: ActivatedRoute,
//     private storageService: StorageService,
//     private authService: AuthService,
//     private modalService: NgbModal,
//     private placementService: PlacementService,) {

//     this.form = this.fb.group({
//       published: true,
//       credentials: this.fb.array([]),
//     });

//   }

//   ngOnInit(): void {
//     debugger;
//     //this.GetAllStudentsCases();
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
//     //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     let loginName = this.route.snapshot.params['loginName'];
//     //   const dataTable = new DataTable("#dataTableExample");




//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//     }

//     //this.AgreementType=['MOU','Credit Transfer','Semester Abroad','Agreement']
//     this.MessageType = ['Grievance', 'Request', 'Feedback', 'Enquiry']

//     this.Block = ['BH1', 'BH1', 'BH1', 'BH1']
//    // const dataTable = new DataTable('#dataTableRejected');


//   }

//   ticketNumber: any;
//   remarks: any;
//   selectedDate: NgbDateStruct;
//   txtVenue: any = '';
//   txtEvent: any = '';
//   selectedEmployee: any = null;
//   selectedBlock: any = null;
//   ddlType: any = null;
//   ddlCategory: any = null;
//   ddlSubCategory: any = null;


//   SigningDate: NgbDateStruct;
//   StartDate: NgbDateStruct;
//   EndDate: NgbDateStruct;




//   SubmitForm(item: any) {
//     console.log(item)
    
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }

//   changeCollab(event: any) {
//     debugger;
//     let aa = event;
//     console.log(JSON.stringify(aa));


//   }
//   VerifyDatas(){

//   }



//   VerifyData(){
//     debugger
//     this.isInputDisabled = true;
//       if(this.sgrcStatus===''){
//         swal.fire(
    
//           {title: 'SGRC', text: 'Please select status !', icon: 'error'}
    
//           );
//           this.isInputDisabled = false;
//       }
//       else  if(this.sgrcRemarks===''){
//         swal.fire(
    
//           {title: 'SGRC', text: 'Please enter remarks !', icon: 'error'}
    
//           );
//           this.isInputDisabled = false;
//       }
     
//       // else  if(this.selectedEmmployeeResponsible===''){
//       //   swal.fire(
    
//       //     {title: 'MOU Agreement Approval', text: 'Please select mou document responsible !', icon: 'error'}
    
//       //     );
//       //     this.isButtonShwoing = false;
//       // }
//       else{

//         const denominations =
//         {
          
//           MasterId:this.ticketNumbers,
//           Remarks:this.sgrcRemarks,
//           Status:this.sgrcStatus
//         }        

//         this.responses = [];
//         this.responses.push(denominations);

//         this.Agreement.updateSGRCCases(this.responses[0]).subscribe({
//           next: data => {
//             this.isInputDisabled = false;
//             swal.fire(  {title: 'SGRC Cases', text: 'SGRC Case update successfully   !', icon: 'success'}).then(function() {
//               window.location.reload();
//           });
        
//           },
//           error: err => {
//             this.isInputDisabled = false;         
//           }
//           });


//     //     const formData = new FormData();
//     //      formData.append('File', this.FileData);
//     //      formData.append('Name', this.enterMouName);
//     //      formData.append('Type', this.selectedAgreementType);
//     //      formData.append('SubType', this.selectedAgreementSubType);
//     //      formData.append('DocResPerson', this.selectedEmmployeeResponsible);
//     //      formData.append('NotingSheetRefNo', this.notingSheetRefNo);
//     //      this.Agreement.addMouEntryforApproval(formData).subscribe({
//     //       next: data => {
//     //         this.isButtonShwoing = false;
//     //         swal.fire(
//     //           {title: 'MOU Agreement Approval', text: data.item1[0]['msg'], icon: 'success'}
      
//     //           );
//     //           this.enterMouName = '';
//     //           this.selectedAgreementType = '';
//     //           this.selectedAgreementSubType = '';
//     //           this.selectedEmmployeeResponsible = '';
//     //           this.userPhoto.nativeElement.value = null;
//     // this.selectCollabType ='';
//     // this.selectCollabSubType = '';
//     // this.selectResponsible = '';
//     // this.AgreementTypeDisplay2 = [];
//     //           const file: File = this.userPhoto.nativeElement.files[0];
//     //           this.FileData = file;
            
//     //       },
//     //     });
         
//       }
//     }
    



//     ngAfterViewInit(): void {
//       // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
//       // Add 'implements AfterViewInit' to the class.
//       fromEvent(this.search.nativeElement, 'keydown')
//         .pipe(
//           debounceTime(550),
//           map((x:any) => x['target']['value'])
//         )
//         .subscribe(value => {
//           this.updateFilter(value);
//         });


//         fromEvent(this.searchOpen.nativeElement, 'keydown')
//         .pipe(
//           debounceTime(550),
//           map((x:any) => x['target']['value'])
//         )
//         .subscribe(value => {
//           this.updateOpenFilter(value);
//         });

//         fromEvent(this.searchClose.nativeElement, 'keydown')
//         .pipe(
//           debounceTime(550),
//           map((x:any) => x['target']['value'])
//         )
//         .subscribe(value => {
//           this.updateCloseFilter(value);
//         });


//     }
  
//     updateFilter(val: any) {
//       const value = val.toString().toLowerCase().trim();
//       // get the amount of columns in the table
//       const count = this.columns.length;
//       // get the key names of each column in the dataset
//       const keys = Object.keys(this.tmpstudentLists[0]);
//       // assign filtered matches to the active datatable
//       this.studentLists =this.tmpstudentLists.slice().filter((item: any) => {
//         let searchStr = '';
//         for (let i = 0; i < this.columns.length; i++) {
//           searchStr += (item[this.columns[i]]).toString().toLowerCase();
//         }
//         return searchStr.indexOf(val) !== -1 || !val;
//       });
//       // Whenever the filter changes, always go back to the first page
//       // this.table.offset = 0;
//     }


//     updateOpenFilter(val: any) {
//       const value = val.toString().toLowerCase().trim();
//       // get the amount of columns in the table
//       const count = this.columns.length;
//       // get the key names of each column in the dataset
//       const keys = Object.keys(this.tmpstudentLists[0]);
//       // assign filtered matches to the active datatable
//       this.studentListsOpenCases =this.tmpstudentListsOpenCases.slice().filter((item: any) => {
//         let searchStr = '';
//         for (let i = 0; i < this.columns.length; i++) {
//           searchStr += (item[this.columns[i]]).toString().toLowerCase();
//         }
//         return searchStr.indexOf(val) !== -1 || !val;
//       });
//       // Whenever the filter changes, always go back to the first page
//       // this.table.offset = 0;
//     }

//     updateCloseFilter(val: any) {
//       const value = val.toString().toLowerCase().trim();
//       // get the amount of columns in the table
//       const count = this.columns.length;
//       // get the key names of each column in the dataset
//       const keys = Object.keys(this.tmpstudentLists[0]);
//       // assign filtered matches to the active datatable
//       this.studentListsClosedCases =this.tmpstudentListsClosedCases.slice().filter((item: any) => {
//         let searchStr = '';
//         for (let i = 0; i < this.columns.length; i++) {
//           searchStr += (item[this.columns[i]]).toString().toLowerCase();
//         }
//         return searchStr.indexOf(val) !== -1 || !val;
//       });
//       // Whenever the filter changes, always go back to the first page
//       // this.table.offset = 0;
//     }


//   getToken(id: any) {

//     this.authService.loginTemp(id).subscribe({
//       next: data => {

//         this.storageService.saveUser(data);
//             this.GetAllStudentsCases();
       
//       },
//       error: err => {
//         // this.isLoading=0;
//         // this.errorMessage = err.error.message;
//         // this.isLoginFailed = true;
//       }
//     });
//   }
//   exportToExcel(): void {
//     const fileName = 'allCasesData.xlsx';
//     const exportedData = this.studentLists.map(item => ({
//       studentName: item.name,
//       email: item.email,
//       phone: item.phone,
//       description: item.description,
//       TicketNo: item.ticketNumber,
//       subject: item.subject,
//       Nature: item.nature,
//       createdOn: item.createdOn,
//     }));

//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
//     // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.uploadedDocList);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//     link.download = fileName;
//     link.click();
//   }
//   openVerticalCenteredModal(ticketNumber: any) {
//   /// let content: TemplateRef<any>;
//     this.ticketNumber = ticketNumber;
//     this.modalService.open(this.verticalCenteredModal, { centered: true }).result.then((result: string) => {
//       console.log("Modal closed" + result);
//     }).catch((res: any) => { });
//   }

//   onSave() {
//     swal.fire(
//       'Under Construction !',
//       '-------',
//       'error'
//     )
//   }


//   getIsShowColName(col: string) {   
//     if(col=='FileName') {
//      return true;
//     }
//     else{
//       return false;
//     }
    
//    }

//    onSelectFile(a:any){
//     debugger;
//     let aa = a;
//     window.open('https://schools.lpu.in/Services/StudentGrievance/' + a.fileName,'_blank');
//   }
//   onSelect(a:any){
//     debugger;
//     let aa = a;
// this.ticketNumbers = a['ticketNumber']
//     this.modalService.open(this.viewDescModal, {size: 'sm'}).result.then((result) => {

//       console.log("Modal closed" + result);
//     }).catch((res) => {});


//   }
//   GetAllStudentsCases(): void {
//     debugger;
//     this.loadingIndicator = true;
//     this.studendGservice.GetAllStudentsCases().subscribe((response) => {
//       if (response.item1.length > 0) {
//         // this.studentLists = response.item1.filter((item: { stage: number; filePath: string; }) => item.stage === 5 && item.filePath !== null);
//         // this.uploadedDocList = response.item1.filter((item: { stage: number; }) => item.stage === 5);
//         this.tmpstudentLists = response.item1;
//        this.studentLists = response.item1;
//         this.studentListsOpenCases = this.studentLists.filter(x => x["status"] == 'O');
//         this.studentListsClosedCases = this.studentLists.filter(x => x["status"] == 'C');
//         this.tmpstudentListsOpenCases = this.studentListsOpenCases;
//         this.tmpstudentListsClosedCases =this.studentListsClosedCases;
//         this.loadingIndicator = false;


//         this.columns =[];
//         this.headHtmlData=[];
        
     
//             this.headHtmlData = this.studentLists[0];
//             this.columns = Object.keys(this.studentLists[0]);
//             this.columns = this.columns.filter((item: any) => item !== 'fileName');
//             debugger;
//             this.columns.push()
//          // this.htmlData=data;
//           //this.temp = data;
//          this.loadingIndicator = false;

//         // setTimeout(() => {
              
//         //   const dataTable = new DataTable("#dataTableAll");
//         //   const dataTable1 = new DataTable("#dataTableOpen");
//         //   const datatble22 = new DataTable("#dataTableClose");
          
//         // }, 1000);
//       } else {
//         this.studentLists = [];
//       }


//       console.log("Documents List " + JSON.stringify(this.studentLists));

    

//     });
//   }


//   @ViewChild('table') table: ElementRef;

//   approveDocument(Id: any) {
//     debugger;
//     swal.fire(
//       'Under Construction !',
//       '-------',
//       'error'
//     )
//   }


// }
