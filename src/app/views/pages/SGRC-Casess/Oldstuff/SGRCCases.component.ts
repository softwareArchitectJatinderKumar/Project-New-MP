import { Component, ElementRef, OnInit, TemplateRef, ViewChild, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { DOCUMENT } from '@angular/common';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';
import swal from 'sweetalert2';

// Angular Material Imports
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// RxJS Imports for cleanup and filtering
import { fromEvent, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';

// Placeholder/Assumed Interfaces (Adjust paths as necessary)
// import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive'; 

// Define a strict interface for better type safety
export interface StudentCase {
  ticketNumber: string;
  name: string;
  phone: string;
  subject: string;
  nature: string;
  status: 'O' | 'C'; // 'O'pen or 'C'losed
  fileName: string | null;
  id: number; // Assuming an ID for fetching remarks
  [key: string]: any; // Allows for dynamic fields returned by the API
}

@Component({
  selector: 'app-SGRC-Casess',
  templateUrl: './SGRCcases.component.html', 
  styleUrls: ['./SGRCCases.scss']
})
export class SGRCCasesComponenent implements OnInit, AfterViewInit, OnDestroy {
    
  // --- Material Table ViewChildren ---
  @ViewChild('paginatorAll') paginatorAll!: MatPaginator;
  @ViewChild('sortAll') sortAll!: MatSort;
  
  @ViewChild('paginatorOpen') paginatorOpen!: MatPaginator;
  @ViewChild('sortOpen') sortOpen!: MatSort;

  @ViewChild('paginatorClose') paginatorClose!: MatPaginator;
  @ViewChild('sortClose') sortClose!: MatSort;

  @ViewChild('searchInputAll') searchInputAll!: ElementRef;
  @ViewChild('searchInputOpen') searchInputOpen!: ElementRef;
  @ViewChild('searchInputClose') searchInputClose!: ElementRef;

  @ViewChild('viewDescModal') viewDescModal!: TemplateRef<any>;
  @ViewChild('viewDescModal2') viewDescModal2!: TemplateRef<any>; 
    
  // --- Data Sources ---
  dataSourceAll = new MatTableDataSource<StudentCase>([]);
  dataSourceOpen = new MatTableDataSource<StudentCase>([]);
  dataSourceClose = new MatTableDataSource<StudentCase>([]);

  // --- Column Management ---
  dynamicColumns: string[] = []; 
  // Base columns, includes critical fields for initial render, updated after data load
  displayedColumnsAll: string[] = ['srno', 'ticketNumber', 'name', 'status', 'downloadFile', 'actions']; 
  displayedColumnsRemarks: string[] = ['status', 'remarks', 'entryBy'];
    
  // --- Data Storage ---
  studentLists: StudentCase[] = [];
  studentClosedCasesRemarks: any[] = []; 
  IdClosedCase: number | null = null; 

  // --- State Variables ---
  loadingIndicator: boolean = false;
  isInputDisabled: boolean = false;
  ticketNumbers: string = ''; 
  sgrcStatus: string = '';
  sgrcRemarks: string = '';
    
  private destroy$ = new Subject<void>(); 

  form!: FormGroup;
  MessageType: string[] = ['Grievance', 'Request', 'Feedback', 'Enquiry'];
  Block: string[] = ['BH1', 'BH1', 'BH1', 'BH1'];

  constructor(
    private Agreement: AgreementEntryService,
    private studendGservicelocal: StudentGrievanceServicesLocalService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document, // Use private access modifier
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
  ) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // ⚠️ CRITICAL FIX: Temporarily comment out direct DOM manipulation if you suspect it's causing the blank page.
    // If the page renders after commenting these, the element IDs are wrong or missing.
    // try {
    //     (this.document.getElementById('stMain') as HTMLInputElement).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
    //     (this.document.getElementById('imgLogo') as HTMLInputElement).style.width = '164px';
    // } catch (e) {
    //     console.warn('DOM elements stMain or imgLogo not found on load.');
    // }
    
    let loginName = this.route.snapshot.params['loginName'];

    // Reliable data fetching logic
    if (loginName) {
      this.getToken(loginName);
    } else {
      // Load data for existing authenticated users
      this.GetAllStudentsCases();
    }
  }

  ngAfterViewInit(): void {
    // The view children are guaranteed to be initialized here.
    if (this.paginatorAll) this.dataSourceAll.paginator = this.paginatorAll;
    if (this.sortAll) this.dataSourceAll.sort = this.sortAll;
    if (this.paginatorOpen) this.dataSourceOpen.paginator = this.paginatorOpen;
    if (this.sortOpen) this.dataSourceOpen.sort = this.sortOpen;
    if (this.paginatorClose) this.dataSourceClose.paginator = this.paginatorClose;
    if (this.sortClose) this.dataSourceClose.sort = this.sortClose;
    
    this.setupSearchFiltering(this.searchInputAll, this.dataSourceAll);
    this.setupSearchFiltering(this.searchInputOpen, this.dataSourceOpen);
    this.setupSearchFiltering(this.searchInputClose, this.dataSourceClose);
    
    const predicate = this.createFilterPredicate();
    this.dataSourceAll.filterPredicate = predicate;
    this.dataSourceOpen.filterPredicate = predicate;
    this.dataSourceClose.filterPredicate = predicate;
  }
    
  private createFilterPredicate() {
    return (data: StudentCase, filter: string) => {
      const dataStr = Object.values(data)
        .filter(value => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();
      return dataStr.includes(filter);
    };
  }

  private setupSearchFiltering(inputElement: ElementRef, dataSource: MatTableDataSource<any>): void {
    if (inputElement) {
      fromEvent(inputElement.nativeElement, 'keyup')
        .pipe(
          map((event: any) => event.target.value),
          debounceTime(300),
          takeUntil(this.destroy$)
        )
        .subscribe(value => {
          dataSource.filter = value.trim().toLowerCase();
        });
    }
  }
  
  applyFilter(event: Event) {
    // Necessary placeholder
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- API / Authentication ---

  getToken(id: any): void {
    this.authService.loginTemp(id).subscribe({
      next: () => {
        // Assuming saveUser(null) is the desired behavior post-loginTemp success
        this.storageService.saveUser(null); 
        this.GetAllStudentsCases();
      },
      error: err => {
        console.error('Login error:', err);
        // Show an error to the user if auth fails
        swal.fire({ title: 'Authentication Error', text: 'Could not log in using the provided token.', icon: 'error' });
      }
    });
  }
    
  GetAllStudentsCases(): void {
    this.loadingIndicator = true;
    this.studendGservicelocal.GetAllStudentsCases().subscribe({
      next: (response) => {
          // CRITICAL FIX: Check for response data existence before accessing properties
          if (response && response.item1 && response.item1.length > 0) { 
              this.studentLists = response.item1 as StudentCase[];
              
              // CRITICAL FIX: Setup columns ONLY when data is available
              this.setupDynamicColumns(this.studentLists);

              this.dataSourceAll.data = this.studentLists;
              this.dataSourceOpen.data = this.studentLists.filter(x => x.status === 'O');
              this.dataSourceClose.data = this.studentLists.filter(x => x.status === 'C');
              
              // Re-apply Paginator/Sort to bind new data
              this.applyPaginatorAndSort(); 

          } else {
            // console.log("No student cases returned by API.");
            this.studentLists = [];
            this.dataSourceAll.data = [];
            this.dataSourceOpen.data = [];
            this.dataSourceClose.data = [];
          }
          this.loadingIndicator = false;
      },
      error: (err) => {
          console.error("API Error fetching cases:", err);
          this.loadingIndicator = false;
          swal.fire({ title: 'API Error', text: 'Failed to fetch student cases.', icon: 'error' });
      }
    });
  }

  private applyPaginatorAndSort(): void {
      // Re-bind paginator/sort handles since data was updated asynchronously
      if (this.paginatorAll) this.dataSourceAll.paginator = this.paginatorAll;
      if (this.sortAll) this.dataSourceAll.sort = this.sortAll;
      if (this.paginatorOpen) this.dataSourceOpen.paginator = this.paginatorOpen;
      if (this.sortOpen) this.dataSourceOpen.sort = this.sortOpen;
      if (this.paginatorClose) this.dataSourceClose.paginator = this.paginatorClose;
      if (this.sortClose) this.dataSourceClose.sort = this.sortClose;
  }

  /**
   * Dynamically determines table columns based on the first data object.
   * This is a common source of runtime errors if not handled defensively.
   */
  private setupDynamicColumns(data: StudentCase[]): void {
    if (data.length === 0) return; 
    
    const excludedKeys = ['fileName', 'status', 'description', 'id', 'ticketNumber', 'name', 'phone', 'subject', 'nature'];
    const apiKeys = Object.keys(data[0]);

    this.dynamicColumns = apiKeys.filter(key => 
      !excludedKeys.includes(key)
    );

    // Reconstruct displayed columns array for the HTML table header
    this.displayedColumnsAll = [
        'srno', 
        'ticketNumber',
        'name',
        'phone',
        'subject',
        'nature',
        ...this.dynamicColumns, // Insert dynamic columns here
        'status', 
        'downloadFile',
        'actions'
    ];
  }
    
  // --- Action Handlers ---
  
  exportToExcel(): void {
    const fileName = 'student_grievance_all_cases.xlsx';
    const exportedData = this.dataSourceAll.data.map(item => ({
      'Ticket Number': item.ticketNumber,
      'Student Name': item.name,
      'Phone': item.phone,
      // Include all dynamic columns here if required, otherwise just use item.
      ...item 
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Cases');
    
    XLSX.writeFile(wb, fileName);
  }

  onSelectFile(a: StudentCase): void {
    const serverUrl = 'https://files.lpu.in/umsweb//Admission/StudentDocuments/';
    if (a.fileName) {
      window.open(serverUrl + a.fileName, '_blank');
    }
  }

  onSelect(a: StudentCase): void {
    this.ticketNumbers = a.ticketNumber;
    this.sgrcStatus = '';
    this.sgrcRemarks = '';
    this.isInputDisabled = false;
    this.modalService.open(this.viewDescModal, { centered: true }).result.catch(() => {});
  }

  onSelectClosedcases(a: StudentCase): void {
    this.IdClosedCase = a.id; 
    this.loadingIndicator = true;
    
    // Ensure we only proceed if we have a valid ID
    if (!this.IdClosedCase) {
        console.error("Cannot fetch remarks: Case ID is missing.");
        this.loadingIndicator = false;
        return;
    }
    
    this.studendGservicelocal.GetAllStudentsCasesRemarks(this.IdClosedCase).subscribe(
      (response) => {
        this.studentClosedCasesRemarks = response.item1 || [];
        this.loadingIndicator = false;
        this.modalService.open(this.viewDescModal2, { size: 'lg', centered: true }).result.catch(() => {});
      },
      (error) => {
        this.loadingIndicator = false;
        console.error("Error fetching remarks:", error);
        swal.fire({ title: 'Error', text: 'Failed to fetch case remarks.', icon: 'error' });
      }
    );
  }

  VerifyData(): void {
    this.isInputDisabled = true;
    if (this.sgrcStatus === '' || this.sgrcRemarks === '') {
      swal.fire({ title: 'SGRC', text: 'Please select status and enter remarks!', icon: 'error' });
      this.isInputDisabled = false;
      return;
    }

    const payload = {
      MasterId: this.ticketNumbers,
      Remarks: this.sgrcRemarks,
      Status: this.sgrcStatus
    };

    this.Agreement.updateSGRCCases(payload).subscribe({
      next: data => {
        this.isInputDisabled = false;
        swal.fire({ title: 'SGRC Cases', text: 'SGRC Case updated successfully!', icon: 'success' }).then(() => {
          // Re-fetch data instead of full page reload for better UX
          this.modalService.dismissAll();
          this.GetAllStudentsCases(); 
        });
      },
      error: err => {
        this.isInputDisabled = false;
        console.error('Update error:', err);
        swal.fire({ title: 'Error', text: 'Failed to update case.', icon: 'error' });
      }
    });
  }
}