


// import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT, DatePipe } from '@angular/common';
// import swal from 'sweetalert2';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { MatTableDataSource } from '@angular/material/table';
// import { MouActivity } from './MouActivity';
// import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
// import * as XLSX from 'xlsx';
// import { mouActivities } from './mouActivities';

// interface Employee {
//   employeeName: string;
//   employeeCode: string;
// }
// interface SchoolDivision {
//   id: number;
//   schoolDivision: string;
// }

// @Component({
//   selector: 'MouActivityActionPlan',
//   templateUrl: './MouActivityActionPlan.component.html',
//   styleUrls: ['./MouActivityActionPlan.component.scss'],
//   standalone: false
// })
// export class MouActivityActionPlanComponent implements OnInit {

//   // --- View Childs ---
//   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
//   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
//   @ViewChild('viewActivityActionTakenModalAll') viewActivityActionTakenModalAll: TemplateRef<any>;
//   @ViewChild('activityModal') activityModal: TemplateRef<any>;
//   @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;
//   @ViewChild('AssignNewUIDModal') AssignNewUIDModal: TemplateRef<any>;

//   // --- Search & Data Variables ---
//   // Tab 1: Assign Activity
//   searchTextTab1: string = '';
//   MouActivityDocumentsMaster: any[] = []; // Master Data
//   filteredMouActivityDocuments: any[] = []; // Display Data

//   // Tab 2: Assigned by Me
//   searchTextTab2: string = '';
//   MouActivityAssignedMeMaster: any[] = []; // Master Data
//   filteredMouActivityAssignedMe: any[] = []; // Display Data

//   // Tab 3: Assigned by Others
//   searchTextTab3: string = '';
//   MouActivityAssignedOthersMaster: any[] = []; // Master Data
//   filteredMouActivityAssignedOthers: any[] = []; // Display Data

//   // --- Form & Employee Control ---
//   employeeControl = new FormControl();
//   EmployeeData: Employee[] = [];
//   filteredEmployeesData: Employee[] = [];
//   showSuggestions = false;
//   activeSuggestionIndex: number = -1;
//   ResponsiblePerson: any = '';
//   AssignedToUid: any = '';

//   // --- General Variables ---
//   SchoolDivisionInvolved: any;
//   DepartmentName: any;
//   CurrentMouTitle: any;
//   remarks: any;
//   Reason: any;
//   mouId: any;
//   startDate: any;
//   endDate: any;
//   allSchoolDivisions: SchoolDivision[] = [];
//   allPlannerSessions: any[] = [];
//   selectedPlannerSession: any = '0';
  
//   // --- User Details ---
//   EmployeeDetails: any;
//   EmployeeCode: any;
//   Department: any;
//   EmployeeName: any;
//   ContactNoX: any;
//   UserRole: any;
//   isLoginFailed: boolean = false;

//   // --- Loading & UI ---
//   loadingIndicator = false;
//   showNoDataFoundMessage: boolean = false;
//   ServerUrl: any;
//   ColumnMode = ColumnMode;
//   columns: any;
//   columnsAssigned: any;
//   headHtmlData: any[] = [];
//   mouActivities: MouActivity[] = [];
//   selectedActivityId: any = '';
//   selectedRow: any = null;
//   uploadEnabled: boolean = false;
  
//   // --- Action Taken Modal Vars ---
//   MouActionTakenDocuments: any[] = [];
//   filteredMouActionTakenDocuments: any[] = [];
//   dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  
//   // --- Specific Activity Vars ---
//   MouidX: any; IdX: any; MouTitleX: any; StartDateX: any; EndDateX: any; ActivityDetailsX: any; RemarksX: any;

//   constructor(
//     private lpuPlannerServiceService: LpuPlannerServiceService,
//     private fb: FormBuilder,
//     @Inject(DOCUMENT) _document: Document,
//     private route: ActivatedRoute,
//     private storageService: StorageService,
//     private authService: AuthService,
//     private modalService: NgbModal,
//     private mouDocumentsService: MouDocumentsService
//   ) {}

//   ngOnInit(): void {
//     this.mouActivities = mouActivities;
//     const stMain = document.getElementById('stMain');
//     if (stMain) stMain.innerHTML = '<span class="themeClr text-center"> MOU </span>Activity Action <span class="themeClr">Plan </span> <br/><span class="ms-3">   HOS /COS / Secretaries </span> ';
    
//     const imgLogo = document.getElementById('imgLogo');
//     if (imgLogo) imgLogo.style.width = '164px';

//     this.startDate = this.endDate = '';
//     this.ServerUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
//     let loginName = this.route.snapshot.params['loginName'];

//     if (loginName != '' && loginName != undefined) {
//       this.storageService.clean();
//       this.getToken(loginName);
//     }
//   }

//   // =========================================================================
//   // API CALLS (PRESERVED AS REQUESTED)
//   // =========================================================================

//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         var authToken = this.storageService.getUser();
//         if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
//           this.LoginFailed('Token Expired');
//         }
//         this.getAllPlannerSession();
//         this.GetEmployeeDetails();
//         this.GetAllActivities();
//         this.GetEmployeeData();
//         this.setupEmployeeControl();
//       },
//       error: _err => {
//         this.LoginFailed(_err);
//       }
//     });
//   }

//   getAllPlannerSession(): void {
//     this.mouDocumentsService.GetAllOBPPlannerSessions().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.allPlannerSessions = response.item1;
//         }
//       }
//     });
//   }

//   GetEmployeeDetails(): void {
//     this.mouDocumentsService.GetEmployeeDetails().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EmployeeDetails = response.item1;
//           this.EmployeeName = response.item1[0].employeeName;
//           this.EmployeeCode = '11840'; // Hardcoded as per original
//           this.ContactNoX = response.item1[0].contactNo;
//           this.Department = response.item1[0].department;
//           this.DepartmentName = response.item1[0].departmentName;
//           this.UserRole = response.item1[0].userRole;
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = false;
//           this.isLoginFailed = false;

//           this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
//           this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
//         } else {
//           this.EmployeeDetails = [];
//           this.showNoDataFoundMessage = true;
//           this.isLoginFailed = true;
//         }
//       },
//       error: err => this.LoginFailed(err)
//     });
//   }

//   // TAB 1 DATA
//   GetAllMouDocumentsForApprovals(IdCode: any): void {
//     this.mouDocumentsService.GetMouDocumentToAssignActivity(IdCode).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.MouActivityDocumentsMaster = response.item1;
//           // Apply Initial Sort
//           this.MouActivityDocumentsMaster.sort((a, b) => (b.id - a.id));
//           // Initialize filtered list
//           this.filteredMouActivityDocuments = [...this.MouActivityDocumentsMaster];
          
//           this.SchoolDivisionInvolved = this.getDivisionNameById(this.MouActivityDocumentsMaster[0].schoolDivisionInvolved);
//           this.setupColumns(this.MouActivityDocumentsMaster[0], 'tab1');
//           this.loadingIndicator = false;
//         } else {
//           this.MouActivityDocumentsMaster = [];
//           this.filteredMouActivityDocuments = [];
//           this.showNoDataFoundMessage = true;
//         }
//         // Load Tab 3 Data after Tab 1
//         this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
//       },
//       error: err => this.LoginFailed(err)
//     });
//   }

//   // TAB 2 DATA
//   GetAllActivtiesAssigned(IdCode: any, sessionId: any): void {
//     this.loadingIndicator = true;
//     this.mouDocumentsService.GetAllActivitiesAssignedwithSession(IdCode, sessionId).subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           this.MouActivityAssignedMeMaster = response.item1;
//           this.filteredMouActivityAssignedMe = [...this.MouActivityAssignedMeMaster];
          
//           // Sort
//           this.filteredMouActivityAssignedMe.sort((a, b) => b.id - a.id); // Assuming ID exists, mostly checks createdOn usually
//           this.setupColumns(this.MouActivityAssignedMeMaster[0], 'assigned');
//           this.showNoDataFoundMessage = false;
//         } else {
//           this.MouActivityAssignedMeMaster = [];
//           this.filteredMouActivityAssignedMe = [];
//           this.showNoDataFoundMessage = true;
//         }
//         setTimeout(() => { this.loadingIndicator = false; }, 1500);
//       },
//       error: err => {
//         this.loadingIndicator = false;
//         this.LoginFailed(err);
//       }
//     });
//   }

//   // TAB 3 DATA
//   GetOthersActivtiesAssigned(IdCode: any, sessionId: any): void {
//     this.loadingIndicator = true;
//     this.mouDocumentsService.GetAllActivitiesAssignedwithSession('0', sessionId).subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           this.MouActivityAssignedOthersMaster = response.item1;
          
//           // FIX: Re-apply filter if search text exists, otherwise show all
//           this.filterTab3(); 

//           this.setupColumns(this.MouActivityAssignedOthersMaster[0], 'assigned');
//           this.showNoDataFoundMessage = false;
//         } else {
//           this.MouActivityAssignedOthersMaster = [];
//           this.filteredMouActivityAssignedOthers = [];
//           this.showNoDataFoundMessage = true;
//         }
//         setTimeout(() => { this.loadingIndicator = false; }, 1500);
//       },
//       error: err => {
//         this.loadingIndicator = false;
//         this.LoginFailed(err);
//       }
//     });
//   }

//   GetAllActivities(): void {
//     this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
//       this.allSchoolDivisions = response.item1.length > 0 ? response.item1 : [];
//     });
//   }

//   GetEmployeeData(): void {
//     this.mouDocumentsService.GetEmployeeData().subscribe({
//       next: response => {
//         this.EmployeeData = response.item1.length > 0 ? response.item1 : [];
//       },
//       error: err => console.error(err)
//     });
//   }

//   UploadActivity() {
//     const formData = new FormData();
//     formData.append('MouId', this.mouId);
//     formData.append('Uid', this.AssignedToUid);
//     formData.append('ActionAssignedBy', this.EmployeeCode);
//     formData.append('Remarks', this.remarks);
//     formData.append('StartDate', this.startDate);
//     formData.append('EndDate', this.endDate);
//     formData.append('ActivityDetails', this.selectedActivityId);

//     this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
//       next: (data: any) => {
//         if (data?.item1?.[0]?.msg === 'success') {
//           this.showAlert('Action Planned Stored Successfully!', 'success');
//         } else {
//           this.showAlert('Server Error', 'error');
//         }
//       },
//       complete: () => this.clearFields()
//     });
//   }

//   UploadUID() {
//     const formData = new FormData();
//     formData.append('RecordId', this.IdX);
//     formData.append('Uid', this.AssignedToUid);
    
//     this.mouDocumentsService.ActivityPlanUpdateUID(formData).subscribe({
//       next: (data: any) => {
//         const result = data?.item1?.[0]?.msg;
//         if (result === 'Success') {
//           this.showAlert('UID Updated Successfully!', 'success');
//         } else {
//           this.showAlert('Failed to Update UID!', 'error');
//         }
//       }
//     });
//   }

//   // =========================================================================
//   // SEARCH LOGIC (REFACTORED & CONSOLIDATED)
//   // =========================================================================

//   /**
//    * Universal filter function used by all 3 tabs.
//    * Handles Text Search, 'MOU/' prefix search, and Numeric ID search.
//    */
//   genericSearch(data: any[], query: string): any[] {
//     if (!query || query.trim() === '') {
//       return [...data]; // Return copy of full data
//     }

//     const lowerQuery = query.trim().toLowerCase();

//     return data.filter(item => {
//       return Object.entries(item).some(([key, val]) => {
//         if (val === null || val === undefined) return false;
        
//         const valueString = String(val).toLowerCase();

//         // Special Logic: Search by "MOU/123" or just "123" for mouId
//         if (key === 'mouId') {
//           const numericId = Number(val);
//           if (!isNaN(numericId)) {
//              if (numericId.toString().includes(lowerQuery) || `mou/${numericId}`.toLowerCase().includes(lowerQuery)) {
//                return true;
//              }
//           }
//         }

//         // Standard substring match
//         return valueString.includes(lowerQuery);
//       });
//     });
//   }

//   // Event Handler for Tab 1
//   filterTab1() {
//     this.filteredMouActivityDocuments = this.genericSearch(this.MouActivityDocumentsMaster, this.searchTextTab1);
//   }

//   // Event Handler for Tab 2
//   filterTab2() {
//     this.filteredMouActivityAssignedMe = this.genericSearch(this.MouActivityAssignedMeMaster, this.searchTextTab2);
//   }

//   // Event Handler for Tab 3 (FIXED)
//   filterTab3() {
//     this.filteredMouActivityAssignedOthers = this.genericSearch(this.MouActivityAssignedOthersMaster, this.searchTextTab3);
//   }

//   // =========================================================================
//   // HELPER FUNCTIONS
//   // =========================================================================

//   setSessionId(event: any) {
//     const selectedId = event.target.value;
//     this.selectedPlannerSession = selectedId;
//     // Refresh both assigned tabs based on new session
//     this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
//     this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
//   }

//   setupColumns(dataRow: any, type: 'tab1' | 'assigned') {
//     if (!dataRow) return;

//     const allKeys = Object.keys(dataRow);
//     // Define excluded columns based on your original code
//     const exclusions = [
//       'newMouId', 'filePath', 'activityDetails', 'activityPerformed', 'mouStartDate', 
//       'mouEndDate', 'mouStatus', 'approvedBy', 'createdBy', 'mouId', 'schoolDivisionInvolved', 
//       'isApproved', 'approvalDate', 'disapprovalReason', 'uid', 'id', 'spocContactNo',
//       'createdOn', 'actionAssignedBy', 'sessionAcademicYear', 'mouTitle'
//     ];

//     const filteredCols = allKeys.filter(key => !exclusions.includes(key));

//     if (type === 'tab1') {
//       this.columns = filteredCols;
//     } else {
//       this.columnsAssigned = filteredCols;
//     }
//   }

//   setupEmployeeControl() {
//     this.employeeControl.valueChanges
//       .pipe(debounceTime(300), distinctUntilChanged())
//       .subscribe(() => this.onInput());
//   }

//   onInput() {
//     const inputValue = (this.employeeControl.value || '').toLowerCase();
//     if (inputValue) {
//       this.filteredEmployeesData = this.EmployeeData.filter(employee =>
//         employee.employeeName.toLowerCase().includes(inputValue) || 
//         employee.employeeCode.toLowerCase().includes(inputValue)
//       ).slice(0, 10);
//     } else {
//       this.filteredEmployeesData = [];
//     }
//     this.showSuggestions = true;
//     this.activeSuggestionIndex = -1;
//   }

//   selectEmployee(employee: Employee) {
//     this.ResponsiblePerson = employee.employeeCode;
//     this.AssignedToUid = employee.employeeCode;
//     this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
//     this.filteredEmployeesData = [];
//     this.showSuggestions = false;
//     this.checkFormValidity();
//     this.checkUIDValidity();
//   }

//   onKeydown(event: KeyboardEvent) {
//     if (this.filteredEmployeesData.length > 0) {
//       if (event.key === 'ArrowDown') {
//         this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.filteredEmployeesData.length;
//       } else if (event.key === 'ArrowUp') {
//         this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.filteredEmployeesData.length) % this.filteredEmployeesData.length;
//       } else if (event.key === 'Enter') {
//         if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.filteredEmployeesData.length) {
//           this.selectEmployee(this.filteredEmployeesData[this.activeSuggestionIndex]);
//         }
//       }
//     }
//   }

//   hideSuggestions() {
//     setTimeout(() => this.showSuggestions = false, 200);
//   }

//   checkFormValidity(): void {
//     this.uploadEnabled = !!(this.mouId && this.mouId !== 'select Id'
//       && this.partnerName && this.ResponsiblePerson
//       && this.startDate && this.endDate
//       && this.AssignedToUid && this.AssignedToUid.length > 4
//       && this.remarks && this.remarks.length > 5);
//   }

//   checkUIDValidity(): void {
//     this.uploadEnabled = this.IdX !== '' && this.AssignedToUid != '';
//   }

//   clearFields(): void {
//     this.mouId = this.startDate = this.endDate = this.ResponsiblePerson = '';
//     this.remarks = '';
//   }

//   onSelect(a: any) {
//     this.mouId = a['mouId'];
//     this.CurrentMouTitle = a['mouTitle'];
//     this.modalService.open(this.viewDescModal, { size: 'sm' });
//   }

//   AssignUid(rows: any) {
//     this.MouidX = rows['mouId'];
//     this.IdX = rows['id'];
//     this.MouTitleX = rows['mouTitle'];
//     this.StartDateX = rows['startDate'];
//     this.EndDateX = rows['endDate'];
//     this.ActivityDetailsX = rows['activityDetails'];
//     this.RemarksX = rows['remarks'];
//     this.modalService.open(this.AssignNewUIDModal, { size: 'sm' }).result.then(() => window.location.reload()).catch(() => {});
//   }

//   ViewAllActionTaken(rows: any) {
//     this.MouidX = rows['mouId'];
//     this.GetAllActionDetails(this.MouidX);
//     this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'sm' }).result.then(() => window.location.reload()).catch(() => {});
//   }

//   GetAllActionDetails(id: any) {
//     this.mouDocumentsService.GetMouActivityActionTakenDetails(id).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.dataSource = response.item1; // Note: Original code assigned array to datasource, usually dataSource is MatTableDataSource
//         this.allMouActionTakenDetails = response.item1;
//       } else {
//         this.allMouActionTakenDetails = [];
//       }
//     });
//   }

//   openActivityModal(row: any): void {
//     this.selectedRow = row;
//     this.modalService.open(this.activityModal, { size: 'lg' });
//   }

//   // --- EXPORT FUNCTIONS ---

//   exportToExcel(data: any[], type: 'tab2' | 'tab3'): void {
//     const fileName = 'Mou_Document_report.xlsx';
//     const exportedData = data.map(item => ({
//       NewMOUId: item.newMouId ?? 'N/A',
//       OldMOUId: "MOU/" + item.mouId,
//       'Name of Mou Organisation': item.mouTitle,
//       'MOU Activity Assigned to Faculty UID': item.uid,
//       'Activity Start Date': item.startDate,
//       'Activity End Date': item.endDate,
//       'Remarks': item.remarks,
//       'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails),
//       'Date Assigned': item.createdOn,
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportedData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, fileName);
//   }

//   // Wrappers for buttons
//   exportTab1(): void {
//     // Logic from original exportToExcel()
//     this.exportToExcelLegacy(this.MouActivityDocumentsMaster);
//   }
//   exportTab2(): void { this.exportToExcel(this.filteredMouActivityAssignedMe, 'tab2'); }
//   exportTab3(): void { this.exportToExcel(this.filteredMouActivityAssignedOthers, 'tab3'); }

//   exportToExcelLegacy(data: any[]): void {
//      // Original logic kept for Tab 1 format
//     const exportedData = data.map(item => ({
//       NewMOUId: item.newMouId ?? 'N/A',
//       OldMOUId: "MOU/" + item.mouId,
//       'Name of Mou Organisation': item.mouTitle,
//       'Uploaded By': item.createdBy ?? 'N/A',
//       'SPOC Name': item.spocName ?? 'N/A',
//       'SPOC Email': item.spocEmailId ?? 'N/A',
//       'SPOC Contact': item.spocContactNo ?? 'N/A',
//       'Status': item.isApproved == 1 ? 'Approved' : 'Pending',
//       'Approval Date': item.approvalDate ?? 'N/A',
//       'Start': item.mouStartDate, 'End': item.mouEndDate,
//       'Link': item.filePath
//     }));
//     const ws = XLSX.utils.json_to_sheet(exportedData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, 'Mou_Report.xlsx');
//   }

//   // --- UTILS ---
//   LoginFailed(_NewError: any) {
//     this.isLoginFailed = true;
//     swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
//     const element = document.getElementById('ActivityPage');
//     if (element) element.hidden = true;
//   }

//   private showAlert(title: string, icon: 'success' | 'error') {
//     swal.fire({ title, icon }).then(() => window.location.reload());
//   }

//   removeNumberPrefix(activityDetails: string): string {
//     return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
//   }
  
//   getDivisionNameById(id: number): string {
//     const division = this.allSchoolDivisions.find(s => +s.id === +id);
//     return division ? division.schoolDivision : `ID ${id} not found`;
//   }

//   onSelectFile(a: any) { window.open(a.filePath, '_blank'); }
//   onSelectFileX(a: any) { window.open(this.ServerUrl + a.filePath, '_blank'); }
//   onSelectActivityDocument(a: any) { window.open(a.actionTakenDocument, '_blank'); }
//   onActivitySelected(event: any) { this.selectedActivityId = event.target.value; }
  
//   // Placeholder props to satisfy view bindings if any were missed
//   partnerNamesMap: { [key: number]: string } = {};
//   partnerName: string | undefined;
//   selectedId: number | undefined;
//   MouPartner: any;
//   allMouActionTakenDetails: any; 
// }



