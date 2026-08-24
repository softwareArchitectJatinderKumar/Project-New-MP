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
  
  pageSizeOptions: number[] = [5, 10, 25, 50];
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

