
import { NewCifInstrumentComponent } from './NewCifInstrument.component';
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
import {} from './NewCifInstrument.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { QuillModule } from 'ngx-quill';

import { NgxSpinnerModule } from 'ngx-spinner';
 
const routes: Routes = [
  {
    path: '',
    component: NewCifInstrumentComponent
  }
]
 
@NgModule({
  declarations: [NewCifInstrumentComponent],
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
    QuillModule.forRoot(),
    NgxSpinnerModule

  ],
  providers: [
    DatePipe,
    NgbRatingConfig,     
  ]
})
export class NewCifInstrumentComponentModule { }
















































// Added by Jatinder Kumar 31309