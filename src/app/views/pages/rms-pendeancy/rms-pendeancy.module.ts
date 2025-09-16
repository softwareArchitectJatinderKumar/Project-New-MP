import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {DatePipe} from '@angular/common';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbDropdownModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule,NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
// Ng-ApexCharts
import { NgApexchartsModule } from "ng-apexcharts";
import { ReactiveFormsModule } from '@angular/forms';
import { RMSPendeancyComponent } from './rms-pendeancy.component';
import {} from './rms-pendeancy.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';
const routes: Routes = [
  {
    path: '',
    component: RMSPendeancyComponent
  }
]
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [RMSPendeancyComponent],
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
    NgSelectModule

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
export class RMSPendeancyModule { }
