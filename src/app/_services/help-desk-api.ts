import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { HelpDeskTicket, NewHelpDeskTicket } from '../_model/help-desk.model';

/**
 * In-memory Help Desk ticket store. There is no backend for this feature yet, so this service
 * stands in for what would otherwise be an HTTP-backed API facade - same Observable-returning
 * shape, so swapping in a real backend later only touches this file.
 *
 * Angular 14 port note: source keeps `tickets` as a `signal<HelpDeskTicket[]>`; ported to a plain
 * property here (Angular 14 has no signals API).
 */
@Injectable({ providedIn: 'root' })
export class HelpDeskApi {
  private nextId = 1;
  private tickets: HelpDeskTicket[] = this.seedTickets();

  getAllTickets(): Observable<HelpDeskTicket[]> {
    return of(this.tickets);
  }

  registerTicket(ticket: NewHelpDeskTicket): Observable<HelpDeskTicket> {
    const created = this.addTickets([ticket])[0];
    return of(created);
  }

  registerTicketsBulk(tickets: readonly NewHelpDeskTicket[]): Observable<HelpDeskTicket[]> {
    return of(this.addTickets(tickets));
  }

  private addTickets(newTickets: readonly NewHelpDeskTicket[]): HelpDeskTicket[] {
    const createdOn = new Date().toISOString();
    const created = newTickets.map((ticket) => ({
      ...ticket,
      id: this.nextId++,
      createdOn,
      subject: '',
      description: '',
      filePath: '',
      responsibleUserIds: '',
      status: 'Open',
      isApproved: '0',
    }));
    this.tickets = [...created, ...this.tickets];
    return created;
  }

  private seedTickets(): HelpDeskTicket[] {
    const seed: HelpDeskTicket[] = [
      {
        id: 1,
        requestFor: 'UMS',
        mainMenu: '1',
        submenu: 'Password Reset',
        createdBy: 'Admin',
        createdOn: new Date().toISOString(),
        subject: 'Password Reset',
        description: 'Need password reset',
        filePath: '',
        responsibleUserIds: '',
        status: 'Open',
        isApproved: '0',
        priority: '',
      },
      {
        id: 2,
        requestFor: 'Placement',
        mainMenu: '2',
        submenu: 'Resume Upload Issue',
        createdBy: 'Admin',
        createdOn: new Date().toISOString(),
        subject: 'Resume Upload Issue',
        description: 'Cannot upload resume',
        filePath: '',
        responsibleUserIds: '',
        status: 'Closed',
        isApproved: '1',
        priority: '',
      },
      {
        id: 3,
        requestFor: 'UMS',
        mainMenu: '3',
        submenu: 'Result Discrepancy',
        createdBy: 'Admin',
        createdOn: new Date().toISOString(),
        subject: 'Result Discrepancy',
        description: 'Wrong result shown',
        filePath: '',
        responsibleUserIds: '',
        status: 'Open',
        isApproved: '0',
        priority: '',
      },
    ];
    this.nextId = seed.length + 1;
    return seed;
  }
}
