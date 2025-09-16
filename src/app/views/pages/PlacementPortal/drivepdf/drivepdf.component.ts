import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
@Component({
  selector: 'app-drivepdf',
  templateUrl: './drivepdf.component.html',
  styleUrls: ['./drivepdf.component.css']
})
export class DrivepdfComponent implements  OnInit {
  //dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  showNoDataFoundMessage: boolean;
  dataSource: any;
  errorMessage: any;
  isLoginFailed: boolean;
  CompanyDriveDetails: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder

  ) { }
  @ Input () CompanyData = [];

  ngOnInit(): void {

  }
 
  exportToPdf() {
    const table = document.getElementById('dataTable');
    if (table) {
      // html2canvas(table).then(canvas => {
      //   const imgData = canvas.toDataURL('image/png');
      //   const pdf = new jsPDF();
      //   const imgProps = pdf.getImageProperties(imgData);
      //   const pdfWidth = pdf.internal.pageSize.getWidth();
      //   const pdfHeight = (imgProps.height * pdfWidth)/ imgProps.width;
      //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight*0.8);
      //   pdf.save('table.pdf');
      // });
    } else {
      console.error("Table element not found.");
    }
  }

  GetPlacementCompanyDriveDetails(DriveId: any)//=43561
  {
  this.placementPortalService.GetPlacementCompanyDriveDetails(DriveId).subscribe({
    next: response => {
      if (response.item1 && response.item1.length > 0) {
        this.CompanyDriveDetails = response.item1;
        this.showNoDataFoundMessage = false;
      }
      else {
        this.showNoDataFoundMessage = true;
      }
      console.log(" Conduct details " + JSON.stringify(this.CompanyDriveDetails))
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

}
