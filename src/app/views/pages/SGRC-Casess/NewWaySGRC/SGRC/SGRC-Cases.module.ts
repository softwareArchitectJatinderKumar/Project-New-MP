import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SGRCComponent } from './SGRC.component';
import { AppCaseTableModule } from '../app-case-table/app-case-table.module';
// import { AppCaseTableComponent } from '../app-case-table/app-case-table.component'; // Adjust path as needed

@NgModule({
  declarations: [
    SGRCComponent,
    // AppCaseTableComponent  // Declare child component here for reusability
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgxDatatableModule, 
    AppCaseTableModule
  ],
  exports: [
    SGRCComponent
  ]
})
export class SGRCModule {}
