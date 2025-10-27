// src/app/components/data-grid/data-grid.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel in search box

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DataGridComponent } from './Dynamic-Datagrid-Component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
  declarations: [
    DataGridComponent // Declare the component within this module
  ],
  imports: [
    // Standard Angular Modules
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    // Material Modules (required for the component's template)
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    DataGridComponent // Export the component so other modules can use the <app-data-grid> selector
  ]
})
export class DataGridModule { }