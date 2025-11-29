import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';


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
import { Title } from '@angular/platform-browser';
import { DataTableColumn } from '../DynamicDataGrid/Dynamic-Datagrid-Component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-metric-targets',
  templateUrl: './metric-targets.component-withTabs.html',
  // templateUrl: './metric-targets.component.html',
  styleUrls: ['./metric-targets.component.scss']
})
export class MetricTargetsComponent implements OnInit {
  metricForm!: FormGroup; isLoginFailed: boolean = false;
  metricSingleForm!: FormGroup;
  @ViewChild('BulkLeftAllocationModal') BulkLeftAllocationModal: TemplateRef<any>;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private ObpAutoAssignService: ObpAutoAssignService,
    private route: ActivatedRoute,
    private authService: AuthService, private storageService: StorageService,
    private title: Title
  ) { }


  // OBP Left Transfer Allocations 
  ngOnInit(): void {
      this.LoadForm();
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
 
  getToken(id: any) {
    this.loadingIndicator = true;
    const startTime = new Date().getTime();
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        const authToken = this.storageService.getUser ();
        if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
          // this.getallAllocatedMetricData();
          this.getPendencyMetricData();
        this.metricForm = this.fb.group({
          metrics: this.fb.array([this.createMetricRow()])
        });
      
        
        const stMainElement = document.getElementById('stMain');
        if (stMainElement) {
          stMainElement.innerHTML = 'OBP Left/Transfer<span class="themeClr"> Allocation </span>';
        }

        const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
        if (imgLogoElement) {
          imgLogoElement.style.width = '164px';
        }
        const elapsed = new Date().getTime() - startTime;
        // --- CHANGE 2500 to 25 ---
        const remainingDelay = Math.max(5500 - elapsed, 0); // Changed from 2500 to 25

        setTimeout(() => {
            this.loadingIndicator = false;
        }, remainingDelay);
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  
  PendencyColumns: DataTableColumn[] = [];
  PendencyRecords: any[] = [];
  getPendencyMetricData() {
    let apiCall: any;
    apiCall = this.ObpAutoAssignService.GetPendencyData();

    this.PendencyRecords = apiCall;


    apiCall.pipe(
      finalize(() => {
        this.loadingIndicator = false;
      })
    ).subscribe({
      next: (response: any) => {

        const dataArray: any[] = response && response.item1 ? response.item1 : [];

        if (dataArray && dataArray.length > 0) {

          const columns = this.generateColumnsFromData(dataArray);


          this.PendencyRecords = dataArray;
          this.PendencyColumns = columns;

          this.PendencyRecords = dataArray.map((record: any) => {
            const isPending = record.allocatedOn == null || record.allocatedOn === '';
            return {
              ...record,
              allocatedOn: isPending == true ? 'Pending' : 'Allocated '
            };
          });
          // console.log(JSON.stringify(this.PendencyRecords))
          // console.log(JSON.stringify(this.PendencyColumns))

        } else {
          console.warn(`API call succeeded for   but data array is empty.`);
        }
      },
      error: (err: any) => {

      }
    });
  }


  criteriaColumns: DataTableColumn[] = [];
  criteriaRecords: any[] = [];

  getallAllocatedMetricData() {
    let apiCall: any;
    apiCall = this.ObpAutoAssignService.GetAllocationData();

    this.criteriaRecords = apiCall;


    apiCall.pipe(
      finalize(() => {
        this.loadingIndicator = false;
      })
    ).subscribe({
      next: (response: any) => {

        const dataArray: any[] = response && response.item1 ? response.item1 : [];

        if (dataArray && dataArray.length > 0) {

          const columns = this.generateColumnsFromData(dataArray);


          this.criteriaRecords = dataArray;
          this.criteriaColumns = columns;
          // console.log(JSON.stringify(this.criteriaRecords))
          // console.log(JSON.stringify(this.criteriaColumns))

        } else {
          console.warn(`API call succeeded for   but data array is empty.`);
        }
      },
      error: (err: any) => {

      }
    });
  }

   private generateColumnsFromData(data: any[]): DataTableColumn[] {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map(key => ({
      field: key,
      header: this.beautifyLabel(key)
    }));
  }

  private beautifyLabel(label: string): string {
    if (!label) return label;
    return label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('OBPLeftTransfer');
    if (element) {
      element.hidden = true;
    }

    const stMainElement = document.getElementById('stMain');
    if (stMainElement) {
      stMainElement.innerHTML = 'OBP Left/Transfer<span class="themeClr"> Allocation </span>';
    }

    const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
    if (imgLogoElement) {
      imgLogoElement.style.width = '164px';
    }
    this.loadingIndicator=false;
  }


  loadingIndicator = false;
  sessionId: any = 'Select'; // Default empty value
  items: any[] = []; // Array to store dropdown options 

  isTouchedInvalid(controlName: string): boolean {
    const control = this.metricSingleForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }
  public typeOptions = ['P', 'N'];
  LoadForm() {
    this.metricSingleForm = this.fb.group({
      MetricId: ['', Validators.required],
      MetricDescription: ['', Validators.required],
      AssignedToUID: ['', [Validators.required, this.exactLengthValidator(5)]],
      TotalTargetValue: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      TargetValueType: ['P', Validators.required],
      BaseValue: [''],
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
      const errorMessages: string[] = [];
      const assignedToUID = row[2]?.toString()?.trim();
      const targetValueType = row[4]?.toString()?.trim()?.toUpperCase();
      const baseValue = Number(row[5]);

      // --- AssignedToUID validation ---
      if (!assignedToUID) {
        errorMessages.push('AssignedToUID is required');
        this.errorCells.push({ rowIndex, cellIndex: 2 });
      } else if (assignedToUID.length !== 5) {
        errorMessages.push('AssignedToUID must be exactly 5 characters long');
        this.errorCells.push({ rowIndex, cellIndex: 2 });
      }

      // --- TargetValueType validation ---
      if (!targetValueType || !['P', 'N'].includes(targetValueType)) {
        errorMessages.push("TargetValueType must be either 'P' or 'N'");
        this.errorCells.push({ rowIndex, cellIndex: 4 });
      }

      // --- BaseValue validation based on TargetValueType ---
      if (targetValueType === 'P') {
        if (isNaN(baseValue) || baseValue === null || baseValue === undefined || baseValue <= 0) {
          errorMessages.push('Base Value is required and must be greater than zero when TargetValueType = P');
          this.errorCells.push({ rowIndex, cellIndex: 5 });
        }
      }
      // For TargetValueType = 'N', BaseValue is not required — no validation needed

      // --- TotalTargetValue numeric validation (example for completeness) ---
      const totalTargetValue = Number(row[3]);
      if (isNaN(totalTargetValue)) {
        errorMessages.push('Total Target Value must be a valid number');
        this.errorCells.push({ rowIndex, cellIndex: 3 });
      }

      // --- Optional: Validate Q1–Q4 numeric values ---
      for (let i = 6; i <= 9; i++) {
        if (row[i] !== null && row[i] !== undefined && row[i] !== '') {
          if (isNaN(Number(row[i]))) {
            errorMessages.push(`Q${i - 5} Target Value must be a number`);
            this.errorCells.push({ rowIndex, cellIndex: i });
          }
        }
      }

      // Store validation result for the row
      if (errorMessages.length > 0) {
        this.validationErrors[rowIndex] = errorMessages.join(', ');
      }
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
    // 1. Set component's loading indicator (if used in template)
    this.loadingIndicator = true; 
    const startTime = new Date().getTime();
    // 2. Show SweetAlert2 Loading Spinner immediately
    Swal.fire({
        title: 'Uploading Data...',
        text: 'Please wait, your entries are being processed.',
        allowOutsideClick: false, // Prevent closing by clicking outside
        didOpen: () => {
            // Swal.showLoading(btn); // Show the built-in SweetAlert2 spinner
        }
    });

    // ... (Your XML construction logic remains the same) ...

    var xmlString = '<dataset><data>';
    for (var i = 1; i < this.uploadedDataRaw.length; i++) {
        var element = this.uploadedDataRaw[i];
        var row = "<row>";
        // ... (rest of row construction)
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
   const elapsed = new Date().getTime() - startTime;
  //       // --- CHANGE 2500 to 25 ---
        const remainingDelay = Math.max(5500 - elapsed, 0); // Changed from 2500 to 25

        setTimeout(() => {
            this.loadingIndicator = false;
        }, remainingDelay);
    //CreateLeftTransferDataUsingExcelSheet
    this.ObpAutoAssignService.CreateLeftTransferDataUsingExcelSheet(obj).subscribe({
        next: (response) => {
            // 3. Hide the loading spinner before showing the result message
            Swal.close(); 

            if (response.item1.length > 0) {
                this.responses = response.item1[0];
                const returnData = this.responses.returnData;
                let messageTitle = '';
                let messageText = this.responses.returnData;
                let icon: 'success' | 'error' = 'error'; // Default to error

                if (returnData === 'success') {
                    messageTitle = 'Upload Successful! 🎉';
                    icon = 'success';
                } else if (returnData === 'Failed') {
                    messageTitle = 'Upload Failed 🚫';
                    messageText = 'All Entries are Duplicate, Not Inserted.';
                } else if (returnData === '-1') {
                     messageTitle = 'Something went Wrong ❌';
                     messageText = 'An unexpected error occurred during processing.';
                }

                Swal.fire({
                    title: messageTitle,
                    text: messageText,
                    icon: icon
                }).then(() => {
                    // This block executes after the user closes the SweetAlert
                    window.location.reload();
                });
            } else {
                 // Handle case where item1 is empty but no API error occurred
                Swal.fire({
                    title: 'Processing Complete',
                    text: 'No specific success or failure data returned.',
                    icon: 'warning'
                }).then(() => {
                    window.location.reload();
                });
            }
        },
        error: (err) => {
            // 4. Hide the loading spinner on API error
            Swal.close(); 
            
            // 5. Show an error message for the HTTP request itself
            Swal.fire({
                title: 'API Request Error 🚨',
                text: 'Could not connect to the server or a network error occurred.',
                icon: 'error'
            }).then(() => {
                window.location.reload();
            });
        },
        complete: () => {
          
             
        }
    });

    // 7. Remove the old setTimeout logic completely
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

  showBaseValueField = true;

  // Called whenever TargetValueType changes
  onTargetValueTypeChange(selectedType: string): void {
    const baseValueControl = this.metricSingleForm.get('BaseValue');

    if (selectedType === 'P') {

      this.showBaseValueField = true;
      baseValueControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      baseValueControl?.updateValueAndValidity();
    } else if (selectedType === 'N') {

      this.showBaseValueField = false;
      baseValueControl?.clearValidators();
      baseValueControl?.setValue('');
      baseValueControl?.updateValueAndValidity();
    }
  }

  exactLengthValidator(expectedLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length !== expectedLength) {
        return { exactLength: { requiredLength: expectedLength, actualLength: value.length } };
      }
      return null;
    };
  }
  // Submit form
  onSubmit(): void {
    this.loadingIndicator = true;
    const startTime = new Date().getTime();
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

    const formData = new FormData();
    const formValue = this.metricSingleForm.value;
    formData.append('MetricId', formValue.MetricId);
    formData.append('MetricDescription', formValue.MetricDescription);
    formData.append('AssignedToUID', formValue.AssignedToUID);
    formData.append('TotalTargetValue', formValue.TotalTargetValue);
    formData.append('TargetValueType', formValue.TargetValueType);
    formData.append('BaseValue', formValue.BaseValue);
    formData.append('Q1TargetValue', formValue.Q1TargetValue);
    formData.append('Q2TargetValue', formValue.Q2TargetValue);
    formData.append('Q3TargetValue', formValue.Q3TargetValue);
    formData.append('Q4TargetValue', formValue.Q4TargetValue);

    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
 const elapsed = new Date().getTime() - startTime;
        // --- CHANGE 2500 to 25 ---
        const remainingDelay = Math.max(55000 - elapsed, 0); // Changed from 2500 to 25

        setTimeout(() => {
            this.loadingIndicator = false;
        }, remainingDelay);
    this.ObpAutoAssignService.InsertLeftTransferData(formData).subscribe((response) => {
      if (response.item1.length > 0) {
        this.responses = response.item1[0];
        if (this.responses.returnData === '-1') {
          Swal.fire(
            { title: 'Something went Wrong ', icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 5500);
        } else if (this.responses.returnData === 'success') {
          Swal.fire(
            { title: 'All Details are added: ', text: this.responses.returnData, icon: 'success' }
          ), setTimeout(() => {
            window.location.reload();
          }, 5500);
        } else if (this.responses.returnData === 'Failed') {
          Swal.fire(
            { title: 'All Entries are Duplicate, Not Inserted ', text: this.responses.returnData, icon: 'error' }
          ), setTimeout(() => {
            window.location.reload();
          }, 5500);
        }
      }
    });
  }

}
