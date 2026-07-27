
import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';


@Component({
  selector: 'app-duty-leave',
  templateUrl: './duty-leave.component.html',
  styleUrls: ['./duty-leave.component.css']
})
export class DutyLeaveComponent implements OnInit {
  records: any;


  data: number;
  registrationNumber: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,

  ) { }

  getRegisterationNo(): void {
    this.route.params.subscribe(params => {
      this.registrationNumber = +params['RegistrationId'];
      // console.log("registrationNumber  Duty Leave page= " + this.registrationNumber)
    });
  }

  ngOnInit(): void {
    this.getRegisterationNo();
    this.GetDutyLeaveDetails(this.registrationNumber);
  }

  GetDutyLeaveDetails(regId: number) : void  {
    this.placementPortalService.GetPlacementCandidateDutyLeave(regId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.records = response.item1;
        }
        else{
          this.records=[];
        }
      }
  })
}
  recordsPerPage = 15; // Number of records to display per page
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

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.records);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'table_data.xlsx');
  }
}
