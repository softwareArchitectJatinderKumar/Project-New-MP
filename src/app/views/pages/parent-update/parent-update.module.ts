import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentUpdateListComponent } from './parent-update-list/parent-update-list.component';
import {  RouterModule, Routes } from '@angular/router';
import { ParentUpdateComponent } from './parent-update.component';
import { MatTableModule } from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { TitleCasePipe } from '@angular/common';
const routes: Routes = [
  {
    path: '',
    component: ParentUpdateListComponent,
    // children: [
    //   {
    //     path: '',
    //     redirectTo: 'update-list',
    //     pathMatch: 'full'
    //   },
    //   {
    //     path: 'parent-update-list',
    //     component: ParentUpdateListComponent
    //   }
      
    // ]
  }
]
@NgModule({
  declarations: [
    ParentUpdateListComponent,ParentUpdateComponent
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    TitleCasePipe,
  
    
    
  
  ]
})
export class ParentUpdateModule { }
