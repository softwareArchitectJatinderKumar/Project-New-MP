
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-mou-documents-report',
  templateUrl: './mou-documents-report.component.html',
  styleUrls: ['./mou-documents-report.component.scss']
})
export class MouDocumentsReportComponent implements OnInit {
  @ViewChild('ChangeSchoolDivisionModal') ChangeSchoolDivisionModal: TemplateRef<any>; 
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;

  selectedSchoolDivisions: any[] = [];
  hasSelectionError = true;
  selectedDivisions: number[] = [];

  loadingIndicator = false;
  showNoDataFoundMessage: boolean = false;
  serverUrl: any;
  userId: any;
  EmployeeDetails: any[] = [];
  MouDocumentDetails: any[] = [];
  Email: any = '';
  EmployeeName: any = '';
  EmployeeCode: any = '';
  Department: any = '';
  OfficialEmailId: any = '';
  errorMessage: any;
  isLoginFailed: boolean = false;
  DepartmentName: any;
  MouPartner: any;
  ContactNo: any;
  FileData: any; array: any[] = []; fileData: File; fileStatus: boolean = false;
  fileName: string;

  allSchoolDivisions: SchoolDivision[] = []; CurrentSchool: string;
  uploadEnabled: boolean = false;
  filterText: string = '';
  filteredMouDocumentDetails: any[] = [];
  Reason: any;
  searchQuery: any= ''; ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];
  mouId: any;


  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private storageService: StorageService, private mouDocumentsService: MouDocumentsService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU </span> Document <span class="themeClr">Approvals</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';//"http://172.19.2.52/umsweb/webftp/MOUDocuments/";
    this.loadingIndicator = false;
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.isLoginFailed = false;
      this.getToken(loginName);
    }
    else {
      this.LoginFailed('Invalid Login Details');
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.GetAllUploadsDetails();
        this.GetEmployeeDetails();
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
  LoginFailed(NewError: any) {
    // this.errorMessage = NewError.error.message;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('adminPage');
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
          this.Email = response.item1[0].email;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;

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

  GetAllUploadsDetails(): void {
    this.mouDocumentsService.GetAllUploadedDocuments().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouDocumentDetails = response.item1;
          this.showNoDataFoundMessage = false;
          this.dataSource.data = this.MouDocumentDetails;
          this.filteredMouDocumentDetails = this.MouDocumentDetails;
          this.columns = []; this.headHtmlData = [];
          this.headHtmlData = this.MouDocumentDetails[0];
          this.columns = Object.keys(this.MouDocumentDetails[0]);
          this.columns = this.columns.filter((item: any) => item !== 'fileName' && item !== 'newMouId' && item!=='mouPartnerName' && item!== 'mouUploadedBy' && item!== 'mouUploadedByUID' && item!== 'mouApprovedBy' && item !== 'mouEndDate'  && item !== 'mouStartDate' && item !== 'mouStatus' && item !== 'filePath' && item !== 'uid' && item !== 'updatedOn'  && item !== 'facultyName'  && item !== 'mouTitle' && item !== 'mouPartnerName' && item !== 'spocContactNo'&& item !== 'spocName' && item !== 'spocEmailId' && item !== 'mouPartner' && item !== 'createdOn' && item !== 'createdBy' && item !== 'ipAddress' && item !== 'updatedBy' && item !== 'disapprovalReason' && item !== 'approvedBy'    && item !== 'updatedOn'  && item !== 'isActive' && item !== 'isApproved' && item !== 'approvalDate' && item !== 'schoolDivisionInvolved' && item !== 'mouId'  && item !== 'id' && item !== 'activityStartDate' && item !== 'activityEndDate' && item!=='assignedBy' && item!=='assignedTo');
          this.columns.push()
          this.loadingIndicator = false;

          this.isLoginFailed = false;
        } else {
          this.dataSource.data = this.MouDocumentDetails = [];
          this.showNoDataFoundMessage = true;
          //  this.isLoginFailed = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
    // console.log(this.MouDocumentDetails);
    this.GetAllActivities();

  }
  // ngOnChanges() {
  //   this.filterData();
  // }

  changeResponsiblePlanned(event: any) {
    for (let i = 0; i < event.length; i++) {
      this.selectedDivisions.push(event[i].id);
    }
    this.hasSelectionError = this.selectedDivisions.length === 0;
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
 
  search() {
    const query = this.searchQuery.trim().toLowerCase();
    // console.log(JSON.stringify(this.MouDocumentDetails))
    this.filteredMouDocumentDetails = this.MouDocumentDetails.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();
  
          // Special handling for mouid (Numeric & "MOU/x" String Comparison)
          if (key === 'id') {
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
  // filterData() {
  //   const lowerCaseFilter = this.filterText.toLowerCase();

  //   this.filteredMouDocumentDetails = this.MouDocumentDetails.filter(document => {
  //     if (lowerCaseFilter.includes("approve")) {
  //       if (lowerCaseFilter.includes("disapprove")) {
  //         return document.isApproved || (document.disapprovalReason && document.isApproved === false);
  //       } else {
  //         return document.isApproved;
  //       }
  //     } else if (lowerCaseFilter.includes("disapprove")) {
  //       return document.disapprovalReason && document.isApproved === false;
  //     }

  //     const mouMatch = lowerCaseFilter.match(/^mou\/(\d+)$/);
  //     if (mouMatch) {
  //       const mouId = parseInt(mouMatch[1], 10);
  //       return document.id === mouId;
  //     }

  //     return Object.values(document).some(value =>
  //       String(value).toLowerCase().includes(lowerCaseFilter)
  //     );
  //   });
  // }


  // recordsPerPage = 5;
  // currentPage = 1;

  // get totalPages(): number {
  //   return Math.ceil(this.filteredMouDocumentDetails.length / this.recordsPerPage);
  // }

  // get pagesArray(): number[] {
  //   return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  // }

  // changePage(page: number): void {
  //   this.currentPage = page;
  // }
  // getRecordsForCurrentPage(): any[] {
  //   const startIndex = (this.currentPage - 1) * this.recordsPerPage;
  //   const endIndex = startIndex + this.recordsPerPage;
  //   return this.filteredMouDocumentDetails.slice(startIndex, endIndex);
  // }

  // onPageChange(event: any): void {
  //   this.currentPage = event.pageIndex + 1;
  //   this.recordsPerPage = event.pageSize;
  // }

  // getDivisionNameById(id: number): string {
  //   const division = this.allSchoolDivisions.find(school => school.id === id);
  //   return division ? division.schoolDivision : '';
  // }

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
  exportToExcel(): void {
    const fileName = 'Mou_Document_report.xlsx';
  
    const exportedData = this.MouDocumentDetails.map(item => ({
      NewMOUId:  (item.newMouId ?? 'N/A'),
      OldMOUId: "MOU/" + (item.id ?? 'N/A'),
      'Mou Partner Organisation Name': item.mouTitle ?? 'N/A',
      'Mou Start Date': item.mouStartDate ?? 'N/A',
      'Mou End Date': item.mouEndDate ?? 'N/A',
      'Mou Status': item.mouStatus ?? 'N/A',
      'SPOC Person Name (Mou Partner Organisation)': item.spocName ?? 'N/A',
      'SPOC Person Email (Mou Partner Organisation)': item.spocEmailId ?? 'N/A',
      'SPOC Person Contact (Mou Partner Organisation)': item.spocContactNo ?? 'N/A',
      'Name of School/Division Involved ': item.schoolDivisionInvolved
        ? this.getDivisionNamesByIds(item.schoolDivisionInvolved.split(',').map(Number))
        : 'N/A', // Handle null case
      'School/Division Name Of Faculty Who Uploaded': item.mouUploadedBy ?? 'N/A',
      'Date of MOU Upload at interface': item.createdOn
        ? new Date(item.createdOn).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/ /g, '-')
        : 'N/A', // Handle null case
      'Approval Status (Approved/Rejected/Pending)': item.isApproved == 1        ? 'Approved'        : item.isApproved == 0        ? 'Disapproved'        : 'Pending',
      'MOU Approved /Rejected By : Faculty Name': item.mouApprovedBy ?? 'N/A',
      'MOU Approved /Rejected By : Faculty UID': item.approvedBy ?? 'N/A',
      'MOU Approval/ Rejection Date': item.approvalDate ?? 'N/A'
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wscols = Array(17).fill({ wpx: 220 }); // Set uniform column widths
    ws['!cols'] = wscols;
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }
  
  
  // exportToExcel(): void {
  //   const fileName = 'Mou_Document_report.xlsx';
  //   const exportedData = this.MouDocumentDetails.map(item => ({
  //     MOUId: "MOU/" + item.id,
  //     ' Mou Partner Organisation Name': item.mouTitle,
  //     'Mou Start Date': item.mouStartDate,
  //     'Mou End Date': item.mouEndDate,
  //     'Mou Status': item.mouStatus,
  //     // EmployeeName: item.facultyName,
  //     // UploadedBy: item.createdBy,
  //     'SPOC Person Name': item.spocName,
  //     'SPOC Person Email': item.spocEmailId,
  //     'SPOC Person Contact': item.spocContactNo,
  //     'School Division Involved': this.getDivisionNamesByIds(item.schoolDivisionInvolved.split(',').map(Number)),
  //     'School Division Name Of Faculty Who Uploaded ': item.mouUploadedBy,
  //     'Date of MOU Upload at interface':  new Date(item.createdOn).toLocaleDateString('en-GB', {day: '2-digit',month: 'short',year: 'numeric'}).replace(/ /g, '-'),
  //     'Approval Status (Approved/Rejected/Pending)': item.disapprovalReason == null && item.isApproved == 1 ? 'Approved' : item.disapprovalReason?.length > 10 && item.isApproved == 0 ? 'Disapproved' : 'Pending',
  //     'MOU Approved /Rejected By : Faculty Name': item.mouApprovedBy==null ? 'N/A': item.mouApprovedBy,
  //     'MOU Approved /Rejected By : Faculty UID': item.approvedBy==null ? 'N/A': item.approvedBy,
  //     'MOU Approval/ Rejection Date ': item.approvalDate==null ? 'N/A': item.approvalDate
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

  //   const wscols = [
  //     { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 200 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }, { wpx: 180 }
  //   ];
  //   ws['!cols'] = wscols;

  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
  //   link.download = fileName;
  //   link.click();
  // }

  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }

  DisapproveStatus(Id: any) {
    swal.fire({
      title: "Reason for Disapproval",
      // text: "Disapproval reason",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('Id', Id);
        formData.append('DisapprovalReason', this.Reason);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      } else {
        this.showCancelledSwal();
      }
    });
  }

 
  ChangeApproveStatus(Id: any) {
    const formData = new FormData();
    formData.append('Id', Id);
    formData.append('Action', 'Approve');

    swal.fire({
      title: 'Are you sure you want to change the status?',
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
    this.mouDocumentsService.ApproveDocument(formData).subscribe((data: any) => {
      if (action === 'Approve' && data.responseData === 'Cancel') {
        swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        swal.fire(
          ' Approved/Disapproved successfully !',
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
// added logic on 7-may-25 
MouOrganisation: any;
MouOrganisationPrevious:any;
selectedSchoolDivisionsX: string ;

  ChangeSchool(a: any) {
    const arrayUniqueByKey = [...new Map(this.selectedDivisions.map(item =>
      [item, item])).values()];    
    
    this.selectedSchoolDivisionsX = arrayUniqueByKey.join(',');
    let aa = a;
    this.mouId = aa['id'];
    this.MouOrganisationPrevious = aa['mouPartnerName']; 
    this.SPOCPerson=aa['spocName'];
    this.SPOCPersonEmail= aa['spocEmailId'];
    this.MouStartDate= aa['mouStartDate'];
    this.MouEndDate= aa['mouEndDate'];
    this.moustatus= aa['mouStatus'];
    this.selectedSchoolDivisions=aa['schoolDivisionInvolved'];
    this.CurrentSchool =aa['schoolDivisionInvolved']
    this.modalService.open(this.ChangeSchoolDivisionModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  ChangeUpdateSchoolDivision(Id: any, School: any, StartDate: any, EndDate: any, Status: any, SPName: any, SPContact: any,SPEmail: any, MouOrganisation: any) {
    alert(MouOrganisation)
    const formData = new FormData();
    formData.append('Id', Id);
    formData.append('SchoolInvolved', School.length<1? this.CurrentSchool: School);
    formData.append('MouStartDate', StartDate);
    formData.append('MouEndDate', EndDate);
    formData.append('MouStatus', Status);
    formData.append('SPOCPerson', SPName);
    formData.append('SPOCContat', SPContact);
    formData.append('SPOCEmail', SPEmail);
    formData.append('MouOrganisation', MouOrganisation.length< 3? this.MouOrganisationPrevious: MouOrganisation);
    swal.fire({
      title: 'Are you sure you want to change the School?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept current changes!',
      cancelButtonText: 'No, do not change it'
    }).then((result: any) => {
      if (result.value) {
        this.handleSchoolChange(formData);
      } else {
        this.showCancelledSwal();
      }
    });
  }

  private handleSchoolChange(formData: FormData) {
    this.mouDocumentsService.UpdateSchoolDivision(formData).subscribe((data: any) => {
      if (data.responseData === 'FAILED') {
        swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        swal.fire(
          ' Updation successfully !',
          '',
          'success'
        ).then(() => {
          window.location.reload();
        });
      }
    });
  }
//  changes made on 15-Feb-25

SPOCPerson: any;
SPOCPersonEmail: any;
SPOCPersonContact: any;
  isLoading: boolean = false;
  MouStartDate: string = ''; // Bound to Start Date input
  MouEndDate: string = ''; // Bound to End Date input
  isIndefiniteMou: boolean = false; // For Indefinite Mou checkbox
  moustatus: string = 'Expired';


  
  toggleEndDate(): void {
    if (this.isIndefiniteMou) {
      this.isIndefiniteMou = true;
      this.MouEndDate = '';
      this.moustatus = 'Active';
    } else {
      this.updateMouStatus(); // Recalculate status if unchecked
    }
  }

  // Updates the MOU status based on the date logic
  updateMouStatus(): void {
    const today = new Date();
    const startDate = this.MouStartDate ? new Date(this.MouStartDate) : null;
    const endDate = this.MouEndDate ? new Date(this.MouEndDate) : null;

    if (this.isIndefiniteMou) {
      this.moustatus = 'Active';
    } else if (startDate) {
      if (!endDate || (today >= startDate && today <= endDate)) {
        this.moustatus = 'Active';
      } else {
        this.moustatus = 'Expired';
      }
    } else {
      this.moustatus = 'Expired'; // Default status if start date is missing
    }
  }
}
