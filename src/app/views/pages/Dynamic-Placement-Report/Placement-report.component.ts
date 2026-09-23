import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject, debounceTime, fromEvent, map } from 'rxjs';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
@Component({
  selector: 'app-placement-report',
  templateUrl: './placement-report.component.html',
  styleUrls: ['./placement-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class placementReportComponent implements OnInit {
  
  loadingIndicator = false;
 
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private modalService: NgbModal, private mouDocumentsService: MouDocumentsService,
    config: NgbRatingConfig,
    private changeDetectorRefs: ChangeDetectorRef,
    private route: ActivatedRoute, private storageService: StorageService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private placementService: PlacementService,) {
  }


  serverUrl: any;
  isLoginFailed: any;
  ngOnInit(): void {

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr" > Coordinator </span> Document<span class="themeClr" > Search </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.loadingIndicator = false;
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
     
    }
    else {
      this.LoginFailed('Invalid Login Details');
    }
  }

  getToken(id: string): void {
    this.authService.loginTemp(id).subscribe({
      next: data => {
         this.GetAllDetails(id);
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  LoginFailed(NewError: any) {
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

DocumentsData: any;
  filteredMouDocumentsData: any;
  dataSource: any ;
  showNoDataFoundMessage: boolean = false;
  
  GetAllDetails(Uid: any): void {
    this.placementService.getAllPlacementCoordinator().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.DocumentsData = response.item1;
          this.filteredMouDocumentsData = this.DocumentsData;
          this.showNoDataFoundMessage = this.filteredMouDocumentsData.length === 0;
          this.isLoginFailed = false;
        } else {
          this.dataSource.data = this.DocumentsData = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }


  
  recordsPerPage = 5;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.filteredMouDocumentsData.length / this.recordsPerPage);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }
  getRecordsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    return this.filteredMouDocumentsData.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }


    exportToExcel(): void {
      const fileName = 'Mou_Document_report.xlsx';

      const exportedData = this.filteredMouDocumentsData.map((item: { Stream: any; Coordinator: any; CoordinatorType: any; Department: any; School: any; EmailID: any; MobileNo: any; STATUS: any; }) => ({
        'Stream': item.Stream ,//2
        'Coordinator': item.Coordinator ,//2
        'CoordinatorType': item.CoordinatorType ,//2
        'Department': item.Department ,//2
        'School': item.School ,//2
        'EmailID': item.EmailID ,//2
        'MobileNo': item.MobileNo ,//2
        'STATUS': item.STATUS ,//2
      }));
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
  
      const wscols = Array(18).fill({ wpx: 280 }); // Simplified column width assignment
      ws['!cols'] = wscols;
  
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
      link.download = fileName;
      link.click();
    }
  


     onDownloadFile(remoteUrl: string): void {
        swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); }});
    
        this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
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
}
