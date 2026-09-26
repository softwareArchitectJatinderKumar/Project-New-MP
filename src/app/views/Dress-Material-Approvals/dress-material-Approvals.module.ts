import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DressMaterialApprovalsComponent } from './dress-material-Approvals.component';

const routes: Routes = [
  {
    path: '',
    component: DressMaterialApprovalsComponent
  }
];

@NgModule({
  declarations: [DressMaterialApprovalsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    FeatherIconModule,
    NgbModule
  ],
  providers: [DatePipe]
})
export class DressMaterialApprovalsModule { }
