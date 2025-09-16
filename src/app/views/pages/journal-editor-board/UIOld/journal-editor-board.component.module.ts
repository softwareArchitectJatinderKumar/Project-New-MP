import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { JournalEditorBoardComponent } from './journal-editor-board.component';


const routes: Routes = [
  {
    path: '',
    component: JournalEditorBoardComponent, 
  }
]

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
  
    ],
  
  })
export class JournalEditorBoardComponentModule { }
