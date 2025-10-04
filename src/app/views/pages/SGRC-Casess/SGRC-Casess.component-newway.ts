// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
// import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
// import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { DataTable } from "simple-datatables";
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import * as XLSX from 'xlsx';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT } from '@angular/common';
// import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
// import swal from 'sweetalert2';
// import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { Subject, Subscription } from 'rxjs'; // 👈 Added Subject and Subscription
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; // 👈 Added operators

// @Component({
//   selector: 'app-SGRC-Casess',
//   templateUrl: './SGRC-Casess.component.html',
//   styleUrls: ['./SGRC-Casess.component.scss'],
//   changeDetection: ChangeDetectionStrategy.Default
// })

// export class SGRCComponenent implements OnInit, OnDestroy { // 👈 Implemented OnDestroy
  
//   // --- VIEWCHILD DECORATORS (Cleaned up, only keeping used ones) ---
//   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
//   @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
//   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
//   @ViewChild('viewDescModal2') viewDescModal2: TemplateRef<any>; 
  
//   // --- SEARCH RELATED PROPERTIES ---
//   searchQuery: string = ''; // 👈 Bound to the input box
//   private searchTerms = new Subject<string>(); // 👈 RxJS Subject for debounce
//   private searchSubscription: Subscription | null = null; // 👈 Subscription to manage cleanup
//   activeTab: 'all' | 'open' | 'closed' = 'all'; // 👈 Tracks the currently active tab

//   // --- DATA ARRAYS ---
//   studentLists: any[] = [];
//   studentListsOpenCases: any[] = [];
//   studentListsClosedCases: any[] = [];
  
//   // --- TEMPORARY/UNFILTERED DATA ARRAYS (CRITICAL for resetting search) ---
//   tmpstudentLists: any[] = [];
//   tmpstudentListsOpenCases: any[] = [];
//   tmpstudentListsClosedCases: any[] = [];

//   // --- OTHER PROPERTIES ---
//   loadingIndicator = false;
//   sgrcStatus: any = '';
//   sgrcRemarks: any = '';
//   form: FormGroup;
//   responses: any[] = [];
//   ColumnMode = ColumnMode;
//   columns: any;
//   headHtmlData: any[] = [];
//   studentClosedCasesRemarks: any[];
//   displayedColumns: string[] = ['srno', 'ticketNumber', 'name', 'phone', 'subject', 'nature', 'subject', 'status', 'actions'];
//   @ViewChild('paginator') paginator: MatPaginator;
//   @ViewChild('sort') sort: MatSort;
//   @ViewChild('paginator1') paginator1: MatPaginator;
//   @ViewChild('sort1') sort1: MatSort;
//   @ViewChild('paginator2') paginator2: MatPaginator;
//   @ViewChild('sort2') sort2: MatSort;
//   IdClosedCase: any;
//   ticketNumbers: any; // Used in openVerticalCenteredModal
//   MessageType: string[];
//   Block: string[];
//   isInputDisabled: boolean;

//   constructor(
//     private Agreement: AgreementEntryService,
//     private studendGservicelocal: StudentGrievanceServicesLocalService,
//     private fb: FormBuilder, private cdRef: ChangeDetectorRef,
//     @Inject(DOCUMENT) document: Document,
//     private route: ActivatedRoute,
//     private storageService: StorageService,
//     private authService: AuthService,
//     private modalService: NgbModal,
//   ) {
//     this.form = this.fb.group({
//       published: true,
//       credentials: this.fb.array([]),
//     });
//   }

//   ngOnInit(): void {
//     // 1. Initialize UI elements
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     let loginName = this.route.snapshot.params['loginName'];

//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//     }
    
//     // 2. Setup the Debounce Pipe
//     this.setupSearchDebounce();

//     this.MessageType = ['Grievance', 'Request', 'Feedback', 'Enquiry']
//     this.Block = ['BH1', 'BH1', 'BH1', 'BH1']
//   }

//   // --- SEARCH DEBOUNCE LOGIC ---
//   private setupSearchDebounce(): void {
//     this.searchSubscription = this.searchTerms.pipe(
//       // Wait for 300ms pause after the last event
//       debounceTime(300),
//       // Only proceed if the new value is different from the previous value
//       distinctUntilChanged()
//     ).subscribe(term => {
//       // Execute the appropriate search function based on the active tab
//       this.executeSearch(term);
//     });
//   }

//   // This is the function called by (ngModelChange) in HTML
//   onSearchInputChange(newQuery: string): void {
//     this.searchQuery = newQuery;
//     this.searchTerms.next(newQuery);
//   }

//   // Centralized search executor
//   executeSearch(query: string): void {
//     const term = query.trim().toLowerCase();
    
//     // Select the source array and the destination array based on the active tab
//     let sourceArray: any[];
//     let destinationArray: any[];

//     if (this.activeTab === 'open') {
//       sourceArray = this.tmpstudentListsOpenCases;
//       destinationArray = this.studentListsOpenCases;
//     } else if (this.activeTab === 'closed') {
//       sourceArray = this.tmpstudentListsClosedCases;
//       destinationArray = this.studentListsClosedCases;
//     } else { // 'all' tab
//       sourceArray = this.tmpstudentLists;
//       destinationArray = this.studentLists;
//     }

//     if (!term) {
//       // If query is empty, reset the destination array to the full source array
//       Object.assign(destinationArray, sourceArray);
//     } else {
//       // Filter the data
//       const filteredList = sourceArray.filter((item: any) => {
//         let searchStr = '';
//         for (const key in item) {
//           if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined && typeof item[key] !== 'object') {
//             searchStr += String(item[key]).toLowerCase() + ' ';
//           }
//         }
//         return searchStr.includes(term);
//       });
//       // Update the visible list (destinationArray)
//       Object.assign(destinationArray, filteredList);
//     }
//   }
  
//   // --- DATA LOADING AND CLEANUP ---

//   GetAllStudentsCases(): void {
//     this.loadingIndicator = true;
//     this.studendGservicelocal.GetAllStudentsCases().subscribe((response) => {
//       if (response.item1.length > 0) {
        
//         // 1. Store complete data in temporary arrays
//         this.tmpstudentLists = response.item1;
//         this.tmpstudentListsOpenCases = this.tmpstudentLists.filter(x => x["status"] === 'O');
//         this.tmpstudentListsClosedCases = this.tmpstudentLists.filter(x => x["status"] === 'C');

//         // 2. Initialize display arrays (using spread/slice for safe copy)
//         this.studentLists = [...this.tmpstudentLists];
//         this.studentListsOpenCases = [...this.tmpstudentListsOpenCases];
//         this.studentListsClosedCases = [...this.tmpstudentListsClosedCases];
        
//         // 3. Set columns (only needed once)
//         this.headHtmlData = this.studentLists[0];
//         this.columns = Object.keys(this.studentLists[0]).filter((item: any) => item !== 'fileName');
        
//       } else {
//         this.studentLists = [];
//         this.studentListsOpenCases = [];
//         this.studentListsClosedCases = [];
//       }
//       this.loadingIndicator = false;
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.searchSubscription) {
//       this.searchSubscription.unsubscribe(); // 👈 Prevents memory leaks
//     }
//   }
  
//   // --- TAB SWITCHING LOGIC ---

//   onTabClick(tabType: 'all' | 'open' | 'closed'): void {
//     this.activeTab = tabType; // Set the new active tab
//     this.searchQuery = ""; // Clear the search box on tab switch
    
//     // Reset the visible list for the newly active tab to the full, unfiltered temporary list
//     if (tabType === 'all') {
//         this.studentLists = [...this.tmpstudentLists];
//     } else if (tabType === 'open') {
//         this.studentListsOpenCases = [...this.tmpstudentListsOpenCases];
//     } else if (tabType === 'closed') {
//         this.studentListsClosedCases = [...this.tmpstudentListsClosedCases];
//     }
//     // Note: Do NOT call this.GetAllStudentsCases() here unless you need a fresh API call
//   }


//   // --- REMOVED METHODS ---
//   // The following methods have been removed as they are redundant or replaced by the new logic:
//   // ngAfterViewInit()
//   // updateFilter()
//   // updateOpenFilter()
//   // updateCloseFilter()
//   // DataSearch()
//   // DataSearchOpen()
//   // DataSearchClosed()

//   // --- OTHER ORIGINAL METHODS (Keep these) ---
  
//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         this.GetAllStudentsCases();
//       },
//       error: err => { }
//     });
//   }

//   openVerticalCenteredModal(ticketNumber: any) {
//     this.ticketNumbers = ticketNumber;
//     this.modalService.open(this.verticalCenteredModal, { centered: true }).result.then((result: string) => {
//       console.log("Modal closed" + result);
//     }).catch((res: any) => { });
//   }

//   VerifyData() {
//     this.isInputDisabled = true;
//     if (this.sgrcStatus === '') {
//       swal.fire({ title: 'SGRC', text: 'Please select status !', icon: 'error' });
//       this.isInputDisabled = false;
//     }
//     else if (this.sgrcRemarks === '') {
//       swal.fire({ title: 'SGRC', text: 'Please enter remarks !', icon: 'error' });
//       this.isInputDisabled = false;
//     }
//     else {
//       const denominations = {
//         MasterId: this.ticketNumbers,
//         Remarks: this.sgrcRemarks,
//         Status: this.sgrcStatus
//       }
//       this.responses = [];
//       this.responses.push(denominations);

//       this.Agreement.updateSGRCCases(this.responses[0]).subscribe({
//         next: data => {
//           this.isInputDisabled = false;
//           swal.fire({ title: 'SGRC Cases', text: 'SGRC Case update successfully   !', icon: 'success' }).then(function () {
//             window.location.reload();
//           });
//         },
//         error: err => {
//           this.isInputDisabled = false;
//         }
//       });
//     }
//   }

//   onSelectFile(a: any) {
//     window.open(a['fileName'], '_blank');
//   }

//   onSelect(a: any) {
//     this.ticketNumbers = a['ticketNumber']
//     this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
//       console.log("Modal closed" + result);
//     }).catch((res) => { });
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
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//     link.download = fileName;
//     link.click();
//   }

//   onSelectClosedcases(a: any) {
//     this.IdClosedCase = a['id'];
//     this.studendGservicelocal.GetAllStudentsCasesRemarks(this.IdClosedCase).subscribe(
//       (response) => {
//         if (response.item1.length > 0) {
//           this.studentClosedCasesRemarks = response.item1;
//         } else {
//           this.studentClosedCasesRemarks = [];
//         }

//         this.modalService.open(this.viewDescModal2, { size: 'sm' }).result.then(
//           (result) => {
//             console.log("Modal closed" + result);
//           }
//         ).catch((res) => { });
//       },
//       (error) => {
//         console.error("Error fetching data:", error);
//       }
//     );
//   }



//   // --- WRAPPER FUNCTIONS (To support old HTML function calls) ---

// /**
//  * Wrapper for DataSearch() (used in All Cases tab in your original HTML).
//  * Simply delegates the search query to the centralized, debounced handler.
//  */
// // DataSearch(): void {
// //     // Ensure the active tab is correct before dispatching the search
// //     this.activeTab = 'all'; 
// //     this.onSearchInputChange(this.searchQuery);
// // }
//   DataSearch() {
//     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
//     const query = this.searchQuery?.trim().toLowerCase() || '';

//     // If search query is empty, reset to the original list
//     if (!query) {
//       this.GetAllStudentsCases();
//       this.studentLists = this.studentLists;
//       return;
//     }

//     // Filter student lists based on the search query
//     this.studentLists = this.studentLists.filter(item => {
//       // Use Object.entries to loop through all key-value pairs in the object
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           // Convert the value to a string and make it case-insensitive
//           let valueString = String(val).toLowerCase();

//           // Special handling for 'ticketNumber' field
//           if (key === 'ticketNumber') {
//             const numericId = Number(val); // Convert the ticket number to a number

//             // Handle both numericId and 'SG-<numericId>' formats
//             if (!isNaN(numericId)) {
//               // Check if the query matches the numericId or 'SG-<numericId>' format
//               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
//             }
//           }

//           // General case for other fields (text search)
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }


// /**
//  * Wrapper for DataSearchOpen() (used in Open Cases tab in your original HTML).
//  * Simply delegates the search query to the centralized, debounced handler.
//  */
// DataSearchOpen(): void {
//     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
//     const query = this.searchQuery?.trim().toLowerCase() || '';

//     // If search query is empty, reset to the original list
//     if (!query) {
//       this.studentListsOpenCases= this.studentListsOpenCases;
//       this.GetAllStudentsCases();
//       return;
//     }

//     // Filter student lists based on the search query
//     this.studentListsOpenCases = this.studentListsOpenCases.filter(item => {
//       // Use Object.entries to loop through all key-value pairs in the object
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           // Convert the value to a string and make it case-insensitive
//           let valueString = String(val).toLowerCase();

//           // Special handling for 'ticketNumber' field
//           if (key === 'ticketNumber') {
//             const numericId = Number(val); // Convert the ticket number to a number

//             // Handle both numericId and 'SG-<numericId>' formats
//             if (!isNaN(numericId)) {
//               // Check if the query matches the numericId or 'SG-<numericId>' format
//               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
//             }
//           }

//           // General case for other fields (text search)
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }

// /**
//  * Wrapper for DataSearchClosed() (used in Closed Cases tab in your original HTML).
//  * Simply delegates the search query to the centralized, debounced handler.
//  */
// DataSearchClosed(): void {
//     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
//     const query = this.searchQuery?.trim().toLowerCase() || '';

//     // If search query is empty, reset to the original list
//     if (!query) {
//       this.GetAllStudentsCases();
//       this.studentListsClosedCases= this.studentListsClosedCases;
//       return;
//     }

//     // Filter student lists based on the search query
//     this.studentListsClosedCases = this.studentListsClosedCases.filter(item => {
//       // Use Object.entries to loop through all key-value pairs in the object
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           // Convert the value to a string and make it case-insensitive
//           let valueString = String(val).toLowerCase();

//           // Special handling for 'ticketNumber' field
//           if (key === 'ticketNumber') {
//             const numericId = Number(val); // Convert the ticket number to a number

//             // Handle both numericId and 'SG-<numericId>' formats
//             if (!isNaN(numericId)) {
//               // Check if the query matches the numericId or 'SG-<numericId>' format
//               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
//             }
//           }

//           // General case for other fields (text search)
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }
// }

// // import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// // import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
// // import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// // import { ActivatedRoute } from '@angular/router';
// // import { DataTable } from "simple-datatables";
// // import { AuthService } from 'src/app/_services/auth.service';
// // import { StorageService } from 'src/app/_services/storage.service';
// // import { PlacementService } from 'src/app/_services/placement.service';
// // import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// // import * as XLSX from 'xlsx';
// // import { MatFormFieldModule } from '@angular/material/form-field';
// // import { NgSelectComponent } from '@ng-select/ng-select';
// // import { DOCUMENT } from '@angular/common';
// // import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
// // import swal from 'sweetalert2';
// // import { StudentGrievanceServicesService } from 'src/app/_services/student-grievance-services.service';
// // import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';

// // import { MatTableDataSource } from '@angular/material/table';
// // import { MatPaginator } from '@angular/material/paginator';
// // import { MatSort } from '@angular/material/sort';
// // import { ColumnMode } from '@swimlane/ngx-datatable';
// // import { fromEvent } from 'rxjs';
// // import { map, debounceTime } from 'rxjs/operators';
// // @Component({
// //   selector: 'app-SGRC-Casess',
// //   templateUrl: './SGRC-Casess.component.html',
// //   styleUrls: ['./SGRC-Casess.component.scss'],
// //   changeDetection: ChangeDetectionStrategy.Default
// // })

// // export class SGRCComponenent implements OnInit {
// //   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
// //   @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
// //   @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
// //   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
// //   @ViewChild('viewDescModal2') viewDescModal2: TemplateRef<any>; // Added on 5-Feb-24
// //   @ViewChild('search', { static: false }) search: any;
// //   @ViewChild('searchOpen', { static: false }) searchOpen: any;
// //   @ViewChild('searchClose', { static: false }) searchClose: any;
// //   selectedSchoolDiv: any = null;
// //   simpleItems: any = [];
// //   AreaofCollaboration: any = [];
// //   AgreementType: any = [];
// //   MessageType: any = [];
// //   Block: any = [];
// //   loadingIndicator = false;
// //   Activity: any = [];
// //   SchoolsInvolved: any = [];
// //   isInputDisabled: boolean = false;
// //   // Aggrement Start

// //   ticketNumbers: any = '';

// //   session: any = [];
// //   metricbysessionid: any = [];
// //   ActivityByAoC: any = [];
// //   SchoolsInvolved_: any = [];
// //   DivisionsInvolved_: any = [];
// //   Allemployee: any = [];

// //   //Aggrement END
// //   sgrcStatus: any = '';
// //   sgrcRemarks: any = '';
// //   form: FormGroup;
// //   myArray: any[] = [];
// //   driveAttendance: any[] = [];
// //   staticArray: any = [];
// //   batchYearData: any = [];
// //   batchYearCompanyData: any = [];
// //   batchYearStreamData: any = [];
// //   streamData: any[] = [];
// //   selectedStream: any = '';
// //   dExitDataAll: any[] = [];
// //   selectedBatchyear: any = null;
// //   roundData: any[] = [];
// //   selectedRoundData: any = null;
// //   selectedStreams: any = null;
// //   selection: any = '';
// //   isAvailable: Number = 0;
// //   responses: any[] = [];
// //   results: RESULT = {
// //     batchYear: 0,
// //     companyId: 0,
// //     driveId: 0,
// //     stream: '',
// //     placementSoftSkillRequestDetail: []
// //   };
// //   details: Details = {
// //     companyRemarks: '',
// //     facultyRemarks: '',
// //     feedback: '',
// //     roundId: 0,
// //     totalAbsent: '',
// //     totalEligible: '',
// //     totalLeft: '',
// //     totalNotSelected: '',
// //     totalPresent: '',
// //     totalRegistered: '',
// //     totalSelected: ''
// //   };
// //   ColumnMode = ColumnMode;
// //   columns: any;
// //   headHtmlData: any[] = [];
// //   studentLists: any[];
// //   studentListsOpenCases: any[];
// //   studentListsClosedCases: any[];
// //   //Changes 5-Feb-24
// //   studentClosedCasesRemarks: any[];
// //   studentListsClosedCasesIdWiseRemarks: any[];

// //   tmpstudentLists: any[];
// //   tmpstudentListsOpenCases: any[];
// //   tmpstudentListsClosedCases: any[];


// //   dataSource: MatTableDataSource<any>;
// //   dataSourceOpen: MatTableDataSource<any>;
// //   dataSourceClose: MatTableDataSource<any>;
// //   // displayedColumns: string[] = ['applicationId', 'registerationNumber', 'studentName', 'courseName', 'batchYear', 'documentName', 'filePath', 'isAPproved', 'actions'];
// //   displayedColumns: string[] = ['srno', 'ticketNumber', 'name', 'phone', 'subject', 'nature', 'subject', 'status', 'actions'];//,'description'
// //   @ViewChild('paginator') paginator: MatPaginator;
// //   @ViewChild('sort') sort: MatSort;

// //   @ViewChild('paginator1') paginator1: MatPaginator;
// //   @ViewChild('sort1') sort1: MatSort;


// //   @ViewChild('paginator2') paginator2: MatPaginator;
// //   @ViewChild('sort2') sort2: MatSort;
// //   IdClosedCase: any;



// //   //'MoU <span class="themeClr" >Dashboard</span>'
// //   constructor(private Agreement: AgreementEntryService,
// //     private studendGservice: StudentGrievanceServicesService,
// //     private studendGservicelocal: StudentGrievanceServicesLocalService,

// //     private fb: FormBuilder, private cdRef: ChangeDetectorRef,
// //     @Inject(DOCUMENT) document: Document,
// //     private route: ActivatedRoute,
// //     private storageService: StorageService,
// //     private authService: AuthService,
// //     private modalService: NgbModal,
// //     private placementService: PlacementService,) {

// //     this.form = this.fb.group({
// //       published: true,
// //       credentials: this.fb.array([]),
// //     });

// //   }

// //   ngOnInit(): void {
// //     debugger;
// //     //this.GetAllStudentsCases();
// //     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
// //     //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
// //     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
// //     let loginName = this.route.snapshot.params['loginName'];
// //     //   const dataTable = new DataTable("#dataTableExample");

// //     if (loginName != '' && loginName != undefined) {
// //       this.getToken(loginName);
// //     }

// //     //this.AgreementType=['MOU','Credit Transfer','Semester Abroad','Agreement']
// //     this.MessageType = ['Grievance', 'Request', 'Feedback', 'Enquiry']

// //     this.Block = ['BH1', 'BH1', 'BH1', 'BH1']
// //     // const dataTable = new DataTable('#dataTableRejected');


// //   }

// //   ticketNumber: any;
// //   remarks: any;
// //   selectedDate: NgbDateStruct;
// //   txtVenue: any = '';
// //   txtEvent: any = '';
// //   selectedEmployee: any = null;
// //   selectedBlock: any = null;
// //   ddlType: any = null;
// //   ddlCategory: any = null;
// //   ddlSubCategory: any = null;


// //   SigningDate: NgbDateStruct;
// //   StartDate: NgbDateStruct;
// //   EndDate: NgbDateStruct;




// //   SubmitForm(item: any) {
// //     console.log(item)

// //   }

// //   applyFilter(event: Event) {
// //     const filterValue = (event.target as HTMLInputElement).value;
// //     this.dataSource.filter = filterValue.trim().toLowerCase();
// //   }

// //   changeCollab(event: any) {
// //     debugger;
// //     let aa = event;
// //     console.log(JSON.stringify(aa));


// //   }
// //   VerifyDatas() {

// //   }



// //   VerifyData() {
// //     debugger
// //     this.isInputDisabled = true;
// //     if (this.sgrcStatus === '') {
// //       swal.fire(

// //         { title: 'SGRC', text: 'Please select status !', icon: 'error' }

// //       );
// //       this.isInputDisabled = false;
// //     }
// //     else if (this.sgrcRemarks === '') {
// //       swal.fire(

// //         { title: 'SGRC', text: 'Please enter remarks !', icon: 'error' }

// //       );
// //       this.isInputDisabled = false;
// //     }

// //     // else  if(this.selectedEmmployeeResponsible===''){
// //     //   swal.fire(

// //     //     {title: 'MOU Agreement Approval', text: 'Please select mou document responsible !', icon: 'error'}

// //     //     );
// //     //     this.isButtonShwoing = false;
// //     // }
// //     else {
// //       const denominations =
// //       {
// //         MasterId: this.ticketNumbers,
// //         Remarks: this.sgrcRemarks,
// //         Status: this.sgrcStatus
// //       }
// //       this.responses = [];
// //       this.responses.push(denominations);

// //       this.Agreement.updateSGRCCases(this.responses[0]).subscribe({
// //         next: data => {
// //           this.isInputDisabled = false;
// //           swal.fire({ title: 'SGRC Cases', text: 'SGRC Case update successfully   !', icon: 'success' }).then(function () {
// //             window.location.reload();
// //           });

// //         },
// //         error: err => {
// //           this.isInputDisabled = false;
// //         }
// //       });




// //     }
// //   }

// //   ngAfterViewInit(): void {
// //     // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
// //     // Add 'implements AfterViewInit' to the class.
// //     fromEvent(this.search.nativeElement, 'keydown')
// //       .pipe(
// //         debounceTime(550),
// //         map((x: any) => x['target']['value'])
// //       )
// //       .subscribe(value => {
// //         this.updateFilter(value);
// //       });


// //     fromEvent(this.searchOpen.nativeElement, 'keydown')
// //       .pipe(
// //         debounceTime(550),
// //         map((x: any) => x['target']['value'])
// //       )
// //       .subscribe(value => {
// //         this.updateOpenFilter(value);
// //       });

// //     fromEvent(this.searchClose.nativeElement, 'keydown')
// //       .pipe(
// //         debounceTime(550),
// //         map((x: any) => x['target']['value'])
// //       )
// //       .subscribe(value => {
// //         this.updateCloseFilter(value);
// //       });


// //   }

// //   updateFilter(val: any) {
// //     const value = val.toString().toLowerCase().trim();
// //     // get the amount of columns in the table
// //     const count = this.columns.length;
// //     // get the key names of each column in the dataset
// //     const keys = Object.keys(this.tmpstudentLists[0]);
// //     // assign filtered matches to the active datatable
// //     this.studentLists = this.tmpstudentLists.slice().filter((item: any) => {
// //       let searchStr = '';
// //       for (let i = 0; i < this.columns.length; i++) {
// //         searchStr += (item[this.columns[i]]).toString().toLowerCase();
// //       }
// //       return searchStr.indexOf(val) !== -1 || !val;
// //     });
// //     // Whenever the filter changes, always go back to the first page
// //     // this.table.offset = 0;
// //   }


// //   updateOpenFilter(val: any) {
// //     const value = val.toString().toLowerCase().trim();
// //     // get the amount of columns in the table
// //     const count = this.columns.length;
// //     // get the key names of each column in the dataset
// //     const keys = Object.keys(this.tmpstudentLists[0]);
// //     // assign filtered matches to the active datatable
// //     this.studentListsOpenCases = this.tmpstudentListsOpenCases.slice().filter((item: any) => {
// //       let searchStr = '';
// //       for (let i = 0; i < this.columns.length; i++) {
// //         searchStr += (item[this.columns[i]]).toString().toLowerCase();
// //       }
// //       return searchStr.indexOf(val) !== -1 || !val;
// //     });
// //     // Whenever the filter changes, always go back to the first page
// //     // this.table.offset = 0;
// //   }

// //   updateCloseFilter(val: any) {
// //     const value = val.toString().toLowerCase().trim();
// //     // get the amount of columns in the table
// //     const count = this.columns.length;
// //     // get the key names of each column in the dataset
// //     const keys = Object.keys(this.tmpstudentLists[0]);
// //     // assign filtered matches to the active datatable
// //     this.studentListsClosedCases = this.tmpstudentListsClosedCases.slice().filter((item: any) => {
// //       let searchStr = '';
// //       for (let i = 0; i < this.columns.length; i++) {
// //         searchStr += (item[this.columns[i]]).toString().toLowerCase();
// //       }
// //       return searchStr.indexOf(val) !== -1 || !val;
// //     });
// //     // Whenever the filter changes, always go back to the first page
// //     // this.table.offset = 0;
// //   }


// //   getToken(id: any) {

// //     this.authService.loginTemp(id).subscribe({
// //       next: data => {

// //         this.storageService.saveUser(data);
// //         this.GetAllStudentsCases();
// //         // this.GetAllStudentsCasesRemarks(); 5-feb-24 commented 
// //       },
// //       error: err => {
// //         // this.isLoading=0;
// //         // this.errorMessage = err.error.message;
// //         // this.isLoginFailed = true;
// //       }
// //     });
// //     // console.log("Closed Cases Lists " + JSON.stringify(this.studentClosedCasesRemarks)); Delete this line 5-feb-24
// //   }



// //   openVerticalCenteredModal(ticketNumber: any) {
// //     /// let content: TemplateRef<any>;
// //     this.ticketNumber = ticketNumber;
// //     this.modalService.open(this.verticalCenteredModal, { centered: true }).result.then((result: string) => {
// //       console.log("Modal closed" + result);
// //     }).catch((res: any) => { });
// //   }

// //   onSave() {
// //     swal.fire(
// //       'Under Construction !',
// //       '-------',
// //       'error'
// //     )
// //   }


// //   getIsShowColName(col: string) {
// //     if (col == 'FileName') {
// //       return true;
// //     }
// //     else {
// //       return false;
// //     }

// //   }

// //   onSelectFile(a: any) {
// //     debugger;
// //     let aa = a;
// //     // alert(JSON.stringify(a)) https://websiteapi.lpu.in/studentgrievance/api/Grievance/
// //     window.open(a['fileName'], '_blank');
// //   }


// //   onSelect(a: any) {
// //     debugger;
// //     let aa = a;
// //     this.ticketNumbers = a['ticketNumber']
// //     this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
// //       console.log("Modal closed" + result);
// //     }).catch((res) => { });
// //   }

// //   // Updated Function   GetAllStudentsCases on 5-feb -24
// //   //  Added New Method Export to Excel Sheet 5-feb-24
// //   exportToExcel(): void {
// //     const fileName = 'allCasesData.xlsx';
// //     const exportedData = this.studentLists.map(item => ({
// //       studentName: item.name,
// //       email: item.email,
// //       phone: item.phone,
// //       description: item.description,
// //       TicketNo: item.ticketNumber,
// //       subject: item.subject,
// //       Nature: item.nature,
// //       createdOn: item.createdOn,
// //     }));

// //     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
// //     const wb: XLSX.WorkBook = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
// //     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
// //     const link = document.createElement('a');
// //     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
// //     link.download = fileName;
// //     link.click();
// //   }

// //   onSelectClosedcases(a: any) {
// //     // debugger;
// //     this.IdClosedCase = a['id'];
// //     // alert(JSON.stringify(a))
// //     // alert(a['masterId'])
// //     this.studendGservicelocal.GetAllStudentsCasesRemarks(this.IdClosedCase).subscribe(
// //       (response) => {
// //         if (response.item1.length > 0) {
// //           this.studentClosedCasesRemarks = response.item1;
// //           // this.loadingIndicator = false;
// //           // this.columns = [];
// //           // this.headHtmlData = [];

// //           // this.headHtmlData = this.studentClosedCasesRemarks[0];
// //           // this.columns = Object.keys(this.studentClosedCasesRemarks[0]);
// //           // this.columns = this.columns.filter((item: any) => item !== 'fileName');
// //           // debugger;
// //           // this.columns.push();
// //           // this.loadingIndicator = false;
// //         } else {
// //           this.studentClosedCasesRemarks = [];
// //         }

// //         console.log("Closed Cases Lists " + JSON.stringify(this.studentClosedCasesRemarks));

// //         // Assuming you want to display modal only after receiving the response
// //         this.modalService.open(this.viewDescModal2, { size: 'sm' }).result.then(
// //           (result) => {
// //             console.log("Modal closed" + result);
// //           }
// //         ).catch((res) => { });

// //       },
// //       (error) => {
// //         // Handle error here
// //         console.error("Error fetching data:", error);
// //       }
// //     );
// //   }


// //   GetAllStudentsCases(): void {
// //     this.loadingIndicator = true;
// //     this.studendGservicelocal.GetAllStudentsCases().subscribe((response) => {
// //       if (response.item1.length > 0) {
// //         this.tmpstudentLists = response.item1;
// //         this.studentLists = response.item1;
// //         this.FilteredstudentLists = this.studentLists;
// //         this.studentListsOpenCases = this.studentLists.filter(x => x["status"] === 'O');
// //         this.studentListsClosedCases = this.studentLists.filter(x => x["status"] === 'C');
// //         this.tmpstudentListsOpenCases = this.studentListsOpenCases;
// //         this.tmpstudentListsClosedCases = this.studentListsClosedCases;
// //         this.loadingIndicator = false;

// //         this.columns = [];
// //         this.headHtmlData = [];


// //         this.headHtmlData = this.studentLists[0];
// //         this.columns = Object.keys(this.studentLists[0]);
// //         this.columns = this.columns.filter((item: any) => item !== 'fileName');
// //         this.columns.push()
// //         this.loadingIndicator = false;
// //       } else {
// //         this.studentLists = [];
// //       }
// //       console.log("Documents List " + JSON.stringify(this.studentLists));
// //     });
// //   }

// //   searchQuery: any;
// //   FilteredstudentLists: any[];
// //   @ViewChild('table') table: ElementRef;

// //   DataSearch() {
// //     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
// //     const query = this.searchQuery?.trim().toLowerCase() || '';

// //     // If search query is empty, reset to the original list
// //     if (!query) {
// //       this.FilteredstudentLists = this.studentLists;
// //       return;
// //     }

// //     // Filter student lists based on the search query
// //     this.FilteredstudentLists = this.studentLists.filter(item => {
// //       // Use Object.entries to loop through all key-value pairs in the object
// //       return Object.entries(item).some(([key, val]) => {
// //         if (val !== null && val !== undefined) {
// //           // Convert the value to a string and make it case-insensitive
// //           let valueString = String(val).toLowerCase();

// //           // Special handling for 'ticketNumber' field
// //           if (key === 'ticketNumber') {
// //             const numericId = Number(val); // Convert the ticket number to a number

// //             // Handle both numericId and 'SG-<numericId>' formats
// //             if (!isNaN(numericId)) {
// //               // Check if the query matches the numericId or 'SG-<numericId>' format
// //               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
// //             }
// //           }

// //           // General case for other fields (text search)
// //           return valueString.includes(query);
// //         }
// //         return false;
// //       });
// //     });
// //   }

// //   DataSearchOpen() {
// //     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
// //     const query = this.searchQuery?.trim().toLowerCase() || '';

// //     // If search query is empty, reset to the original list
// //     if (!query) {
// //       this.FilteredstudentLists = this.studentLists;
// //       return;
// //     }

// //     // Filter student lists based on the search query
// //     this.studentListsOpenCases = this.studentListsOpenCases.filter(item => {
// //       // Use Object.entries to loop through all key-value pairs in the object
// //       return Object.entries(item).some(([key, val]) => {
// //         if (val !== null && val !== undefined) {
// //           // Convert the value to a string and make it case-insensitive
// //           let valueString = String(val).toLowerCase();

// //           // Special handling for 'ticketNumber' field
// //           if (key === 'ticketNumber') {
// //             const numericId = Number(val); // Convert the ticket number to a number

// //             // Handle both numericId and 'SG-<numericId>' formats
// //             if (!isNaN(numericId)) {
// //               // Check if the query matches the numericId or 'SG-<numericId>' format
// //               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
// //             }
// //           }

// //           // General case for other fields (text search)
// //           return valueString.includes(query);
// //         }
// //         return false;
// //       });
// //     });
// //   }

// //   DataSearchClosed() {
// //     // Ensure that searchQuery is not null/undefined and trim any extra spaces.
// //     const query = this.searchQuery?.trim().toLowerCase() || '';

// //     // If search query is empty, reset to the original list
// //     if (!query) {
// //       this.GetAllStudentsCases();
// //       this.studentListsClosedCases;
// //       return;
// //     }

// //     // Filter student lists based on the search query
// //     this.studentListsClosedCases = this.studentListsClosedCases.filter(item => {
// //       // Use Object.entries to loop through all key-value pairs in the object
// //       return Object.entries(item).some(([key, val]) => {
// //         if (val !== null && val !== undefined) {
// //           // Convert the value to a string and make it case-insensitive
// //           let valueString = String(val).toLowerCase();

// //           // Special handling for 'ticketNumber' field
// //           if (key === 'ticketNumber') {
// //             const numericId = Number(val); // Convert the ticket number to a number

// //             // Handle both numericId and 'SG-<numericId>' formats
// //             if (!isNaN(numericId)) {
// //               // Check if the query matches the numericId or 'SG-<numericId>' format
// //               return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
// //             }
// //           }

// //           // General case for other fields (text search)
// //           return valueString.includes(query);
// //         }
// //         return false;
// //       });
// //     });
// //   }
// //   onTabClick(tabType: string): void {
// //     // console.log('Tab clicked:', tabType);  // Log the tab type (all, open, closed)

// //     // You can add logic based on the tab clicked
// //     if (tabType === 'all') {
// //       this.searchQuery = "";
      
// //     } else if (tabType === 'open') {
// //       this.searchQuery = "";

// //     } else if (tabType === 'closed') {
// //       this.searchQuery = "";
// //     }
// //     this.GetAllStudentsCases();
// //   }
// // }
