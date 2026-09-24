import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DressMaterialComponent } from './dress-material.component';

const routes: Routes = [
  {
    path: '',
    component: DressMaterialComponent
  }
];

@NgModule({
  declarations: [DressMaterialComponent],
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
export class DressMaterialModule { }
