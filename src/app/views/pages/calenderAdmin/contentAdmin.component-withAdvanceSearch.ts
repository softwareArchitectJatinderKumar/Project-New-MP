// import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// import Swal from 'sweetalert2';
// import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import * as XLSX from 'xlsx';
// import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
// import swal from 'sweetalert2';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
// import { ActivatedRoute } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { LpuEventManagementService } from 'src/app/_services/lpu-event-management.service';

// interface SchoolDivision {
//   id: string;
//   schoolDivision: string;
// }

// @Component({
//   selector: 'app-content',
//   templateUrl: './contentAdmin.component.html',
//   styleUrls: ['./contentAdmin.component.scss']
// })
// export class ContentAdminComponent implements OnInit {
//   companyOptions = [
//     "Option 1", "Option 2"
//   ];
//   OBPOptions = [
//     "Gender Equality", "Local Community Developement", "Birth & Death Anniversaries of Great Personalities",
//     "Eveniornment and Sustainbility Events", "Human Value & Professional Ethics", "Industry Academia Innovatives Practices",
//     "Extension Activities in Neighbourhood Relvant to Discipline", "Student Capability Enchancements ", "Waste Management",
//     "Fundamental Duties and Right & National Identity & Symbols", " Days Celebrations", " Off Campus Participation for Technical Events (Including IPR)",
//     "Professional Chapter", "Sustainbility Developement Goals (SDGs)", "Guinness Book World Records"

//   ];
//   allSchoolDivisions: any; EventLevels: any; isLoginFailed: boolean = false; schoolname: string | Blob; CategoryId: string | Blob;
//   eventname: string | Blob; eventcalender: string | Blob; mode: string | Blob; obpcriteria: string | Blob; totalstudent: string | Blob;
//   semester: string | Blob; startdate: string | Blob; enddate: string | Blob; budget: string | Blob; remarks: string | Blob; DeveloperText: any = "Jatinder Kumar 31309";
//   responses: any; budgettype: string | Blob; budgetType: any; EventObjective: any; EventRegisterationData: any[] = [];
//   filteredEventRegisterationData: any[] = []; dataSource: any; showNoDataFoundMessage: boolean; filterText: any;
//   InternalLevels: any; ExternalLevel: any;
//   Reason: any;
//   items: any;
//   maxId: number;
//   cd: any;
//   constructor(
//     private LpuEventManagementService: LpuEventManagementService, cd: ChangeDetectorRef,
//     private MouDocumentsService: MouDocumentsService, cdRef: ChangeDetectorRef,
//     private lpuPlannerServiceService: LpuPlannerServiceService, private modalService: NgbModal,
//     private storageService: StorageService, private authService: AuthService,
//     public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
//     private fb: FormBuilder) { }
//   ngOnInit(): void {
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Event <span class="themeClr" >Registeration Admin</span> Page';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     let loginName = this.route.snapshot.params['loginName'];
//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//     }
//   }

//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         this.getSchoolData();
//         this.GetAllEventsData();
//         this.getAllProperties();
//         this.getAllPlannerSessionforReport();
//       },
//       error: _err => {
//         this.LoginFailed(_err);
//       }
//     });
//   }
//   LoginFailed(_NewError: any) {
//     this.isLoginFailed = true;
//     swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are Invalid!',
//       icon: 'warning',
//     })
//     const element = document.getElementById('EventCalender');
//     if (element) {
//       element.hidden = true;
//     }
//   }
//   getSchoolData(): void {
//     this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.allSchoolDivisions = response.item1;
//       } else {
//         this.allSchoolDivisions = [];
//       }
//     });
//   }


//   GetAllEventsData(): void {
//     this.LpuEventManagementService.GetAllEventsDetails().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EventRegisterationData = response.item1;
//           this.filteredEventRegisterationData = this.EventRegisterationData;
//           this.showNoDataFoundMessage = this.filteredEventRegisterationData.length === 0;
//           // this.isLoginFailed = false;
//         } else {
//           this.EventRegisterationData = [];
//           this.showNoDataFoundMessage = true;
//         }
//         // console.log(" data " + JSON.stringify(this.EventRegisterationData))
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });

//   }

//   filterData() {
//     const lowerCaseFilter = this.filterText.toLowerCase();
//     this.filteredEventRegisterationData = this.EventRegisterationData.filter(events => {
//       return Object.values(events).some(value =>
//         String(value).toLowerCase().includes(lowerCaseFilter)
//       );
//     });
//   }
//   recordsPerPage = 5; currentPage = 1;
//   get totalPages(): number {
//     return Math.ceil(this.filteredEventRegisterationData.length / this.recordsPerPage);
//   }
//   get pagesArray(): number[] {
//     return Array.from({ length: this.totalPages }, (_, index) => index + 1);
//   }
//   changePage(page: number): void {
//     this.currentPage = page;
//   }
//   getRecordsForCurrentPage(): any[] {
//     const startIndex = (this.currentPage - 1) * this.recordsPerPage;
//     const endIndex = startIndex + this.recordsPerPage;
//     return this.filteredEventRegisterationData.slice(startIndex, endIndex);
//   }
//   onPageChange(event: any): void {
//     this.currentPage = event.pageIndex + 1;
//     this.recordsPerPage = event.pageSize;
//   }
//   getDivisionNameById(id: number): string {
//     const idStr = id.toString();
//     let division: SchoolDivision | undefined;
//     for (const school of this.allSchoolDivisions) {
//       if (school.id === idStr) {
//         division = school;
//         break;
//       }
//     }
//     return division ? division.schoolDivision : `ID ${idStr} not found`;
//   }

//   exportToExcel(): void {
//     const fileName = 'EventDetails_report.xlsx';
//     const exportedData = this.filteredEventRegisterationData.map(item => {
//       return {
//         Objective: item.eventObjective,
//         SchoolDivision: this.getDivisionNameById(item.schoolId),
//         EventName: item.eventName,
//         StudentCount: item.alternativelyStudentCounts,
//         eventPirority: item.eventPirority,
//         modeOfConduct: item.modeOfConduct,
//         semester: item.semester,
//         startDate: this.formatDate(item.startDate),
//         endDate: this.formatDate(item.endDate),
//         BudgetAmount: item.budgetAmount,
//         Remarks: item.remarks,
//       };
//     });
//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

//     const wscols = [
//       { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
//     ];
//     ws['!cols'] = wscols;

//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//     link.download = fileName;
//     link.click();
//   }
//   formatDate(date: Date): string {
//     const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
//     return DateX;
//   }
//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }


//   ChangeApproveStatus(Id: any) {
//     const formData = new FormData();
//     formData.append('Id', Id);
//     formData.append('Action', 'Approve');

//     swal.fire({
//       title: "Reason for Disabling",
//       // text: "Disapproval reason",
//       input: 'text',
//       showCancelButton: true
//     }).then((result) => {
//       if (result.value) {
//         this.Reason = result.value;
//         const formData = new FormData();
//         formData.append('Id', Id);
//         formData.append('DisapprovalReason', this.Reason);
//         formData.append('Action', 'Approve');
//         this.handleStatusChange(formData, 'Approve');
//       } else {
//         this.showCancelledSwal();
//       }
//     });
//   }

//   private handleStatusChange(formData: FormData, action: string) {
//     this.LpuEventManagementService.ChangeStatus(formData).subscribe((data: any) => {
//       // this.mouDocumentsService.ApproveDocument(formData).subscribe((data: any) => {
//       if (action === 'Approve' && data.responseData === 'Cancel') {
//         swal.fire(
//           'No Change!',
//           ' ',
//           'error'
//         );
//       } else {
//         swal.fire(
//           ' Disabled the Record successfully !',
//           '',
//           'success'
//         ).then(() => {
//           window.location.reload();
//         });
//       }
//     });
//   }

//   private showCancelledSwal() {
//     swal.fire(
//       'Cancelled',
//       ' ',
//       'error'
//     );
//   }


//   // Edit Button logic
//   // Form group
//   formdata: FormGroup;

//    // Initialize the reactive form with validation
//    initializeForm(): void {
//     this.formdata = this.fb.group({
//       schoolname: ['', Validators.required],
//       EventObjective: ['', Validators.required],
//       eventName: ['', Validators.required],
//       eventCalender: ['', Validators.required],
//       totalStudent: ['', Validators.required],
//       obpCriteria: ['', Validators.required],
//       Mode: ['', Validators.required],
//       External: ['', Validators.required],
//       internal: ['', Validators.required],
//       category: ['', Validators.required],
//       semester: ['', Validators.required],
//       startDate: ['', Validators.required],
//       endDate: ['', Validators.required],
//       BudgetType: ['Select', Validators.required],
//       Totalbudget: [{ value: '', disabled: true }, Validators.required],
//       Remarks: ['', Validators.required],
//       SessionId: ['']
//     });

//     // Enable/disable budget field based on BudgetType selection
//     this.formdata.get('BudgetType')?.valueChanges.subscribe(val => {
//       const budgetControl = this.formdata.get('Totalbudget');
//       val === 'Select' ? budgetControl?.disable() : budgetControl?.enable();
//     });
//   }



//   @ViewChild('EditEventModal') EditEventModal: TemplateRef<any>;


//   OBPOptionsitems: any;
//   PropertiesData: any[] = []; chunkedProperties: any[][] = [];
//   properties: any[] = [];
//   getAllProperties(): void {
//     this.LpuEventManagementService.GetOBPProperties().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.OBPOptionsitems = response.item1;
//           this.OBPOptionsitems.forEach((PropertiesData: { items: string; }) => {
//             this.properties.push(PropertiesData.items);
//           });
//         }
//       }
//     });
//   }
 
//   schoolName: any = '';
//   EventObjectives: any = '';
//   eventName: any = '';
//   eventCalender: any = '';
//   totalStudent: any = '';
//   obpCriteria: any = '';
//   Mode: any = '';
//   ExternalLevels: any = '';
//   InternalLevel: any = '';
//   categoryId: any = '';
//   Semester: any = '';
//   startDate: any = '';
//   endDate: any = '';
//   selectedStartDate: any = '';
//   selectedEndDate: any = '';
//   BudgetType: any = '';
//   budgetAmount: any = '';
//   Remarks: any = '';

//   EditEventDetails(DocumentRowData: any) {
//     this.formdata.patchValue({
//       schoolname: DocumentRowData['schoolId'],
//       EventObjective: DocumentRowData['eventObjective'],
//       eventname: DocumentRowData['eventName'],
//       eventcalender: DocumentRowData['eventCalender'],
//       totalstudent: DocumentRowData['alternativelyStudentCounts'],
//       obpcriteria: DocumentRowData['obpCriteria'],
//       mode: DocumentRowData['modeOfConduct'],
//       external: DocumentRowData['externalLevel'],
//       internal: DocumentRowData['internalLevel'],
//       category: DocumentRowData['categoryId'],
//       semester: DocumentRowData['semester'],
//       startdate: DocumentRowData['startDate'],
//       enddate: DocumentRowData['endDate'],
//       budgettype: DocumentRowData['budgetType'],
//       budget: DocumentRowData['budgetAmount'],
//       remarks: DocumentRowData['remarks'],
//       SessionId: this.allPlannerSessions[0]?.id 
//     });

//     this.modalService.open(this.EditEventModal, { size: 'sm' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//       window.location.reload();
//     }).catch((res) => { });

//   }

//   allPlannerSessions: any[] = [];
//   allPlannerSessionDatas: any[] = [];
//   selectedPlannerSession: any = '0';  // default selected value
//   selectedPlannerSessionData: any = '0';  // default selected value
//   allOBPStaffData: any[] = [];

//   getAllPlannerSessionforReport(): void {
//     this.MouDocumentsService.GetAllOBPPlannerSessions().subscribe({
//       next: response => {
//         if (response.item1 && this.items?.length > 0) {
//           this.allPlannerSessionDatas = response.item1.filter(
//             (session: { id: string | number }) => +session.id >= 16 && +session.id <= this.maxId

//           );
//           // console.log(JSON.stringify(this.allPlannerSessionDatas))
//         }
//       }
//     });
//   }


//   isForm1Submitted: boolean = false;

//   get form1() {
//     return this.formdata.controls;
//   }

//   isTouchedInvalid(controlName: string): boolean {
//     const control = this.formdata.get(controlName);
//     return !!control && control.touched && control.invalid;
//   }


//   Onsubmit() {
//     const formData = new FormData();
//     formData.append('SchoolId', this.schoolname);
//     formData.append('EventObjective', this.EventObjective);
//     formData.append('EventName', this.eventname);
//     formData.append('EventType', this.eventcalender);
//     formData.append('AlternativelyStudentCounts', this.totalstudent);
//     formData.append('OBPCriteria', this.obpcriteria);
//     formData.append('ModeOfConduct', this.mode);
//     formData.append('ExternalLevel', this.ExternalLevel);
//     formData.append('InternalLevel', this.InternalLevels);
//     formData.append('CategoryId', this.CategoryId);
//     formData.append('Semester', this.semester);
//     formData.append('StartDate', this.startdate);
//     formData.append('EndDate', this.enddate);
//     formData.append('BudgetType', this.budgettype);
//     formData.append('BudgetAmount', this.budget);
//     formData.append('Remarks', this.remarks);
//     formData.append('SessionId', this.allPlannerSessions[0]?.id);
//     console.log("Form Data")
//     formData.forEach((value, key) => {
//       console.log(key, value);
//     });
//     // this.LpuEventManagementService.EventManagementNewEvent(formData).subscribe((response) => {
//     //   if (response.item1.length > 0) {
//     //     this.responses = response.item1[0];
//     //     if (this.responses.returnData === '-1') {
//     //       swal.fire(
//     //         { title: 'Something went Wrong ', icon: 'error' }
//     //       ), setTimeout(() => {
//     //         window.location.reload();
//     //       }, 112200);
//     //     } else if (this.responses.returnData === 'success') {
//     //       swal.fire(
//     //         { title: 'Event Registered Successfully: ', text: this.responses.returnData, icon: 'success' }
//     //       ), setTimeout(() => {
//     //         window.location.reload();
//     //       }, 2200);
//     //     } else if (this.responses.returnData === '-2') {
//     //       swal.fire(
//     //         { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
//     //       ), setTimeout(() => {
//     //         window.location.reload();
//     //       }, 112200);
//     //     }
//     //   }
//     // });
//   }













//   // added on 19-July-25
//   // Paginator reference
//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//    // Properties for advanced search
//    advancedSearch = {
//     sessionId: '',
//     schoolName: '',
//     semester: '',
//     eventName: '',
//     objective: '',
//     eventCategory: '',
//     obpCriteria: '',
//     internal:'',
//     startDate: null as Date | null,
//     endDate: null as Date | null
//   };
  
//   applyAdvancedSearch(): void {
//     this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
//       if (this.advancedSearch.sessionId && 
//         this.advancedSearch.sessionId !== '' && 
//         this.advancedSearch.sessionId !== '0' && 
//         item.sessionId.toString() !== this.advancedSearch.sessionId) {
//       return false;
//     }
//       // School Name filter
//       if (this.advancedSearch.schoolName && 
//           !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
//         return false;
//       }

//       // Semester filter
//       if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
//         return false;
//       }

//       // Event Name filter
//       if (this.advancedSearch.eventName && 
//           !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
//         return false;
//       }

//       // Objective filter
//       if (this.advancedSearch.objective && 
//           !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
//         return false;
//       }

//       // Event Category filter
//       if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
//         return false;
//       }

//       // OBP Criteria filter
//       if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
//         return false;
//       }

//       // Start Date filter
//       if (this.advancedSearch.startDate) {
//         const itemStartDate = item.startDate ? new Date(item.startDate) : null;
//         if (!itemStartDate || itemStartDate < new Date(this.advancedSearch.startDate)) {
//           return false;
//         }
//       }

//       // End Date filter
//       if (this.advancedSearch.endDate) {
//         const itemEndDate = item.endDate ? new Date(item.endDate) : null;
//         if (!itemEndDate || itemEndDate > new Date(this.advancedSearch.endDate)) {
//           return false;
//         }
//       }

//       return true;
//     });

//     // Reset paginator to first page
//     if (this.paginator) {
//       this.paginator.firstPage();
//     }
//   }

//   // Reset advanced search
//   resetAdvancedSearch(): void {
//     this.advancedSearch = {
//       sessionId: '',
//       schoolName: '',
//       semester: '',
//       eventName: '',
//       objective: '',
//       eventCategory: '',
//       obpCriteria: '',
//       internal:'',
//       startDate: null,
//       endDate: null
//     };
//     this.hasAnySearchCriteria = false;
//     this.filteredEventRegisterationData = [...this.EventRegisterationData];
//   }



//   // Add these properties to your component class
// showAdvancedSearch = false;
 
// // Add this method to toggle advanced search
// toggleAdvancedSearch(): void {
//   this.showAdvancedSearch = !this.showAdvancedSearch;
//   if (!this.showAdvancedSearch) {
//     this.resetAdvancedSearch();
//   }
// }

// // Add this property to track if any field has value
// hasAnySearchCriteria = false;

// // Add this method to check if any field has value
// checkSearchCriteria(): void {
//   this.hasAnySearchCriteria = Object.values(this.advancedSearch).some(value => {
//     if (value === null || value === undefined) return false;
//     if (typeof value === 'string') return value.trim() !== '';
//     return true; // For dates and other types
//   });
// }
 
// }