import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCardModule } from '@angular/material/card';

import { RegisterFormcomponent } from './Register-Form.component';
import { PhoneInputComponent } from './shared/phone-input/phone-input.component';

const routes: Routes = [
  { path: '', component: RegisterFormcomponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    NgbNavModule,
    FormsModule,
    ArchwizardModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  declarations: [
    RegisterFormcomponent,
    PhoneInputComponent,
  ],
})
export class RegisterFormModule { }
