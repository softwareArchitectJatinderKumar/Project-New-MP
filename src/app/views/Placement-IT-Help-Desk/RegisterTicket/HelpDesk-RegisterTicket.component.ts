import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

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
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { PlacementService } from 'src/app/_services/placement.service';
import { HelpDeskApi } from 'src/app/_services/help-desk-api';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  HelpDeskSearchCriteria,
  HelpDeskTicket, HelpDeskStaffDetails
} from 'src/app/_model/help-desk.model';
import { forkJoin } from 'rxjs';

export interface TicketDeleteRequest {
  ticket: HelpDeskTicket;
  remarks: string;
}
@Component({
  selector: 'app-HelpDesk-RegisterTicket',
  templateUrl: './HelpDesk-RegisterTicket.component.html',
  styleUrls: ['./HelpDesk-RegisterTicket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpDeskRegisterTicketComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly helpDeskApi = inject(HelpDeskApi);
  private readonly placementService = inject(PlacementService);
  private readonly mouDocumentsService = inject(MouDocumentsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly spinner = inject(NgxSpinnerService);
  protected readonly requestCategoryOptions = ['UMS', 'Placement'];
  protected readonly priorityOptions = ['Low', 'Medium', 'High'];
  protected readonly serverUrl ='https://files.lpu.in/Placements/DraftAnalysis/';//'http://172.19.2.206/umsweb/Placements/DraftAnalysis/';// 'https://files.lpu.in/Placements/DraftAnalysis/'; // https://files.lpu.in/umsweb/placements/RAGGuidelines.pdf 
  protected readonly mockResponsibleUsers = [
    { id: '31309', name: 'Jatinder Kumar (Staff)' },
    { id: '33138', name: 'Mohd Danish (Staff)' },
    { id: '20909', name: 'Karan Gupta (Support)' },
    { id: '22026', name: 'Raghav Gupta (Support)' },
    { id: '25899', name: 'Jatin Sarpal (Support)' },
  ];

  protected isAccessDenied = false;
  isLoginFailed = false;
  protected loading = false;

  protected tickets: HelpDeskTicket[] = [];
  protected ResponsibleStaff: HelpDeskStaffDetails[] = [];
  protected filteredTickets: HelpDeskTicket[] = [];

  protected searchText = '';
  protected currentPage = 1;
  protected pageSize = 5;
  protected hasActiveFilter = false;
  protected showAdvancedSearch = false;

  protected activeTab: 'New Request' | 'Show Requests' = 'New Request';

  setActiveTab(tab: 'New Request' | 'Show Requests'): void {
    this.activeTab = tab;
  }

  protected get pagedTickets(): HelpDeskTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  private createdBy: any;

  protected readonly form = this.fb.group({
    requestCategory: ['', Validators.required],
    subCategory: [{ value: '', disabled: true }, Validators.required],
    subMenu: [{ value: '', disabled: true }, Validators.required],
    priority: ['', Validators.required],
    subject: ['', Validators.required],
    description: ['', Validators.required],
    file: [null as File | null],
    srsRequired: [false],
    responsibleUsers: [[] as string[], Validators.required],
  });

  protected subCategoryOptions: readonly { id: string; name: string }[] = [];
  protected subMenuOptions: readonly { id: string; name: string }[] = [];
  InternalLevels: string = '';
  ExternalLevel: string = '';
  today: any;

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML =
      'Placement Support <span class="themeClr"> Help Desk </span> Registration Page';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width =
      '164px';
    const loginName = this.route.snapshot.paramMap.get('loginName');
    if (loginName) {
   
      this.authenticate(loginName);
    } else {
      // this.GetEmployeeDetails();
      this.handleAccessDenied();
    }
  }


  public loadStaff(): void {
    this.loading = true;
    this.spinner.show();
    const formData = new FormData();
    formData.append('Action', 'GetStaff');

    this.placementService
      .PlacementHelpDeskGetStaff(formData)
      .subscribe({
        next: (res: any) => {
          const data = res?.item1 || res || [];
          const mappedStaff: HelpDeskStaffDetails[] = data.map((item: any) => ({
            EmployeeName: item.employeeName || item.EmployeeName,
            EmployeeCode: item.employeeCode || item.EmployeeCode,
            Department: item.department || item.Department,
          }));
          this.ResponsibleStaff = mappedStaff;
          this.loading = false;
          this.spinner.hide();
          this.cdr.markForCheck();
        },
        error: () => {
          Swal.fire('Error', 'Failed to load staff.', 'error');
          this.loading = false;
          this.spinner.hide();
          this.cdr.markForCheck();
        },
      });
  }

  private LoadForm(): void {
    this.form
      .get('requestCategory')
      ?.valueChanges.subscribe((value) => this.onRequestCategoryChange(value));
    this.form
      .get('subCategory')
      ?.valueChanges.subscribe((value) => this.onSubCategoryChange(value));
  }


  EmployeeDetails: any[] = [];
  EmployeeName: string = '';
  EmployeeCode: string = '';
  Department: string = '';
  DepartmentName: string = '';
  loadingIndicator: boolean = false;
  showNoDataFoundMessage: boolean = false;
  // isLoginFailed: boolean = false;

  GetEmployeeDetails(): void {
    this.spinner.show();
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.createdBy = this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isAccessDenied = false;
          this.isLoginFailed = false;  
          this.LoadForm();
          this.loadAllData();
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.spinner.hide();
          this.handleAccessDenied();  
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.handleAccessDenied();
      },
    });
  }

  private onRequestCategoryChange(requestCategory: string | null): void {
    const subCategoryControl = this.form.get('subCategory');

    subCategoryControl?.setValue('', { emitEvent: false });
    this.subCategoryOptions = [];

    if (requestCategory === 'Placement') {
      this.spinner.show();
      const formData = new FormData();
      formData.append('Type', 'P');
      formData.append('MenuType', 'Menu');
      formData.append('MenuId', '0');

      this.placementService.getPlacementMenuDetails(formData).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const menuItems = res?.item1 || [];
          const options = menuItems.map((item: any) => ({
            id: String(item.menuId || item.MenuId || item),
            name: String(
              item.menuName ||
              item.MenuId ||
              item.Name ||
              item.name ||
              item.text ||
              item,
            ),
          }));
          this.subCategoryOptions = options;
          subCategoryControl?.enable({ emitEvent: false });
          this.cdr.markForCheck();
        },
        error: () => {
          this.spinner.hide();
          this.subCategoryOptions = [];
          subCategoryControl?.enable({ emitEvent: false });
          this.cdr.markForCheck();
        },
      });
    } else if (requestCategory === 'UMS') {
      // API call to be implemented later for UMS. Using mock data for now.
      this.subCategoryOptions = [
        { id: 'ums1', name: 'UMS Sub 1' },
        { id: 'ums2', name: 'UMS Sub 2' },
      ];
      subCategoryControl?.enable({ emitEvent: false });
    } else {
      subCategoryControl?.disable({ emitEvent: false });
    }
  }

  private onSubCategoryChange(menuId: string | null): void {
    const subMenuControl = this.form.get('subMenu');
    subMenuControl?.setValue('', { emitEvent: false });
    this.subMenuOptions = [];

    if (menuId && this.form.get('requestCategory')?.value === 'Placement') {
      this.spinner.show();
      const formData = new FormData();
      formData.append('Type', 'P');
      formData.append('MenuType', 'Submenu');
      formData.append('MenuId', menuId);

      this.placementService.getPlacementMenuDetails(formData).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const menuItems = res?.item1 || [];
          const options = menuItems.map((item: any) => ({
            id: String(item.menuId || item.MenuId || item),
            name: String(
              item.menuName ||
              item.MenuName ||
              item.Name ||
              item.name ||
              item.text ||
              item,
            ),
          }));
          if (options.length === 0) {
            this.subMenuOptions = [{ id: 'NA', name: 'NA' }];
            subMenuControl?.setValue('NA', { emitEvent: false });
            subMenuControl?.disable({ emitEvent: false });
          } else {
            this.subMenuOptions = options;
            subMenuControl?.enable({ emitEvent: false });
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.spinner.hide();
          this.subMenuOptions = [{ id: 'NA', name: 'NA' }];
          subMenuControl?.setValue('NA', { emitEvent: false });
          subMenuControl?.disable({ emitEvent: false });
          this.cdr.markForCheck();
        },
      });
    } else {
      subMenuControl?.disable({ emitEvent: false });
    }
  }

  private authenticate(loginName: string): void {
    this.spinner.show();
    this.authService.loginTemp(loginName).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);

        this.GetEmployeeDetails();
        this.loadStaff();
      },
      error: () => {
        this.spinner.hide();
        this.handleAccessDenied();
      },
    });
  }

  private handleAccessDenied(): void {
    this.isAccessDenied = true;
    this.isLoginFailed = true; // <-- Add this line
    this.cdr.markForCheck();
    Swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    });
  }

  public loadAllData(): void {
    this.loading = true;
    this.spinner.show();
    const formData = new FormData();
    formData.append('Action', 'GETALL');

    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const data = res?.item1 || res || [];
          const mappedTickets: HelpDeskTicket[] = data.map((item: any) => ({
            id: String(item.id || item.Id),
            requestFor: item.requestFor || item.RequestFor,
            mainMenu: item.mainMenu || item.MainMenu,
            submenu: item.subMenu || item.SubMenu,
            subject: item.subject || item.Subject,
            description: item.description || item.Description,
            filePath: item.filePath || item.FilePath,
            responsibleUserIds:
              item.responsibleUserIds || item.ResponsibleUserIds,
            status: item.status || item.Status,
            isApproved: item.isApproved || item.IsApproved,
            createdBy: item.createdBy || item.CreatedBy,
            createdOn:
              item.createdOn ||
              item.CreatedOn ||
              item.cratedOn ||
              item.CratedOn,
            priority: item.priority || item.Priority,
            approvalRemarks: item.approvalRemarks || item.ApprovalRemarks,
          }));
          this.tickets = mappedTickets;
          this.filteredTickets = mappedTickets;
          this.selectedTicketIds = [];
          this.isBulkDelete = false;
          this.loading = false;
          this.spinner.hide();
          this.cdr.markForCheck();
        },
        error: () => {
          Swal.fire('Error', 'Failed to load tickets.', 'error');
          this.loading = false;
          this.spinner.hide();
          this.cdr.markForCheck();
        },
      });
  }

  public resetForm(): void {
    this.form.reset({
      requestCategory: '',
      subCategory: '',
      subMenu: '',
      priority: '',
      subject: '',
      description: '',
      file: null,
      srsRequired: false,
      responsibleUsers: [],
    });
    this.form.get('subCategory')?.disable({ emitEvent: false });
    this.form.get('subMenu')?.disable({ emitEvent: false });
    this.subCategoryOptions = [];
    this.subMenuOptions = [];
    this.FileData = null;
    this.FileName = null;
    this.fileData = null as any;
    this.fileStatus = false;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    // Lookup names from the options arrays since the form holds the IDs
    const subCategoryName =
      this.subCategoryOptions.find(
        (o) => String(o.id) === String(value.subCategory),
      )?.name || value.subCategory;
    const subMenuName =
      this.subMenuOptions.find((o) => String(o.id) === String(value.subMenu))
        ?.name || value.subMenu;

    const formData = new FormData();
    formData.append('Action', 'INSERT');
    formData.append('RequestFor', value.requestCategory ?? '');
    formData.append('MainMenu', subCategoryName ?? '');
    formData.append('SubMenu', subMenuName ?? '');
    formData.append('Subject', value.subject ?? '');
    formData.append('IsSrsRequired', value.srsRequired ? 'True' : 'False');
    formData.append('Priority', value.priority ?? '');
    formData.append('Description', value.description ?? '');
    formData.append('Remarks', '');

    if (this.FileData) {
      formData.append('FileData', this.FileData);
      formData.append('FilePath', this.FileName);
    }

    formData.append('Status', 'Open');

    if (value.responsibleUsers && value.responsibleUsers.length > 0) {
      formData.append('ResponsibleUserIds', value.responsibleUsers.join(','));
    }

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            this.handleSubmitResult({ id: item.returnId } as HelpDeskTicket);
          } else {
            Swal.fire({
              title: 'Error',
              text: item?.msg || item?.message || 'Failed to create ticket',
              icon: 'error',
            }).then(() => {
              window.location.reload();
            });
          }
        },
        error: () => {
          this.spinner.hide();
          Swal.fire({ title: 'Something went Wrong', icon: 'error' }).then(() => {
            window.location.reload();
          });
        },
      });
  }

  protected onDeleteTicket(event: { ticket: any; remarks: string }): void {
    const formData = new FormData();
    formData.append('Action', 'Delete');
    formData.append('Id', String(event.ticket.id));
    formData.append('Remarks', event.remarks);
    formData.append('LoginName', this.createdBy);

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            Swal.fire(
              'Success',
              item.msg || 'Ticket deleted successfully',
              'success',
            );
            this.refreshTickets();
          } else {
            Swal.fire(
              'Error',
              item?.msg || item?.message || 'Failed to delete ticket',
              'error',
            );
          }
        },
        error: () => {
          this.spinner.hide();
          Swal.fire(
            'Error',
            'An error occurred while deleting the ticket.',
            'error',
          );
        },
      });
  }

  private handleSubmitResult(ticket: HelpDeskTicket | null): void {
    if (!ticket) {
      Swal.fire({ title: 'Something went Wrong', icon: 'error' }).then(() => {
        window.location.reload();
      });
      return;
    }
    Swal.fire({
      title: 'Help Desk Request Registered Successfully',
      text: `Ticket ID: ${ticket.id}`,
      icon: 'success',
    }).then(() => {
      window.location.reload();
    });
    this.resetForm();
    this.refreshTickets();
  }

  public refreshTickets(): void {
    this.spinner.show();
    const formData = new FormData();
    formData.append('Action', 'GETALL');

    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const data = res?.item1 || res || [];
          const mappedTickets: HelpDeskTicket[] = data.map((item: any) => ({
            id: String(item.id || item.Id),
            requestFor: item.requestFor || item.RequestFor,
            mainMenu: item.mainMenu || item.MainMenu,
            submenu: item.subMenu || item.SubMenu,
            subject: item.subject || item.Subject,
            description: item.description || item.Description,
            filePath: item.filePath || item.FilePath,
            responsibleUserIds:
              item.responsibleUserIds || item.ResponsibleUserIds,
            status: item.status || item.Status,
            isApproved: item.isApproved || item.IsApproved,
            createdBy: item.createdBy || item.CreatedBy,
            createdOn:
              item.createdOn || item.CreatedOn || item.cratedOn || item.CratedOn,
            priority: item.priority || item.Priority,
            approvalRemarks: item.approvalRemarks || item.ApprovalRemarks,
          }));
          this.tickets = mappedTickets;
          this.filteredTickets = mappedTickets;
          this.selectedTicketIds = [];
          this.isBulkDelete = false;
          this.hasActiveFilter = false;
          this.searchText = '';
          this.currentPage = 1;
          this.spinner.hide();
          this.cdr.markForCheck();
        },
        error: () => {
          this.spinner.hide();
          this.cdr.markForCheck();
        },
      });
  }

  protected onSearchTextChange(value: string): void {
    this.searchText = value;
    this.hasActiveFilter = value.trim().length > 0;
    const lower = value.toLowerCase().trim();
    this.filteredTickets = !lower
      ? this.tickets
      : this.tickets.filter((ticket) =>
        Object.values(ticket).some(
          (v) => v != null && String(v).toLowerCase().includes(lower),
        ),
      );
    this.currentPage = 1;
  }

  protected onApplyAdvancedSearch(criteria: HelpDeskSearchCriteria): void {
    const result = this.tickets.filter((item) => {
      if (criteria.requestFor && item.requestFor !== criteria.requestFor)
        return false;
      if (criteria.submenu && item.submenu !== criteria.submenu) return false;
      if (
        criteria.createdBy &&
        !item.createdBy.toLowerCase().includes(criteria.createdBy.toLowerCase())
      )
        return false;

      const itemDate = item.createdOn ? new Date(item.createdOn) : null;
      const searchStart = criteria.startDate
        ? new Date(criteria.startDate)
        : null;
      const searchEnd = criteria.endDate ? new Date(criteria.endDate) : null;
      if (searchStart && itemDate && itemDate < searchStart) return false;
      if (searchEnd && itemDate && itemDate > searchEnd) return false;

      return true;
    });

    this.filteredTickets = result;
    this.hasActiveFilter = true;
    this.currentPage = 1;
  }

  protected onResetAdvancedSearch(): void {
    this.filteredTickets = this.tickets;
    this.hasActiveFilter = false;
    this.currentPage = 1;
  }

  protected toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (!this.showAdvancedSearch) {
      this.onResetAdvancedSearch();
    }
  }

  private buildExportRows(): Record<string, unknown>[] {
    return this.filteredTickets.map((item) => ({
      id: item.id,
      requestFor: item.requestFor,
      submenu: item.submenu,
      createdBy: item.createdBy,
      createdOn: this.formatDate(item.createdOn),
    }));
  }

  exportToExcel(): void {
    const fileName = 'EventDetails_report.xlsx';

    const exportedData = this.tickets.map((item) => {
      return {
        TicketNumber: item.id,
        Requestfor: item.requestFor,
        MAinMenu: item.mainMenu,
        SubMenu: item.submenu,
        Subject: item.subject,
        Description: item.description,
        ResponsibleUser: item.responsibleUserIds,
        Status: item.status,
        Priority: item.priority,
        CreatedBy: item.createdBy,
        DateOfCreation: item.createdOn,
      };
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);

    const wscols = [
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
      { wpx: 400 },
    ];
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' }),
    );
    link.download = fileName;
    link.click();
  }

  protected exportToPdf(): void {
    // this.pdfTicketsService.exportTickets(this.buildExportRows());
  }

  private formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  protected openBulkUploadModal(): void {
    // const modalRef = this.modalService.open(BulkUploadModal, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.createdBy = this.createdBy;
    // modalRef.result.then(
    //   () => this.refreshTickets(),
    //   () => undefined,
    // );
  }

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  protected onResponsibleUserChange(event: Event, id: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const usersControl = this.form.get('responsibleUsers');
    if (!usersControl) return;

    let currentUsers: string[] = Array.isArray(usersControl.value)
      ? [...usersControl.value]
      : [];
    if (isChecked) {
      if (!currentUsers.includes(id)) {
        currentUsers = [...currentUsers, id];
      }
    } else {
      currentUsers = currentUsers.filter((u) => u !== id);
    }
    usersControl.setValue(currentUsers);
    usersControl.markAsTouched();
    this.cdr.markForCheck();
  }

  protected isResponsibleUserSelected(id: string): boolean {
    const usersControl = this.form.get('responsibleUsers');
    if (!usersControl || !Array.isArray(usersControl.value)) return false;
    return usersControl.value.includes(id);
  }

  FileData: any;
  array: any[] = [];
  fileData!: File;
  fileStatus: boolean = false;
  FileName: any;

  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 3148576) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning',
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
        this.FileName = validFileName;
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
        this.FileName = file.name;
      };
    }
  }

  protected get fileName(): string | null {
    const file = this.form.get('file')?.value as File | null;
    return file ? file.name : null;
  }

  // --- Search & Pagination Logic ---
  filterText: string = '';
  selectedSessionId: any = 0;
  dataSource: any;

  recordsPerPage: string = '10';
  readonly recordsPerPageOptions: string[] = ['5', '10', '15', '20', '25'];

  private matchesSearch(t: HelpDeskTicket, term: string): boolean {
    if (!term) return true;
    const q = term.toLowerCase().trim();
    const idStr = String(t.id || '');
    const formattedId = `tkt-${idStr}`.toLowerCase();

    return (
      idStr.toLowerCase().includes(q) ||
      formattedId.includes(q) ||
      Boolean(t.requestFor && t.requestFor.toLowerCase().includes(q)) ||
      Boolean(t.mainMenu && t.mainMenu.toLowerCase().includes(q)) ||
      Boolean(t.submenu && t.submenu.toLowerCase().includes(q)) ||
      Boolean(t.priority && t.priority.toLowerCase().includes(q)) ||
      Boolean(t.subject && t.subject.toLowerCase().includes(q)) ||
      Boolean(t.description && t.description.toLowerCase().includes(q)) ||
      Boolean(t.status && t.status.toLowerCase().includes(q)) ||
      Boolean(t.remarks && t.remarks.toLowerCase().includes(q)) ||
      Boolean(
        t.approvalRemarks && t.approvalRemarks.toLowerCase().includes(q),
      ) ||
      Boolean(t.updatedBy && String(t.updatedBy).toLowerCase().includes(q)) ||
      Boolean(
        t.approvedBy && String(t.approvedBy).toLowerCase().includes(q),
      ) ||
      Boolean(
        t.createdBy && String(t.createdBy).toLowerCase().includes(q),
      ) ||
      Boolean(
        t.responsibleUserIds &&
        String(t.responsibleUserIds).toLowerCase().includes(q),
      )
    );
  }

  filterData(): void {
    this.currentPage = 1;
    const searchText = (this.filterText ?? '').trim();
    if (!searchText) {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter((t) =>
        this.matchesSearch(t, searchText),
      );
    }
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.filterText = '';
    this.filterData();
  }

  get totalPages(): number {
    if (this.recordsPerPage === 'All' || this.filteredTickets.length === 0) {
      return 1;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    return Math.ceil(this.filteredTickets.length / perPage) || 1;
  }

  get startRecord(): number {
    if (this.filteredTickets.length === 0) return 0;
    if (this.recordsPerPage === 'All') return 1;
    const perPage = Number(this.recordsPerPage) || 10;
    return (this.currentPage - 1) * perPage + 1;
  }

  get endRecord(): number {
    if (this.recordsPerPage === 'All') {
      return this.filteredTickets.length;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    return Math.min(this.currentPage * perPage, this.filteredTickets.length);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getRecordsForCurrentPage(): any[] {
    if (this.recordsPerPage === 'All') {
      return this.filteredTickets;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const startIndex = (this.currentPage - 1) * perPage;
    return this.filteredTickets.slice(startIndex, startIndex + perPage);
  }

  onRecordsPerPageChange(): void {
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.markForCheck();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  @ViewChild('deleteTicketModal') deleteTicketModal: TemplateRef<any>;

  responses: any;
  protected readonly deleteTicketForm = this.fb.group({
    remarks: ['', Validators.required],
  });

  private ticketPendingDelete: HelpDeskTicket | null = null;
  protected selectedTicketIds: string[] = [];
  protected isBulkDelete: boolean = false;

  trackByTicketId(_index: number, ticket: HelpDeskTicket): number {
    return ticket.id;
  }

  isAllSelected(): boolean {
    const currentPageRecords = this.getRecordsForCurrentPage();
    if (currentPageRecords.length === 0) return false;
    return currentPageRecords.every((t) =>
      this.selectedTicketIds.includes(String(t.id))
    );
  }

  toggleAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentPageRecords = this.getRecordsForCurrentPage();
    const pageIds = currentPageRecords.map((t) => String(t.id));
    if (isChecked) {
      const set = new Set([...this.selectedTicketIds, ...pageIds]);
      this.selectedTicketIds = Array.from(set);
    } else {
      this.selectedTicketIds = this.selectedTicketIds.filter(
        (id) => !pageIds.includes(id)
      );
    }
    this.cdr.markForCheck();
  }

  toggleSelection(ticketId: any, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const current = [...this.selectedTicketIds];
    const idStr = String(ticketId);
    if (isChecked) {
      if (!current.includes(idStr)) {
        current.push(idStr);
        this.selectedTicketIds = current;
      }
    } else {
      this.selectedTicketIds = current.filter((id) => id !== idStr);
    }
    this.cdr.markForCheck();
  }

  isTicketSelected(ticketId: any): boolean {
    return this.selectedTicketIds.includes(String(ticketId));
  }

  openBulkDeleteModal(): void {
    if (this.selectedTicketIds.length === 0) {
      swal.fire('Warning', 'Please select at least one ticket to delete.', 'warning');
      return;
    }
    this.isBulkDelete = true;
    this.ticketPendingDelete = null;
    this.deleteTicketForm.reset({ remarks: '' });

    this.modalService
      .open(this.deleteTicketModal, { size: 'lg', backdrop: 'static' })
      .result.then(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      })
      .catch(() => { });
  }

  openDeleteModal(ticket: HelpDeskTicket): void {
    this.isBulkDelete = false;
    this.ticketPendingDelete = ticket;
    this.deleteTicketForm.reset({ remarks: '' });

    this.modalService
      .open(this.deleteTicketModal, { size: 'lg', backdrop: 'static' })
      .result.then(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      })
      .catch(() => { });
  }

  submitDeleteTicket(modal: any): void {
    if (this.deleteTicketForm.invalid) {
      this.deleteTicketForm.markAllAsTouched();
      return;
    }
    const remarks = this.deleteTicketForm.value.remarks ?? '';

    if (this.isBulkDelete) {
      if (this.selectedTicketIds.length === 0) return;
      this.spinner.show();
      const requests = this.selectedTicketIds.map((id) => {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('Id', id);
        formData.append('Action', 'Delete');
        formData.append('Remarks', remarks);
        formData.append('LoginName', this.createdBy || this.EmployeeCode || '');
        return this.placementService.PlacementHelpDeskTicketsCrudOperations(formData);
      });

      forkJoin(requests).subscribe({
        next: (_responses: any[]) => {
          this.spinner.hide();
          swal.fire(
            'Success',
            `${this.selectedTicketIds.length} ticket(s) deleted successfully`,
            'success'
          );
          this.selectedTicketIds = [];
          this.isBulkDelete = false;
          this.refreshTickets();
          modal.close();
        },
        error: () => {
          this.spinner.hide();
          swal.fire('Error', 'An error occurred while deleting selected tickets.', 'error');
          this.refreshTickets();
          modal.close();
        }
      });
      return;
    }

    if (!this.ticketPendingDelete) return;

    const formData = new FormData();
    formData.append('id', this.ticketPendingDelete.id.toString());
    formData.append('Id', this.ticketPendingDelete.id.toString());
    formData.append('Action', 'Delete');
    formData.append('Remarks', remarks);
    formData.append('LoginName', this.createdBy || this.EmployeeCode || '');

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          const item = response?.item1?.[0] || response?.[0];
          if (item) {
            if (
              String(item.returnId) === '-1' ||
              String(item.returnId) === '-2'
            ) {
              swal.fire({
                title: 'Error',
                text: item.msg || item.message || 'Something went wrong',
                icon: 'error',
              });
            } else {
              swal.fire({
                title: 'Success',
                text: item.msg || item.message || 'Ticket deleted successfully',
                icon: 'success',
              });
              if (this.ticketPendingDelete) {
                const deletedId = String(this.ticketPendingDelete.id);
                this.selectedTicketIds = this.selectedTicketIds.filter(id => id !== deletedId);
              }
              this.refreshTickets();
            }
          }
        },
        error: () => {
          this.spinner.hide();
          swal.fire({
            title: 'Error',
            text: 'Failed to delete ticket',
            icon: 'error',
          });
        },
      });

    this.ticketPendingDelete = null;
    modal.close();
  }




  onDownloadFiles(remoteUrl: string): void {
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

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
  onDownloadFile(remoteUrl: string): void {
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

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

  //downloadMOUFileWithFolder

}
