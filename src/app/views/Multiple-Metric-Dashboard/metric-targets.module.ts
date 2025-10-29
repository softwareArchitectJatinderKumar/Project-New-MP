// src/app/pages/master-details-page/master-details-page.module.ts (Example Module)

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricTargetsComponent } from './metric-targets.component';
import { DataGridModule } from '../DynamicDataGrid/Dynamic-Datagrid-Component.module';
// src/app/pages/master-details-page/master-details-page.module.ts (Example Module)

import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';


const routes: Routes = [
  {
    path: '',
    component: MetricTargetsComponent, 
  }
]
@NgModule({
  declarations: [
    MetricTargetsComponent 
  ],
  imports: [
    CommonModule,
    DataGridModule, // This gives you access to the <app-data-grid> selector
     CommonModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    NgbNavModule,
    FormsModule,
    ArchwizardModule,
    ReactiveFormsModule
  ],
  exports: [
    MetricTargetsComponent 
  ]
})
export class MetricTargetsModule { }











 