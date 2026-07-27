import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
@Component({
  selector: 'app-all-announcements',
  templateUrl: './all-announcements.component.html',
  styleUrls: ['./all-announcements.component.scss']
})
export class AllAnnouncementsComponent implements OnInit {
 errorMessage: any;
 records:any;
  isLoginFailed: boolean;
  registrationNumber: any;
  DriveMessageData: any;
  showNoDataFoundMessage: boolean;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }

  ngOnInit(): void {
    this.GetPlacementAnnouncements('D','S');
  }
  GetPlacementAnnouncements(typeId: any, UtypeId: any): void {
    debugger;
    this.placementPortalService.GetPlacementAnnouncements(typeId, UtypeId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.records = response.item1;
          this.showNoDataFoundMessage = false;
          // console.log(" Data " + JSON.stringify(this.records))
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  LoginFailed(NewError: any) {
    this.errorMessage = NewError.errorMessage;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('myTabs');
    if (element) {
      element.hidden = true;
    }
  }
  
  recordsPerPage = 5; // Number of records to display per page
  currentPage = 1; // Current page number

  // Calculate the total number of pages
  get totalPages(): number {
    return Math.ceil(this.records.length / this.recordsPerPage);
  }

  // Generate an array of page numbers
  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  // Method to change the current page
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Method to get the records for the current page
  getRecordsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    return this.records.slice(startIndex, endIndex);
  }

  onPageChange(event:any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.records);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'AllAnnouncements.xlsx');
  }
}
