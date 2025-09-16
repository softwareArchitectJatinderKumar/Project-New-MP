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
  templateUrl: './MouReportDateWise.component-old-logic.html',
  styleUrls: ['./MouReportDateWise.component.scss'],
  providers: [DatePipe]
})
export class MouReportDateWiseComponent implements OnInit {


  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModal') viewActivityActionTakenModal: TemplateRef<any>;
  searchQuery: any;

  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any = 0; MouDataColumns: any; toDate: any = 0;
  dataSource: any[] = []; data: any; MouData: any; // DEveloper Name Jatinder31309
  dataShowing: any = false;
  //dataSource = new MatTableDataSource<any>;
  dataSources: MatTableDataSource<any> = new MatTableDataSource<any>();
  allSchoolDivisions: any;
  AssignedToUid: string[];
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
        // this.showData();
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

  Reset() {
    window.location.reload();

  }
  
  exportExcel() {
    const fileName = 'Mou_Admin_report.xlsx';
  
    const exportedData = this.MouDocumentsLists.map(item => ({
      MOUId: "MOU/" + item.mouid,
      CreatedBy: item.mouCreatedBy,
      MouTitle: item.partnerName,
      // MouDocumentFile: item.mouDocument, // Should be a valid URL
      MouStartDate: item.mouStartDate,
      MouEndDate: item.mouEndDate,
      Status: item.mouStatus,
      SchoolInvolved: item.responsibleSchool,
      ActivityStartDate: item.activityStartDate,
      ActivityEndDate: item.activityEndDate,
      AssignedBy: item.mOUActivityAssignedBy,
      EndDate: item.endDate,
      AuthorityRemarks: item.authorityRemarks,
      // mouActionTakenDocument: item.mouActionTakenDocument // Should be a valid URL
    }));
  
    // Headers
    const header = [
      'MOUId', 'CreatedBy', 'MouTitle', 
      // 'MouDocument',
       'MouStartDate',
      'MouEndDate', 'Status', 'SchoolInvolved', 'ActivityStartDate',
      'ActivityEndDate', 'AssignedBy', 'EndDate', 'AuthorityRemarks',
      // 'mouActionTakenDocument'
    ];
  
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
  
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
  
    // Apply Hyperlinks
    exportedData.forEach((item, index) => {
      const row = index + 1; // Offset for headers
  
      const mouDocCellRef = XLSX.utils.encode_cell({ r: row, c: 3 }); // 'MouDocument'
      const actionDocCellRef = XLSX.utils.encode_cell({ r: row, c: 13 }); // 'mouActionTakenDocument'
  
      // if (item.MouDocumentFile) {
      //   ws[mouDocCellRef] = {
      //     t: "s",
      //     v: "Download Mou Document",
      //     l: { Target: item.MouDocumentFile }
      //   };
      // }
      // if (item.mouActionTakenDocument) {
      //   ws[actionDocCellRef] = {
      //     t: "s",
      //     v: "Download Attachment",
      //     l: { Target: item.mouActionTakenDocument }
      //   };
      // }
    });
  
    // Set column widths
    ws['!cols'] = header.map(() => ({ wpx: 200 }));
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // Use writeFile for correct file generation
    XLSX.writeFile(wb, fileName);
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
      this.MouEndDate = '';
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
    // this.MOUService.MouActivityandActionDetails(Startday,today).subscribe({
    this.MOUService.GetAllMouDocumentDetails().subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        // console.log("DATA"+JSON.stringify(this.dataSource))
        this.dataLoaded = true;
        this.MouData = data.item1;
        if (this.MouData?.length > 0) {
          this.MouDataColumns = Object.keys(this.MouData[0]);

          this.filteredMouDocumentsLists = this.MouDocumentsLists = data.item1;
          console.log(JSON.stringify(this.filteredMouDocumentsLists))
          this.dataSources.data = this.MouDocumentsLists;
          this.loadingIndicator = false;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouDocumentsLists[0];
          this.columns = Object.keys(this.MouDocumentsLists[0]);
          // updatedBy":null,"ipAddress":null,"updatedOn":null,"isActive":true,"isApproved":null,"disapprovalReason":null,"approvedBy":null,"approvalDate":null,"schoolDivisionInvolved":"44","spocName":"Vignesh D","spocEmailId":"vignesh@prograd.org","spocContactNo":"97108117802","mouStartDate":"2022-06-21","mouEndDate":"2023-06-22","mouStatus":"Expired"
          this.columns = this.columns.filter((item: any) => item !== 'updatedBy' && item !== 'ipAddress'  && item !== 'updatedOn' && item !== 'isActive'  && item !== 'isApproved' && item !== 'disapprovalReason' && item !== 'approvedBy' && item !== 'approvalDate' && item !== 'id' && item !== 'spocName' && item !== 'spocContactNo' && item !== 'spocEmailId' && item !== 'mouStartDate' && item !== 'mouEndDate' && item !== 'mouStatus'&& item !== 'filePath'&& item !== 'fileName' && item !== 'uid' && item !== 'createdBy' && item !== 'createdOn');
          // this.columns = this.columns.filter((item: any) => item !== 'mouCreatedBy' && item !== 'mouid'  && item !== 'mouStartDate' && item !== 'mouEndDate'  && item !== 'mouStatus' && item !== 'mouDocument' && item !== 'mouActivityAssignedBy' && item !== 'mouActivityUploadedOn' && item !== 'id' && item !== 'mouActivityApprovalStatus' && item !== 'updatedOn' && item !== 'updatedBy' && item !== 'mouActionTakenDocument' && item !== 'mouActionTakenDocument');
          this.columns.push()
          this.loadingIndicator = false;
          this.getDropdownData();
          this.getAllMouActivities();
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
      } else {
        this.allSchoolDivisions = [];
      }
    });
  }

  onSelect(a: any) {
    let aa = a;
  
    this.mouId = +aa['mouid']
   
    this.schoolDivisionId = aa['responsibleSchool'];
    this.HosId = aa['assignedBy'];
    this.MouStartDate=aa['mouStartDate'];
    this.MouEndDate=aa['mouEndDate'];
    this.MouStatus=aa['mouStatus'];  
    this.ExpectedstartDate = aa['activityStartDate'] 
  ? new Date(aa['activityStartDate']).toISOString().split('T')[0] 
  : '';

  this.ExpectedstartDate = aa['activityEndDate'] 
  ? new Date(aa['activityEndDate']).toISOString().split('T')[0] 
  : '';

    this.UploadedFileUrl = aa['mouDocument'];
    this.CurrentApprovalStatus = aa['mouActivityApprovalStatus'];
    this.CurrentdisapprovalReason = aa['mouActivityDisapprovalReason'];
    this.MouStatus = aa['mouStatus'] == null ? 'NA' : aa['mouStatus'];
    this.PresentDate = this.datePipe.transform(new Date(), 'dd-MMM-yyyy');
  
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
     
    }).catch((res) => { });
    //  }
  }
  onSelectFile(a: any) {
    let aa = a;
    window.open(aa.mouActionTakenDocument, '_blank');
  }
  onSelectFileDocument(a: any) {
    let aa = a;
    window.open(aa.mouDocument, '_blank');
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
      this.DocumentName = selectedActivity?.description
    }
    else {
      this.testClick(event.target.value)
    }
  }

  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.Remarks?.length < 4
      && this.DocumentName != ''
      && this.CompletedDate !== ''
      && this.fileData != null
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

  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('MouStartDate', this.MouStartDate);
    formData.append('MouEndDate', this.MouEndDate);
    formData.append('MouStatus', this.MouStatus);
    formData.append('SchoolDivisionId', this.schoolDivisionId);
    formData.append('AssignedBy', this.HosId);
    formData.append('AssignedTo', this.ResponsiblePerson.length>0? this.ResponsiblePerson : 'N-A');
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
    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    this.mouDocumentsService.UpdateMOUActionPlanMaster(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'Success') {
          swal.fire({
            title: 'Action done Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else if (result === 'Update') {
          swal.fire({
            title: 'Action Updated for this MOU',
            icon: 'success'
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
  
          // Special handling for mouid (Numeric & "MOU/x" String Comparison)
          if (key === 'mouid') {
            const numericId = Number(val); // Convert mouid to a number
            
            // Handle cases where user searches with "MOU/x" or just a number
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
  
  
  
}
