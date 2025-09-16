import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrativeReportComponent } from '../administrative-report/administrative-report.component';
import { RouterModule, Routes } from '@angular/router';
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



const routes: Routes = [
  {
    path: '',
    component: AdministrativeReportComponent,
    
  }
]


@NgModule({
  declarations: [ ],
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
    RouterModule.forChild(routes),
    
    [MatFormFieldModule, MatInputModule, MatDatepickerModule],
   
  ]
})
export class AdministrativeReportModule { }
