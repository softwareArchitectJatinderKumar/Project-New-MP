/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   inject,
//   OnInit,
// } from "@angular/core";
// import { ActivatedRoute } from "@angular/router";
// import { FormBuilder, Validators } from "@angular/forms";
// import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
// import Swal from "sweetalert2";

// import { AuthService } from "@app/_services/auth.service";
// import { PlacementService } from "@app/_services/placement.service";
// import { HelpDeskTicket } from "@features/help-desk/models/help-desk.model";

// import { StorageService } from "@app/_services/storage.service";
// import { MouDocumentsService } from "@app/_services/mou-documents.service";
// import { PageHeaderService } from "@core/services/page-header";

// /**
//  * Angular 14 port note: source uses `signal`/`computed`; ported to plain properties + getters
//  * (Angular 14 has no signals API).
//  */
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
  selector: 'app-placement-staff-ticket-action',
  templateUrl: './placement-staff-ticket-action.html',
  styleUrls: ['./placement-staff-ticket-action.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacementStaffTicketActionPage implements OnInit {
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
  protected activeTab: 'In Progress' | 'Closed' = 'In Progress';

  // Computed state for UI
  protected get inProgressTickets(): HelpDeskTicket[] {
    return this.tickets.filter(
      (t) => t.status === 'Open' || t.status?.toLowerCase() === 'open',
    );
  }

  protected get closedTickets(): HelpDeskTicket[] {
    return this.tickets.filter(
      (t) => t.status === 'Closed' || t.status?.toLowerCase() === 'closed',
    );
  }

  protected get displayTickets(): HelpDeskTicket[] {
    return this.activeTab === 'In Progress'
      ? this.inProgressTickets
      : this.closedTickets;
  }

  // Modal forms
  protected closeTicketForm = this.fb.group({
    ticketId: [''],
    remarks: ['', Validators.required],
  });

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML =
      'Placement IT Support <span class="themeClr" >Help Desk  </span> Staff Action ';
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

  // getToken(id: any) {
  //   this.authService.loginTemp(id).subscribe({
  //     next: (data) => {
  //       this.storageService.saveUser(data);
  //       this.GetEmployeeDetails();
  //     },
  //     error: (err) => {
  //       this.handleAccessDenied();
  //     },
  //   });
  // }

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
            createdOn:
              item.createdOn ||
              item.CreatedOn ||
              item.cratedOn ||
              item.CratedOn,
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
            approvedOn: item.approvedOn || item.ApprovedOn,
          }));

          let filteredTickets = mappedTickets;

          if (this.EmployeeCode) {
            filteredTickets = mappedTickets.filter((t) =>
              t.responsibleUserIds?.includes(this.EmployeeCode),
            );
          }
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

  setActiveTab(tab: 'In Progress' | 'Closed'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  trackByTicketId(_index: number, ticket: HelpDeskTicket): number {
    return ticket.id;
  }

  openCloseModal(content: any, ticket: HelpDeskTicket): void {
    this.closeTicketForm.reset({ ticketId: String(ticket.id), remarks: '' });
    this.modalService.open(content, { centered: true });
  }

  submitCloseTicket(modal: any): void {
    if (this.closeTicketForm.invalid) {
      this.closeTicketForm.markAllAsTouched();
      return;
    }

    const { ticketId, remarks } = this.closeTicketForm.value;

    const formData = new FormData();
    formData.append('Action', 'UPDATE');
    formData.append('Id', ticketId || '0');
    formData.append('Status', 'Closed');
    formData.append('Remarks', remarks || '');

    formData.append('UpdatedBy', this.EmployeeCode);

    this.spinner.show();
    this.placementService
      .PlacementHelpDeskTicketsCrudOperations(formData)
      .subscribe({
        next: (res: any) => {
          const item = res?.item1?.[0] || res?.[0];
          if (item && String(item.returnId) !== '-1') {
            Swal.fire(
              'Success',
              item.msg || 'Ticket has been closed successfully',
              'success',
            );
            modal.close();
            this.loadAllData();
          } else {
            this.spinner.hide();
            Swal.fire(
              'Error',
              item?.msg || item?.message || 'Failed to close the ticket.',
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
}
