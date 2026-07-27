import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { MouActivity } from './MouActivity';

import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { mouActivities } from './mouActivities';

@Component({
  selector: 'MouActivityUpload',
  templateUrl: './MouActivityUpload.component.html',
  styleUrls: ['./MouActivityUpload.component.scss']
})
export class MouActivityUploadComponent implements OnInit {

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  userId: any;
  MouIdList: any;
  mouId: any;
  MouIdListSort: any;
  MouActivityData: any[] = [];
  errorMessage: any;
  isLoginFailed: boolean;
  MouPartner: any;
  FileData: any; array: any[] = []; 
  fileData: File | null = null; // Updated type
   fileStatus: boolean = false;
  fileName: string;
  fileChosen: { [key: number]: boolean } = {};
  uploadEnabled: boolean = false;
  MouActivityDataX: any[];
  filterText: string = '';
  filteredMouActivityData: any[] = [];
  filteredMouActivityDataX: any[] = [];
  updateEnabled: boolean;
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('bulkRecommendModal') bulkRecommendModal: TemplateRef<any>;

  @ViewChild('stageModal') stageModal: TemplateRef<any>;
  @ViewChild('divstagesHistory') divstagesHistory: TemplateRef<any>;
  @ViewChild('divstagesHistoryFiles') divstagesHistoryFiles: TemplateRef<any>;

  TableData: any = [];
  Arr = Array;
  TableDataCreatedBy: any = [];
  form: FormGroup;
  partnerNamesMap: { [key: number]: string } = {};
  selectedId: number | undefined;
  partnerName: string | undefined;
  mouActivity: any;
  startDate: any;
  endDate: any;
  EmployeeDetails: any;
  EmployeeCode: any;
  Department: any;
  EmployeeName: any;
  ContactNoX: any;
  ServerUrl: any;
  mouActivities: MouActivity[] = [];
  selectedActivityId: number;

  constructor(private Agreement: AgreementEntryService,
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
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU </span>Activity Upload <span class="themeClr">Interface</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    const currentDate = new Date();
    this.startDate = this.endDate = this.startDate = this.endDate = this.formatDate(currentDate);
    this.ServerUrl = 'https://files.lpu.in/umsweb/webftp/MOUDocuments/';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
  onActivitySelected(event: any): void {
    this.selectedActivityId = event.target.value;
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
        this.GetEmployeeDetails();
        this.GetAllMouIds();
        
      },
      error: _err => {
      }
    });
  }

  
  GetEmployeeDetails(): void {
    debugger;
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          debugger;
          this.EmployeeDetails = response.item1;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.ContactNoX = response.item1[0].contactNo;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          this.GetAllUploadsDetails(this.EmployeeCode);
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  
  GetAllMouIds(): void {
    this.mouDocumentsService.GetAllUploadedActivities().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouActivityData = response.item1;
          this.dataSource.data = this.MouActivityData;

          this.MouIdList = this.MouActivityData.map(item => item.id);
          this.MouIdList.sort((a: number, b: number) => a - b);
          this.MouIdListSort = this.MouIdList.map((_id: any, index: any) => `MOU/${_id}`);
          
          // Create a map to store partnerName for each MouId
          this.MouActivityData.forEach(item => {
            this.partnerNamesMap[item.id] = item.mouPartnerName;
          });
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
        } else {
          this.dataSource.data = this.MouActivityData = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
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
    const element = document.getElementById('ActivityPage');
    if (element) {
      element.hidden = true;
    }
  }
  // onMouIdChange(event: Event): void {
  //   const selectedId = (event.target as HTMLSelectElement).value;
  //   this.selectedId = selectedId ? + selectedId : undefined;
  //  this.MouPartner= this.partnerName = this.selectedId !== undefined ? this.partnerNamesMap[this.selectedId] : undefined;
  //  this.mouActivity= 'Test Name Activity';

  //  this.checkFormValidity();
  // }

  onMouIdChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedId = selectedId ? +selectedId : undefined;
    this.MouPartner = this.partnerName = this.selectedId !== undefined ? this.partnerNamesMap[this.selectedId] : undefined;
   this.mouActivity= 'Test Name Activity';
   this.mouId= this.selectedId;
    this.checkFormValidity();
  }
  loadData(event: Event) {
    // (<HTMLInputElement>document.getElementById('ResultTable')).style.display = "none";
  }
  testClick(): void {
    swal.fire({
      title: 'Test click',
      text: 'File Download !',
      icon: 'warning',
    })
  }

  // onFileSelected(event: any): void {
  //   const reader = new FileReader();
  //   const target = event.target as HTMLInputElement;
  //   const file: File | null = (target.files as FileList)[0] || null;
  //   if (file && file.size > 5001576) {
  //     swal.fire({
  //       title: 'File size exceeds 5MB. Please upload a smaller file.',
  //       text: 'Invalid File size',
  //       icon: 'warning'
  //     });
  //     target.value = '';
  //     return;
  //   }

  //   const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  //   if (file && !fileNameRegex.test(file.name)) {
  //     const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  //     const modifiedFile = new File([file], validFileName, { type: file.type });
  //     const dataTransfer = new DataTransfer();
  //     dataTransfer.items.add(modifiedFile);
  //     target.files = dataTransfer.files;

  //     this.fileData = modifiedFile;
  //     this.fileStatus = true;

  //     reader.readAsDataURL(modifiedFile);
  //     reader.onload = () => {
  //       const ssss = reader.result as string;
  //       const ssssArray = ssss.split(',');
  //       this.FileData = ssssArray[1];
  //       this.fileName = validFileName;
  //     };
  //     return;
  //   }

  //   this.fileData = file;
  //   this.fileStatus = true;

  //   if (file) {
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       const ssss = reader.result as string;
  //       const ssssArray = ssss.split(',');
  //       this.FileData = ssssArray[1];
  //       this.fileName = file.name;
  //     };
  //   }
  //   this.checkFormValidity();
  // }
 
  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
  
    if (file) {
      // Check file size
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
  
      // Validate file name
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
  
      // Read file as Data URL
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

  
  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.mouId !== 'select Id'
      && this.partnerName !== ''
      && this.mouActivity !== '' && this.mouActivity !== 'select Id'
      && this.startDate !== ''
      && this.endDate !== ''
      && this.FileData !== null;
  }

  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('MouPartnerName', this.MouPartner);
    formData.append('ActivityName', this.mouActivity);
    formData.append('ActivityStartDate', this.startDate);
    formData.append('ActivityEndDate', this.endDate);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
  
    this.mouDocumentsService.MouActivityInsert(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'ok') {
          swal.fire({
            title: 'Uploaded Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else {
          swal.fire({
            title: 'Error Occured, Try Again Later',
            // text: result,
            icon: 'error'
          });
        }
      },
      error: (error: any) => {
        swal.fire({
          title: 'Error',
          text: 'Failed to Upload.',
          icon: 'error'
        });
      },
      complete: () => {
        this.clearFields();
      }
    });
  }

  clearFields(): void {
    this.mouId = this.mouActivity = this.MouPartner = '';
    this.startDate = this.endDate =  '';
    // const currentDate = new Date();
//    this.startDate = this.endDate = this.startDate = this.endDate = this.formatDate(currentDate);

    this.fileInput.nativeElement.value = '';
  }




  
  GetAllUploadsDetails(Uid: any): void {
    this.mouDocumentsService.GetUIDWiseMouActivityDetails(Uid).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouActivityData = response.item1;
          this.filteredMouActivityData =  this.MouActivityData  ;
          // console.log(this.filteredMouActivityData)
          this.dataSource.data = this.filteredMouActivityData;
          this.showNoDataFoundMessage = this.filteredMouActivityData.length === 0;
          this.isLoginFailed = false;
        } else {
          this.dataSource.data = this.MouActivityData = [];
          this.showNoDataFoundMessage = true;
          //this.isLoginFailed = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }
    
  ngOnChanges() {
    this.filterData();
  }

 
  filterData() {
    const lowerCaseFilter = this.filterText.toLowerCase();
  
    this.filteredMouActivityData = this.MouActivityData.filter(document => {
      if (lowerCaseFilter.includes("approve")) {
        if (lowerCaseFilter.includes("disapprove")) {
          return document.isApproved || (document.disapprovalReason && document.isApproved === false);
        } else {
          return document.isApproved;
        }
      } else if (lowerCaseFilter.includes("disapprove")) {
        return document.disapprovalReason && document.isApproved === false;
      }
  
      const mouMatch = lowerCaseFilter.match(/^mou\/(\d+)$/);
      if (mouMatch) {
        const mouId = parseInt(mouMatch[1], 10);
        return document.id === mouId;
      }
  
      return Object.values(document).some(value =>
        String(value).toLowerCase().includes(lowerCaseFilter)
      );
    });
  }
  

  recordsPerPage = 5;   
  currentPage = 1;  

  get totalPages(): number {
    return Math.ceil(this.filteredMouActivityData.length / this.recordsPerPage);
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
    return this.filteredMouActivityData.slice(startIndex, endIndex);
  }

  onPageChange(event:any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }



  exportToExcel(): void {
    const fileName = 'MyMou_ActivityUploads_report.xlsx';
    const exportedData = this.filteredMouActivityData.map(item => ({
      MOUId: "MOU/"+item.id,
      Employee: item.createdBy,
      ActivityStart:item.activityStartDate,
      ActivityEnd:item.activityEndDate,
      UploadedBy: item.createdBy,
      ApprovalStatus: item.disapprovalReason == null && item.isApproved == 'True' ? 'Approved' : item.disapprovalReason?.length > 5 && item.isApproved == 'False' ? 'Disapproved Due to '+ item.disapprovalReason : 'Pending',
      MouPartnerOrganisation: item.mouPartnerName,
      UploadedOn: item.createdOn,
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
  
    this.mouDocumentsService.MouActivityUpdateFile(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'ok') {
          swal.fire({
            title: 'Uploaded the Document',
            text: data.item1[0]['msg'],
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else {
          swal.fire({
            title: 'Something went wrong',
            text: result,
            icon: 'error'
          });
        }
      },
      error: (error: any) => {
        swal.fire({
          title: 'Error',
          text: 'Failed to upload document.',
          icon: 'error'
        });
      },
      complete: () => {
        window.location.reload();
      }
    });
    }
  }
}
// Added by Jatinder Kumar 31309