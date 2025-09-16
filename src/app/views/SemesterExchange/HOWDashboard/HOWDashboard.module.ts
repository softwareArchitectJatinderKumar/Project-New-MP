import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HOWDashboardComponent } from './HOWDashboard.component';
import { Title } from '@angular/platform-browser'; 
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';


const routes: Routes = [
  {
    path: '',
    component: HOWDashboardComponent, 
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
    ReactiveFormsModule
  ],
  declarations: [HOWDashboardComponent]
})
export class HOWDashboardModule { }
 