import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { MouDataGridComponent } from "src/app/views/pages/mou-documents-uploads/components/data-grid/data-grid.component";

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-mou-report-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, MouDataGridComponent],
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class MouReportTableComponent {
  @Input() rows: any[] = [];
  @Input() renewedRows: any[] = [];
  @Input() statusFilter: string = 'all';
  @Input() columns: any[] = [];
  @Input() allSchoolDivisions: SchoolDivision[] = [];
  @Input() loading: boolean = false;

  @Output() renew = new EventEmitter<any>();
  @Output() viewHistory = new EventEmitter<any>();
  @Output() download = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() approve = new EventEmitter<any>();
  @Output() disapprove = new EventEmitter<any>();

  ColumnMode = ColumnMode;

  getDivisionNameById(id: number): string {
    const idStr = id.toString();
    const school = this.allSchoolDivisions.find(s => s.id.toString() === idStr);
    return school ? school.schoolDivision : `ID ${idStr}`;
  }

  getDivisionNamesByIds(ids: number[]): string {
    if (!ids) return '';
    return ids.map(id => this.getDivisionNameById(id)).join(', ');
  }
}
