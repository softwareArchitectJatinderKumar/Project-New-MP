import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { JournalEditorBoardComponent } from './journal-editor-board.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from 'src/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';


const routes: Routes = [
  {
    path: '',
    component: JournalEditorBoardComponent, 
  }
]

@NgModule({
  declarations: [
    JournalEditorBoardComponent  
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
export class JournalEditorBoardComponentModule { }
