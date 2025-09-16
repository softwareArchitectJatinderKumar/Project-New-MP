import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';

@Component({
  selector: 'app-sm-list-all-university',
  templateUrl: './sm-list-all-university.component.html',
  styleUrls: ['./sm-list-all-university.component.scss'],
})
export class SmListAllUniversityComponent implements OnInit, AfterViewInit {
  UniverstiesData: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  displayedColumns: string[] = ['universityName', 'programCode'];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 15, 25, 35];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private semesmigr: SemesterExchangeStuDetailsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUniversityDetails();
  }

  ngAfterViewInit(): void {
    // paginator/sort will be assigned after data loads
  }

  getUniversityDetails(): void {
    this.semesmigr.getUniversities().subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.UniverstiesData = response.item1;
        this.dataSource.data = this.UniverstiesData;
      } else {
        this.UniverstiesData = [];
        this.dataSource.data = [];
      }

      // force view update so paginator is rendered before assignment
      this.cd.detectChanges();

      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportToExcel(): void {
    const fileName = 'Universities_data.xlsx';
    const exportData = this.dataSource.filteredData.map((item) => {
      const obj: any = {};
      this.displayedColumns.forEach((col) => (obj[col] = item[col]));
      return obj;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Universities');
    XLSX.writeFile(wb, fileName);
  }
}


// import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import * as XLSX from 'xlsx';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';

// @Component({
//   selector: 'app-sm-list-all-university',
//   templateUrl: './sm-list-all-university.component.html',
//   styleUrls: ['./sm-list-all-university.component.scss'],
// })
// export class SmListAllUniversityComponent implements OnInit, AfterViewInit {
//   UniverstiesData: any[] = [];
//   dataSource = new MatTableDataSource<any>([]);

//   displayedColumns: string[] = ['universityName', 'programCode'];

//   pageSize = 10;
//   pageSizeOptions: number[] = [5, 10, 15, 25, 35];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   constructor(private semesmigr: SemesterExchangeStuDetailsService) {}

//   ngOnInit(): void {
//     this.getUniversityDetails();
//   }

//   ngAfterViewInit(): void {
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }

//   getUniversityDetails(): void {
//     this.semesmigr.getUniversities().subscribe((response) => {
//       if (response.item1 && response.item1.length > 0) {
//         this.UniverstiesData = response.item1;

//         // ✅ Instead of creating a new MatTableDataSource,
//         // update the existing one (keeps paginator + sort working)
//         this.dataSource.data = this.UniverstiesData;
//       } else {
//         this.UniverstiesData = [];
//         this.dataSource.data = [];
//       }
//     });
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();

//     if (this.dataSource.paginator) {
//       this.dataSource.paginator.firstPage();
//     }
//   }

//   exportToExcel(): void {
//     const fileName = 'Universities_data.xlsx';

//     // Prepare data for export - only displayed columns
//     const exportData = this.dataSource.filteredData.map((item) => {
//       const obj: any = {};
//       this.displayedColumns.forEach((col) => {
//         obj[col] = item[col];
//       });
//       return obj;
//     });

//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Universities');
//     XLSX.writeFile(wb, fileName);
//   }
// }

