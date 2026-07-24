import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mou-filter-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss']
})
export class MouFilterSelectComponent {
  @Input() label: string = '';
  @Input() options: { value: any, label: string }[] = [];
  @Input() selectedValue: any = null;
  @Output() selectedValueChange = new EventEmitter<any>();

  onSelectChange(val: any) {
    this.selectedValue = val;
    this.selectedValueChange.emit(val);
  }
}
