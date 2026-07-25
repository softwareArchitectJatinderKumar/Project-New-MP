import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
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
interface MouCategory {
  id: number;
  CategoryName: string;
}

@Component({
  selector: 'MouActivityTakeAction',
  templateUrl: './MouActivityTakeAction.component.html',
  styleUrls: ['./MouActivityTakeAction.component.scss'],
  standalone: false,

})
export class MouActivityTakeActionComponent implements OnInit, AfterViewInit, OnDestroy {

@ViewChild('topScrollbar')
topScrollbar!: ElementRef<HTMLDivElement>;

@ViewChild('topScrollbarContent')
topScrollbarContent!: ElementRef<HTMLDivElement>;


@ViewChild('topScrollbar2')
topScrollbar2!: ElementRef<HTMLDivElement>;

@ViewChild('topScrollbarContent2')
topScrollbarContent2!: ElementRef<HTMLDivElement>;

 
private tab1WidthObserver?: ResizeObserver;
private tab2WidthObserver?: ResizeObserver;

 
private initializeTopScrollbar(
  topBar: HTMLElement,
  spacer: HTMLElement,
  selector: string,
  tab: 'tab1' | 'tab2'
): void {
  const body = document.querySelector(selector) as HTMLElement;

  if (!body || !topBar || !spacer) {
    return;
  }

  const syncWidth = () => {
    spacer.style.width = body.scrollWidth + 'px';
  };
  syncWidth();

  topBar.onscroll = () => {
    body.scrollLeft = topBar.scrollLeft;
  };

  body.onscroll = () => {
    topBar.scrollLeft = body.scrollLeft;
  };

  // Tear down any previous observer for this grid before attaching a new
  // one, so repeated calls don't stack duplicate observers on the same body.
  if (tab === 'tab1') {
    this.tab1WidthObserver?.disconnect();
    this.tab1WidthObserver = new ResizeObserver(() => syncWidth());
    this.tab1WidthObserver.observe(body);
  } else {
    this.tab2WidthObserver?.disconnect();
    this.tab2WidthObserver = new ResizeObserver(() => syncWidth());
    this.tab2WidthObserver.observe(body);
  }
}

/** Re-syncs the Tab 1 (Assign Activities) top scrollbar against its grid. */
private syncTab1Scrollbar(): void {
  if (!this.topScrollbar || !this.topScrollbarContent) {
    return;
  }
  this.initializeTopScrollbar(
    this.topScrollbar.nativeElement,
    this.topScrollbarContent.nativeElement,
    '.ngx-datatable .datatable-body',
    'tab1'
  );
}

/** Re-syncs the Tab 2 (My All Assign Activities) top scrollbar against its grid. */
private syncTab2Scrollbar(): void {
  if (!this.topScrollbar2 || !this.topScrollbarContent2) {
    return;
  }
  this.initializeTopScrollbar(
    this.topScrollbar2.nativeElement,
    this.topScrollbarContent2.nativeElement,
    '.tab2-grid .datatable-body',
    'tab2'
  );
}

/** Bootstrap fires this once Tab 1's pane is actually visible in the DOM. */
onAssignActivitiesTabShown(): void {
  setTimeout(() => this.syncTab1Scrollbar(), 150);
}


onMyAllAssignActivitiesTabShown(): void {
  setTimeout(() => this.syncTab2Scrollbar(), 150);
}

  ngAfterViewInit() {

    setTimeout(() => this.syncTab1Scrollbar(), 300);
  }

  ngOnDestroy(): void {
    this.tab1WidthObserver?.disconnect();
    this.tab2WidthObserver?.disconnect();
    if (this.topScrollbar?.nativeElement) {
      this.topScrollbar.nativeElement.onscroll = null;
    }
    if (this.topScrollbar2?.nativeElement) {
      this.topScrollbar2.nativeElement.onscroll = null;
    }
  }

selectedSchoolDivision: any = '0';
  
  onSchoolDivisionChange(event: any): void {
    this.applyFiltersTab1();
  }
 
 DivisionNamesByIds(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }

//2-7-26
 getDocumentFiles(files: string): string[] {
  // console.log('DocumentUploadedFile:', files);

  if (!files) {
    return [];
  }

  const result = files
    .split(',')
    .map(x => x.trim())
    .filter(x => x);

  // console.log('Files Array:', result);

  return result;
}
getFileName(fileUrl: string): string {
  return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
}



//26-6-26 
// view all uploaded Document against Each Project Document
  AllProjectDocumentUploaded: any[] = [];
  OpenSelectFile(a: any) {
    let aa = a;
    window.open(this.ServerUrl+aa.FilePath, '_blank');
    // window.open(aa.FilePath, '_blank');
  }


 
  GetAllAllProjectDocumentUploaded(mouId: any) {
      const formData = new FormData();

  formData.append('MouId', mouId);
  formData.append('Uid', this.EmployeeCode);
  formData.append('Action', 'view');
   this.mouDocumentsService
    .GetAllActionTakenUploadedDocument(formData)
    .subscribe({
      next: (response: any) => {
        if (response.item1.length > 0) {
          // keep master copy and apply filters
          this.AllProjectDocumentUploaded = response.item1;
          
          this.dataSource.data = this.AllProjectDocumentUploaded;
          this.loadingIndicator = false;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.AllProjectDocumentUploaded[0];
          this.columns = Object.keys(this.AllProjectDocumentUploaded[0]);
          this.columns = this.columns.filter((item: any) => item !== 'newMouId' && item !== 'filePath' && item != 'mouPartnerName' && item != 'actionApprovalStatus' && item !== 'sessionAcademicYear' && item !== 'mouApprovedByFacultyName' && item !== 'assignedToFacultyName' && item !== 'schoolDivisionInvolved' && item !== 'sessionId' && item !== 'documentUploaded' && item !== 'activityTitle' && item !== 'participantsCount' && item !== 'activityCount' && item !== 'uploadActivityDate' && item !== 'activityStartDate' && item !== 'activityEndDate' && item !== 'authorityRemarks' && item !== 'activityAlloted' && item !== 'mouTitle' && item !== 'mouStartDate' && item !== 'mouStatus' && item !== 'mouEndDate' && item !== 'startDate' && item !== 'endDate' && item !== 'actionAssignedBy' && item !== 'activityDetails' && item !== 'approvalStatus' && item !== 'approvalDate' && item !== 'userRemarks' && item !== 'disapprovalReason' && item !== 'uploadedActionFile' && item !== 'uploadedProofTitle' && item !== 'uid' && item !== 'mouId' && item !== 'id');
          this.columns.push()
          this.loadingIndicator = false;
        } else {
          this.dataSource.data = this.AllProjectDocumentUploaded = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  viewAllUploadedDocs(Data:any){
    this.GetAllAllProjectDocumentUploaded(Data.mouId);
      this.modalService.open(this.viewAllActionTakenUploadedDocumentModal, { size: 'lg' }).result.then((result) => {
      window.location.reload();
    }).catch((res) => { });
  }
// Added on 24-6-26 

isFieldInvalid(control: any): boolean {
  return !!(
    control &&
    control.invalid &&
    (control.touched || control.dirty)
  );
}


checkFormsValidity(): void {

  if (
    this.FacultyActivityStartDate &&
    this.FacultyActivityEndDate &&
    new Date(this.FacultyActivityStartDate) >
      new Date(this.FacultyActivityEndDate)
  ) {

    swal.fire({
      title: 'Validation',
      text: 'Faculty Activity End Date must be greater than or equal to Start Date.',
      icon: 'warning'
    });

    this.FacultyActivityEndDate = '';
  }
}

ActivityFileData: any[] = [];
ActivityFileName: any[] = [];
ActivityFileStatus: boolean[] = [];

uploadedDocuments: string[] = [];
allDocumentsUploaded: boolean = false;
uploadedFileNames: { [key: string]: string } = {};

  // added Logic on 23-6-26



  requiredDocumentFiles: File[] = [];


 

  onFileSelectedActivityFile(event: any, index: number): void {

  const target = event.target as HTMLInputElement;
  const file: File | null = target.files?.[0] || null;

  if (!file) {
    this.ActivityFileName[index] = '';
    this.ActivityFileData[index] = '';
    this.ActivityFileStatus[index] = false;
    return;
  }

  if (file.size > 3148576) {
    swal.fire({
      title: 'File size exceeds 3MB. Please upload a smaller file.',
      text: 'Invalid File size',
      icon: 'warning'
    });

    target.value = '';
    return;
  }

  let modifiedFile = file;
  let validFileName = file.name;

  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;

  if (!fileNameRegex.test(file.name)) {

    validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    modifiedFile = new File(
      [file],
      validFileName,
      { type: file.type }
    );

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(modifiedFile);
    target.files = dataTransfer.files;
  }

  const reader = new FileReader();

  reader.onload = () => {

    const result = reader.result as string;

    if (result) {

      const base64Data = result.split(',')[1];

      this.ActivityFileData[index] = base64Data;
      this.ActivityFileName[index] = validFileName;
      this.ActivityFileStatus[index] = true;
    }
  };

  reader.readAsDataURL(modifiedFile);
}

uploadRequiredDocument(documentName: string, index: number) {

  if (
    !this.ActivityFileData[index] ||
    !this.ActivityFileName[index]
  ) {
    swal.fire({
      title: 'Please select a file first.',
      icon: 'warning'
    });
    return;
  }

  const formData = new FormData();

  formData.append('DocumentName', documentName);
  formData.append('MouId', this.mouId);
  formData.append('Uid', this.EmployeeCode);
  formData.append('FilePath', this.ActivityFileName[index]);
  formData.append('FileData', this.ActivityFileData[index]);
  formData.append('Action', 'Insert');

  this.mouDocumentsService
    .MouActionTakenDocumentsOperations(formData)
    .subscribe({
      next: (response: any) => {

        if (!this.uploadedDocuments.includes(documentName)) {
          this.uploadedDocuments.push(documentName);
        }

        this.uploadedFileNames[documentName] =
          this.ActivityFileName[index];

        this.allDocumentsUploaded =
          this.uploadedDocuments.length ===
          this.selectedDocuments.length;

        swal.fire({
          title: 'Success',
          text: documentName + ' uploaded successfully',
          icon: 'success'
        });

      },
      error: (error: any) => {

        console.error(error);

        swal.fire({
          title: 'Upload Failed',
          text: 'Unable to upload document.',
          icon: 'error'
        });
      }
    });
}
// uploadRequiredDocument(documentName: string, index: number) {

//   if (!this.ActivityFileStatus ||
//       !this.ActivityFileData ||
//       !this.ActivityFileName) {

//     swal.fire({
//       title: 'Please select a file first.',
//       icon: 'warning'
//     });

//     return;
//   }

//   const formData = new FormData();

//   formData.append('DocumentName', documentName);
//   formData.append('MouId', this.mouId);
//   formData.append('Uid', this.EmployeeCode);
//   formData.append('FilePath', this.ActivityFileName);
//   formData.append('FileData', this.ActivityFileData);
//   formData.append('Action', 'Insert');

//   console.log('DocumentName:', documentName);
//   console.log('FilePath:', this.ActivityFileName);
//   console.log('FileData Length:', this.ActivityFileData?.length);

//   this.mouDocumentsService
//     .MouActionTakenDocumentsOperations(formData)
//     .subscribe({
//       next: (response: any) => {

//         swal.fire({
//           title: 'Success',
//           text: documentName + ' uploaded successfully',
//           icon: 'success'
//         });

//       },
//       error: (error: any) => {

//         console.error(error);

//         swal.fire({
//           title: 'Upload Failed',
//           text: 'Unable to upload document.',
//           icon: 'error'
//         });

//       }
//     });
// }
 
  // added on 17-06-26



  selectedDocuments: string[] = [];

  activityDocuments: { [key: string]: string[] } = {

    'Research publication': [
      'Research-Paper',
      'Conference-Certificate',
      'Conference-Brochure'
    ],

    'Project ': [
      'Project-Report',
      'List-of-Students'
    ],

    'Academic exchange': [
      'Appointment-Letter',
      'Activity-Report',
      'Photographs'
    ],

    'Student exchange ': [
      'Letter-of-Acceptance',
      'Course-Completion-Certificate',
      'Student-Registration-Numbers'
    ],

    'Guest lecture ': [
      'Event-Report',
      'Participant-List',
      'Photographs'
    ],

    'Workshop ': [
      'Workshop-Report',
      'Attendance-Sheet',
      'Photographs'
    ],

    'Internship ': [
      'Internship-Certificate',
      'Student-Registration Number'
    ],

    'On job Training (OJT) ': [
      'Offer-Letter',
      'Joining-Letter',
      'Student-Registration-Number'
    ],

    'Co-Supervision ': [
      'Research-Paper',
      'NOC',
      'Undertaking'
    ],

    'Related to SDG ': [
      'Activity-Report',
      'Supporting-Documents'
    ],

    'Conference': [
      'Conference-Certificate',
      'Conference-Brochure',
      'Photographs'
    ],

    'Others': [
      'Supporting-Documents'
    ]
  };

  onActivityChange(activityTitle: string): void {

    this.selectedDocuments =
      this.activityDocuments[activityTitle] || [];

  }




  // ended logic for 17-06-26


  // added on 25-5-26 
  Tab1statusFilter: string = 'all';

  // master copy of API data - never mutate this
  MouActionTakenDocumentsMaster: any[] = [];

  // receive the new selected value (string) from ngModelChange
  onStatusChangeTab1(value: string): void {
    this.Tab1statusFilter = value;
    this.applyFiltersTab1();
  }

  applyFiltersTab1(): void {
    // Work from the master copy
    let filtered = (this.MouActionTakenDocumentsMaster || []).slice();

    // Filter by status
    if (this.Tab1statusFilter && this.Tab1statusFilter !== 'all') {
      const status = this.Tab1statusFilter.toLowerCase();
      filtered = filtered.filter(item => {
        const mouStatus = (item.mouStatus || '').toString().toLowerCase();
        if (status === 'active') return mouStatus === 'active';
        if (status === 'expired') return mouStatus === 'expired';
        if (status === 'renewed') return mouStatus === 'renewed';
        return true;
      });
    }

     if (this.selectedSchoolDivision && this.selectedSchoolDivision !== '0') {
      filtered = filtered.filter(item => {
        if (!item.schoolDivisionInvolved) return false;
        return item.schoolDivisionInvolved
          .split(',')
          .map((id: string) => id.trim())
          .includes(this.selectedSchoolDivision.toString());
      });
    }


    filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryActionTaken));

    // Then apply search filter if exists
    const query = (this.searchQuery || '').toString().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((item: any) => {
        return Object.entries(item).some(([key, val]) => {
          if (val !== null && val !== undefined) {
            const valueString = String(val).toLowerCase();

            // Special handling for mouId / id
            if (key === 'mouId' || key === 'id') {
              const numericId = Number(val);
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

    // update only the filtered view - keep master intact
    this.filteredMouActionTakenDocuments = filtered;

    setTimeout(() => this.syncTab2Scrollbar(), 100);
  }


  getActiveCount(): number {
    return (this.filteredMouActionTakenDocuments || []).filter(item => {
      return (item.mouStatus || '').toString().toLowerCase() === 'active';
    }).length;
  }

  getExpiredCount(): number {
    return (this.filteredMouActionTakenDocuments || []).filter(item => {
      return (item.mouStatus || '').toString().toLowerCase() === 'expired';
    }).length;
  }
  getRenewedCount(): number {
    return (this.filteredMouActionTakenDocuments || []).filter(item => {
      return (item.mouStatus || '').toString().toLowerCase() === 'renewed';
    }).length;
  }



  @ViewChild('stageModal') stageModal: TemplateRef<any>;
  @ViewChild('divstagesHistory') divstagesHistory: TemplateRef<any>;
  @ViewChild('divstagesHistoryFiles') divstagesHistoryFiles: TemplateRef<any>;

  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModal') viewActivityActionTakenModal: TemplateRef<any>;
  @ViewChild('viewAllActionTakenUploadedDocumentModal') viewAllActionTakenUploadedDocumentModal: TemplateRef<any>;
  searchQuery: any;
  filteredMouActivityDocuments: any[] = [];
  DocumentName: string = '';
  Remarks: any;
  ExpectedstartDate: any;
  ExpectedEndDate: any;
  DepartmentName: any;
  UploadedFileUrl: any = '';
  PresentDate: any = '';
  CurrentApprovalStatus: any;
  CurrentdisapprovalReason: any;
  ActivityDetails: any;

  // Redirect to Other interface for 

  clearFields(): void {
    this.mouId = this.CompletedDate = this.ResponsiblePerson = '';
    if (this.selectedActivityId == 11 || this.selectedActivityId == 12 || this.selectedActivityId == 23 || this.selectedActivityId == 14) // Added on 29 Nov-25 for  the Guest lecture from IQAC Redirect
    // if(this.selectedActivityId == 11 || this.selectedActivityId==12  || this.selectedActivityId==23 ) // || this.selectedActivityId==14 removed the Guest lecture from IQAC Redirect
    {
      swal.fire({
        title: 'Since this Activity is also involved IQAC Interface thus Redirecting to the IQAC interface ',
        text: 'You are Kindly requested to fill the details in IQAC.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'https://ums.lpu.in/lpuums/frmIQACdetails.aspx';
      });
    }

  }
  // transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;


  employeeControl = new FormControl();
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex = -1;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];


  errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
  fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
  filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";



  TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
  selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; CompletedDate: any; endDate: any; EmployeeDetails: any;
  EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: number = 0;
  ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];

  MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];

  FacultyActivityStartDate: string = '';
  FacultyActivityEndDate: string = '';

  takeActionForm!: FormGroup;

  documentName: string = '';
  expectedStartDate: string = '';
  expectedEndDate: string = '';
  uploadedFileUrl: string = '';
  currentDisapprovalReason: string = '';

  constructor(private Agreement: AgreementEntryService, private cd: ChangeDetectorRef,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private ObpService: ObpAutoAssignService,
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
    const currentDate = new Date();
    this.CompletedDate = this.endDate = this.CompletedDate = this.endDate = this.formatDate(currentDate);
    // this.FacultyActivityEndDate  = this.FacultyActivityStartDate = this.formatDate(currentDate);
    this.ServerUrl = 'http://files.lpu/umsweb/webftp/MOUDocuments/';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
      (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU </span>Activity Take <span class="themeClr">Action </span>';
      (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    }

    this.takeActionForm = this.fb.group({
      mouActivity: ['', Validators.required],
      remarks: ['', Validators.required],
      completedDate: ['', Validators.required],
      file: [null, Validators.required],
      sessionId: ['', Validators.required],
      Activity: ['', Validators.required],
      FacultyActivityStartDate: new FormControl('', Validators.required),
      FacultyActivityEndDate: new FormControl('', Validators.required),
      ParticipantsCount: new FormControl('', Validators.required),
      ActivitiesSubmitted: new FormControl('', Validators.required),
    });
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
        this.getAllPlannerSession();
        this.GetEmployeeDetails();
        this.GetAllCategories();
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
    const element = document.getElementById('ActivityTakeActionPage');
    if (element) {
      element.hidden = true;
    }
  }

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode; //11840
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          this.GetAllMouDocumentsForActions();
          this.getDropdownData();
          this.getAllMouActivities();
          this.GetAllActivities();
          this.GetAllMouActionsTaken();

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


  // master copy for Take Action tab
  MouActivityDocumentsMaster: any[] = [];
  Tab1StatusFilterTakeAction: string = 'all';
  AllMouCategories: MouCategory[] = [];
  SelectedMouCategoryTakeAction: any = 'All';
  SelectedMouCategoryActionTaken: any = 'All';

  GetAllCategories(): void {
    this.mouDocumentsService.GetMouCategories().subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.AllMouCategories = response.item1.map((x: any, index: number) => ({
            id: index + 1,
            CategoryName: x.items
          }));
        } else {
          this.AllMouCategories = [];
        }
      },
      error: err => { this.LoginFailed(err); }
    });
  }

  private matchMouCategory(item: any, selected: any): boolean {
    if (!selected || selected === 'All') {
      return true;
    }
    const categoryName = selected.CategoryName;
    return String(item.mouCategory ?? '').toLowerCase() === categoryName.toLowerCase();
  }

  onSchoolDivisionChange1(event: any): void {
      this.applyFiltersTakeAction();

  }
  onCategoryChangeTakeAction(): void {
    this.applyFiltersTakeAction();
  }

  onCategoryChangeActionTaken(): void {
    this.applyFiltersTab1();
  }

  onStatusChangeTakeAction(value: string): void {
    this.Tab1StatusFilterTakeAction = value;
    this.applyFiltersTakeAction();
  }

  applyFiltersTakeAction(): void {
    let filtered = (this.MouActivityDocumentsMaster || []).slice();

    if (this.Tab1StatusFilterTakeAction && this.Tab1StatusFilterTakeAction !== 'all') {
      const status = this.Tab1StatusFilterTakeAction.toString().toLowerCase();
      filtered = filtered.filter(item => {
        const mouStatus = (item.mouStatus || '').toString().toLowerCase();
        if (status === 'active') return mouStatus === 'active';
        if (status === 'expired') return mouStatus === 'expired';
        if (status === 'renewed') return mouStatus === 'renewed';
        return true;
      });
    }

   
    if (this.selectedSchoolDivision && this.selectedSchoolDivision !== '0') {
      filtered = filtered.filter(item => {
        if (!item.schoolDivisionInvolved) return false;
        return item.schoolDivisionInvolved
          .split(',')
          .map((id: string) => id.trim())
          .includes(this.selectedSchoolDivision.toString());
      });
    }
 filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryTakeAction));
    // If there's a searchQuery applied globally to this tab, keep parity with other filters
    const query = (this.searchQuery || '').toString().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((item: any) => {
        return Object.entries(item).some(([_, val]) => {
          if (val !== null && val !== undefined) {
            return String(val).toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    this.filteredMouActivityDocuments = filtered;


    setTimeout(() => this.syncTab1Scrollbar(), 100);
  }

  getActiveCountTakeAction(): number {
    return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'active').length;
  }
  getExpiredCountTakeAction(): number {
    return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'expired').length;
  }
  getRenewedCountTakeAction(): number {
    return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'renewed').length;
  }



  GetAllMouDocumentsForActions(): void {
    this.mouDocumentsService.MouDocumentstoTakeAction(this.EmployeeCode).subscribe({
      next: response => {
        const data = response && response.item1 ? response.item1 : response;
        if (data && data.length > 0) {
          // keep master copy and apply filters
          this.MouActivityDocumentsMaster = data;
          this.MouActivityDocuments = data;
          this.applyFiltersTakeAction();

          this.dataSource.data = this.MouActivityDocuments;
          this.loadingIndicator = false;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouActivityDocuments[0];
          // this.columns = Object.keys(this.MouActivityDocuments[0]);
          // this.columns = this.columns.filter((item: any) => item !== 'mouPartnerName' &&  item !== 'uploadActivityDate' &&  item !== 'newMouId' &&  item !== 'newMouId' && item !== 'filePath' && item != 'mouPartnerName' && item != 'actionApprovalStatus' && item !== 'sessionAcademicYear' && item !== 'mouApprovedByFacultyName' && item !== 'assignedToFacultyName' && item !== 'schoolDivisionInvolved' && item !== 'sessionId' && item !== 'documentUploaded' && item !== 'activityTitle' && item !== 'participantsCount' && item !== 'activityCount' && item !== 'uploadActivityDate' && item !== 'activityStartDate' && item !== 'activityEndDate' && item !== 'authorityRemarks' && item !== 'activityAlloted' && item !== 'mouTitle' && item !== 'mouStartDate' && item !== 'mouStatus' && item !== 'mouEndDate' && item !== 'startDate' && item !== 'endDate' && item !== 'actionAssignedBy' && item !== 'activityDetails' && item !== 'approvalStatus' && item !== 'approvalDate' && item !== 'userRemarks' && item !== 'disapprovalReason' && item !== 'uploadedActionFile' && item !== 'uploadedProofTitle' && item !== 'uid' && item !== 'mouId' && item !== 'id');
          this.columns.push()
          this.loadingIndicator = false;


          
        } else {
          this.dataSource.data = this.MouActivityDocuments = this.filteredMouActivityDocuments = this.MouActivityDocumentsMaster = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
  onSelectFile(a: any) {
    let aa = a;
    // window.open(this.ServerUrl+aa.fileName, '_blank');
    window.open(aa.filePath, '_blank');
  }

  onSelectFileX(a: any) {
    let aa = a;
    window.open(aa.filePath, '_blank');
  }
  // added on 5-Feb-26

  onDownloadFile(remoteUrl: string): void {
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

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

  // 29-jan-25 Changes start
  // formdata!: FormGroup;
  allSchoolDivisions: SchoolDivision[] = [];
  Activities: any;
  Activity: any = '';
  selectedActivityType: string = '';

  sessionId: any = ''; // Default empty value
  items: any[] = []; // Array to store dropdown options
  SessionId: any = 'Select';
  ParticipantsCount: any = '';
  ActivitiesSubmitted: any = '';



  formdata = new FormGroup({
    mouActivity: new FormControl('', Validators.required),
    remarks: new FormControl('', Validators.required),
    CompletedDate: new FormControl('', Validators.required),
    File: new FormControl('', Validators.required),
    sessionId: new FormControl('Select', Validators.required),
    ParticipantsCount: new FormControl('', Validators.required),
    ActivitiesSubmitted: new FormControl('', Validators.required),
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

  getAllMouActivities(): void {
    this.mouDocumentsService.GetAllMouActivities().subscribe({
      next: response => {
        if (response.item1) {
          this.Activities = response.item1;
          // console.log(JSON.stringify(this.Activities))
        }
      }
    })
  }

  get formControls() {
    return this.formdata.controls;
  }

  // Debugging: Check selected value
  onSessionChange(event: any) {
    // console.log('Selected Session ID:', event.target.value);
  }

  // End 29-jan-25 changes
  MouStatus: any; // 28-jan-25
  onSelect(a: any) {

    this.selectedActivityId = 0;
    this.selectedDocuments = [];

    let aa = a;
    // alert(JSON.stringify(aa))
    this.mouId = aa['mouId']
    this.ActivityDetails = aa['activityDetails'];
    if (this.ActivityDetails?.length > 0) {
      const [id, description] = this.ActivityDetails.split('-', 2);

      // Assign the values to the class properties
      this.selectedActivityId = parseInt(id, 10);
      this.DocumentName = description;
    }
    this.ExpectedstartDate = a['startDate'];
    this.ExpectedEndDate = a['endDate'];
    this.UploadedFileUrl = a['filePath'];
    this.CurrentApprovalStatus = a['approvalStatus'];
    this.CurrentdisapprovalReason = a['disapprovalReason'];
    this.MouStatus = aa['mouStatus'] == null ? 'NA' : aa['mouStatus'];
    // alert(this.MouStatus)
    // <ng-container *ngIf="row.approvalStatus != null && row.disapprovalReason?.length > 0;" >
    this.PresentDate = this.datePipe.transform(new Date(), 'dd-MMM-yyyy');
    // alert(this.formatDates(this.PresentDate) +">" + this.formatDates(this.ExpectedEndDate))
    // if(this.formatDates(this.PresentDate) > this.formatDates(this.ExpectedEndDate))
    // {
    //   // alert('Not Applicable')
    //   swal.fire({
    //     title: 'Since Expected End Date is Lapsed So Action is not Allowed , Contact Your HOS',
    //     icon: 'error'
    //   })
    // }
    // else
    // {
    this.cd.detectChanges();
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
      window.location.reload();
    }).catch((res) => { });
    //  }
  }
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
  }
  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.Remarks?.length < 4
      && this.DocumentName != ''
      && this.CompletedDate !== ''
      && this.fileData != null
      && this.FacultyActivityStartDate != ''
      && this.FacultyActivityEndDate != ''
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

  search() {
    this.applyFiltersTakeAction();
  }
  searchData() {
    // search should update the filtered view respecting current status filter and session
    // searchQuery already bound; simply re-run applyFiltersTab1
    this.applyFiltersTab1();
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


  getDivisionNamesByIdss(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
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
  exportToExcel(): void {
    const fileName = 'Mou_Document_report.xlsx';
    const exportedData = this.MouActivityDocuments.map(item => ({
      NewMOUId: item.newMouId,
      OldMOUId: "MOU/" + item.id,
      'Name of MOU Organisation': item.mouTitle == null ? '-' : item.mouTitle,
      'Assigned To Faculty Name': item.assignedToFacultyName == null ? '-' : item.assignedToFacultyName,
      'Assigned To Faculty Uid': item.uid == null ? '-' : item.uid,
      'Name of School/Division Involved': this.getDivisionNamesByIdss(item.schoolDivisionInvolved.split(',').map(Number)),
      'Details of Activity': item.activityDetails == null ? '-' : item.activityDetails,
      'Start Date of Mou Activity Assigned by HOS': item.startDate == null ? '-' : item.startDate,
      'End Date of Mou Activity Assigned by HOS': item.endDate == null ? '-' : item.endDate,
      'Details of Proof Submitted by Faculty': item.documentUploaded == null ? '-' : item.documentUploaded,
      'Session Academic Year': item.sessionAcademicYear == null ? '-' : item.sessionAcademicYear,
      'Activity Category': item.activityTitle == null ? '-' : item.activityTitle,
      'Participants Count': item.participantsCount == null ? '-' : item.participantsCount,
      'Number of Activities Submitted': item.activityCount == null ? '-' : item.activityCount,
      'Upload Activity Date': item.uploadActivityDate == null ? '-' : item.uploadActivityDate,
      'Mou Approval Status': item.mouStatus == null ? '-' : item.mouStatus,
      'Mou Disapproval Reason': item.disapprovalReason == null ? '-' : item.disapprovalReason,
      'Mou Approved By FacultyName': item.mouApprovedByFacultyName == null ? '-' : item.mouApprovedByFacultyName,
      'Mou Approval Date': item.approvalDate == null ? '-' : item.approvalDate,
      'Authority Remarks': item.authorityRemarks == null ? '-' : item.authorityRemarks,
      'DocumentUrl': item.filePath
    }));

    // Add headers
    const header = [
      'New MOU Id',
      'Old MOU Id',
      'Name of MOU Organisation',
      'Assigned To Faculty Name',
      'Assigned To Faculty Uid',
      'School Division Involved',
      'Details of Activity',
      'Start Date of Mou Activity Assigned by HOS',
      'End Date of Mou Activity Assigned by HOS',
      'Details of Proof Submitted by Faculty',
      'Session AcademicYear ',
      'Activity Category',
      'Participants Count',
      'Number of Activities Submitted',
      'Upload Activity Date',
      'Mou Approval Status',
      'Mou Disapproval Reason', 'Mou Approved By FacultyName',
      'Mou Approval Date',
      'Authority Remarks',
      'DocumentUrl'
    ];

    const ws_data = [header, ...exportedData.map(item => Object.values(item))];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 19 }); // Column 7 is DocumentUrl
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
      }
    }

    const wscols = [
      { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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

  resetForm() {
    this.selectedActivityId = 0;
    this.FacultyActivityStartDate = '';
    this.FacultyActivityEndDate = '';
    this.Remarks = '';
    this.sessionId = '';
    this.Activity = '';
    this.selectedActivityType = '';
    this.fileName = '';
    this.FileData = null;
  }

  UploadActivity(form: NgForm) {

  if (form.invalid) {

    swal.fire({
      title: 'Validation',
      text: 'Please complete all mandatory fields.',
      icon: 'warning'
    });

    return;
  }
 
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('Uid', this.EmployeeCode);
    formData.append('CompletedDate', this.CompletedDate);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    formData.append('DocumentName', this.DocumentName ? this.DocumentName : this.Activity);
    formData.append('Remarks', this.Remarks);
    formData.append('MouStatus', this.MouStatus);
    formData.append('SessionId', this.sessionId);
    formData.append('ActivityTitle', this.Activity);
    formData.append('ActivityCategory', this.selectedActivityType);
    formData.append('ParticipantsCount', this.ParticipantsCount);
    formData.append('ActivityCount', this.ActivitiesSubmitted);
    formData.append('FacultyActivityStartDate', this.FacultyActivityStartDate);
    formData.append('FacultyActivityEndDate', this.FacultyActivityEndDate);
    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    this.mouDocumentsService.InsertMouActivityActionTaken(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'success') {
          swal.fire({
            title: 'Action Planned Stored Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else if (result === '-1') {
          swal.fire({
            title: 'Error in File Upload Try again Later',
            icon: 'error'
          }).then(() => {
            window.location.reload();
          });
        } else {
          swal.fire({
            title: 'Something Went Wrong, Try again later',
            icon: 'error'
          }).then(() => {
            window.location.reload();
          });
        }
      },
      error: (error: any) => {
        swal.fire({
          title: 'Error',
          text: 'Failed to Upload.',
          icon: 'error'
        }).then(() => {
          window.location.reload();
        });
      },
      complete: () => {
        this.clearFields();
      }
    });
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


  MyActionTkenData(): void {
    this.GetAllMouActionsTaken();
    // this.modalService.open(this.viewActivityActionTakenModal, { size: 'lg' }).result.then((result) => {
    //   window.location.reload();
    // }).catch((res) => { });
  }


  GetAllMouActionsTaken(): void {
    this.loadingIndicator = true;
    this.showNoDataFoundMessage = false;
    this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode, this.selectedPlannerSession).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          // keep a master copy and then apply current filters to populate filtered view
          this.MouActionTakenDocumentsMaster = response.item1;
          this.MouActionTakenDocuments = response.item1; // optional legacy reference
          this.applyFiltersTab1();

          this.dataSource.data = this.MouActionTakenDocuments;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouActionTakenDocuments[0];
          // this.columns = Object.keys(this.MouActionTakenDocuments[0]);
          // this.columns = this.columns.filter((item: any) => item !== 'approvalStatus' && item !== 'newMouId' && item !== 'assignedToFacultyName' && item !== 'documentUploaded' && item !== 'mouPartner' && item !== 'completedDate' && item !== 'assignedToFacultyUID' && item !== 'startDate' && item !== 'endDate' && item !== 'documentUploadedFile' && item !== 'documentUploadedFile' && item !== 'mouStatus' && item !== 'id' && item !== 'sessionId' && item != 'mouApprovedByFacultyUID' && item != 'sessionAcademicYear' && item != 'activityDetails' && item != 'activityStartDate' && item != 'activityEndDate' && item !== 'assignedToFacultyUID' && item !== 'schoolDivisionInvolved' && item !== 'filePath' && item !== 'fileName' && item !== 'mouId' && item !== 'documentName' && item !== 'isApproved' && item !== 'approvedBy' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'file' && item !== 'createdBy' && item !== 'updatedOn' && item !== 'updatedBy' && item !== 'ipAddress');
          this.columns.push()

          this.showNoDataFoundMessage = false;

        } else {
          this.dataSource.data = this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = this.MouActionTakenDocumentsMaster = [];
          this.showNoDataFoundMessage = true;
        }
        this.loadingIndicator = false;
        setTimeout(() => this.syncTab2Scrollbar(), 100);
      },
      error: err => {
        this.dataSource.data = this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = this.MouActionTakenDocumentsMaster = [];
        this.showNoDataFoundMessage = true;
        this.loadingIndicator = false;
        this.LoginFailed(err);
      }
    });
  }

  onFileXSelected(event: any, id: number): void {
    this.fileChosen[id] = event.target.files.length > 0;
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3 MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.fileData = modifiedFile;
      this.fileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }

    this.fileData = file;
    this.fileStatus = true;

    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = file.name;
      };
    }
  }

  UpdateFileDocument(Id: any) {
    if (this.fileChosen[Id]) {
      const formData = new FormData();
      formData.append('Id', Id);
      formData.append('FilePath', this.fileName);
      formData.append('File', this.FileData);
    }
  }


  // aaded on 30-may-25

  allPlannerSessions: any[] = [];
  selectedPlannerSession: any = '0';  // default selected value
  allOBPStaffData: any[] = [];

  getAllPlannerSession(): void {
    this.mouDocumentsService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
        }
      }
    });
  }
  setSessionId(event: any) {
    const selectedId = event.target.value;
    this.selectedPlannerSession = selectedId;

    this.GetAllMouActionsTaken();
  }
  // end new add 30-May-25 
  isLoading: boolean = false;

}

// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { NgForm } from '@angular/forms';
// import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';

// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { PlacementService } from 'src/app/_services/placement.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT } from '@angular/common';
// import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
// import { DatePipe } from '@angular/common';
// import swal from 'sweetalert2';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { MatTableDataSource } from '@angular/material/table';
// import { MouActivity } from './MouActivity';
// import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
// import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
// import * as XLSX from 'xlsx';
// import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
// import { mouActivities } from './mouActivities';
// interface Employee {
//   employeeName: string;
//   employeeCode: string;
// }
// interface SchoolDivision {
//   id: number;
//   schoolDivision: string;
// }
// interface MouCategory {
//   id: number;
//   CategoryName: string;
// }

// @Component({
//   selector: 'MouActivityTakeAction',
//   templateUrl: './MouActivityTakeAction.component.html',
//   styleUrls: ['./MouActivityTakeAction.component.scss'],
//   standalone: false,

// })
// export class MouActivityTakeActionComponent implements OnInit {

// @ViewChild('topScrollbar')
// topScrollbar!: ElementRef<HTMLDivElement>;

// @ViewChild('topScrollbarContent')
// topScrollbarContent!: ElementRef<HTMLDivElement>;


// @ViewChild('topScrollbar2')
// topScrollbar2!: ElementRef<HTMLDivElement>;

// @ViewChild('topScrollbarContent2')
// topScrollbarContent2!: ElementRef<HTMLDivElement>;


// private initializeTopScrollbar(
//   topBar: HTMLElement,
//   spacer: HTMLElement,
//   selector: string
// ): void {

//   const body = document.querySelector(selector) as HTMLElement;

//   if (!body) {
//     return;
//   }

//   spacer.style.width = body.scrollWidth + 'px';

//   topBar.onscroll = () => {
//     body.scrollLeft = topBar.scrollLeft;
//   };

//   body.onscroll = () => {
//     topBar.scrollLeft = body.scrollLeft;
//   };
// }

//   ngAfterViewInit() {

//     setTimeout(() => {

//       const body = document.querySelector(
//         '.ngx-datatable .datatable-body'
//       ) as HTMLElement;

//       if (!body) {
//         return;
//       }

//       this.topScrollbarContent.nativeElement.style.width =
//         body.scrollWidth + 'px';

//       this.topScrollbar.nativeElement.onscroll = () => {
//         body.scrollLeft = this.topScrollbar.nativeElement.scrollLeft;
//       };

//       body.onscroll = () => {
//         this.topScrollbar.nativeElement.scrollLeft = body.scrollLeft;
//       };

//     }, 300);

//   }

// selectedSchoolDivision: any = '0';
  
//   onSchoolDivisionChange(event: any): void {
//     this.applyFiltersTab1();
//   }
 
//  DivisionNamesByIds(ids: number[]): string {
//     return ids.map(id => this.getDivisionNameById(id)).join(', ');
//   }

// //2-7-26
//  getDocumentFiles(files: string): string[] {
//   // console.log('DocumentUploadedFile:', files);

//   if (!files) {
//     return [];
//   }

//   const result = files
//     .split(',')
//     .map(x => x.trim())
//     .filter(x => x);

//   // console.log('Files Array:', result);

//   return result;
// }
// getFileName(fileUrl: string): string {
//   return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
// }



// //26-6-26 
// // view all uploaded Document against Each Project Document
//   AllProjectDocumentUploaded: any[] = [];
//   OpenSelectFile(a: any) {
//     let aa = a;
//     window.open(this.ServerUrl+aa.FilePath, '_blank');
//     // window.open(aa.FilePath, '_blank');
//   }


 
//   GetAllAllProjectDocumentUploaded(mouId: any) {
//       const formData = new FormData();

//   formData.append('MouId', mouId);
//   formData.append('Uid', this.EmployeeCode);
//   formData.append('Action', 'view');
//    this.mouDocumentsService
//     .GetAllActionTakenUploadedDocument(formData)
//     .subscribe({
//       next: (response: any) => {
//         if (response.item1.length > 0) {
//           // keep master copy and apply filters
//           this.AllProjectDocumentUploaded = response.item1;
          
//           this.dataSource.data = this.AllProjectDocumentUploaded;
//           this.loadingIndicator = false;
//           this.columns = []; this.headHtmlData = [];
//           this.headHtmlData = this.AllProjectDocumentUploaded[0];
//           this.columns = Object.keys(this.AllProjectDocumentUploaded[0]);
//           this.columns = this.columns.filter((item: any) => item !== 'newMouId' && item !== 'filePath' && item != 'mouPartnerName' && item != 'actionApprovalStatus' && item !== 'sessionAcademicYear' && item !== 'mouApprovedByFacultyName' && item !== 'assignedToFacultyName' && item !== 'schoolDivisionInvolved' && item !== 'sessionId' && item !== 'documentUploaded' && item !== 'activityTitle' && item !== 'participantsCount' && item !== 'activityCount' && item !== 'uploadActivityDate' && item !== 'activityStartDate' && item !== 'activityEndDate' && item !== 'authorityRemarks' && item !== 'activityAlloted' && item !== 'mouTitle' && item !== 'mouStartDate' && item !== 'mouStatus' && item !== 'mouEndDate' && item !== 'startDate' && item !== 'endDate' && item !== 'actionAssignedBy' && item !== 'activityDetails' && item !== 'approvalStatus' && item !== 'approvalDate' && item !== 'userRemarks' && item !== 'disapprovalReason' && item !== 'uploadedActionFile' && item !== 'uploadedProofTitle' && item !== 'uid' && item !== 'mouId' && item !== 'id');
//           this.columns.push()
//           this.loadingIndicator = false;
//         } else {
//           this.dataSource.data = this.AllProjectDocumentUploaded = [];
//           this.showNoDataFoundMessage = true;
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }

//   viewAllUploadedDocs(Data:any){
//     this.GetAllAllProjectDocumentUploaded(Data.mouId);
//       this.modalService.open(this.viewAllActionTakenUploadedDocumentModal, { size: 'lg' }).result.then((result) => {
//       window.location.reload();
//     }).catch((res) => { });
//   }
// // Added on 24-6-26 

// isFieldInvalid(control: any): boolean {
//   return !!(
//     control &&
//     control.invalid &&
//     (control.touched || control.dirty)
//   );
// }


// checkFormsValidity(): void {

//   if (
//     this.FacultyActivityStartDate &&
//     this.FacultyActivityEndDate &&
//     new Date(this.FacultyActivityStartDate) >
//       new Date(this.FacultyActivityEndDate)
//   ) {

//     swal.fire({
//       title: 'Validation',
//       text: 'Faculty Activity End Date must be greater than or equal to Start Date.',
//       icon: 'warning'
//     });

//     this.FacultyActivityEndDate = '';
//   }
// }

// ActivityFileData: any[] = [];
// ActivityFileName: any[] = [];
// ActivityFileStatus: boolean[] = [];

// uploadedDocuments: string[] = [];
// allDocumentsUploaded: boolean = false;
// uploadedFileNames: { [key: string]: string } = {};

//   // added Logic on 23-6-26



//   requiredDocumentFiles: File[] = [];


 

//   onFileSelectedActivityFile(event: any, index: number): void {

//   const target = event.target as HTMLInputElement;
//   const file: File | null = target.files?.[0] || null;

//   if (!file) {
//     this.ActivityFileName[index] = '';
//     this.ActivityFileData[index] = '';
//     this.ActivityFileStatus[index] = false;
//     return;
//   }

//   if (file.size > 3148576) {
//     swal.fire({
//       title: 'File size exceeds 3MB. Please upload a smaller file.',
//       text: 'Invalid File size',
//       icon: 'warning'
//     });

//     target.value = '';
//     return;
//   }

//   let modifiedFile = file;
//   let validFileName = file.name;

//   const fileNameRegex = /^[a-zA-Z0-9._-]+$/;

//   if (!fileNameRegex.test(file.name)) {

//     validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//     modifiedFile = new File(
//       [file],
//       validFileName,
//       { type: file.type }
//     );

//     const dataTransfer = new DataTransfer();
//     dataTransfer.items.add(modifiedFile);
//     target.files = dataTransfer.files;
//   }

//   const reader = new FileReader();

//   reader.onload = () => {

//     const result = reader.result as string;

//     if (result) {

//       const base64Data = result.split(',')[1];

//       this.ActivityFileData[index] = base64Data;
//       this.ActivityFileName[index] = validFileName;
//       this.ActivityFileStatus[index] = true;
//     }
//   };

//   reader.readAsDataURL(modifiedFile);
// }

// uploadRequiredDocument(documentName: string, index: number) {

//   if (
//     !this.ActivityFileData[index] ||
//     !this.ActivityFileName[index]
//   ) {
//     swal.fire({
//       title: 'Please select a file first.',
//       icon: 'warning'
//     });
//     return;
//   }

//   const formData = new FormData();

//   formData.append('DocumentName', documentName);
//   formData.append('MouId', this.mouId);
//   formData.append('Uid', this.EmployeeCode);
//   formData.append('FilePath', this.ActivityFileName[index]);
//   formData.append('FileData', this.ActivityFileData[index]);
//   formData.append('Action', 'Insert');

//   this.mouDocumentsService
//     .MouActionTakenDocumentsOperations(formData)
//     .subscribe({
//       next: (response: any) => {

//         if (!this.uploadedDocuments.includes(documentName)) {
//           this.uploadedDocuments.push(documentName);
//         }

//         this.uploadedFileNames[documentName] =
//           this.ActivityFileName[index];

//         this.allDocumentsUploaded =
//           this.uploadedDocuments.length ===
//           this.selectedDocuments.length;

//         swal.fire({
//           title: 'Success',
//           text: documentName + ' uploaded successfully',
//           icon: 'success'
//         });

//       },
//       error: (error: any) => {

//         console.error(error);

//         swal.fire({
//           title: 'Upload Failed',
//           text: 'Unable to upload document.',
//           icon: 'error'
//         });
//       }
//     });
// }
// // uploadRequiredDocument(documentName: string, index: number) {

// //   if (!this.ActivityFileStatus ||
// //       !this.ActivityFileData ||
// //       !this.ActivityFileName) {

// //     swal.fire({
// //       title: 'Please select a file first.',
// //       icon: 'warning'
// //     });

// //     return;
// //   }

// //   const formData = new FormData();

// //   formData.append('DocumentName', documentName);
// //   formData.append('MouId', this.mouId);
// //   formData.append('Uid', this.EmployeeCode);
// //   formData.append('FilePath', this.ActivityFileName);
// //   formData.append('FileData', this.ActivityFileData);
// //   formData.append('Action', 'Insert');

// //   console.log('DocumentName:', documentName);
// //   console.log('FilePath:', this.ActivityFileName);
// //   console.log('FileData Length:', this.ActivityFileData?.length);

// //   this.mouDocumentsService
// //     .MouActionTakenDocumentsOperations(formData)
// //     .subscribe({
// //       next: (response: any) => {

// //         swal.fire({
// //           title: 'Success',
// //           text: documentName + ' uploaded successfully',
// //           icon: 'success'
// //         });

// //       },
// //       error: (error: any) => {

// //         console.error(error);

// //         swal.fire({
// //           title: 'Upload Failed',
// //           text: 'Unable to upload document.',
// //           icon: 'error'
// //         });

// //       }
// //     });
// // }
 
//   // added on 17-06-26



//   selectedDocuments: string[] = [];

//   activityDocuments: { [key: string]: string[] } = {

//     'Research publication': [
//       'Research-Paper',
//       'Conference-Certificate',
//       'Conference-Brochure'
//     ],

//     'Project ': [
//       'Project-Report',
//       'List-of-Students'
//     ],

//     'Academic exchange': [
//       'Appointment-Letter',
//       'Activity-Report',
//       'Photographs'
//     ],

//     'Student exchange ': [
//       'Letter-of-Acceptance',
//       'Course-Completion-Certificate',
//       'Student-Registration-Numbers'
//     ],

//     'Guest lecture ': [
//       'Event-Report',
//       'Participant-List',
//       'Photographs'
//     ],

//     'Workshop ': [
//       'Workshop-Report',
//       'Attendance-Sheet',
//       'Photographs'
//     ],

//     'Internship ': [
//       'Internship-Certificate',
//       'Student-Registration Number'
//     ],

//     'On job Training (OJT) ': [
//       'Offer-Letter',
//       'Joining-Letter',
//       'Student-Registration-Number'
//     ],

//     'Co-Supervision ': [
//       'Research-Paper',
//       'NOC',
//       'Undertaking'
//     ],

//     'Related to SDG ': [
//       'Activity-Report',
//       'Supporting-Documents'
//     ],

//     'Conference': [
//       'Conference-Certificate',
//       'Conference-Brochure',
//       'Photographs'
//     ],

//     'Others': [
//       'Supporting-Documents'
//     ]
//   };

//   onActivityChange(activityTitle: string): void {

//     this.selectedDocuments =
//       this.activityDocuments[activityTitle] || [];

//   }




//   // ended logic for 17-06-26


//   // added on 25-5-26 
//   Tab1statusFilter: string = 'all';

//   // master copy of API data - never mutate this
//   MouActionTakenDocumentsMaster: any[] = [];

//   // receive the new selected value (string) from ngModelChange
//   onStatusChangeTab1(value: string): void {
//     this.Tab1statusFilter = value;
//     this.applyFiltersTab1();
//   }

//   applyFiltersTab1(): void {
//     // Work from the master copy
//     let filtered = (this.MouActionTakenDocumentsMaster || []).slice();

//     // Filter by status
//     if (this.Tab1statusFilter && this.Tab1statusFilter !== 'all') {
//       const status = this.Tab1statusFilter.toLowerCase();
//       filtered = filtered.filter(item => {
//         const mouStatus = (item.mouStatus || '').toString().toLowerCase();
//         if (status === 'active') return mouStatus === 'active';
//         if (status === 'expired') return mouStatus === 'expired';
//         if (status === 'renewed') return mouStatus === 'renewed';
//         return true;
//       });
//     }

//      if (this.selectedSchoolDivision && this.selectedSchoolDivision !== '0') {
//       filtered = filtered.filter(item => {
//         if (!item.schoolDivisionInvolved) return false;
//         return item.schoolDivisionInvolved
//           .split(',')
//           .map((id: string) => id.trim())
//           .includes(this.selectedSchoolDivision.toString());
//       });
//     }


//     filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryActionTaken));

//     // Then apply search filter if exists
//     const query = (this.searchQuery || '').toString().trim().toLowerCase();
//     if (query) {
//       filtered = filtered.filter((item: any) => {
//         return Object.entries(item).some(([key, val]) => {
//           if (val !== null && val !== undefined) {
//             const valueString = String(val).toLowerCase();

//             // Special handling for mouId / id
//             if (key === 'mouId' || key === 'id') {
//               const numericId = Number(val);
//               if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
//                 return true;
//               }
//             }

//             // General search for all other fields
//             return valueString.includes(query);
//           }
//           return false;
//         });
//       });
//     }

//     // update only the filtered view - keep master intact
//     this.filteredMouActionTakenDocuments = filtered;

//     setTimeout(() => {
//       this.initializeTopScrollbar(
//         this.topScrollbar2.nativeElement,
//         this.topScrollbarContent2.nativeElement,
//         '.tab2-grid .datatable-body'
//       );
//     });
//   }


//   getActiveCount(): number {
//     return (this.filteredMouActionTakenDocuments || []).filter(item => {
//       return (item.mouStatus || '').toString().toLowerCase() === 'active';
//     }).length;
//   }

//   getExpiredCount(): number {
//     return (this.filteredMouActionTakenDocuments || []).filter(item => {
//       return (item.mouStatus || '').toString().toLowerCase() === 'expired';
//     }).length;
//   }
//   getRenewedCount(): number {
//     return (this.filteredMouActionTakenDocuments || []).filter(item => {
//       return (item.mouStatus || '').toString().toLowerCase() === 'renewed';
//     }).length;
//   }



//   @ViewChild('stageModal') stageModal: TemplateRef<any>;
//   @ViewChild('divstagesHistory') divstagesHistory: TemplateRef<any>;
//   @ViewChild('divstagesHistoryFiles') divstagesHistoryFiles: TemplateRef<any>;

//   @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
//   @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
//   @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
//   @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
//   @ViewChild('viewActivityActionTakenModal') viewActivityActionTakenModal: TemplateRef<any>;
//   @ViewChild('viewAllActionTakenUploadedDocumentModal') viewAllActionTakenUploadedDocumentModal: TemplateRef<any>;
//   searchQuery: any;
//   filteredMouActivityDocuments: any[] = [];
//   DocumentName: string = '';
//   Remarks: any;
//   ExpectedstartDate: any;
//   ExpectedEndDate: any;
//   DepartmentName: any;
//   UploadedFileUrl: any = '';
//   PresentDate: any = '';
//   CurrentApprovalStatus: any;
//   CurrentdisapprovalReason: any;
//   ActivityDetails: any;

//   // Redirect to Other interface for 

//   clearFields(): void {
//     this.mouId = this.CompletedDate = this.ResponsiblePerson = '';
//     if (this.selectedActivityId == 11 || this.selectedActivityId == 12 || this.selectedActivityId == 23 || this.selectedActivityId == 14) // Added on 29 Nov-25 for  the Guest lecture from IQAC Redirect
//     // if(this.selectedActivityId == 11 || this.selectedActivityId==12  || this.selectedActivityId==23 ) // || this.selectedActivityId==14 removed the Guest lecture from IQAC Redirect
//     {
//       swal.fire({
//         title: 'Since this Activity is also involved IQAC Interface thus Redirecting to the IQAC interface ',
//         text: 'You are Kindly requested to fill the details in IQAC.',
//         icon: 'success'
//       }).then(() => {
//         window.location.href = 'https://ums.lpu.in/lpuums/frmIQACdetails.aspx';
//       });
//     }

//   }
//   // transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;


//   employeeControl = new FormControl();
//   employees: Employee[] = [];
//   filteredEmployees: Employee[] = [];
//   showSuggestions = false;
//   activeSuggestionIndex = -1;

//   dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
//   @ViewChild('fileInput') fileInput!: ElementRef;
//   isLogin: boolean = false;
//   loadingIndicator = false; showNoDataFoundMessage: boolean = false;
//   userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];


//   errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
//   fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
//   filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";



//   TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
//   selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; CompletedDate: any; endDate: any; EmployeeDetails: any;
//   EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: number = 0;
//   ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];

//   MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];

//   FacultyActivityStartDate: string = '';
//   FacultyActivityEndDate: string = '';

//   takeActionForm!: FormGroup;

//   documentName: string = '';
//   expectedStartDate: string = '';
//   expectedEndDate: string = '';
//   uploadedFileUrl: string = '';
//   currentDisapprovalReason: string = '';

//   constructor(private Agreement: AgreementEntryService, private cd: ChangeDetectorRef,
//     private lpuPlannerServiceService: LpuPlannerServiceService,
//     private ObpService: ObpAutoAssignService,
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
//     const currentDate = new Date();
//     this.CompletedDate = this.endDate = this.CompletedDate = this.endDate = this.formatDate(currentDate);
//     // this.FacultyActivityEndDate  = this.FacultyActivityStartDate = this.formatDate(currentDate);
//     this.ServerUrl = 'http://files.lpu/umsweb/webftp/MOUDocuments/';
//     let loginName = this.route.snapshot.params['loginName'];

//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//       (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU </span>Activity Take <span class="themeClr">Action </span>';
//       (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     }

//     this.takeActionForm = this.fb.group({
//       mouActivity: ['', Validators.required],
//       remarks: ['', Validators.required],
//       completedDate: ['', Validators.required],
//       file: [null, Validators.required],
//       sessionId: ['', Validators.required],
//       Activity: ['', Validators.required],
//       FacultyActivityStartDate: new FormControl('', Validators.required),
//       FacultyActivityEndDate: new FormControl('', Validators.required),
//       ParticipantsCount: new FormControl('', Validators.required),
//       ActivitiesSubmitted: new FormControl('', Validators.required),
//     });
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

//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         this.getAllPlannerSession();
//         this.GetEmployeeDetails();
//         this.GetAllCategories();
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
//     const element = document.getElementById('ActivityTakeActionPage');
//     if (element) {
//       element.hidden = true;
//     }
//   }

//   GetEmployeeDetails(): void {
//     this.mouDocumentsService.GetEmployeeDetails().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EmployeeDetails = response.item1;
//           this.EmployeeName = response.item1[0].employeeName;
//           this.EmployeeCode = '11840';// response.item1[0].employeeCode; //11840
//           this.Department = response.item1[0].department;
//           this.DepartmentName = response.item1[0].departmentName;
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = false;
//           this.isLoginFailed = false;
//           this.GetAllMouDocumentsForActions();
//           this.getDropdownData();
//           this.getAllMouActivities();
//           this.GetAllActivities();
//           this.GetAllMouActionsTaken();

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


//   // master copy for Take Action tab
//   MouActivityDocumentsMaster: any[] = [];
//   Tab1StatusFilterTakeAction: string = 'all';
//   AllMouCategories: MouCategory[] = [];
//   SelectedMouCategoryTakeAction: any = 'All';
//   SelectedMouCategoryActionTaken: any = 'All';

//   GetAllCategories(): void {
//     this.mouDocumentsService.GetMouCategories().subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           this.AllMouCategories = response.item1.map((x: any, index: number) => ({
//             id: index + 1,
//             CategoryName: x.items
//           }));
//         } else {
//           this.AllMouCategories = [];
//         }
//       },
//       error: err => { this.LoginFailed(err); }
//     });
//   }

//   private matchMouCategory(item: any, selected: any): boolean {
//     if (!selected || selected === 'All') {
//       return true;
//     }
//     const categoryName = selected.CategoryName;
//     return String(item.mouCategory ?? '').toLowerCase() === categoryName.toLowerCase();
//   }

//   onSchoolDivisionChange1(event: any): void {
//       this.applyFiltersTakeAction();

//   }
//   onCategoryChangeTakeAction(): void {
//     this.applyFiltersTakeAction();
//   }

//   onCategoryChangeActionTaken(): void {
//     this.applyFiltersTab1();
//   }

//   onStatusChangeTakeAction(value: string): void {
//     this.Tab1StatusFilterTakeAction = value;
//     this.applyFiltersTakeAction();
//   }

//   applyFiltersTakeAction(): void {
//     let filtered = (this.MouActivityDocumentsMaster || []).slice();

//     if (this.Tab1StatusFilterTakeAction && this.Tab1StatusFilterTakeAction !== 'all') {
//       const status = this.Tab1StatusFilterTakeAction.toString().toLowerCase();
//       filtered = filtered.filter(item => {
//         const mouStatus = (item.mouStatus || '').toString().toLowerCase();
//         if (status === 'active') return mouStatus === 'active';
//         if (status === 'expired') return mouStatus === 'expired';
//         if (status === 'renewed') return mouStatus === 'renewed';
//         return true;
//       });
//     }

   
//     if (this.selectedSchoolDivision && this.selectedSchoolDivision !== '0') {
//       filtered = filtered.filter(item => {
//         if (!item.schoolDivisionInvolved) return false;
//         return item.schoolDivisionInvolved
//           .split(',')
//           .map((id: string) => id.trim())
//           .includes(this.selectedSchoolDivision.toString());
//       });
//     }
//  filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryTakeAction));
//     // If there's a searchQuery applied globally to this tab, keep parity with other filters
//     const query = (this.searchQuery || '').toString().trim().toLowerCase();
//     if (query) {
//       filtered = filtered.filter((item: any) => {
//         return Object.entries(item).some(([_, val]) => {
//           if (val !== null && val !== undefined) {
//             return String(val).toLowerCase().includes(query);
//           }
//           return false;
//         });
//       });
//     }

//     this.filteredMouActivityDocuments = filtered;


//     setTimeout(() => {
//       const body = document.querySelector(
//         '.ngx-datatable .datatable-body'
//       ) as HTMLElement;
//       if (body) {
//         this.topScrollbarContent.nativeElement.style.width =
//           body.scrollWidth + 'px';
//       }
//     }, 100);
//   }

//   getActiveCountTakeAction(): number {
//     return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'active').length;
//   }
//   getExpiredCountTakeAction(): number {
//     return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'expired').length;
//   }
//   getRenewedCountTakeAction(): number {
//     return (this.filteredMouActivityDocuments || []).filter(item => (item.mouStatus || '').toString().toLowerCase() === 'renewed').length;
//   }



//   GetAllMouDocumentsForActions(): void {
//     this.mouDocumentsService.MouDocumentstoTakeAction(this.EmployeeCode).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           // keep master copy and apply filters
//           this.MouActivityDocumentsMaster = response.item1;
//           this.MouActivityDocuments = response.item1;
//           this.applyFiltersTakeAction();

//           this.dataSource.data = this.MouActivityDocuments;
//           this.loadingIndicator = false;
//           this.columns = []; this.headHtmlData = [];
//           this.headHtmlData = this.MouActivityDocuments[0];
//           // this.columns = Object.keys(this.MouActivityDocuments[0]);
//           // this.columns = this.columns.filter((item: any) => item !== 'mouPartnerName' &&  item !== 'uploadActivityDate' &&  item !== 'newMouId' &&  item !== 'newMouId' && item !== 'filePath' && item != 'mouPartnerName' && item != 'actionApprovalStatus' && item !== 'sessionAcademicYear' && item !== 'mouApprovedByFacultyName' && item !== 'assignedToFacultyName' && item !== 'schoolDivisionInvolved' && item !== 'sessionId' && item !== 'documentUploaded' && item !== 'activityTitle' && item !== 'participantsCount' && item !== 'activityCount' && item !== 'uploadActivityDate' && item !== 'activityStartDate' && item !== 'activityEndDate' && item !== 'authorityRemarks' && item !== 'activityAlloted' && item !== 'mouTitle' && item !== 'mouStartDate' && item !== 'mouStatus' && item !== 'mouEndDate' && item !== 'startDate' && item !== 'endDate' && item !== 'actionAssignedBy' && item !== 'activityDetails' && item !== 'approvalStatus' && item !== 'approvalDate' && item !== 'userRemarks' && item !== 'disapprovalReason' && item !== 'uploadedActionFile' && item !== 'uploadedProofTitle' && item !== 'uid' && item !== 'mouId' && item !== 'id');
//           this.columns.push()
//           this.loadingIndicator = false;


          
//         } else {
//           this.dataSource.data = this.MouActivityDocuments = this.filteredMouActivityDocuments = this.MouActivityDocumentsMaster = [];
//           this.showNoDataFoundMessage = true;
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }
//   onSelectFile(a: any) {
//     let aa = a;
//     // window.open(this.ServerUrl+aa.fileName, '_blank');
//     window.open(aa.filePath, '_blank');
//   }

//   onSelectFileX(a: any) {
//     let aa = a;
//     window.open(aa.filePath, '_blank');
//   }
//   // added on 5-Feb-26

//   onDownloadFile(remoteUrl: string): void {
//     swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

//     this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
//       next: (blob: Blob) => {
//         const downloadUrl = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = downloadUrl;

//         const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
//         link.download = fileName;

//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(downloadUrl);

//         swal.close();
//       },
//       error: async (err) => {
//         swal.close();
//         if (err.error instanceof Blob) {
//           const errorMsg = JSON.parse(await err.error.text());
//           swal.fire('Error', errorMsg.message || 'Download failed', 'error');
//         } else {
//           swal.fire('Error', 'Could not connect to the server', 'error');
//         }
//       }
//     });
//   }

//   // 29-jan-25 Changes start
//   // formdata!: FormGroup;
//   allSchoolDivisions: SchoolDivision[] = [];
//   Activities: any;
//   Activity: any = '';
//   selectedActivityType: string = '';

//   sessionId: any = ''; // Default empty value
//   items: any[] = []; // Array to store dropdown options
//   SessionId: any = 'Select';
//   ParticipantsCount: any = '';
//   ActivitiesSubmitted: any = '';



//   formdata = new FormGroup({
//     mouActivity: new FormControl('', Validators.required),
//     remarks: new FormControl('', Validators.required),
//     CompletedDate: new FormControl('', Validators.required),
//     File: new FormControl('', Validators.required),
//     sessionId: new FormControl('Select', Validators.required),
//     ParticipantsCount: new FormControl('', Validators.required),
//     ActivitiesSubmitted: new FormControl('', Validators.required),
//     FacultyActivityStartDate: new FormControl('', Validators.required),
//     FacultyActivityEndDate: new FormControl('', Validators.required),
//   })

//   getDropdownData(): void {
//     this.ObpService.GetAllOBPPlannerSessions().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.items = response.item1;
//           // console.log(JSON.stringify(this.items))
//         }
//       }
//     })
//   }

//   getAllMouActivities(): void {
//     this.mouDocumentsService.GetAllMouActivities().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.Activities = response.item1;
//           // console.log(JSON.stringify(this.Activities))
//         }
//       }
//     })
//   }

//   get formControls() {
//     return this.formdata.controls;
//   }

//   // Debugging: Check selected value
//   onSessionChange(event: any) {
//     // console.log('Selected Session ID:', event.target.value);
//   }

//   // End 29-jan-25 changes
//   MouStatus: any; // 28-jan-25
//   onSelect(a: any) {

//     this.selectedActivityId = 0;
//     this.selectedDocuments = [];

//     let aa = a;
//     // alert(JSON.stringify(aa))
//     this.mouId = aa['mouId']
//     this.ActivityDetails = aa['activityDetails'];
//     if (this.ActivityDetails?.length > 0) {
//       const [id, description] = this.ActivityDetails.split('-', 2);

//       // Assign the values to the class properties
//       this.selectedActivityId = parseInt(id, 10);
//       this.DocumentName = description;
//     }
//     this.ExpectedstartDate = a['startDate'];
//     this.ExpectedEndDate = a['endDate'];
//     this.UploadedFileUrl = a['filePath'];
//     this.CurrentApprovalStatus = a['approvalStatus'];
//     this.CurrentdisapprovalReason = a['disapprovalReason'];
//     this.MouStatus = aa['mouStatus'] == null ? 'NA' : aa['mouStatus'];
//     // alert(this.MouStatus)
//     // <ng-container *ngIf="row.approvalStatus != null && row.disapprovalReason?.length > 0;" >
//     this.PresentDate = this.datePipe.transform(new Date(), 'dd-MMM-yyyy');
//     // alert(this.formatDates(this.PresentDate) +">" + this.formatDates(this.ExpectedEndDate))
//     // if(this.formatDates(this.PresentDate) > this.formatDates(this.ExpectedEndDate))
//     // {
//     //   // alert('Not Applicable')
//     //   swal.fire({
//     //     title: 'Since Expected End Date is Lapsed So Action is not Allowed , Contact Your HOS',
//     //     icon: 'error'
//     //   })
//     // }
//     // else
//     // {
//     this.cd.detectChanges();
//     this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
//       // console.log("Modal closed" + result);
//       window.location.reload();
//     }).catch((res) => { });
//     //  }
//   }
//   testClick(a: any): void {
//     const fileUrl = `assets/MouTemplateDocuments/${this.selectedActivityId}.zip`;
//     const link = document.createElement('a');
//     const selectedActivity = this.mouActivities.find(activity => activity.id === +a);
//     if (selectedActivity) {
//       // alert('Selected Activity Description:'+ selectedActivity?.description);
//       this.DocumentName = selectedActivity?.description
//     }
//     link.href = fileUrl;
//     link.download = `${this.selectedActivityId}.zip`;
//     link.click();
//   }
//   onActivitySelected(event: any): void {
//     this.selectedActivityId = event.target.value;
//     const selectedActivity = this.mouActivities.find(activity => activity.id === +this.selectedActivityId);;
//     if (selectedActivity) {
//       // console.log('Selected Activity Description:', selectedActivity?.description);
//       //      alert('Selected Activity Description:'+ selectedActivity?.description);
//       this.DocumentName = selectedActivity?.description
//     }
//   }
//   checkFormValidity(): void {
//     this.uploadEnabled = this.mouId !== '' && this.Remarks?.length < 4
//       && this.DocumentName != ''
//       && this.CompletedDate !== ''
//       && this.fileData != null
//       && this.FacultyActivityStartDate != ''
//       && this.FacultyActivityEndDate != ''
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

//   search() {
//     this.applyFiltersTakeAction();
//   }
//   searchData() {
//     // search should update the filtered view respecting current status filter and session
//     // searchQuery already bound; simply re-run applyFiltersTab1
//     this.applyFiltersTab1();
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


//   getDivisionNamesByIdss(ids: number[]): string {
//     return ids.map(id => this.getDivisionNameById(id)).join(', ');
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
//   exportToExcel(): void {
//     const fileName = 'Mou_Document_report.xlsx';
//     const exportedData = this.MouActivityDocuments.map(item => ({
//       NewMOUId: item.newMouId,
//       OldMOUId: "MOU/" + item.id,
//       'Name of MOU Organisation': item.mouTitle == null ? '-' : item.mouTitle,
//       'Assigned To Faculty Name': item.assignedToFacultyName == null ? '-' : item.assignedToFacultyName,
//       'Assigned To Faculty Uid': item.uid == null ? '-' : item.uid,
//       'Name of School/Division Involved': this.getDivisionNamesByIdss(item.schoolDivisionInvolved.split(',').map(Number)),
//       'Details of Activity': item.activityDetails == null ? '-' : item.activityDetails,
//       'Start Date of Mou Activity Assigned by HOS': item.startDate == null ? '-' : item.startDate,
//       'End Date of Mou Activity Assigned by HOS': item.endDate == null ? '-' : item.endDate,
//       'Details of Proof Submitted by Faculty': item.documentUploaded == null ? '-' : item.documentUploaded,
//       'Session Academic Year': item.sessionAcademicYear == null ? '-' : item.sessionAcademicYear,
//       'Activity Category': item.activityTitle == null ? '-' : item.activityTitle,
//       'Participants Count': item.participantsCount == null ? '-' : item.participantsCount,
//       'Number of Activities Submitted': item.activityCount == null ? '-' : item.activityCount,
//       'Upload Activity Date': item.uploadActivityDate == null ? '-' : item.uploadActivityDate,
//       'Mou Approval Status': item.mouStatus == null ? '-' : item.mouStatus,
//       'Mou Disapproval Reason': item.disapprovalReason == null ? '-' : item.disapprovalReason,
//       'Mou Approved By FacultyName': item.mouApprovedByFacultyName == null ? '-' : item.mouApprovedByFacultyName,
//       'Mou Approval Date': item.approvalDate == null ? '-' : item.approvalDate,
//       'Authority Remarks': item.authorityRemarks == null ? '-' : item.authorityRemarks,
//       'DocumentUrl': item.filePath
//     }));

//     // Add headers
//     const header = [
//       'New MOU Id',
//       'Old MOU Id',
//       'Name of MOU Organisation',
//       'Assigned To Faculty Name',
//       'Assigned To Faculty Uid',
//       'School Division Involved',
//       'Details of Activity',
//       'Start Date of Mou Activity Assigned by HOS',
//       'End Date of Mou Activity Assigned by HOS',
//       'Details of Proof Submitted by Faculty',
//       'Session AcademicYear ',
//       'Activity Category',
//       'Participants Count',
//       'Number of Activities Submitted',
//       'Upload Activity Date',
//       'Mou Approval Status',
//       'Mou Disapproval Reason', 'Mou Approved By FacultyName',
//       'Mou Approval Date',
//       'Authority Remarks',
//       'DocumentUrl'
//     ];

//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];

//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

//     for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
//       const cellAddress = XLSX.utils.encode_cell({ r: i, c: 19 }); // Column 7 is DocumentUrl
//       const cell = ws[cellAddress];
//       if (cell && cell.v) {
//         cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
//       }
//     }

//     const wscols = [
//       { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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

//   resetForm() {
//     this.selectedActivityId = 0;
//     this.FacultyActivityStartDate = '';
//     this.FacultyActivityEndDate = '';
//     this.Remarks = '';
//     this.sessionId = '';
//     this.Activity = '';
//     this.selectedActivityType = '';
//     this.fileName = '';
//     this.FileData = null;
//   }

//   UploadActivity(form: NgForm) {

//   if (form.invalid) {

//     swal.fire({
//       title: 'Validation',
//       text: 'Please complete all mandatory fields.',
//       icon: 'warning'
//     });

//     return;
//   }
 
//     const formData = new FormData();
//     formData.append('MouId', this.mouId);
//     formData.append('Uid', this.EmployeeCode);
//     formData.append('CompletedDate', this.CompletedDate);
//     formData.append('FilePath', this.fileName);
//     formData.append('File', this.FileData);
//     formData.append('DocumentName', this.DocumentName ? this.DocumentName : this.Activity);
//     formData.append('Remarks', this.Remarks);
//     formData.append('MouStatus', this.MouStatus);
//     formData.append('SessionId', this.sessionId);
//     formData.append('ActivityTitle', this.Activity);
//     formData.append('ActivityCategory', this.selectedActivityType);
//     formData.append('ParticipantsCount', this.ParticipantsCount);
//     formData.append('ActivityCount', this.ActivitiesSubmitted);
//     formData.append('FacultyActivityStartDate', this.FacultyActivityStartDate);
//     formData.append('FacultyActivityEndDate', this.FacultyActivityEndDate);
//     // formData.forEach((value, key) => {
//     //   console.log(`${key}: ${value}`);
//     // });
//     this.mouDocumentsService.InsertMouActivityActionTaken(formData).subscribe({
//       next: (data: any) => {
//         const result = data.item1[0]['msg'];
//         if (result === 'success') {
//           swal.fire({
//             title: 'Action Planned Stored Successfully!',
//             // text: '',
//             icon: 'success'
//           }).then(() => {
//             window.location.reload();
//           });
//         } else if (result === '-1') {
//           swal.fire({
//             title: 'Error in File Upload Try again Later',
//             icon: 'error'
//           }).then(() => {
//             window.location.reload();
//           });
//         } else {
//           swal.fire({
//             title: 'Something Went Wrong, Try again later',
//             icon: 'error'
//           }).then(() => {
//             window.location.reload();
//           });
//         }
//       },
//       error: (error: any) => {
//         swal.fire({
//           title: 'Error',
//           text: 'Failed to Upload.',
//           icon: 'error'
//         }).then(() => {
//           window.location.reload();
//         });
//       },
//       complete: () => {
//         this.clearFields();
//       }
//     });
//   }

//   onFileSelected(event: any): void {
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;

//     if (file) {
//       if (file.size > 5001576) {
//         swal.fire({
//           title: 'File size exceeds 5MB. Please upload a smaller file.',
//           text: 'Invalid File size',
//           icon: 'warning'
//         });
//         target.value = '';
//         this.fileData = null;
//         this.fileStatus = false;
//         this.checkFormValidity();
//         return;
//       }

//       const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//       if (!fileNameRegex.test(file.name)) {
//         const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
//         const modifiedFile = new File([file], validFileName, { type: file.type });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(modifiedFile);
//         target.files = dataTransfer.files;
//         this.fileData = modifiedFile;
//         this.fileName = validFileName;
//       } else {
//         this.fileData = file;
//         this.fileName = file.name;
//       }

//       reader.readAsDataURL(this.fileData);
//       reader.onload = () => {
//         const result = reader.result as string;
//         const resultArray = result.split(',');
//         this.FileData = resultArray[1];
//         this.fileStatus = true;
//         this.checkFormValidity();
//       };
//     } else {
//       this.fileData = null;
//       this.fileStatus = false;
//       this.checkFormValidity();
//     }
//   }


//   MyActionTkenData(): void {
//     this.GetAllMouActionsTaken();
//     // this.modalService.open(this.viewActivityActionTakenModal, { size: 'lg' }).result.then((result) => {
//     //   window.location.reload();
//     // }).catch((res) => { });
//   }


//   GetAllMouActionsTaken(): void {
//     this.loadingIndicator = true;
//     this.showNoDataFoundMessage = false;
//     this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode, this.selectedPlannerSession).subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           // keep a master copy and then apply current filters to populate filtered view
//           this.MouActionTakenDocumentsMaster = response.item1;
//           this.MouActionTakenDocuments = response.item1; // optional legacy reference
//           this.applyFiltersTab1();

//           this.dataSource.data = this.MouActionTakenDocuments;
//           this.columns = []; this.headHtmlData = [];
//           this.headHtmlData = this.MouActionTakenDocuments[0];
//           // this.columns = Object.keys(this.MouActionTakenDocuments[0]);
//           // this.columns = this.columns.filter((item: any) => item !== 'approvalStatus' && item !== 'newMouId' && item !== 'assignedToFacultyName' && item !== 'documentUploaded' && item !== 'mouPartner' && item !== 'completedDate' && item !== 'assignedToFacultyUID' && item !== 'startDate' && item !== 'endDate' && item !== 'documentUploadedFile' && item !== 'documentUploadedFile' && item !== 'mouStatus' && item !== 'id' && item !== 'sessionId' && item != 'mouApprovedByFacultyUID' && item != 'sessionAcademicYear' && item != 'activityDetails' && item != 'activityStartDate' && item != 'activityEndDate' && item !== 'assignedToFacultyUID' && item !== 'schoolDivisionInvolved' && item !== 'filePath' && item !== 'fileName' && item !== 'mouId' && item !== 'documentName' && item !== 'isApproved' && item !== 'approvedBy' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'uid' && item !== 'id' && item !== 'file' && item !== 'createdBy' && item !== 'updatedOn' && item !== 'updatedBy' && item !== 'ipAddress');
//           this.columns.push()

//           this.showNoDataFoundMessage = false;

//         } else {
//           this.dataSource.data = this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = this.MouActionTakenDocumentsMaster = [];
//           this.showNoDataFoundMessage = true;
//         }
//         // Delay hiding the loader for 2.5 seconds
//         setTimeout(() => {
//           this.loadingIndicator = false;
//         }, 2500);
//       },
//       error: err => {
//         this.dataSource.data = this.filteredMouActionTakenDocuments = this.MouActionTakenDocuments = this.MouActionTakenDocumentsMaster = [];
//         this.showNoDataFoundMessage = true;
//         setTimeout(() => {
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = true;
//         }, 2500);

//         this.LoginFailed(err);
//       }
//     });
//   }

//   onFileXSelected(event: any, id: number): void {
//     this.fileChosen[id] = event.target.files.length > 0;
//     const reader = new FileReader();
//     const target = event.target as HTMLInputElement;
//     const file: File | null = (target.files as FileList)[0] || null;

//     if (file && file.size > 3148576) {
//       swal.fire({
//         title: 'File size exceeds 3 MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

//     const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     if (file && !fileNameRegex.test(file.name)) {
//       const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//       const modifiedFile = new File([file], validFileName, { type: file.type });
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(modifiedFile);
//       target.files = dataTransfer.files;

//       this.fileData = modifiedFile;
//       this.fileStatus = true;

//       reader.readAsDataURL(modifiedFile);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.FileData = ssssArray[1];
//         this.fileName = validFileName;
//       };
//       return;
//     }

//     this.fileData = file;
//     this.fileStatus = true;

//     if (file) {
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const ssss = reader.result as string;
//         const ssssArray = ssss.split(',');
//         this.FileData = ssssArray[1];
//         this.fileName = file.name;
//       };
//     }
//   }

//   UpdateFileDocument(Id: any) {
//     if (this.fileChosen[Id]) {
//       const formData = new FormData();
//       formData.append('Id', Id);
//       formData.append('FilePath', this.fileName);
//       formData.append('File', this.FileData);
//     }
//   }


//   // aaded on 30-may-25

//   allPlannerSessions: any[] = [];
//   selectedPlannerSession: any = '0';  // default selected value
//   allOBPStaffData: any[] = [];

//   getAllPlannerSession(): void {
//     this.mouDocumentsService.GetAllOBPPlannerSessions().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.allPlannerSessions = response.item1;
//         }
//       }
//     });
//   }
//   setSessionId(event: any) {
//     const selectedId = event.target.value;
//     this.selectedPlannerSession = selectedId;

//     this.GetAllMouActionsTaken();
//   }
//   // end new add 30-May-25 
//   isLoading: boolean = false;

// }
