import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OBPAllocationTransferToolComponent } from './obpallocation-transfer-tool.component';
import { FormsModule } from '@angular/forms';

import { NgxSpinnerModule } from "ngx-spinner";

const routes: Routes = [
  {
    path: '',
    component: OBPAllocationTransferToolComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgxSpinnerModule,
  ]
})
export class ObpallocationTransferToolModule { }
