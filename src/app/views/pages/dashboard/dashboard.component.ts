import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '../../../_services/storage.service';
import { AuthService } from '../../../_services/auth.service';
import { RMSService } from '../../../_services/rms.service';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import {NgbRatingConfig} from '@ng-bootstrap/ng-bootstrap';


import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  preserveWhitespaces: true
})
export class DashboardComponent implements OnInit,AfterViewInit {
  fromDate: any=0;       toDate: any=0;    pipe = new DatePipe('en-CA');   dataSource: any[] = [];   data: any;    MouData: any; // Developer Name Jatinder31309
  /**
   * Apex chart
   */

  defaultNavActiveId = 1;
  isLoading:any= 1;
  currentRate:any;
  public customersChartOptions: any = {};
  public ordersChartOptions: any = {};
  public growthChartOptions: any = {};
  public revenueChartOptions: any = {};
  public monthlySalesChartOptions: any = {};
  public monthlyRatingChartOptions: any = {};
  public monthlyForwardedChartOptions: any = {};
  public cloudStorageChartOptions: any = {};
  public averageRatingChartOptions: any = {};

  // colors and font variables for apex chart 
  obj = {
    primary        : "#EF7F1A",
    secondary      : "#EF7F1A",
    success        : "#05a34a",
    info           : "#66d1d1",
    warning        : "#fbbc06",
    danger         : "#ff3366",
    light          : "#e9ecef",
    dark           : "#060c17",
    muted          : "#7987a1",
    gridBorder     : "rgba(77, 138, 240, .15)",
    bodyColor      : "#000",
    cardBg         : "#fff",
    fontFamily     : "'Roboto', Helvetica, sans-serif"
  }

  /**
   * NgbDatepicker
   */
  tool:any = '';
  activeTab = 'search';
  currentDate: NgbDateStruct;
  rmsData :any = {};
  rmsInputData :any = {};
  public lineChartOptions: any = {};
  public getInputChartOptions: any = {};
  rmsDataPending :any = {};
  rmsDataClosedCases :any = {};
  rmsDataNoActionCases :any = {};
  rmsDataRating:any={};
  rmsDataRatingChart:any={};
  searchQuery: any;
  tmpsBookingData: any;
  constructor(private calendar: NgbCalendar,config: NgbRatingConfig,private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private rmsService: RMSService) {

      config.max = 5;
      config.readonly = true;

    }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">RMS </span> <span class="themeClr"> Dashboard </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    this.currentDate = this.calendar.getToday();
   
    // this.customersChartOptions = getCustomerseChartOptions(this.obj);
    // this.ordersChartOptions = getOrdersChartOptions(this.obj);
    // this.growthChartOptions = getGrowthChartOptions(this.obj);
    // this.revenueChartOptions = getRevenueChartOptions(this.obj);
   // this.monthlySalesChartOptions = getMonthlySalesChartOptions(this.obj);
    

    // Some RTL fixes. (feel free to remove if you are using LTR))
    // if (document.querySelector('html')?.getAttribute('dir') === 'rtl') {
    //   this.addRtlOptions();
    // }

    this.route.queryParams
      .subscribe(params => {
        
        let style = params['uid'];
        this.getToken(params['uid']);
      }
    );

  }
  

  search(activeTab: string){
    if(activeTab == 'search'){
      this.getMonthlyChart();
    }
    this.activeTab = activeTab;
  }

  result(activeTab: string){
    if(activeTab == 'result'){
      this.getRatingChart();
    }
    else if(activeTab == 'search'){
      this.getMonthlyChart();
    }
  else if(activeTab == 'getinput'){
    this.getInputGiveInputChart();
  }

    this.activeTab = activeTab;
  }
  ngAfterViewInit(): void {

    // Show chat-content when clicking on chat-item for tablet and mobile devices
    document.querySelectorAll('.chat-list .chat-item').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelector('.chat-content')!.classList.toggle('show');
      })
    });

  }
  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {
        
        this.storageService.saveUser(data);
       this.getAllRMSData();
      },
      error: err => {
        this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }
getAllRMSData(){
  this.rmsService.getdashboardData().subscribe({
    next: data => {
      this.getInvolvmentData();
      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.rmsData = data.item1;
      // alert(JSON.stringify(this.rmsData))
      // console.log(JSON.stringify(this.rmsData))
      this.rmsDataRatingChart =data.item2; 
      this.rmsDataPending = this.rmsData.filter((x: { status: any; })=>x['status']=='Open');
      this.rmsDataClosedCases = this.rmsData.filter((x: { status: any; })=>x['status']=='Close');
      this.rmsDataNoActionCases = this.rmsData.filter((x: { status: any; })=>x['status']=='null');      
      // console.log("all cases "+JSON.stringify(this.rmsData))
      
      this.rmsDataRating = this.rmsData.filter((x: { rating: any; })=>x['rating'] != -1);
      var group = this.rmsData.reduce(function (r: { [x: string]: { monthName: string; count: number; }; }, o: any | number | Date){
        var date = new Date(o.loggedDate); 
        const year = new Date(o.loggedDate).getFullYear();
        var month = date.getMonth();
        var monthName = monthNames[month];
        (r[monthName]) ? r[monthName].count++ : r[monthName] = { monthName: year + ':' + monthName, count: 1 };
     return r; 
     }, {});
     var result = Object.keys(group).map((key) => group[key]);
    
     this.monthlySalesChartOptions = getMonthlySalesChartOptions(result,this.obj);
     this.monthlyRatingChartOptions = getRatingChartOptions(this.rmsDataRatingChart,this.obj);
     this.monthlyForwardedChartOptions = getForwardedChartOptions(this.rmsDataRatingChart,this.obj);

   //  debugger;
   this.currentRate = this.rmsData[0]['averageRating'];
   this.tool = '<i  data-star='+this.currentRate+'></i>';
   this.cloudStorageChartOptions = getCloudStorageChartOptions(this.rmsData[0]['totalPercentage'],this.obj);
   //this.averageRatingChartOptions = getratingAverageChartOptions(this.rmsDataRatingChart[0]['totalRatingPercentage'],this.rmsData[0]['averageRating'],this.obj);
     this.isLoading=0;
     setTimeout(() => {
      const dataTable = new DataTable("#dataTableExample");
      const dataTable2 = new DataTable("#dataTableExample2");
      const dataTable3 = new DataTable("#dataTableExample3");
      const dataTable4 = new DataTable("#dataTableExample4");
  }, 1000);
     
    },
    });

}

ResetData()
{
  this.fromDate = this.toDate = '';
  this.rmsData=[];
} 
  getInvolvmentData(){
    this.rmsService.getInvolvementData().subscribe({
      next: data => {
        let giveInputData=[];
        let getInputData=[];
        debugger;
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.rmsInputData = data.item1;


       debugger;
      },
    });
        
  }

  ariaValueText(current: number, max: number) {
		return `${current} out of ${max} hearts`;
	}
  get_data(){
    alert(12);
  }
  getRatingChart(){
   debugger;
   

     
     this.monthlyRatingChartOptions = getRatingChartOptions(this.rmsDataRatingChart,this.obj);
     this.monthlyForwardedChartOptions = getForwardedChartOptions(this.rmsDataRatingChart,this.obj);

   //  this.averageRatingChartOptions = getratingAverageChartOptions(this.rmsDataRatingChart[0]['totalRatingPercentage'],this.rmsData[0]['averageRating'],this.obj);
   this.currentRate = this.rmsData[0]['averageRating'];
   this.tool = '<i  data-star='+this.currentRate+'></i>';
    }

  getMonthlyChart(){
    debugger;
    
 
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var group = this.rmsData.reduce(function (r: { [x: string]: { monthName: string; count: number; }; }, o: any | number | Date){
      var date = new Date(o.loggedDate); 
      const year = new Date(o.loggedDate).getFullYear();
      var month = date.getMonth();
      var monthName = monthNames[month];
      (r[monthName]) ? r[monthName].count++ : r[monthName] = { monthName: year + ':' + monthName, count: 1 };
   return r; 
   }, {});
   var result = Object.keys(group).map((key) => group[key]);




   
   this.monthlySalesChartOptions = getMonthlySalesChartOptions(result,this.obj);
   this.cloudStorageChartOptions = getCloudStorageChartOptions(this.rmsData[0]['totalPercentage'],this.obj);
   }


   getInputGiveInputChart(){
   debugger;
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let giveInputData = this.rmsInputData.filter((x: { type: string; })=>x.type === 'GiveInput');
    let getInputData = this.rmsInputData.filter((x: { type: string; })=>x.type === 'GetInput');
    
            var group = giveInputData.reduce(function (r: { [x: string]: { monthName: string; count: number; }; }, o: any | number | Date){
              var date = new Date(o.involvementDate); 
              const year = new Date(o.involvementDate).getFullYear();
              var month = date.getMonth();
              var monthName = monthNames[month];
              (r[monthName]) ? r[monthName].count++ : r[monthName] = { monthName: year + ':' + monthName, count: 1 };
           return r; 
           }, {});
           var result = Object.keys(group).map((key) => group[key]);
    
    
           var groupGetInput= getInputData.reduce(function (r: { [x: string]: { monthName: string; count: number; }; }, o: any | number | Date){
            var date = new Date(o.involvementDate); 
            const year = new Date(o.involvementDate).getFullYear();
            var month = date.getMonth();
            var monthName = monthNames[month];
            (r[monthName]) ? r[monthName].count++ : r[monthName] = { monthName: year + ':' + monthName, count: 1 };
         return r; 
         }, {});
         var resultGetInput = Object.keys(groupGetInput).map((key) => groupGetInput[key]);
    
         this.lineChartOptions = getLineChartOptions(resultGetInput,result,this.obj);
         this.getInputChartOptions = getInputChartOptions(resultGetInput,result,this.obj);

   }

  /**
   * Only for RTL (feel free to remove if you are using LTR)
   */
  addRtlOptions() {
    // Revenue chart
    this.revenueChartOptions.yaxis.labels.offsetX = -25;
    this.revenueChartOptions.yaxis.title.offsetX = -75;

    //  Monthly sales chart
    this.monthlySalesChartOptions.yaxis.labels.offsetX = -10;
    this.monthlySalesChartOptions.yaxis.title.offsetX = -70;

    this.monthlyRatingChartOptions.yaxis.labels.offsetX = -10;
    this.monthlyRatingChartOptions.yaxis.title.offsetX = -70;

    this.monthlyForwardedChartOptions.yaxis.labels.offsetX = -10;
    this.monthlyForwardedChartOptions.yaxis.title.offsetX = -70;
  }



  searchDataGrid() {
    const query = this.searchQuery.toLowerCase();
    this.tmpsBookingData = this.rmsDataPending.filter((item: { [s: string]: unknown; } | ArrayLike<unknown>) => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      );
    });
  }


  exportToExcel(): void {
    // alert(this.rmsData?.length)
    const fileName = 'AllRMS_Details_report.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rmsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }
  exportToExcel1(): void {
    // alert(this.rmsData?.length)
    const fileName = 'AllOpenRMS_Details_report.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rmsDataPending);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }
  exportToExcel2(): void {    
    const fileName = 'AllClosedRMS_Details_report.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rmsDataClosedCases);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }
  exportToExcel3(): void {    
    const fileName = 'NoActionRMS_Details_report.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rmsDataNoActionCases);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }
 

}


/**
 * Customerse chart options
 */
function getCustomerseChartOptions(obj: any) {
  return {
    series: [{
      name: '',
      data: [3844, 3855, 3841, 3867, 3822, 3843, 3821, 3841, 3856, 3827, 3843]
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: ["Jan 01 2022", "Jan 02 2022", "Jan 03 2022", "Jan 04 2022", "Jan 05 2022", "Jan 06 2022", "Jan 07 2022", "Jan 08 2022", "Jan 09 2022", "Jan 10 2022", "Jan 11 2022",],
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }
};



/**
 * Orders chart options
 */
function getOrdersChartOptions(obj: any) {
  return {
    series: [{
      name: '',
      data: ["10","2","0.1","1","1","1","1","1","1","1","1","1"]
    }],
    chart: {
      type: "bar",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    plotOptions: {
      bar: {
        borderRadius: 2,
        columnWidth: "60%"
      }
    },
    xaxis: {
      type: 'string',
      categories: ["asd", "asdasd","asdasdsd","asdasd","asdasd","asdasd","asdasdvvvvsd","asdafsdfwsd","assdfdasd","asdasfdd","asdasd23","asdasdsd"],
    }
  }
};



/**
 * Growth chart options
 */
function getGrowthChartOptions(obj: any) {
  return {
    series: [{
      name: '',
      data: [41, 45, 44, 46, 52, 54, 43, 74, 82, 82, 89]
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: ["Jan 01 2022", "Jan 02 2022", "Jan 03 2022", "Jan 04 2022", "Jan 05 2022", "Jan 06 2022", "Jan 07 2022", "Jan 08 2022", "Jan 09 2022", "Jan 10 2022", "Jan 11 2022",],
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }
};



/**
 * Revenue chart options
 */
function getRevenueChartOptions(obj: any) {
  return {
    series: [{
      name: "Revenue",
      data: [
        49.3,
        48.7,
        50.6,
        53.3,
        54.7,
        53.8,
        54.6,
        56.7,
        56.9,
        56.1,
        56.5,
        60.3,
        58.7,
        61.4,
        61.1,
        58.5,
        54.7,
        52.0,
        51.0,
        47.4,
        48.5,
        48.9,
        53.5,
        50.2,
        46.2,
        48.6,
        51.7,
        51.3,
        50.2,
        54.6,
        52.4,
        53.0,
        57.0,
        52.9,
        48.7,
        52.6,
        53.5,
        58.5,
        55.1,
        58.0,
        61.3,
        57.7,
        60.2,
        61.0,
        57.7,
        56.8,
        58.9,
        62.4,
        58.7,
        58.4,
        56.7,
        52.7,
        52.3,
        50.5,
        55.4,
        50.4,
        52.4,
        48.7,
        47.4,
        43.3,
        38.9,
        34.7,
        31.0,
        32.6,
        36.8,
        35.8,
        32.7,
        33.2,
        30.8,
        28.6,
        28.4,
        27.7,
        27.7,
        25.9,
        24.3,
        21.9,
        22.0,
        23.5,
        27.3,
        30.2,
        27.2,
        29.9,
        25.1,
        23.0,
        23.7,
        23.4,
        27.9,
        23.2,
        23.9,
        19.2,
        15.1,
        15.0,
        11.0,
        9.20,
        7.47,
        11.6,
        15.7,
        13.9,
        12.5,
        13.5,
        15.0,
        13.9,
        13.2,
        18.1,
        20.6,
        21.0,
        25.3,
        25.3,
        20.9,
        18.7,
        15.3,
        14.5,
        17.9,
        15.9,
        16.3,
        14.1,
        12.1,
        14.8,
        17.2,
        17.7,
        14.0,
        18.6,
        18.4,
        22.6,
        25.0,
        28.1,
        28.0,
        24.1,
        24.2,
        28.2,
        26.2,
        29.3,
        26.0,
        23.9,
        28.8,
        25.1,
        21.7,
        23.0,
        20.7,
        29.7,
        30.2,
        32.5,
        31.4,
        33.6,
        30.0,
        34.2,
        36.9,
        35.5,
        34.7,
        36.9
      ]
    }],
    chart: {
      type: "line",
      height: '400',
      parentHeightOffset: 0,
      foreColor: obj.bodyColor,
      background: obj.cardBg,
      toolbar: {
        show: false
      },
    },
    colors: [obj.primary, obj.danger, obj.warning],
    grid: {
      padding: {
        bottom: -4,
      },
      borderColor: obj.gridBorder,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: "datetime",
      categories: [
        "Jan 01 2022", "Jan 02 2022", "jan 03 2022", "Jan 04 2022", "Jan 05 2022", "Jan 06 2022", "Jan 07 2022", "Jan 08 2022", "Jan 09 2022", "Jan 10 2022", "Jan 11 2022", "Jan 12 2022", "Jan 13 2022", "Jan 14 2022", "Jan 15 2022", "Jan 16 2022", "Jan 17 2022", "Jan 18 2022", "Jan 19 2022", "Jan 20 2022","Jan 21 2022", "Jan 22 2022", "Jan 23 2022", "Jan 24 2022", "Jan 25 2022", "Jan 26 2022", "Jan 27 2022", "Jan 28 2022", "Jan 29 2022", "Jan 30 2022", "Jan 31 2022",
        "Feb 01 2022", "Feb 02 2022", "Feb 03 2022", "Feb 04 2022", "Feb 05 2022", "Feb 06 2022", "Feb 07 2022", "Feb 08 2022", "Feb 09 2022", "Feb 10 2022", "Feb 11 2022", "Feb 12 2022", "Feb 13 2022", "Feb 14 2022", "Feb 15 2022", "Feb 16 2022", "Feb 17 2022", "Feb 18 2022", "Feb 19 2022", "Feb 20 2022","Feb 21 2022", "Feb 22 2022", "Feb 23 2022", "Feb 24 2022", "Feb 25 2022", "Feb 26 2022", "Feb 27 2022", "Feb 28 2022",
        "Mar 01 2022", "Mar 02 2022", "Mar 03 2022", "Mar 04 2022", "Mar 05 2022", "Mar 06 2022", "Mar 07 2022", "Mar 08 2022", "Mar 09 2022", "Mar 10 2022", "Mar 11 2022", "Mar 12 2022", "Mar 13 2022", "Mar 14 2022", "Mar 15 2022", "Mar 16 2022", "Mar 17 2022", "Mar 18 2022", "Mar 19 2022", "Mar 20 2022","Mar 21 2022", "Mar 22 2022", "Mar 23 2022", "Mar 24 2022", "Mar 25 2022", "Mar 26 2022", "Mar 27 2022", "Mar 28 2022", "Mar 29 2022", "Mar 30 2022", "Mar 31 2022",
        "Apr 01 2022", "Apr 02 2022", "Apr 03 2022", "Apr 04 2022", "Apr 05 2022", "Apr 06 2022", "Apr 07 2022", "Apr 08 2022", "Apr 09 2022", "Apr 10 2022", "Apr 11 2022", "Apr 12 2022", "Apr 13 2022", "Apr 14 2022", "Apr 15 2022", "Apr 16 2022", "Apr 17 2022", "Apr 18 2022", "Apr 19 2022", "Apr 20 2022","Apr 21 2022", "Apr 22 2022", "Apr 23 2022", "Apr 24 2022", "Apr 25 2022", "Apr 26 2022", "Apr 27 2022", "Apr 28 2022", "Apr 29 2022", "Apr 30 2022",
        "May 01 2022", "May 02 2022", "May 03 2022", "May 04 2022", "May 05 2022", "May 06 2022", "May 07 2022", "May 08 2022", "May 09 2022", "May 10 2022", "May 11 2022", "May 12 2022", "May 13 2022", "May 14 2022", "May 15 2022", "May 16 2022", "May 17 2022", "May 18 2022", "May 19 2022", "May 20 2022","May 21 2022", "May 22 2022", "May 23 2022", "May 24 2022", "May 25 2022", "May 26 2022", "May 27 2022", "May 28 2022", "May 29 2022", "May 30 2022",
      ],
      lines: {
        show: true
      },
      axisBorder: {
        color: obj.gridBorder,
      },
      axisTicks: {
        color: obj.gridBorder,
      },
      crosshairs: {
        stroke: {
          color: obj.secondary,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Revenue ( $1000 x )',
        style:{
          size: 9,
          color: obj.muted
        }
      },
      tickAmount: 4,
      tooltip: {
        enabled: true
      },
      crosshairs: {
        stroke: {
          color: obj.secondary,
        },
      },
      labels: {
        offsetX: 0,
      },
    },
    markers: {
      size: 0,
    },
    stroke: {
      width: 2,
      curve: "straight",
    },
  }
};

function getRatingChartOptions(data:any,obj: any) {
  
  let rmsMonth = [];
  let rmsData = [];
  for(let i=0; i < data.length; i++){
    rmsMonth.push(data[i]['monthYear']);
    rmsData.push(data[i]['averageRating']);
  }
  
   
    return {
      series: [{
        name: 'Average RMS',
        data: rmsData
      }],
      chart: {
        type: 'bar',
        height: '318',
        parentHeightOffset: 0,
        foreColor: obj.bodyColor,
        background: obj.cardBg,
        toolbar: {
          show: false
        },
      },
      colors: [obj.primary],  
      fill: {
        opacity: .9
      } , 
      grid: {
        padding: {
          bottom: -4
        },
        borderColor: obj.gridBorder,
        xaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        type: 'string',
        categories:rmsMonth,
        axisBorder: {
          color: obj.gridBorder,
        },
        axisTicks: {
          color: obj.gridBorder,
        },
      },
      yaxis: {
        title: {
          text: 'Number of RMS',
          style:{
            size: 9,
            color: obj.muted
          }
        },
        labels: {
          offsetX: 0,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: 'center',
        fontFamily: obj.fontFamily,
        itemMargin: {
          horizontal: 8,
          vertical: 0
        },
      },
      stroke: {
        width: 0
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '10px',
          fontFamily: obj.fontFamily,
        },
        offsetY: -27
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          borderRadius: 4,
          dataLabels: {
            position: 'top',
            orientation: 'vertical',
          }
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    }
  }

  //Forword RMS

  function getForwardedChartOptions(data:any,obj: any) {
  
    let rmsMonth = [];
    let rmsData = [];
    for(let i=0; i < data.length; i++){
      rmsMonth.push(data[i]['monthYear']);
      rmsData.push(data[i]['averageRating']);
    }
    
     
      return {
        series: [{
          name: 'Average RMS',
          data: rmsData
        }],
        chart: {
          type: 'bar',
          height: '318',
          parentHeightOffset: 0,
          foreColor: obj.bodyColor,
          background: obj.cardBg,
          toolbar: {
            show: false
          },
        },
        colors: [obj.primary],  
        fill: {
          opacity: .9
        } , 
        grid: {
          padding: {
            bottom: -4
          },
          borderColor: obj.gridBorder,
          xaxis: {
            lines: {
              show: true
            }
          }
        },
        xaxis: {
          type: 'string',
          categories:rmsMonth,
          axisBorder: {
            color: obj.gridBorder,
          },
          axisTicks: {
            color: obj.gridBorder,
          },
        },
        yaxis: {
          title: {
            text: 'Number of RMSs',
            style:{
              size: 9,
              color: obj.muted
            }
          },
          labels: {
            offsetX: 0,
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: 'center',
          fontFamily: obj.fontFamily,
          itemMargin: {
            horizontal: 8,
            vertical: 0
          },
        },
        stroke: {
          width: 0
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '10px',
            fontFamily: obj.fontFamily,
          },
          offsetY: -27
        },
        plotOptions: {
          bar: {
            columnWidth: "50%",
            borderRadius: 4,
            dataLabels: {
              position: 'top',
              orientation: 'vertical',
            }
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: "bottom"
              }
            }
          }
        ]
      }
    }
  
/**
 * Monthly sales chart options
 */
function getMonthlySalesChartOptions(data:any,obj: any) {
  
let rmsMonth = [];
let rmsData = [];
for(let i=0; i < data.length; i++){
  rmsMonth.push(data[i]['monthName']);
  rmsData.push(data[i]['count']);
}

 
  return {
    series: [{
      name: 'RMS',
      data: rmsData
    }],
    chart: {
      type: 'bar',
      height: '318',
      parentHeightOffset: 0,
      foreColor: obj.bodyColor,
      background: obj.cardBg,
      toolbar: {
        show: false
      },
    },
    colors: [obj.primary],  
    fill: {
      opacity: .9
    } , 
    grid: {
      padding: {
        bottom: -4
      },
      borderColor: obj.gridBorder,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'string',
      categories:rmsMonth,
      axisBorder: {
        color: obj.gridBorder,
      },
      axisTicks: {
        color: obj.gridBorder,
      },
    },
    yaxis: {
      title: {
        text: 'Number of RMS',
        style:{
          size: 9,
          color: obj.muted
        }
      },
      labels: {
        offsetX: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: 'center',
      fontFamily: obj.fontFamily,
      itemMargin: {
        horizontal: 8,
        vertical: 0
      },
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontFamily: obj.fontFamily,
      },
      offsetY: -27
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
        dataLabels: {
          position: 'top',
          orientation: 'vertical',
        }
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  }
}

/**
 * Cloud storage chart options
 */
 function getCloudStorageChartOptions(per:any,obj: any) {
  
  debugger;
  return {
    series: [per],
    chart: {
      height: 260,
      type: "radialBar"
    },
    colors: [obj.primary],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%"
        },
        track: {
          show: true,
          background: obj.light,
          strokeWidth: '100%',
          opacity: 1,
          margin: 5, 
        },
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -11,
            show: true,
            color: obj.muted,
            fontSize: "13px"
          },
          value: {
            color: obj.bodyColor,
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    fill: {
      opacity: 1
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["RMS Percentage"]
  }
};


function getratingAverageChartOptions(per:any,val:any,obj: any) {
  
  debugger;
  return {
    series: [per],
    chart: {
      height: 260,
      type: "radialBar"
    },
    events: {
      callbacks:function() {
        // you can call Vue methods now as "this" will point to the Vue instance when you use ES6 arrow function
        alert(1);
      },
      updated: function() {
        alert(2);
      }
    },
   
    colors: [obj.primary],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%"
        },
        track: {
          show: true,
          background: obj.light,
          strokeWidth: '100%',
          opacity: 1,
          margin: 5, 
        },
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -11,
            show: true,
            color: obj.muted,
            fontSize: "13px"
          },
          value: {
            color: obj.bodyColor,
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    fill: {
      opacity: 1
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["RMS Rating Average is " + val]
  }
};


function getLineChartOptions(dataGet:any,dataGive:any,obj: any) {

  let getMonth = [];
  let giveData = [];

  for(let i=0; i < dataGive.length; i++){
    getMonth.push(dataGet[i]['monthName']);
    giveData.push(dataGive[i]['count']);
  }
  

  return {
    
    series: [
      {
        name: "Desktops",
        data: giveData
      }
    ],
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight"
    },
    title: {
      text: "Product Trends by Month",
      align: "left"
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    xaxis: {
      categories: getMonth
    }
  }
};



function getInputChartOptions(dataGet:any,dataGive:any,obj: any) {

  let getMonth = [];
  let getdata = [];
  for(let i=0; i < dataGet.length; i++){
    getMonth.push(dataGet[i]['monthName']);
    getdata.push(dataGet[i]['count']);
  }



  return {
    
    series: [
      {
        name: "Desktops",
        data: getdata
      }
    ],
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight"
    },
    title: {
      text: "Product Trends by Month",
      align: "left"
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    xaxis: {
      categories: getMonth
    }
  }
};

