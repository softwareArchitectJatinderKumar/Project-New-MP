import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';
import { ReactiveFormsModule }   from '@angular/forms';
import { RouterModule, Routes }  from '@angular/router';

import { StudentApplicationDetailsComponent } from './StudentApplicationDetails.component';
import { BeautifyLabelPipe }                  from './pipes/beautify-label.pipe';

const routes: Routes = [
  { path: '', component: StudentApplicationDetailsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    StudentApplicationDetailsComponent,
    BeautifyLabelPipe,
  ],
})
export class ApplicationDetailsModule {}
