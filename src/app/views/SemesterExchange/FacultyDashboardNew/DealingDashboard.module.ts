import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser'; 
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FacultyDashboardNew } from './FacultyDashboardNew';
import { RoleFilterPipe } from './role-filter.pipe';
const routes: Routes = [
  {
    path: '',
    component: FacultyDashboardNew,
    
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    NgbNavModule,
    FormsModule,
    ArchwizardModule,
    ReactiveFormsModule,
     
  ],
  declarations: [FacultyDashboardNew, RoleFilterPipe]
})
export class FacultyDashboardNewModule { }
