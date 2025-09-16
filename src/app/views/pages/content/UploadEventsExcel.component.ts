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
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { CommonModule } from '@angular/common';
import { LpuEventManagementService } from 'src/app/_services/lpu-event-management.service';
@Component({
  selector: 'app-UploadEventsExcel',
  templateUrl: './UploadEventsExcel.component.html',
  styleUrls: ['./UploadEventsExcel.componen.scss']
})
export class UploadEventsExcelComponent implements OnInit {
  isUpdateMode: boolean = false;
  fileName: string = 'Events_Upload_ExcelData.xlsx'; 
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
  universityForm: FormGroup; SchoolId: any; EventObjective: any;
  ModeOfConduct: any; OBPCriteria: any; ExternalLevel: any; InternalLevel: any;
  Semester: any; EventName: any; CategoryId: any; StartDate: any;
  isActive: any; CoursesOffered: any; file: any; arrayBuffer: string | ArrayBuffer | null;
  exceljsondata: unknown[]; uploadedData: any = ""; Pushexceldata: any[];
  createdBy: any; CreatedBy: any; responses: any; Reason: any; UniversityId: any;
  checkListDocs: any;
  UniversityYear: any;
  NominationDeadlineAutumn: any;
  BudgetType: any;
  BudgetAmount: any;
  SessionId: any;
  MobilitySpring: any;
  NominationApplicationFormats: any;
  FactSheetLink: any;
  DocumentsRequired: any;
  Remarks: any;
  SemesterAcademicYear: any;
  validationErrors: string[] = [];
  errorCells: { rowIndex: number, cellIndex: number }[] = [];
  CourseLink: any;
  constructor(
    private LpuEventManagementService: LpuEventManagementService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
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
  Token: any;
  ngOnInit(): void {
    let LoginId = this.Token= this.storageService.getUser();
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
      if (isNaN(row[4])) {
        errorMessages.push('Must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 4 });
      }
      if (isNaN(row[14])) {
        errorMessages.push('Must be a number');
        this.errorCells.push({ rowIndex, cellIndex: 14 });
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
//   Upload() {
//     var xmlString = '<dataset><data>';
//     for (var i = 1; i < this.uploadedData.length; i++) {
//       var element = this.uploadedData[i];
//       var row = "<row>";
//       row += "<SchoolId>" + this.getPropertyByIndex(element, 0) + "</SchoolId>";
//       row += "<EventObjective>" + this.getPropertyByIndex(element, 1) + "</EventObjective>";
//       row += "<EventName>" + this.getPropertyByIndex(element, 2) + "</EventName>";
//       row += "<AlternativelyStudentCounts>" + this.getPropertyByIndex(element, 3) + "</AlternativelyStudentCounts>";
//       row += "<OBPCriteria>" + this.getPropertyByIndex(element, 4) + "</OBPCriteria>";
//       row += "<ModeOfConduct>" + this.getPropertyByIndex(element, 5) + "</ModeOfConduct>";
//       row += "<ExternalLevel>" + this.getPropertyByIndex(element, 6) + "</ExternalLevel>";
//       row += "<InternalLevel>" + this.getPropertyByIndex(element, 7) + "</InternalLevel>";
//       row += "<CategoryId>" + this.getPropertyByIndex(element, 8) + "</CategoryId>";
//       row += "<Semester>" + this.getPropertyByIndex(element, 9) + "</Semester>";
//       row += "<StartDate>" + this.getPropertyByIndex(element, 10) + "</StartDate>";
//       row += "<EndDate" + this.getPropertyByIndex(element, 11) + "</EndDate";
//       row += "<BudgetType>" + this.getPropertyByIndex(element, 12) + "</BudgetType>";
//       row += "<BudgetAmount>" + this.getPropertyByIndex(element, 13) + "</BudgetAmount>";
//       row += "<Remarks>" + this.getPropertyByIndex(element, 14) + "</Remarks>";
//       row += "<SessionId>" + this.getPropertyByIndex(element, 15) + "</SessionId>";      
//       row += "</row>";
//       xmlString += row;
//     }
//     xmlString += '</data></dataset>';
//     var obj = {
//     xmlEvents: xmlString,
//     CreatedBy: this.createdBy
//     };
 
//     this.LpuEventManagementService.CreateEventsUsingExcelSheet(obj).subscribe((response) => {
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
//     this.router.navigateByUrl('EventCalenderAdmin/'+this.Token);
//   }

Upload() {
    var xmlString = '<dataset><data>';
    for (var i = 1; i < this.uploadedData.length; i++) {
        var element = this.uploadedData[i];
        var row = "<row>";
        row += "<SchoolId>" + this.getPropertyByIndex(element, 0) + "</SchoolId>";
        row += "<EventObjective>" + this.getPropertyByIndex(element, 1) + "</EventObjective>";
        row += "<EventName>" + this.getPropertyByIndex(element, 2) + "</EventName>";
        row += "<EventType>" + this.getPropertyByIndex(element, 3) + "</EventType>";
        row += "<AlternativelyStudentCounts>" + this.getPropertyByIndex(element, 4) + "</AlternativelyStudentCounts>";
        row += "<OBPCriteria>" + this.getPropertyByIndex(element, 5) + "</OBPCriteria>";
        row += "<ModeOfConduct>" + this.getPropertyByIndex(element, 6) + "</ModeOfConduct>";
        row += "<ExternalLevel>" + this.getPropertyByIndex(element, 7) + "</ExternalLevel>";
        row += "<InternalLevel>" + this.getPropertyByIndex(element, 8) + "</InternalLevel>";
        row += "<CategoryId>" + this.getPropertyByIndex(element, 9) + "</CategoryId>";
        row += "<Semester>" + this.getPropertyByIndex(element, 10) + "</Semester>";
        row += "<StartDate>" + this.getPropertyByIndex(element, 11) + "</StartDate>";
        row += "<EndDate>" + this.getPropertyByIndex(element, 12) + "</EndDate>"; // Fixed missing '>'
        row += "<BudgetType>" + this.getPropertyByIndex(element, 13) + "</BudgetType>";
        row += "<BudgetAmount>" + this.getPropertyByIndex(element, 14) + "</BudgetAmount>";
        row += "<Remarks>" + this.getPropertyByIndex(element, 15) + "</Remarks>";
        row += "<SessionId>" + this.getPropertyByIndex(element, 16) + "</SessionId>";      
        row += "</row>";
        xmlString += row;
    }
    xmlString += '</data></dataset>';
    
    var obj = {
        EventsDataXml: xmlString, // Changed from xmlEvents to EventsDataXml
        CreatedBy: this.createdBy
    };

    this.LpuEventManagementService.CreateEventsUsingExcelSheet(obj).subscribe((response) => {
        if (response.item1.length > 0) {
            this.responses = response.item1[0];
            if (this.responses.returnData === '-1') {
                swal.fire(
                    { title: 'Something went Wrong ', icon: 'error' }
                ), setTimeout(() => {
                    window.location.reload();
                }, 2200);
            } else if (this.responses.returnData === 'success') {
                swal.fire(
                    { title: 'All Events Details are added: ', text: this.responses.returnData, icon: 'success' }
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
   this.router.navigateByUrl('EventCalenderAdmin/' + this.Token);
}

  getPropertyByIndex(obj: any, index: number): any {
    if (obj && Object.keys(obj).length > index) {
      return obj[Object.keys(obj)[index]];
    }
    return '';
  }
}