import { DatePipe } from '@angular/common';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';  // DEveloper Name Jatinder31309
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { RMSService } from 'src/app/_services/rms.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-RMSDSRRatingReport',
  templateUrl: './RMSDSRRatingReport.component.html',
  styleUrls: ['./RMSDSRRatingReport.component.scss']
})
export class RMSDSRRatingReportComponent implements OnInit {
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewDescModal2') viewDescModal2: TemplateRef<any>;
  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any;
  rmsDataColumnsRMSDSRRatingDataDetails: any; 
  rmsDataColumns: any; 
  toDate: any;
  pipe = new DatePipe('en-CA');
  dataSource: any[] = [];
  dataSourceRMSDSRRatingDataDetails: any[] = [];
  data: any;
  dataRMSDSRRatingDataDetails: any;
  rmsData: any;
  rmsDataRMSDSRRatingDataDetails: any;
  dataShowing: any = false;
  dataShowingRMSDSRRatingDataDetails: any = false;
  //dataSource = new MatTableDataSource<any>;

  displayedColumns: string[] = [
    // 	totalRMS	responseasperpolicyCount	incompleteresponseCount	issuenoteffectivelyredressedCount	lateresponseCount  // DEveloper Name Jatinder31309
    'dsrRatingDO',
    'TotalRMS',
    'Response As Per PolicyCount',
    'Incomplete ResponseCount',
    'Issue Note Effectively Redressed Count',
    'Late ResponseCount',
  ];

  constructor(private http: HttpClient, private rMSService: RMSService, private route: ActivatedRoute,
    private storageService: StorageService,  private modalService: NgbModal,
    private authService: AuthService) {

  }
  
  dataLoaded: boolean = false;
  dataLoadedRMSDSRRatingDataDetails: boolean = false;

  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">RMS DSR </span> Rating Report';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
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
    XLSX.writeFile(wb, 'RMSDSRRatingReport.xlsx');


  }

 
predefinedResponses = {
  "policy": "Response as per policy",
  "incomplete": "Incomplete response",
  "late": "Late response",
  "Issue": "Issue not effectively redressed",
  "null": " "
};
ResetData()
{
  this.fromDate = this.toDate = '';
  this.rmsData=[];
  this.dataShowing=false;  
} 
getResponse(value: any): string {
  switch (value) {
    case 2:
      return this.predefinedResponses.policy;
    case 3:
      return this.predefinedResponses.incomplete;
    case 4:
      return this.predefinedResponses.late;
    case 5:
      return this.predefinedResponses.Issue;
    default:
      return this.predefinedResponses.policy;
  }
}


getData(Title : any,Value: any, LoginName: any){

  // alert ("Title " + Title + "ColIndex  "+Value)
  this.getRMSDSRRatingDataDetails(Title, LoginName);

  this.modalService.open(this.viewDescModal2, { size: 'sm' }).result.then(
    (result: string) => {
      console.log("Modal closed" + result);
    }
  ).catch((res: any) => { });

}

getRMSDSRRatingDataDetails(Title: any, LoginName: any) { 
  this.rMSService.GetRMSDSRRatingDataDetails(this.fromDate, this.toDate, Title, LoginName).subscribe({ 
    next: (data: any) => {
      this.dataSourceRMSDSRRatingDataDetails = data.item1;
      this.dataLoadedRMSDSRRatingDataDetails = true;
      this.rmsDataRMSDSRRatingDataDetails = data.item1;

      if (this.rmsDataRMSDSRRatingDataDetails && this.rmsDataRMSDSRRatingDataDetails.length > 0) {
        this.rmsDataColumnsRMSDSRRatingDataDetails = Object.keys(this.rmsDataRMSDSRRatingDataDetails[0]);
      } else {
        const wrapper11 = document.getElementById('wrapper11');
        const wrapper21 = document.getElementById('wrapper21');
        if (wrapper11) wrapper11.innerHTML = "No Data Found";
        if (wrapper21) wrapper21.innerHTML = "No Data Found";
      }

      this.dataShowingRMSDSRRatingDataDetails = true;
      
      setTimeout(() => {
        const wrapper11 = document.getElementById('wrapper11') as HTMLElement;
        const wrapper21 = document.getElementById('wrapper21') as HTMLElement;
        wrapper11.onscroll = () => wrapper21.scrollLeft = wrapper11.scrollLeft;
        wrapper21.onscroll = () => wrapper11.scrollLeft = wrapper21.scrollLeft;
      }, 1000);

    },
    error: (error) => {
      this.dataShowingRMSDSRRatingDataDetails = false;
      console.error('Error fetching data', error);
    },
    complete: () => {
      this.dataShowingRMSDSRRatingDataDetails = true;
      console.log('Data fetching complete');
    }
  });
}

exportExcelRatingGrid() {
  // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
  // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
  // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
  // XLSX.writeFile(wb, 'Data.xlsx');  

  let element = document.getElementById('dataTableExampleDataDSRRating');
  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

  /* generate workbook and add the worksheet */
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  /* save to file */
  XLSX.writeFile(wb, 'RMSDSRRatingReportRemarks.xlsx');


}
isLoading: boolean = false;  
  showData() {
    this.isLoading = true; 
    this.rMSService.GetUIDWiseRMSDSRRatingReport(this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        this.dataLoaded = true;
        this.rmsData = data.item1;
        if (this.rmsData.length > 0) {
          this.rmsDataColumns = Object.keys(this.rmsData[0]);
        }
        this.dataShowing = this.rmsData.length > 0;
     
        setTimeout(() => {

          var wrapper1 = (<HTMLInputElement>document.getElementById('wrapper1'));
          var wrapper2 = (<HTMLInputElement>document.getElementById('wrapper2'));
          wrapper1.onscroll = function () {
            wrapper2.scrollLeft = wrapper1.scrollLeft;
          };
          wrapper2.onscroll = function () {
            wrapper1.scrollLeft = wrapper2.scrollLeft;
          };

        }, 11000);
        this.isLoading = false;
      },
      error: (error) => {
        this.dataShowing = false;
        console.error('Error fetching data', error);
      },
      complete: () => {
        this.dataShowing = true;
        console.log('Data fetching complete');
      }
    });
  }

}
