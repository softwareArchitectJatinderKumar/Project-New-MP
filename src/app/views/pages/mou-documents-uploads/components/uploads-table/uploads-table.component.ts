import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MouDataGridComponent } from "../data-grid/data-grid.component";

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-mou-uploads-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MouDataGridComponent],
  templateUrl: './uploads-table.component.html',
  styleUrls: ['./uploads-table.component.scss']
})
export class MouUploadsTableComponent {
  @Input() rows: any[] = [];
  @Input() renewedRows: any[] = [];
  @Input() statusFilter: string = 'all';
  @Input() allSchoolDivisions: SchoolDivision[] = [];
  @Input() loading: boolean = false;

  @Output() renew = new EventEmitter<any>();
  @Output() viewHistory = new EventEmitter<any>();

  // Pagination for Active/Expired tab
  currentPage: number = 0;
  recordsPerPage: number = 10;

  // Pagination for Renewed tab
  currentRenewedPage: number = 0;
  recordsRenewedPerPage: number = 10;

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.recordsPerPage = event.pageSize;
  }

  onRenewedPageChange(event: PageEvent) {
    this.currentRenewedPage = event.pageIndex;
    this.recordsRenewedPerPage = event.pageSize;
  }

  getRecordsForCurrentPage(): any[] {
    const start = this.currentPage * this.recordsPerPage;
    const end = start + this.recordsPerPage;
    return this.rows.slice(start, end);
  }

  getRecordsForRenewedPage(): any[] {
    const start = this.currentRenewedPage * this.recordsRenewedPerPage;
    const end = start + this.recordsRenewedPerPage;
    return this.renewedRows.slice(start, end);
  }

  getDivisionNameById(id: any): string {
    if (!id) return '';
    const idStr = id.toString();
    const match = this.allSchoolDivisions.find(x => x.id.toString() === idStr);
    return match ? match.schoolDivision : `ID ${idStr}`;
  }
}
