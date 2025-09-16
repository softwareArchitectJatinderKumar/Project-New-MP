// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Routes, RouterModule } from '@angular/router';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { SemesterMigrationAdminComponent } from './sm-admin-bar.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ArchwizardModule } from 'angular-archwizard';

// const routes: Routes = [
//   {
//     path: '',
//     component: SemesterMigrationAdminComponent,
//   }
// ];

// @NgModule({
//     declarations: [SemesterMigrationAdminComponent],
//     imports: [
//       CommonModule,
//       RouterModule.forChild(routes), // if it has routes
//       // other imports
//     ],
//     exports: [SemesterMigrationAdminComponent]  // <-- Export it here
//   })
//   export class SemesterMigrationAdminModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemesterMigrationAdminComponent } from './sm-admin-bar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SemesterMigrationAdminComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SemesterMigrationAdminComponent
  ]
})
export class SemesterMigrationAdminModule { }
