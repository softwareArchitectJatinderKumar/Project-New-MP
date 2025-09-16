import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SmAllApplicationsComponent } from './sm-all-applications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { SemesterMigrationAdminModule } from '../TopMenuBar/sm-admin-bar.module';
const routes: Routes = [
  {
    path: '',
    component: SmAllApplicationsComponent,
  }
];
@NgModule({
  declarations: [SmAllApplicationsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SemesterMigrationAdminModule,  // <-- Import here
    NgxDatatableModule,
    FormsModule,
    ArchwizardModule,
    ReactiveFormsModule,
  ]
})
export class SMAllApplicationsModule { }
