import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Inject, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import { ActivatedRoute } from '@angular/router';

import { SummerSchoolWebService } from 'src/app/_services/summer-school-web.service';
import { FormBuilder, UntypedFormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Title } from '@angular/platform-browser';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

@Component({
  selector: 'app-summer-school-admin',
  templateUrl: './summer-school-admin.component.html',
  styleUrls: ['./summer-school-admin.component.scss']
})
export class SummerSchoolAdminComponent implements OnInit, AfterViewInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewDescModal2') viewDescModal2: TemplateRef<any>;
  @ViewChild('search', { static: false }) search: any;
  @ViewChild('searchOpen', { static: false }) searchOpen: any;
  @ViewChild('searchClose', { static: false }) searchClose: any;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'universityName', 'country', 'visitType', 'startDate', 'endDate',
    'xlsFileName', 'amount', 'uploadProof',
    'action', 'isApproved'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  SchoolData: any[];
  LoginId: any;
  loginName: any;
  Reason: any;
  serverUrl: any;
  showNoDataFoundMessage: any = 0;
  loadingIndicator: any;
  ColumnMode = ColumnMode;
  columns: any;
  headHtmlData: any[] = [];
  studentLists: any[];
  errorMessage: any;
  isLoginFailed: boolean;

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

  constructor(
    private storageService: StorageService,
    private mouDocumentsService: MouDocumentsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private summerSchool: SummerSchoolWebService,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    private universityService: SummerSchoolWebService,
    private title: Title
  ) { }

  ngAfterViewInit(): void {
    // Paginator and sort will be assigned after data is loaded
  }

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Summer School <span class="themeClr" >Admin Panel</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Summer School Approvals");

    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.GetAllSchoolData();
        this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  GetAllSchoolData(): void {
    this.summerSchool.GetAllSchoolData().subscribe({
      next: response => {
        this.SchoolData = response.item1;
        if (response.item1.length > 0) {
          this.SchoolData = response.item1;
          this.studentLists = response.item1;
          this.columns = [];
          this.headHtmlData = [];
          this.headHtmlData = this.SchoolData[0];
          this.columns = Object.keys(this.SchoolData[0]);
          this.columns = this.columns.filter((item: any) => item !== 'xlsFileName');
          this.columns.push();
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = 1;
          this.dataSource.data = this.SchoolData;

          // Assign paginator and sort after data is loaded
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });

          this.isLoginFailed = false;
        } else {
          this.SchoolData = [];
          this.showNoDataFoundMessage = 0;
          this.dataSource.data = [];

          // Assign paginator even when empty
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
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
      icon: 'warning',
    })
    const element = document.getElementById('adminPage');
    if (element) {
      element.hidden = true;
    }
  }

  exportToExcel(): void {
    const fileName = 'AdminPage_Excel_data.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.SchoolData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

  DisapproveStatus(Id: any) {
    swal.fire({
      title: "Please Provide Disapprove Reason",
      text: "Disapproval Reason",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.Reason = result.value;
        const formData = new FormData();
        formData.append('Id', Id);
        formData.append('DisapprovalReason', this.Reason);
        formData.append('Action', 'Disapprove');

        this.summerSchool.ApproveSummerSchool(formData).subscribe((data: any) => {
          window.location.reload();
        })
      }
    });
  }

  ChangeApproveStatus(Id: any) {
    const formData = new FormData();
    formData.append('Id', Id);
    formData.append('Action', 'Approve');

    swal.fire({
      title: 'Are you sure want to Change Status ?',
      text: 'Kindly confirm If the Document is Valid!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Accept Current Changes added!',
      cancelButtonText: 'No, Do not Change it'
    }).then((result: any) => {
      if (result.value) {
        this.summerSchool.ApproveSummerSchool(formData).subscribe((data: any) => {
          if (data.responseData == 'Cancel') {
            swal.fire(
              'Status is not changed !',
              '-------',
              'error'
            )
          } else {
            swal.fire(
              'Status Changed!',
              '----',
              'success'
            )
          }
          window.location.reload();
          setTimeout(() => {
            this.GetAllSchoolData();
          }, 1500);
        })
      } else {
        swal.fire(
          'Cancelled',
          'The Status is not changed',
          'error'
        )
      }
    })
  }
}
