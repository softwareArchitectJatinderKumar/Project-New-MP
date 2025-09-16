import { FormBuilder, FormGroup } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/_services/auth.service';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { StorageService } from 'src/app/_services/storage.service';

import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { University } from './university.model';
import { ColumnMode } from '@swimlane/ngx-datatable';

import { Component, ElementRef, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-sm-add-new-university',
  templateUrl: './sm-add-new-university.component.html',
  styleUrls: ['./sm-add-new-university.component.scss']
})
export class SmAddNewUniversityComponent implements OnInit {
  isUpdateMode: boolean = false;
  fileName: string = 'University_Upload_ExcelData.xlsx'; 
  filePath: string = `assets/uploads/${this.fileName}`;

  dataSource: MatTableDataSource<any>;

  selectedId: number;
  ColumnMode = ColumnMode;
  columns: any;
  loadingIndicator = false;
  headHtmlData: any[] = [];
  p: any = 1;
  perPage: any = 5;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loginName: any; serverUrl: any;

  @ViewChild('dataTable') table: ElementRef;
  UniverstiesData: any; foundData: any; selectedFile: any;
  universityForm: FormGroup; UniversityName: any; CountryName: any;
  UniversityRank: any; RankParameter: any; SigninDate: any; ExpiryDate: any;
  EmailId: any; SeatAvailable: any; CoordinateName: any; ContactNo: any;
  isActive: any; CoursesOffered: any; file: any; arrayBuffer: string | ArrayBuffer | null;
  exceljsondata: unknown[]; uploadedData: any = ""; Pushexceldata: any[];
  createdBy: any; CreatedBy: any; responses: any; Reason: any; UniversityId: any;
  checkListDocs: any;
  UniversityYear: any;
  NominationDeadlineAutumn: any;
  ApplicationDeadlineAutumn: any;
  MobilityAutumn: any;
  ApplicationDeadlineSpring: any;
  MobilitySpring: any;
  NominationApplicationFormats: any;
  FactSheetLink: any;
  DocumentsRequired: any;
  NominationDeadlineSpring: any;
  SemesterAcademicYear: any;
  validationErrors: string[] = [];
  errorCells: { rowIndex: number, cellIndex: number }[] = [];
  CourseLink: any;
  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private semesmigr: SemesterExchangeStuDetailsService,
    private modalService: NgbModal,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    private router: Router,
    private universityService: SemesterExchangeStuDetailsService
  ) { }
  ngOnInit(): void {
    let LoginId = this.storageService.getUser();
    if (LoginId != null || LoginId != undefined) {
      this.loginName = LoginId;
    } else {
      swal.fire(
        { title: 'Something went Wrong ', icon: 'error' }
      )
      this.router.navigateByUrl('/SMAdmin/');
    }
    this.createdBy = this.CreatedBy = this.loginName;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = file;
      if (file) {
        this.readExcelFile(file);
      }
    }
  }

  readExcelFile(file: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.uploadedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      this.validateData();
    };
    reader.readAsArrayBuffer(file);
  }

  validateData() {
    this.validationErrors = [];
    this.errorCells = [];
    this.uploadedData.forEach((row: any, rowIndex: number) => {
      if (rowIndex === 0) return; // Skip header row
      let errorMessages = [];
      if (!this.isValidEmail(row[9])) {
        errorMessages.push('Invalid Email ID');
        this.errorCells.push({ rowIndex, cellIndex: 9 });
      }
      if (isNaN(row[2])) {
        errorMessages.push('Seat Available must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 2 });
      }
      if (isNaN(row[10])) {
        errorMessages.push('Contact No must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 10 });
      }
      this.validationErrors[rowIndex] = errorMessages.join(', ');
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hasErrors(): boolean {
    return this.validationErrors.some(error => error.length > 0);
  }

  isError(rowIndex: number, cellIndex: number): boolean {
    return this.errorCells.some(errorCell => errorCell.rowIndex === rowIndex && errorCell.cellIndex === cellIndex);
  }

  confirmUpload() {
    this.Upload();
  }

  Upload() {
    var xmlString = '<dataset><data>';
    for (var i = 1; i < this.uploadedData.length; i++) {
      var element = this.uploadedData[i];
      var row = "<row>";
      row += "<UniversityName>" + this.getPropertyByIndex(element, 0) + "</UniversityName>";
      row += "<CountryName>" + this.getPropertyByIndex(element, 1) + "</CountryName>";
      row += "<SeatAvailable>" + this.getPropertyByIndex(element, 2) + "</SeatAvailable>";
      row += "<Semester_AcademicYear>" + this.getPropertyByIndex(element, 3) + "</Semester_AcademicYear>";
      row += "<RankParameter>" + this.getPropertyByIndex(element, 4) + "</RankParameter>";
      row += "<UniversityRank>" + this.getPropertyByIndex(element, 5) + "</UniversityRank>";
      row += "<SigninDate>" + this.getPropertyByIndex(element, 6) + "</SigninDate>";
      row += "<ExpiryDate>" + this.getPropertyByIndex(element, 7) + "</ExpiryDate>";
      row += "<CoordinateName>" + this.getPropertyByIndex(element, 8) + "</CoordinateName>";
      row += "<EmailId>" + this.getPropertyByIndex(element, 9) + "</EmailId>";
      row += "<ContactNo>" + this.getPropertyByIndex(element, 10) + "</ContactNo>";
      row += "<NominationDeadLineAutumn>" + this.getPropertyByIndex(element, 11) + "</NominationDeadLineAutumn>";
      row += "<ApplicationDeadLineAutumn>" + this.getPropertyByIndex(element, 12) + "</ApplicationDeadLineAutumn>";
      row += "<MobilityAutumn>" + this.getPropertyByIndex(element, 13) + "</MobilityAutumn>";
      row += "<NominationDeadLineSpring>" + this.getPropertyByIndex(element, 14) + "</NominationDeadLineSpring>";
      row += "<ApplicationDeadLineSpring>" + this.getPropertyByIndex(element, 15) + "</ApplicationDeadLineSpring>";
      row += "<MobilitySpring>" + this.getPropertyByIndex(element, 16) + "</MobilitySpring>";
      row += "<FactSheetLink>" + this.getPropertyByIndex(element, 17) + "</FactSheetLink>";
      row += "<CourseLink>" + this.getPropertyByIndex(element, 18) + "</CourseLink>";
      row += "<Nomination_Application_Formats>" + this.getPropertyByIndex(element, 19) + "</Nomination_Application_Formats>";
      row += "<DocumentsRequired>" + this.getPropertyByIndex(element, 20) + "</DocumentsRequired>";
      row += "</row>";
      xmlString += row;
    }
    xmlString += '</data></dataset>';
    var obj = {
      universityDataXml: xmlString,
      createdBy: this.createdBy
    };

    this.semesmigr.createUniversityUsingExcelSheet(obj).subscribe((response) => {
      if (response.item1.length > 0) {
        this.responses = response.item1[0];
        if (this.responses.returnData === '-1') {
          swal.fire(
            { title: 'Something went Wrong ', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (this.responses.returnData === 'success') {
          swal.fire(
            { title: 'University Details are added: ', text: this.responses.returnData, icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (this.responses.returnData === '-2') {
          swal.fire(
            { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 22000);
        }
      }
    });
    this.router.navigateByUrl('SMViewAllUniversities');
  }

  getPropertyByIndex(obj: any, index: number): any {
    if (obj && Object.keys(obj).length > index) {
      return obj[Object.keys(obj)[index]];
    }
    return '';
  }
}
//   ngOnInit(): void {
//     let LoginId = this.storageService.getUser();
//       if(LoginId != null || LoginId != undefined){
//         this.loginName= LoginId;
//       }
//       else{
//         swal.fire(
//           { title: 'Something went Wrong ', icon: 'error' }
//         ) 
//         this.router.navigateByUrl( '/SMAdmin/');
//       }   
//     this.createdBy = this.CreatedBy = this.loginName;
   
//   } 
//   onFileChange(event: any): void {
//     if (event.target.files.length > 0) {
//       const file = event.target.files[0];
//       this.file = file;
//       if (file) {
//         this.readExcelFile(file);
//       }
//     }
//   }

//   readExcelFile(file: any) {
//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       const data = e.target.result;
//       const workbook = XLSX.read(data, { type: 'binary' });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       this.uploadedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       this.validateData();
//     };
//     reader.readAsArrayBuffer(file);
//   }

//   validateData() {
//     this.validationErrors = this.uploadedData.slice(1).map((row: any, rowIndex: number) => {
//       let errorMessages = [];
//       if (!this.isValidEmail(row[9])) {
//         errorMessages.push('Invalid Email ID');
//       }
//       if (isNaN(row[2])) {
//         errorMessages.push('Seat Available must be a number');
//       }
//       if (isNaN(row[10])) {
//         errorMessages.push('Contact No must be a number');
//       }
//       return errorMessages.join(', ');
//     });
//   }

//   isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   hasErrors(): boolean {
//     return this.validationErrors.some(error => error.length > 0);
//   }
//   isError(rowIndex: number, cellIndex: number): boolean {
//     return this.errorCells.some(errorCell => errorCell.rowIndex === rowIndex && errorCell.cellIndex === cellIndex);
//   }
//   confirmUpload() {
//     this.Upload();
//   }

//   Upload() {
//     var xmlString = '<dataset><data>';
//     for (var i = 1; i < this.uploadedData.length; i++) {
//       var element = this.uploadedData[i];
//       var row = "<row>";
//       row += "<UniversityName>" + this.getPropertyByIndex(element, 0) + "</UniversityName>";
//       row += "<CountryName>" + this.getPropertyByIndex(element, 1) + "</CountryName>";
//       row += "<SeatAvailable>" + this.getPropertyByIndex(element, 2) + "</SeatAvailable>";
//       row += "<Semester_AcademicYear>" + this.getPropertyByIndex(element, 3) + "</Semester_AcademicYear>";
//       row += "<RankParameter>" + this.getPropertyByIndex(element, 4) + "</RankParameter>";
//       row += "<UniversityRank>" + this.getPropertyByIndex(element, 5) + "</UniversityRank>";
//       row += "<SigninDate>" + this.getPropertyByIndex(element, 6) + "</SigninDate>";
//       row += "<ExpiryDate>" + this.getPropertyByIndex(element, 7) + "</ExpiryDate>";
//       row += "<CoordinateName>" + this.getPropertyByIndex(element, 8) + "</CoordinateName>";
//       row += "<EmailId>" + this.getPropertyByIndex(element, 9) + "</EmailId>";
//       row += "<ContactNo>" + this.getPropertyByIndex(element, 10) + "</ContactNo>";
//       row += "<NominationDeadLineAutumn>" + this.getPropertyByIndex(element, 11) + "</NominationDeadLineAutumn>";
//       row += "<ApplicationDeadLineAutumn>" + this.getPropertyByIndex(element, 12) + "</ApplicationDeadLineAutumn>";
//       row += "<MobilityAutumn>" + this.getPropertyByIndex(element, 13) + "</MobilityAutumn>";
//       row += "<NominationDeadLineSpring>" + this.getPropertyByIndex(element, 14) + "</NominationDeadLineSpring>";
//       row += "<ApplicationDeadLineSpring>" + this.getPropertyByIndex(element, 15) + "</ApplicationDeadLineSpring>";
//       row += "<MobilitySpring>" + this.getPropertyByIndex(element, 16) + "</MobilitySpring>";
//       row += "<FactSheetLink>" + this.getPropertyByIndex(element, 17) + "</FactSheetLink>";
//       row += "<CourseLink>" + this.getPropertyByIndex(element, 18) + "</CourseLink>";
//       row += "<Nomination_Application_Formats>" + this.getPropertyByIndex(element, 19) + "</Nomination_Application_Formats>";
//       row += "<DocumentsRequired>" + this.getPropertyByIndex(element, 20) + "</DocumentsRequired>";
//       row += "</row>";
//       xmlString += row;
//     }
//     xmlString += '</data></dataset>';
//     var obj = {
//       universityDataXml: xmlString,
//       createdBy: this.createdBy
//     };

//     this.semesmigr.createUniversityUsingExcelSheet(obj).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.responses = response.item1[0];
//         if (this.responses.returnData === '-1') {
//           swal.fire(
//             { title: 'Something went Wrong ', icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         } else if (this.responses.returnData === 'success') {
//           swal.fire(
//             { title: 'University Details are added: ', text: this.responses.returnData, icon: 'success' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         } else if (this.responses.returnData === '-2') {
//           swal.fire(
//             { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 22000);
//         }
//       }
//     });
//     this.router.navigateByUrl('SMViewAllUniversities');
//   }

//   getPropertyByIndex(obj: any, index: number): any {
//     if (obj && Object.keys(obj).length > index) {
//       return obj[Object.keys(obj)[index]];
//     }
//     return '';
//   }
// }
//   readExcelFile(file: any) {
//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       const data = e.target.result;
//       const workbook = XLSX.read(data, { type: 'binary' });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       this.uploadedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//     };
//     // reader.readAsBinaryString(file);
//     reader.readAsArrayBuffer(file);
//   }
//   confirmUpload() {
//     this.Upload();
//   }
//   Upload() {
//     var xmlString = '<dataset><data>';
//     for (var i = 1; i < this.uploadedData.length; i++) {
//       var element = this.uploadedData[i];
//       var row = "<row>";
//       row += "<UniversityName>" + this.getPropertyByIndex(element, 0) + "</UniversityName>";
//       row += "<CountryName>" + this.getPropertyByIndex(element, 1) + "</CountryName>";
//       row += "<SeatAvailable>" + this.getPropertyByIndex(element, 2) + "</SeatAvailable>";
//       row += "<Semester_AcademicYear>" + this.getPropertyByIndex(element, 3) + "</Semester_AcademicYear>";
//       row += "<RankParameter>" + this.getPropertyByIndex(element, 4) + "</RankParameter>";
//       row += "<UniversityRank>" + this.getPropertyByIndex(element, 5) + "</UniversityRank>";
//       row += "<SigninDate>" + this.getPropertyByIndex(element, 6) + "</SigninDate>";
//       row += "<ExpiryDate>" + this.getPropertyByIndex(element, 7) + "</ExpiryDate>";
//       row += "<CoordinateName>" + this.getPropertyByIndex(element, 8) + "</CoordinateName>";
//       row += "<EmailId>" + this.getPropertyByIndex(element, 9) + "</EmailId>";
//       row += "<ContactNo>" + this.getPropertyByIndex(element, 10) + "</ContactNo>";
//       row += "<NominationDeadLineAutumn>" + this.getPropertyByIndex(element, 11) + "</NominationDeadLineAutumn>";
//       row += "<ApplicationDeadLineAutumn>" + this.getPropertyByIndex(element, 12) + "</ApplicationDeadLineAutumn>";
//       row += "<MobilityAutumn>" + this.getPropertyByIndex(element, 13) + "</MobilityAutumn>";
//       row += "<NominationDeadLineSpring>" + this.getPropertyByIndex(element, 14) + "</NominationDeadLineSpring>";
//       row += "<ApplicationDeadLineSpring>" + this.getPropertyByIndex(element, 15) + "</ApplicationDeadLineSpring>";
//       row += "<MobilitySpring>" + this.getPropertyByIndex(element, 16) + "</MobilitySpring>";
//       row += "<FactSheetLink>" + this.getPropertyByIndex(element, 17) + "</FactSheetLink>";
//       row += "<CourseLink>" + this.getPropertyByIndex(element, 18) + "</CourseLink>";
//       row += "<Nomination_Application_Formats>" + this.getPropertyByIndex(element, 19) + "</Nomination_Application_Formats>";
//       row += "<DocumentsRequired>" + this.getPropertyByIndex(element, 20) + "</DocumentsRequired>";
//       row += "</row>";
//       xmlString += row;
//     }
//     xmlString += '</data></dataset>';
//     var obj = {
//       universityDataXml: xmlString,
//       createdBy: this.createdBy
//     };

//     this.semesmigr.createUniversityUsingExcelSheet(obj).subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.responses = response.item1[0];
//         if (this.responses.returnData === '-1') {
//           swal.fire(
//             { title: 'Something went Wrong ', icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         } else if (this.responses.returnData === 'success') {
//           swal.fire(
//             { title: 'University Details are added: ', text: this.responses.returnData, icon: 'success' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 2000);
//         }
//         else if (this.responses.returnData === '-2') {
//           swal.fire(
//             { title: 'Something Went Wrong ', text: this.responses.returnData, icon: 'error' }
//           ), setTimeout(() => {
//             window.location.reload();
//           }, 22000);
//         }
//       }
//     })
//     this.router.navigateByUrl('SMViewAllUniversities');
//   }

//   getPropertyByIndex(obj: any, index: number): any {
//     if (obj && Object.keys(obj).length > index) {
//       return obj[Object.keys(obj)[index]];
//     }
//     return '';
//   }

// }