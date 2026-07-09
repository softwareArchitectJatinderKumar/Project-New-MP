import { CommonModule } from '@angular/common';
import { MouActivity } from './MouActivity';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
import { mouActivities } from './mouActivities';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

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

import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { RMSService } from 'src/app/_services/rms.service';
import * as XLSX from 'xlsx';
interface Employee {
  employeeName: string;
  employeeCode: string;
}

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}
@Component({
  selector: 'app-MouReportDateWise',
  templateUrl: './MouReportDateWise.component.html',
  styleUrls: ['./MouReportDateWise.component.scss'],
  providers: [DatePipe]
})
export class MouReportDateWiseComponent implements OnInit {


  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModal') viewActivityActionTakenModal: TemplateRef<any>;
  @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;
  @ViewChild('viewMouActionPlannedModal') viewMouActionPlannedModal: TemplateRef<any>;
  searchQuery: any;

  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any = 0; MouDataColumns: any; toDate: any = 0; MouDataActionTakenColumns: any;
  dataSource: any[] = []; data: any; MouData: any; // DEveloper Name Jatinder31309
  dataShowing: any = false;
  //dataSource = new MatTableDataSource<any>;
  dataSources: MatTableDataSource<any> = new MatTableDataSource<any>();
  allSchoolDivisions: any[];
  AssignedToUid: string[];
Number: any;

// added on 8-7-26
selectedSchoolDivision: string = '';


// Approval Filter
approvalFilter: string = 'all';

// Master Data
allMouDocumentsLists: any[] = [];

// Counts
approvedCount = 0;
disapprovedCount = 0;
pendingCount = 0;

// Top Scrollbar
@ViewChild('topScrollbar') topScrollbar!: ElementRef;
@ViewChild('topScrollbarContent') topScrollbarContent!: ElementRef;
@ViewChild('gridContainer') gridContainer!: ElementRef;

private scrollInitialized = false;


 
updateCounts() {

    this.approvedCount = this.filteredMouDocumentsLists.filter(x =>
        x.isApproved === true ||
        x.isApproved === 'True' ||
        x.isApproved == 1
    ).length;

    this.disapprovedCount = this.filteredMouDocumentsLists.filter(x =>
        x.isApproved === false ||
        x.isApproved === 'False' ||
        x.isApproved == 0
    ).length;

    this.pendingCount = this.filteredMouDocumentsLists.filter(x =>
        x.isApproved == null ||
        x.isApproved === ''
    ).length;

}

applyFilters(): void {

  let filtered = [...this.allMouDocumentsLists];

  switch (this.approvalFilter) {

    case 'approved':

      filtered = filtered.filter(x =>
        x.isApproved === true ||
        x.isApproved === 'True' ||
        x.isApproved == 1);

      break;

    case 'disapproved':

      filtered = filtered.filter(x =>
        x.isApproved === false ||
        x.isApproved === 'False' ||
        x.isApproved == 0);

      break;

    case 'pending':

      filtered = filtered.filter(x =>
        x.isApproved == null ||
        x.isApproved === '');

      break;

  }

  const query = (this.searchQuery || '').trim().toLowerCase();

  if (query) {

    filtered = filtered.filter(item =>

      Object.values(item).some((value: any) =>

        value != null &&
        String(value).toLowerCase().includes(query)

      )

    );

  }

  // School Division Filter
if (this.selectedSchoolDivision) {

    filtered = filtered.filter(item => {

        if (!item.schoolDivisionInvolved) {
            return false;
        }

        const ids = item.schoolDivisionInvolved
            .split(',')
            .map((x: string) => x.trim());

        return ids.includes(this.selectedSchoolDivision);

    });

}

  this.filteredMouDocumentsLists = filtered;

  this.updateCounts();

  setTimeout(() => this.initializeTopScrollbar(), 50);

}

initializeTopScrollbar() {

    const body = this.gridContainer?.nativeElement
        ?.querySelector('.datatable-body');

    if (!body) return;

    this.topScrollbarContent.nativeElement.style.width =
        body.scrollWidth + 'px';

    this.topScrollbar.nativeElement.onscroll = () => {

        body.scrollLeft =
            this.topScrollbar.nativeElement.scrollLeft;

    };

    body.onscroll = () => {

        this.topScrollbar.nativeElement.scrollLeft =
            body.scrollLeft;

    };

}

onApprovalFilterChange() {

    this.applyFilters();

}




  constructor(private http: HttpClient, private MOUService: MouDocumentsService, private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private Agreement: AgreementEntryService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private ObpService: ObpAutoAssignService,
    private datePipe: DatePipe,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) _document: Document,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService,) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  dataLoaded: boolean = false;

  ngOnInit(): void {
    this.mouActivities = mouActivities;
    let loginName = this.route.snapshot.params['loginName'];
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU Activity </span>Plan Admin <span class="themeClr">  Dashboard </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        // this.getData();
        this.GetAllActivities();
        this.GetEmployeeData();
        this.showData() ;
      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        this.isLoginFailed=true;
      }
    });
  }

//   getData(){
//  alert(0);
//       this.mouDocumentsService.GetAllStates().subscribe({
//         next: response => {
//           if (response.item1) {
//             const States = response.item1;
//             console.log(JSON.stringify(States))
//           }
//         }
//       })
//   }
  Reset() {
    window.location.reload();

  }
  MouDocumentsListsExcel: any ;

  getExcelData()
  {
    this.MOUService.GetAllMouActivitiesForAdminAction('').subscribe({
      next: response => {
        if (response.item1) {
          this.MouDocumentsListsExcel = response.item1;
          // console.log(JSON.stringify(this.MouDocumentsListsExcel))
        }   }}); 
  }
 
  exportExcel() {
    const fileName = 'Mou_Admin_report.xlsx';
    // this.getExcelData();
    if (this.MouDocumentsListsExcel?.length > 0) {
      const exportedData = this.MouDocumentsListsExcel.map((item: {
        newMouId: string;
        mouid: string; mouUploadedBy: any; mouTitle: any;        
        mouStartDate: any; mouEndDate: any; mouStatus: any;
        responsibleSchool: any;
        mouActivityApprovalStatus:any;
        mouActivityApprovedBy:any;
        assignedTo: any, proofDetails: any,
        documentUploaded: any, sessionTitle: any, activityCategory: any, participantsCount: any,
        noOfActivitiesSubmitted: any, approvalStatus: any,
        mouActionTakenDocument: any,
        assignedBy: any,
        activityStartDate: any; activityEndDate: any; mOUActivityAssignedBy: any; endDate: any; authorityRemarks: any;
      }) => ({
        NewMOUId: item.newMouId  ?? 'Disapproved',
        OldMOUId: "MOU/" + item.mouid ,
        CreatedBy: item.mouUploadedBy,
        MouTitle: item.mouTitle,
        MouStartDate: item.mouStartDate,
        MouEndDate: item.mouEndDate,
        // SchoolInvolved: item.responsibleSchool,
        SchoolDivision: this.getDivisionNamesByIds(item.responsibleSchool.split(',').map(Number)),
        ConcernFaculty: item.assignedTo,
        ProofDetails: item.proofDetails,
        DocumentUploaded: item.documentUploaded,
        Session: item.sessionTitle,
        activityCategory: item.activityCategory,
        participantsCount: item.participantsCount,
        noOfActivitiesSubmitted: item.noOfActivitiesSubmitted,
        approvalStatus: item.mouActivityApprovalStatus=='True'?'Approved By - '+item.mouActivityApprovedBy:item.mouActivityApprovalStatus=='False'?'Disapproved By ' + item.mouActivityApprovedBy :' Pending ',
        // ActivityStartDate: item.activityStartDate,
        // ActivityEndDate: item.activityEndDate,
        // AssignedBy: item.mOUActivityAssignedBy,
        // EndDate: item.endDate,
        // AuthorityRemarks: item.authorityRemarks,
        // mouActionTakenDocument: item.mouActionTakenDocument // Should be a valid URL
      }));

      // Headers
      const header = [
        'New MOU Id','Old MOU Id', 'MOU Uploaded By', 'MOU Title', 'MOU StartDate', 'MOU EndDate', 'SchoolInvolved',
        'MOU Assigned to Concern Faculty ', 'Proof Details', 'Document Uploaded', 'Session', 'Activity Category', 'Participants Count', 'No of Activities',
        'Approval Status',
        //  'Activity Start Date',      'Activity End Date', 
        // 'AssignedBy', 'EndDate', 'AuthorityRemarks',
        // 'mouActionTakenDocument'
      ];

      const ws_data = [header, ...exportedData.map((item: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(item))];

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

      // Apply Hyperlinks
      exportedData.forEach((item: any, index: number) => {
        const row = index + 1; // Offset for headers

        const mouDocCellRef = XLSX.utils.encode_cell({ r: row, c: 3 }); // 'MouDocument'
        const actionDocCellRef = XLSX.utils.encode_cell({ r: row, c: 13 }); // 'mouActionTakenDocument'

      });

      // Set column widths
      ws['!cols'] = header.map(() => ({ wpx: 200 }));

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Use writeFile for correct file generation
      XLSX.writeFile(wb, fileName);
    }
    else {
      swal.fire({
        title: 'Something Went Wrong, Try again later',
        icon: 'error'
      }).then(() => {
        window.location.reload();
      });
    }
  }
  
  ResetData() {
    this.fromDate = this.toDate = '';
    this.MouData = [];
    this.dataShowing = false;
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
        this.isLoginFailed=true;
      }
    });
  }


  isLoading: boolean = false;
  EmployeeData: Employee[] = [];
  filteredEmployeesData: Employee[] = [];
  MouStartDate: string = ''; // Bound to Start Date input
  MouEndDate: string = ''; // Bound to End Date input
  isIndefiniteMou: boolean = false; // For Indefinite Mou checkbox
  moustatus: string = 'Expired';

  ResponsiblePerson: any = '';

  employeeControl = new FormControl();
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex: number = -1;
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
  selectEmployee(employee: Employee) {
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
    this.ResponsiblePerson = employee.employeeCode;

    this.AssignedToUid = this.filteredEmployeesData.map(employee => employee.employeeCode);
    // console.log("UID"+this.AssignedToUid)  ;

    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkFormValidity();
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 200); // Delay to allow click event to register
  }


  toggleEndDate(): void {
    if (this.isIndefiniteMou) {
      this.isIndefiniteMou = true;
      //this.MouEndDate = '';
      this.MouStatus = 'Active';
    } 
    else if(this.isIndefiniteMou == false)
    { 
      // this.MouStatus = 'Expired';
      this.updateMouStatus(); 
    } 
     
  }

  // Updates the MOU status based on the date logic
  updateMouStatus(): void {
    const today = new Date();
    const startDate = this.MouStartDate ? new Date(this.MouStartDate) : null;
    const endDate = this.MouEndDate ? new Date(this.MouEndDate) : null;

    if (this.isIndefiniteMou) {
      this.MouStatus = 'Active';
    } else if (startDate) {
      if (!endDate || (today >= startDate && today <= endDate)) {
        this.MouStatus = 'Active';
      } else {
        this.MouStatus = 'Expired';
      }
    } else {
      this.MouStatus = 'Expired'; // Default status if start date is missing
    }
  }
  showData() {
    const today =new Date().toISOString().split('T')[0];
    const Startday =new Date('01-01-2024').toISOString().split('T')[0];
    // alert(today)
    this.isLoading = true;
    this.MOUService.GetAllMouDocumentDetails().subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        this.dataLoaded = true;
        this.MouData = data.item1;
        if (this.MouData?.length > 0) {
          this.MouDataColumns = Object.keys(this.MouData[0]);
          
          // this.filteredMouDocumentsLists = this.MouDocumentsLists = data.item1;

          this.allMouDocumentsLists = [...data.item1];

          this.MouDocumentsLists = [...data.item1];

          this.filteredMouDocumentsLists = [...data.item1];

          this.updateCounts();

          setTimeout(() => this.initializeTopScrollbar(), 100);
          // console.log(JSON.stringify(this.filteredMouDocumentsLists))
          this.dataSources.data = this.MouDocumentsLists;
          this.loadingIndicator = false;
          this.headHtmlData = this.MouDocumentsLists[0];
          this.columns = Object.keys(this.MouDocumentsLists[0]);
          // console.log(this.columns)
          this.columns = this.columns.filter((item: any) => item !== 'mouUploadedBy' && item !== 'mouApprovedBy' && item !== 'activityEndDate' &&  item !== 'activityStartDate' && item !== 'mouUploadedByUID'  &&  item !== 'updatedBy' &&item !== 'assignedTo' && item !== 'assignedBy' && item !== 'ipAddress' && item !== 'mouPartnerName' && item !== 'updatedOn' && item !== 'isActive'  && item !== 'isApproved' && item !== 'disapprovalReason' && item !== 'approvedBy' && item !== 'approvalDate' && item !== 'id' && item !== 'spocName' && item !== 'spocContactNo' && item !== 'spocEmailId' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus'&& item !== 'filePath'&& item !== 'fileName' && item !== 'uid' && item !== 'createdBy' && item !== 'createdOn' && item !== 'schoolDivisionInvolved');
          this.columns.push()
          this.loadingIndicator = false;
          this.getDropdownData();
          this.getAllMouActivities();
          this.getExcelData();
          this.processMouDocuments();
        }
        this.dataShowing = true;

      },
      error: (error) => {
        this.dataShowing = false;
        this.isLoading = false;
        this.isLoginFailed=true;
        console.error('Error fetching data', error);
      },
      complete: () => {
        this.dataShowing = true;
        console.log('Data fetching complete');
        this.isLoading = false;
        this.isLoginFailed=false;
      }
    });
  }

  getAllMouActivities(): void {
    this.mouDocumentsService.GetAllMouActivities().subscribe({
      next: response => {
        if (response.item1) {
          this.Activities = response.item1;
          
        }
      }
    })
  }
  DownloadUploadedAction(row: any) {
    // console.log(JSON.stringify(row));
    // alert(JSON.stringify(row));
    //mouActionTakenDocument
    window.open(row.mouActionTakenDocument, '_blank');
  }

  Activities: any;
  Activity: any = '';
  selectedActivityType: string = '';

  sessionFilter: any = ''; // Default empty value
  sessionId: any = ''; // Default empty value
  items: any[] = []; // Array to store dropdown options
  SessionId: any = 'Select';
  ParticipantsCount: any = '';
  formdata = new FormGroup({
    mouActivity: new FormControl('', Validators.required),
    remarks: new FormControl('', Validators.required),
    CompletedDate: new FormControl('', Validators.required),
    File: new FormControl('', Validators.required),
    sessionId: new FormControl('Select', Validators.required),
    ParticipantsCount: new FormControl('' ),
    ActivitiesSubmitted: new FormControl('' ),
    FacultyActivityStartDate: new FormControl('', Validators.required),    
    FacultyActivityEndDate: new FormControl('', Validators.required), 
  })

  getDropdownData(): void {
    this.ObpService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1) {
          this.items = response.item1;
          // console.log(JSON.stringify(this.items))
        }
      }
    })
  }


  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];


  errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
  fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
  filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";



  TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
  selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; CompletedDate: any; endDate: any; EmployeeDetails: any;
  EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: number;
  ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];
  ActivitiesSubmitted: any;
  MouDocumentsLists: any[] = []; filteredMouDocumentsLists: any[] = [];
  takeActionForm!: FormGroup;   DocumentName: string = '';   expectedStartDate: string = '';
  expectedEndDate: string = '';   uploadedFileUrl: string = '';   currentDisapprovalReason: string = '';
  Remarks: any;  MouStatus: any;
  filteredMouActivityDocuments: any[] = [];
  ExpectedstartDate: string='';  ExpectedEndDate: string='';   DepartmentName: any;
  UploadedFileUrl: any = '';  PresentDate: any = '';  CurrentApprovalStatus: any;
  CurrentdisapprovalReason: any;
  ActivityDetails: any;
  schoolDivisionId: any;
  HosId: any;

  getDivisionNameById(id: number): string {
    const idStr = id.toString();
    let division: SchoolDivision | undefined;
    for (const school of this.allSchoolDivisions) {
      if (+school.id === +idStr) {
        division = school;
        break;
      }
    }
    return division ? division.schoolDivision : ` `;
  }
 

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      if (response.item1.length > 0) {
        this.allSchoolDivisions = response.item1;
        // console.log(JSON.stringify(this.allSchoolDivisions))
      } else {
        this.allSchoolDivisions = [];
      }
    });
  }

  onSelect(a: any) {
    let aa = a;
    this.mouId = aa['id']
    this.schoolDivisionId = aa['schoolDivisionInvolved'];
    this.HosId = aa['approvedBy'];
    this.MouStartDate=aa['mouStartDate'];
    this.MouEndDate=aa['mouEndDate'];

    this.UploadedFileUrl = aa['filePath'];
    this.MouStatus = aa['mouStatus'] == null || aa['mouStatus'].length<3 ? 'NA' : aa['mouStatus'];
    this.PresentDate = this.datePipe.transform(new Date(), 'dd-MMM-yyyy');
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
      window.location.reload();
    }).catch((res) => { });
    //  }
  }

  convertToValidDate(dateString: string): string {
    if (!dateString) return '';
  
    // Check if the format is "dd MMM yyyy" (e.g., "01 Jun 2024")
    const regex1 = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/;
    const match1 = dateString.match(regex1);
    if (match1) {
      const [_, day, month, year] = match1;
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
      return `${year}-${monthIndex.toString().padStart(2, '0')}-${day}`;
    }
  
    // Check if the format is "MM/DD/YYYY" or "DD/MM/YYYY"
    const regex2 = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match2 = dateString.match(regex2);
    if (match2) {
      let [_, part1, part2, year] = match2;
      const month = parseInt(part1, 10) > 12 ? part2 : part1; // Adjust for MM/DD or DD/MM
      const day = parseInt(part1, 10) > 12 ? part1 : part2;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  
    // If no known format is detected, return an empty string
    return '';
  }

  onSelectFile(a: any) {
    let aa = a;
    window.open(aa.mouActionTakenDocument, '_blank');
  }
  onSelectFileDocument(a: any) {
    let aa = a;
    window.open(aa.filePath, '_blank');
  }
// added on 5-Feb-26

     onDownloadFile(remoteUrl: string): void {
      swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); }});
  
      this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
        next: (blob: Blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
  
          const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
          link.download = fileName;
  
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
  
          swal.close();
        },
        error: async (err) => {
          swal.close();
          if (err.error instanceof Blob) {
            const errorMsg = JSON.parse(await err.error.text());
            swal.fire('Error', errorMsg.message || 'Download failed', 'error');
          } else {
            swal.fire('Error', 'Could not connect to the server', 'error');
          }
        }
      });
    }

    // Ended logic for 5-Feb-26
  testClick(a: any): void {
    const fileUrl = `assets/MouTemplateDocuments/${this.selectedActivityId}.zip`;
    const link = document.createElement('a');
    const selectedActivity = this.mouActivities.find(activity => activity.id === +a);
    if (selectedActivity) {
      // alert('Selected Activity Description:'+ selectedActivity?.description);
      this.DocumentName = selectedActivity?.description
    }
    link.href = fileUrl;
    link.download = `${this.selectedActivityId}.zip`;
    link.click();
  }
  onActivitySelected(event: any): void {
    this.selectedActivityId = event.target.value;
    const selectedActivity = this.mouActivities.find(activity => activity.id === +this.selectedActivityId);;
    if (selectedActivity) {
      // console.log('Selected Activity Description:', selectedActivity?.description);
      //      alert('Selected Activity Description:'+ selectedActivity?.description);
      this.DocumentName = selectedActivity?.description
    }
    else {
      // alert(1)
      this.testClick(event.target.value)
    }
  }

  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.Remarks?.length < 4
      && this.DocumentName != ''
      && this.CompletedDate !== ''
      && this.fileData != null
      && this.FacultyActivityStartDate!=''
      && this.FacultyActivityEndDate!=''
      
  }
  formatDates(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSources.filter = filterValue.trim().toLowerCase();
  }

  isUpdateEnabled(document: any): boolean {
    return document.disapprovalReason && document.disapprovalReason.length > 0;
  }

  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (file) {
      if (file.size > 5001576) {
        swal.fire({
          title: 'File size exceeds 5MB. Please upload a smaller file.',
          text: 'Invalid File size',
          icon: 'warning'
        });
        target.value = '';
        this.fileData = null;
        this.fileStatus = false;
        this.checkFormValidity();
        return;
      }

      const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!fileNameRegex.test(file.name)) {
        const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const modifiedFile = new File([file], validFileName, { type: file.type });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(modifiedFile);
        target.files = dataTransfer.files;
        this.fileData = modifiedFile;
        this.fileName = validFileName;
      } else {
        this.fileData = file;
        this.fileName = file.name;
      }

      reader.readAsDataURL(this.fileData);
      reader.onload = () => {
        const result = reader.result as string;
        const resultArray = result.split(',');
        this.FileData = resultArray[1];
        this.fileStatus = true;
        this.checkFormValidity();
      };
    } else {
      this.fileData = null;
      this.fileStatus = false;
      this.checkFormValidity();
    }
  }

  FacultyActivityStartDate: string = '';
  FacultyActivityEndDate: string = '';
  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('MouStartDate', this.MouStartDate);
    formData.append('MouEndDate', this.MouEndDate);
    formData.append('MouStatus', this.MouStatus);
    formData.append('SchoolDivisionId', this.schoolDivisionId);
    formData.append('AssignedBy', this.HosId);
    formData.append('AssignedTo', this.ResponsiblePerson.length>0? this.ResponsiblePerson : this.HosId);
    formData.append('ActivityStartDate', this.ExpectedstartDate);
    formData.append('ActivityEndDate', this.ExpectedEndDate);
    formData.append('SessionId', this.sessionId);
    formData.append('Remarks', this.Remarks);
    formData.append('ActivityTitle', this.Activity);
    formData.append('ActivityCategory', this.selectedActivityType);
    formData.append('ParticipantsCount', this.ParticipantsCount);
    formData.append('ActivityCount', this.ActivitiesSubmitted);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    formData.append('FacultyActivityStartDate', this.FacultyActivityStartDate);
    formData.append('FacultyActivityEndDate', this.FacultyActivityEndDate);
    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    this.mouDocumentsService.UpdateMOUActionPlanMaster(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result == 'Success') {
          swal.fire({
            title: 'Action done Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        }  else {
          swal.fire({
            title: 'Something Went Wrong, Try again later',
            icon: 'error'
          }).then(() => {
            window.location.reload();
          });
        }
      },
    });
    swal.fire({
      title: 'Action done Successfully!',
      // text: '',
      icon: 'success'
    }).then(() => {
      window.location.reload();
    });
  }

  clearFields(): void {
    this.mouId = this.CompletedDate = this.ResponsiblePerson = '';
    if (this.selectedActivityId == 11 || this.selectedActivityId == 12 || this.selectedActivityId == 14 || this.selectedActivityId == 23) {
      swal.fire({
        title: 'Since this Activity is also involved IQAC Interface thus Redirecting to the IQAC interface ',
        text: 'You are Kindly requested to fill the details in IQAC.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'https://ums.lpu.in/lpuums/frmIQACdetails.aspx';
      });
    }

  }




  // search() {
  //   const query = this.searchQuery.toLowerCase();
  //   this.filteredMouDocumentsLists = this.MouDocumentsLists.filter(item => {
  //     return Object.values(item).some(val =>
  //       String(val).toLowerCase().includes(query)
  //     );
  //   });
  // }
  search() {
    const query = this.searchQuery.trim().toLowerCase();
  
    this.filteredMouDocumentsLists = this.MouDocumentsLists.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();
  
          if (key === 'id') {
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
  allMouActionTakenDetails: any;
  MouallMouActionTakenDetails: any;
  MouidX: any;
  excludedColumns: any[]
  ViewAllActionTaken(rows: any){
    this.MouidX= rows['id'];
    
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

  GetAllActionDetails(id: any)
  {
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
          'mouid','completedDate','documentUploaded', 
          'sessionId','actionTakenDocument',
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



  getDivisionNamesByIds(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }

  processMouDocuments(): void {
    this.filteredMouDocumentsLists.forEach(row => {
      row.schoolDivisionString = this.convertSchoolDivision(row.schoolDivisionInvolved);
    });
  }
  
  // Convert schoolDivisionInvolved IDs to Names
  convertSchoolDivision(schoolDivisionInvolved: string | null): string {
    if (!schoolDivisionInvolved) return 'NA';
  
    const ids = schoolDivisionInvolved.split(',').map(Number);
    const divisionNames = ids
      .map(id => this.getDivisionNameById(id))
      .filter(name => name !== '') // Remove empty names
      .join(', ');
  
    return divisionNames || 'NA';
  }
}
