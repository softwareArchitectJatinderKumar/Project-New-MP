import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { MouDataGridComponent } from "../../../mou-documents-uploads/components/data-grid/data-grid.component";

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-mou-take-action-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, MouDataGridComponent],
  templateUrl: './take-action-table.component.html',
  styleUrls: ['./take-action-table.component.scss']
})
export class MouTakeActionTableComponent {
  @Input() rows: any[] = [];
  @Input() actionTakenRows: any[] = [];
  @Input() activeTab: 'tab1' | 'tab2' = 'tab1';
  @Input() allSchoolDivisions: SchoolDivision[] = [];
  @Input() loading: boolean = false;
  @Input() columns: any[] = [];

  @Output() download = new EventEmitter<any>();
  @Output() viewAllDocs = new EventEmitter<any>();
  @Output() takeAction = new EventEmitter<any>();

  ColumnMode = ColumnMode;

  getDivisionNameById(id: any): string {
    if (!id) return '';
    const idStr = id.toString();
    const match = this.allSchoolDivisions.find(x => x.id.toString() === idStr);
    return match ? match.schoolDivision : `ID ${idStr}`;
  }

  getDocumentFiles(files: string): string[] {
    if (!files) return [];
    return files.split(',').map(x => x.trim()).filter(Boolean);
  }

  getFileName(fileUrl: string): string {
    if (!fileUrl) return '';
    return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
  }
}
