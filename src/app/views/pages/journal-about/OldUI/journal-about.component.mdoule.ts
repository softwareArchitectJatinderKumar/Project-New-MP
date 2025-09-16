import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { JournalAboutComponent } from './journal-about.component';


const routes: Routes = [
  {
    path: '',
    component: JournalAboutComponent, 
  }
]

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
  
    ],
  
  })
export class JournalAboutComponentModule { }
