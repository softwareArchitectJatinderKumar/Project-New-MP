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
import { Stage1DocumentComponent } from './components/step-documents-Stage1/Stage1Document.component';
import { RejectedApplicationComponent } from './components/rejected-application/rejected-application.component';
import { ApprovedApplicationComponent } from './components/approved-application/approved-application.component';
import { PendingApplicationComponent } from './components/pending-application/pending-application.component';

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
    Stage1DocumentComponent,
    RejectedApplicationComponent,
    ApprovedApplicationComponent,
    PendingApplicationComponent,
  ],
  exports: [
    SectionCardComponent,
    StepContactComponent,
    StepDetailsComponent,
    StepDocumentsComponent,
  ],
})
export class EditApplicationModule {}
