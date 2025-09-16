import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { RMSService } from 'src/app/_services/rms.service';
import { StorageService } from 'src/app/_services/storage.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-rmstelephonic-dsr',
  templateUrl: './rmstelephonic-dsr.component.html',
  styleUrls: ['./rmstelephonic-dsr.component.scss']
})
export class RMSTelephonicDSRComponent implements OnInit {
  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any='';
  rmsDataColumns: any;
  toDate: any='';
  pipe = new DatePipe('en-CA');
  dataSource: any[] = [];
  data: any;
  rmsData: any;
  dataShowing: any = false;
  //dataSource = new MatTableDataSource<any>;

  constructor(private http: HttpClient, private rMSService: RMSService, private route: ActivatedRoute, // DEveloper Name Jatinder31309
    private storageService: StorageService,
    private authService: AuthService) {

  }
  displayedColumns: string[] = [

    ' messageId',
    'ticketNo',
    'messageType',
    'daysCount',
    'category',
    'subCategory',
    'subject',
    'description',
    'dateOforigin',
    'priority',
    'loggedBy',
    'status',
    'taskdays',
    'block',
    'roomNo',
    'remarks',
    'orginDate',
    'rating',
    'ratingCount',
    'isRating',
    'processStatus'
  ];
  dataLoaded: boolean = false;

  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
 

    if (loginName != '' && loginName != undefined) {
      this.storageService.clean();
      this.getToken(loginName);
    }
  }


  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">RMS Telephonic DSR </span>User Report';
        (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
        if (this.storageService.isLoggedIn() == false || authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }

      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('RMSReportss');
    if (element) {
      element.hidden = true;
    }
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
    XLSX.writeFile(wb, 'RMSTelephonicDSRDateWise.xlsx');
  }
  isLoading: boolean = false;
  
  showData() {
    if (new Date(this.fromDate) > new Date(this.toDate)) {
      swal.fire({
        title: 'Invalid Date',
        text: 'From Date should be less than or equal to To Date.',
        icon: 'warning',
        showConfirmButton: true,
      }).then(() => {
        window.location.reload();  
      });
      return;
    }
    this.isLoading = true;
    this.dataShowing = false;
  

    this.rMSService.getRMSTelephonicDSRDateWise(this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        this.rmsData = data.item1;
  
        if (this.rmsData.length > 0) {
          this.rmsDataColumns = Object.keys(this.rmsData[0]);
        }
  
        setTimeout(() => {
          const wrapper1 = document.getElementById('wrapper1');
          const wrapper2 = document.getElementById('wrapper2');
  
          if (wrapper1 && wrapper2) {
            wrapper1.onscroll = () => {
              wrapper2!.scrollLeft = wrapper1!.scrollLeft;
            };
            wrapper2.onscroll = () => {
              wrapper1!.scrollLeft = wrapper2!.scrollLeft;
            };
          }
  
          this.dataShowing = true;    
          this.isLoading = false;     
        }, 300); 
      },
      error: (error) => {
        this.isLoading = false;
        this.dataShowing = false;
        console.error('Error fetching data', error);
      },
      complete: () => {
      }
    });
  }
  

  isLoginFailed: boolean = false;

  resetForm() {
    this.fromDate = null;
    this.toDate = null;
    this.rmsData = [];
    this.rmsDataColumns = [];
    this.dataShowing = false;
    this.isLoading = false;
    window.location.reload();
  }
  
}
