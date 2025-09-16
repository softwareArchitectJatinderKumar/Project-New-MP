// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Routes, RouterModule } from '@angular/router';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { SmListAllUniversityComponent } from './sm-list-all-university.component';
// import {  FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { ArchwizardModule } from 'angular-archwizard';
// import { SemesterMigrationAdminModule } from '../TopMenuBar/sm-admin-bar.module';


// const routes: Routes = [
//   {
//     path: '',
//     component: SmListAllUniversityComponent, 
//   }
// ]
// @NgModule({
//   imports: [
//     CommonModule,
//     RouterModule.forChild(routes),
//     NgxDatatableModule,
//     FormsModule,
//     ArchwizardModule,ReactiveFormsModule,
//     SemesterMigrationAdminModule, 
//   ],
// })
// export class SmListAllUniversityComponentModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SmListAllUniversityComponent } from './sm-list-all-university.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { SemesterMigrationAdminModule } from '../TopMenuBar/sm-admin-bar.module';
import { MaterialModule } from 'src/material.module';
const routes: Routes = [
  {
    path: '',
    component: SmListAllUniversityComponent,
  }
];
@NgModule({
  declarations: [SmListAllUniversityComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SemesterMigrationAdminModule,  // <-- Import here
    NgxDatatableModule,
    FormsModule,
    ArchwizardModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class SmListAllUniversityComponentModule { }
