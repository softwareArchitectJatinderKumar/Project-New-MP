import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { AdmibistrativeService } from 'src/app/_services/admibistrative.service';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-administrative-report',
  templateUrl: './administrative-report.component.html',
  styleUrls: ['./administrative-report.component.scss']
})
export class AdministrativeReportComponent implements OnInit {
  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any;
  toDate: any;
  data: Event[] = [];
  rmsData :any;
  rmsDataColumns :any;
  dataSource = new MatTableDataSource<any>;
  dataSource1 = new MatTableDataSource<any>;
  dataSource2 = new MatTableDataSource<any>;
  Reports: Event[];
  IQACDataShow:number;
  blockDataShow:number;
  RMStype:number;
  pipe = new DatePipe('en-CA');
status1: any;
  constructor(private http: HttpClient,private admibistrativeService: AdmibistrativeService,private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService ) {

     }
  displayedColumns: string[] = [
    'eventId',
    'eventName',
    'eventStartDate',
    'eventEndDate',
    'venue',
    'events',
    'category',
    'otherCategory',
    'focusOfEvent',
    'resourcePersonCategory',
    'resourcePersonDetails',
    'eventReportUploadFile',
    'eventSupportDocument',
    'participantAttendanceUploadFile',
    'entryBy',
    'entryDate'
  ];
  displayedColumns2: string[] = [
    'category',
    'categoryType',
    'masterCategory',
    'schoolName',
    'category',
    'subCategory',
    'ticketNo',
    'messageId',
    'subject',
    'description',
    'loggedDate',
    'loggedBy',
    'closingRemarks',
    'closingDate',
    'taskDays',
    'rating',
    'studentRemarks'
  ];
  displayedColumns3: string[] = [
    'blockNo',
    'blockName',
    'ao',
    'sectorIncharge'
  ];
  
  
  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    this.IQACDataShow=0;
    this.blockDataShow=0;
    this.RMStype=0;


    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }

  }  
  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 1) { // check if the second tab is selected
      this.showblock();
      
    }
  }
  showblock() {
    this.admibistrativeService.getBlockmaster().subscribe({
      next: (data: any) => {
        this.dataSource1.data = data.item1;
        this.blockDataShow = 1;
        this.IQACDataShow=0;
         this.RMStype=0;
      }
    });
   
  } 


  ExportTOExcelRMSData() {  
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
    // XLSX.writeFile(wb, 'Data.xlsx');  

    let element = document.getElementById('dataTableExampleNews');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
 
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 
    /* save to file */  
    XLSX.writeFile(wb, 'rmsData.xlsx');


  }  
  
  showDataRMS(Rmstype: any, category: any, status1: any, fromDateRef2: any, toDateRef2: any) {

    // startdate: string, endDate: string, categoryType: string, maintenance: string, status: string,Rmstype:

    this.admibistrativeService.getRMSCategory(fromDateRef2, toDateRef2, category, Rmstype, status1).subscribe(
      data => {
        this.dataSource1.data = data;
        this.RMStype = 1;
        this.rmsData = data.item1;
        if(this.rmsData.length > 0){
          this.rmsDataColumns = Object.keys(this.rmsData[0]);
        }
        this.blockDataShow = 0
        ;
        this.IQACDataShow=0; // Show UI element indicating data is loaded
      },
      error => {
        console.error('Error fetching data', error);
      }
    );
  }
  
  exportExcel4(){
     this.admibistrativeService.getBlockmaster().subscribe({
      next: (data: any) => {
        this.dataSource1.data = data.item1;
       
    
        // Create a worksheet with the filtered data
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource1.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, "BlockMaster.xls");
      }


      })

  }


  
 
  exportExcel2(): void {
    const filteredData = this.dataSource1.data.map((row: any) => {
      const filteredRow: any = {};
      this.displayedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });

    // Create a worksheet with the filtered data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, "IQACData.xls");
  }
   
  
  
  // showData(){

  // }

  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
       
      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }
  showData(fromDate: any, toDate: any) {
    this.admibistrativeService.getIQACData(fromDate, toDate).subscribe({
      next: (data: any) => {
        this.dataSource.data = data.item1;
     
     this.IQACDataShow=1;
 
     this.blockDataShow=0;
    this.RMStype=0;
      },
      error: () => {
      
        // Handle error
      },
      complete: () => {
       
      }
    });
  }

    exportExcel() {
      // Create a filtered array of objects with only the displayed columns
      const filteredData = this.dataSource.data.map((row: any) => {
        const filteredRow: any = {};
        this.displayedColumns.forEach(col => {
          filteredRow[col] = row[col];
        });
        return filteredRow;
      });
  
      // Create a worksheet with the filtered data
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, "IQACData.xls");
    }
    Reset(){
      window.location.reload();
  
    }


   
  }



       


