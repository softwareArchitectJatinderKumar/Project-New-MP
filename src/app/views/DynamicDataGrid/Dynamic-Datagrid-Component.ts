// import {
//   Component,
//   OnInit,
//   ViewChild,
//   Input,
//   AfterViewInit,
// } from '@angular/core';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
// import * as XLSX from 'xlsx';
// import { debounceTime, Subject } from 'rxjs';

// export interface DataTableColumn {
//   field: string;
//   header: string;
// }

// @Component({
//   selector: 'app-data-grid',
//   templateUrl: './Dynamic-Datagrid-Component.html',
//   styleUrls: ['./Dynamic-Datagrid-Component.scss'],
// })
// export class DataGridComponent implements OnInit, AfterViewInit {
//   @Input() records: any[] = [];
//   @Input() columns: DataTableColumn[] = [];
//   @Input() componentTitle: string = 'Data Grid';

//   dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
//   displayedColumns: string[] = [];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   pageSizeOptions: number[] = [5, 10, 25, 50, 100];
//   searchText: string = '';
//   private searchSubject = new Subject<string>();

//   constructor() {}

//   ngOnInit(): void {
//     this.initializeTable();
//     this.setupSearchDebounce();
//   }

//   ngAfterViewInit(): void {
//     this.dataSource.paginator = this.paginator;
//   }

//   initializeTable(): void {
//     if (this.columns?.length) {
//       this.dataSource = new MatTableDataSource(this.records);
//       this.displayedColumns = this.columns.map((col) => col.field);
//     }
//   }

//   setupSearchDebounce(): void {
//     this.searchSubject.pipe(debounceTime(300)).subscribe((searchValue) => {
//       this.applyFilter(searchValue);
//     });
//   }

//   applyFilterDebounced(): void {
//     this.searchSubject.next(this.searchText);
//   }

//   applyFilter(filterValue: string): void {
//     const value = filterValue.trim().toLowerCase();
//     this.dataSource.filter = value;
//     if (this.dataSource.paginator) {
//       this.dataSource.paginator.firstPage();
//     }
//   }

//   clearSearch(): void {
//     this.searchText = '';
//     this.applyFilter('');
//   }

//   nextPage(): void {
//     if (this.paginator?.hasNextPage()) {
//       this.paginator.nextPage();
//     }
//   }

//   previousPage(): void {
//     if (this.paginator?.hasPreviousPage()) {
//       this.paginator.previousPage();
//     }
//   }

//   getPageStartIndex(): number {
//     if (!this.paginator) return 0;
//     return this.paginator.pageIndex * this.paginator.pageSize;
//   }

//   getPageEndIndex(): number {
//     if (!this.paginator) return this.dataSource.filteredData.length;
//     const end = this.getPageStartIndex() + this.paginator.pageSize;
//     return Math.min(end, this.dataSource.filteredData.length);
//   }

//   exportToExcel(): void {
//     if (!this.dataSource.filteredData.length || !this.columns.length) return;

//     const exportData = this.dataSource.filteredData.map((row) => {
//       const newRow: any = {};
//       this.columns.forEach((col) => (newRow[col.header] = row[col.field]));
//       return newRow;
//     });

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

//     const fileName = `${this.componentTitle.replace(/\s/g, '_')}_${new Date()
//       .toLocaleDateString()
//       .replace(/\//g, '-')}.xlsx`;

//     XLSX.writeFile(workbook, fileName);
//   }
// }

// src/app/components/data-grid/data-grid.component.ts
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import * as XLSX from 'xlsx';

// export interface DataTableColumn {
//   field: string;   // data property key
//   header: string;  // display name for the column
// }

// @Component({
//   selector: 'app-data-grid',
//   templateUrl: './Dynamic-Datagrid-Component.html',
//   styleUrls: ['./Dynamic-Datagrid-Component.scss']
// })
// export class DataGridComponent implements OnChanges {
//  Math = Math;
//   @Input() records: any[] = [];
//   @Input() columns: DataTableColumn[] = [];
//   @Input() componentTitle: string = 'Data Grid';

//   // ngx-datatable-specific column format
//   tableColumns: any[] = [];

//   // filtering and pagination
//   searchText: string = '';
//   filteredData: any[] = [];
//   pageSizeOptions: number[] = [5, 10, 25, 50, 100];

//   // message text for the datatable
//   messages = {
//     emptyMessage: 'No matching records found',
//     totalMessage: 'total',
//     selectedMessage: 'selected'
//   };

//   constructor() {}

//   // Runs every time inputs change (like dynamic columns or records)
//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['columns'] && this.columns?.length > 0) {
//       this.tableColumns = this.columns.map(c => ({
//         name: c.header,
//         prop: c.field
//       }));
//     }

//     if (changes['records']) {
//       this.filteredData = [...this.records];
//     }
//   }

//   // Simple filter logic
//   applyFilter(event: Event | string): void {
//     const value = typeof event === 'string'
//       ? event.trim().toLowerCase()
//       : (event.target as HTMLInputElement)?.value.trim().toLowerCase();

//     if (!value) {
//       this.filteredData = [...this.records];
//       return;
//     }

    
//     this.filteredData = this.records.filter(row =>
//       Object.values(row).some(val =>
//   String(val).toLowerCase().includes(value)
//       )
//     );
//   }

//   // Export to Excel logic
//   exportToExcel(): void {
//     if (!this.filteredData.length || !this.columns.length) return;

//     const dataToExport = this.filteredData.map(record => {
//       const row: any = {};
//       this.columns.forEach(col => {
//         row[col.header] = record[col.field];
//       });
//       return row;
//     });

//     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
//     const fileName = `${this.componentTitle.replace(/\s/g, '_')}_${new Date().toLocaleDateString()}.xlsx`;

//     XLSX.writeFile(workbook, fileName);
//   }
// }













// working with mat table or material table with dynamic columns and data

import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';

// Define the reusable structure for column headers
export interface DataTableColumn {
  field: string;  // The property key in your data object (e.g., 'registrationNo')
  header: string; // The display name for the column header (e.g., 'Reg. No.')
}

@Component({
  selector: 'app-data-grid',
  templateUrl: './Dynamic-Datagrid-Component.html',
  styleUrls: ['./Dynamic-Datagrid-Component.scss']
})
export class DataGridComponent implements OnInit, AfterViewInit {

  // INPUTS for Reusability (Accepts any dynamic data and column structure)
  @Input() records: any[] = [];
  @Input() columns: DataTableColumn[] = []; // Handles 5 to 15+ columns dynamically
  @Input() componentTitle: string = 'Data Grid';

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = []; // Array of field names for MatTable

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  searchText: string = '';

  constructor() { }

  ngOnInit(): void {
    if (this.columns && this.columns.length > 0) {
        this.dataSource = new MatTableDataSource(this.records);
        // Dynamically set MatTable columns based on the input 'field' property
        this.displayedColumns = this.columns.map(col => col.field);
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource && this.paginator) {
        this.dataSource.paginator = this.paginator;
    }
  }

  // Search/Filter Logic
  applyFilter(event: Event | string): void {
    const filterValue = typeof event === 'string' 
      ? event.trim().toLowerCase() 
      : (event.target as HTMLInputElement).value.trim().toLowerCase();
    
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Export to Excel Logic (Dynamically uses all mapped columns)
  exportToExcel(): void {
    if (!this.dataSource.filteredData || this.columns.length === 0) return;
    
    const filteredData = this.dataSource.filteredData;
    
    const dataToExport = filteredData.map(record => {
      let newRecord: any = {};
      this.columns.forEach(col => {
        // Use column header as the key for the Excel header row
        newRecord[col.header] = record[col.field];
      });
      return newRecord;
    });

    const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workBook: XLSX.WorkBook = { 
      Sheets: { 'data': workSheet }, 
      SheetNames: ['data'] 
    };
    
    const excelFileName = `${this.componentTitle.replace(/\s/g, '_')}_${new Date().toLocaleDateString()}.xlsx`;
    
    XLSX.writeFile(workBook, excelFileName);
  }
}

