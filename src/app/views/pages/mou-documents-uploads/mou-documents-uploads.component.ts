
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
@Component({
  selector: 'app-mou-documents-uploads',
  templateUrl: './mou-documents-uploads.component.html',
  styleUrls: ['./mou-documents-uploads.component.scss']
})
export class MouDocumentsUploadsComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  serverUrl: any;
  userId: any;
  EmployeeDetails: any[] = [];
  MouDocumentsData: any[] = [];
  Email: any = '';
  EmployeeName: any = '';
  EmployeeCode: any = '';
  Department: any = '';
  OfficialEmailId: any = '';
  errorMessage: any;
  isLoginFailed: boolean;
  DepartmentName: any;
  MouPartner: any;
  ContactNo: any;
  ContactNoX: any;
  FileData: any; array: any[] = []; fileData: File; fileStatus: boolean = false;
  fileName: string;
  fileChosen: { [key: number]: boolean } = {};
  uploadEnabled: boolean = false;
  UID: any;
  MouDocumentsDataX: any[];
  width: any;
  Reason: any;
  filterText: string = '';
  filteredMouDocumentsData: any[] = [];
  filteredMouDocumentsDataX: any[] = [];
  MouTitle: any;
  updateEnabled: boolean;

  SchoolIndex: number = 0;
  DepartmentIndex: number = 0;
  SchoolInvolved: any;
  selectedId: number;
  selectedSchoolDivisions: any[] = [];
  allSchoolDivisions: SchoolDivision[] = [];
  selectedDivisions: number[] = [];
  isDropdownOpen: boolean = false;
  allDepartmentName: any;
  SchoolId: number;
  SOPCName: any;
  SOPCEmail: any;
  SOPCNumber: any;
  selectError: boolean = false;
  division: any | undefined;

  // added on 27 - jan 25
  MouStartDate: string = ''; // Bound to Start Date input
  MouEndDate: string = ''; // Bound to End Date input
  isIndefiniteMou: boolean = false; // For Indefinite Mou checkbox
  moustatus: string = 'Expired';  
 // Toggles the disabled state of the MouEndDate field and sets MOU status
 toggleEndDate(): void {
    if (this.isIndefiniteMou) {
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
      // If Indefinite MOU is checked, status is always Active
      this.moustatus = 'Active';
    } else if (startDate) {
      // Check if today falls within the range of start and end dates
      if (!endDate || (today >= startDate && today <= endDate)) {
        this.moustatus = 'Active';
      } else {
        this.moustatus = 'Expired';
      }
    } else {
      this.moustatus = 'Expired'; // Default status if start date is missing
    }
  }
  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private storageService: StorageService, private mouDocumentsService: MouDocumentsService,
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr" >MOU </span> Document<span class="themeClr" > Upload </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    // this.serverUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
    this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
    this.loadingIndicator = false;
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);

    }
    else {
      this.LoginFailed('Invalid Login Details');
    }
  }

  getToken(id: string): void {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.GetEmployeeDetails();
        this.GetAllActivities();
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  validateSelect() {
    this.selectError = this.selectedSchoolDivisions.length === 0;
    let len = this.selectedSchoolDivisions.length;
    return len > 0;
  }
  LoginFailed(NewError: any) {
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

  formdata = new FormGroup({
    ContactNo: new FormControl('', Validators.required),
    MouPartner: new FormControl('', Validators.required),
    MouStartDate: new FormControl('', Validators.required),
    MouEndDate: new FormControl(''),
    SOPCName: new FormControl('', Validators.required),
    SOPCEmail: new FormControl('', Validators.required),
    SOPCNumber: new FormControl('', Validators.required),
    SchoolInvolved: new FormControl('', Validators.required),
    File: new FormControl('', Validators.required),
  })

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.Email = response.item1[0].email;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.OfficialEmailId = response.item1[0].officialEmailId;
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          // this.GetAllUploadsDetails(11834);
          this.GetAllUploadsDetails(this.EmployeeCode);

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
  

  toggleDropdown(): void {

    this.isDropdownOpen = !this.isDropdownOpen;
  }


  hasSelectionError = true;


  changeResponsiblePlanned(event: any) {
    for (let i = 0; i < event.length; i++) {
      this.selectedDivisions.push(event[i].id);
    }
    this.hasSelectionError = this.selectedDivisions.length === 0;
  }

  onDivisionSelected(event: any, id: number): void {
    if (event.target.checked) {
      this.selectedDivisions.push(id);
    } else {
      this.selectedDivisions = this.selectedDivisions.filter(divId => divId !== id);
    }
  }
  getSelectedDivisionsText(): string {
    return this.selectedDivisions.map(id => this.getDivisionNameById(id)).join(', ');
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

   getDivisionNamesByIds(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
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

  getAllDivisions(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const SchoolIndex = Array.from(selectElement.options).findIndex(option => option.value === selectedValue);

    if (SchoolIndex !== -1) {
      selectElement.selectedIndex = SchoolIndex;

      this.selectedId = parseInt(selectedValue, 10);

      this.GetDepartmentforSchoolId(this.selectedId);
    }

  }

  GetDepartmentforSchoolId(Id: any) {
    this.lpuPlannerServiceService.GetSchoolDivisionsDepartment(Id).subscribe((response) => {
      if (response.item1.length > 0) {
        this.allDepartmentName = response.item1;
      } else {
        this.allDepartmentName = [];
      }
    });
  }

  loadData(event: Event) {
    // (<HTMLInputElement>document.getElementById('ResultTable')).style.display = "none";
  }
  loadPlannerDetails(event: Event) {
    var selectedDName = (event.target as HTMLSelectElement).value;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
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
      this.uploadEnabled = true;
      return;
    }

    this.fileData = file;
    this.fileStatus = true;
    // alert(10);  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = file.name;
        this.SchoolInvolved = this.selectedDivisions;
        // alert(10);  

        if (this.ContactNo?.length < 10 || this.SOPCName?.length < 5 || this.SOPCEmail?.length < 5 || this.SOPCNumber?.length < 10 || this.MouPartner?.length < 5 || this.SchoolInvolved?.length < 1) {
          swal.fire({
            title: 'Invalid Data !',
            text: ' Required Partner Name, SOPC Name , EMail as well as SOPC Number',
            icon: 'warning'
          }).then(() => {
            window.location.reload();
          });
        }
        else {
          this.uploadEnabled = true;
        }
      };
    }
  }
  UploadDocument() {
    const arrayUniqueByKey = [...new Map(this.selectedDivisions.map(item =>
      [item, item])).values()];

    this.SchoolInvolved = arrayUniqueByKey.join(',');
    const formData = new FormData();
    formData.append('UID', this.EmployeeCode);
    formData.append('MouTitle', this.MouPartner);
    formData.append('MouPartnerName', this.MouPartner);
    formData.append('FacultyName', this.EmployeeName);
    formData.append('MouStartDate', this.MouStartDate);
    formData.append('MouEndDate', this.MouEndDate.length>0?this.MouEndDate:'null');
    formData.append('MouStatus', this.moustatus);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    formData.append('CreatedBy', this.EmployeeCode);
    formData.append('SchoolDivisionInvolved', this.SchoolInvolved);
    formData.append('SPOCName', this.SOPCName);
    formData.append('SPOCEmail', this.SOPCEmail);
    formData.append('SPOCContact', this.SOPCNumber);
    this.mouDocumentsService.MouDocumentUpload(formData).subscribe({
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
    this.SOPCEmail = this.SOPCName = this.SOPCNumber = this.ContactNo = this.MouTitle = this.MouPartner = '';
  }


  GetAllUploadsDetails(Uid: any): void {
    this.mouDocumentsService.GetUIDWiseUploadedDocuments(Uid).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouDocumentsData = response.item1;
           console.log(JSON.stringify(this.MouDocumentsData))
          this.filteredMouDocumentsData = this.MouDocumentsData;
          this.dataSource.data = this.filteredMouDocumentsData;
          this.showNoDataFoundMessage = this.filteredMouDocumentsData.length === 0;
          this.isLoginFailed = false;
        } else {
          this.dataSource.data = this.MouDocumentsData = [];
          this.showNoDataFoundMessage = true;
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

    this.filteredMouDocumentsData = this.MouDocumentsData.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val !== null && val !== undefined) {
          let valueString = String(val).toLowerCase();
  
          if (key === 'id') {
            const numericId = Number(val); // Convert mouid to a number
            
            if (!isNaN(numericId) && (numericId.toString().includes(lowerCaseFilter) || `mou/${numericId}`.includes(lowerCaseFilter))) {
              return true;
            }
          }
  
          // General search for all other fields
          return valueString.includes(lowerCaseFilter);
        }
        return false;
      });
    });

    // this.filteredMouDocumentsData = this.MouDocumentsData.filter(document => {
    //   if (lowerCaseFilter.includes("approve")) {
    //     if (lowerCaseFilter.includes("disapprove")) {
    //       return document.isApproved || (document.disapprovalReason && document.isApproved === false);
    //     } else {
    //       return document.isApproved;
    //     }
    //   } else if (lowerCaseFilter.includes("disapprove")) {
    //     return document.disapprovalReason && document.isApproved === false;
    //   }

    //   const mouMatch = lowerCaseFilter.match(/^mou\/(\d+)$/);
    //   if (mouMatch) {
    //     const mouId = parseInt(mouMatch[1], 10);
    //     return document.id === mouId;
    //   }

    //   return Object.values(document).some(value =>
    //     String(value).toLowerCase().includes(lowerCaseFilter)
    //   );
    // });
  }


  recordsPerPage = 5;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.filteredMouDocumentsData.length / this.recordsPerPage);
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
    return this.filteredMouDocumentsData.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }
  getSchoolDivisionNames(ids: number[]): string {
    if (!Array.isArray(ids)) { // Ensure ids is an array
      return '';
    }
    
    const names = ids.map(id => this.getDivisionNameByIds(id)).join(', '); // Map IDs to names
    return names;
  }
  
  getDivisionNameByIds(id: number): string {
    const division = this.allSchoolDivisions.find(school => school.id === id);  
    return division ? division?.schoolDivision : ' '+id;  
  }
  getDivisionNamesByIdss(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }
  
  exportToExcel(): void {
    const fileName = 'Mou_Document_report.xlsx';
 
    const exportedData = this.MouDocumentsData.map(item => ({
      NewMouid:(item.newMouId ?? 'Disapproved'),//1
      OldMOUId: "MOU/" + (item.id ?? 'N/A'),//1
      'Mou Partner Name': item.mouPartnerName ?? 'N/A',//2
      'Mou Start Date': item.mouStartDate ?? 'N/A',//3
      'Mou End Date': item.mouEndDate ?? 'N/A',//4
      'Mou Status': item.mouStatus ?? 'N/A',//5
      'SPOC Person Name (Mou Partner Organisation)': item.spocName ?? 'N/A',//6
      'SPOC Person Email (Mou Partner Organisation)': item.spocEmailId ?? 'N/A',//7,
      'SPOC Person Contact (Mou Partner Organisation)': item.spocContactNo =='undefined' ? 'N/A': item.spocContactNo ?? 'N/A',//8
      'MOU Uploaded By Faculty Name': item.mouUploadedByFacultyName ?? 'N/A',//10
      'MOU Uploaded By Faculty UID': item.createdBy ?? 'N/A',//11
      'School/Division Involved Id': item.schoolDivisionInvolved ?? 'N/A',//9
      'Name of School/Division Involved': item.schoolDivisionInvolved
        ? this.getDivisionNamesByIdss(item.schoolDivisionInvolved.split(',').map(Number))
        : 'N/A', // Prevent error if null //12
      'Date of MOU Uploaded at Interface': item.createdOn
        ? new Date(item.createdOn).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/ /g, '-')
        : 'N/A' , // Prevent error if null //13
      'Approval Status': item.disapprovalReason == null && item.isApproved == 1
        ? 'Approved'
        : item.disapprovalReason?.length > 10 && item.isApproved == 0
        ? 'Disapproved'
        : 'Pending', //14
      
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
  
    const wscols = Array(18).fill({ wpx: 240 }); // Simplified column width assignment
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
  //   const exportedData = this.MouDocumentsData.map(item => ({
  //     MOUId: "MOU/" + item.id,
  //     'Mou Partner Name': item.mouPartnerName,
  //     'Mou Start Date': item.mouStartDate==null?'NA':item.mouStartDate,
  //     'Mou End Date': item.mouEndDate==null?'NA': item.mouEndDate,
  //     'Mou Status': item.mouStatus==null?'NA': item.mouStatus,
  //     // EmployeeName: item.facultyName,
  //     'SPOC Person Name ': item.spocName,
  //     'SPOC Person Email': item.spocEmailId,
  //     'SPOC Person Contact': item.spocContactNo,
  //     'School Division Involved Id ': item.schoolDivisionInvolved,
  //     'MOU Uploaded By Faculty Name': item.createdBy,
  //     'MOU Uploaded By Faculty UID': item.createdBy,
  //     'School Division Involved ': this.getDivisionNamesByIdss(item.schoolDivisionInvolved.split(',').map(Number)),
  //     'Approval Status': item.disapprovalReason == null && item.isApproved == 1 ? 'Approved' : item.disapprovalReason?.length > 10 && item.isApproved == 0 ? 'Disapproved' : 'Pending',
  //     'Date of MOU Uploaded at Interface': new Date(item.createdOn).toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: 'short',
  //       year: 'numeric'
  //     }).replace(/ /g, '-')
  //   }));

  
  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
  
  //   const wscols = [
  //     { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 180 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
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
   
  // exportToExcel(): void {
    
  //   const fileName = 'Mou_UploadDocument_report.xlsx';
  //   const exportedData = this.filteredMouDocumentsData.map(item => ({
  //     MOUId: "MOU/" + item.id,
  //     Employee: item.facultyName,
  //     DivisionInvolved:  this.getSchoolDivisionNames(item.schoolDivisionInvolved),
  //     UploadedBy: item.createdBy,
  //     ApprovalStatus: item.disapprovalReason == null && item.isApproved == 1 ? 'Approved' : item.disapprovalReason?.length > 10 && item.isApproved == 0 ? 'Disapproved' : 'Pending',
  //     MouPartnerOrganisation: item.mouPartnerName,
  //     UploadedOn: new Date(item.createdOn).toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: 'short',
  //       year: 'numeric'
  //     }).replace(/ /g, '-')
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

  //   const wscols = [
  //     { wpx: 100 }, { wpx: 150 }, { wpx: 200 }, { wpx: 150 }, { wpx: 100 }, { wpx: 200 }, { wpx: 100 }
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

      this.mouDocumentsService.MouDocumentUpdateFile(formData).subscribe({
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
