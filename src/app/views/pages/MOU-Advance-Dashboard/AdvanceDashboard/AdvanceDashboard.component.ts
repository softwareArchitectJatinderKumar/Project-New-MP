import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import { DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { MatTableDataSource } from '@angular/material/table';
import { MouActivity } from './MouActivity';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
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
  templateUrl: './AdvanceDashboard.component.html',
  styleUrls: ['./AdvanceDashboard.component.scss'],
  standalone: false
})
export class MouActivityActionPlanComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModalAll') viewActivityActionTakenModalAll: TemplateRef<any>;
  @ViewChild('activityModal') activityModal: TemplateRef<any>;
  @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;

  searchQuery: any;
  filteredMouActivityDocuments: any[] = [];
  SchoolDivisionInvolved: any;
  DepartmentName: any;
  CurrentMouTitle: any;
  remarks: any;
  EmployeeData: Employee[] = [];
  filteredEmployeesData: Employee[] = [];
  Reason: any;
  AssignedToUid: any;
  filteredMouActivityAssigned: any[] = [];
  MouActivityAssigned: any[] = [];
  searchQueryx: any;



  clearFields(): void {
    this.mouId = this.startDate = this.endDate = this.ResponsiblePerson = '';
  }


  employeeControl = new FormControl();
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex: number = -1;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  allSchoolDivisions: SchoolDivision[] = [];
  userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];
  MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];
  errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
  fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
  filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";

  @ViewChild('stageModal') stageModal: TemplateRef<any>;
  @ViewChild('divstagesHistory') divstagesHistory: TemplateRef<any>;
  @ViewChild('divstagesHistoryFiles') divstagesHistoryFiles: TemplateRef<any>;

  TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
  selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; startDate: any; endDate: any; EmployeeDetails: any;
  EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: any = '';
  ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; columnsAssigned: any; headHtmlData: any[] = []; responsiblePerson: string = '';
  constructor(private Agreement: AgreementEntryService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private datePipe: DatePipe,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) _document: Document,
    private route: ActivatedRoute, private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService,) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.mouActivities = mouActivities;
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr text-center"> MOU </span>Activity Action <span class="themeClr">Plan </span> <br/><span class="ms-3">   HOS /COS / Secretaries </span> ';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    //const currentDate = new Date();
    this.startDate = this.endDate = '';// this.formatDate(currentDate);
    // this.ServerUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
    this.ServerUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.storageService.clean();
      this.getToken(loginName);
    }
  }
  onActivitySelected(event: any): void {
    this.selectedActivityId = event.target.value;
    // alert(this.selectedActivityId)
    // this.SelectedActivityDetails = activity.description
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const day = this.padZero(date.getDate());
    return `${year}-${month}-${day}`;
  }
  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
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
  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('ActivityPage');
    if (element) {
      element.hidden = true;
    }
  }
  GetAllMouDocumentsForApprovals(IdCode: any): void {
    this.mouDocumentsService.GetMouDocumentToAssignActivity(IdCode).subscribe({
      // this.mouDocumentsService.MouDocumentsforApproval(IdCode).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.filteredMouActivityDocuments = this.MouActivityDocuments = response.item1;
          this.dataSource.data = this.MouActivityDocuments;
          //console.log(JSON.stringify(this.MouActivityDocuments));
          this.MouActivityDocuments.sort((a, b) => {
            return (b.id - a.id);
          });
          this.loadingIndicator = false;
          this.SchoolDivisionInvolved = this.MouActivityDocuments[0].schoolDivisionInvolved;
          this.SchoolDivisionInvolved = this.getDivisionNameById(this.SchoolDivisionInvolved);
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouActivityDocuments[0];
          this.columns = Object.keys(this.MouActivityDocuments[0]);
          this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'activityDetails' && item !== 'activityPerformed' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus' && item !== 'approvedBy' && item !== 'createdBy' && item !== 'mouId' && item !== 'schoolDivisionInvolved' && item !== 'isApproved' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'spocContactNo');
          // this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus' && item !== 'approvedBy'&& item !== 'createdBy' && item !== 'mouId' && item !== 'schoolDivisionInvolved' && item !== 'isApproved' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'spocContactNo');
          this.columns.push()
          this.loadingIndicator = false;

        } else {
          this.dataSource.data = this.MouActivityDocuments = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
  removeNumberPrefix(activityDetails: string): string {
    return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
  }

  GetAllActivtiesAssigned(IdCode: any): void {
    this.mouDocumentsService.MOUGetAllActivitiesAssigned(IdCode).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.filteredMouActivityAssigned = this.MouActivityAssigned = response.item1;
          this.dataSource.data = this.MouActivityAssigned;
          console.log("assigned Data" + JSON.stringify(this.MouActivityAssigned));
          this.MouActivityDocuments.sort((a, b) => {
            return (b.id - a.id);
          });
          this.loadingIndicator = false;
          this.columnsAssigned = []; this.headHtmlData = [];
          this.headHtmlData = this.MouActivityAssigned[0];
          this.columnsAssigned = Object.keys(this.MouActivityAssigned[0]);
          this.columnsAssigned = this.columnsAssigned.filter((item: any) => item !== 'filePath' && item !== 'activityDetails' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus' && item !== 'mouTitle' && item !== 'actionAssignedBy' && item !== 'uid' && item !== 'createdBy' && item !== 'createdOn' && item !== 'mouId');
          this.columnsAssigned.push()
          this.loadingIndicator = false;

        } else {
          this.dataSource.data = this.MouActivityDocuments = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      if (response.item1.length > 0) {
        this.allSchoolDivisions = response.item1;
      } else {
        this.allSchoolDivisions = [];
      }
    });
  }
  UserRole: any;
  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          // console.log(JSON.stringify(this.EmployeeDetails))
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode ='23408';// response.item1[0].employeeCode;
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.UserRole = response.item1[0].userRole;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          // if(this.UserRole!=null)
          // {
          this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
          this.GetAllActivtiesAssigned(this.EmployeeCode);
          // }
          // else
          // {
          //   swal.fire({
          //     title: 'Authentication Failed',
          //     text: 'Interface for HOS/ COS / Secretary Users',
          //     icon: 'warning',
          //   })
          // }

        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
  onSelectFileX(a: any) {
    let aa = a;
    window.open(this.ServerUrl + aa.filePath, '_blank');
  }

  onSelectFile(a: any) {
    let aa = a;
    window.open(aa.filePath, '_blank');
  }

  onSelect(a: any) {
    let aa = a;
    this.mouId = a['mouId'];
    this.CurrentMouTitle = a['mouTitle'];
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  onMouIdChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedId = selectedId ? +selectedId : undefined;
    this.MouPartner = this.partnerName = this.selectedId !== undefined ? this.partnerNamesMap[this.selectedId] : undefined;
    this.mouActivity = 'Test Name Activity';
    this.checkFormValidity();
  }
  loadData(event: Event) {
    // (<HTMLInputElement>document.getElementById('ResultTable')).style.display = "none";
  }
  testClick(): void {
    swal.fire({
      title: 'Test click',
      text: 'File Download !',
      icon: 'warning',
    })
  }
  GetEmployeeData(): void {
    this.mouDocumentsService.GetEmployeeData().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeData = response.item1;
        } else {
          this.EmployeeData = [];
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  setupEmployeeControl() {
    this.employeeControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.onInput());
  }

  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.mouId !== 'select Id'
      && this.partnerName !== ''
      && this.ResponsiblePerson !== ''
      && this.startDate !== ''
      && this.endDate !== '' && this.remarks !== '' && this.remarks?.length > 5;
  }

  onInput() {
    const inputValue = this.employeeControl.value.toLowerCase();
    if (inputValue) {
      this.filteredEmployeesData = this.EmployeeData.filter(employee =>
        employee.employeeName.toLowerCase().includes(inputValue) || employee.employeeCode.toLowerCase().includes(inputValue)
      ).slice(0, 10);
    } else {
      this.filteredEmployeesData = [];
    }
    this.showSuggestions = true;
    this.activeSuggestionIndex = -1;
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

  // Mouse event handlers
  onMouseEnter(index: number) {
    this.activeSuggestionIndex = index;
  }

  onMouseClick(employee: any) {
    this.selectEmployee(employee);
  }
  selectEmployee(employee: Employee) {
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;//this.filteredEmployeesData.map(employee => employee.employeeCode);
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);

    // console.log("UID"+this.AssignedToUid)  ;
    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkFormValidity();
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 200); // Delay to allow click event to register
  }


  formatDates(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isUpdateEnabled(document: any): boolean {
    return document.disapprovalReason && document.disapprovalReason.length > 0;
  }
  getDivisionNameById(id: number): string {
    const idStr = id.toString();
    let division: SchoolDivision | undefined;
    for (const school of this.allSchoolDivisions) {
      if (+school.id === +idStr) {
        division = school;
        break;
      }
    }
    return division ? division.schoolDivision : `ID ${idStr} not found`;
  }
  getDivisionNamesByIds(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }
  selectedRow: any = null;

  openActivityModal(row: any): void {
    this.selectedRow = row;
    this.modalService.open(this.activityModal, { size: 'lg' }).result.then((result) => {
      // console.log("Modal closed" + result);
    });
  }
  search() {
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredMouActivityDocuments = this.MouActivityDocuments.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();

          if (key === 'mouId') {
            const numericId = Number(val); // Convert mouid to a number

            if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
              return true;
            }
          }

          // General search for all other fields
          return valueString.includes(query);
        }
        return false;
      });
    });
  }


  searchx() {
    const query = this.searchQueryx.trim().toLowerCase();
    this.filteredMouActivityAssigned = this.MouActivityAssigned.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();

          if (key === 'mouId') {
            const numericId = Number(val); // Convert mouid to a number

            if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
              return true;
            }
          }

          // General search for all other fields
          return valueString.includes(query);
        }
        return false;
      });
    });
  }
  MouActivityExcelDocuments: any[] = [];
  GetAllDataForExportToExcelData(ICode: any) {
    this.mouDocumentsService.GetAllMouActivitiesForExportToExcel(ICode).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouActivityExcelDocuments = response.item1;
        } else {
          this.EmployeeData = [];
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }
  exportToExcelNewLogic(): void {
    this.GetAllDataForExportToExcelData(this.EmployeeCode);
    const fileName = 'Mou_Document_report.xlsx';
    const exportedData = this.MouActivityExcelDocuments.map(item => ({
      MOUId: item.MOUId,
      MouDocumentUploadedBy: item.MouDocumentUploadedBy,
      MouDocumentDownloadLink: item.MouDocumentDownloadLink,
      MouApprovalStatus: item.MouApprovalStatus,
      MouNameofSchoolResponsible: item.MouNameofSchoolResponsible,
      MouUidOdHOSOfSchool: item.MouUidOdHOSOfSchool,
      MouActivityAssignedBy: item.MouActivityAssignedBy,
      MouActivityAssignedTo: item.MouActivityAssignedTo,
      MouActivityStartDate: item.MouActivityStartDate,
      MouActivityEndDate: item.MouActivityEndDate,
      MouActivityActionTakenBy: item.MouActivityActionTakenBy,
      MouActivityUploadedOn: item.MouActivityUploadedOn,
      MouActivityApprovalStatus: item.MouActivityApprovalStatus,
      MouActivityApprovedBy: item.MouActivityApprovedBy,
      MouActivityDisapprovalReason: item.MouActivityDisapprovalReason,
      MouActivityUploadedDownloadLink: item.MouActivityUploadedDownloadLink,
    }));
    const header = [
      'MOUId',
      'MouDocumentUploadedBy ',
      'MouPartnerName',
      'MouDocumentDownloadLink',
      'MouApprovalStatus',
      'MouNameofSchoolResponsible',
      'MouUidOdHOSOfSchool',
      'MouActivityAssignedBy',
      'MouActivityAssignedTo',
      'MouActivityStartDate',
      'MouActivityEndDate',
      'MouActivityActionTakenBy',
      'MouActivityUploadedOn',
      'MouActivityApprovalStatus',
      'MouActivityApprovedBy',
      'MouActivityDisapprovalReason',
      'MouActivityUploadedDownloadLink',
    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 17 }); // Column 7 is DocumentUrl
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.f = `HYPERLINK("${cell.v}", "Download")`;
      }
    }
    const wscols = [
      { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
    ];
    ws['!cols'] = wscols;
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

  exportToExcels(): void {
    const fileName = 'Mou_Document_report.xlsx';
    const exportedData = this.MouActivityAssigned.map(item => ({
      MOUId: "MOU/" + item.mouId,//1
      'Name of Mou Organisation': item.mouTitle,//2
      'MOU Activity Assigned to Faculty UID': item.uid,//3 4
      'Activity Start Date assigned By HOS': item.startDate,//5
      'Activity End Date assigned By HOS': item.endDate,//6
      'Remarks Given By HOS For Activity': item.remarks, //7
      'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails), //8 
      'Date of MOU Activity Assigned By HOS': item.createdOn,//9
    }));
    const header = [
      'MOUId',
      'Name of Mou Organisation',
      'MOU Activity Assigned to Faculty UID',
      'Activity Start Date assigned By HOS',
      'Activity End Date assigned By HOS',
      'Remarks Given By HOS For Activity',
      'Details of Allocated MOU Activity',
      'Date of MOU Activity Assigned By HOS'

    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    // for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
    //   const cellAddress = XLSX.utils.encode_cell({ r: i, c: 7 }); // Column 7 is DocumentUrl
    //   const cell = ws[cellAddress];
    //   if (cell && cell.v) {
    //     cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
    //   }
    // }
    const wscols = [
      { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
    ];
    ws['!cols'] = wscols;
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

  exportToExcel(): void {
    this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
    const fileName = 'Mou_Document_report.xlsx';

    const exportedData = this.MouActivityDocuments.map(item => ({
      MOUId: "MOU/" + item.mouId, //1
      'Name of Mou Organisation': item.mouTitle, //2
      'MOU Uploaded By Faculty Name/UID': item.createdBy ?? 'N/A', //3,4
      'SPOC Person Name (MOU Partner Organisation)': item.spocName ?? 'N/A', //5
      'SPOC Person Email (MOU Partner Organisation)': item.spocEmailId ?? 'N/A', //6
      'SPOC Person Contact (MOU Partner Organisation)': item.spocContactNo == 'undefined' ? 'NA' : item.spocContactNo ?? 'N/A', //7
      'MOU Approval Status': item.isApproved == 1 ? 'Approved' : item.isApproved == 0 ? 'Disapproved' : 'Pending', //8
      'MOU Approval Date': item.approvalDate ?? 'N/A', //9
      'MOU StartDate': item.mouStartDate ?? 'N/A', //10
      'MOU EndDate': item.mouEndDate ?? 'N/A', //11
      'MOU Document Uploaded': item.filePath //12
    }));

    const header = [
      'MOU Id', //1
      'Name of Mou Organisation', //2
      'MOU Uploaded By Faculty Name/UID', //3,4
      'SPOC Person Name (MOU Partner Organisation)', //5
      'SPOC Person Email (MOU Partner Organisation)', //6
      'SPOC Person Contact No (MOU Partner Organisation)', //7
      'MOU Approval Status', //8
      'MOU Approval Date', //9
      'MOU StartDate', //10
      'MOU EndDate', //11
      'MOU Document Uploaded' //12
    ];

    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

    // Fixing the hyperlink column (should be index 11, not 12)
    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 10 }); // 11th index is the last column
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.f = `HYPERLINK("${cell.v}", "Download Attachment")`;
      }
    }

    const wscols = Array(12).fill({ wpx: 200 });
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }


  formdata = new FormGroup({
    responsiblePerson: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
  })
  // UploadActivity() {
  //   const formData = new FormData();
  //   formData.append('MouId', this.mouId);
  //   formData.append('Uid', this.AssignedToUid);
  //   formData.append('ActionAssignedBy', this.EmployeeCode);
  //   formData.append('Remarks', this.remarks);
  //   formData.append('StartDate', this.startDate);
  //   formData.append('EndDate', this.endDate);
  //   formData.append('ActivityDetails',  this.selectedActivityId);

  //   // formData.forEach((value, key) => {
  //   //   console.log(`${key}: ${value}`);
  //   // });
  //   this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
  //     next: (data: any) => {
  //       const result = data.item1[0]['msg'];
  //       if (result === 'success') {
  //         swal.fire({
  //           title: 'Action Planned Stored Successfully!',
  //           // text: '',
  //           icon: 'success'
  //         }).then(() => {
  //           window.location.reload();
  //         });
  //       } else if (result === '-1') {
  //         swal.fire({
  //           title: 'Mou Is already Assigned to some one else',
  //           icon: 'error'
  //         }).then(() => {
  //           window.location.reload();
  //         });
  //       } else {
  //         swal.fire({
  //           title: 'Something Went Wrong, Try again later',
  //           icon: 'error'
  //         }).then(() => {
  //           window.location.reload();
  //         });
  //       }
  //     },
  //     error: (error: any) => {
  //       swal.fire({
  //         title: 'Error',
  //         text: 'Failed to Upload.',
  //         icon: 'error'
  //       }).then(() => {
  //         window.location.reload();
  //       });
  //     },
  //     complete: () => {
  //       this.clearFields();
  //     }
  //   });
  // }


  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('Uid', this.AssignedToUid);
    formData.append('ActionAssignedBy', this.EmployeeCode);
    formData.append('Remarks', this.remarks);
    formData.append('StartDate', this.startDate);
    formData.append('EndDate', this.endDate);
    formData.append('ActivityDetails', this.selectedActivityId);
    // console.log("Uploading activity with data:");
    // formData.forEach((value, key) => console.log(`${key}: ${value}`));
    this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
      next: (data: any) => {
        console.log("Response received:", data);

        if (data?.item1?.length > 0) {
          const result = data.item1[0]?.msg;
          if (result === 'success') {
            this.showAlert('Action Planned Stored Successfully!', 'success');
          }
        } else {
          console.error("Unexpected API response format:", data);
          this.showAlert('Server Error', 'error');
        }
      },
      complete: () => {
        this.clearFields();
      }
    });
  }

  private showAlert(title: string, icon: 'success' | 'error') {
    swal.fire({ title, icon }).then(() => window.location.reload());
  }

  FetchActionTkenData(): void {
    this.GetAllMouActionsTakenData();
    this.modalService.open(this.viewActivityActionTakenModalAll, { size: 'lg' }).result.then((result) => {
      // console.log("Modal closed" + result);
      window.location.reload();
    }).catch((res) => { });
  }


  GetAllMouActionsTakenData(): void {
    this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode,'').subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = response.item1;
          this.dataSource.data = this.MouActionTakenDocuments;
          this.loadingIndicator = false;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouActionTakenDocuments[0];
          this.columns = Object.keys(this.MouActionTakenDocuments[0]);
          this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'approvedBy' && item !== 'documentName' && item !== 'file' && item !== 'uid' && item !== 'id' && item !== 'createdBy' && item !== 'updatedOn' && item !== 'updatedBy' && item !== 'ipAddress');

          this.columns.push()
          this.loadingIndicator = false;

        } else {
          this.dataSource.data = this.MouActionTakenDocuments = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  DisapproveStatus(RowData: any) {
    let aa = RowData;
    let xmouId = aa['mouId'];
    swal.fire({
      title: "Reason for Disapproval" + xmouId,
      // text: "Disapproval reason",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('Id', xmouId);
        formData.append('DisapprovalReason', this.Reason);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      } else {
        this.showCancelledSwal();
      }
    });
  }


  ApproveAction(RowData: any) {
    let aa = RowData;
    let ymouId = aa['mouId'];
    const formData = new FormData();
    formData.append('Id', ymouId);
    formData.append('Action', 'Approve');

    swal.fire({
      title: 'Are you sure you want to Approve this?' + ymouId,
      text: 'Kindly confirm if the document is valid!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept current changes!',
      cancelButtonText: 'No, do not change it'
    }).then((result: any) => {
      if (result.value) {
        this.handleStatusChange(formData, 'Approve');
      } else {
        this.showCancelledSwal();
      }
    });
  }

  private handleStatusChange(formData: FormData, action: string) {
    this.mouDocumentsService.ApproveMouActionTakenDocument(formData).subscribe((data: any) => {
      if (action === 'Approve' && data.responseData === 'Cancel') {
        swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        swal.fire(
          ' Approved/ Disapproved successfully !',
          '',
          'success'
        ).then(() => {
          window.location.reload();
        });
      }
    });
  }

  private showCancelledSwal() {
    swal.fire(
      'Cancelled',
      ' ',
      'error'
    );
  }





  // Activity Details against MOUID 

  dataLoaded: boolean = false; dataShowing: boolean = false;
  dataSources: MatTableDataSource<any> = new MatTableDataSource<any>();
  MouDataActionTakenColumns: any;
  data: any; MouData: any; // Developer Name Jatindarkumarr31309

  allMouActionTakenDetails: any;
  MouallMouActionTakenDetails: any;
  MouidX: any;
  excludedColumns: any[]
  ViewAllActionTaken(rows: any) {
    this.MouidX = rows['mouId'];

    this.GetAllActionDetails(this.MouidX);

    this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
      window.location.reload();
    }).catch((res) => { });
  }

  onSelectActivityDocument(a: any) {
    let aa = a;
    window.open(aa.actionTakenDocument, '_blank');
  }

  GetAllActionDetails(id: any) {
    //  alert(" id "+id)
    this.mouDocumentsService.GetMouActivityActionTakenDetails(id).subscribe((response) => {
      if (response.item1.length > 0) {
        this.allMouActionTakenDetails = response.item1;

        this.dataSource = response.item1;
        this.dataLoaded = true;
        this.dataShowing = true;

        this.dataSources.data = this.allMouActionTakenDetails;
        this.loadingIndicator = false;

        this.excludedColumns = [
          'mouid', 'completedDate', 'documentUploaded',
          'sessionId', 'actionTakenDocument',
          'updatedBy', 'ipAddress', 'updatedOn', 'isActive', 'isApproved', 'disapprovalReason',
          'approvedBy', 'approvalDate', 'id', 'spocName', 'spocContactNo', 'spocEmailId',
          'mouStartDate', 'mouEndDate', 'mouStatus', 'filePath', 'fileName', 'uid',
          'createdBy', 'createdOn'
        ];

        this.MouDataActionTakenColumns = Object.keys(this.allMouActionTakenDetails[0]);
        this.columns = this.MouDataActionTakenColumns.filter((col: string) => !this.excludedColumns.includes(col));
        this.headHtmlData = this.allMouActionTakenDetails[0];
      } else {
        this.allMouActionTakenDetails = [];
      }
    });
  }

}
