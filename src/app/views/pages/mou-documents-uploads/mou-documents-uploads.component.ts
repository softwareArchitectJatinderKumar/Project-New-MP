
import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}
interface MouCategory{
  id: number;
  CategoryName: string;
}
interface Employee {
  employeeName: string;
  employeeCode: string;
}
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { json } from 'ngx-custom-validators/src/app/json/validator';
@Component({
  selector: 'app-mou-documents-uploads',
  templateUrl: './mou-documents-uploads.component.html',
  styleUrls: ['./mou-documents-uploads.component.scss']
})
export class MouDocumentsUploadsComponent implements OnInit {
  AllMouCategories: MouCategory[] = [];
  SelectedMouCategory: any = null;
  selectedCategory: number[] = [];
  hasCategoryError: boolean = true;


  GetAllCategories(): void {
  this.mouDocumentsService.GetMouCategories().subscribe(response => {

    this.AllMouCategories = response.item1.map((x: any, index: number) => ({
      id: index + 1,
      CategoryName: x.items
    }));

  });
}
  // GetAllCategories(): void {
  //   this.mouDocumentsService.GetMouCategories().subscribe((response) => {
  //     if (response.item1.length > 0) {
  //       this.AllMouCategories = response.item1;
  //     } else {
  //       this.AllMouCategories = [];
  //     }
  //   });
  // }

changeCategory(event: any) {
  this.SelectedMouCategory= event['items'];
  this.hasCategoryError = !event;
}


  CategoryFilter: string = 'all';
  




// ended Logic 15-7-26

  newMouid: any;


  getRecordsForRenewedPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    return this.AllRenewedMouDetails.slice(startIndex, endIndex);
  }

  // Added on 14-May-25

  statusFilter: string = 'all';
  searchQuery: any = '';

  @ViewChild('ViewRenewedMouDetailsModal') ViewRenewedMouDetailsModal: TemplateRef<any>;
  renewedMouDocumentDetails: any[] = [];
  ColumnMode = ColumnMode;
  columns: any;

  onStatusChange(event: any): void {
    this.applyFilters();
  }

applyFilters(): void {

  let filtered = [...this.MouDocumentsData];

  // Status Filter
  if (this.statusFilter !== 'all') {

    filtered = filtered.filter(item => {

      switch (this.statusFilter) {

        case 'active':
          return item.mouStatus === 'Active';

        case 'expired':
          return item.mouStatus === 'Expired'
            && (item.renewalCount == null || Number(item.renewalCount) === 0);

        case 'renewed':
          return item.renewalCount != null
            && Number(item.renewalCount) > 0;

        default:
          return true;
      }

    });

  }

  // Category Filter
  if (this.SelectedMouCategory != null) {

    filtered = filtered.filter(item =>
      String(item.mouCategory ?? '').toLowerCase() ===
      this.SelectedMouCategory.CategoryName.toLowerCase()
    );

  }

  // Search Filter
  const query = this.searchQuery.trim().toLowerCase();

  if (query) {

    filtered = filtered.filter(item =>
      Object.entries(item).some(([key, value]) => {

        if (value == null) {
          return false;
        }

        // Search by MOU Id
        if (key === 'id') {
          const id = Number(value);

          return !isNaN(id) &&
            (id.toString().includes(query) ||
              `mou/${id}`.includes(query));
        }

        return String(value).toLowerCase().includes(query);

      })
    );

  }

  this.filteredMouDocumentsData = filtered;
}
  // applyFilters(): void {
  //   // First filter by status
  //   let filtered = this.MouDocumentsData.filter(item => {
  //     if (this.statusFilter === 'all') {
  //       return true;
  //     }

  //     if (this.statusFilter === 'active') {
  //       return item.mouStatus === 'Active';
  //     } else if (this.statusFilter === 'expired') {
  //       return item.mouStatus === 'Expired' && item.renewalCount == null && item.renewalCount != 0  ;
  //     } else if (this.statusFilter === 'renewed') {
  //       return item.renewalCount > 0 || item.renewalCount !== 'null' && item.renewalCount !== null && item.renewalCount !== undefined && item.renewalCount !== '0';
  //     } 
  //     return true;
  //   });

  //   // Then apply search filter if exists
  //   const query = this.searchQuery.trim().toLowerCase();
  //   if (query) {
  //     filtered = filtered.filter(item => {
  //       return Object.entries(item).some(([key, val]) => {
  //         if (val !== null && val !== undefined) {
  //           let valueString = String(val).toLowerCase();

  //           // Special handling for mouid (Numeric & "MOU/x" String Comparison)
  //           if (key === 'id') {
  //             const numericId = Number(val);
  //             if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
  //               return true;
  //             }
  //           }

  //           // General search for all other fields
  //           return valueString.includes(query);
  //         }
  //         return false;
  //       });
  //     });
  //   }

  //   this.filteredMouDocumentsData = filtered;
  // }

  getActiveCount(): number {
    return this.MouDocumentsData.filter(item => {
      return item.mouStatus === 'Active';
    }).length;
  }

  getExpiredCount(): number {
    return this.MouDocumentsData.filter(item => {
      return item.mouStatus === 'Expired';
    }).length;
  }
  AllRenewedMouDetails :any[] = [];
  getRenewedCount(): number {
    this.AllRenewedMouDetails = this.MouDocumentsData.filter(item => {
      return item.renewalCount >0  || item.renewalCount != null && item.renewalCount !== undefined && item.renewalCount !== '0' && item.renewalCount !== 'null';
    });
    return this.MouDocumentsData.filter(item => {
      return item.renewalCount >0  || item.renewalCount != null && item.renewalCount !== undefined && item.renewalCount !== '0' && item.renewalCount !== 'null';
    }).length;
  }

   onDownloadFile(remoteUrl: string): void {
      swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); }});
  
      this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
        next: (blob: Blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
  
          const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
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

  OpenAllMouRenewalHistory(row: any): void {
    this.mouId = row.id;
    this.newMouid= row.newMouId;
    this.getRenewedMouDetails(row.id);
    
     this.modalService.open(this.ViewRenewedMouDetailsModal,  { size: 'xl', windowClass: 'modal-xl' ,backdrop: 'static'} ).result.then(() => {
      setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
      // Modal closed
    }).catch(() => { 
      window.location.reload()

    });
  }

 

  getRenewedMouDetails(mouId: any): void {
    this.mouDocumentsService.GetRenewedMouDetails(mouId).subscribe((response) => {
      if (response.item1.length > 0) {
        this.renewedMouDocumentDetails = response.item1;
      } else {
        this.renewedMouDocumentDetails = [];
      }
    });
  }




// added on 12-May-26 
@ViewChild('ChangeSchoolDivisionModal') ChangeSchoolDivisionModal: TemplateRef<any>;
CurrentSchool: any;
 mouForm: FormGroup;
  mouId: any;
  isRenewalMode: boolean = false;
  renewalFile: File | null = null;
  renewalFileBase64: string | null = null;
  renewalFileName: string = '';
  renewalFileError: string = '';
  originalMouData: any = null;

  
  onInput2() {
    const query = this.mouForm.get('lpuSpocName')?.value?.toLowerCase();

    if (query && query.length >= 2) {
      this.filteredEmployeesData = this.EmployeeData.filter(emp =>
        emp.employeeName.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query)
      ).slice(0, 10); // Limit to top 10 for clean UI

      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }


   selectEmployee2(employee: Employee) {
    // This updates the variables used in your console.log/HTML
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;
    this.AssignedToUidName = employee.employeeName;

    // IMPORTANT: This updates the Reactive Form state for the API
    this.mouForm.patchValue({
      lpuSpocName: employee.employeeName,
      lpuSpocUid: employee.employeeCode // This ensures the UID is captured
    });

    // Update the separate search control if you are still using it
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);

    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkUIDValidity();
  }


  
  onRenewFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    
    // Validate file type (PDF and Word documents only)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      this.renewalFileError = 'Only PDF and Word documents are allowed.';
      return;
    }
    
    this.renewalFile = file;
    this.renewalFileName = file.name;
    this.renewalFileError = '';
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Data URL format: "data:application/pdf;base64,<base64string>"
      const base64Data = result.split(',')[1];
      this.renewalFileBase64 = base64Data;
    };
    reader.readAsDataURL(file);
  }

    onSubmitModal(): void {
    if (this.isRenewalMode) {
      this.onSubmitRenew();
    } 
  }

  onSubmitRenew(): void {
    if (this.mouForm.invalid) {
      this.mouForm.markAllAsTouched();
      const invalidFields: string[] = [];
      const controls = this.mouForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidFields.push(name);
        }
      }
      swal.fire({
        title: 'Validation Error',
        html: `<p>Please fill in all required fields:</p><ul class="text-start">${invalidFields.map(f => `<li>${this.getFieldDisplayName(f)}</li>`).join('')}</ul>`,
        icon: 'error'
      });
      return;
    }
    
    if (!this.renewalFile) {
      swal.fire('Error', 'Please upload a MOU document for renewal.', 'error');
      return;
    }
    
    if (!this.renewalFileBase64) {
      swal.fire('Error', 'File is still being processed. Please try again.', 'error');
      return;
    }
    
    const val = this.mouForm.getRawValue();
    
    // Compute new MOU status based on dates
    let newMouStatus = 'Active';
    const today = new Date();
    const startDate = val.startDate ? new Date(val.startDate) : null;
    const endDate = val.isIndefinite ? null : (val.endDate ? new Date(val.endDate) : null);
    
    if (val.isIndefinite) {
      newMouStatus = 'Active';
    } else if (startDate) {
      if (!endDate || (today >= startDate && today <= endDate)) {
        newMouStatus = 'Active';
      } else {
        newMouStatus = 'Expired';
      }
    } else {
      newMouStatus = 'Expired';
    }
    
    // Prepare FormData for new MOU upload
    const formData = new FormData();

    formData.append('UID', this.EmployeeCode);
    formData.append('MasterMouId', this.mouId);
    formData.append('RenewalRemark', val.remarks);
    // formData.append('MouTitle', val.mouOrganisation);
    // formData.append('MouPartnerName', val.mouOrganisation);
    // formData.append('FacultyName', this.EmployeeName);
    formData.append('FilePath', this.renewalFileName);
    formData.append('File', this.renewalFileBase64);
    formData.append('MouStartDate', val.startDate);
    formData.append('MouEndDate', val.endDate);
    formData.append('MouStatus', newMouStatus);
    formData.append('SchoolDivisionInvolved', val.selectedDivisions.join(','));
    formData.append('SPOCName', val.spocName);
    formData.append('SPOCEmailId', val.spocEmail);
    formData.append('SPOCContactNo', val.spocContact);
    formData.append('LPUSpocName', val.lpuSpocName);
    formData.append('LPUSpocUID', val.lpuSpocUid);
    formData.append('LPUSpocEmail', val.lpuSpocEmail);
   
    formData.append('CreatedBy', this.EmployeeCode);
     
    swal.fire({
      title: 'Renew MOU',
      text: 'Are you sure you want to renew this MOU? This will create a new MOU and mark the old one as Renewed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, renew MOU',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.mouDocumentsService.MouRenewalDetails(formData).subscribe({
          next: (data: any) => {
            const resultMsg = data.item1 && data.item1.length > 0 ? data.item1[0].msg : data.responseData;
            if (resultMsg === 'success' ) {
             swal.fire('Success', 'Renewed MOU.', 'success');
             window.location.reload();
            } else if( data.responseData == 'Failed') {
              swal.fire('Error', 'Failed to create new MOU. Please try again.', 'error');
              window.location.reload();
            }
          },
          error: (err) => {
            swal.fire('Error', 'Failed to upload new MOU document.', 'error');
          }
        });
      }
    });
    
  }

  // Helper for Template to check validation
  isInvalid(controlName: string): boolean {
    const control = this.mouForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Helper to get display name for form fields
  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'mouOrganisation': 'Partner Organisation Name',
      'selectedDivisions': 'Divisions Involved',
      'startDate': 'Start Date',
      'endDate': 'End Date',
      'spocName': 'SPOC Name',
      'spocEmail': 'SPOC Email',
      'spocContact': 'SPOC Contact',
      'lpuSpocName': 'LPU SPOC Name',
      'lpuSpocUid': 'LPU SPOC UID',
      'remarks': 'Renew Remarks',
      'mouid': 'Original Mouid',
      'lpuSpocEmail': 'LPU SPOC Email'
    };
    return fieldNames[fieldName] || fieldName;
  }

initForm() {
    this.mouForm = this.fb.group({
      mouId: [{ value: '', disabled: true }], // Locked field
      selectedDivisions: [[], [Validators.required]],
      mouOrganisation: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      isIndefinite: [false],
      spocName: ['', [Validators.required]],
      spocEmail: ['', [Validators.required, Validators.email]],
      spocContact: [''],
      lpuSpocName: ['', [Validators.required]], // Internal SPOC Name
      lpuSpocUid: ['', [Validators.required]],  // Internal SPOC UID
      lpuSpocEmail: ['', [Validators.required, Validators.email]] ,// Internal SPOC Email
      remarks: ['', [Validators.required]] // Internal SPOC Email
    });
  }


  openRenewModal(row: any): void {
    this.isRenewalMode = true;
    this.showSuggestions = false;
    this.filteredEmployeesData = [];
    this.originalMouData = { ...row };

    // Reset file upload fields
    this.renewalFile = null;
    this.renewalFileBase64 = null;
    this.renewalFileName = '';
    this.renewalFileError = '';

    // Populate form with existing MOU data
    this.mouForm.patchValue({
      mouId: row.id,
      selectedDivisions: row.schoolDivisionInvolved ? row.schoolDivisionInvolved.split(',') : [],
      mouOrganisation: row.mouPartnerName,
      startDate: this.formatDate(row.mouStartDate),
      endDate: this.formatDate(row.mouEndDate),
      isIndefinite: row.mouStatus === 'Active' && !row.mouEndDate,
      spocName: row.spocName,
      spocEmail: row.spocEmailId,
      spocContact: row.spocContactNo,
      lpuSpocName: row.lpuSpocName,
      lpuSpocUid: row.lpuSpocUID,
      lpuSpocEmail: row.lpuSpocEmail
    });

    // Set display variables
    this.mouId = row.id;
    this.AssignedToUid = row.lpuSpocUID;
    this.AssignedToUidName = row.lpuSpocName;
    this.moustatus = row.mouStatus;
    this.MouStartDate = row.mouStartDate;
    this.MouEndDate = row.mouEndDate;
    this.isIndefiniteMou = row.mouStatus === 'Active' && !row.mouEndDate;
    this.CurrentSchool = row.schoolDivisionInvolved;

    this.modalService.open(this.ChangeSchoolDivisionModal, { size: 'xl', windowClass: 'modal-xl', backdrop: 'static' }).result.then(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
      // this.modalService.open(this.ChangeSchoolDivisionModal, { size: 'lg', backdrop: 'static' }).result.then(() => {
      // Modal closed
    }).catch(() => {

    });
  }

  // Logic added start on 24-Nov-25
  IdX: any;
  LPUSpocEmail: any = '';
  employeeControl = new FormControl();
  EmployeeData: Employee[] = [];
  filteredEmployeesData: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex: number = -1;
  ResponsiblePerson: any = '';
  AssignedToUid: any = '';
  AssignedToUidName: any = '';
  GetEmployeeData(): void {
    this.mouDocumentsService.GetEmployeeData().subscribe({
      next: response => {
        this.EmployeeData = response.item1.length > 0 ? response.item1 : [];
      },
      error: err => console.error(err)
    });
  }



  onInput() {
    const inputValue = (this.employeeControl.value || '').toLowerCase();
    if (inputValue) {
      this.filteredEmployeesData = this.EmployeeData.filter(employee =>
        employee.employeeName.toLowerCase().includes(inputValue) ||
        employee.employeeCode.toLowerCase().includes(inputValue)
      ).slice(0, 10);
    } else {
      this.filteredEmployeesData = [];
    }
    this.showSuggestions = true;
    this.activeSuggestionIndex = -1;
  }

  selectEmployee(employee: Employee) {
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;
    this.AssignedToUidName = employee.employeeName;
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkUIDValidity();
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

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 200);
  }


  checkUIDValidity(): void {
    this.uploadEnabled = this.IdX !== '' && this.AssignedToUid != '';
  }





  // Logic End on 24-Nov-25
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
    private authService: AuthService, private modalService: NgbModal,
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
        this.initForm();
        this.GetAllCategories();
        this.storageService.saveUser(data);
        this.GetEmployeeDetails();
        this.GetAllActivities();
        this.GetEmployeeData();
        
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
          this.EmployeeCode = '31930';// response.item1[0].employeeCode;
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
    formData.append('MouCategory', this.SelectedMouCategory);
    formData.append('MouTitle', this.MouPartner);
    formData.append('MouPartnerName', this.MouPartner);
    formData.append('FacultyName', this.EmployeeName);
    formData.append('MouStartDate', this.MouStartDate);
    formData.append('MouEndDate', this.MouEndDate.length > 0 ? this.MouEndDate : 'null');
    formData.append('MouStatus', this.moustatus);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    formData.append('CreatedBy', this.EmployeeCode);
    formData.append('SchoolDivisionInvolved', this.SchoolInvolved);
    formData.append('SPOCName', this.SOPCName);
    formData.append('SPOCEmail', this.SOPCEmail);
    formData.append('SPOCContact', this.SOPCNumber);
    formData.append('LPUSpocName', this.AssignedToUidName);
    formData.append('LPUSpocUID', this.AssignedToUid);
    formData.append('LPUSpocEmail', this.LPUSpocEmail);

    // formData.forEach((value, key) => {
    // console.log(`${key}: ${value}`);
    // });
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
          //  console.log(JSON.stringify(this.MouDocumentsData))
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
    return division ? division?.schoolDivision : ' ' + id;
  }
  getDivisionNamesByIdss(ids: number[]): string {
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }

  exportToExcel(): void {
    const fileName = 'Mou_Document_report.xlsx';

    const exportedData = this.MouDocumentsData.map(item => ({
      NewMouid: (item.newMouId ?? 'Disapproved'),//1
      OldMOUId: "MOU/" + (item.id ?? 'N/A'),//1
      'Mou Partner Name': item.mouPartnerName ?? 'N/A',//2
      'Mou Start Date': item.mouStartDate ?? 'N/A',//3
      'Mou End Date': item.mouEndDate ?? 'N/A',//4
      'Mou Status': item.mouStatus ?? 'N/A',//5
      'SPOC Person Name (Mou Partner Organisation)': item.spocName ?? 'N/A',//6
      'SPOC Person Email (Mou Partner Organisation)': item.spocEmailId ?? 'N/A',//7,
      'SPOC Person Contact (Mou Partner Organisation)': item.spocContactNo == 'undefined' ? 'N/A' : item.spocContactNo ?? 'N/A',//8
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
        : 'N/A', // Prevent error if null //13
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
