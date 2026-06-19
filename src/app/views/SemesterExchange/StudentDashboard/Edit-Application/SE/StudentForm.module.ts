import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { EditApplicationComponent } from './EditApplication.component';
import { SectionCardComponent } from './components/section-card/section-card.component';
import { StepNavComponent } from './components/step-nav/step-nav.component';
import { StepContactComponent } from './components/step-contact/step-contact.component';
import { StepUniversityComponent } from './components/step-university/step-university.component';
import { StepDetailsComponent } from './components/step-details/step-details.component';
import { StepDocumentsComponent } from './components/step-documents/step-documents.component';
import { StepStage2Component } from './components/step-stage2/step-stage2.component';

const routes: Routes = [{ path: '', component: EditApplicationComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    EditApplicationComponent,
    SectionCardComponent,
    StepNavComponent,
    StepContactComponent,
    StepUniversityComponent,
    StepDetailsComponent,
    StepDocumentsComponent,
    StepStage2Component,
  ],
})
export class EditApplicationModule {}
