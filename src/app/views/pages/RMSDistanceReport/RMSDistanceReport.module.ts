import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes,  } from '@angular/router';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from 'src/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { RMSDistanceReportComponent } from './RMSDistanceReport.component';



const routes: Routes = [
  {
    path: '',
    component: RMSDistanceReportComponent,
  }
]

@NgModule({
  declarations: [RMSDistanceReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
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
    MaterialModule
 
  ]
})
export class RMSDistanceReportComponentModule { }
