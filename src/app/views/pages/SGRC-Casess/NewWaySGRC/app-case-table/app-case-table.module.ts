import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppCaseTableComponent } from './app-case-table.component';

@NgModule({
  declarations: [AppCaseTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule
  ],
  exports: [AppCaseTableComponent]
})
export class AppCaseTableModule {}
