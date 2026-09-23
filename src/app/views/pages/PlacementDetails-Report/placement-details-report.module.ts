// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Routes } from '@angular/router';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { PlacementDetailsReportComponent } from './placement-details-report.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: PlacementDetailsReportComponent,
//   },
// ];

// @NgModule({
//   declarations: [PlacementDetailsReportComponent],
//   imports: [
//     CommonModule,
//     RouterModule.forChild(routes),
//     FormsModule,
//     ReactiveFormsModule,
//     NgxDatatableModule,
//     NgbModule,
//   ],
// })
// export class PlacementDetailsReportModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlacementDetailsReportComponent } from './placement-details-report.component';
import { PlacementDriveCandidatesModalComponent } from './placement-drive-candidates-modal.component';
import { PlacementDriveDetailsModalComponent } from './placement-drive-details-modal.component';

const routes: Routes = [
  {
    path: '',
    component: PlacementDetailsReportComponent,
  },
];

@NgModule({
  declarations: [PlacementDetailsReportComponent, PlacementDriveCandidatesModalComponent, PlacementDriveDetailsModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgbModule,
  ],
})
export class PlacementDetailsReportModule {}
