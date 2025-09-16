import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import swal from 'sweetalert2';

import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { RMSService } from 'src/app/_services/rms.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-RMSDistanceReport',
  templateUrl: './RMSDistanceReport.component.html',
  styleUrls: ['./RMSDistanceReport.component.scss']
})
export class RMSDistanceReportComponent implements OnInit {
  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any=0;      RMSDistanceDataColumns: any;    toDate: any=0;    pipe = new DatePipe('en-CA');   dataSource: any[] = [];   data: any;    RMSDistanceData: any; // DEveloper Name Jatinder31309
  dataShowing: any = false;
  //dataSource = new MatTableDataSource<any>;

  constructor(private http: HttpClient,  private route: ActivatedRoute,
    private storageService: StorageService,
    private RMSService: RMSService,
    private authService: AuthService) {

  }
  displayedColumns: string[] = [
    'dsrRatingDO',
    'totalRMS', 'responseasperpolicyCount', 'incompleteresponseCount', 'issuenoteffectivelyredressedCount', 'lateresponseCount'
  ];
  HeaddisplayedColumns: string[] = [
    'DsrRating DO',
    'Total RMS', 'Responseas /PolicyCount', 'Incomplete ResponseCount', 'Issuenot-Effectively-RedressedCount', 'Late-ResponseCount'
  ];
  dataLoaded: boolean = false;

  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">RMS Distance</span> ODL/OL Report  <span class="themeClr"></span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        // this.showData();
      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

  Reset() {
    window.location.reload();

  }
  exportExcel() {
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
    // XLSX.writeFile(wb, 'Data.xlsx');  

    let element = document.getElementById('dataTableExampleNews');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'RMSDistanceReport.xlsx');


  }
  ResetData()
  {
    this.fromDate = this.toDate = '';
    this.RMSDistanceData=[];
    this.dataShowing=false;  
  } 
  isLoading: boolean = false; 



  showData() {
    this.isLoading = true; 
    this.RMSService.GetDistanceRMSODLOLDetails(this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        this.dataLoaded = true;
        this.RMSDistanceData = data.item1;
        if (this.RMSDistanceData?.length > 0) {
          this.RMSDistanceDataColumns = Object.keys(this.RMSDistanceData[0]);
        }
        this.dataShowing = true;
        setTimeout(() => {

          var wrapper1 = (<HTMLInputElement>document.getElementById('wrapper1'));
          var wrapper2 = (<HTMLInputElement>document.getElementById('wrapper2'));
          wrapper1.onscroll = function () {
            wrapper2.scrollLeft = wrapper1.scrollLeft;
          };
          wrapper2.onscroll = function () {
            wrapper1.scrollLeft = wrapper2.scrollLeft;
          };

        }, 4000);
        
      },
      error: (error) => {
        this.dataShowing = false;
        console.error('Error fetching data', error);
      },
      complete: () => {
        this.dataShowing = true;
        console.log('Data fetching complete');
        this.isLoading = false; 
      }
    });
  }

 DownloadUploadedAction(row:any){
  alert(JSON.stringify(row))
  //mouActionTakenDocument
 // window.open(row.mouActionTakenDocument, '_blank');
 }

}
