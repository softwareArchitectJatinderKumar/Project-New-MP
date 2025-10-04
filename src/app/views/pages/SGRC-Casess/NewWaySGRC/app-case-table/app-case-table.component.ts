import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-case-table',
  templateUrl: './app-case-table.component.html',
  styleUrls: ['./app-case-table.component.scss'],
})
export class AppCaseTableComponent {
  @Input() cases: any[] = [];
  @Input() loading = false;
  @Input() columns: string[] = [];
  @Input() recordCount: number | null = null;

  @Output() export = new EventEmitter<void>();
  @Output() downloadFile = new EventEmitter<any>();
  @Output() takeAction = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();

  searchText = '';
  ColumnMode = ColumnMode;

  onSearchChange(): void {
    this.searchChange.emit(this.searchText);
  }
}
