import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser'; 
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HODDashboardNew } from './HODDashboardNew';
import { RoleFilterPipe } from './role-filter.pipe';
const routes: Routes = [
  {
    path: '',
    component: HODDashboardNew, 
    
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
  declarations: [HODDashboardNew, RoleFilterPipe]
})
export class HODDashboardNewModule { }
