import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import * as XLSX from 'xlsx';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import swal from 'sweetalert2';
import { StudentGrievanceServicesService } from 'src/app/_services/student-grievance-services.service';
import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { fromEvent } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-SGRC-Casess',
  templateUrl: './SGRC-Casess.component.html',
  styleUrls: ['./SGRC-Casess.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class SGRCComponenent implements OnInit {

  isLoginFailed = false;


  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewDescModal2') viewDescModal2: TemplateRef<any>; // Added on 5-Feb-24
  @ViewChild('search', { static: false }) search: any;
  @ViewChild('searchOpen', { static: false }) searchOpen: any;
  @ViewChild('searchClose', { static: false }) searchClose: any;
  selectedSchoolDiv: any = null;
  simpleItems: any = [];
  AreaofCollaboration: any = [];
  AgreementType: any = [];
  MessageType: any = [];
  Block: any = [];
  loadingIndicator = false;
  Activity: any = [];
  SchoolsInvolved: any = [];
  isInputDisabled: boolean = false;
  // Aggrement Start

  ticketNumbers: any = '';

  session: any = [];
  metricbysessionid: any = [];
  ActivityByAoC: any = [];
  SchoolsInvolved_: any = [];
  DivisionsInvolved_: any = [];
  Allemployee: any = [];

  //Aggrement END
  sgrcStatus: any = '';
  sgrcRemarks: any = '';
  form: FormGroup;
  myArray: any[] = [];
  driveAttendance: any[] = [];
  staticArray: any = [];
  batchYearData: any = [];
  batchYearCompanyData: any = [];
  batchYearStreamData: any = [];
  streamData: any[] = [];
  selectedStream: any = '';
  dExitDataAll: any[] = [];
  selectedBatchyear: any = null;
  roundData: any[] = [];
  selectedRoundData: any = null;
  selectedStreams: any = null;
  selection: any = '';
  isAvailable: Number = 0;
  responses: any[] = [];
  results: RESULT = {
    batchYear: 0,
    companyId: 0,
    driveId: 0,
    stream: '',
    placementSoftSkillRequestDetail: []
  };
  details: Details = {
    companyRemarks: '',
    facultyRemarks: '',
    feedback: '',
    roundId: 0,
    totalAbsent: '',
    totalEligible: '',
    totalLeft: '',
    totalNotSelected: '',
    totalPresent: '',
    totalRegistered: '',
    totalSelected: ''
  };
  ColumnMode = ColumnMode;
  columns: any;
  headHtmlData: any[] = [];
  studentLists: any[];
  studentListsOpenCases: any[];
  studentListsClosedCases: any[];
  //Changes 5-Feb-24
  studentClosedCasesRemarks: any[];
  studentListsClosedCasesIdWiseRemarks: any[];

  tmpstudentLists: any[];
  tmpstudentListsOpenCases: any[];
  tmpstudentListsClosedCases: any[];


  dataSource: MatTableDataSource<any>;
  dataSourceOpen: MatTableDataSource<any>;
  dataSourceClose: MatTableDataSource<any>;
  // displayedColumns: string[] = ['applicationId', 'registerationNumber', 'studentName', 'courseName', 'batchYear', 'documentName', 'filePath', 'isAPproved', 'actions'];
  displayedColumns: string[] = ['srno', 'ticketNumber', 'name', 'phone', 'subject', 'nature', 'subject', 'status', 'actions'];//,'description'
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('sort') sort: MatSort;

  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('sort1') sort1: MatSort;


  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild('sort2') sort2: MatSort;
  IdClosedCase: any;



  //'MoU <span class="themeClr" >Dashboard</span>'
  constructor(private Agreement: AgreementEntryService,
    private studendGservice: StudentGrievanceServicesService,
    private studendGservicelocal: StudentGrievanceServicesLocalService,

    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private placementService: PlacementService,) {

    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });

  }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
    this.MessageType = ['Grievance', 'Request', 'Feedback', 'Enquiry']

    this.Block = ['BH1', 'BH1', 'BH1', 'BH1']

  }

  ticketNumber: any;
  remarks: any;
  selectedDate: NgbDateStruct;
  txtVenue: any = '';
  txtEvent: any = '';
  selectedEmployee: any = null;
  selectedBlock: any = null;
  ddlType: any = null;
  ddlCategory: any = null;
  ddlSubCategory: any = null;


  SigningDate: NgbDateStruct;
  StartDate: NgbDateStruct;
  EndDate: NgbDateStruct;




  SubmitForm(item: any) {
    console.log(item)

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  changeCollab(event: any) {
    let aa = event;


  }
  VerifyDatas() {

  }



  VerifyData() {
    this.isInputDisabled = true;
    if (this.sgrcStatus === '') {
      swal.fire(

        { title: 'SGRC', text: 'Please select status !', icon: 'error' }

      );
      this.isInputDisabled = false;
    }
    else if (this.sgrcRemarks === '') {
      swal.fire(

        { title: 'SGRC', text: 'Please enter remarks !', icon: 'error' }

      );
      this.isInputDisabled = false;
    }

    else {
      const denominations =
      {
        MasterId: this.ticketNumbers,
        Remarks: this.sgrcRemarks,
        Status: this.sgrcStatus
      }
      this.responses = [];
      this.responses.push(denominations);

      this.Agreement.updateSGRCCases(this.responses[0]).subscribe({
        next: data => {
          this.isInputDisabled = false;
          swal.fire({ title: 'SGRC Cases', text: 'SGRC Case update successfully   !', icon: 'success' }).then(function () {
            window.location.reload();
          });

        },
        error: err => {
          this.isInputDisabled = false;
        }
      });




    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.search.nativeElement, 'keydown')
      .pipe(
        debounceTime(550),
        map((x: any) => x['target']['value'])
      )
      .subscribe(value => {
        this.updateFilter(value);
      });


    fromEvent(this.searchOpen.nativeElement, 'keydown')
      .pipe(
        debounceTime(550),
        map((x: any) => x['target']['value'])
      )
      .subscribe(value => {
        this.updateOpenFilter(value);
      });

    fromEvent(this.searchClose.nativeElement, 'keydown')
      .pipe(
        debounceTime(550),
        map((x: any) => x['target']['value'])
      )
      .subscribe(value => {
        this.updateCloseFilter(value);
      });


  }

  updateFilter(val: any) {
    const value = val.toString().toLowerCase().trim();
    const count = this.columns.length;
    const keys = Object.keys(this.tmpstudentLists[0]);
    this.studentLists = this.tmpstudentLists.slice().filter((item: any) => {
      let searchStr = '';
      for (let i = 0; i < this.columns.length; i++) {
        searchStr += (item[this.columns[i]]).toString().toLowerCase();
      }
      return searchStr.indexOf(val) !== -1 || !val;
    });
  }


  updateOpenFilter(val: any) {
    const value = val.toString().toLowerCase().trim();
    const count = this.columns.length;
    const keys = Object.keys(this.tmpstudentLists[0]);
    this.studentListsOpenCases = this.tmpstudentListsOpenCases.slice().filter((item: any) => {
      let searchStr = '';
      for (let i = 0; i < this.columns.length; i++) {
        searchStr += (item[this.columns[i]]).toString().toLowerCase();
      }
      return searchStr.indexOf(val) !== -1 || !val;
    });

  }

  updateCloseFilter(val: any) {
    const value = val.toString().toLowerCase().trim();
    const count = this.columns.length;
    const keys = Object.keys(this.tmpstudentLists[0]);
    this.studentListsClosedCases = this.tmpstudentListsClosedCases.slice().filter((item: any) => {
      let searchStr = '';
      for (let i = 0; i < this.columns.length; i++) {
        searchStr += (item[this.columns[i]]).toString().toLowerCase();
      }
      return searchStr.indexOf(val) !== -1 || !val;
    });
  }


  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        this.GetAllStudentsCases();
      },
      error: (err) => {
        this.isLoginFailed = true;
        swal.fire('Error', 'Failed to load event data', 'error');
      }
    });
  }



  openVerticalCenteredModal(ticketNumber: any) {
    this.ticketNumber = ticketNumber;
    this.modalService.open(this.verticalCenteredModal, { centered: true }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }

  onSave() {
    swal.fire(
      'Under Construction !',
      '-------',
      'error'
    )
  }


  getIsShowColName(col: string) {
    if (col == 'FileName') {
      return true;
    }
    else {
      return false;
    }

  }

  onSelectFile(a: any) {
    window.open(a['fileName'], '_blank');
  }


  onSelect(a: any) {
    let aa = a;
    this.ticketNumbers = a['ticketNumber']
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  exportToExcel(): void {
    const fileName = 'SGRC-Cases-Details.xlsx';
    const exportedData = this.studentLists.map(item => ({
      studentName: item.name,
      email: item.email,
      phone: item.phone,
      description: item.description,
      TicketNo: item.ticketNumber,
      subject: item.subject,
      Nature: item.nature,
      createdOn: item.createdOn,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

    exportToExcelClosedCases(): void {
    const fileName = 'SGRC-Closed-Cases-Details.xlsx';
    const exportedData = this.studentListsClosedCases.map(item => ({
      studentName: item.name,
      email: item.email,
      phone: item.phone,
      description: item.description,
      TicketNo: item.ticketNumber,
      subject: item.subject,
      Nature: item.nature,
      createdOn: item.createdOn,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

    exportToExcelOpenCases(): void {
    const fileName = 'SGRC-Open-Cases-Details.xlsx';
    const exportedData = this.studentListsOpenCases.map(item => ({
      studentName: item.name,
      email: item.email,
      phone: item.phone,
      description: item.description,
      TicketNo: item.ticketNumber,
      subject: item.subject,
      Nature: item.nature,
      createdOn: item.createdOn,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

  onSelectClosedcases(a: any) {

    this.IdClosedCase = a['id'];
    this.studendGservicelocal.GetAllStudentsCasesRemarks(this.IdClosedCase).subscribe(
      (response) => {
        if (response.item1.length > 0) {
          this.studentClosedCasesRemarks = response.item1;

        } else {
          this.studentClosedCasesRemarks = [];
        }
        this.modalService.open(this.viewDescModal2, { size: 'sm' }).result.then(
          (result) => {
            console.log("Modal closed" + result);
          }
        ).catch((res) => { });

      },
      (error) => {
        // Handle error here
        console.error("Error fetching data:", error);
      }
    );
  }


  GetAllStudentsCases(): void {
    this.loadingIndicator = true;
    this.studendGservicelocal.GetAllStudentsCases().subscribe((response) => {
      if (response.item1.length > 0) {
        this.tmpstudentLists = response.item1;
        this.studentLists = response.item1;
        this.FilteredstudentLists = this.studentLists;
        this.studentListsOpenCases = this.studentLists.filter(x => x["status"] === 'O');
        this.studentListsClosedCases = this.studentLists.filter(x => x["status"] === 'C');
        this.tmpstudentListsOpenCases = this.studentListsOpenCases;
        this.tmpstudentListsClosedCases = this.studentListsClosedCases;
        this.loadingIndicator = false;

        this.columns = [];
        this.headHtmlData = [];


        this.headHtmlData = this.studentLists[0];
        this.columns = Object.keys(this.studentLists[0]);
        this.columns = this.columns.filter((item: any) => item !== 'fileName');
        this.columns.push()
        this.loadingIndicator = false;
      } else {
        this.studentLists = [];
      }
    });
  }

  searchQuery: any;
  FilteredstudentLists: any[];
  @ViewChild('table') table: ElementRef;

  DataSearch() {
    // Ensure that searchQuery is not null/undefined and trim any extra spaces.
    const query = this.searchQuery?.trim().toLowerCase() || '';

    // If search query is empty, reset to the original list
    if (!query) {
      this.FilteredstudentLists = this.studentLists;
      return;
    }

    // Filter student lists based on the search query
    this.FilteredstudentLists = this.studentLists.filter(item => {
      // Use Object.entries to loop through all key-value pairs in the object
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          // Convert the value to a string and make it case-insensitive
          let valueString = String(val).toLowerCase();

          // Special handling for 'ticketNumber' field
          if (key === 'ticketNumber') {
            const numericId = Number(val); // Convert the ticket number to a number

            // Handle both numericId and 'SG-<numericId>' formats
            if (!isNaN(numericId)) {
              // Check if the query matches the numericId or 'SG-<numericId>' format
              return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
            }
          }

          // General case for other fields (text search)
          return valueString.includes(query);
        }
        return false;
      });
    });
  }

  DataSearchOpen() {
    const query = this.searchQuery?.trim().toLowerCase() || '';

    if (!query) {
      this.GetAllStudentsCases();
      return;
    }

    this.studentListsOpenCases = this.studentListsOpenCases.filter(item => {
      // Use Object.entries to loop through all key-value pairs in the object
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          // Convert the value to a string and make it case-insensitive
          let valueString = String(val).toLowerCase();

          // Special handling for 'ticketNumber' field
          if (key === 'ticketNumber') {
            const numericId = Number(val); // Convert the ticket number to a number

            // Handle both numericId and 'SG-<numericId>' formats
            if (!isNaN(numericId)) {
              // Check if the query matches the numericId or 'SG-<numericId>' format
              return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
            }
          }

          // General case for other fields (text search)
          return valueString.includes(query);
        }
        return false;
      });
    });
  }

  DataSearchClosed() {
    const query = this.searchQuery?.trim().toLowerCase() || '';
    if (!query) {
      this.GetAllStudentsCases();

      return;
    }

    this.studentListsClosedCases = this.studentListsClosedCases.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();

          if (key === 'ticketNumber') {
            const numericId = Number(val); // Convert the ticket number to a number
            if (!isNaN(numericId)) {
              return numericId.toString().includes(query) || `SG-${numericId}`.includes(query);
            }
          }
          return valueString.includes(query);
        }
        return false;
      });
    });
  }
  onTabClick(tabType: string): void {
    if (tabType === 'all') {
      this.searchQuery = "";

    } else if (tabType === 'open') {
      this.searchQuery = "";

    } else if (tabType === 'closed') {
      this.searchQuery = "";
    }
    this.GetAllStudentsCases();
  }





  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('SGRCCases');
    if (element) {
      element.hidden = true;
    }
  }
}
