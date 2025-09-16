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
import {} from './ViewAll-Appointments.component'
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
import { ViewAllAppointmentsComponent } from './ViewAll-Appointments.component';

const routes: Routes = [
  {
    path: '',
    component: ViewAllAppointmentsComponent, 
  }
]
@NgModule({
  declarations: [ViewAllAppointmentsComponent],
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


  ],
  providers: [
    NgbRatingConfig,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class ViewAllAppointmentsModule { }
// Added By jatinder kumar 31309