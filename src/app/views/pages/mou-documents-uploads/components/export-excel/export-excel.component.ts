import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mou-export-excel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.scss']
})
export class MouExportExcelComponent {
  @Input() disabled: boolean = false;
  @Output() export = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.export.emit();
    }
  }
}
