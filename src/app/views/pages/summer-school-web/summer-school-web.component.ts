import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { SchoolDetails, DropDownList, UpdateSchoolData } from './SummerSchool.model';
import { SummerSchoolWebService } from 'src/app/_services/summer-school-web.service';
import { Title } from '@angular/platform-browser';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

@Component({
  selector: 'app-summer-school-web',
  templateUrl: './summer-school-web.component.html',
  styleUrls: ['./summer-school-web.component.scss']
})
export class SummerSchoolWebComponent implements OnInit {
   @Input() componentTitle: string = 'Summer Scholl';

  onDownloadFile(remoteUrl: string, folderUrl: any): void {
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

    this.mouDocumentsService.downloadMOUFile(folderUrl + remoteUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        swal.close();
      },
      error: async (err) => {
        swal.close();
        if (err.error instanceof Blob) {
          const errorMsg = JSON.parse(await err.error.text());
          swal.fire('Error', errorMsg.message || 'Download failed', 'error');
        } else {
          swal.fire('Error', 'Could not connect to the server', 'error');
        }
      }
    });
  }

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceIn: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceOut: MatTableDataSource<any> = new MatTableDataSource<any>();

  displayedColumns: string[] = [
    'universityName', 'country', 'startDate', 'endDate',
    'visitDuration', 'xlsFileName', 'amount', 'remarksAmounts', 'uploadProof',
    'isApproved', 'action'
  ];

  displayedColumnsIn: string[] = [
    'universityName', 'country', 'xlsFileName', 'startDate',
    'endDate', 'visitDuration', 'uploadProof', 'amount', 'remarksAmounts', 'isApproved'
  ];

  displayedColumnsOut: string[] = [
    'universityName', 'country', 'participants', 'startDate',
    'endDate', 'visitDuration', 'uploadProof', 'amount', 'remarksAmounts', 'isApproved'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorIn') paginatorIn: MatPaginator;
  @ViewChild('sortIn') sortIn: MatSort;
  @ViewChild('paginatorOut') paginatorOut: MatPaginator;
  @ViewChild('sortOut') sortOut: MatSort;

  summerSchoolForm: FormGroup;
  LoginId: any;
  loginName: any;
  UniversityName: any;
  Country: any;
  Participants: any;
  OrganisationName: any;
  ProofFile1: any;
  ProofFile2: any;
  ProofFile3: any;
  createdBy: any;
  UpdatedBy: any;
  isActive: any;
  UpdateOn: any;
  Remarks: any;
  SessionDetail: any;
  endDate: any;
  startDate: any;
  fileData: { [key: number]: File } = {};
  fileStatus: { [key: number]: boolean } = {};
  uploadEnabled: { [key: number]: boolean } = {};
  documentUploaded: { [key: string]: boolean } = {};
  FileData: string;
  fileName: string;
  UploadProof: string | Blob;
  SchoolData: any;
  Amount: any;
  RemarksAmount: any;
  Days: any;
  UniversityOutgoingName: any;
  showNoDataFoundMessage: any;
  SelfCountry: any;
  registrationRows: any[] = [];
  ParticipantsOut: any;
  startDateOut: any;
  endDateOut: any;
  DaysOut: any;
  AmountOut: any;
  RemarksAmountOut: any;
  excelSheet: any;
  XlsFileData: string;
  XlsfileName: string;
  serverUrl: any;
  currencies: any[] = [];
  selectedCurrencySymbol: string = '';
  isVisible = false;

  CurrencyList: DropDownList[] = [
    { code: "AFN", text: "Afghanistan " },
    { code: "ALL", text: "Albania " },
    { code: "DZD", text: "Algeria " },
    { code: "ARS", text: "Argentina " },
    { code: "AUD", text: "Australia " },
    { code: "ATS", text: "Austria " },
    { code: "BSD", text: "Bahamas " },
    { code: "BHD", text: "Bahrain " },
    { code: "BDT", text: "Bangladesh " },
    { code: "BBD", text: "Barbados " },
    { code: "BEF", text: "Belgium " },
    { code: "BMD", text: "Bermuda " },
    { code: "BRL", text: "Brazil " },
    { code: "BGN", text: "Bulgaria " },
    { code: "CAD", text: "Canada " },
    { code: "XOF", text: "CFA BCEAO " },
    { code: "XAF", text: "CFA BEAC " },
    { code: "CLP", text: "Chile" },
    { code: "CNY", text: "China Yuan " },
    { code: "COP", text: "Colombia " },
    { code: "XPF", text: "CFP Francs" },
    { code: "CRC", text: "Costa Rica " },
    { code: "HRK", text: "Croatia " },
    { code: "CYP", text: "Cyprus " },
    { code: "CZK", text: "Czech Republic" },
    { code: "DKK", text: "Denmark " },
    { code: "DEM", text: "Deutsche (Germany)" },
    { code: "DOP", text: "Dominican Republic" },
    { code: "NLG", text: "Dutch (Netherlands)" },
    { code: "XCD", text: "Eastern Caribbean " },
    { code: "EGP", text: "Egypt " },
    { code: "EEK", text: "Estonia" },
    { code: "EUR", text: "Euro " },
    { code: "FJD", text: "Fiji " },
    { code: "FIM", text: "Finland " },
    { code: "FRF", text: "France " },
    { code: "DEM", text: "Germany " },
    { code: "XAU", text: "Gold " },
    { code: "GRD", text: "Greece" },
    { code: "GTQ", text: "Guatemalan " },
    { code: "NLG", text: "Holland " },
    { code: "HKD", text: "Hong Kong " },
    { code: "HUF", text: "Hungary " },
    { code: "ISK", text: "Iceland " },
    { code: "XDR", text: "IMF Special " },
    { code: "INR", text: "India " },
    { code: "IDR", text: "Indonesia " },
    { code: "IRR", text: "Iran " },
    { code: "IQD", text: "Iraq " },
    { code: "IEP", text: "Ireland " },
    { code: "ILS", text: "Israel " },
    { code: "ITL", text: "Italy " },
    { code: "JMD", text: "Jamaica " },
    { code: "JPY", text: "Japan " },
    { code: "JOD", text: "Jordan" },
    { code: "KES", text: "Kenya " },
    { code: "KRW", text: "Korea " },
    { code: "KWD", text: "Kuwait" },
    { code: "LBP", text: "Lebanon " },
    { code: "LUF", text: "Luxembourg " },
    { code: "MYR", text: "Malaysia " },
    { code: "MTL", text: "Malta " },
    { code: "MUR", text: "Mauritius " },
    { code: "MXN", text: "Mexico " },
    { code: "MAD", text: "Morocco" },
    { code: "NLG", text: "Netherlands" },
    { code: "NZD", text: "New Zealand" },
    { code: "NOK", text: "Norway " },
    { code: "OMR", text: "Oman " },
    { code: "PKR", text: "Pakistan " },
    { code: "XPD", text: "Palladium" },
    { code: "PEN", text: "Peru Nuevos " },
    { code: "PHP", text: "Philippines " },
    { code: "XPT", text: "Platinum " },
    { code: "PLN", text: "Poland " },
    { code: "PTE", text: "Portugal " },
    { code: "QAR", text: "Qatar " },
    { code: "RON", text: "Romania " },
    { code: "ROL", text: "Romania " },
    { code: "RUB", text: "Russia " },
    { code: "SAR", text: "Saudi Arabia " },
    { code: "XAG", text: "Silver " },
    { code: "SGD", text: "Singapore " },
    { code: "SKK", text: "Slovakia " },
    { code: "SIT", text: "Slovenia " },
    { code: "ZAR", text: "South Africa " },
    { code: "KRW", text: "South Korea " },
    { code: "ESP", text: "Spain " },
    { code: "XDR", text: "Special Drawing Rights" },
    { code: "LKR", text: "Sri Lanka " },
    { code: "SDD", text: "Sudan " },
    { code: "SEK", text: "Sweden " },
    { code: "CHF", text: "Switzerland " },
    { code: "TWD", text: "Taiwan New " },
    { code: "THB", text: "Thailand " },
    { code: "TTD", text: "Trinidad and Tobago " },
    { code: "TND", text: "Tunisia" },
    { code: "TRY", text: "Turkey " },
    { code: "AED", text: "United Arab Emirates " },
    { code: "GBP", text: "United Kingdom " },
    { code: "USD", text: "United States " },
    { code: "VEB", text: "Venezuela " },
    { code: "VND", text: "Vietnam " },
    { code: "ZMK", text: "Zambia " }
  ];

  columns: any;
  headHtmlData: any[] = [];
  studentLists: any[];
  isLoginFailed: boolean;
  errorMessage: any;
  UniversityId: any;
  foundData: any;
  SchoolDataOut: any;
  SchoolDataIn: any;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private summerSchool: SummerSchoolWebService,
    private modalService: NgbModal,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    private universityService: SummerSchoolWebService,
    private mouDocumentsService: MouDocumentsService,
    private title: Title
  ) { }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Summer School <span class="themeClr" >Registration </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Summer School Registration");

    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
    this.initializeForm();
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.GetAllSchoolData();
        this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
        this.SelfCountry = "India";
        this.UniversityOutgoingName = "Lovely Professional University Phagwara Punjab";

        setTimeout(() => {
          document.getElementById('summerschool-incomming-tab')?.click();
        }, 200);

        setTimeout(() => {
          if (this.SchoolDataIn && this.SchoolDataIn.length > 0) {
            this.dataSourceIn.data = this.SchoolDataIn;
            this.dataSourceIn.paginator = this.paginatorIn;
            this.dataSourceIn.sort = this.sortIn;
          }

          if (this.SchoolDataOut && this.SchoolDataOut.length > 0) {
            this.dataSourceOut.data = this.SchoolDataOut;
            this.dataSourceOut.paginator = this.paginatorOut;
            this.dataSourceOut.sort = this.sortOut;
          }
        }, 1000);

        const currentDate = new Date();
        this.startDateOut = this.endDateOut = this.startDate = this.endDate = this.formatDate(currentDate);
        this.isLoginFailed = false;
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    return `${year}-${month}-${day}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  @ViewChild('table') table: ElementRef;

  initializeForm(): void {
    this.summerSchoolForm = this.fb.group({
      UniversityName: ['', Validators.required],
      Participants: [0, Validators.required],
      OrganisationName: ['', Validators.required],
      Country: ['', Validators.required],
      UploadProof: [''],
      createdBy: ['', Validators.required],
      UpdateOn: [new Date(), Validators.required],
      Remarks: [''],
      SessionDetail: [new Date(), Validators.required]
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterIn(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceIn.filter = filterValue.trim().toLowerCase();
  }

  applyFilterOut(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOut.filter = filterValue.trim().toLowerCase();
  }

  GetAllSchoolData(): void {
    this.summerSchool.GetAllSchoolData().subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.SchoolData = response.item1;
          this.showNoDataFoundMessage = false;
          this.SchoolDataOut = this.SchoolData.filter((item: { visitType: string, isActive: any }) =>
            item.visitType.toLowerCase().includes('out') && item.isActive == 1);
          this.dataSource.data = this.SchoolData.filter((item: { isActive: any }) => item.isActive == 1);
          this.SchoolData = this.dataSource.data;
          this.SchoolDataIn = this.SchoolData.filter((item: { visitType: string, isActive: any }) =>
            item.visitType.toLowerCase().includes('incom') && item.isActive == 1);
          this.refreshData();
        } else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  LoginFailed(NewError: any) {
    this.errorMessage = NewError.error.message;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning'
    });
    const element = document.getElementById('myTabs');
    if (element) {
      element.hidden = true;
    }
  }

  exportToExcelOut(): void {
  const columnsToUse = [
    { header: 'University', field: 'universityName' },
    { header: 'Participants', field: 'participants' },
    { header: 'Country', field: 'country' },
    { header: 'Visit Start Date', field: 'startDate' },
    { header: 'Visit End Date', field: 'endDate' },
    { header: 'Duration (Days)', field: 'visitDuration' },
    { header: 'Visit Type', field: 'visitType' },
    { header: 'Amount Received', field: 'amount' },
    { header: 'Particulars', field: 'remarksAmounts' },
    { header: 'Approval Status', field: 'isApproved' }
  ];

  if (!this.SchoolDataOut || this.SchoolDataOut.length === 0) {
    console.error("No data to export");
    return;
  }

  const dataToExport = this.SchoolDataOut.map((record: any) => {
    let newRecord: any = {};
    
    columnsToUse.forEach((col: any) => {
      let value = record[col.field];

      if (col.field === 'startDate' || col.field === 'endDate') {
        value = value ? new Date(value).toLocaleDateString('en-GB') : '';
      }

      if (col.field === 'isApproved') {
        if (value === true ) value = `Approved By ${record.approvedBy}`;
        else if (value === false) value = `Disapproved By ${record.approvedBy}: ${record.disapprovalReason || ''}`;
        else value = 'Pending Approval';
      }

      newRecord[col.header] = value ?? '';
    });
    return newRecord;
  });

  const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  const workBook: XLSX.WorkBook = { 
    Sheets: { 'SummerSchoolOutgoing': workSheet }, 
    SheetNames: ['SummerSchoolOutgoing'] 
  };
  
  const fileName = `SummerSchool_Export_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(workBook, fileName);
}

  exportToExcels(): void {
  const columnsToUse = [
    { header: 'University', field: 'universityName' },
    { header: 'Country', field: 'country' },
    { header: 'Participants', field: 'participants' },
    { header: 'Visit Start Date', field: 'startDate' },
    { header: 'Visit End Date', field: 'endDate' },
    { header: 'Duration (Days)', field: 'visitDuration' },
    { header: 'Amount Received', field: 'amount' },
    { header: 'Particulars', field: 'remarksAmounts' },
    { header: 'Approval Status', field: 'isApproved' }
  ];

  if (!this.SchoolDataIn || this.SchoolDataIn.length === 0) {
    console.error("No data to export");
    return;
  }

  const dataToExport = this.SchoolDataIn.map((record: any) => {
    let newRecord: any = {};
    
    columnsToUse.forEach((col: any) => {
      let value = record[col.field];

      // Handle Dates to match dd/MM/yyyy format in your grid
      if (col.field === 'startDate' || col.field === 'endDate') {
        value = value ? new Date(value).toLocaleDateString('en-GB') : '';
      }

      // Handle Approval Switch Case logic from your HTML
      if (col.field === 'isApproved') {
        if (value === 1) value = `Approved By ${record.approvedBy}`;
        else if (value === 0) value = `Disapproved By ${record.approvedBy}: ${record.disapprovalReason || ''}`;
        else value = 'Pending Approval';
      }

      newRecord[col.header] = value ?? '';
    });
    return newRecord;
  });

  const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  const workBook: XLSX.WorkBook = { 
    Sheets: { 'SummerSchoolData': workSheet }, 
    SheetNames: ['SummerSchoolData'] 
  };
  
  const fileName = `SummerSchool_Export_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(workBook, fileName);
}
  clearForm() {
    this.UniversityName = this.Country = this.Participants = this.startDate = this.endDate = this.Amount = this.RemarksAmount = this.Days = '';
  }

  onCountryChange() {
    // console.log('Selected Country:', this.Country);
  }

  addRow() {
    this.registrationRows.push({ registrationNo: '', name: '', schoolname: '', coursename: '' });
  }

  addRegistrationRows() {
    this.isVisible = true;
    if (this.Participants > 0 && this.Participants <= 50) {
      this.registrationRows = Array.from({ length: Math.floor(this.Participants) }, (_, i) => ({
        registrationNo1: '',
        name1: ''
      }));
    } else {
      swal.fire(
        'Only 50 Records are allowed',
        '-------',
        'error'
      );
      this.registrationRows = [];
      this.Participants = null;
    }
  }

  addRegistrationRowsOut() {
    if (this.ParticipantsOut > 0 && this.ParticipantsOut <= 50) {
      this.registrationRows = Array.from({ length: Math.floor(this.ParticipantsOut) }, (_, i) => ({
        registrationNo1: '',
        name1: ''
      }));
    } else {
      swal.fire(
        'Only 50 Records are allowed',
        '-------',
        'error'
      );
      this.registrationRows = [];
      this.ParticipantsOut = null;
    }
  }

  UpdateSchoolData(UpdateSchoolData: any) {
    UpdateSchoolData.CreatedBy = this.loginName;
    this.summerSchool.addsummerSchool(UpdateSchoolData).subscribe({
      next: data => {
        switch (data[0]['returnData']) {
          case '-1':
            swal.fire({
              title: 'Duplicate Application not Allowed',
              icon: 'error'
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            break;

          case 'success':
            swal.fire({
              title: 'University Details are added',
              text: data[0]['returnData'],
              icon: 'success'
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            break;
          case '-2':
            swal.fire({
              title: 'Something went Wrong',
              text: data[0]['returnData'],
              icon: 'error'
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            break;
          default:
            swal.fire({
              title: 'Something went Wrong',
              text: data[0]['returnData'],
              icon: 'error'
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            break;
        }
      }
    });
  }

  RegisterSummerSchool() {
    const formData = new FormData();
    formData.append("UploadProof", this.fileName);
    formData.append("UniversityName", this.UniversityName);
    formData.append("Participants", this.Participants);
    formData.append("Country", this.Country);
    formData.append("StartDate", this.startDate);
    formData.append("EndDate", this.endDate);
    formData.append("File", this.FileData);
    formData.append("Amount", this.Amount);
    if (this.RemarksAmount.length >= 3) {
      formData.append("RemarksAmounts", this.RemarksAmount);
    }
    formData.append("VisitDuration", this.Days);
    formData.append("VisitType", 'Incomming');
    formData.append("XlsFile", this.XlsfileName);
    formData.append("XlFile", this.XlsFileData);

    var result;
    this.summerSchool.addsummerSchool(formData).subscribe({
      next: data => {
        result = data.item1[0]['msg'];
        if (result == 'OK') {
          swal.fire({
            title: 'Uploaded the Document',
            text: data.item1[0]['msg'],
            icon: 'success'
          });
          this.clearForm();
        } else {
          swal.fire({
            title: 'Something went wrong',
            text: result,
            icon: 'error'
          });
        }
        this.clearForm();
        this.PageReload();
      }
    });
  }

  PageReload() {
    swal.fire({
      title: 'Summer School Registration',
      text: 'Registration screen!',
      icon: 'info',
      showCancelButton: false,
      confirmButtonText: 'Ok  !'
    }).then((result: any) => {
      if (result.value) {
        this.clearForm();
        setTimeout(() => {
          this.GetAllSchoolData();
        }, 9500);
        window.location.reload();
      }
    });
  }

  refreshData() {
    setTimeout(() => {
      if (this.SchoolDataIn && this.SchoolDataIn.length > 0) {
        this.dataSourceIn.data = this.SchoolDataIn;
        this.dataSourceIn.paginator = this.paginatorIn;
        this.dataSourceIn.sort = this.sortIn;
      }

      if (this.SchoolDataOut && this.SchoolDataOut.length > 0) {
        this.dataSourceOut.data = this.SchoolDataOut;
        this.dataSourceOut.paginator = this.paginatorOut;
        this.dataSourceOut.sort = this.sortOut;
      }
    }, 500);
  }

  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = file.name;
      }
    }
  }

  onFileSelectedXls(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.XlsFileData = ssssArray[1];
        this.XlsfileName = file.name;
      }
    }
  }

  calculateDays() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const timeDiff = Math.abs(end.getTime() - start.getTime()) + 1;
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.Days = diffDays.toString();
    }
  }

  calculateDaysOut() {
    if (this.startDateOut && this.endDateOut) {
      const start = new Date(this.startDateOut);
      const end = new Date(this.endDateOut);
      const timeDiff = Math.abs(end.getTime() - start.getTime()) + 1;
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.DaysOut = diffDays.toString();
    }
  }

  OutgoingSummerSchool() {
    var result;
    const formData = new FormData();
    formData.append("UploadProof", this.fileName);
    formData.append("UniversityName", this.UniversityOutgoingName);
    formData.append("Participants", this.ParticipantsOut);
    formData.append("Country", this.SelfCountry);
    formData.append("StartDate", this.startDateOut);
    formData.append("EndDate", this.endDateOut);
    formData.append("File", this.FileData);
    formData.append("Amount", this.AmountOut);
    formData.append("RemarksAmounts", this.RemarksAmountOut);
    formData.append("VisitDuration", this.DaysOut);
    formData.append("VisitType", 'Outgoing');
    formData.append("XlsFile", this.XlsfileName);
    formData.append("XlFile", this.XlsFileData);

    this.summerSchool.addsummerSchool(formData).subscribe({
      next: data => {
        result = data.item1[0]['msg'];
        if (result == 'OK') {
          swal.fire({
            title: 'Uploaded the Document',
            text: data.item1[0]['msg'],
            icon: 'success'
          });
          this.clearForm();
        } else {
          swal.fire({
            title: 'Something went wrong',
            text: result,
            icon: 'error'
          });
        }
        this.PageReload();
      }
    });
  }
}
