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
import { StepStage2Component } from './components/step-stage2/step-stage2.component';
import { ApplicationOverviewComponent } from './components/application-overview/application-overview.component';
import { ApplicationSectionsComponent } from './components/application-sections/application-sections.component';

import { RejectedApplicationComponent as RejectedApplicationPanelComponent } from './components/rejected-application/rejected-application.component';
import { ApprovedApplicationComponent as ApprovedApplicationPanelComponent } from './components/approved-application/approved-application.component';
import { PendingApplicationComponent as PendingApplicationPanelComponent } from './components/pending-application/pending-application.component';

import { ApprovedApplicationComponent } from './ApprovedApplication.component';
import { PendingApplicationComponent } from './PendingApplication.component';
import { RejectedApplicationComponent } from './RejectedApplication.component';
import { ApplicationStateService } from './application-state.service';

const routes: Routes = [
  { path: '', component: EditApplicationComponent },
  { path: 'approved/:LoginName/:RegistrationNo', component: ApprovedApplicationComponent },
  { path: 'pending/:LoginName/:RegistrationNo', component: PendingApplicationComponent },
  { path: 'rejected/:LoginName/:RegistrationNo', component: RejectedApplicationComponent },
];

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
    StepStage2Component,
    ApplicationOverviewComponent,
    ApplicationSectionsComponent,
    RejectedApplicationPanelComponent,
    ApprovedApplicationPanelComponent,
    PendingApplicationPanelComponent,
    ApprovedApplicationComponent,
    PendingApplicationComponent,
    RejectedApplicationComponent,
  ],
  providers: [ApplicationStateService],
  exports: [
    SectionCardComponent,
    StepContactComponent,
    StepDetailsComponent,
    StepDocumentsComponent,
  ],
})
export class EditApplicationModule {}
