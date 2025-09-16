
import { RmsScannerComponent } from './rms-scanner.component';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbDropdownModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule,NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
// Ng-ApexCharts
import { NgApexchartsModule } from "ng-apexcharts";
import { ReactiveFormsModule } from '@angular/forms';
import {} from './rms-scanner.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { QuillModule } from 'ngx-quill';
import { QRCodeModule } from 'angularx-qrcode';

import { NgxSpinnerModule } from 'ngx-spinner';
 
const routes: Routes = [
  {
    path: '',
    component: RmsScannerComponent
  }
]
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [RmsScannerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    RouterModule.forChild(routes),
    ArchwizardModule,ReactiveFormsModule,
    MaterialModule,
    QuillModule.forRoot(), // ngx-quill
    NgxSpinnerModule,
    QRCodeModule

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
export class RMSScannerComponentModule { }
















































// Added by Jatinder Kumar 31309