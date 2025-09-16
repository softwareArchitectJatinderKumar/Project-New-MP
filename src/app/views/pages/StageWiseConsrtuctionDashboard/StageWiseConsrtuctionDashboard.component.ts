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
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Title } from '@angular/platform-browser';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
import { DatePipe } from '@angular/common';
import { Session } from 'inspector';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-StageWiseConsrtuctionDashboard',
  templateUrl: './StageWiseConsrtuctionDashboard.component.html',
  styleUrls: ['./StageWiseConsrtuctionDashboard.component.scss']
})
export class StageWiseConsrtuctionDashboardComponent implements OnInit {
  @ViewChild('TakeActionModal') TakeActionModal: TemplateRef<any>;
  @ViewChild('openStageDocumentModal') openStageDocumentModal: TemplateRef<any>;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  serverUrl: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = []; studentLists: any[];
  errorMessage: any;
  isLoginFailed: boolean = false;
  IsApproved: number = -1;
  col: any;
  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private Agreement: AgreementEntryService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private ObpService: ObpAutoAssignService,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    private modalService: NgbModal,

  ) { }
  title: any;


  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);

    }

  }
  LoginId: any;

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
        this.getAllPlannerSession();
        this.serverUrl = 'https://files.lpu.in/umsweb/Planning/PlanningProgress/';// this.serverUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
        this.LoginId = id.LoginId;
        this.allOBPEstateGetSupportingDocuments = [];
        const element = document.getElementById('OBPAdminAction');
        if (element) {
          element.hidden = false;
        }
        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'OBP Estate <span class="themeClr" >Verification</span>';
        (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
        // (<HTMLInputElement>document.getElementById('DocumentDetailsTable')).style.display = 'none';
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  // getToken(id: any) {
  //   this.authService.loginTemp(id).subscribe({
  //     next: data => {
  //       this.storageService.saveUser(data);
  //       this.getAllPlannerSession();
  //       this.serverUrl = 'https://files.lpu.in/umsweb/Planning/PlanningProgress/';// this.serverUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
  //       this.LoginId = id.LoginId;
  //       this.allOBPEstateGetSupportingDocuments =[];
  //       (<HTMLInputElement>document.getElementById('OBPAdminAction')).innerHTML = 'OBP Estate <span class="themeClr" >Verification</span>';
  //       (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  //       (<HTMLInputElement>document.getElementById('DocumentDetailsTable')).style.display = 'none';
  //     },
  //     error: err => {
  //       this.LoginFailed(err);
  //     }
  //   });
  // }

  allPlannerSessions: any[] = [];
  selectedPlannerSession: any = '-1';  // default selected value
  allOBPStaffData: any[] = [];

  getAllPlannerSession(): void {
    this.ObpService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
          //   console.log(JSON.stringify(this.allPlannerSessions));
        }
      }
    });
  }

  loadingIndicator = false; searchQuery: any = '';
  showTable: boolean = false;

  getStaffConstructionDetails(sessionId: number, IsApproved: number): void {
    if (sessionId === -1 || !sessionId) {
      alert('Please select a valid session.');
      return;
    }
  
    this.loadingIndicator = true;
    const minLoadingTime = 5500; // 1 min 52.5 sec
    const startTime = Date.now();
    let loginError: string | null = null;
  
    this.ObpService.GetOBPStaffConstructionDetails(sessionId, IsApproved)
      .pipe(
        finalize(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(minLoadingTime - elapsed, 0);
  
          // Delay hiding loader until at least minLoadingTime has passed
          setTimeout(() => {
            this.loadingIndicator = false;
            if (loginError) {
              this.handleLoginFailure(loginError);
            }
          }, remaining);
        })
      )
      .subscribe({
        next: (data) => {
          this.allOBPStaffData = data.item1;
  
          if (this.allOBPStaffData.length > 0) {
            this.columns = Object.keys(this.allOBPStaffData[0]).map(key => ({
              name: this.formatHeader(key),
              prop: key
            }));
          }
  
          this.showTable = true;
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          loginError = 'Unable to fetch data. Please try again.';
        }
      });
  }
  

  // getStaffConstructionDetails(sessionId: number, IsApproved: number): void {
  //   if (sessionId === -1 || !sessionId) {
  //     alert('Please select a valid session.');
  //     return;
  //   }
  //   this.loadingIndicator = true;
  //   const minLoadingTime = 112500;
  //   const startTime = Date.now();
  //   let loginError: string | null = null;

  //   this.ObpService.GetOBPStaffConstructionDetails(sessionId, IsApproved)
  //   .pipe(
  //     finalize(() => {
  //       const elapsed = Date.now() - startTime;
  //       const remaining = Math.max(minLoadingTime - elapsed, 0);
  //       setTimeout(() => {
  //         this.loadingIndicator =  false;
  //         if (loginError) {
  //           this.handleLoginFailure(loginError);
  //         }
  //       }, remaining);
  //     })
  //   )
  //   .subscribe({
  //     next: (data) => {
  //       this.allOBPStaffData = data.item1;
  //       // console.log(JSON.stringify(this.allOBPStaffData))
  //       if (this.allOBPStaffData.length > 0) {
  //         this.columns = Object.keys(this.allOBPStaffData[0]).map(key => ({
  //           name: this.formatHeader(key),
  //           prop: key
  //         }));
  //       }
  //       this.showTable = true;
  //       this.loadingIndicator = false;

  //     },
  //     error: (err) => {
  //       console.error('Error fetching data:', err);
  //       this.loadingIndicator = false;
  //     }
  //   });

  // }
  private handleLoginFailure(message: string): void {
    this.errorMessage = message;
    swal.fire({
      title: this.errorMessage,
      text: 'Login Failed!',
      icon: 'warning',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
      window.location.reload();
      }
    });
  }
  // Optional: format column headers nicely
  formatHeader(key: string): string {
    return key.replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }


  LoginFailed(NewError: any) {
    this.errorMessage = NewError;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('stMain');
    if (element) {
      element.hidden = true;
    }
  }


  selectedRowData: any = null;
  MetricId: any;
  modalRef: NgbModalRef;
  openStageModal(row: any): void {
    this.selectedRowData = row;
    this.MetricId = row.id;
    this.allOBPEstateGetSupportingDocuments = [];
    this.GetMetricStageAllocationDetails(row.id);
    this.modalRef = this.modalService.open(this.TakeActionModal, { size: 'md' });
    this.modalRef.result.then((result) => {
      console.log('Closed with:', result);
      // window.location.reload(); // optional
    }).catch((reason) => {
      console.log('Dismissed with:', reason);
    });
    // this.modalService.open(this.TakeActionModal, { size: 'md' }).result.then((result) => {  
    //   // window.location.reload();     
    // }).catch((res) => {

    //  });
  }

  alltMetricStageAllocationDetails: any[] = [];
  columnX: any;

  GetMetricStageAllocationDetails(MetricId: any): void {
    this.ObpService.GetMetricStageAllocationDetails(MetricId).subscribe({
      next: (response) => {
        if (response.item1) {
          this.alltMetricStageAllocationDetails = response.item1;
          if (this.alltMetricStageAllocationDetails.length > 0) {
            this.columnX = Object.keys(this.alltMetricStageAllocationDetails[0]).map(key => ({
              name: this.formatHeader(key),
              prop: key
            }));
          }
          this.openStageDocument();
          this.showTable = true;
          this.loadingIndicator = false;
        }
      },
      error: (errors) => {
        this.loadingIndicator = false;
      }
    });
  }


  Action: number = -1;
  Remarks: string = '';

  updateDetails(): void {
    if (this.Action == -1 || !this.Remarks.trim()) {
      alert('Please select an action and provide remarks.');
      return;
    }

    const formData = new FormData();
    formData.append('Id', this.MetricId); // Make sure this.MetricId is defined and string/convertible
    formData.append('IsApproved', this.Action.toString());
    formData.append('Remarks', this.Remarks);

    swal.fire({
      title: 'Are you sure you want to Update Details?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept current changes!',
      cancelButtonText: 'No, do not change it'
    }).then((result: any) => {
      if (result.value) {
        this.handleSchoolChange(formData);
      } else {
        this.showCancelledSwal();
      }
    });
  }

  private handleSchoolChange(formData: FormData) {
    this.ObpService.UpdateOBPStaffConstructionDetails(formData).subscribe((data: any) => {
      if (data.responseData === 'FAILED') {
        swal.fire(
          'No Change!',
          ' ',
          'error'
        );
      } else {
        swal.fire(
          ' Updation successfully !',
          '',
          'success'
        ).then(() => {
          // window.location.reload();
          this.ReloadData(-1);
          this.modalRef.close('action taken'); // closes with a result


        });
      }
    });
  }

  private showCancelledSwal() {
    swal.fire(
      'Cancelled',
      ' ',
      'error'
    );
  }


  ReloadData(IsApproved: any) {
    this.IsApproved = IsApproved;
    this.getStaffConstructionDetails(this.selectedPlannerSession, this.IsApproved);
  }

  OBPEstateGetSupportingDocuments: any[] = [];;
  allOBPEstateGetSupportingDocuments: any[] = [];;
  columnY: any;

  GetOBPEstateGetSupportingDocumentsforID(AllocationId: any) {
    this.ObpService.GetOBPEstateGetSupportingDocuments(AllocationId).subscribe({
      next: (response) => {
        if (response.item1) {
          this.allOBPEstateGetSupportingDocuments = response.item1;

          // Dynamically generate columns from keys of first object
          if (this.allOBPEstateGetSupportingDocuments.length > 0) {
            this.columnY = Object.keys(this.allOBPEstateGetSupportingDocuments[0]).map(key => ({
              name: this.formatHeader(key),
              prop: key
            }));
          }
        }
      }
    });
  }
  showSupportingDocuments: boolean = false;

  openStageDocument(): void {
    this.showSupportingDocuments = true;
    this.GetOBPEstateGetSupportingDocumentsforID(this.MetricId);
    const element = document.getElementById('DocumentDetailsTable');
    if (element) {
      element.hidden = false;
    }

    // (<HTMLInputElement>document.getElementById('DocumentDetailsTable')).style.display = 'block';
  }


  DownloadFile(DataGet: any) {
    window.open(this.serverUrl + DataGet.supportingDocument, '_blank');
  }
}