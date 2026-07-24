
import { ArchwizardModule } from 'angular-archwizard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {DatePipe} from '@angular/common';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbDropdownModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule,NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap'; // Added by Jatinder Kumar 31309
// Ng-ApexCharts
import { NgApexchartsModule } from "ng-apexcharts";
import { ReactiveFormsModule } from '@angular/forms';
import { MouActivityTakeActionComponent } from './MouActivityTakeAction.component';
import {} from './MouActivityTakeAction.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from 'src/material.module';
import { MouMenuModule } from '../Mou-Menu-Bar/mou-menu.module';

import { MouSearchBoxComponent } from '../mou-documents-uploads/components/search-box/search-box.component';
import { MouExportExcelComponent } from '../mou-documents-uploads/components/export-excel/export-excel.component';
import { MouFilterSelectComponent } from '../mou-documents-uploads/components/filter-select/filter-select.component';
import { MouDataGridComponent } from '../mou-documents-uploads/components/data-grid/data-grid.component';
import { MouTakeActionTableComponent } from './components/take-action-table/take-action-table.component';

const routes: Routes = [
  {
    path: '',
    component: MouActivityTakeActionComponent
  }
]
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [MouActivityTakeActionComponent],
  imports: [
 

    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    // FeatherIconModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    NgApexchartsModule,
    NgxDatatableModule,
    NgbNavModule,
    NgbCollapseModule,
    PerfectScrollbarModule,
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    RouterModule.forChild(routes),
    ArchwizardModule,ReactiveFormsModule,
    MaterialModule,
    MouMenuModule,

    MouSearchBoxComponent,
    MouExportExcelComponent,
    MouFilterSelectComponent,
    MouDataGridComponent,
    MouTakeActionTableComponent
  ],
  providers: [
    DatePipe,
    NgbRatingConfig,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class MouActivityTakeActionModule { }
