import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpuEventManagementService } from 'src/app/_services/lpu-event-management.service';

interface SchoolDivision {
  id: string;
  schoolDivision: string;
}
interface SessionName {
  id: number;
  session: string;
}

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  companyOptions = [
    "Option 1", "Option 2"
  ];
  OBPOptions = [
    "Gender Equality**",
    "Local Community Development",
    "Birth and Death Anniversaries of Great Personalities",
    "Environment and Sustainability Events",
    "Human Values and Professional Ethics",
    "Industry Academia Innovative Practices",
    "Extension Activities in Neighborhood Relevant to Discipline",
    "Student Capability Enhancements",
    "Waste Management",
    "Fundamental Duties and Rights and National Identity and Symbols",
    "Days Celebrations",
    "Off-Campus Participation for Technical Events (Including IPR)",
    "Professional Chapter",
    "Sustainability Development Goals (SDGs)",
    "Guinness World Records",
    "Inclusivity and Quality Education",
  ];

  allSchoolDivisions: any; EventLevels: any; isLoginFailed: boolean = false; schoolname: string = ""; CategoryId: string = '';
  eventname: string; eventcalender: string = ''; mode: string = ''; obpcriteria: string = ''; totalstudent: string | Blob;
  semester: string = ''; startdate: string | Blob; enddate: string | Blob; budget: string; remarks: string | Blob;
  responses: any; budgettype: string = 'Select'; budgetType: string = 'Select'; EventObjective: any; EventRegisterationData: any[] = []; DeveloperText: any = "Jatinder Kumar 31309";
  filteredEventRegisterationData: any[] = []; dataSource: any; showNoDataFoundMessage: boolean; filterText: any;
  InternalLevels: string = ''; ExternalLevel: string = '';
  today :any;
  constructor(
    private LpuEventManagementService: LpuEventManagementService,
    private eventService: LpuEventManagementService,
    private MouDocumentsService: MouDocumentsService,
    private modalService: NgbModal,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private storageService: StorageService, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Event <span class="themeClr" >Registeration</span> Form';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.formdata.get('budget')?.enable();
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.getAllPlannerSession();
        this.getSchoolData();
        this.GetAllEventsData();
        this.getAllProperties();
        // this.getAllPlannerSessionforReport();
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
    const element = document.getElementById('EventCalenders');
    if (element) {
      element.hidden = true;
    }
  }
  getSchoolData(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      if (response.item1.length > 0) {
        this.allSchoolDivisions = response.item1;
      } else {
        this.allSchoolDivisions = [];
      }
    });
  }
  
  GetAllEventsData(): void {
    this.loadingIndicator = true;
    this.LpuEventManagementService.GetAllEventsDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EventRegisterationData = response.item1;
          this.filteredEventRegisterationData = this.EventRegisterationData;
          // console.log(JSON.stringify(this.filteredEventRegisterationData))
          this.showNoDataFoundMessage = this.filteredEventRegisterationData.length === 0;
        } else {
          this.EventRegisterationData = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
    setTimeout(() => {
      this.loadingIndicator = false;
    }, 2500);
  }
  formdata = this.fb.group({
    schoolname: ['', Validators.required],
    EventObjective: ['', Validators.required],
    eventname: ['', Validators.required],
    eventcalender: ['', Validators.required],
    totalstudent: ['', Validators.required],
    obpcriteria: ['', Validators.required],
    mode: ['', Validators.required],
    external: ['', Validators.required],
    internal: ['', Validators.required],
    category: ['', Validators.required],
    semester: ['', Validators.required],
    startdate: ['', Validators.required],
    enddate: ['', Validators.required],
    budgettype: ['Select', Validators.required],
    budget: [{ value: '', disabled: true }, Validators.required],
    remarks: ['', Validators.required],
    SessionId: [''],
  });

  OBPOptionsitems: any;
  PropertiesData: any[] = [];   chunkedProperties: any[][] = [];
  properties: any[] = []; 
  getAllProperties(): void {
    this.LpuEventManagementService.GetOBPProperties().subscribe({
      next: response => {
        if (response.item1) {
          this.OBPOptionsitems =  response.item1;
          this.OBPOptionsitems.forEach((PropertiesData: { items: string; }) => {
            this.properties.push(PropertiesData.items);
          });
        }
      }
    });
  }

  Onsubmit() {
    const formData = new FormData();
    formData.append('SchoolId', this.schoolname);
    formData.append('EventObjective', this.EventObjective);
    formData.append('EventName', this.eventname);
    formData.append('EventType', this.eventcalender);
    formData.append('AlternativelyStudentCounts', this.totalstudent);
    formData.append('OBPCriteria', this.obpcriteria);
    formData.append('ModeOfConduct', this.mode);
    formData.append('ExternalLevel', this.ExternalLevel);
    formData.append('InternalLevel', this.InternalLevels);
    formData.append('CategoryId', this.CategoryId);
    formData.append('Semester', this.semester);
    formData.append('StartDate', this.startdate);
    formData.append('EndDate', this.enddate);
    formData.append('BudgetType', this.budgettype);
    formData.append('BudgetAmount', this.budget);
    formData.append('Remarks', this.remarks);
    formData.append('SessionId', this.allPlannerSessions[0]?.id);
    // console.log("Form Data")
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });
    this.LpuEventManagementService.EventManagementNewEvent(formData).subscribe((response) => {
      if (response.item1.length > 0) {
        this.responses = response.item1[0];
        if (this.responses.returnData === '-1') {
          swal.fire(
            { title: 'Something went Wrong ', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 112200);
        } else if (this.responses.returnData === 'success') {
          swal.fire(
            { title: 'Event Registered Successfully: ', text: this.responses.returnData, icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2200);
        } else if (this.responses.returnData === '-2') {
          swal.fire(
            { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 112200);
        }
      }
    });
  }
  selectedSessionId: any = 0;
  filterData() {
    const lowerCaseFilter = this.filterText ? this.filterText.toLowerCase() : '';
    const selectedSessionId = Number(this.selectedPlannerSession); // ensure numeric comparison
  
    this.filteredEventRegisterationData = this.EventRegisterationData.filter(event => {
      // Check if session ID matches (0 means all)
      const sessionMatch = selectedSessionId === 0 || event.sessionId === selectedSessionId;
  
      // Flatten object values to string and check if any matches filter text
      const textMatch = lowerCaseFilter === '' || Object.values(event).some(value => {
        if (value != null) {
          return String(value).toLowerCase().includes(lowerCaseFilter);
        }
        return false;
      });
  
      // Both conditions must be true
      return sessionMatch && textMatch;
    });
  }
  

  recordsPerPage = 10; currentPage = 1;
  get totalPages(): number {
    return Math.ceil(this.filteredEventRegisterationData.length / this.recordsPerPage);
  }
  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }
  changePage(page: number): void {
    this.currentPage = page;
  }
  getRecordsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    return this.filteredEventRegisterationData.slice(startIndex, endIndex);
  }
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }
  getDivisionNameById(id: number): string {
    const idStr = id.toString();
    let division: SchoolDivision | undefined;
    for (const school of this.allSchoolDivisions) {
      if (school.id === idStr) {
        division = school;
        break;
      }
    }
    return division ? division.schoolDivision : `ID ${idStr} not found`;
  }
  getSessionNameById(id: number): string {
    const idStr = id;
    let SessionName: SessionName | undefined;

    for (const session of this.allPlannerSessionDatas) {
      if (session.id == idStr) {
        SessionName = session;
        break;
      }
    }
    return SessionName ? SessionName.session : `ID ${idStr} not found`;
  }

  exportToExcel(): void {
    const fileName = 'EventDetails_report.xlsx';
    const exportedData = this.filteredEventRegisterationData.map(item => {
      return {
        Objective: item.eventObjective,
        SchoolDivision: this.getDivisionNameById(item.schoolId),
        EventName: item.eventName,
        ObpCriteria: item.obpCriteria,
        StudentCount: item.alternativelyStudentCounts,
        Category: item.categoryId,
        // eventPirority: item.eventPirority,
        modeOfConduct: item.modeOfConduct,
        semester: item.semester,
        InternalLevel: item.internalLevel,
        ExternalLevel: item.externalLevel, 
        startDate: this.formatDate(item.startDate),
        endDate: this.formatDate(item.endDate),
        BudgetAmount: item.budgetAmount,
        BudgetType: item.budgetType,
        Remarks: item.remarks,
      };
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

    const wscols = [
      { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }
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
  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  // aaded on 30-june-25
  allPlannerSessions: any[] = [];
  allPlannerSessionDatas: any[] = [];
  selectedPlannerSession: any = '0';  // default selected value
  selectedPlannerSessionData: any = '0';  // default selected value
  allOBPStaffData: any[] = [];

  getAllPlannerSessionforReport(): void {
    this.MouDocumentsService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1 && this.items?.length > 0) {
          this.allPlannerSessionDatas = response.item1.filter(
            (session: { id: string | number }) => +session.id >= 16 && +session.id <= this.maxId

          );
          // console.log(JSON.stringify(this.allPlannerSessionDatas))
        }
      }
    });
  }

  maxId: any;
  getAllPlannerSession(): void {
    this.LpuEventManagementService.GetCurrentPlannerSession().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
          this.items = response.item1;
          // this.allPlannerSessions=this.items.filter(session => +session.id > 16);
          this.maxId = +this.items[0].id; // convert to number safely
          this.getAllPlannerSessionforReport();
        }
      }
    });

  }
  setSessionId(event: any): void {
    this.loadingIndicator = true;
    this.filterText="";
    const selectedId = parseInt(event.target.value, 10); // Convert to number
    this.selectedPlannerSession = selectedId;

    // Filter data based on selected session ID (0 = show all)
    this.filteredEventRegisterationData = selectedId === 0
      ? this.EventRegisterationData
      : this.EventRegisterationData.filter((event: any) => event.sessionId === selectedId);

    // Simulate loading delay
    setTimeout(() => {
      this.loadingIndicator = false;
    }, 2500);
  }

  loadingIndicator = false;
  sessionId: any = 'Select'; // Default empty value
  items: any[] = []; // Array to store dropdown options 





  isForm1Submitted: boolean = false;

  get form1() {
    return this.formdata.controls;
  }

  isTouchedInvalid(controlName: string): boolean {
    const control = this.formdata.get(controlName);
    return !!control && control.touched && control.invalid;
  }

 // added on 19-July-25
  // Paginator reference
  @ViewChild(MatPaginator) paginator!: MatPaginator;
   // Properties for advanced search
   advancedSearch = {
    sessionId: '',
    schoolName: '',
    semester: '',
    eventName: '',
    objective: '',
    eventCategory: '',
    obpCriteria: '',
    internal:'',
    startDate: null as Date | null,
    endDate: null as Date | null,
    eventType:'',
    categoryId:''

  };
 
  applyAdvancedSearch(): void {
  this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
    if (this.advancedSearch.categoryId && item.categoryId !== this.advancedSearch.categoryId) {
      return false;
    }
    if (
      this.advancedSearch.sessionId &&
      this.advancedSearch.sessionId !== '' &&
      this.advancedSearch.sessionId !== '0' &&
      item.sessionId.toString() !== this.advancedSearch.sessionId &&
      item.eventType !== ''
    ) {
      return false;
    }

    if (this.advancedSearch.eventType && item.eventType !== this.advancedSearch.eventType) {
      return false;
    }
    if (
      this.advancedSearch.schoolName &&
      !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())
    ) {
      return false;
    }

    if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
      return false;
    }
    if (
      this.advancedSearch.eventName &&
      !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())
    ) {
      return false;
    }

    if (this.advancedSearch.eventCategory && item.eventType != this.advancedSearch.eventCategory) {
      return false;
    }

    // Updated obpCriteria matching logic
    if (this.advancedSearch.obpCriteria) {
      const searchWords = this.advancedSearch.obpCriteria.trim().toLowerCase().split(/\s+/).slice(0, 2);
      const itemWords = item.obpCriteria ? item.obpCriteria.trim().toLowerCase().split(/\s+/).slice(0, 2) : [];

      // Check if first two words match exactly
      if (searchWords.length < 2 || itemWords.length < 2) {
        // If either has less than 2 words, require exact match of what is available
        if (searchWords.join(' ') !== itemWords.join(' ')) {
          return false;
        }
      } else {
        // Both have at least 2 words, compare first two words
        if (searchWords[0] !== itemWords[0] || searchWords[1] !== itemWords[1]) {
          return false;
        }
      }
    }

    const itemStartDate = item.startDate ? new Date(item.startDate) : null;
    const searchStart = this.advancedSearch.startDate ? new Date(this.advancedSearch.startDate) : null;
    const searchEnd = this.advancedSearch.endDate ? new Date(this.advancedSearch.endDate) : null;

    if (searchStart && itemStartDate && itemStartDate < searchStart) {
      return false;
    }
    if (searchEnd && itemStartDate && itemStartDate > searchEnd) {
      return false;
    }

    return true;
  });

  this.filteredEventRegisterationData.sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  // Reset paginator to first page
  if (this.paginator) {
    this.paginator.firstPage();
  }
}



  // Pagination logic
 
  // Pagination logic
  AtotalPages(): number {
    return Math.ceil(this.filteredEventRegisterationData.length / this.recordsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.AtotalPages()) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  setPageSize(size: number): void {
    this.recordsPerPage = size;
    this.currentPage = 1; // Reset to first page when changing page size
  }


  
recordsPerPageOptions = [5, 10, 25, 50];
// Current page number (1-based)
 
onRecordsPerPageChange(): void {
  this.currentPage = 1; // Reset to first page
}
 
 
  // applyAdvancedSearch(): void {
  //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
  //     if (this.advancedSearch.categoryId && item.categoryId !== this.advancedSearch.categoryId) {
  //       return false;
  //     }
  //     if (
  //       this.advancedSearch.sessionId &&
  //       this.advancedSearch.sessionId !== '' &&
  //       this.advancedSearch.sessionId !== '0' &&
  //       item.sessionId.toString() !== this.advancedSearch.sessionId &&
  //       item.eventType !== ''
  //     ) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.eventType && item.eventType !== this.advancedSearch.eventType) {
  //       return false;
  //     }
  //     if (
  //       this.advancedSearch.schoolName &&
  //       !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())
  //     ) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
  //       return false;
  //     }
  //     if (
  //       this.advancedSearch.eventName &&
  //       !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())
  //     ) {
  //       return false;
  //     }
     
  
  //     if (this.advancedSearch.eventCategory && item.eventType != this.advancedSearch.eventCategory) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.obpCriteria && item.obpCriteria != this.advancedSearch.obpCriteria) {
  //       return false;
  //     }
  
  //     const itemStartDate = item.startDate ? new Date(item.startDate) : null;
  //     const searchStart = this.advancedSearch.startDate ? new Date(this.advancedSearch.startDate) : null;
  //     const searchEnd = this.advancedSearch.endDate ? new Date(this.advancedSearch.endDate) : null;
  
  //     if (searchStart && itemStartDate && itemStartDate < searchStart) {
  //       return false;
  //     }
  //     if (searchEnd && itemStartDate && itemStartDate > searchEnd) {
  //       return false;
  //     }
  
  //     return true;
  //   });
  
  //   this.filteredEventRegisterationData.sort((a, b) => {
  //     const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
  //     const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
  //     return dateA - dateB;
  //   });
  
  //   // Reset paginator to first page
  //   if (this.paginator) {
  //     this.paginator.firstPage();
  //   }
  // }
  
  
  // applyAdvancedSearch(): void {
  //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
  //     // Category filter
  //     if (this.advancedSearch.categoryId && item.categoryId !== this.advancedSearch.categoryId) {
  //       return false;
  //     }
  
  //     // Session filter
  //     if (
  //       this.advancedSearch.sessionId &&
  //       this.advancedSearch.sessionId !== '' &&
  //       this.advancedSearch.sessionId !== '0' &&
  //       item.sessionId.toString() !== this.advancedSearch.sessionId &&
  //       item.eventType !== ''
  //     ) {
  //       return false;
  //     }
  
  //     // Event Type filter
  //     if (this.advancedSearch.eventType && item.eventType !== this.advancedSearch.eventType) {
  //       return false;
  //     }
  
  //     // School Name filter
  //     if (
  //       this.advancedSearch.schoolName &&
  //       !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())
  //     ) {
  //       return false;
  //     }
  
  //     // Semester filter
  //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
  //       return false;
  //     }
  
  //     // Event Name filter
  //     if (
  //       this.advancedSearch.eventName &&
  //       !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())
  //     ) {
  //       return false;
  //     }
  
  //     // Objective filter
  //     if (
  //       this.advancedSearch.objective &&
  //       !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())
  //     ) {
  //       return false;
  //     }
  
  //     // Event Category filter
  //     if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
  //       return false;
  //     }
  
  //     // OBP Criteria filter
  //     if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
  //       return false;
  //     }
  
  //     // ✅ Fixed Start/End Date filter
  //     const itemStartDate = item.startDate ? new Date(item.startDate) : null;
  //     const itemEndDate = item.endDate ? new Date(item.endDate) : null;
  
  //     const searchStart = this.advancedSearch.startDate ? new Date(this.advancedSearch.startDate) : null;
  //     const searchEnd = this.advancedSearch.endDate ? new Date(this.advancedSearch.endDate) : null;
  
  //     if (searchStart && itemStartDate && itemStartDate < searchStart) {
  //       return false;
  //     }
  //     if (searchEnd && itemEndDate && itemEndDate > searchEnd) {
  //       return false;
  //     }
  
  //     return true;
  //   });
  
  //   // Reset paginator to first page
  //   if (this.paginator) {
  //     this.paginator.firstPage();
  //   }
  // }
  
  // applyAdvancedSearch(): void {
  //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
      
  //     // added on 9-9-25
  //     if(this.advancedSearch.categoryId && item.categoryId!==this.advancedSearch.categoryId) {
  //       return false;
  //     }


  //     if (this.advancedSearch.sessionId && 
  //       this.advancedSearch.sessionId !== '' && 
  //       this.advancedSearch.sessionId !== '0' && 
  //       item.sessionId.toString() !== this.advancedSearch.sessionId 
  //     && item.eventType!=='') {
  //       return false;
  //     }

  //     // event Type eventType filter
  //     if(this.advancedSearch.eventType && item.eventType!==this.advancedSearch.eventType) {
  //       return false;
  //     }
  //     // School Name filter
  //     if (this.advancedSearch.schoolName && 
  //         !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
  //       return false;
  //     }
  
  //     // Semester filter
  //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
  //       return false;
  //     }
  
  //     // Event Name filter
  //     if (this.advancedSearch.eventName && 
  //         !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
  //       return false;
  //     }
  
  //     // Objective filter
  //     if (this.advancedSearch.objective && 
  //         !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
  //       return false;
  //     }
  
  //     // Event Category filter eventType added on 4-sep-25
  //     if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
  //       return false;
  //     }
  
  //     // OBP Criteria filter
  //     if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
  //       return false;
  //     }
  
  //     // Start Date filter
  //     const itemStartDate = item.startDate ? new Date(item.startDate) : null;
  //     if (this.advancedSearch.startDate && itemStartDate) {
  //       if (itemStartDate < new Date(this.advancedSearch.startDate)) {
  //         return false;
  //       }
  //     }
  
  //     // End Date filter
  //     const itemEndDate = item.endDate ? new Date(item.endDate) : null;
  //     if (this.advancedSearch.endDate && itemEndDate) {
  //       if (itemEndDate > new Date(this.advancedSearch.endDate)) {
  //         return false;
  //       }
  //     }
  
  //     // Ensure the event is included if it falls within the date range
  //     if (this.advancedSearch.startDate || this.advancedSearch.endDate) {
  //       const startDateCondition = this.advancedSearch.startDate ? 
  //         (itemStartDate ? itemStartDate >= new Date(this.advancedSearch.startDate) : false) : true;
  //       const endDateCondition = this.advancedSearch.endDate ? 
  //         (itemEndDate ? itemEndDate <= new Date(this.advancedSearch.endDate) : false) : true;
  
  //       if (!startDateCondition || !endDateCondition) {
  //         return false;
  //       }
  //     }
  
  //     return true;
  //   });
  
  //   // Reset paginator to first page
  //   if (this.paginator) {
  //     this.paginator.firstPage();
  //   }
  // }
  
  
  // applyAdvancedSearch(): void {
  //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
  //     if (this.advancedSearch.sessionId && 
  //       this.advancedSearch.sessionId !== '' && 
  //       this.advancedSearch.sessionId !== '0' && 
  //       item.sessionId.toString() !== this.advancedSearch.sessionId) {
  //     return false;
  //   }
  //     // School Name filter
  //     if (this.advancedSearch.schoolName && 
  //         !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
  //       return false;
  //     }

  //     // Semester filter
  //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
  //       return false;
  //     }

  //     // Event Name filter
  //     if (this.advancedSearch.eventName && 
  //         !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
  //       return false;
  //     }

  //     // Objective filter
  //     if (this.advancedSearch.objective && 
  //         !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
  //       return false;
  //     }

  //     // Event Category filter
  //     if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
  //       return false;
  //     }

  //     // OBP Criteria filter
  //     if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
  //       return false;
  //     }

  //     // Start Date filter
  //     if (this.advancedSearch.startDate) {
  //       const itemStartDate = item.startDate ? new Date(item.startDate) : null;
  //       if (!itemStartDate || itemStartDate < new Date(this.advancedSearch.startDate)) {
  //         return false;
  //       }
  //     }

  //     // End Date filter
  //     if (this.advancedSearch.endDate) {
  //       const itemEndDate = item.endDate ? new Date(item.endDate) : null;
  //       if (!itemEndDate || itemEndDate > new Date(this.advancedSearch.endDate)) {
  //         return false;
  //       }
  //     }

  //     return true;
  //   });

  //   // Reset paginator to first page
  //   if (this.paginator) {
  //     this.paginator.firstPage();
  //   }
  // }

  // Reset advanced search
  resetAdvancedSearch(): void {
    this.advancedSearch = {
      sessionId: '',
      schoolName: '',
      semester: '',
      eventName: '',
      objective: '',
      eventCategory: '',
      obpCriteria: '',
      internal:'',
      startDate: null,
      endDate: null,
      eventType:'',
      categoryId:''
    };
    this.hasAnySearchCriteria = false;
    this.filteredEventRegisterationData = [...this.EventRegisterationData];
  }



  // Add these properties to your component class
showAdvancedSearch = false;
 
// Add this method to toggle advanced search
toggleAdvancedSearch(): void {
  this.showAdvancedSearch = !this.showAdvancedSearch;
  if (!this.showAdvancedSearch) {
    this.resetAdvancedSearch();
  }
}

// Add this property to track if any field has value
hasAnySearchCriteria = false;

// Add this method to check if any field has value
checkSearchCriteria(): void {
  this.hasAnySearchCriteria = Object.values(this.advancedSearch).some(value => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true; // For dates and other types
  });
}
 
@ViewChild('BulkEventModal') BulkEventModal: TemplateRef<any>; 

 // Excel Upload related properties
 fileName: string = 'Events_Upload_ExcelData.xlsx'; 
 filePath: string = `assets/Uploads/${this.fileName}`;


 // In your component class

downloadSampleDocument() {
  window.open(this.filePath, '_blank');
}

 file: any; // The actual file object
 uploadedDataRaw: any[] = []; // Raw data from Excel, used for sending to backend
 uploadedDataForDisplay: any[] = []; // Formatted data for UI display
 validationErrors: string[] = [];
 errorCells: { rowIndex: number, cellIndex: number }[] = [];
 createdBy: any; // Assuming this is set elsewhere, e.g., from user session
UploadExcelData(){
  // Clear previous data and errors when opening the modal
  this.file = null;
  this.uploadedDataRaw = [];
  this.uploadedDataForDisplay = [];
  this.validationErrors = [];
  this.errorCells = [];
  this.modalService.open(this.BulkEventModal, { size: 'lg', backdrop: 'static' });
}


  // Excel Upload Logic


  // Excel Upload Logic
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      if (this.file) {
        this.readExcelFile(this.file);
      }
    }
  }

  readExcelFile(file: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Raw data for backend (dates as they are in Excel, will be formatted before sending)
      this.uploadedDataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Process data for display (format dates for UI)
      this.processUploadedDataForDisplay(this.uploadedDataRaw);
      this.validateData();
    };
    reader.readAsArrayBuffer(file);
  }

  processUploadedDataForDisplay(rawData: any[]) {
    if (!rawData || rawData.length === 0) {
      this.uploadedDataForDisplay = [];
      return;
    }

    // Copy headers
    this.uploadedDataForDisplay = [rawData[0]];

    // Process rows, starting from the second row (index 1)
    for (let i = 1; i < rawData.length; i++) {
      const row = [...rawData[i]]; // Create a copy of the row to avoid modifying rawData
      
      // Assuming StartDate is at index 11 and EndDate is at index 12
      // Format for display (e.g., 'MM-DD-YYYY')
      if (row[11] !== undefined && row[11] !== null) {
        row[11] = this.formatDateForDisplay(row[11]);
      }
      if (row[12] !== undefined && row[12] !== null) {
        row[12] = this.formatDateForDisplay(row[12]);
      }
      this.uploadedDataForDisplay.push(row);
    }
  }

  // Helper function to format date for UI display (MM-DD-YYYY)
  formatDateForDisplay(dateValue: any): string {
    if (typeof dateValue === 'number') {
      // If it's an Excel date number
      const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } else if (typeof dateValue === 'string') {
      // If it's a date string, try to parse it
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) { // Check if date is valid
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    }
    return dateValue; // Return as is if cannot be formatted
  }

  validateData() {
    this.validationErrors = [];
    this.errorCells = [];
    if (!this.uploadedDataRaw || this.uploadedDataRaw.length <= 1) return;

    this.uploadedDataRaw.forEach((row: any, rowIndex: number) => {
      if (rowIndex === 0) return; // Skip header row
      let errorMessages = [];

      // Validate AlternativelyStudentCounts (index 4)
      if (isNaN(row[4]) || row[4] === null || row[4] === undefined) {
        errorMessages.push('Student Count must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 4 });
      }

      // Validate BudgetAmount (index 14)
      if (isNaN(row[14]) || row[14] === null || row[14] === undefined) {
        errorMessages.push('Budget Amount must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 14 });
      }

      // Validate StartDate (index 11) and EndDate (index 12)
      const startDate = this.parseDateForValidation(row[11]);
      const endDate = this.parseDateForValidation(row[12]);

      if (startDate === null) {
        errorMessages.push('Invalid Start Date format');
        this.errorCells.push({ rowIndex, cellIndex: 11 });
      }
      if (endDate === null) {
        errorMessages.push('Invalid End Date format');
        this.errorCells.push({ rowIndex, cellIndex: 12 });
      }
      if (startDate && endDate && startDate > endDate) {
        errorMessages.push('Start Date cannot be after End Date');
        this.errorCells.push({ rowIndex, cellIndex: 11 });
        this.errorCells.push({ rowIndex, cellIndex: 12 });
      }

      this.validationErrors[rowIndex] = errorMessages.join(', ');
    });
  }

  // Helper to parse date for validation, handles Excel numbers and strings
  parseDateForValidation(dateValue: any): Date | null {
    if (typeof dateValue === 'number') {
      // Excel date number to Date object
      return new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    } else if (typeof dateValue === 'string') {
      // Try parsing string date
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  hasErrors(): boolean {
    return this.validationErrors.some(error => error.length > 0);
  }

  isError(rowIndex: number, cellIndex: number): boolean {
    return this.errorCells.some(errorCell => errorCell.rowIndex === rowIndex && errorCell.cellIndex === cellIndex);
  }

  confirmUpload() {
    if (this.hasErrors()) {
      Swal.fire('Validation Error', 'Please correct the errors in the uploaded data before confirming.', 'error');
      return;
    }
    this.Upload();
  }
 
  Upload() {
    var xmlString = '<dataset><data>';
    // Iterate over uploadedDataRaw to get original values for backend
    for (var i = 1; i < this.uploadedDataRaw.length; i++) {
        var element = this.uploadedDataRaw[i];
        var row = "<row>";
        row += "<SchoolId>" + this.getPropertyByIndex(element, 0) + "</SchoolId>";
        row += "<EventObjective>" + this.getPropertyByIndex(element, 1) + "</EventObjective>";
        row += "<EventName>" + this.getPropertyByIndex(element, 2) + "</EventName>";
        row += "<EventType>" + this.getPropertyByIndex(element, 3) + "</EventType>";
        row += "<AlternativelyStudentCounts>" + this.getPropertyByIndex(element, 4) + "</AlternativelyStudentCounts>";
        row += "<OBPCriteria>" + this.getPropertyByIndex(element, 5) + "</OBPCriteria>";
        row += "<ModeOfConduct>" + this.getPropertyByIndex(element, 6) + "</ModeOfConduct>";
        row += "<ExternalLevel>" + this.getPropertyByIndex(element, 7) + "</ExternalLevel>";
        row += "<InternalLevel>" + this.getPropertyByIndex(element, 8) + "</InternalLevel>";
        row += "<CategoryId>" + this.getPropertyByIndex(element, 9) + "</CategoryId>";
        row += "<Semester>" + this.getPropertyByIndex(element, 10) + "</Semester>";

        // Format StartDate and EndDate to YYYY-MM-DD for backend
        const startDateRaw = this.getPropertyByIndex(element, 11);
        const endDateRaw = this.getPropertyByIndex(element, 12);
        
        const startDateFormatted = this.formatDateForBackend(startDateRaw);
        const endDateFormatted = this.formatDateForBackend(endDateRaw);
        
        row += "<StartDate>" + startDateFormatted + "</StartDate>";
        row += "<EndDate>" + endDateFormatted + "</EndDate>";
        
        row += "<BudgetType>" + this.getPropertyByIndex(element, 13) + "</BudgetType>";
        row += "<BudgetAmount>" + this.getPropertyByIndex(element, 14) + "</BudgetAmount>";
        row += "<Remarks>" + this.getPropertyByIndex(element, 15) + "</Remarks>";
        row += "<SessionId>" + this.getPropertyByIndex(element, 16) + "</SessionId>";      
        row += "</row>";
        xmlString += row;
    }
    xmlString += '</data></dataset>';
    
    var obj = {
        EventsDataXml: xmlString,
        CreatedBy: this.createdBy
    };

    this.eventService.CreateEventsUsingExcelSheet(obj).subscribe((response) => {
        if (response.item1.length > 0) {
            this.responses = response.item1[0];
            if (this.responses.returnData === '-1') {
                Swal.fire(
                    { title: 'Something went Wrong ', icon: 'error' }
                ), setTimeout(() => {
                    window.location.reload();
                }, 2200);
            } else if (this.responses.returnData === 'success') {
                Swal.fire(
                    { title: 'All Events Details are added: ', text: this.responses.returnData, icon: 'success' }
                ), setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (this.responses.returnData === 'Failed') {
                Swal.fire(
                    { title: 'All entries are Duplicate, Not Inserted ', text: this.responses.returnData, icon: 'error' }
                ), setTimeout(() => {
                    window.location.reload();
                }, 2200);
            }
        }
    });
  }

  // Helper function to format date to YYYY-MM-DD for backend
  formatDateForBackend(dateValue: any): string {
    let date: Date;
    if (typeof dateValue === 'number') {
      // Excel date number to Date object
      date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    } else if (typeof dateValue === 'string') {
      // Try parsing string date
      date = new Date(dateValue);
    } else {
      return ''; // Return empty string if invalid or null
    }

    if (isNaN(date.getTime())) {
      return ''; // Return empty string if date is invalid
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPropertyByIndex(obj: any, index: number): any {
    if (obj && Array.isArray(obj) && obj.length > index) {
      return obj[index];
    }
    return '';
  }
  

  
}