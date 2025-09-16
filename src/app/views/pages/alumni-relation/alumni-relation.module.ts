import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumniProfileComponent } from './alumni-profile/alumni-profile.component';
import { AlumniRelationComponent } from './alumni-relation/alumni-relation.component';
import { Routes, RouterModule } from '@angular/router';
import {MatStepperModule} from '@angular/material/stepper';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatTableModule} from '@angular/material/table';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import {MatSelectModule} from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
const routes: Routes = [
  {
    path: '',
    component: AlumniProfileComponent,
    
  }
]



@NgModule({
  declarations: [
    AlumniProfileComponent,
    AlumniRelationComponent,
    
    
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatGridListModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    FlexLayoutModule,

  ]
})
export class AlumniRelationModule { }
