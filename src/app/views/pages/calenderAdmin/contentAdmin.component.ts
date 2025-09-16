import { MatPaginator } from '@angular/material/paginator';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/_services/auth.service';
import { LpuEventManagementService } from 'src/app/_services/lpu-event-management.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { StorageService } from 'src/app/_services/storage.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface SessionName {
  id: number;
  session: string;
}

@Component({
  selector: 'app-content',
  templateUrl: './contentAdmin.component.html',
  styleUrls: ['./contentAdmin.component.scss']
})
export class ContentAdminComponent implements OnInit {
  @ViewChild('EditEventModal') EditEventModal: TemplateRef<any>;
  @ViewChild('BulkEventModal') BulkEventModal: TemplateRef<any>; 
  loadingIndicator: boolean = false;

  // Data variables
  EventRegisterationData: any[] = [];
  filteredEventRegisterationData: any[] = [];
  allSchoolDivisions: any[] = [];
  properties: string[] = [];
  OBPOptions = [
    "Gender Equality**",
    "Local Community Development",
    "Birth & Death Anniversaries of Great Personalities",
    "Environment and Sustainability Events",
    "Human Values & Professional Ethics",
    "Industry Academia Innovative Practices",
    "Extension Activities in Neighborhood Relevant to Discipline",
    "Student Capability Enhancements",
    "Waste Management",
    "Fundamental Duties and Rights & National Identity & Symbols",
    "Days Celebrations",
    "Off-Campus Participation for Technical Events (Including IPR)",
    "Professional Chapter",
    "Sustainability Development Goals (SDGs)",
    "Guinness World Records",
    "Inclusivity and Quality Education",
  ];

  // UI state variables
  currentEventId: any = '';
  isLoginFailed = false;
  filterText = '';
  recordsPerPage = 10;
  currentPage = 1;
  formInitialized = false;

  formdata: FormGroup;
  Reason: any;
  showNoDataFoundMessage: boolean;
  maxId: number;
  allPlannerSessionDatas: any;
  items: any;
  responses: any;

  // Excel Upload related properties
  fileName: string = 'Events_Upload_ExcelData.xlsx'; 
  filePath: string = `assets/uploads/${this.fileName}`;
  file: any; // The actual file object
  uploadedDataRaw: any[] = []; // Raw data from Excel, used for sending to backend
  uploadedDataForDisplay: any[] = []; // Formatted data for UI display
  validationErrors: string[] = [];
  errorCells: { rowIndex: number, cellIndex: number }[] = [];
  createdBy: any; // Assuming this is set elsewhere, e.g., from user session
  today:any;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private eventService: LpuEventManagementService,
    private plannerService: LpuPlannerServiceService,
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private MouDocumentsService: MouDocumentsService, 
  ) {}

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Event <span class="themeClr" >Registeration Admin</span> Page';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];

         const now = new Date();
  this.today = now.toISOString().split('T')[0];

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
    // Initialize createdBy if not already done
    this.createdBy = this.storageService.getUser()?.username || 'Admin'; // Example
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.initializeForm();
        this.loadSchoolDivisions();
        this.loadEventData();
        this.getOBPProperties();
        this.getSchoolData();
        this.GetAllEventsData();
        this.getAllProperties();
        this.getAllPlannerSession();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
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

  OBPOptionsitems: any;
  propertiess: any[] = [];
  getAllProperties(): void {
    this.eventService.GetOBPProperties().subscribe({
      next: response => {
        if (response.item1) {
          this.OBPOptionsitems = response.item1;
          this.OBPOptionsitems.forEach((PropertiesData: { items: string; }) => {
            this.propertiess.push(PropertiesData.items);
          });
        }
      }
    });
  }

  allPlannerSessions: any[] = [];
  getAllPlannerSession(): void {
    this.eventService.GetCurrentPlannerSession().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
          this.items = response.item1;
          this.maxId = +this.items[0].id; // convert to number safely
          this.getAllPlannerSessionforReport();
        }
      }
    });
  }

  getAllPlannerSessionforReport(): void {
    this.MouDocumentsService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1 && this.items?.length > 0) {
          this.allPlannerSessionDatas = response.item1.filter(
            (session: { id: string | number }) => +session.id >= 16 && +session.id <= this.maxId
          );
        }
      }
    });
  }

  GetAllEventsData(): void {
    this.loadingIndicator = true;
    this.eventService.GetAllEventsDetails().subscribe({
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

  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('EventCalender');
    if (element) {
      element.hidden = true;
    }
  }

  initializeForm(): void {
    this.formdata = this.fb.group({
      schoolname: ['', Validators.required],
      EventObjective: ['', Validators.required],
      eventName: ['', Validators.required],
      eventCalender: ['', Validators.required],
      totalStudent: ['', [Validators.required, Validators.min(1)]],
      obpCriteria: ['', Validators.required],
      Mode: ['', Validators.required],
      External: ['', Validators.required],
      internal: ['', Validators.required],
      category: ['', Validators.required],
      semester: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      BudgetType: ['Select', Validators.required],
      Totalbudget: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      Remarks: [''],
      SessionId:['',]
    });

    this.formdata.get('BudgetType')?.valueChanges.subscribe(val => {
      const budgetControl = this.formdata.get('Totalbudget');
      val === 'Select' ? budgetControl?.disable() : budgetControl?.enable();
    });

    this.formInitialized = true;
  }

  loadEventData(): void {
    this.eventService.GetAllEventsDetails().subscribe({
      next: (response) => {
        this.EventRegisterationData = response.item1 || [];
        this.filteredEventRegisterationData = [...this.EventRegisterationData];
      },
      error: (err) => {
        this.isLoginFailed = true;
        Swal.fire('Error', 'Failed to load event data', 'error');
      }
    });
  }

  loadSchoolDivisions(): void {
    this.plannerService.GetSchoolDivisions().subscribe({
      next: (response) => {
        this.allSchoolDivisions = response.item1 || [];
      },
      error: (err) => {
        Swal.fire('Error', 'Failed to load school divisions', 'error');
      }
    });
  }

  getOBPProperties(): void {
    this.eventService.GetOBPProperties().subscribe({
        next: (response) => {
            this.properties = response.item1?.map((x: { items: any; }) => x.items) || this.OBPOptions;
        },
        error: (err) => {
            Swal.fire('Error', 'Failed to load OBP properties', 'error');
        }
    });
  }

  EventNameValue:any;
  EditEventDetails(eventData: any): void {
    if (!this.formInitialized) {
        this.initializeForm();
    }
    this.currentEventId = eventData.id;
    let obpCriteriaValue = this.properties.find(
      prop => prop.toLowerCase().trim() == eventData.obpCriteria?.toLowerCase().trim()
    ) || '';
    this.EventNameValue= eventData.eventName;
    this.formdata.patchValue({
        schoolname: eventData.schoolId,
        EventObjective: eventData.eventObjective,
        eventName: eventData.eventName,
        eventCalender: eventData.eventType,
        totalStudent: eventData.alternativelyStudentCounts,
        obpCriteria: obpCriteriaValue, 
        Mode: eventData.modeOfConduct,
        External: eventData.externalLevel,
        internal: eventData.internalLevel,
        category: eventData.categoryId,
        semester: eventData.semester,
        startDate: this.formatDateForInput(eventData.startDate),
        endDate: this.formatDateForInput(eventData.endDate),
        BudgetType: eventData.budgetType,
        Totalbudget: eventData.budgetAmount,
        Remarks: eventData.remarks,
        SessionId: eventData.sessionId
    });

    this.modalService.open(this.EditEventModal, { size: 'lg', backdrop: 'static' });
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().substring(0, 10);
    } catch {
      return '';
    }
  }

  Onsubmit(): void {
    if (this.formdata.invalid || this.currentEventId =='' || this.currentEventId==0 ) {
      this.markFormGroupTouched(this.formdata);
      return;
    }

    const formValue = this.formdata.getRawValue();

    const formDataX = new FormData();
    formDataX.append('Id', this.currentEventId.toString());
    formDataX.append('SchoolId', formValue.schoolname);
    formDataX.append('EventObjective', formValue.EventObjective);
    formDataX.append('EventName', formValue.eventName);
    formDataX.append('EventType', formValue.eventCalender);
    formDataX.append('AlternativelyStudentCounts', formValue.totalStudent);
    formDataX.append('OBPCriteria', formValue.obpCriteria);
    formDataX.append('ModeOfConduct', formValue.Mode);
    formDataX.append('ExternalLevel', formValue.External);
    formDataX.append('InternalLevel', formValue.internal);
    formDataX.append('CategoryId', formValue.category);
    formDataX.append('Semester', formValue.semester);
    formDataX.append('StartDate', formValue.startDate);
    formDataX.append('EndDate', formValue.endDate);
    formDataX.append('BudgetType', formValue.BudgetType);
    formDataX.append('BudgetAmount', formValue.Totalbudget);
    formDataX.append('Remarks', formValue.Remarks || '');
    formDataX.append('SessionId', formValue.SessionId || '');

    this.eventService.UpdateEventDetailsforGivenId(formDataX).subscribe((response) => {
      if (response.item1.length > 0) {
        this.responses = response.item1[0];
        if (this.responses.returnData === '-1') {
          Swal.fire(
            { title: 'No Event Found ', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (this.responses.returnData === 'success') {
          Swal.fire(
            { title: 'Event Updated Successfully: ', text: this.responses.returnData, icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2200);
        } else {
          Swal.fire(
            { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getDivisionNameById(id: number): string {
    const school = this.allSchoolDivisions.find(x => x.id === id.toString());
    return school ? school.schoolDivision : `School ID ${id}`;
  }

  filterData(): void {
    const searchTerm = this.filterText.toLowerCase();
    this.filteredEventRegisterationData = this.EventRegisterationData.filter(event =>
      Object.values(event).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );
    this.currentPage = 1; // Reset to first page when filtering
  }

  getRecordsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    return this.filteredEventRegisterationData.slice(startIndex, startIndex + this.recordsPerPage);
  }

  ChangeApproveStatus(Id: any) {
    const formData = new FormData();
    formData.append('Id', Id);
    formData.append('Action', 'Approve');

    Swal.fire({
      title: "Reason for Delete",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('Id', Id);
        formData.append('DisapprovalReason', this.Reason);
        formData.append('Action', 'Approve');
        this.handleStatusChange(formData, 'Approve');
      } else {
        this.showCancelledSwal();
      }
    });
  }

  private handleStatusChange(formData: FormData, action: string) {
    this.eventService.ChangeStatus(formData).subscribe((data: any) => {
      if (action === 'Approve' && data.responseData === 'Cancel') {
        Swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        Swal.fire(
          'Record Deleted successfully !',
          '',
          'success'
        ).then(() => {
          window.location.reload();
        });
      }
    });
  }

  private showCancelledSwal() {
    Swal.fire(
      'Cancelled',
      ' ',
      'error'
    );
  }

  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
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
        ModeOfConduct: item.modeOfConduct,
        EventType: item.eventType,
        Semester: item.semester,
        InternalLevel: item.internalLevel,
        ExternalLevel: item.externalLevel, 
        StartDate: this.formatDate(item.startDate),
        EndDate: this.formatDate(item.endDate),
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

  // Pagination logic
  totalPages(): number {
    return Math.ceil(this.filteredEventRegisterationData.length / this.recordsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
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

  // applyAdvancedSearch(): void {
  //   this.loadingIndicator=true;
  //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
  //     if (this.advancedSearch.sessionId && 
  //       this.advancedSearch.sessionId !== '' && 
  //       this.advancedSearch.sessionId !== '0' && 
  //       item.sessionId.toString() !== this.advancedSearch.sessionId) {
  //       return false;
  //     }
  //          // Event Category filter eventType added on 4-sep-25
  //    if (this.advancedSearch.eventType && item.eventType !== this.advancedSearch.eventType) {
  //     return false;
  //   }
  //     if (this.advancedSearch.schoolName && 
  //         !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.eventName && 
  //         !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.objective && 
  //         !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
  //       return false;
  //     }
  
  //     if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
  //       return false;
  //     }
  
  //     const itemStartDate = item.startDate ? new Date(item.startDate) : null;
  //     const itemEndDate = item.endDate ? new Date(item.endDate) : null;
  
  //     if (this.advancedSearch.startDate) {
  //       const startDate = new Date(this.advancedSearch.startDate);
  //       if (!itemStartDate || itemStartDate < startDate) {
  //         return false;
  //       }
  //     }
  
  //     if (this.advancedSearch.endDate) {
  //       const endDate = new Date(this.advancedSearch.endDate);
  //       if (!itemEndDate || itemEndDate > endDate) {
  //         return false;
  //       }
  //     }

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
  
  //   if (this.paginator) {
  //     this.paginator.firstPage();
  //   }
  //   setTimeout(() => {
  //     this.loadingIndicator = false;
  //   }, 2500);
  // }
      
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
      if (
        this.advancedSearch.objective &&
        !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())
      ) {
        return false;
      }
  
      if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
        return false;
      }
  
      if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
        return false;
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
  
  showAdvancedSearch = false ;
  showDateSearch =false;
   
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (!this.showAdvancedSearch) {
      this.resetAdvancedSearch();
    }
  }

  DateSearch: any;
  hasAnyDateSearch: boolean=false;
  toggleDateSearch(): void {
    this.showDateSearch = !this.showDateSearch;
    if (!this.showDateSearch) {
      this.resetDateSearch();
    }
  }
  
  resetDateSearch(): void {
    this.DateSearch = {
      startDate: null,
      endDate: null,
    };
    this.hasAnyDateSearch = false;
    this.filteredEventRegisterationData = [...this.EventRegisterationData];
  }
  
  hasAnySearchCriteria = false;
  
  checkSearchCriteria(): void {
    // this.loadingIndicator = true;
    this.hasAnySearchCriteria = Object.values(this.advancedSearch).some(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      return true; // For dates and other types
    });
    // setTimeout(() => {
    //   this.loadingIndicator = false;
    // }, 2500);
  }

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
  
  UploadExcelData(){
    // Clear previous data and errors when opening the modal
    this.file = null;
    this.uploadedDataRaw = [];
    this.uploadedDataForDisplay = [];
    this.validationErrors = [];
    this.errorCells = [];
    this.modalService.open(this.BulkEventModal, { size: 'lg', backdrop: 'static' });
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
}




// import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
// import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { AuthService } from 'src/app/_services/auth.service';
// import { LpuEventManagementService } from 'src/app/_services/lpu-event-management.service';
// import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';
// interface SessionName {
//   id: number;
//   session: string;
// }



// @Component({
//   selector: 'app-content',
//   templateUrl: './contentAdmin.component.html',
//   styleUrls: ['./contentAdmin.component.scss']
// })
// export class ContentAdminComponent implements OnInit {
//   @ViewChild('EditEventModal') EditEventModal: TemplateRef<any>;
//   @ViewChild('BulkEventModal') BulkEventModal: TemplateRef<any>; 
//   loadingIndicator: boolean =false;
//   // Data variables
//   EventRegisterationData: any[] = [];
//   filteredEventRegisterationData: any[] = [];
//   allSchoolDivisions: any[] = [];
//   properties: string[] = [];
//   OBPOptions = [
//     "Gender Equality**",
//     "Local Community Development",
//     "Birth & Death Anniversaries of Great Personalities",
//     "Environment and Sustainability Events",
//     "Human Values & Professional Ethics",
//     "Industry Academia Innovative Practices",
//     "Extension Activities in Neighborhood Relevant to Discipline",
//     "Student Capability Enhancements",
//     "Waste Management",
//     "Fundamental Duties and Rights & National Identity & Symbols",
//     "Days Celebrations",
//     "Off-Campus Participation for Technical Events (Including IPR)",
//     "Professional Chapter",
//     "Sustainability Development Goals (SDGs)",
//     "Guinness World Records",
//     "Inclusivity and Quality Education",
//   ];

//   // UI state variables
//   currentEventId: any='';
//   isLoginFailed = false;
//   filterText = '';
//   recordsPerPage = 10;
//   currentPage = 1;
//   formInitialized = false;

//   formdata: FormGroup;
//   Reason: any;
//   showNoDataFoundMessage: boolean;
//   maxId: number;
//   allPlannerSessionDatas: any;
//   items: any;
//   responses: any;

//   constructor(
//     private fb: FormBuilder,
//     private modalService: NgbModal,
//     private eventService: LpuEventManagementService,
//     private plannerService: LpuPlannerServiceService,
//     private storageService: StorageService,
//     private authService: AuthService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private lpuPlannerServiceService: LpuPlannerServiceService,
//     private MouDocumentsService: MouDocumentsService, 
//   ) {}

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
//         this.initializeForm();
//         this.loadSchoolDivisions();
//         this.loadEventData();
//         this.getOBPProperties();
//         this.getSchoolData();
//         this.GetAllEventsData();
//         this.getAllProperties();
//         this.getAllPlannerSession();
//       },
//       error: _err => {
//         this.LoginFailed(_err);
//       }
//     });
//   }
//     getSchoolData(): void {
//     this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.allSchoolDivisions = response.item1;
//       } else {
//         this.allSchoolDivisions = [];
//       }
//     });
//   }

//   OBPOptionsitems: any;
//   PropertiesData: any[] = []; chunkedProperties: any[][] = [];
//   propertiess: any[] = [];
//   getAllProperties(): void {
//     this.eventService.GetOBPProperties().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.OBPOptionsitems = response.item1;
//           this.OBPOptionsitems.forEach((PropertiesData: { items: string; }) => {
//             this.propertiess.push(PropertiesData.items);
//           });
//         }
//       }
//     });
//   }
//   allPlannerSessions: any[] = [];
//   selectedPlannerSession: any = '0';  // default selected value
//   selectedPlannerSessionData: any = '0';  // default selected value
//   allOBPStaffData: any[] = [];
//   getAllPlannerSession(): void {
//     this.eventService.GetCurrentPlannerSession().subscribe({
//       next: response => {
//         if (response.item1) {
//           this.allPlannerSessions = response.item1;
//           this.items = response.item1;
//           // this.allPlannerSessions=this.items.filter(session => +session.id > 16);
//           // console.log(JSON.stringify(this.items))
//           this.maxId = +this.items[0].id; // convert to number safely
//           this.getAllPlannerSessionforReport();
//         }
//       }
//     });

//   }
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
//   GetAllEventsData(): void {
//     this.loadingIndicator = true;
//     this.eventService.GetAllEventsDetails().subscribe({
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
//     setTimeout(() => {
//       this.loadingIndicator = false;
//     }, 2500);

//   }

//   LoginFailed(_NewError: any) {
//     this.isLoginFailed = true;
//     Swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are Invalid!',
//       icon: 'warning',
//     })
//     const element = document.getElementById('EventCalender');
//     if (element) {
//       element.hidden = true;
//     }
//   }
//   initializeForm(): void {
//     this.formdata = this.fb.group({
//       schoolname: ['', Validators.required],
//       EventObjective: ['', Validators.required],
//       eventName: ['', Validators.required],
//       eventCalender: ['', Validators.required],
//       totalStudent: ['', [Validators.required, Validators.min(1)]],
//       obpCriteria: ['', Validators.required],
//       Mode: ['', Validators.required],
//       External: ['', Validators.required],
//       internal: ['', Validators.required],
//       category: ['', Validators.required],
//       semester: ['', Validators.required],
//       startDate: ['', Validators.required],
//       endDate: ['', Validators.required],
//       BudgetType: ['Select', Validators.required],
//       Totalbudget: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
//       Remarks: [''],
//       SessionId:['',]
//     });

//     this.formdata.get('BudgetType')?.valueChanges.subscribe(val => {
//       const budgetControl = this.formdata.get('Totalbudget');
//       val === 'Select' ? budgetControl?.disable() : budgetControl?.enable();
//     });

//     this.formInitialized = true;
//   }

//   loadEventData(): void {
//     this.eventService.GetAllEventsDetails().subscribe({
//       next: (response) => {
//         this.EventRegisterationData = response.item1 || [];
//         this.filteredEventRegisterationData = [...this.EventRegisterationData];
//       },
//       error: (err) => {
//         this.isLoginFailed = true;
//         Swal.fire('Error', 'Failed to load event data', 'error');
//       }
//     });
//   }

//   loadSchoolDivisions(): void {
//     this.plannerService.GetSchoolDivisions().subscribe({
//       next: (response) => {
//         this.allSchoolDivisions = response.item1 || [];
//       },
//       error: (err) => {
//         Swal.fire('Error', 'Failed to load school divisions', 'error');
//       }
//     });
//   }

//   getOBPProperties(): void {
//     this.eventService.GetOBPProperties().subscribe({
//         next: (response) => {
//             this.properties = response.item1?.map((x: { items: any; }) => x.items) || this.OBPOptions;
//             // console.log(this.properties); // Log the properties to check the values
//         },
//         error: (err) => {
//             Swal.fire('Error', 'Failed to load OBP properties', 'error');
//         }
//     });
// }

// EditEventDetails(eventData: any): void {
//   if (!this.formInitialized) {
//       this.initializeForm();
//   }
//   this.currentEventId = eventData.id;
//   let obpCriteriaValue = this.properties.find(
//     prop => prop.toLowerCase().trim() == eventData.obpCriteria?.toLowerCase().trim()
//   ) || ''; // fallback to empty string if not matched

//   this.formdata.patchValue({
//       schoolname: eventData.schoolId,
//       EventObjective: eventData.eventObjective,
//       eventName: eventData.eventName,
//       eventCalender: eventData.eventType,
//       totalStudent: eventData.alternativelyStudentCounts,
//       obpCriteria: obpCriteriaValue, 
//       Mode: eventData.modeOfConduct,
//       External: eventData.externalLevel,
//       internal: eventData.internalLevel,
//       category: eventData.categoryId,
//       semester: eventData.semester,
//       startDate: this.formatDateForInput(eventData.startDate),
//       endDate: this.formatDateForInput(eventData.endDate),
//       BudgetType: eventData.budgetType,
//       Totalbudget: eventData.budgetAmount,
//       Remarks: eventData.remarks,
//       SessionId: eventData.sessionId
//   });

//   // console.log(JSON.stringify(eventData) + "Seleected EVent details"); // Log the form values to check if obpCriteria is set correctly

//   this.modalService.open(this.EditEventModal, { size: 'lg', backdrop: 'static' });
// }



//   private formatDateForInput(dateString: string): string {
//     if (!dateString) return '';
//     try {
//       const date = new Date(dateString);
//       return date.toISOString().substring(0, 10);
//     } catch {
//       return '';
//     }
//   }

//   Onsubmit(): void {
//     if (this.formdata.invalid || this.currentEventId =='' || this.currentEventId==0 ) {

//       this.markFormGroupTouched(this.formdata);
//       return;
//     }

//     const formValue = this.formdata.getRawValue();

//   const formDataX = new FormData();
//   formDataX.append('Id', this.currentEventId.toString());
//   formDataX.append('SchoolId', formValue.schoolname);
//   formDataX.append('EventObjective', formValue.EventObjective);
//   formDataX.append('EventName', formValue.eventName);
//   formDataX.append('EventType', formValue.eventCalender);
//   formDataX.append('AlternativelyStudentCounts', formValue.totalStudent);
//   formDataX.append('OBPCriteria', formValue.obpCriteria);
//   formDataX.append('ModeOfConduct', formValue.Mode);
//   formDataX.append('ExternalLevel', formValue.External);
//   formDataX.append('InternalLevel', formValue.internal);
//   formDataX.append('CategoryId', formValue.category);
//   formDataX.append('Semester', formValue.semester);
//   formDataX.append('StartDate', formValue.startDate);
//   formDataX.append('EndDate', formValue.endDate);
//   formDataX.append('BudgetType', formValue.BudgetType);
//   formDataX.append('BudgetAmount', formValue.Totalbudget);
//   formDataX.append('Remarks', formValue.Remarks || '');
//   formDataX.append('SessionId', formValue.SessionId || '');

//     this.eventService.UpdateEventDetailsforGivenId(formDataX).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.responses = response.item1[0];
//         if (this.responses.returnData === '-1') {
//           Swal.fire(
//             { title: 'No Event Found ', icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         } else if (this.responses.returnData === 'success') {
//           Swal.fire(
//             { title: 'Event Updated Successfully: ', text: this.responses.returnData, icon: 'success' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2200);
//         } else {
//           Swal.fire(
//             { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         }
//       }
//     });
//   }

//   private markFormGroupTouched(formGroup: FormGroup): void {
//     Object.values(formGroup.controls).forEach(control => {
//       control.markAsTouched();
//       if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       }
//     });
//   }

//   getDivisionNameById(id: number): string {
//     const school = this.allSchoolDivisions.find(x => x.id === id.toString());
//     return school ? school.schoolDivision : `School ID ${id}`;
//   }

//   filterData(): void {
//     const searchTerm = this.filterText.toLowerCase();
//     this.filteredEventRegisterationData = this.EventRegisterationData.filter(event =>
//       Object.values(event).some(value =>
//         String(value).toLowerCase().includes(searchTerm)
//       )
//     );
//     this.currentPage = 1; // Reset to first page when filtering
//   }

//   getRecordsForCurrentPage(): any[] {
//     const startIndex = (this.currentPage - 1) * this.recordsPerPage;
//     return this.filteredEventRegisterationData.slice(startIndex, startIndex + this.recordsPerPage);
//   }

  
//   ChangeApproveStatus(Id: any) {
//     const formData = new FormData();
//     formData.append('Id', Id);
//     formData.append('Action', 'Approve');

//     Swal.fire({
//       title: "Reason for Delete",
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
//     this.eventService.ChangeStatus(formData).subscribe((data: any) => {
//       if (action === 'Approve' && data.responseData === 'Cancel') {
//         Swal.fire(
//           'No Change!',
//           ' ',
//           'error'
//         );
//       } else {
//         Swal.fire(
//           'Record Deleted successfully !',
//           '',
//           'success'
//         ).then(() => {
//           window.location.reload();
//         });
//       }
//     });
//   }

//   private showCancelledSwal() {
//     Swal.fire(
//       'Cancelled',
//       ' ',
//       'error'
//     );
//   }
//     formatDate(date: Date): string {
//     const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
//     return DateX;
//   }
//     exportToExcel(): void {
//     const fileName = 'EventDetails_report.xlsx';
//     const exportedData = this.filteredEventRegisterationData.map(item => {
//       return {
//         Objective: item.eventObjective,
//         SchoolDivision: this.getDivisionNameById(item.schoolId),
//         EventName: item.eventName,
//         ObpCriteria: item.obpCriteria,
//         StudentCount: item.alternativelyStudentCounts,
//         Category: item.categoryId,
//         // eventPirority: item.eventPirority,
//         ModeOfConduct: item.modeOfConduct,
//         EventType: item.eventType,
//         Semester: item.semester,
//         InternalLevel: item.internalLevel,
//         ExternalLevel: item.externalLevel, 
//         StartDate: this.formatDate(item.startDate),
//         EndDate: this.formatDate(item.endDate),
//         BudgetAmount: item.budgetAmount,
//         BudgetType: item.budgetType,
//         Remarks: item.remarks,
//       };
//     });
//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

//     const wscols = [
//       { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }, { wpx: 400 }
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
//   // Pagination logic
//   totalPages(): number {
//     return Math.ceil(this.filteredEventRegisterationData.length / this.recordsPerPage);
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages()) {
//       this.currentPage++;
//     }
//   }

//   prevPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   setPageSize(size: number): void {
//     this.recordsPerPage = size;
//     this.currentPage = 1; // Reset to first page when changing page size
//   }

//  // added on 19-July-25
//   // Paginator reference
//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//     advancedSearch = {
//       sessionId: '',
//       schoolName: '',
//       semester: '',
//       eventName: '',
//       objective: '',
//       eventCategory: '',
//       obpCriteria: '',
//       internal:'',
//       startDate: null as Date | null,
//       endDate: null as Date | null
//     };
//     applyAdvancedSearch(): void {
//       this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
//         // Session ID filter
//         if (this.advancedSearch.sessionId && 
//           this.advancedSearch.sessionId !== '' && 
//           this.advancedSearch.sessionId !== '0' && 
//           item.sessionId.toString() !== this.advancedSearch.sessionId) {
//           return false;
//         }
        
//         // School Name filter
//         if (this.advancedSearch.schoolName && 
//             !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
//           return false;
//         }
    
//         // Semester filter
//         if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
//           return false;
//         }
    
//         // Event Name filter
//         if (this.advancedSearch.eventName && 
//             !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
//           return false;
//         }
    
//         // Objective filter
//         if (this.advancedSearch.objective && 
//             !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
//           return false;
//         }
    
//         // Event Category filter
//         if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
//           return false;
//         }
    
//         // OBP Criteria filter
//         if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
//           return false;
//         }
    
//         // Start Date filter
//         const itemStartDate = item.startDate ? new Date(item.startDate) : null;
//         const itemEndDate = item.endDate ? new Date(item.endDate) : null;
    
//         // Check if start date is provided and filter accordingly
//         if (this.advancedSearch.startDate) {
//           const startDate = new Date(this.advancedSearch.startDate);
//           if (!itemStartDate || itemStartDate < startDate) {
//             return false;
//           }
//         }
    
//         // Check if end date is provided and filter accordingly
//         if (this.advancedSearch.endDate) {
//           const endDate = new Date(this.advancedSearch.endDate);
//           if (!itemEndDate || itemEndDate > endDate) {
//             return false;
//           }
//         }
    
//         // Ensure the event is included if it falls within the date range
//         if (this.advancedSearch.startDate || this.advancedSearch.endDate) {
//           const startDateCondition = this.advancedSearch.startDate ? 
//             (itemStartDate ? itemStartDate >= new Date(this.advancedSearch.startDate) : false) : true;
//           const endDateCondition = this.advancedSearch.endDate ? 
//             (itemEndDate ? itemEndDate <= new Date(this.advancedSearch.endDate) : false) : true;
    
//           if (!startDateCondition || !endDateCondition) {
//             return false;
//           }
//         }
    
//         return true;
//       });
    
//       // Reset paginator to first page
//       if (this.paginator) {
//         this.paginator.firstPage();
//       }
//     }
        
//     // applyAdvancedSearch(): void {
//     //   this.filteredEventRegisterationData = this.EventRegisterationData.filter(item => {
//     //     if (this.advancedSearch.sessionId && 
//     //       this.advancedSearch.sessionId !== '' && 
//     //       this.advancedSearch.sessionId !== '0' && 
//     //       item.sessionId.toString() !== this.advancedSearch.sessionId) {
//     //     return false;
//     //   }
//     //     // School Name filter
//     //     if (this.advancedSearch.schoolName && 
//     //         !this.getDivisionNameById(item.schoolId).toLowerCase().includes(this.advancedSearch.schoolName.toLowerCase())) {
//     //       return false;
//     //     }
  
//     //     // Semester filter
//     //     if (this.advancedSearch.semester && item.semester !== this.advancedSearch.semester) {
//     //       return false;
//     //     }
  
//     //     // Event Name filter
//     //     if (this.advancedSearch.eventName && 
//     //         !item.eventName.toLowerCase().includes(this.advancedSearch.eventName.toLowerCase())) {
//     //       return false;
//     //     }
  
//     //     // Objective filter
//     //     if (this.advancedSearch.objective && 
//     //         !(item.eventObjective || '').toLowerCase().includes(this.advancedSearch.objective.toLowerCase())) {
//     //       return false;
//     //     }
  
//     //     // Event Category filter
//     //     if (this.advancedSearch.eventCategory && item.eventType !== this.advancedSearch.eventCategory) {
//     //       return false;
//     //     }
  
//     //     // OBP Criteria filter
//     //     if (this.advancedSearch.obpCriteria && item.obpCriteria !== this.advancedSearch.obpCriteria) {
//     //       return false;
//     //     }
  
//     //     // Start Date filter
//     //     if (this.advancedSearch.startDate) {
//     //       const itemStartDate = item.startDate ? new Date(item.startDate) : null;
//     //       if (!itemStartDate || itemStartDate < new Date(this.advancedSearch.startDate)) {
//     //         return false;
//     //       }
//     //     }
  
//     //     // End Date filter
//     //     if (this.advancedSearch.endDate) {
//     //       const itemEndDate = item.endDate ? new Date(item.endDate) : null;
//     //       if (!itemEndDate || itemEndDate > new Date(this.advancedSearch.endDate)) {
//     //         return false;
//     //       }
//     //     }
  
//     //     return true;
//     //   });
  
//     //   // Reset paginator to first page
//     //   if (this.paginator) {
//     //     this.paginator.firstPage();
//     //   }
//     // }
  
//     // Reset advanced search
//     resetAdvancedSearch(): void {
//       this.advancedSearch = {
//         sessionId: '',
//         schoolName: '',
//         semester: '',
//         eventName: '',
//         objective: '',
//         eventCategory: '',
//         obpCriteria: '',
//         internal:'',
//         startDate: null,
//         endDate: null
//       };
//       this.hasAnySearchCriteria = false;
//       this.filteredEventRegisterationData = [...this.EventRegisterationData];
//     }
  
  
  
//   // Add these properties to your component class
//   showAdvancedSearch = false;
   
//   // Add this method to toggle advanced search
//   toggleAdvancedSearch(): void {
//     this.showAdvancedSearch = !this.showAdvancedSearch;
//     if (!this.showAdvancedSearch) {
//       this.resetAdvancedSearch();
//     }
//   }
  
//   // Add this property to track if any field has value
//   hasAnySearchCriteria = false;
  
//   // Add this method to check if any field has value
//   checkSearchCriteria(): void {
//     this.hasAnySearchCriteria = Object.values(this.advancedSearch).some(value => {
//       if (value === null || value === undefined) return false;
//       if (typeof value === 'string') return value.trim() !== '';
//       return true; // For dates and other types
//     });
//   }



//   // 22-July-25

//   // Add using Excel sheet 
//   fileName: string = 'Events_Upload_ExcelData.xlsx'; 
//   filePath: string = `assets/uploads/${this.fileName}`;
//   UniverstiesData: any; foundData: any; selectedFile: any;
//   universityForm: FormGroup; SchoolId: any; EventObjective: any;
//   ModeOfConduct: any; OBPCriteria: any; ExternalLevel: any; InternalLevel: any;
//   Semester: any; EventName: any; CategoryId: any; StartDate: any;
//   isActive: any; CoursesOffered: any; file: any; arrayBuffer: string | ArrayBuffer | null;
//   exceljsondata: unknown[]; uploadedData: any = ""; Pushexceldata: any[];
//   createdBy: any; CreatedBy: any;  UniversityId: any;
//   checkListDocs: any;
//   UniversityYear: any;
//   NominationDeadlineAutumn: any;
//   BudgetType: any;
//   BudgetAmount: any;
//   SessionId: any;
//   MobilitySpring: any;
//   NominationApplicationFormats: any;
//   FactSheetLink: any;
//   DocumentsRequired: any;
//   Remarks: any;
//   SemesterAcademicYear: any;
//   validationErrors: string[] = [];
//   errorCells: { rowIndex: number, cellIndex: number }[] = [];
//   CourseLink: any;

//   onFileChange(event: any): void {
//     if (event.target.files.length > 0) {
//       const file = event.target.files[0];
//       this.file = file;
//       if (file) {
//         this.readExcelFile(file);
//       }
//     }
//   }

//   readExcelFile(file: any) {
//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       const data = e.target.result;
//       const workbook = XLSX.read(data, { type: 'binary' });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       this.uploadedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       this.validateData();
//     };
//     reader.readAsArrayBuffer(file);
//   }

//   validateData() {
//     this.validationErrors = [];
//     this.errorCells = [];
//     this.uploadedData.forEach((row: any, rowIndex: number) => {
//       if (rowIndex === 0) return; // Skip header row
//       let errorMessages = [];
//       if (isNaN(row[4])) {
//         errorMessages.push('Must be a number');
//         this.errorCells.push({ rowIndex, cellIndex: 4 });
//       }
//       if (isNaN(row[14])) {
//         errorMessages.push('Must be a number');
//         this.errorCells.push({ rowIndex, cellIndex: 14 });
//       }
//       this.validationErrors[rowIndex] = errorMessages.join(', ');
//     });
//   }

//   isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   hasErrors(): boolean {
//     return this.validationErrors.some(error => error.length > 0);
//   }

//   isError(rowIndex: number, cellIndex: number): boolean {
//     return this.errorCells.some(errorCell => errorCell.rowIndex === rowIndex && errorCell.cellIndex === cellIndex);
//   }

//   confirmUpload() {
//     this.Upload();
//   }
 
// // Upload() {
// //     var xmlString = '<dataset><data>';
// //     for (var i = 1; i < this.uploadedData.length; i++) {
// //         var element = this.uploadedData[i];
// //         var row = "<row>";
// //         row += "<SchoolId>" + this.getPropertyByIndex(element, 0) + "</SchoolId>";
// //         row += "<EventObjective>" + this.getPropertyByIndex(element, 1) + "</EventObjective>";
// //         row += "<EventName>" + this.getPropertyByIndex(element, 2) + "</EventName>";
// //         row += "<EventType>" + this.getPropertyByIndex(element, 3) + "</EventType>";
// //         row += "<AlternativelyStudentCounts>" + this.getPropertyByIndex(element, 4) + "</AlternativelyStudentCounts>";
// //         row += "<OBPCriteria>" + this.getPropertyByIndex(element, 5) + "</OBPCriteria>";
// //         row += "<ModeOfConduct>" + this.getPropertyByIndex(element, 6) + "</ModeOfConduct>";
// //         row += "<ExternalLevel>" + this.getPropertyByIndex(element, 7) + "</ExternalLevel>";
// //         row += "<InternalLevel>" + this.getPropertyByIndex(element, 8) + "</InternalLevel>";
// //         row += "<CategoryId>" + this.getPropertyByIndex(element, 9) + "</CategoryId>";
// //         row += "<Semester>" + this.getPropertyByIndex(element, 10) + "</Semester>";
// //         row += "<StartDate>" + this.getPropertyByIndex(element, 11) + "</StartDate>";
// //         row += "<EndDate>" + this.getPropertyByIndex(element, 12) + "</EndDate>"; // Fixed missing '>'
// //         row += "<BudgetType>" + this.getPropertyByIndex(element, 13) + "</BudgetType>";
// //         row += "<BudgetAmount>" + this.getPropertyByIndex(element, 14) + "</BudgetAmount>";
// //         row += "<Remarks>" + this.getPropertyByIndex(element, 15) + "</Remarks>";
// //         row += "<SessionId>" + this.getPropertyByIndex(element, 16) + "</SessionId>";      
// //         row += "</row>";
// //         xmlString += row;
// //     }
// //     xmlString += '</data></dataset>';
    
// //     var obj = {
// //         EventsDataXml: xmlString, // Changed from xmlEvents to EventsDataXml
// //         CreatedBy: this.createdBy
// //     };

// //     this.eventService.CreateEventsUsingExcelSheet(obj).subscribe((response) => {
// //         if (response.item1.length > 0) {
// //             this.responses = response.item1[0];
// //             if (this.responses.returnData === '-1') {
// //                 Swal.fire(
// //                     { title: 'Something went Wrong ', icon: 'error' }
// //                 ), setTimeout(() => {
// //                     window.location.reload();
// //                 }, 2200);
// //             } else if (this.responses.returnData === 'success') {
// //                 Swal.fire(
// //                     { title: 'All Events Details are added: ', text: this.responses.returnData, icon: 'success' }
// //                 ), setTimeout(() => {
// //                     window.location.reload();
// //                 }, 2000);
// //             } else if (this.responses.returnData === 'Failed') {
// //                 Swal.fire(
// //                     { title: 'All entries are Duplicate, Not Inserted ', text: this.responses.returnData, icon: 'error' }
// //                 ), setTimeout(() => {
// //                     window.location.reload();
// //                 }, 2200);
// //             }
// //         }
// //     });
// // }

// Upload() {
//   var xmlString = '<dataset><data>';
//   for (var i = 1; i < this.uploadedData.length; i++) {
//       var element = this.uploadedData[i];
//       var row = "<row>";
//       row += "<SchoolId>" + this.getPropertyByIndex(element, 0) + "</SchoolId>";
//       row += "<EventObjective>" + this.getPropertyByIndex(element, 1) + "</EventObjective>";
//       row += "<EventName>" + this.getPropertyByIndex(element, 2) + "</EventName>";
//       row += "<EventType>" + this.getPropertyByIndex(element, 3) + "</EventType>";
//       row += "<AlternativelyStudentCounts>" + this.getPropertyByIndex(element, 4) + "</AlternativelyStudentCounts>";
//       row += "<OBPCriteria>" + this.getPropertyByIndex(element, 5) + "</OBPCriteria>";
//       row += "<ModeOfConduct>" + this.getPropertyByIndex(element, 6) + "</ModeOfConduct>";
//       row += "<ExternalLevel>" + this.getPropertyByIndex(element, 7) + "</ExternalLevel>";
//       row += "<InternalLevel>" + this.getPropertyByIndex(element, 8) + "</InternalLevel>";
//       row += "<CategoryId>" + this.getPropertyByIndex(element, 9) + "</CategoryId>";
//       row += "<Semester>" + this.getPropertyByIndex(element, 10) + "</Semester>";

//       // Format StartDate and EndDate to YYYY-MM-DD
//       const startDate = this.formatDates(this.getPropertyByIndex(element, 11));
//       const endDate = this.formatDates(this.getPropertyByIndex(element, 12));
      
//       row += "<StartDate>" + startDate + "</StartDate>";
//       row += "<EndDate>" + endDate + "</EndDate>";
      
//       row += "<BudgetType>" + this.getPropertyByIndex(element, 13) + "</BudgetType>";
//       row += "<BudgetAmount>" + this.getPropertyByIndex(element, 14) + "</BudgetAmount>";
//       row += "<Remarks>" + this.getPropertyByIndex(element, 15) + "</Remarks>";
//       row += "<SessionId>" + this.getPropertyByIndex(element, 16) + "</SessionId>";      
//       row += "</row>";
//       xmlString += row;
//   }
//   xmlString += '</data></dataset>';
  
//   var obj = {
//       EventsDataXml: xmlString, // Changed from xmlEvents to EventsDataXml
//       CreatedBy: this.createdBy
//   };

//   this.eventService.CreateEventsUsingExcelSheet(obj).subscribe((response) => {
//       if (response.item1.length > 0) {
//           this.responses = response.item1[0];
//           if (this.responses.returnData === '-1') {
//               Swal.fire(
//                   { title: 'Something went Wrong ', icon: 'error' }
//               ), setTimeout(() => {
//                   window.location.reload();
//               }, 2200);
//           } else if (this.responses.returnData === 'success') {
//               Swal.fire(
//                   { title: 'All Events Details are added: ', text: this.responses.returnData, icon: 'success' }
//               ), setTimeout(() => {
//                   window.location.reload();
//               }, 2000);
//           } else if (this.responses.returnData === 'Failed') {
//               Swal.fire(
//                   { title: 'All entries are Duplicate, Not Inserted ', text: this.responses.returnData, icon: 'error' }
//               ), setTimeout(() => {
//                   window.location.reload();
//               }, 2200);
//           }
//       }
//   });
// }

// // Helper function to format date to YYYY-MM-DD
// formatDates(dateString: string): string {
//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

//   getPropertyByIndex(obj: any, index: number): any {
//     if (obj && Object.keys(obj).length > index) {
//       return obj[Object.keys(obj)[index]];
//     }
//     return '';
//   }
  
//   UploadExcelData(){
//     this.modalService.open(this.BulkEventModal, { size: 'lg', backdrop: 'static' });
//   }

// // Added on 23-July-25

// getSessionNameById(id: number): string {
//   const idStr = id;
//   let SessionName: SessionName | undefined;

//   for (const session of this.allPlannerSessionDatas) {
//     if (session.id == idStr) {
//       SessionName = session;
//       break;
//     }
//   }
//   return SessionName ? SessionName.session : `ID ${idStr} not found`;
// }

// }
