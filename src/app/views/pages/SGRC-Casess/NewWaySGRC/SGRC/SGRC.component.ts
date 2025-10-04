import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-SGRC-Casess',
  templateUrl: './SGRC-Casess.component.html',
  styleUrls: ['./SGRC-Casess.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SGRCComponent implements OnInit {
  @ViewChild('actionModal') actionModal: TemplateRef<any>;

  activeTab: 'all' | 'open' | 'closed' = 'all';

  loadingIndicator = false;
  columns: string[] = [];
  studentLists: any[] = [];
  filteredStudentLists: any[] = [];
  filteredStudentListsOpen: any[] = [];
  filteredStudentListsClosed: any[] = [];

  tmpStudentLists: any[] = [];
  tmpStudentListsOpen: any[] = [];
  tmpStudentListsClosed: any[] = [];

  searchQueries = {
    all: '',
    open: '',
    closed: '',
  };

  ticketNumberForAction: string = '';
  sgrcStatus: string = '';
  sgrcRemarks: string = '';
  isInputDisabled = false;

  constructor(
    private authService: AuthService,
     private route: ActivatedRoute,
    private storageService: StorageService,
    private agreementService: AgreementEntryService,
    private studentGrievanceLocalService: StudentGrievanceServicesLocalService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    alert(1);
     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'SGRC <span class="themeClr" >Cases</span>';
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];
    //   const dataTable = new DataTable("#dataTableExample");

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }

    
  }

  
  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {
      alert(0);   
        this.storageService.saveUser(data);
       this.loadCases();
      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
    // console.log("Closed Cases Lists " + JSON.stringify(this.studentClosedCasesRemarks)); Delete this line 5-feb-24
  }

  loadCases(): void {
    this.loadingIndicator = true;
       this.studentGrievanceLocalService.GetAllStudentsCases().subscribe((response) => {
      if (response.item1.length > 0) {
    // this.studentGrievanceLocalService.GetAllStudentsCases().subscribe({
    //   next: (response) => {
    //     if (response.item1.length > 0) {
          this.tmpStudentLists = response.item1;
          this.studentLists = [...this.tmpStudentLists];
          this.filteredStudentLists = [...this.studentLists];

          this.tmpStudentListsOpen = this.studentLists.filter(
            (x) => x.status === 'O'
          );
          this.filteredStudentListsOpen = [...this.tmpStudentListsOpen];

          this.tmpStudentListsClosed = this.studentLists.filter(
            (x) => x.status === 'C'
          );
          this.filteredStudentListsClosed = [...this.tmpStudentListsClosed];

          this.columns = Object.keys(this.studentLists[0]).filter(
            (col) => col !== 'fileName'
          );
        } else {
          this.studentLists = [];
          this.filteredStudentLists = [];
          this.filteredStudentListsOpen = [];
          this.filteredStudentListsClosed = [];
          this.columns = [];
        }
        this.loadingIndicator = false;
      })
      // error: () => {
      //   this.loadingIndicator = false;
      // },
  }
  
  onTabClick(tab: 'all' | 'open' | 'closed'): void {
    this.activeTab = tab;
    this.searchQueries[tab] = '';
    this.resetFilters();
  }

  resetFilters(): void {
    this.filteredStudentLists = [...this.tmpStudentLists];
    this.filteredStudentListsOpen = [...this.tmpStudentListsOpen];
    this.filteredStudentListsClosed = [...this.tmpStudentListsClosed];
  }

  onSearchChange(query: string): void {
    this.searchQueries[this.activeTab] = query.trim().toLowerCase();
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    const query = this.searchQueries[this.activeTab];
    if (!query) {
      this.resetFilters();
      return;
    }

    const filterFn = (item: any) =>
      Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        const valStr = String(val).toLowerCase();

        // Special handling for ticketNumber with SG- prefix
        if (
          valStr.includes(query) ||
          `sg-${valStr}`.includes(query)
        ) {
          return true;
        }
        return valStr.includes(query);
      });

    switch (this.activeTab) {
      case 'all':
        this.filteredStudentLists = this.tmpStudentLists.filter(filterFn);
        break;
      case 'open':
        this.filteredStudentListsOpen = this.tmpStudentListsOpen.filter(filterFn);
        break;
      case 'closed':
        this.filteredStudentListsClosed = this.tmpStudentListsClosed.filter(filterFn);
        break;
    }
  }

  exportToExcel(): void {
    const dataToExport =
      this.activeTab === 'all'
        ? this.filteredStudentLists
        : this.activeTab === 'open'
        ? this.filteredStudentListsOpen
        : this.filteredStudentListsClosed;

    const exportData = dataToExport.map((item) => ({
      studentName: item.name,
      email: item.email,
      phone: item.phone,
      description: item.description,
      TicketNo: item.ticketNumber,
      subject: item.subject,
      Nature: item.nature,
      createdOn: item.createdOn,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' })
    );
    link.download = 'casesData.xlsx';
    link.click();
  }

//   onSelectFile(row: any): void {
//     if (row.fileName) {
//       window.open(row.fileName, '_blank');
//     }
//   }

  onSelect(row: any): void {
    this.ticketNumberForAction = row.ticketNumber;
    this.sgrcStatus = '';
    this.sgrcRemarks = '';
    this.isInputDisabled = false;
    this.modalService.open(this.actionModal, { centered: true, size: 'sm' });
  }

  VerifyData(): void {
    if (!this.sgrcStatus) {
      swal.fire('SGRC', 'Please select status!', 'error');
      return;
    }
    if (!this.sgrcRemarks) {
      swal.fire('SGRC', 'Please enter remarks!', 'error');
      return;
    }

    this.isInputDisabled = true;
    const payload = {
      MasterId: this.ticketNumberForAction,
      Remarks: this.sgrcRemarks,
      Status: this.sgrcStatus,
    };

    this.agreementService.updateSGRCCases(payload).subscribe({
      next: () => {
        this.isInputDisabled = false;
        swal
          .fire('SGRC Cases', 'SGRC Case updated successfully!', 'success')
          .then(() => {
            this.loadCases();
            this.modalService.dismissAll();
          });
      },
      error: () => {
        this.isInputDisabled = false;
      },
    });
  }


  onSelectFile(row: any): void {
  if (row.fileName) {
    // If fileName is a URL, open in new tab
    window.open(row.fileName, '_blank');
  } else {
    // Optionally handle no file case
    swal.fire('No File', 'No file is available for download.', 'info');
  }
}

}
