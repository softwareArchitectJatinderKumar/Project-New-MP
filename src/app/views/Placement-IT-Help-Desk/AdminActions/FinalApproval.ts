/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
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
  HelpDeskTicket,
} from 'src/app/_model/help-desk.model';

export interface TicketDeleteRequest {
  ticket: HelpDeskTicket;
  remarks: string;
}
 
@Component({
  selector: 'app-FinalApproval',
  templateUrl: './FinalApproval.html',
  styleUrls: ['./FinalApproval.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalApproval implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly placementService = inject(PlacementService);
  private readonly mouDocumentsService = inject(MouDocumentsService);
  private readonly modalService = inject(NgbModal);
  private readonly fb = inject(FormBuilder);
  private readonly storageService = inject(StorageService);
  // private readonly pageHeaderService = inject(PageHeaderService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly spinner = inject(NgxSpinnerService);

  public readonly currentDate = new Date();

  // State
  protected isAccessDenied = false;
  protected loading = false;
  protected tickets: HelpDeskTicket[] = [];
  protected searchTerm: string = '';

  protected selectedTicketIds: string[] = [];
  protected rowRemarks: Record<string, string> = {};
  protected rowSrsRequired: Record<string, boolean> = {};


  // Modal forms
  protected closeTicketForm = this.fb.group({
    ticketId: [''],
    remarks: ['', Validators.required],
  });
  protected readonly acceptTicketForm = this.fb.group({
    ticketId: [''],
    remarks: ['', Validators.required],
  });
  protected readonly deleteTicketForm = this.fb.group({
    ticketId: [''],
    remarks: ['', Validators.required],
  });

  onRowRemarkChange(ticketId: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.rowRemarks = { ...this.rowRemarks, [ticketId]: val };

    const current = this.selectedTicketIds;
    if (val.trim() !== '') {
      if (!current.includes(ticketId)) {
        this.selectedTicketIds = [...current, ticketId];
      }
    } else {
      if (current.includes(ticketId)) {
        this.selectedTicketIds = current.filter((id) => id !== ticketId);
      }
    }
  }

  onRowSrsRequiredChange(ticketId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.rowSrsRequired = { ...this.rowSrsRequired, [ticketId]: isChecked };
  }

  ngOnInit(): void {

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML =
      'Placement Support <span class="themeClr" >Help Desk  </span> Admin Dashboard';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width =
      '164px';
    const loginName = this.route.snapshot.paramMap.get('loginName');
    if (loginName) {
      this.authenticate(loginName);
    } else {
      this.handleAccessDenied();
    }
  }

  private authenticate(loginName: string): void {
    this.spinner.show();
    this.authService.loginTemp(loginName).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.GetEmployeeDetails();
      },
      error: () => {
        this.spinner.hide();
        this.handleAccessDenied();
      },
    });
  }

  getToken(id: any) {
    this.spinner.show();
    this.authService.loginTemp(id).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.GetEmployeeDetails();
      },
      error: (err) => {
        this.spinner.hide();
        this.handleAccessDenied();
      },
    });
  }

  EmployeeDetails: any[] = [];
  EmployeeName: string = '';
  EmployeeCode: string = '';
  Department: string = '';
  DepartmentName: string = '';
  loadingIndicator: boolean = true;
  showNoDataFoundMessage: boolean = false;
  isLoginFailed: boolean = false;

  GetEmployeeDetails(): void {
    this.spinner.show();
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: (response) => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isAccessDenied = false;
          this.cdr.markForCheck();
          this.loadAllData();
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isAccessDenied = true;
          this.spinner.hide();
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.handleAccessDenied();
      },
    });
  }

  private handleAccessDenied(): void {
    this.isAccessDenied = true;
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
            isApproved: item.isApproved ?? item.IsApproved,
            createdBy: item.createdBy || item.CreatedBy,
            createdOn: item.createdOn || item.createdOn,
            priority: item.priority || item.Priority,
            remarks: item.remarks || item.Remarks,
            updatedBy: item.updatedBy || item.UpdatedBy,
            approvalRemarks: item.approvalRemarks || item.ApprovalRemarks,
            isSrsRequired:
              item.isSRSRequired ??
              item.IsSRSRequired ??
              item.isSrsRequired ??
              item.IsSrsRequired,
            approvedBy: item.approvedBy || item.ApprovedBy,
            approvedOn:
              item.approvedOn ||
              item.ApprovedOn ||
              item.updatedOn ||
              item.UpdatedOn,
          }));

          const filteredTickets = mappedTickets;
          this.tickets = filteredTickets;
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

  trackByTicketId(_index: number, ticket: HelpDeskTicket): number {
    return ticket.id;
  }

  isAllSelected(): boolean {
    const selectable = this.displayTickets.filter((t) => !t.approvalRemarks);
    if (selectable.length === 0) return false;
    return selectable.every((t) =>
      this.selectedTicketIds.includes(String(t.id)),
    );
  }

  toggleAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const selectable = this.displayTickets.filter((t) => !t.approvalRemarks);
    const selectableIds = selectable.map((t) => String(t.id));
    if (isChecked) {
      const set = new Set([...this.selectedTicketIds, ...selectableIds]);
      this.selectedTicketIds = Array.from(set);
    } else {
      this.selectedTicketIds = this.selectedTicketIds.filter(
        (id) => !selectableIds.includes(id),
      );
    }
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
  }

  openRejectModal(content: any, ticket: HelpDeskTicket): void {
    this.closeTicketForm.reset({ ticketId: String(ticket.id), remarks: '' });
    this.modalService.open(content, { centered: true });
  }
  openAcceptModal(content: any, ticket: HelpDeskTicket): void {
    this.acceptTicketForm.reset({ ticketId: String(ticket.id), remarks: '' });
    this.modalService.open(content, { centered: true });
  }
  openDeleteModal(content: any, ticket: HelpDeskTicket): void {
    this.deleteTicketForm.reset({ ticketId: String(ticket.id), remarks: '' });
    this.modalService.open(content, { centered: true });
  }

  submitBulkAction(actionType: 'APPROVE' | 'REJECT'): void {
    const selectedIds = this.selectedTicketIds;
    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'No tickets selected.', 'warning');
      return;
    }

    const remarksObj = this.rowRemarks;
    const missingRemarks = selectedIds.filter(
      (id) => !remarksObj[id] || remarksObj[id].trim() === '',
    );

    if (missingRemarks.length > 0) {
      Swal.fire(
        'Warning',
        'Please provide approval remarks for all selected tickets in the grid.',
        'warning',
      );
      return;
    }

    this.loading = true;
    this.spinner.show();
    let completed = 0;

    selectedIds.forEach((id) => {
      const formData = new FormData();
      formData.append('Action', 'FinalAction');
      formData.append('Id', id);
      formData.append('Ids', id);
      formData.append('IsApproved', actionType === 'APPROVE' ? '1' : '0');
      formData.append('Remarks', remarksObj[id].trim());
      formData.append('LoginName', this.EmployeeCode);
      const isSrsReq = this.rowSrsRequired[id] ? 'true' : 'false';
      formData.append('IsSrsRequired', isSrsReq);

      this.placementService
        .PlacementHelpDeskTicketsCrudOperations(formData)
        .subscribe({
          next: (res: any) => {
            const item = res?.item1?.[0] || res?.[0];
            completed++;
            if (completed === selectedIds.length) {
              Swal.fire(
                'Success',
                item?.msg ||
                  `Successfully ${actionType.toLowerCase()}d selected tickets.`,
                'success',
              );
              this.selectedTicketIds = [];
              this.rowRemarks = {};
              this.rowSrsRequired = {};
              this.loadAllData();
            }
          },
          error: () => {
            completed++;
            if (completed === selectedIds.length) {
              this.loadAllData();
            }
          },
        });
    });
  }

  submitRejectTicket(modal: any): void {
    if (this.closeTicketForm.invalid) {
      this.closeTicketForm.markAllAsTouched();
      return;
    }

    const { ticketId, remarks } = this.closeTicketForm.value;

    const formData = new FormData();
    formData.append('Action', 'DISAPPROVE');
    formData.append('Id', ticketId || '0');
    formData.append('Status', 'Open');
    formData.append(
      'ApprovalRemarks',
      remarks || 'Rejected by ' + this.EmployeeCode,
    );

    formData.append('ApprovedBy', this.EmployeeCode);

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            Swal.fire(
              'Success',
              item.msg || 'Ticket has been rejected successfully',
              'success',
            );
            modal.close();
            this.loadAllData();
          } else {
            this.spinner.hide();
            Swal.fire(
              'Error',
              item?.msg || item?.message || 'Failed to reject the ticket.',
              'error',
            );
          }
        },
        error: () => {
          this.spinner.hide();
          Swal.fire(
            'Error',
            'An error occurred while updating the ticket.',
            'error',
          );
        },
      });
  }
  submitAcceptTicket(modal: any): void {
    if (this.acceptTicketForm.invalid) {
      this.acceptTicketForm.markAllAsTouched();
      return;
    }

    const { ticketId, remarks } = this.acceptTicketForm.value;

    const formData = new FormData();
    formData.append('Action', 'APPROVE');
    formData.append('Id', ticketId || '0');
    formData.append('Status', 'closed');
    formData.append(
      'ApprovalRemarks',
      remarks || 'Approved by ' + this.EmployeeCode,
    );

    formData.append('ApprovedBy', this.EmployeeCode);

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            Swal.fire(
              'Success',
              item.msg || 'Ticket has been approved successfully',
              'success',
            );
            modal.close();
            this.loadAllData();
          } else {
            this.spinner.hide();
            Swal.fire(
              'Error',
              item?.msg || item?.message || 'Failed to approve the ticket.',
              'error',
            );
          }
        },
        error: () => {
          this.spinner.hide();
          Swal.fire(
            'Error',
            'An error occurred while updating the ticket.',
            'error',
          );
        },
      });
  }

  submitDeleteTicket(modal: any): void {
    if (this.deleteTicketForm.invalid) {
      this.deleteTicketForm.markAllAsTouched();
      return;
    }

    const { ticketId, remarks } = this.deleteTicketForm.value;

    const formData = new FormData();
    formData.append('Action', 'Delete');
    formData.append('Id', ticketId || '0');
    formData.append('Remarks', remarks || '');
    formData.append('LoginName', this.EmployeeCode);

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            Swal.fire(
              'Success',
              item.msg || 'Ticket deleted successfully',
              'success',
            );
            modal.close();
            this.loadAllData();
          } else {
            this.spinner.hide();
            Swal.fire(
              'Error',
              item?.msg || item?.message || 'Failed to delete the ticket.',
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



  // --- Search & Pagination Logic ---
  protected currentPage = 1;
  protected recordsPerPage: string = '10';
  protected readonly recordsPerPageOptions: string[] = [
    '5',
    '10',
    '15',
    '20',
    'All',
  ];

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

  protected get filteredTickets(): HelpDeskTicket[] {
    if (!this.searchTerm.trim()) {
      return this.tickets;
    }
    return this.tickets.filter((t) => this.matchesSearch(t, this.searchTerm));
  }

  protected get displayTickets(): HelpDeskTicket[] {
    if (this.recordsPerPage === 'All') {
      return this.filteredTickets;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const start = (this.currentPage - 1) * perPage;
    return this.filteredTickets.slice(start, start + perPage);
  }

  protected get totalPages(): number {
    if (this.recordsPerPage === 'All' || this.filteredTickets.length === 0) {
      return 1;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    return Math.ceil(this.filteredTickets.length / perPage) || 1;
  }

  protected get startRecord(): number {
    if (this.filteredTickets.length === 0) return 0;
    if (this.recordsPerPage === 'All') return 1;
    const perPage = Number(this.recordsPerPage) || 10;
    return (this.currentPage - 1) * perPage + 1;
  }

  protected get endRecord(): number {
    if (this.recordsPerPage === 'All') {
      return this.filteredTickets.length;
    }
    const perPage = Number(this.recordsPerPage) || 10;
    return Math.min(this.currentPage * perPage, this.filteredTickets.length);
  }

  protected get pageNumbers(): number[] {
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

  protected onSearchChange(): void {
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  protected clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  protected onRecordsPerPageChange(): void {
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  protected changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.markForCheck();
    }
  }

  protected prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  protected nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }
}
