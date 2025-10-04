// // import { NgModule } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { SGRCCasesComponenent } from './SGRCCases';
// // import { RouterModule, Routes } from '@angular/router';
// // import {MatDatepickerModule} from '@angular/material/datepicker';
// // import {MatInputModule} from '@angular/material/input';
// // import {MatFormFieldModule} from '@angular/material/form-field';
// // import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// // import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
// // import { NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
// // import { NgApexchartsModule } from 'ng-apexcharts';
// // import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// // import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// // import { NgSelectModule } from '@ng-select/ng-select';



// // const routes: Routes = [
// //   {
// //     path: '',
// //     component: SGRCCasesComponenent,
    
// //   }
// // ]


// // @NgModule({
// //   declarations: [ ],
// //   imports: [
// //     CommonModule,
// //     RouterModule.forChild(routes),
// //     FormsModule,
// //     FeatherIconModule,
// //     NgbDropdownModule,
// //     NgbDatepickerModule,
// //     NgApexchartsModule,
// //     NgxDatatableModule,
// //     NgbNavModule,
// //     NgbCollapseModule,
// //     PerfectScrollbarModule,
// //     NgbModule,
// //     ReactiveFormsModule,
// //     NgSelectModule,
// //     RouterModule.forChild(routes),
    
// //     [MatFormFieldModule, MatInputModule, MatDatepickerModule],
   
// //   ]
// // })
// // export class SGRCCasesModule { }

// import { NgModule } from '@angular/core';
// import { CommonModule, DOCUMENT } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

// import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Keep NgbModule for modals

// // ⚠️ Angular Material Modules ⚠️
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatSelectModule } from '@angular/material/select';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatCardModule } from '@angular/material/card'; // Added for card layout

// // --- Your Component and Services ---
// import { SGRCCasesComponenent } from './SGRCCases.component'; // Adjust path if necessary
// import { StudentGrievanceServicesLocalService } from 'src/app/_services/student-grievance-services-local.service';
// // ... import other necessary components/services here

// const materialModules = [
//   MatTableModule,
//   MatPaginatorModule,
//   MatSortModule,
//   MatInputModule,
//   MatFormFieldModule,
//   MatButtonModule,
//   MatIconModule,
//   MatTabsModule,
//   MatSelectModule,
//   MatProgressSpinnerModule,
//   MatCardModule,
// ];

// @NgModule({
//   declarations: [
//     SGRCCasesComponenent,
//   ],
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     HttpClientModule,
//     NgbModule,
    
//     // Include all necessary Material Modules
//     ...materialModules,
//   ],
//   providers: [
//     StudentGrievanceServicesLocalService,
//     // ... other providers
//     { provide: DOCUMENT, useValue: document } // Kept for Document injection
//   ],
//   exports: [
//     SGRCCasesComponenent,
//     // ... any other exports
//   ]
// })
// export class SGRCCasesXModule { } // Rename if this is your main app module