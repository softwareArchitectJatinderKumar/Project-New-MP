import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbDropdownModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule,NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
// Ng-ApexCharts
import { NgApexchartsModule } from "ng-apexcharts";
import { ReactiveFormsModule } from '@angular/forms';
import {} from './mou-documents-uploads.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
import { MouDocumentsUploadsComponent } from './mou-documents-uploads.component';
import { MouMenuModule } from '../Mou-Menu-Bar/mou-menu.module';

import { MouSearchBoxComponent } from './components/search-box/search-box.component';
import { MouExportExcelComponent } from './components/export-excel/export-excel.component';
import { MouFilterSelectComponent } from './components/filter-select/filter-select.component';
import { MouDataGridComponent } from './components/data-grid/data-grid.component';
import { MouUploadsTableComponent } from './components/uploads-table/uploads-table.component';

const routes: Routes = [
  {
    path: '',
    component: MouDocumentsUploadsComponent, 
  }
]
@NgModule({
  declarations: [MouDocumentsUploadsComponent],
  imports: [
    CommonModule,
   
    FormsModule,
    FeatherIconModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    NgApexchartsModule,
    NgxDatatableModule,
    NgbNavModule,
    NgbCollapseModule,
    PerfectScrollbarModule,
    NgbModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    ArchwizardModule,ReactiveFormsModule,
    MaterialModule,
    MouMenuModule,

    MouSearchBoxComponent,
    MouExportExcelComponent,
    MouFilterSelectComponent,
    MouDataGridComponent,
    MouUploadsTableComponent
  ],
  providers: [
    NgbRatingConfig,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class MouDocumentsUploadsModule { }









































































// Added by Jatinder Kumar 31309