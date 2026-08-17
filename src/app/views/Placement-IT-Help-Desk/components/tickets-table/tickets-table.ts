/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { HelpDeskTicket } from '../../models/help-desk.model';

export interface TicketDeleteRequest {
  ticket: HelpDeskTicket;
  remarks: string;
}

/**
 * Read-only tickets grid for the "Show Requests" tab, plus a per-row Delete action.
 * Angular 14 port note: source uses signal `input.required`/`output()`; ported to `@Input`/
 * `@Output` (Angular 14 has no signal inputs/outputs API).
 */
@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.html',
  styleUrls: ['./tickets-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsTable {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  @Input() rows!: readonly HelpDeskTicket[];

  /** Emitted once the user confirms the delete remarks; the parent page owns the actual API call. */
  @Output() deleteTicket = new EventEmitter<TicketDeleteRequest>();

  protected readonly deleteTicketForm = this.fb.group({
    remarks: ['', Validators.required],
  });

  private ticketPendingDelete: HelpDeskTicket | null = null;

  trackByTicketId(_index: number, ticket: HelpDeskTicket): number {
    return ticket.id;
  }

  openDeleteModal(content: any, ticket: HelpDeskTicket): void {
    this.ticketPendingDelete = ticket;
    this.deleteTicketForm.reset({ remarks: '' });
    this.modalService.open(content, { centered: true });
  }

  submitDeleteTicket(modal: any): void {
    if (this.deleteTicketForm.invalid) {
      this.deleteTicketForm.markAllAsTouched();
      return;
    }
    if (!this.ticketPendingDelete) return;

    const remarks = this.deleteTicketForm.value.remarks ?? '';
    this.deleteTicket.emit({ ticket: this.ticketPendingDelete, remarks });
    this.ticketPendingDelete = null;
    modal.close();
  }
}
