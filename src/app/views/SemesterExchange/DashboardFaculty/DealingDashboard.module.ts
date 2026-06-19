import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser'; 
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicDashboardComponent } from './DynamicDashboard/DynamicDashboard.component';
import { RoleFilterPipe } from './DynamicDashboard/role-filter_pipe';
const routes: Routes = [
  {
    path: '',
    component: DynamicDashboardComponent, 
    
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
  declarations: [DynamicDashboardComponent, RoleFilterPipe]
})
export class DynamicDashboardModule { }
