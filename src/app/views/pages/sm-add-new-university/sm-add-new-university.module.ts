import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SmAddNewUniversityComponent } from './sm-add-new-university.component';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'angular-archwizard';

const routes: Routes = [
  {
    path: '',
    component: SmAddNewUniversityComponent, 
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    FormsModule,
    ArchwizardModule,ReactiveFormsModule
  ],
})
export class SmAddNewUniversityComponentModule { }
