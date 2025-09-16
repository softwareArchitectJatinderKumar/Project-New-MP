import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareerServicesComponent } from './CareerServices.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
const routes: Routes = [
  {
    path: '',
    component: CareerServicesComponent
  }
]

@NgModule({
  declarations: [CareerServicesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgSelectModule,
  ]
})
export class CareerservicesModule { }
