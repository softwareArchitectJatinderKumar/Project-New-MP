import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { JournalAboutComponent } from './journal-about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from 'src/material.module';


const routes: Routes = [
  {
    path: '',
    component: JournalAboutComponent, 
  }
]

@NgModule({
  declarations: [
    JournalAboutComponent  
  ],
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
      MaterialModule,
      NgSelectModule
      
    ],
  
  })
export class JournalAboutComponentModule { }
