import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT, DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { MatTableDataSource } from '@angular/material/table';
import { MouActivity } from './MouActivity';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import * as XLSX from 'xlsx';
import { mouActivities } from './mouActivities';

interface Employee {
  employeeName: string;
  employeeCode: string;
}
interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'MouActivityActionPlan',
  templateUrl: './MouActivityActionPlan.component.html',
  styleUrls: ['./MouActivityActionPlan.component.scss'],
  standalone: false
})
export class MouActivityActionPlanComponent implements OnInit {

  // --- View Childs ---
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModalAll') viewActivityActionTakenModalAll: TemplateRef<any>;
  @ViewChild('activityModal') activityModal: TemplateRef<any>;
  @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;
  @ViewChild('AssignNewUIDModal') AssignNewUIDModal: TemplateRef<any>;

  // --- Search & Data Variables ---
  // Tab 1: Assign Activity
  searchTextTab1: string = '';
  MouActivityDocumentsMaster: any[] = []; // Master Data
  filteredMouActivityDocuments: any[] = []; // Display Data

  // Tab 2: Assigned by Me
  searchTextTab2: string = '';
  MouActivityAssignedMeMaster: any[] = []; // Master Data
  filteredMouActivityAssignedMe: any[] = []; // Display Data

  // Tab 3: Assigned by Others
  searchTextTab3: string = '';
  MouActivityAssignedOthersMaster: any[] = []; // Master Data
  filteredMouActivityAssignedOthers: any[] = []; // Display Data

  // --- Form & Employee Control ---
  employeeControl = new FormControl();
  EmployeeData: Employee[] = [];
  filteredEmployeesData: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex: number = -1;
  ResponsiblePerson: any = '';
  AssignedToUid: any = '';

  // --- General Variables ---
  SchoolDivisionInvolved: any;
  DepartmentName: any;
  CurrentMouTitle: any;
  remarks: any;
  Reason: any;
  mouId: any;
  startDate: any;
  endDate: any;
  allSchoolDivisions: SchoolDivision[] = [];
  allPlannerSessions: any[] = [];
  selectedPlannerSession: any = '0';
  
  // --- User Details ---
  EmployeeDetails: any;
  EmployeeCode: any;
  Department: any;
  EmployeeName: any;
  ContactNoX: any;
  UserRole: any;
  isLoginFailed: boolean = false;

  // --- Loading & UI ---
  loadingIndicator = false;
  showNoDataFoundMessage: boolean = false;
  ServerUrl: any;
  ColumnMode = ColumnMode;
  columns: any;
  columnsAssigned: any;
  headHtmlData: any[] = [];
  mouActivities: MouActivity[] = [];
  selectedActivityId: any = '';
  selectedRow: any = null;
  uploadEnabled: boolean = false;
  
  // --- Action Taken Modal Vars ---
  MouActionTakenDocuments: any[] = [];
  filteredMouActionTakenDocuments: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  
  // --- Specific Activity Vars ---
  MouidX: any; IdX: any; MouTitleX: any; StartDateX: any; EndDateX: any; ActivityDetailsX: any; RemarksX: any;

  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) _document: Document,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService
  ) {}

  ngOnInit(): void {
    this.mouActivities = mouActivities;
    const stMain = document.getElementById('stMain');
    if (stMain) stMain.innerHTML = '<span class="themeClr text-center"> MOU </span>Activity Action <span class="themeClr">Plan </span> <br/><span class="ms-3">   HOS /COS / Secretaries </span> ';
    
    const imgLogo = document.getElementById('imgLogo');
    if (imgLogo) imgLogo.style.width = '164px';

    this.startDate = this.endDate = '';
    this.ServerUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.storageService.clean();
      this.getToken(loginName);
    }
  }

  // =========================================================================
  // API CALLS (PRESERVED AS REQUESTED)
  // =========================================================================

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
        this.getAllPlannerSession();
        this.GetEmployeeDetails();
        this.GetAllActivities();
        this.GetEmployeeData();
        this.setupEmployeeControl();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  getAllPlannerSession(): void {
    this.mouDocumentsService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
        }
      }
    });
  }

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = '11840'; // Hardcoded as per original
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.UserRole = response.item1[0].userRole;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;

          this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
          this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
        }
      },
      error: err => this.LoginFailed(err)
    });
  }

  // TAB 1 DATA
  GetAllMouDocumentsForApprovals(IdCode: any): void {
    this.mouDocumentsService.GetMouDocumentToAssignActivity(IdCode).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouActivityDocumentsMaster = response.item1;
          // Apply Initial Sort
          this.MouActivityDocumentsMaster.sort((a, b) => (b.id - a.id));
          // Initialize filtered list
          this.filteredMouActivityDocuments = [...this.MouActivityDocumentsMaster];
          
          this.SchoolDivisionInvolved = this.getDivisionNameById(this.MouActivityDocumentsMaster[0].schoolDivisionInvolved);
          this.setupColumns(this.MouActivityDocumentsMaster[0], 'tab1');
          this.loadingIndicator = false;
        } else {
          this.MouActivityDocumentsMaster = [];
          this.filteredMouActivityDocuments = [];
          this.showNoDataFoundMessage = true;
        }
        // Load Tab 3 Data after Tab 1
        this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
      },
      error: err => this.LoginFailed(err)
    });
  }

  // TAB 2 DATA
  GetAllActivtiesAssigned(IdCode: any, sessionId: any): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.GetAllActivitiesAssignedwithSession(IdCode, sessionId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.MouActivityAssignedMeMaster = response.item1;
          this.filteredMouActivityAssignedMe = [...this.MouActivityAssignedMeMaster];
          
          // Sort
          this.filteredMouActivityAssignedMe.sort((a, b) => b.id - a.id); // Assuming ID exists, mostly checks createdOn usually
          this.setupColumns(this.MouActivityAssignedMeMaster[0], 'assigned');
          this.showNoDataFoundMessage = false;
        } else {
          this.MouActivityAssignedMeMaster = [];
          this.filteredMouActivityAssignedMe = [];
          this.showNoDataFoundMessage = true;
        }
        setTimeout(() => { this.loadingIndicator = false; }, 1500);
      },
      error: err => {
        this.loadingIndicator = false;
        this.LoginFailed(err);
      }
    });
  }

  // TAB 3 DATA
  GetOthersActivtiesAssigned(IdCode: any, sessionId: any): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.GetAllActivitiesAssignedwithSession('0', sessionId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.MouActivityAssignedOthersMaster = response.item1;
          console.log(JSON.stringify(this.MouActivityAssignedOthersMaster))
          // FIX: Re-apply filter if search text exists, otherwise show all
          this.filterTab3(); 

          this.setupColumns(this.MouActivityAssignedOthersMaster[0], 'assigned');
          this.showNoDataFoundMessage = false;
        } else {
          this.MouActivityAssignedOthersMaster = [];
          this.filteredMouActivityAssignedOthers = [];
          this.showNoDataFoundMessage = true;
        }
        setTimeout(() => { this.loadingIndicator = false; }, 1500);
      },
      error: err => {
        this.loadingIndicator = false;
        this.LoginFailed(err);
      }
    });
  }

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      this.allSchoolDivisions = response.item1.length > 0 ? response.item1 : [];
    });
  }

  GetEmployeeData(): void {
    this.mouDocumentsService.GetEmployeeData().subscribe({
      next: response => {
        this.EmployeeData = response.item1.length > 0 ? response.item1 : [];
      },
      error: err => console.error(err)
    });
  }

  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('Uid', this.AssignedToUid);
    formData.append('ActionAssignedBy', this.EmployeeCode);
    formData.append('Remarks', this.remarks);
    formData.append('StartDate', this.startDate);
    formData.append('EndDate', this.endDate);
    formData.append('ActivityDetails', this.selectedActivityId);

    this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
      next: (data: any) => {
        if (data?.item1?.[0]?.msg === 'success') {
          this.showAlert('Action Planned Stored Successfully!', 'success');
        } else {
          this.showAlert('Server Error', 'error');
        }
      },
      complete: () => this.clearFields()
    });
  }

  UploadUID() {
    const formData = new FormData();
    formData.append('RecordId', this.IdX);
    formData.append('Uid', this.AssignedToUid);
    
    this.mouDocumentsService.ActivityPlanUpdateUID(formData).subscribe({
      next: (data: any) => {
        const result = data?.item1?.[0]?.msg;
        if (result === 'Success') {
          this.showAlert('UID Updated Successfully!', 'success');
        } else {
          this.showAlert('Failed to Update UID!', 'error');
        }
      }
    });
  }

  // =========================================================================
  // SEARCH LOGIC (REFACTORED & CONSOLIDATED)
  // =========================================================================

  /**
   * Universal filter function used by all 3 tabs.
   * Handles Text Search, 'MOU/' prefix search, and Numeric ID search.
   */
  genericSearch(data: any[], query: string): any[] {
    if (!query || query.trim() === '') {
      return [...data]; // Return copy of full data
    }

    const lowerQuery = query.trim().toLowerCase();

    return data.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val === null || val === undefined) return false;
        
        const valueString = String(val).toLowerCase();

        // Special Logic: Search by "MOU/123" or just "123" for mouId
        if (key === 'mouId') {
          const numericId = Number(val);
          if (!isNaN(numericId)) {
             if (numericId.toString().includes(lowerQuery) || `mou/${numericId}`.toLowerCase().includes(lowerQuery)) {
               return true;
             }
          }
        }

        // Standard substring match
        return valueString.includes(lowerQuery);
      });
    });
  }

  // Event Handler for Tab 1
  filterTab1() {
    this.filteredMouActivityDocuments = this.genericSearch(this.MouActivityDocumentsMaster, this.searchTextTab1);
  }

  // Event Handler for Tab 2
  filterTab2() {
    this.filteredMouActivityAssignedMe = this.genericSearch(this.MouActivityAssignedMeMaster, this.searchTextTab2);
  }

  // Event Handler for Tab 3 (FIXED)
  filterTab3() {
    this.filteredMouActivityAssignedOthers = this.genericSearch(this.MouActivityAssignedOthersMaster, this.searchTextTab3);
  }

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  setSessionId(event: any) {
    const selectedId = event.target.value;
    this.selectedPlannerSession = selectedId;
    // Refresh both assigned tabs based on new session
    this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
    this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
  }

  setupColumns(dataRow: any, type: 'tab1' | 'assigned') {
    if (!dataRow) return;

    const allKeys = Object.keys(dataRow);
    // Define excluded columns based on your original code
    const exclusions = [
      'newMouId', 'filePath', 'activityDetails', 'activityPerformed', 'mouStartDate', 
      'mouEndDate', 'mouStatus', 'approvedBy', 'createdBy', 'mouId', 'schoolDivisionInvolved', 
      'isApproved', 'approvalDate', 'disapprovalReason', 'uid', 'id', 'spocContactNo',
      'createdOn', 'actionAssignedBy', 'sessionAcademicYear', 'mouTitle'
    ];

    const filteredCols = allKeys.filter(key => !exclusions.includes(key));

    if (type === 'tab1') {
      this.columns = filteredCols;
    } else {
      this.columnsAssigned = filteredCols;
    }
  }

  setupEmployeeControl() {
    this.employeeControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.onInput());
  }

  onInput() {
    const inputValue = (this.employeeControl.value || '').toLowerCase();
    if (inputValue) {
      this.filteredEmployeesData = this.EmployeeData.filter(employee =>
        employee.employeeName.toLowerCase().includes(inputValue) || 
        employee.employeeCode.toLowerCase().includes(inputValue)
      ).slice(0, 10);
    } else {
      this.filteredEmployeesData = [];
    }
    this.showSuggestions = true;
    this.activeSuggestionIndex = -1;
  }

  selectEmployee(employee: Employee) {
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkFormValidity();
    this.checkUIDValidity();
  }

  onKeydown(event: KeyboardEvent) {
    if (this.filteredEmployeesData.length > 0) {
      if (event.key === 'ArrowDown') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.filteredEmployeesData.length;
      } else if (event.key === 'ArrowUp') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.filteredEmployeesData.length) % this.filteredEmployeesData.length;
      } else if (event.key === 'Enter') {
        if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.filteredEmployeesData.length) {
          this.selectEmployee(this.filteredEmployeesData[this.activeSuggestionIndex]);
        }
      }
    }
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  checkFormValidity(): void {
    this.uploadEnabled = !!(this.mouId && this.mouId !== 'select Id'
      && this.partnerName && this.ResponsiblePerson
      && this.startDate && this.endDate
      && this.AssignedToUid && this.AssignedToUid.length > 4
      && this.remarks && this.remarks.length > 5);
  }

  checkUIDValidity(): void {
    this.uploadEnabled = this.IdX !== '' && this.AssignedToUid != '';
  }

  clearFields(): void {
    this.mouId = this.startDate = this.endDate = this.ResponsiblePerson = '';
    this.remarks = '';
  }

  onSelect(a: any) {
    this.mouId = a['mouId'];
    this.CurrentMouTitle = a['mouTitle'];
    this.modalService.open(this.viewDescModal, { size: 'sm' });
  }

  AssignUid(rows: any) {
    this.MouidX = rows['mouId'];
    this.IdX = rows['id'];
    this.MouTitleX = rows['mouTitle'];
    this.StartDateX = rows['startDate'];
    this.EndDateX = rows['endDate'];
    this.ActivityDetailsX = rows['activityDetails'];
    this.RemarksX = rows['remarks'];
    this.modalService.open(this.AssignNewUIDModal, { size: 'sm' }).result.then(() => window.location.reload()).catch(() => {});
  }
  ViewAllActionTaken(rows: any) {
    this.MouidX = rows['mouId'];
    this.GetAllActionDetails(this.MouidX);
    this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'sm' }).result.then((result) => {      
      window.location.reload();
    }).catch((res) => { });
  }
  // ViewAllActionTaken(rows: any) {
  //   this.MouidX = rows['mouId'];
  //   this.GetAllActionDetails(this.MouidX);
  //   this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'sm' }).result.then(() => window.location.reload()).catch(() => {});
  // }

  GetAllActionDetails(id: any) {
    this.mouDocumentsService.GetMouActivityActionTakenDetails(id).subscribe((response) => {
      if (response.item1.length > 0) {
        this.dataSource = response.item1; // Note: Original code assigned array to datasource, usually dataSource is MatTableDataSource
        this.allMouActionTakenDetails = response.item1;
      } else {
        this.allMouActionTakenDetails = [];
      }
    });
  }
    openActivityModal(row: any): void {
    this.selectedRow = row;
    this.modalService.open(this.activityModal, { size: 'lg' }).result.then((result) => {
      // console.log("Modal closed" + result);
    });
  }

  // openActivityModal(row: any): void {
  //   this.selectedRow = row;
  //   this.modalService.open(this.activityModal, { size: 'lg' });
  // }

  // --- EXPORT FUNCTIONS ---

  exportToExcel(data: any[], type: 'tab2' | 'tab3'): void {
    const fileName = 'Mou_Document_report.xlsx';
    const exportedData = data.map(item => ({
      NewMOUId: item.newMouId ?? 'N/A',
      OldMOUId: "MOU/" + item.mouId,
      'Name of Mou Organisation': item.mouTitle,
      'MOU Activity Assigned to Faculty UID': item.uid,
      'Activity Start Date': item.startDate,
      'Activity End Date': item.endDate,
      'Remarks': item.remarks,
      'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails),
      'Date Assigned': item.createdOn,
    }));

    const ws = XLSX.utils.json_to_sheet(exportedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }

  // Wrappers for buttons
  exportTab1(): void {
    // Logic from original exportToExcel()
    this.exportToExcelLegacy(this.MouActivityDocumentsMaster);
  }
  exportTab2(): void { this.exportToExcel(this.filteredMouActivityAssignedMe, 'tab2'); }
  exportTab3(): void { this.exportToExcel(this.filteredMouActivityAssignedOthers, 'tab3'); }

  exportToExcelLegacy(data: any[]): void {
     // Original logic kept for Tab 1 format
    const exportedData = data.map(item => ({
      NewMOUId: item.newMouId ?? 'N/A',
      OldMOUId: "MOU/" + item.mouId,
      'Name of Mou Organisation': item.mouTitle,
      'Uploaded By': item.createdBy ?? 'N/A',
      'SPOC Name': item.spocName ?? 'N/A',
      'SPOC Email': item.spocEmailId ?? 'N/A',
      'SPOC Contact': item.spocContactNo ?? 'N/A',
      'Status': item.isApproved == 1 ? 'Approved' : 'Pending',
      'Approval Date': item.approvalDate ?? 'N/A',
      'Start': item.mouStartDate, 'End': item.mouEndDate,
      'Link': item.filePath
    }));
    const ws = XLSX.utils.json_to_sheet(exportedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Mou_Report.xlsx');
  }

  // --- UTILS ---
  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
    const element = document.getElementById('ActivityPage');
    if (element) element.hidden = true;
  }

  private showAlert(title: string, icon: 'success' | 'error') {
    swal.fire({ title, icon }).then(() => window.location.reload());
  }

  removeNumberPrefix(activityDetails: string): string {
    return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
  }
  
  getDivisionNameById(id: number): string {
    const division = this.allSchoolDivisions.find(s => +s.id === +id);
    return division ? division.schoolDivision : `ID ${id} not found`;
  }

  onSelectFile(a: any) { window.open(a.filePath, '_blank'); }
  onSelectFileX(a: any) { window.open(this.ServerUrl + a.filePath, '_blank'); }
  onSelectActivityDocument(a: any) { window.open(a.actionTakenDocument, '_blank'); }
  onActivitySelected(event: any) { this.selectedActivityId = event.target.value; }
  
  // Placeholder props to satisfy view bindings if any were missed
  partnerNamesMap: { [key: number]: string } = {};
  partnerName: string | undefined;
  selectedId: number | undefined;
  MouPartner: any;
  allMouActionTakenDetails: any; 
}
// import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import { _MatPaginatorBase } from '@angular/material/paginator';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT } from '@angular/common';
// import { DatePipe } from '@angular/common';
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
//   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
//   @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
//   @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
//   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
//   @ViewChild('viewActivityActionTakenModalAll') viewActivityActionTakenModalAll: TemplateRef<any>;
//   @ViewChild('activityModal') activityModal: TemplateRef<any>;
//   @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;
//   @ViewChild('AssignNewUIDModal') AssignNewUIDModal: TemplateRef<any>;

//   searchQuery: any;
//   filteredMouActivityDocuments: any[] = [];
//   SchoolDivisionInvolved: any;
//   DepartmentName: any;
//   CurrentMouTitle: any;
//   remarks: any;
//   EmployeeData: Employee[] = [];
//   filteredEmployeesData: Employee[] = [];
//   Reason: any;
//   AssignedToUid: any = '';
//   filteredMouActivityAssigned: any[] = [];
//   MouActivityAssigned: any[] = [];
//   searchQueryx: any;
// searchQueryxx:any;


//   clearFields(): void {
//     this.mouId = this.startDate = this.endDate = this.ResponsiblePerson = '';
//   }


//   employeeControl = new FormControl();
//   employees: Employee[] = [];
//   filteredEmployees: Employee[] = [];
//   showSuggestions = false;
//   activeSuggestionIndex: number = -1;

//   dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
//   @ViewChild('fileInput') fileInput!: ElementRef;
//   isLogin: boolean = false;
//   loadingIndicator = false; showNoDataFoundMessage: boolean = false;
//   allSchoolDivisions: SchoolDivision[] = [];
//   userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];
//   MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];
//   errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
//   fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
//   filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";

//   @ViewChild('stageModal') stageModal: TemplateRef<any>;
//   @ViewChild('divstagesHistory') divstagesHistory: TemplateRef<any>;
//   @ViewChild('divstagesHistoryFiles') divstagesHistoryFiles: TemplateRef<any>;

//   TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
//   selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; startDate: any; endDate: any; EmployeeDetails: any;
//   EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: any = '';
//   ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; columnsAssigned: any; headHtmlData: any[] = []; responsiblePerson: string = '';
//   constructor(private Agreement: AgreementEntryService,
//     private lpuPlannerServiceService: LpuPlannerServiceService,
//     private datePipe: DatePipe,
//     private fb: FormBuilder, private cdRef: ChangeDetectorRef,
//     @Inject(DOCUMENT) _document: Document,
//     private route: ActivatedRoute, private storageService: StorageService,
//     private authService: AuthService,
//     private modalService: NgbModal,
//     private mouDocumentsService: MouDocumentsService,) {
//     this.form = this.fb.group({
//       published: true,
//       credentials: this.fb.array([]),
//     });
//   }

//   ngOnInit(): void {
//     this.mouActivities = mouActivities;
//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr text-center"> MOU </span>Activity Action <span class="themeClr">Plan </span> <br/><span class="ms-3">   HOS /COS / Secretaries </span> ';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

//     //const currentDate = new Date();
//     this.startDate = this.endDate = '';// this.formatDate(currentDate);
//     // this.ServerUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
//     this.ServerUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
//     let loginName = this.route.snapshot.params['loginName'];

//     if (loginName != '' && loginName != undefined) {
//       this.storageService.clean();
//       this.getToken(loginName);
//     }
//   }
//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         var authToken = this.storageService.getUser();
//         if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
//           this.LoginFailed('Token Expired');
//         }
//         this.getAllActivitiesDetails();
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

//   // aaded on 28-may-25

//   allPlannerSessions: any[] = [];
//   selectedPlannerSession: any = '0';  // default selected value
//   allOBPStaffData: any[] = [];
//   getAllActivitiesDetails(): void {
//     this.mouDocumentsService.GetAllActivities().subscribe({
//       next: response => {
//         if (response.item1) {
//           // console.log(JSON.stringify(response.item1));
//         }
//       }
//     })
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


//   UserRole: any;
//   GetEmployeeDetails(): void {
//     this.mouDocumentsService.GetEmployeeDetails().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EmployeeDetails = response.item1;
//           // console.log(JSON.stringify(this.EmployeeDetails))
//           this.EmployeeName = response.item1[0].employeeName;
//           this.EmployeeCode ='11840';// response.item1[0].employeeCode;
//           this.ContactNoX = response.item1[0].contactNo;
//           this.Department = response.item1[0].department;
//           this.DepartmentName = response.item1[0].departmentName;
//           this.UserRole = response.item1[0].userRole;
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = false;
//           this.isLoginFailed = false;
//           // if(this.UserRole!=null)
//           // {
//           this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
//           this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
         
//         } else {
//           this.EmployeeDetails = [];
//           this.showNoDataFoundMessage = true;
//           this.isLoginFailed = true;
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

//     GetAllMouDocumentsForApprovals(IdCode: any): void {
//     this.mouDocumentsService.GetMouDocumentToAssignActivity(IdCode).subscribe({
//       // this.mouDocumentsService.MouDocumentsforApproval(IdCode).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.filteredMouActivityDocuments = this.MouActivityDocuments = response.item1;
//           this.dataSource.data = this.MouActivityDocuments;
//           //console.log(JSON.stringify(this.MouActivityDocuments));
//           this.MouActivityDocuments.sort((a, b) => {
//             return (b.id - a.id);
//           });
//           this.loadingIndicator = false;
//           this.SchoolDivisionInvolved = this.MouActivityDocuments[0].schoolDivisionInvolved;
//           this.SchoolDivisionInvolved = this.getDivisionNameById(this.SchoolDivisionInvolved);
//           this.columns = []; this.headHtmlData = [];
//           this.headHtmlData = this.MouActivityDocuments[0];
//           this.columns = Object.keys(this.MouActivityDocuments[0]);
//           this.columns = this.columns.filter((item: any) => item !== 'newMouId' && item !== 'filePath' && item !== 'activityDetails' && item !== 'activityPerformed' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus' && item !== 'approvedBy' && item !== 'createdBy' && item !== 'mouId' && item !== 'schoolDivisionInvolved' && item !== 'isApproved' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'spocContactNo');
//           // this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus' && item !== 'approvedBy'&& item !== 'createdBy' && item !== 'mouId' && item !== 'schoolDivisionInvolved' && item !== 'isApproved' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'spocContactNo');
//           this.columns.push()
//           this.loadingIndicator = false;

//         } else {
//           this.dataSource.data = this.MouActivityDocuments = [];
//           this.showNoDataFoundMessage = true;
//         }
//          this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }


//    GetAllActivtiesAssigned(IdCode: any, sessionId: any): void {
//     // Show loader before request starts
//     this.loadingIndicator = true;
//     this.showNoDataFoundMessage = false;

//     this.mouDocumentsService.GetAllActivitiesAssignedwithSession(IdCode, sessionId).subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           this.filteredMouActivityAssigned = this.MouActivityAssigned = response.item1;
//           this.dataSource.data = this.MouActivityAssigned;

//           this.MouActivityDocuments.sort((a, b) => b.id - a.id);

//           // Setup columns
//           this.columnsAssigned = [];
//           this.headHtmlData = this.MouActivityAssigned[0];
//           this.columnsAssigned = Object.keys(this.headHtmlData);
//           this.columnsAssigned = this.columnsAssigned.filter((item: string) =>
//             ![
//               'filePath', 'activityDetails', 'mouStartDate', 'mouEndDate', 'mouStatus', 'newMouId',
//               'mouTitle', 'actionAssignedBy', 'uid', 'createdBy', 'createdOn', 'mouId', 'id', 'sessionAcademicYear'
//             ].includes(item)
//           );

//           this.showNoDataFoundMessage = false;
//         } else {
//           this.dataSource.data = this.MouActivityDocuments = this.filteredMouActivityAssigned = this.MouActivityAssigned = [];
//           this.showNoDataFoundMessage = true;
//         }

//         // Delay hiding the loader for 2.5 seconds
//         setTimeout(() => {
//           this.loadingIndicator = false;
//         }, 2500);
//       },
//       error: err => {
//         this.dataSource.data = this.MouActivityDocuments = this.filteredMouActivityAssigned = this.MouActivityAssigned = [];
//         this.showNoDataFoundMessage = true;
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = true;
//         }, 2500);

//         this.LoginFailed(err);
//       }
//     });
//   }

//   filteredOthersMouActivityAssigned: any[] = [];
// MouActivityAssigneds:any[]=[];
//   //  GetOthersActivtiesAssigned(IdCode: any, sessionId: any): void {
//   //   // Show loader before request starts
//   //   this.loadingIndicator = true;
//   //   this.showNoDataFoundMessage = false;

//   //   this.mouDocumentsService.GetAllActivitiesAssignedwithSession('0', sessionId).subscribe({
//   //     next: response => {
//   //       if (response.item1 && response.item1.length > 0) {
//   //         this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds = response.item1;
//   //         this.dataSource.data = this.MouActivityAssigneds;
//   //         alert(JSON.stringify(this.MouActivityAssigneds.length))
//   //         // this.MouActivityDocuments.sort((a, b) => b.id - a.id);
//   //         this.filteredOthersMouActivityAssigned = [...this.MouActivityAssigneds];

//   //         // Setup columns
//   //         this.columnsAssigned = [];
//   //         this.headHtmlData = this.MouActivityAssigneds[0];
//   //         this.columnsAssigned = Object.keys(this.headHtmlData);
//   //         this.columnsAssigned = this.columnsAssigned.filter((item: string) =>
//   //           ![
//   //             'filePath', 'activityDetails', 'mouStartDate', 'mouEndDate', 'mouStatus', 'newMouId',
//   //             'mouTitle', 'actionAssignedBy*', 'uid*', 'createdBy', 'createdOn', 'mouId', 'id', 'sessionAcademicYear'
//   //           ].includes(item)
//   //         );

//   //         this.showNoDataFoundMessage = false;
//   //       } else {
//   //         this.dataSource.data = this.MouActivityDocuments = this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds = [];
//   //         this.showNoDataFoundMessage = true;
//   //       }

//   //       // Delay hiding the loader for 2.5 seconds
//   //       setTimeout(() => {
//   //         this.loadingIndicator = false;
//   //       }, 2500);
//   //     },
//   //     error: err => {
//   //       this.dataSource.data = this.MouActivityDocuments = this.filteredOthersMouActivityAssigned = this.MouActivityAssigned = [];
//   //       this.showNoDataFoundMessage = true;
//   //       setTimeout(() => {
//   //         this.loadingIndicator = false;
//   //         this.showNoDataFoundMessage = true;
//   //       }, 2500);

//   //       this.LoginFailed(err);
//   //     }
//   //   });
//   // }


//    // =========================================================================
//   // FIXED SEARCH LOGIC FOR 'OthersAllAssignActivities' TAB
//   // =========================================================================

//   /**
//    * Filters the assigned activities based on the text search query.
//    * FIX: Added logic to reset the filtered list when the search query is empty.
//    */
//   searchxxxy(): void {
//     const query = this.searchQueryxx.trim().toLowerCase();

//     // FIX 1: If the search query is empty, reset the filtered list to the full master list.
//     if (query === '') {
//       this.filteredOthersMouActivityAssigned = [...this.MouActivityAssigneds];
//       return;
//     }

//     this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds.filter(item => {
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           let valueString = String(val).toLowerCase();

//           // Special handling for 'mouId' (Old MOU Id)
//           if (key === 'mouId') {
//             const numericId = Number(val); // Convert mouid to a number

//             // Check if mouId number or "mou/<number>" matches the query
//             if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
//               return true;
//             }
//           }

//           // General search for all other fields (newMouId, uid, activityDetails, etc.)
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }

//   /**
//    * Fetches assigned activities data for the selected session.
//    * FIX: Re-applies the current search query after new data is loaded (if a query exists).
//    */
//   GetOthersActivtiesAssigned(IdCode: any, sessionId: any): void {
//     this.loadingIndicator = true;
//     this.showNoDataFoundMessage = false;

//     this.mouDocumentsService.GetAllActivitiesAssignedwithSession('0', sessionId).subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           // Update the master list
//           this.MouActivityAssigneds = response.item1;
          
//           // FIX 2: Check if there's an existing search query and re-run the filter
//           if (this.searchQueryxx.trim().length > 0) {
//             this.searchxxxy();
//           } else {
//             // If no search query, the filtered list is the full list
//             this.filteredOthersMouActivityAssigned = [...this.MouActivityAssigneds];
//           }

//           this.dataSource.data = this.MouActivityAssigneds;
//           // alert(JSON.stringify(this.MouActivityAssigneds.length)) // Removed alert as per best practices

//           this.MouActivityDocuments.sort((a, b) => b.id - a.id);

//           // Setup columns
//           this.columnsAssigned = [];
//           this.headHtmlData = this.MouActivityAssigneds[0];
//           this.columnsAssigned = Object.keys(this.headHtmlData);
//           this.columnsAssigned = this.columnsAssigned.filter((item: string) =>
//             ![
//               'filePath', 'activityDetails', 'mouStartDate', 'mouEndDate', 'mouStatus', 'newMouId',
//               'mouTitle', 'actionAssignedBy*', 'uid*', 'createdBy', 'createdOn', 'mouId', 'id', 'sessionAcademicYear'
//             ].includes(item)
//           );

//           this.showNoDataFoundMessage = false;
//         } else {
//           this.dataSource.data = this.MouActivityDocuments = this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds = [];
//           this.showNoDataFoundMessage = true;
//         }

//         // Delay hiding the loader for 2.5 seconds
//         setTimeout(() => {
//           this.loadingIndicator = false;
//         }, 2500);
//       },
//       error: err => {
//         this.dataSource.data = this.MouActivityDocuments = this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds = [];
//         this.showNoDataFoundMessage = true;
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = true;
//         }, 2500);

//         this.LoginFailed(err);
//       }
//     });
//   }

//   // =========================================================================
//   // EXPORT TO EXCEL LOGIC (Updated to use filtered data for consistency)
//   // =========================================================================

//   exportToExcelsothers(): void {
//     const fileName = 'Mou_Document_report.xlsx';
    
//     // Use the filtered list for export
//     const exportedData = this.filteredOthersMouActivityAssigned.map(item => ({ 
//       NewMOUId: item.newMouId ?? 'N/A', //1
//       OldMOUId: "MOU/" + item.mouId, //1
//       'Name of Mou Organisation': item.mouTitle, //2
//       'MOU Activity Assigned to Faculty UID': item.uid, //3 4
//       'Activity Start Date assigned By HOS': item.startDate, //5
//       'Activity End Date assigned By HOS': item.endDate, //6
//       'Remarks Given By HOS For Activity': item.remarks, //7
//       'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails), //8 
//       'Date of MOU Activity Assigned By HOS': item.createdOn, //9
//     }));
    
//     const header = [
//       'New MOU Id',
//       'Old MOU Id',
//       'Name of Mou Organisation',
//       'MOU Activity Assigned to Faculty UID',
//       'Activity Start Date assigned By HOS',
//       'Activity End Date assigned By HOS',
//       'Remarks Given By HOS For Activity',
//       'Details of Allocated MOU Activity',
//       'Date of MOU Activity Assigned By HOS'
//     ];
    
//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    
//     const wscols = [
//       { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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

//   GetAllActivities(): void {
//     this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.allSchoolDivisions = response.item1;
//       } else {
//         this.allSchoolDivisions = [];
//       }
//     });
//   }

//   GetEmployeeData(): void {
//     this.mouDocumentsService.GetEmployeeData().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EmployeeData = response.item1;
//         } else {
//           this.EmployeeData = [];
//         }
//       },
//       error: err => {
//         console.error(err);
//       }
//     });
//   }


//   setupEmployeeControl() {
//     this.employeeControl.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged()
//       )
//       .subscribe(() => this.onInput());
//   }

//   setSessionId(event: any) {
//     const selectedId = event.target.value;
//     this.selectedPlannerSession = selectedId;
//     // alert('Selected Session ID: ' + selectedId);
//     this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
//   }
//   // end new add 28-May-25 


//   onActivitySelected(event: any): void {
//     this.selectedActivityId = event.target.value;
//     // alert(this.selectedActivityId)
//     // this.SelectedActivityDetails = activity.description
//   }

//   private formatDate(date: Date): string {
//     const year = date.getFullYear();
//     const month = this.padZero(date.getMonth() + 1); // Months are zero-based
//     const day = this.padZero(date.getDate());
//     return `${year}-${month}-${day}`;
//   }
//   private padZero(value: number): string {
//     return value < 10 ? `0${value}` : `${value}`;
//   }

//   // Added on 29 -may-25


//   isLoading: boolean = false;
//   //End logic on 29-may-25


//   LoginFailed(_NewError: any) {
//     this.isLoginFailed = true;
//     swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are Invalid!',
//       icon: 'warning',
//     })
//     const element = document.getElementById('ActivityPage');
//     if (element) {
//       element.hidden = true;
//     }
//   }

//   removeNumberPrefix(activityDetails: string): string {
//     return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
//   }

 




//   onSelectFileX(a: any) {
//     let aa = a;
//     window.open(this.ServerUrl + aa.filePath, '_blank');
//   }

//   onSelectFile(a: any) {
//     let aa = a;
//     window.open(aa.filePath, '_blank');
//   }

//   onSelect(a: any) {
//     let aa = a;
//     this.mouId = a['mouId'];
//     this.CurrentMouTitle = a['mouTitle'];
//     this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//     }).catch((res) => { });
//   }

//   onMouIdChange(event: Event): void {
//     const selectedId = (event.target as HTMLSelectElement).value;
//     this.selectedId = selectedId ? +selectedId : undefined;
//     this.MouPartner = this.partnerName = this.selectedId !== undefined ? this.partnerNamesMap[this.selectedId] : undefined;
//     this.mouActivity = 'Test Name Activity';
//     this.checkFormValidity();
//   }
//   loadData(event: Event) {
//     // (<HTMLInputElement>document.getElementById('ResultTable')).style.display = "none";
//   }
//   testClick(): void {
//     swal.fire({
//       title: 'Test click',
//       text: 'File Download !',
//       icon: 'warning',
//     })
//   }


//   checkFormValidity(): void {
//     this.uploadEnabled = this.mouId !== '' && this.mouId !== 'select Id'
//       && this.partnerName !== ''
//       && this.ResponsiblePerson !== ''
//       && this.startDate !== ''
//       && this.AssignedToUid.length > 4
//       && this.endDate !== '' && this.remarks !== '' && this.remarks?.length > 5;
//   }

//   onInput() {
//     const inputValue = this.employeeControl.value.toLowerCase();
//     if (inputValue) {
//       this.filteredEmployeesData = this.EmployeeData.filter(employee =>
//         employee.employeeName.toLowerCase().includes(inputValue) || employee.employeeCode.toLowerCase().includes(inputValue)
//       ).slice(0, 10);
//     } else {
//       this.filteredEmployeesData = [];
//     }
//     this.showSuggestions = true;
//     this.activeSuggestionIndex = -1;
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

//   // Mouse event handlers
//   onMouseEnter(index: number) {
//     this.activeSuggestionIndex = index;
//   }

//   onMouseClick(employee: any) {
//     this.selectEmployee(employee);
//   }
//   selectEmployee(employee: Employee) {
//     this.ResponsiblePerson = employee.employeeCode;
//     this.AssignedToUid = employee.employeeCode;//this.filteredEmployeesData.map(employee => employee.employeeCode);
//     this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);

//     // console.log("UID"+this.AssignedToUid)  ;
//     this.filteredEmployeesData = [];
//     this.showSuggestions = false;
//     this.checkFormValidity();
//     this.checkUIDValidity();
//   }

//   hideSuggestions() {
//     setTimeout(() => this.showSuggestions = false, 200); // Delay to allow click event to register
//   }


//   formatDates(date: Date): string {
//     const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
//     return DateX;
//   }
//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }

//   isUpdateEnabled(document: any): boolean {
//     return document.disapprovalReason && document.disapprovalReason.length > 0;
//   }
//   getDivisionNameById(id: number): string {
//     const idStr = id.toString();
//     let division: SchoolDivision | undefined;
//     for (const school of this.allSchoolDivisions) {
//       if (+school.id === +idStr) {
//         division = school;
//         break;
//       }
//     }
//     return division ? division.schoolDivision : `ID ${idStr} not found`;
//   }
//   getDivisionNamesByIds(ids: number[]): string {
//     return ids.map(id => this.getDivisionNameById(id)).join(', ');
//   }
//   selectedRow: any = null;

//   openActivityModal(row: any): void {
//     this.selectedRow = row;
//     this.modalService.open(this.activityModal, { size: 'lg' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//     });
//   }
//   search() {
//     const query = this.searchQuery.trim().toLowerCase();

//     this.filteredMouActivityDocuments = this.MouActivityDocuments.filter(item => {
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           let valueString = String(val).toLowerCase();

//           if (key === 'mouId') {
//             const numericId = Number(val); // Convert mouid to a number

//             if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
//               return true;
//             }
//           }

//           // General search for all other fields
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }

//   searchx() {
//     const query = this.searchQueryx.trim().toLowerCase();
//     this.filteredMouActivityAssigned = this.MouActivityAssigned.filter(item => {
//       return Object.entries(item).some(([key, val]) => {
//         if (val !== null && val !== undefined) {
//           let valueString = String(val).toLowerCase();

//           if (key === 'mouId') {
//             const numericId = Number(val); // Convert mouid to a number

//             if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
//               return true;
//             }
//           }

//           // General search for all other fields
//           return valueString.includes(query);
//         }
//         return false;
//       });
//     });
//   }
//   // searchxxxy() {
//   //   const query = this.searchQueryxx.trim().toLowerCase();
//   //   this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds.filter(item => {
//   //     return Object.entries(item).some(([key, val]) => {
//   //       if (val !== null && val !== undefined) {
//   //         let valueString = String(val).toLowerCase();

//   //         if (key === 'mouId') {
//   //           const numericId = Number(val); // Convert mouid to a number

//   //           if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
//   //             return true;
//   //           }
//   //         }

//   //         // General search for all other fields
//   //         return valueString.includes(query);
//   //       }
//   //       return false;
//   //     });
//   //   });
//   // }

// //   searchxxxy() {
// //   const query = (this.searchQueryxx || '').trim().toLowerCase();

// //   // If search box is empty → restore original data
// //   if (!query) {
// //     this.filteredOthersMouActivityAssigned = [...this.MouActivityAssigneds];
// //     return;
// //   }

// //   this.filteredOthersMouActivityAssigned = this.MouActivityAssigneds.filter((item: any) => {

// //     return Object.entries(item).some(([key, val]) => {

// //       if (val === null || val === undefined) return false;

// //       let valueString = String(val).trim().toLowerCase();

// //       // 🔍 SPECIAL SEARCH FOR MOU ID
// //       if (key === 'mouId') {
// //         const numericId = Number(val);

// //         if (!isNaN(numericId)) {
// //           if (
// //             numericId.toString().includes(query) ||
// //             `mou/${numericId}`.toLowerCase().includes(query)
// //           ) {
// //             return true;
// //           }
// //         }
// //       }

// //       // 🔍 GENERAL SEARCH FOR ALL OTHER FIELDS
// //       return valueString.includes(query);
// //     });

// //   });
// // }

//   MouActivityExcelDocuments: any[] = [];
//   GetAllDataForExportToExcelData(ICode: any) {
//     this.mouDocumentsService.GetAllMouActivitiesForExportToExcel(ICode).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.MouActivityExcelDocuments = response.item1;
//           console.log(this.MouActivityExcelDocuments)
//         } else {
//           this.EmployeeData = [];
//         }
//       },
//       error: err => {
//         console.error(err);
//       }
//     });
//   }
//   exportToExcelNewLogic(): void {
//     this.GetAllDataForExportToExcelData(this.EmployeeCode);
//     const fileName = 'Mou_Document_report.xlsx';
//     const exportedData = this.MouActivityExcelDocuments.map(item => ({
//       NewMOUId: item.newMouId,
//       oldMOUId: item.MOUId,
//       MouDocumentUploadedBy: item.MouDocumentUploadedBy,
//       MouDocumentDownloadLink: item.MouDocumentDownloadLink,
//       MouApprovalStatus: item.MouApprovalStatus,
//       MouNameofSchoolResponsible: item.MouNameofSchoolResponsible,
//       MouUidOdHOSOfSchool: item.MouUidOdHOSOfSchool,
//       MouActivityAssignedBy: item.MouActivityAssignedBy,
//       MouActivityAssignedTo: item.MouActivityAssignedTo,
//       MouActivityStartDate: item.MouActivityStartDate,
//       MouActivityEndDate: item.MouActivityEndDate,
//       MouActivityActionTakenBy: item.MouActivityActionTakenBy,
//       MouActivityUploadedOn: item.MouActivityUploadedOn,
//       MouActivityApprovalStatus: item.MouActivityApprovalStatus,
//       MouActivityApprovedBy: item.MouActivityApprovedBy,
//       MouActivityDisapprovalReason: item.MouActivityDisapprovalReason,
//       MouActivityUploadedDownloadLink: item.MouActivityUploadedDownloadLink,
//     }));
//     const header = [
//       'NewMOUId',
//       'OldMOUId',
//       'MouDocumentUploadedBy ',
//       'MouPartnerName',
//       'MouDocumentDownloadLink',
//       'MouApprovalStatus',
//       'MouNameofSchoolResponsible',
//       'MouUidOdHOSOfSchool',
//       'MouActivityAssignedBy',
//       'MouActivityAssignedTo',
//       'MouActivityStartDate',
//       'MouActivityEndDate',
//       'MouActivityActionTakenBy',
//       'MouActivityUploadedOn',
//       'MouActivityApprovalStatus',
//       'MouActivityApprovedBy',
//       'MouActivityDisapprovalReason',
//       'MouActivityUploadedDownloadLink',
//     ];
//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
//     for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
//       const cellAddress = XLSX.utils.encode_cell({ r: i, c: 17 }); // Column 7 is DocumentUrl
//       const cell = ws[cellAddress];
//       if (cell && cell.v) {
//         cell.f = `HYPERLINK("${cell.v}", "Download")`;
//       }
//     }
//     const wscols = [
//       { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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

//   exportToExcels(): void {
//     const fileName = 'Mou_Document_report.xlsx';
//     const exportedData = this.MouActivityAssigned.map(item => ({
//       NewMOUId:  item.newMouId ?? 'N/A',//1
//       OldMOUId: "MOU/" + item.mouId,//1
//       'Name of Mou Organisation': item.mouTitle,//2
//       'MOU Activity Assigned to Faculty UID': item.uid,//3 4
//       'Activity Start Date assigned By HOS': item.startDate,//5
//       'Activity End Date assigned By HOS': item.endDate,//6
//       'Remarks Given By HOS For Activity': item.remarks, //7
//       'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails), //8 
//       'Date of MOU Activity Assigned By HOS': item.createdOn,//9
//     }));
//     const header = [
//       'New MOU Id',
//       'Old MOU Id',
//       'Name of Mou Organisation',
//       'MOU Activity Assigned to Faculty UID',
//       'Activity Start Date assigned By HOS',
//       'Activity End Date assigned By HOS',
//       'Remarks Given By HOS For Activity',
//       'Details of Allocated MOU Activity',
//       'Date of MOU Activity Assigned By HOS'

//     ];
//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
//     // for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
//     //   const cellAddress = XLSX.utils.encode_cell({ r: i, c: 7 }); // Column 7 is DocumentUrl
//     //   const cell = ws[cellAddress];
//     //   if (cell && cell.v) {
//     //     cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
//     //   }
//     // }
//     const wscols = [
//       { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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
//   // exportToExcelsothers(): void {
//   //   const fileName = 'Mou_Document_report.xlsx';
//   //   const exportedData = this.MouActivityAssigneds.map(item => ({
//   //     NewMOUId:  item.newMouId ?? 'N/A',//1
//   //     OldMOUId: "MOU/" + item.mouId,//1
//   //     'Name of Mou Organisation': item.mouTitle,//2
//   //     'MOU Activity Assigned to Faculty UID': item.uid,//3 4
//   //     'Activity Start Date assigned By HOS': item.startDate,//5
//   //     'Activity End Date assigned By HOS': item.endDate,//6
//   //     'Remarks Given By HOS For Activity': item.remarks, //7
//   //     'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails), //8 
//   //     'Date of MOU Activity Assigned By HOS': item.createdOn,//9
//   //   }));
//   //   const header = [
//   //     'New MOU Id',
//   //     'Old MOU Id',
//   //     'Name of Mou Organisation',
//   //     'MOU Activity Assigned to Faculty UID',
//   //     'Activity Start Date assigned By HOS',
//   //     'Activity End Date assigned By HOS',
//   //     'Remarks Given By HOS For Activity',
//   //     'Details of Allocated MOU Activity',
//   //     'Date of MOU Activity Assigned By HOS'

//   //   ];
//   //   const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//   //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
//   //   // for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
//   //   //   const cellAddress = XLSX.utils.encode_cell({ r: i, c: 7 }); // Column 7 is DocumentUrl
//   //   //   const cell = ws[cellAddress];
//   //   //   if (cell && cell.v) {
//   //   //     cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
//   //   //   }
//   //   // }
//   //   const wscols = [
//   //     { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
//   //   ];
//   //   ws['!cols'] = wscols;
//   //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//   //   const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//   //   const link = document.createElement('a');
//   //   link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//   //   link.download = fileName;
//   //   link.click();
//   // }

//   exportToExcel(): void {
//     this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
//     const fileName = 'Mou_Document_report.xlsx';

//     const exportedData = this.MouActivityDocuments.map(item => ({
//       NewMOUId: item.newMouId ?? 'N/A', //1
//       OldMOUId: "MOU/" + item.mouId, //1
//       'Name of Mou Organisation': item.mouTitle, //2
//       'MOU Uploaded By Faculty Name/UID': item.createdBy ?? 'N/A', //3,4
//       'SPOC Person Name (MOU Partner Organisation)': item.spocName ?? 'N/A', //5
//       'SPOC Person Email (MOU Partner Organisation)': item.spocEmailId ?? 'N/A', //6
//       'SPOC Person Contact (MOU Partner Organisation)': item.spocContactNo == 'undefined' ? 'NA' : item.spocContactNo ?? 'N/A', //7
//       'MOU Approval Status': item.isApproved == 1 ? 'Approved' : item.isApproved == 0 ? 'Disapproved' : 'Pending', //8
//       'MOU Approval Date': item.approvalDate ?? 'N/A', //9
//       'MOU StartDate': item.mouStartDate ?? 'N/A', //10
//       'MOU EndDate': item.mouEndDate ?? 'N/A', //11
//       'MOU Document Uploaded': item.filePath //12
//     }));

//     const header = [
//       'New MOU Id', //1
//       'Old MOU Id', //1
//       'Name of Mou Organisation', //2
//       'MOU Uploaded By Faculty Name/UID', //3,4
//       'SPOC Person Name (MOU Partner Organisation)', //5
//       'SPOC Person Email (MOU Partner Organisation)', //6
//       'SPOC Person Contact No (MOU Partner Organisation)', //7
//       'MOU Approval Status', //8
//       'MOU Approval Date', //9
//       'MOU StartDate', //10
//       'MOU EndDate', //11
//       'MOU Document Uploaded' //12
//     ];

//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

//     // Fixing the hyperlink column (should be index 11, not 12)
//     for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
//       const cellAddress = XLSX.utils.encode_cell({ r: i, c: 10 }); // 11th index is the last column
//       const cell = ws[cellAddress];
//       if (cell && cell.v) {
//         cell.f = `HYPERLINK("${cell.v}", "Download Attachment")`;
//       }
//     }

//     const wscols = Array(12).fill({ wpx: 200 });
//     ws['!cols'] = wscols;

//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//     link.download = fileName;
//     link.click();
//   }


//   formdata = new FormGroup({
//     responsiblePerson: new FormControl('', Validators.required),
//     startDate: new FormControl('', Validators.required),
//     endDate: new FormControl('', Validators.required),
//   })



//   UploadActivity() {
//     const formData = new FormData();
//     formData.append('MouId', this.mouId);
//     formData.append('Uid', this.AssignedToUid);
//     formData.append('ActionAssignedBy', this.EmployeeCode);
//     formData.append('Remarks', this.remarks);
//     formData.append('StartDate', this.startDate);
//     formData.append('EndDate', this.endDate);
//     formData.append('ActivityDetails', this.selectedActivityId);
//     // console.log("Uploading activity with data:");
//     // formData.forEach((value, key) => console.log(`${key}: ${value}`));
//     this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
//       next: (data: any) => {
//         if (data?.item1?.length > 0) {
//           const result = data.item1[0]?.msg;
//           if (result === 'success') {
//             this.showAlert('Action Planned Stored Successfully!', 'success');
//           }
//         } else {
//           console.error("Unexpected API response format:", data);
//           this.showAlert('Server Error', 'error');
//         }
//       },
//       complete: () => {
//         this.clearFields();
//       }
//     });
//   }

//   private showAlert(title: string, icon: 'success' | 'error') {
//     swal.fire({ title, icon }).then(() => window.location.reload());
//   }

//   FetchActionTkenData(): void {
//     this.GetAllMouActionsTakenData();
//     this.modalService.open(this.viewActivityActionTakenModalAll, { size: 'lg' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//       window.location.reload();
//     }).catch((res) => { });
//   }


//   GetAllMouActionsTakenData(): void {
//     this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode, '').subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = response.item1;
//           this.dataSource.data = this.MouActionTakenDocuments;
//           this.loadingIndicator = false;
//           this.columns = []; this.headHtmlData = [];
//           this.headHtmlData = this.MouActionTakenDocuments[0];
//           this.columns = Object.keys(this.MouActionTakenDocuments[0]);
//           this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'approvedBy' && item !== 'documentName' && item !== 'file' && item !== 'uid' && item !== 'id' && item !== 'createdBy' && item !== 'updatedOn' && item !== 'updatedBy' && item !== 'ipAddress');

//           this.columns.push()
//           this.loadingIndicator = false;

//         } else {
//           this.dataSource.data = this.MouActionTakenDocuments = [];
//           this.showNoDataFoundMessage = true;
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

//   DisapproveStatus(RowData: any) {
//     let aa = RowData;
//     let xmouId = aa['mouId'];
//     swal.fire({
//       title: "Reason for Disapproval" + xmouId,
//       // text: "Disapproval reason",
//       input: 'text',
//       showCancelButton: true
//     }).then((result) => {
//       if (result.value) {
//         this.Reason = result.value;
//         const formData = new FormData();
//         formData.append('Id', xmouId);
//         formData.append('DisapprovalReason', this.Reason);
//         formData.append('Action', 'Disapprove');
//         this.handleStatusChange(formData, 'Disapprove');
//       } else {
//         this.showCancelledSwal();
//       }
//     });
//   }


//   ApproveAction(RowData: any) {
//     let aa = RowData;
//     let ymouId = aa['mouId'];
//     const formData = new FormData();
//     formData.append('Id', ymouId);
//     formData.append('Action', 'Approve');

//     swal.fire({
//       title: 'Are you sure you want to Approve this?' + ymouId,
//       text: 'Kindly confirm if the document is valid!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, accept current changes!',
//       cancelButtonText: 'No, do not change it'
//     }).then((result: any) => {
//       if (result.value) {
//         this.handleStatusChange(formData, 'Approve');
//       } else {
//         this.showCancelledSwal();
//       }
//     });
//   }

//   private handleStatusChange(formData: FormData, action: string) {
//     this.mouDocumentsService.ApproveMouActionTakenDocument(formData).subscribe((data: any) => {
//       if (action === 'Approve' && data.responseData === 'Cancel') {
//         swal.fire(
//           'No Change!',
//           ' ',
//           'error'
//         );
//       } else {
//         swal.fire(
//           ' Approved/ Disapproved successfully !',
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





//   // Activity Details against MOUID 

//   dataLoaded: boolean = false; dataShowing: boolean = false;
//   dataSources: MatTableDataSource<any> = new MatTableDataSource<any>();
//   MouDataActionTakenColumns: any;
//   data: any; MouData: any; // Developer Name Jatindarkumarr31309

//   allMouActionTakenDetails: any;
//   MouallMouActionTakenDetails: any;
//   MouidX: any;
//   excludedColumns: any[]
//   ViewAllActionTaken(rows: any) {
//     this.MouidX = rows['mouId'];

//     this.GetAllActionDetails(this.MouidX);

//     this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'sm' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//       window.location.reload();
//     }).catch((res) => { });
//   }

//   onSelectActivityDocument(a: any) {
//     let aa = a;
//     window.open(aa.actionTakenDocument, '_blank');
//   }

//   GetAllActionDetails(id: any) {
//     //  alert(" id "+id)
//     this.mouDocumentsService.GetMouActivityActionTakenDetails(id).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.allMouActionTakenDetails = response.item1;

//         this.dataSource = response.item1;
//         this.dataLoaded = true;
//         this.dataShowing = true;

//         this.dataSources.data = this.allMouActionTakenDetails;
//         this.loadingIndicator = false;

//         this.excludedColumns = [
//           'mouid', 'completedDate', 'documentUploaded',
//           'sessionId', 'actionTakenDocument',
//           'updatedBy', 'ipAddress', 'updatedOn', 'isActive', 'isApproved', 'disapprovalReason',
//           'approvedBy', 'approvalDate', 'id', 'spocName', 'spocContactNo', 'spocEmailId',
//           'mouStartDate', 'mouEndDate', 'mouStatus', 'filePath', 'fileName', 'uid',
//           'createdBy', 'createdOn'
//         ];

//         this.MouDataActionTakenColumns = Object.keys(this.allMouActionTakenDetails[0]);
//         this.columns = this.MouDataActionTakenColumns.filter((col: string) => !this.excludedColumns.includes(col));
//         this.headHtmlData = this.allMouActionTakenDetails[0];
//       } else {
//         this.allMouActionTakenDetails = [];
//       }
//     });
//   }



//   // Added on 29-May-25
//   MouTitleX: any = ''; IdX: any;
//   MouStartDateX: any = '';
//   MouEndDateX: any = '';
//   MouStatusX: any = '';
//   ActivityDetailsX: any = '';
//   UidX: any = '';
//   StartDateX: any = '';
//   EndDateX: any = '';
//   ActionAssignedByX: any = '';
//   RemarksX: any = '';
//   CreatedByX: any = '';
//   CreatedOnX: any = '';
//   AssignUid(rows: any) {
//     // Assigning individual values to component-level variables
//     this.MouidX = rows['mouId'];
//     this.IdX = rows['id'];
//     this.MouTitleX = rows['mouTitle'];
//     this.MouStartDateX = rows['mouStartDate'];
//     this.MouEndDateX = rows['mouEndDate'];
//     this.MouStatusX = rows['mouStatus'];
//     this.ActivityDetailsX = rows['activityDetails'];
//     this.UidX = rows['uid'];
//     this.StartDateX = rows['startDate'];
//     this.EndDateX = rows['endDate'];
//     this.ActionAssignedByX = rows['actionAssignedBy'];
//     this.RemarksX = rows['remarks'];
//     this.CreatedByX = rows['createdBy'];
//     this.CreatedOnX = rows['createdOn'];

//     // Optional: Alert to verify the values
//     // alert(`MouId: ${this.MouidX}, MouTitle: ${this.MouTitleX}, StartDate: ${this.MouStartDateX}, EndDate: ${this.MouEndDateX}`);

//     // Open modal
//     this.modalService.open(this.AssignNewUIDModal, { size: 'sm' }).result.then((result) => {
//       window.location.reload();
//     }).catch((res) => { });
//   }


//   // added on 29-MAy-25

//   checkUIDValidity(): void {
//     this.uploadEnabled = this.IdX !== '' && this.AssignedToUid != '';
//   }
//   UploadUID() {
//     const formData = new FormData();
//     formData.append('RecordId', this.IdX);
//     formData.append('Uid', this.AssignedToUid);
//     console.log("Uploading activity with data:");
//     formData.forEach((value, key) => console.log(`${key}: ${value}`));
//     this.mouDocumentsService.ActivityPlanUpdateUID(formData).subscribe({
//       next: (data: any) => {
//         if (data?.item1?.length > 0) {
//           const result = data.item1[0]?.msg;
//           if (result === 'Success') {
//             this.showAlert('UID Updated Successfully!', 'success');
//           }
//           else if (result === 'Failed') {
//             this.showAlert('Failed to Update UID!', 'error');
//           }
//         } else {
//           console.error("Unexpected API response format:", data);
//           this.showAlert('Server Error', 'error');
//         }
//       },
//       complete: () => {
//         this.clearFields();
//       }
//     });
//   }
// }
