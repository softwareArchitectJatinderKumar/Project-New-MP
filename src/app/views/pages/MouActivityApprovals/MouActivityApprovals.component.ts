import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

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
import { mouActivities } from './mouActivities';
import { MouActivity } from './MouActivity';
import { filter, finalize } from 'rxjs';

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-MoUActivityApprovals',
  templateUrl: './MouActivityApprovals.component.html',
  styleUrls: ['./MouActivityApprovals.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false
})

export class MouActivityApprovalsComponent implements OnInit {





  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  serverUrl: any; userId: any; EmployeeDetails: any[] = []; MouActivityData: any[] = [];
  Email: any = ''; EmployeeName: any = ''; EmployeeCode: any = ''; Department: any = ''; OfficialEmailId: any = '';
  errorMessage: any; isLoginFailed: boolean; DepartmentName: any; MouPartner: any;
  ContactNo: any; FileData: any; array: any[] = []; fileData: File; fileStatus: boolean = false;
  fileName: string; MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];
  uploadEnabled: boolean = false;
  filterText: string = '';
  filteredMouActivityData: any[] = [];
  Reason: any;
  ServerUrl: any;
  ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = []; responsiblePerson: string = '';
  searchQuery: any;

  DocumentName: string;







  // added on 8-7-26


  @ViewChild('topScrollbar')
topScrollbar!: ElementRef;

@ViewChild('topScrollbarContent')
topScrollbarContent!: ElementRef;

@ViewChild('gridContainer')
gridContainer!: ElementRef;

private scrollInitialized = false;

ngAfterViewInit(): void {

    setTimeout(() => {
        this.initializeTopScrollbar();
    });

}

ngAfterViewChecked(): void {

    if (!this.scrollInitialized && this.filteredMouActivityData.length) {

        this.initializeTopScrollbar();

    }

}

initializeTopScrollbar(): void {

    const body = this.gridContainer.nativeElement.querySelector('.datatable-body');

    if (!body) {
        return;
    }

    this.scrollInitialized = true;

    this.topScrollbarContent.nativeElement.style.width =
        body.scrollWidth + 'px';

    // Top → Grid
    this.topScrollbar.nativeElement.onscroll = () => {
        body.scrollLeft = this.topScrollbar.nativeElement.scrollLeft;
    };

    // Grid → Top
    body.onscroll = () => {
        this.topScrollbar.nativeElement.scrollLeft = body.scrollLeft;
    };

}
  allMouActivityData: any[] = [];

  approvedCount = 0;
  disapprovedCount = 0;
  pendingCount = 0;


  statusFilter: string = 'all';
  approvalFilter: string = 'all';
  //   onApprovalFilterChange(event: any): void {
  //   this.applyFilters();
  // }

  onApprovalFilterChange(): void {
    this.applyFilters();
  }
  applyFilters(): void {

    let filtered = [...this.allMouActivityData];

    // Approval Filter
    switch (this.approvalFilter) {

      case 'approved':
        filtered = filtered.filter(x =>
          x.isApproved === true ||
          x.isApproved === 'True' ||
          x.isApproved == 1
        );
        break;

      case 'pending':
        filtered = filtered.filter(x =>
          x.isApproved === null ||
          x.isApproved === 'null'           
        );
        break;
      case 'disapproved':
        filtered = filtered.filter(x =>
          x.isApproved === false ||
          x.isApproved === 'False' ||
          x.isApproved == 0
        );
        break;

      default:
        break;
    }

    // Search
    const query = (this.searchQuery || '').trim().toLowerCase();

    if (query) {
      filtered = filtered.filter(item =>
        Object.values(item).some((value: any) =>
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(query)
        )
      );

    }

    this.filteredMouActivityData = filtered;

    this.updateCounts();

    this.scrollInitialized = false;

setTimeout(() => {
    this.initializeTopScrollbar();
},100);
  }

  updateCounts(): void {

    this.approvedCount = this.filteredMouActivityData.filter(x =>
      x.isApproved === true ||
      x.isApproved === 'True' ||
      x.isApproved == 1
    ).length;

    this.disapprovedCount = this.filteredMouActivityData.filter(x =>
      x.isApproved === false ||
      x.isApproved === 'False' ||
      x.isApproved == 0
    ).length;

    this.pendingCount = this.filteredMouActivityData.filter(x =>
      x.isApproved == null
    ).length;

  }


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



  // added on 5-Feb-26
  onDownloadFile(remoteUrl: string): void {
    // console.log("Downloading file from URL:", remoteUrl);
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

    this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const fileName = remoteUrl.split('/').pop()?.split('?')[0] || 'Document.pdf';
        // const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
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

  //Ended logic 
  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private storageService: StorageService, private mouDocumentsService: MouDocumentsService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    // this.ServerUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr"> MOU  </span> Activities <span class="themeClr"> Approvals</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.loadingIndicator = false;
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
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
        this.getAllPlannerSession();
        this.GetEmployeeDetails();

        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr"> MOU  </span> Activities <span class="themeClr"> Approvals</span>';
        (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
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
  // 29-May-25 Logic start 

  selectedSessionId: any = ''; // Default to 'All'
  isLoading: boolean = false;

  onSessionChange(): void {
    this.GetAllUploadsDetails(this.selectedSessionId);
  }

  GetAllUploadsDetails(SessionId: any): void {
    this.isLoading = true;
    const minLoadingTime = 2500; // 12.5 seconds
    const startTime = Date.now();

    this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode, SessionId)
      .pipe(
        finalize(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(minLoadingTime - elapsed, 0);
          setTimeout(() => {
            this.isLoading = false;
          }, remaining);
        })
      )
      .subscribe({
        next: response => {
          if (response.item1 && response.item1.length > 0) {
            this.MouActivityData = response.item1;

            this.allMouActivityData = [...response.item1];
            this.MouActivityData = [...response.item1];
            this.filteredMouActivityData = [...response.item1];

            this.updateCounts();
            this.showNoDataFoundMessage = false;
            this.dataSource.data = this.MouActivityData;
            this.filteredMouActivityData = this.MouActivityData;
            // this.columns = Object.keys(this.MouActivityData[0]);

            this.scrollInitialized = false;

setTimeout(() => {
    this.initializeTopScrollbar();
},100);
          } else {
            this.MouActivityData = [];
            this.filteredMouActivityData = [];
            this.showNoDataFoundMessage = true;
          }
        },
        error: err => {
          console.error("Error fetching MOU data", err);
          this.MouActivityData = [];
          this.filteredMouActivityData = [];
          this.showNoDataFoundMessage = true;
        }
      });
  }
  // 29-May-25 Logic ended 

  // 28-May-25 Logic start 

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
    // alert('Selected Session ID: ' + selectedId);
    this.GetAllUploadsDetails(this.selectedPlannerSession);
  }

  // 28-May-25 Logic ended 

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          this.getAllMouActivities();
          this.GetAllUploadsDetails(0);
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
    window.open(aa.filePath, '_blank');
  }

  onSelectFileY(a: any) {
    let aa = a;
    window.open(aa.documentUploadedFile, '_blank');
  }

  // GetAllUploadsDetails(SessionId: any): void {
  //     this.isLoading = true;
  //   this.mouDocumentsService.MouActionsTakenData(this.EmployeeCode,SessionId).subscribe({
  //     next: response => {
  //       if (response.item1.length > 0) {
  //         this.MouActivityData = response.item1;       
  //         this.showNoDataFoundMessage = false;
  //         this.dataSource.data = this.MouActivityData;
  //         this.filteredMouActivityData = this.MouActivityData;
  //         this.dataSource.data = this.MouActionTakenDocuments;
  //         this.loadingIndicator = false;
  //         this.columns = []; this.headHtmlData = [];
  //         this.headHtmlData = this.MouActivityData[0];
  //         this.columns = Object.keys(this.MouActivityData[0]);
  //         this.columns = this.columns.filter((item: any) => item !== 'filePath' && item !== 'assignedToFacultyUID' && item !== 'mouPartnerName' && item !== 'uploadActivityDate' && item !== 'mouApprovedByFacultyName'   && item !== 'schoolDivisionInvolved' && item !== 'approvalStatus' && item !== 'participantsCount' && item !== 'activityCount' && item !== 'approvalStatus' && item !== 'mouStatus' && item !== 'documentUploadedFile' && item !== 'approvalStatus' && item !== 'activityTitle'  && item !== 'mouApprovedByFacultyUID' && item !== 'assignedToFacultyName' && item !== 'startDate' && item !== 'completedDate' && item !== 'sessionId' && item !== 'sessionAcademicYear' && item !== 'documentUploaded' && item !== 'fileName' && item !== 'ipAddress' && item !== 'mouId' && item !== 'approvedBy' && item !== 'approvalDate' && item !== 'disapprovalReason' && item !== 'isApproved' && item !== 'documentName' && item !== 'file' && item !== 'uid' && item !== 'id' && item !== 'createdBy' && item !== 'updatedOn' && item !== 'updatedBy' );

  //         this.columns.push()
  //         this.isLoading = false;

  //       } else {
  //         this.dataSource.data = this.MouActionTakenDocuments =  this.filteredMouActivityData = [];
  //         this.showNoDataFoundMessage = true;
  //         this.isLoading=false;
  //       }
  //     },
  //     error: err => {
  //       this.LoginFailed(err);
  //       this.isLoading=false;
  //     }
  //   });
  //   this.GetAllActivities();
  // }
  search(): void {
    this.applyFilters();
  }

  // search() {

  //   const query = this.searchQuery.trim().toLowerCase();
  //   // console.log(JSON.stringify(this.MouActivityData))
  //   this.filteredMouActivityData = this.MouActivityData.filter(item => {
  //     return Object.entries(item).some(([key, val]) => {
  //       if (val !== null && val !== undefined) {
  //         let valueString = String(val).toLowerCase();

  //         // Special handling for mouid (Numeric & "MOU/x" String Comparison)
  //         if (key === 'mouId') {
  //           const numericId = Number(val); // Convert mouid to a number

  //           // Handle cases where user searches with "MOU/x" or just a number
  //           if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
  //             return true;
  //           }
  //         }

  //         // General search for all other fields
  //         return valueString.includes(query);
  //       }
  //       return false;
  //     });
  //   });
  // }

  allSchoolDivisions: SchoolDivision[] = []; CurrentSchool: any[] = []

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      if (response.item1.length > 0) {
        this.allSchoolDivisions = response.item1;
      } else {
        this.allSchoolDivisions = [];
      }
    });
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
    return division ? division.schoolDivision : `NA`;
  }
  getDivisionNamesByIds(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }
  //  [{"id":35,"mouId":326,"uid":null,"assignedToFacultyName":null,"startDate":null,"documentUploaded":"Research assistance for Capstone project","completedDate":null,"remarks":"Activity completed","filePath":"https://files.lpu.in/umsweb/MOUDocuments/19383_9718052_8_2024_Dr. B.Lal Institute of Bioechnology_MOU_B.LAL_compressed.pdf","ipAddress":null,"isApproved":null,"approvedBy":null,"approvalDate":"11 Oct 2024","disapprovalReason":null,"fileName":null,"sessionId":null,"activityTitle":null,"participantsCount":null,"mouStatus":"Active","sessionAcademicYear":null},
  exportToExcel(): void {
    const fileName = 'Mou_ACtivityApprovals_Document_report.xlsx';
    const exportedData = this.MouActivityData.map(item => ({
      NewMOUId: item.newMouId,
      OldMOUId: 'MOU/' + item.mouId,
      'Name of Mou Organisation': item.mouPartnerName,
      'MOU Activity Assigned to Uid': item.assignedToFacultyUID,
      'School Division Name': item.schoolDivisionInvolved
        ? this.getDivisionNamesByIds(item.schoolDivisionInvolved.split(',').map(Number))
        : 'N/A', // Handle null case
      'Details of MOU Activity Assigned': item.activityDetails,
      'Start Date of MOU Assigned By HOS': item.activityStartDate,
      'End Date of MOU Assigned By HOS': item.activityEndDate,
      'Detail of Proof Submitted': item.documentUploaded,
      'Session Academic/ Calender Year': item.sessionAcademicYear?.length > 0 ? item.sessionAcademicYear : 'NA',
      'Activity Title': item.activityTitle?.length > 0 ? item.activityTitle : 'NA',
      'Participants Count': item.participantsCount > 0 ? item.participantsCount : 'NA',
      'Activity Count': item.activityCount > 0 ? item.activityCount : 'NA',
      'Uploaded Activity Date': item.uploadActivityDate,
      'MOU ApprovalStatus': item.approvalStatus == 'True' ? 'Approved' : item.approvalStatus == 'False' ? 'Disapproved' : 'N/A',
      'MOU Activity Rejection Remarks ': item.disapprovalReason?.length > 5 ? item.disapprovalReason : 'N/A',
      'MOU Activity Approval/ Rejection By Faculty Id ': item.mouApprovedByFacultyUID?.length > 2 ? item.mouApprovedByFacultyUID : 'N/A',
      'MOU Activity Approval/ Rejection Date ': item.approvalDate?.length > 2 ? item.approvalDate : 'N/A',
      'Document Uploaded File': item.documentUploadedFile
    }));
    const header = [
      'New MOU Id',
      'Old MOU Id',
      'Name of Mou Organisation',
      'MOU Activity Assigned to',
      'School Division Name',
      'Details of MOU Activity Assigned',
      'Start Date of MOU Assigned By HOS',
      'End Date of MOU Assigned By HOS',
      'Detail of Proof Submitted',
      'Session Academic/ Calender Year',
      'Activity Title',
      'Participants Count',
      'Activity Count',
      'Uploaded Activity Date',
      'MOU ApprovalStatus',
      'Rejection Remarks ',
      'Approval/ Rejection By Faculty Id ',
      'Approval/ Rejection Date ',
      'Document Uploaded File',
    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 17 }); // Column 8 is DocumentUrl
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
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

  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }

  DisapproveStatus(RowData: any) {
   let aa = RowData;
    let IDX = aa['recordId'];    
    let UId = aa['assignedToFacultyUID'];    
 
 
    swal.fire({
      title: "Reason for Disapproval",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('Id', IDX);
        formData.append('DisapprovalReason', this.Reason);
        formData.append('UId', UId);
        formData.append('Action', 'Disapprove');
        this.handleStatusChange(formData, 'Disapprove');
      } else {
        this.showCancelledSwal();
      }
    });
  }


  ApproveAction(RowData: any) {
    let aa = RowData;
    let ymouId = aa['recordId'];    
    let UId = aa['assignedToFacultyUID'];    
    const formData = new FormData();
    formData.append('Id', ymouId);    
    formData.append('UId', UId);
    formData.append('Action', 'Approve');
    
    swal.fire({
      title: 'Are you sure you want to Approve this?',
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

    formData.forEach((value, key) => {
      console.log(key, value);
    });
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

  Activities: any;
  Activity: any = '';
  selectedActivityType: string = ''; selectedActivityId: number; mouActivities: MouActivity[] = [];


  DownloadFormatDocument(activity: any): void {

    if (!activity || !activity.activityDetails) {
      console.error("Invalid activity data.");
      return;
    }

    const activityDetailsParts = activity.activityDetails.match(/^(\d+)-/);
    if (!activityDetailsParts) {
      const extractedTitle = activity.activityDetails.split("-")[1]?.trim() || "";
      const matchedActivity = this.mouActivities.find(mouActivity => mouActivity.description.toLowerCase() == extractedTitle.toLowerCase());
      const matchedActivityId = matchedActivity?.id ?? null;
      // console.error("Activity ID not found in activityDetails."+ matchedActivity?.id);
      swal.fire({
        title: 'Fromat No Found',
        // text: 'Did not Find document Format',
        icon: 'warning',
      })
      return;
    }

    const selectedActivityId = parseInt(activityDetailsParts[1], 10);
    // console.log("Extracted Activity ID:", selectedActivityId);

    if (isNaN(selectedActivityId)) {
      // console.error("Invalid extracted Activity ID."+ selectedActivityId);
      return;
    }

    // // Find the matching MOU activity by ID
    // const matchedActivity = this.mouActivities.find(mouActivity => mouActivity.id === selectedActivityId);

    // if (!selectedActivityId) {
    //   console.warn(`No matching MOU activity found for ID: ${selectedActivityId}`);
    //   return;
    // }

    // console.log("Matched MOU Activity:", matchedActivity);

    // Generate file URL
    const fileUrl = `assets/MouTemplateDocuments/${selectedActivityId}.zip`;
    // console.log("Generated File URL:", fileUrl);

    // Create and trigger the download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${selectedActivityId}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  // DownloadFormatDocument(a: any): void {
  //   console.log(JSON.stringify(a))
  //   // const fileUrl = `assets/MouTemplateDocuments/${this.selectedActivityId}.zip`;
  //   // const link = document.createElement('a');
  //   // const selectedActivity = this.mouActivities.find(activity => activity.id === +a);
  //   // if (selectedActivity) {
  //   //   // alert('Selected Activity Description:'+ selectedActivity?.description);
  //   //   this.DocumentName =  selectedActivity?.description
  //   // }
  //   // link.href = fileUrl;
  //   // link.download = `${this.selectedActivityId}.zip`;
  //   // link.click();
  // }

  getAllMouActivities(): void {
    this.mouDocumentsService.GetAllMouActivities().subscribe({
      next: response => {
        if (response.item1) {
          this.Activities = response.item1;
          //console.log(JSON.stringify(this.Activities))
        }
      }
    })
  }
}
