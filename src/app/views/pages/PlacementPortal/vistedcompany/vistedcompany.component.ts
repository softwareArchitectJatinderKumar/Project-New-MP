import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import {  Component, OnInit,} from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import {  UntypedFormBuilder } from '@angular/forms';
@Component({
  selector: 'app-vistedcompany',
  templateUrl: './vistedcompany.component.html',
  styleUrls: ['./vistedcompany.component.css']
})
export class VistedcompanyComponent implements OnInit {
  records: any;
  showNoDataFoundMessage: boolean;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }

  ngOnInit(): void {
    this.GetVisitedCompaniesDetails();    
  }


  GetVisitedCompaniesDetails(): void {
    debugger;
    this.placementPortalService.GetPlacementRecentVisitedCompanies().subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.records = response.item1;
          this.showNoDataFoundMessage = false;
          console.log(" VisitedCompanies Details " + JSON.stringify(this.records))
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        console.log(err.errorMessage);
      }
    });
  }
 

  recordsPerPage = 10; // Number of records to display per page
  currentPage = 1; // Current page number

  // Calculate the total number of pages
  get totalPages(): number {
    return Math.ceil(this.records?.length / this.recordsPerPage);
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
  // getRecordsForCurrentPage(): any[] {
  //   const startIndex = (this.currentPage - 1) * this.recordsPerPage;
  //   const endIndex = startIndex + this.recordsPerPage;
  //   return this.records?.slice(startIndex, endIndex);
  // }

  getRecordsForCurrentPage(): any[] {
    if (!this.records) {
        return []; // or handle the case when records is undefined/null
    }

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = Math.min(startIndex + this.recordsPerPage, this.records.length);
    const currentPageRecords = [];

    for (let i = startIndex; i < endIndex; i++) {
        currentPageRecords.push(this.records[i]);
    }

    return currentPageRecords;
}
}
