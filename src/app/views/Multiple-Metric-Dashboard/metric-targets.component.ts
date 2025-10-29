import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';


import Swal from 'sweetalert2';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
// private dataService: PlanningrankingService

@Component({
  selector: 'app-metric-targets',
  templateUrl: './metric-targets.component.html',
  styleUrls: ['./metric-targets.component.scss']
})
export class MetricTargetsComponent implements OnInit {
  metricForm!: FormGroup;
  metricSingleForm!: FormGroup;
  @ViewChild('BulkLeftAllocationModal') BulkLeftAllocationModal: TemplateRef<any>;



  constructor(private fb: FormBuilder, private modalService: NgbModal, private ObpAutoAssignService: ObpAutoAssignService) { }



  // OBP Left Transfer Allocations 
  ngOnInit(): void {
    this.metricForm = this.fb.group({
      metrics: this.fb.array([this.createMetricRow()])
    });
    this.LoadForm();
  }
  isTouchedInvalid(controlName: string): boolean {
    const control = this.metricSingleForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }
  LoadForm() {


    this.metricSingleForm = this.fb.group({
      MetricId: ['', Validators.required],
      MetricDescription: ['', Validators.required],
      AssignedToUID: ['', Validators.required],
      TotalTargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      TargetValueType: ['', Validators.required],
      BaseValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q1TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q2TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q3TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q4TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }
  resetForm(): void {
    this.metricForm.reset();
  }

  isInvalid(controlName: string): boolean {
    const control = this.metricForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  file: any;
  uploadedDataRaw: any[] = [];
  uploadedDataForDisplay: any[] = [];
  validationErrors: string[] = [];
  errorCells: { rowIndex: number, cellIndex: number }[] = [];
  createdBy: any;
  UploadExcelData() {
    // Clear previous data and errors when opening the modal
    this.file = null;
    this.uploadedDataRaw = [];
    this.uploadedDataForDisplay = [];
    this.validationErrors = [];
    this.errorCells = [];
    this.modalService.open(this.BulkLeftAllocationModal, { size: 'lg', backdrop: 'static' });
  }
  fileName: string = 'Sample_file_blank_Format.xlsx';
  filePath: string = `assets/Uploads/${this.fileName}`;


  downloadSampleDocument() {
    window.open(this.filePath, '_blank');
  }

  // Excel Upload Logic
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      if (this.file) {
        this.readExcelFile(this.file);
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
      this.uploadedDataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      this.processUploadedDataForDisplay(this.uploadedDataRaw);
      this.validateData();
    };
    reader.readAsArrayBuffer(file);
  }

  processUploadedDataForDisplay(rawData: any[]) {
    if (!rawData || rawData.length === 0) {
      this.uploadedDataForDisplay = [];
      return;
    }

    // Copy headers
    this.uploadedDataForDisplay = [rawData[0]];

    // Process rows, starting from the second row (index 1)
    for (let i = 1; i < rawData.length; i++) {
      const row = [...rawData[i]];

      this.uploadedDataForDisplay.push(row);
    }
  }



  validateData() {
    this.validationErrors = [];
    this.errorCells = [];
    if (!this.uploadedDataRaw || this.uploadedDataRaw.length <= 1) return;

    this.uploadedDataRaw.forEach((row: any, rowIndex: number) => {
      if (rowIndex === 0) return; // Skip header row
      // let errorMessages = [];

      // // Validate AlternativelyStudentCounts (index 3)
      // if (isNaN(row[3]) || row[3] === null || row[3] === undefined) {
      //   errorMessages.push('Total Target Value must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 3 });
      // }

      //   if (isNaN(row[5]) || row[5] === null || row[5] === undefined) {
      //   errorMessages.push('Base Value must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 5 });
      // }

      //   if (isNaN(row[6]) || row[6] === null || row[6] === undefined) {
      //   errorMessages.push('Q1 TargetValue must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 6 });
      // }

      //   if (isNaN(row[7]) || row[7] === null || row[7] === undefined) {
      //   errorMessages.push('Q2 TargetValue must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 7 });
      // }

      //   if (isNaN(row[8]) || row[8] === null || row[8] === undefined) {
      //   errorMessages.push('Q3 TargetValue must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 8 });
      // }

      //   if (isNaN(row[9]) || row[9] === null || row[9] === undefined) {
      //   errorMessages.push('Q4 TargetValue must be a number');
      //   this.errorCells.push({ rowIndex, cellIndex: 9 });
      // }

      // this.validationErrors[rowIndex] = errorMessages.join(', ');
    });
  }

  hasErrors(): boolean {
    return this.validationErrors.some(error => error.length > 0);
  }

  isError(rowIndex: number, cellIndex: number): boolean {
    return this.errorCells.some(errorCell => errorCell.rowIndex === rowIndex && errorCell.cellIndex === cellIndex);
  }

  confirmUpload() {
    if (this.hasErrors()) {
      Swal.fire('Validation Error', 'Please correct the errors in the uploaded data before confirming.', 'error');
      return;
    }
    this.Upload();
  }
  responses: any;
  Upload() {
    var xmlString = '<dataset><data>';
    for (var i = 1; i < this.uploadedDataRaw.length; i++) {
      var element = this.uploadedDataRaw[i];
      var row = "<row>";

      row += "<MetricId>" + this.getPropertyByIndex(element, 0) + "</MetricId>";
      row += "<MetricDescription>" + this.getPropertyByIndex(element, 1) + "</MetricDescription>";
      row += "<AssignedToUID>" + this.getPropertyByIndex(element, 2) + "</AssignedToUID>";
      row += "<TotalTargetValue>" + this.getPropertyByIndex(element, 3) + "</TotalTargetValue>";
      row += "<TargetValueType>" + this.getPropertyByIndex(element, 4) + "</TargetValueType>";
      row += "<BaseValue>" + this.getPropertyByIndex(element, 5) + "</BaseValue>";
      row += "<Q1TargetValue>" + this.getPropertyByIndex(element, 6) + "</Q1TargetValue>";
      row += "<Q2TargetValue>" + this.getPropertyByIndex(element, 7) + "</Q2TargetValue>";
      row += "<Q3TargetValue>" + this.getPropertyByIndex(element, 8) + "</Q3TargetValue>";
      row += "<Q4TargetValue>" + this.getPropertyByIndex(element, 9) + "</Q4TargetValue>";
      row += "<AllocatedBy>" + this.getPropertyByIndex(element, 10) + "</AllocatedBy>";
      row += "<Remarks>" + this.getPropertyByIndex(element, 11) + "</Remarks>";
      row += "</row>";
      xmlString += row;
    }
    xmlString += '</data></dataset>';

    var obj = {
      LeftTransferDataXml: xmlString,
      EntryBy: this.createdBy
    };
    // 🔹 Added console logging for debugging
    console.log('📦 Upload() triggered');
    console.log('👤 Created By:', this.createdBy);
    console.log('📄 Total Records Prepared:', this.uploadedDataRaw.length - 1);
    console.log('🧾 XML String to be sent to API:\n', xmlString);
    console.log('🚀 Final Payload Object:', obj);
    //CreateLeftTransferDataUsingExcelSheet

    this.ObpAutoAssignService.CreateLeftTransferDataUsingExcelSheet(obj).subscribe((response) => {
      if (response.item1.length > 0) {
        this.responses = response.item1[0];
        if (this.responses.returnData === '-1') {
          Swal.fire(
            { title: 'Something went Wrong ', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 8500);
        } else if (this.responses.returnData === 'success') {
          Swal.fire(
            { title: 'All Details are added: ', text: this.responses.returnData, icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 8500);
        } else if (this.responses.returnData === 'Failed') {
          Swal.fire(
            { title: 'All Entries are Duplicate, Not Inserted ', text: this.responses.returnData, icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 8500);
        }
      }
    });
  }




  getPropertyByIndex(obj: any, index: number): any {
    if (obj && Array.isArray(obj) && obj.length > index) {
      return obj[index];
    }
    return '';
  }
  // Create one metric row
  createMetricRow(): FormGroup {
    return this.fb.group({
      MetricId: ['', Validators.required],
      MetricDescription: ['', Validators.required],
      AssignedToUID: ['', Validators.required],
      TotalTargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      TargetValueType: ['', Validators.required],
      BaseValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q1TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q2TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q3TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Q4TargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      Remarks: ['', Validators.required],
    });
  }

  // Getter for metrics array
  get metrics(): FormArray {
    return this.metricForm.get('metrics') as FormArray;
  }

  // Add new row
  addMetricRow(): void {
    this.metrics.push(this.createMetricRow());
  }

  // Delete row
  deleteMetricRow(index: number): void {
    if (this.metrics.length > 1) {
      this.metrics.removeAt(index);
    }
  }

  // Submit form
  onSubmit(): void {
    if (this.metricSingleForm.invalid) {
      this.metricSingleForm.markAllAsTouched();

      const invalidFields: string[] = [];

      // Loop through each control and collect invalid fields
      Object.keys(this.metricSingleForm.controls).forEach(field => {
        const control = this.metricSingleForm.get(field);
        if (control && control.invalid) {
          const errors = control.errors || {};
          const errorTypes = Object.keys(errors).join(', ');
          invalidFields.push(`${field} (${errorTypes})`);
        }
      });

      console.warn('⚠️ Please correct the following fields before submitting:');
      invalidFields.forEach(f => console.warn(' - ' + f));

      alert('⚠️ Some fields are missing or invalid.\nCheck console for details.');
      return;
    }

    // ✅ If valid — handle submission
    console.log('✅ Metric Targets Submitted Successfully:');
    console.table(this.metricSingleForm.value);
    alert('✅ Data submitted successfully! Check the console for details.');
  }

}

// import { Component, OnInit } from '@angular/core';
// import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

// @Component({
//   selector: 'app-metric-targets',
//   templateUrl: './metric-targets.component.html',
//   styleUrls: ['./metric-targets.component.scss']
// })
// export class MetricTargetsComponent implements OnInit {
//   metricForm!: FormGroup;

//   constructor(private fb: FormBuilder) {}

//   ngOnInit(): void {
//     this.metricForm = this.fb.group({
//       metrics: this.fb.array([this.createMetricRow()])
//     });
//   }

//   // Create a single row group
//   createMetricRow(): FormGroup {
//     return this.fb.group({
//       MetricId: ['', Validators.required],
//       MetricDescription: ['', Validators.required],
//       AssignedToUID: ['', Validators.required],
//       EmployeeName: ['', Validators.required],
//       TotalTargetValue: ['', Validators.required],
//       TargetValueType: ['', Validators.required],
//       BaseValue: ['', Validators.required],
//       Q1TargetValue: ['', Validators.required],
//       Q2TargetValue: ['', Validators.required],
//       Q3TargetValue: ['', Validators.required],
//       Q4TargetValue: ['', Validators.required],
//     });
//   }

//   // Getter for metrics array
//   get metrics(): FormArray {
//     return this.metricForm.get('metrics') as FormArray;
//   }

//   // Add new row
//   addMetricRow(): void {
//     this.metrics.push(this.createMetricRow());
//   }

//   // Delete row
//   deleteMetricRow(index: number): void {
//     if (this.metrics.length > 1) {
//       this.metrics.removeAt(index);
//     }
//   }

//   // Submit handler
//   onSubmit(): void {
//     if (this.metricForm.invalid) {
//       // Mark all controls as touched to trigger validation
//       this.metricForm.markAllAsTouched();
//       console.warn('⚠️ Please fill all required fields before submitting.');
//       return;
//     }

//     // Get all data
//     const formData = this.metricForm.value.metrics;

//     // Log neatly to console
//     console.log('✅ Metric Targets Submitted Successfully:');
//     formData.forEach((item: any, index: number) => {
//       console.log(`Row ${index + 1}:`, item);
//     });

//     // Optional: Show confirmation
//     alert('Data submitted successfully! Check console for details.');
//   }
// }
