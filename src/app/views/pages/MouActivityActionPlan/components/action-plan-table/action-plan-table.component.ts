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
  selector: 'app-mou-action-plan-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, MouDataGridComponent],
  templateUrl: './action-plan-table.component.html',
  styleUrls: ['./action-plan-table.component.scss']
})
export class MouActionPlanTableComponent {
  @Input() rows: any[] = [];
  @Input() assignedMeRows: any[] = [];
  @Input() assignedOthersRows: any[] = [];
  @Input() activeTab: 'tab1' | 'tab2' | 'tab3' = 'tab1';
  @Input() allSchoolDivisions: SchoolDivision[] = [];
  @Input() loading: boolean = false;
  @Input() statusFilter: string = 'all';

  // Selection states passed from parent or handled locally
  @Input() selectedRow: any = null;

  @Output() viewActivities = new EventEmitter<any>();
  @Output() viewActionDetails = new EventEmitter<any>();
  @Output() download = new EventEmitter<any>();
  @Output() assignPlan = new EventEmitter<any>();
  @Output() assignUid = new EventEmitter<any>();
  @Output() modifyFaculty = new EventEmitter<any>();
  @Output() deleteAction = new EventEmitter<any>();
  @Output() sendReminder = new EventEmitter<any>();

  ColumnMode = ColumnMode;

  getDivisionNameById(id: any): string {
    if (!id) return '';
    const idStr = id.toString();
    const match = this.allSchoolDivisions.find(x => x.id.toString() === idStr);
    return match ? match.schoolDivision : `ID ${idStr}`;
  }

  removeNumberPrefix(activityDetails: string): string {
    return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
  }
}
