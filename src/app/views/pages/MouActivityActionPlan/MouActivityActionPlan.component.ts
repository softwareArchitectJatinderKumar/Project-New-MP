import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {    AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT, DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { MatTableDataSource } from '@angular/material/table';
import { MouActivity } from './MouActivity';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import * as XLSX from 'xlsx';
import { mouActivities } from './mouActivities';

interface Employee {
  employeeName: string;
  employeeCode: string;
}
interface SchoolDivision {
  id: number;
  schoolDivision: string;
}
interface MouCategory {
  id: number;
  CategoryName: string;
}

@Component({
  selector: 'MouActivityActionPlan',
  templateUrl: './MouActivityActionPlan.component.html',
  styleUrls: ['./MouActivityActionPlan.component.scss'],
  standalone: false
})
export class MouActivityActionPlanComponent implements OnInit {


  DeleteACtion(row:any): void{

     this.newMouid = row.id;
    this.TitleS = row.mouTitle;
    this.recordId = row.id;
    this.ExistingUID = row.uid;
        // this.currentModalRef.result.then(() => this.getSEAllApplications()).catch(() => { });
    // this.cd.detectChanges();
    swal.fire({
      title: 'Delete Reason Remarks',
      input: 'text',
      inputPlaceholder: 'Remarks to delete ...',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      showLoaderOnConfirm: true,
      preConfirm: uid => {
        if (!uid) swal.showValidationMessage('Delete Remarks Are required!');
        return uid;
      },
      allowOutsideClick: () => !swal.isLoading(),
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const fd = new FormData();
        fd.append('RecordId', this.recordId);
        fd.append('Remarks', result.value);
        fd.append('Uid', this.ExistingUID );
        fd.append('Mouid', this.newMouid );
        this.DeleteActionRequest(fd);
      }
    });
  }


  private DeleteActionRequest(formData: FormData): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.MOUDeleteAction(formData).pipe(

    ).subscribe({
      next: (data: any) => {
        if (data?.item1?.[0]?.msg === 'success') {
          swal.fire('Success!', 'Action Applied!', 'success').then(() => setTimeout(() => {
            window.location.reload();
          }, 1500));
        } else {
          swal.fire('Failed!', 'Action Failed!', 'error').then(() => setTimeout(() => {
            window.location.reload();
          }, 1500));
        }
      },
      error: () => swal.fire('Error!', 'An error occurred.', 'error'),
    });
    this.modalService.dismissAll();
    this.loadingIndicator = false;
  }


  @ViewChild('topScroll')
topScroll!: ElementRef<HTMLDivElement>;

@ViewChild('tableWrapper')
tableWrapper!: ElementRef<HTMLDivElement>;

tableScrollWidth = 0;

syncTopScroll(): void {

    if (this.syncing) {
        return;
    }

    this.syncing = true;

    this.tableWrapper.nativeElement.scrollLeft =
        this.topScroll.nativeElement.scrollLeft;

    requestAnimationFrame(() => this.syncing = false);

}

syncBottomScroll(): void {

    if (this.syncing) {
        return;
    }

    this.syncing = true;

    this.topScroll.nativeElement.scrollLeft =
        this.tableWrapper.nativeElement.scrollLeft;

    requestAnimationFrame(() => this.syncing = false);

}

private syncing = false;
  FilterDataRow2() {
    this.applyFiltersTab2();
  }
 
  ngAfterViewInit(): void {

    setTimeout(() => {

        this.calculateScrollWidth();

    });

}



calculateScrollWidth(): void {

    if (!this.tableWrapper) {
        return;
    }

    const body =
        this.tableWrapper.nativeElement.querySelector('.datatable-body');

    if (!body) {
        return;
    }

    this.tableScrollWidth = body.scrollWidth;

}
  @ViewChild('ModifyFacultyModal')
  ModifyFacultyModal!: TemplateRef<any>;

  //====================================================
  // Existing Variables
  //====================================================

  newMouid: any; recordId: any;
  TitleS: any; StartDate3: any; EndDate3: any;

  //====================================================
  // Faculty Search Variables
  //====================================================

  employeeControl3 = new FormControl('');
  remarks3: any = '';
  filteredEmployeesData3: Employee[] = [];
  showSuggestions3 = false;
  activeSuggestionIndex3 = -1;
  ResponsiblePerson3: any = '';
  AssignedToUid3: any = '';

  //====================================================
  // Open Modal
  //====================================================
  ExistingUID: any;
  ModifyFaculty(row: any) {
    this.newMouid = row.mouId;
    this.TitleS = row.mouTitle;
    this.recordId = row.id;
    this.StartDate3 = row.startDate;
    this.EndDate3 = row.endDate;
    this.ExistingUID = row.uid;
    // Reset values every time modal opens
    this.employeeControl3.setValue('');
    this.remarks3 = '';
    this.filteredEmployeesData3 = [];
    this.showSuggestions3 = false;
    this.activeSuggestionIndex3 = -1;
    this.ResponsiblePerson3 = '';
    this.AssignedToUid3 = '';
    this.modalService.open(
      this.ModifyFacultyModal,
      {
        size: 'lg',
        backdrop: 'static'
      }
    ).result.then(
      () => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      },
      () => { }
    );
  }

  //====================================================
  // Search Employee
  //====================================================

  onInput3() {
    const inputValue =
      (this.employeeControl3.value || '')
        .toString()
        .toLowerCase()
        .trim();
    if (inputValue) {
      this.filteredEmployeesData3 =
        this.EmployeeData
          .filter(employee =>
            employee.employeeName.toLowerCase().includes(inputValue) ||
            employee.employeeCode.toLowerCase().includes(inputValue)
          )
          .slice(0, 10);
    }
    else {
      this.filteredEmployeesData3 = [];
    }
    this.showSuggestions3 = true;
    this.activeSuggestionIndex3 = -1;
  }

  //====================================================
  // Select Employee
  //====================================================

  selectEmployee3(employee: Employee) {
    this.ResponsiblePerson3 = employee.employeeCode;
    this.AssignedToUid3 = employee.employeeCode;
    if (this.AssignedToUid3 === this.ExistingUID) {
      swal.fire('Error', 'Select Different UID', 'error')
      this.filteredEmployeesData3 = [];
      this.showSuggestions3 = false;
      return;
    }
    this.employeeControl3.setValue(
      `${employee.employeeName} (${employee.employeeCode})`
    );

    this.filteredEmployeesData3 = [];

    this.showSuggestions3 = false;
  }

  //====================================================
  // Keyboard Navigation
  //====================================================

  onKeydown3(event: KeyboardEvent) {

    if (!this.filteredEmployeesData3?.length) {
      return;
    }

    if (event.key === 'ArrowDown') {

      event.preventDefault();

      this.activeSuggestionIndex3 =
        (this.activeSuggestionIndex3 + 1)
        % this.filteredEmployeesData3.length;
    }

    else if (event.key === 'ArrowUp') {

      event.preventDefault();

      this.activeSuggestionIndex3 =
        (this.activeSuggestionIndex3 - 1 +
          this.filteredEmployeesData3.length)
        % this.filteredEmployeesData3.length;
    }

    else if (event.key === 'Enter') {

      event.preventDefault();

      if (
        this.activeSuggestionIndex3 >= 0 &&
        this.activeSuggestionIndex3 < this.filteredEmployeesData3.length
      ) {

        this.selectEmployee3(
          this.filteredEmployeesData3[
          this.activeSuggestionIndex3
          ]
        );
      }
    }
  }

  //====================================================
  // Hide Suggestions
  //====================================================

  hideSuggestions3() {

    setTimeout(() => {

      this.showSuggestions3 = false;

    }, 200);
  }

  //====================================================
  // Validation
  //====================================================

  checkFormValidity3(): boolean {

    return !!(
      this.AssignedToUid3 &&
      this.remarks3 &&
      this.remarks3.trim().length > 0
    );
  }

  //====================================================
  // Submit
  //====================================================

  UpdateUID() {
    if (!this.checkFormValidity3()) {
      return;
    }
    const formData = new FormData();
    formData.append('MouId', this.newMouid);
    formData.append('ExistingUid', this.ExistingUID);
    formData.append('RecordID', this.recordId);
    formData.append('Uid', this.ResponsiblePerson3);
    formData.append('ActionAssignedBy', this.EmployeeCode);
    formData.append('Remarks', this.remarks3);
    formData.append('StartDate', this.StartDate3);
    formData.append('EndDate', this.EndDate3);
    this.mouDocumentsService.ReassignNewUID(formData).subscribe({
      next: (data: any) => {
        const resultMsg = data.item1 && data.item1.length > 0 ? data.item1[0].msg : data.responseData;
        if (resultMsg === 'success') {
          swal.fire('Success', 'Assigned UID Done.', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (data.responseData == 'Failed') {
          swal.fire('Error', 'Failed to Assign New UID. Please try again.', 'error');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      },
      error: (err) => {
        swal.fire('Error', 'Failed to Assign New UID .', 'error');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      complete: () => {
        this.clearFields();
        this.reloadGrid2();
      }
    });

  }

  resetTab1Filters(): void {

    // Reset dropdowns
    this.selectedSchoolDivision = '0';
    this.Tab1statusFilter = 'all';
    this.SelectedMouCategoryTab1 = 'All';

    // Reset search
    this.searchTextTab1 = '';
    this.searchQuery = '';

    // Reload all records
    this.filteredMouActivityDocuments = [
      ...this.MouActivityDocumentsMaster
    ];
  }

  applyCombinedFiltersTab1(): void {
    let filtered = [...this.MouActivityDocumentsMaster];
    if (this.selectedSchoolDivision === '-1') {
      filtered = [];
    } else if (this.selectedSchoolDivision !== '0') {
      filtered = filtered.filter(item => {
        if (!item.schoolDivisionInvolved) {
          return false;
        }
        return item.schoolDivisionInvolved
          .split(',')
          .map((id: string) => id.trim())
          .includes(this.selectedSchoolDivision);
      });
    }

    // =========================
    // Filter By MOU Status
    // =========================
    filtered = filtered.filter(item => {
      if (this.Tab1statusFilter === 'all') {
        return true;
      }
      if (this.Tab1statusFilter === 'active') {
        return item.mouStatus === 'Active';
      }
      if (this.Tab1statusFilter === 'expired') {
        return item.mouStatus === 'Expired' && item.renewalCount == 0;
      }
      if (this.Tab1statusFilter === 'renewed') {
        return item.renewalCount > 0 ||
          (
            item.renewalCount !== null &&
            item.renewalCount !== undefined &&
            item.renewalCount !== '0' &&
            item.renewalCount !== 'null'
          );
      }
      return true;
    });

    // =========================
    // Filter By MOU Category
    // =========================
    filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryTab1));

    // =========================
    // Search Filter
    // =========================
    const query = this.searchTextTab1?.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(item => {
        return Object.entries(item).some(([key, val]) => {
          if (val !== null && val !== undefined) {
            const valueString = String(val).toLowerCase();
            // Special handling for MOU ID
            if (key === 'id') {
              const numericId = Number(val);
              if (
                !isNaN(numericId) &&
                (
                  numericId.toString().includes(query) ||
                  `mou/${numericId}`.includes(query)
                )
              ) {
                return true;
              }
            }

            return valueString.includes(query);
          }

          return false;
        });
      });
    }

    // Final Bind
    this.filteredMouActivityDocuments = filtered;
  }

  getActiveCount(): number {
    return this.filteredMouActivityDocuments.filter(item => {
      return item.mouStatus === 'Active';
    }).length;

  }

  getExpiredCount(): number {

    return this.filteredMouActivityDocuments.filter(item => {
      return item.mouStatus === 'Expired' &&
        item.renewalCount == 0;
    }).length;

  }

  getRenewedCount(): number {

    return this.filteredMouActivityDocuments.filter(item => {

      return item.renewalCount > 0 ||
        (
          item.renewalCount !== null &&
          item.renewalCount !== undefined &&
          item.renewalCount !== '0' &&
          item.renewalCount !== 'null'
        );

    }).length;

  }
  selectedSchoolDivision: any = '0';
  selectedSchoolDivision2: any = '0';
  selectedSchoolDivision3: any = '0';
  AllMouCategories: MouCategory[] = [];
  SelectedMouCategoryTab1: any = 'All';
  SelectedMouCategoryTab2: any = 'All';
  SelectedMouCategoryTab3: any = 'All';

  GetAllCategories(): void {
    this.mouDocumentsService.GetMouCategories().subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.AllMouCategories = response.item1.map((x: any, index: number) => ({
            id: index + 1,
            CategoryName: x.items
          }));
        } else {
          this.AllMouCategories = [];
        }
      },
      error: err => { this.LoginFailed(err); }
    });
  }

  private matchMouCategory(item: any, selected: any): boolean {
    if (!selected || selected === 'All') {
      return true;
    }
    const categoryName = selected.CategoryName;
    return String(item.mouCategory ?? '').toLowerCase() === categoryName.toLowerCase();
  }

  setSchoolDivision(event: any) {
    const selectedId = event.target.value;
    this.selectedSchoolDivision = selectedId;
    let filtered = this.MouActivityDocumentsMaster.filter(item => {
      if (this.selectedSchoolDivision === '-1') {
        return false;
      }
      if (this.selectedSchoolDivision === '0') {
        return true;
      }

      if (this.selectedSchoolDivision !== '1') {
        return item.schoolDivisionInvolved && item.schoolDivisionInvolved.split(',').map((id: string) => id.trim()).includes(this.selectedSchoolDivision);
      }
      return true;
    });

    // Then apply search filter if exists
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(item => {
        return Object.entries(item).some(([key, val]) => {
          if (val !== null && val !== undefined) {
            let valueString = String(val).toLowerCase();

            // Special handling for mouid (Numeric & "MOU/x" String Comparison)
            if (key === 'id') {
              const numericId = Number(val);
              if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
                return true;
              }
            }

            // General search for all other fields
            return valueString.includes(query);
          }
          return false;
        });
      });
    }

    this.filteredMouActivityDocuments = filtered;
  }


  // Helper: convert various API date formats (e.g. "26 Mar 2026" or ISO) to "yyyy-MM-dd"
  private parseApiDateToIso(dateVal: any): string | null {
    if (!dateVal) return null;
    // if already a Date object
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      return dateVal.toISOString().slice(0, 10);
    }
    // try direct Date parse (works for ISO or many browser-parseable strings)
    const direct = new Date(dateVal);
    if (!isNaN(direct.getTime())) {
      return direct.toISOString().slice(0, 10);
    }
    // try dd MMM yyyy pattern (e.g. "26 Mar 2026")
    const m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(String(dateVal));
    if (m) {
      const day = m[1].padStart(2, '0');
      const monthName = m[2].toLowerCase().slice(0, 3);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = months.indexOf(monthName);
      if (monthIndex >= 0) {
        const year = m[3];
        return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day}`;
      }
    }
    return null;
  }

  formatDate(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  @ViewChild('OpenMouRenewalModal', { read: TemplateRef, static: false })
  OpenMouRenewalModal!: TemplateRef<any> | null;

  LPUSpocEmail: any = '';
  AssignedToUidName: any = '';
  moustatus: any;
  MouStartDate: any;
  MouEndDate: any;
  isIndefiniteMou: boolean = false;

  CurrentSchool: any;
  mouForm: FormGroup;
  isRenewalMode: boolean = false;
  renewalFile: File | null = null;
  renewalFileBase64: string | null = null;
  renewalFileName: string = '';
  renewalFileError: string = '';
  originalMouData: any = null;
  // Toggles the disabled state of the MouEndDate field and sets MOU status
  toggleEndDate(): void {
    if (this.isIndefiniteMou) {
      this.MouEndDate = '';
      this.moustatus = 'Active';

    } else {
      this.updateMouStatus(); // Recalculate status if unchecked
    }
  }

  onInput2() {
    const query = this.mouForm.get('lpuSpocName')?.value?.toLowerCase();

    if (query && query.length >= 2) {
      this.filteredEmployeesData = this.EmployeeData.filter(emp =>
        emp.employeeName.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query)
      ).slice(0, 10); // Limit to top 10 for clean UI

      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  selectEmployee2(employee: Employee) {
    // This updates the variables used in your console.log/HTML
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;
    this.AssignedToUidName = employee.employeeName;

    // IMPORTANT: This updates the Reactive Form state for the API
    this.mouForm.patchValue({
      lpuSpocName: employee.employeeName,
      lpuSpocUid: employee.employeeCode // This ensures the UID is captured
    });

    // Update the separate search control if you are still using it
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);

    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkUIDValidity();
  }




  onRenewFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type (PDF and Word documents only)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      this.renewalFileError = 'Only PDF and Word documents are allowed.';
      return;
    }

    this.renewalFile = file;
    this.renewalFileName = file.name;
    this.renewalFileError = '';

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Data URL format: "data:application/pdf;base64,<base64string>"
      const base64Data = result.split(',')[1];
      this.renewalFileBase64 = base64Data;
    };
    reader.readAsDataURL(file);
  }

  onSubmitModal(): void {
    if (this.isRenewalMode) {
      this.onSubmitRenew();
    }
  }

  onSubmitRenew(): void {
    if (this.mouForm.invalid) {
      this.mouForm.markAllAsTouched();
      const invalidFields: string[] = [];
      const controls = this.mouForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidFields.push(name);
        }
      }
      swal.fire({
        title: 'Validation Error',
        html: `<p>Please fill in all required fields:</p><ul class="text-start">${invalidFields.map(f => `<li>${this.getFieldDisplayName(f)}</li>`).join('')}</ul>`,
        icon: 'error'
      });
      return;
    }

    if (!this.renewalFile) {
      swal.fire('Error', 'Please upload a MOU document for renewal.', 'error');
      return;
    }

    if (!this.renewalFileBase64) {
      swal.fire('Error', 'File is still being processed. Please try again.', 'error');
      return;
    }

    const val = this.mouForm.getRawValue();

    // Compute new MOU status based on dates
    let newMouStatus = 'Active';
    const today = new Date();
    const startDate = val.startDate ? new Date(val.startDate) : null;
    const endDate = val.isIndefinite ? null : (val.endDate ? new Date(val.endDate) : null);

    if (val.isIndefinite) {
      newMouStatus = 'Active';
    } else if (startDate) {
      if (!endDate || (today >= startDate && today <= endDate)) {
        newMouStatus = 'Active';
      } else {
        newMouStatus = 'Expired';
      }
    } else {
      newMouStatus = 'Expired';
    }

    // Prepare FormData for new MOU upload
    const formData = new FormData();

    formData.append('UID', this.EmployeeCode);
    formData.append('MasterMouId', this.mouId);
    formData.append('RenewalRemark', val.remarks);
    formData.append('FilePath', this.renewalFileName);
    formData.append('File', this.renewalFileBase64);
    formData.append('MouStartDate', val.startDate);
    formData.append('MouEndDate', val.endDate);
    formData.append('MouStatus', newMouStatus);
    formData.append('SchoolDivisionInvolved', val.selectedDivisions.join(','));
    formData.append('SPOCName', val.spocName);
    formData.append('SPOCEmailId', val.spocEmail);
    formData.append('SPOCContactNo', val.spocContact);
    formData.append('LPUSpocName', val.lpuSpocName);
    formData.append('LPUSpocUID', val.lpuSpocUid);
    formData.append('LPUSpocEmail', val.lpuSpocEmail);

    formData.append('CreatedBy', this.EmployeeCode);

    swal.fire({
      title: 'Renew MOU',
      text: 'Are you sure you want to renew this MOU? This will create a new MOU and mark the old one as Renewed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, renew MOU',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.mouDocumentsService.MouRenewalDetails(formData).subscribe({
          next: (data: any) => {
            const resultMsg = data.item1 && data.item1.length > 0 ? data.item1[0].msg : data.responseData;
            if (resultMsg === 'success') {
              swal.fire('Success', 'Renewed MOU.', 'success');
              window.location.reload();
            } else if (data.responseData == 'Failed') {
              swal.fire('Error', 'Failed to create new MOU. Please try again.', 'error');
              window.location.reload();
            }
          },
          error: (err) => {
            swal.fire('Error', 'Failed to upload new MOU document.', 'error');
          }
        });
      }
    });

  }


  initForm() {
    this.mouForm = this.fb.group({
      mouId: [{ value: '', disabled: true }], // Locked field
      selectedDivisions: [[], [Validators.required]],
      mouOrganisation: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      isIndefinite: [false],
      spocName: ['', [Validators.required]],
      spocEmail: ['', [Validators.required, Validators.email]],
      spocContact: [''],
      lpuSpocName: ['', [Validators.required]], // Internal SPOC Name
      lpuSpocUid: ['', [Validators.required]],  // Internal SPOC UID
      lpuSpocEmail: ['', [Validators.required, Validators.email]],// Internal SPOC Email
      remarks: ['', [Validators.required]] // Internal SPOC Email
    });
  }


  // Helper for Template to check validation
  isInvalid(controlName: string): boolean {
    const control = this.mouForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Helper to get display name for form fields
  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'mouOrganisation': 'Partner Organisation Name',
      'selectedDivisions': 'Divisions Involved',
      'startDate': 'Start Date',
      'endDate': 'End Date',
      'spocName': 'SPOC Name',
      'spocEmail': 'SPOC Email',
      'spocContact': 'SPOC Contact',
      'lpuSpocName': 'LPU SPOC Name',
      'lpuSpocUid': 'LPU SPOC UID',
      'remarks': 'Renew Remarks',
      'mouid': 'Original Mouid',
      'lpuSpocEmail': 'LPU SPOC Email'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Updates the MOU status based on the date logic
  updateMouStatus(): void {
    const today = new Date();
    const startDate = this.MouStartDate ? new Date(this.MouStartDate) : null;
    const endDate = this.MouEndDate ? new Date(this.MouEndDate) : null;

    if (this.isIndefiniteMou) {
      // If Indefinite MOU is checked, status is always Active
      this.moustatus = 'Active';
    } else if (startDate) {
      // Check if today falls within the range of start and end dates
      if (!endDate || (today >= startDate && today <= endDate)) {
        this.moustatus = 'Active';
      } else {
        this.moustatus = 'Expired';
      }
    } else {
      this.moustatus = 'Expired'; // Default status if start date is missing
    }
  }

  openRenewModal(row: any): void {
    this.isRenewalMode = true;
    this.showSuggestions = false;
    this.filteredEmployeesData = [];
    this.originalMouData = { ...row };

    // Reset file upload fields
    this.renewalFile = null;
    this.renewalFileBase64 = null;
    this.renewalFileName = '';
    this.renewalFileError = '';

    // Populate form with existing MOU data
    // convert API date strings to ISO (yyyy-MM-dd) so <input type="date" ...> or reactive date controls receive valid values
    const startIso = this.parseApiDateToIso(row.mouStartDate) ?? '';
    const endIso = this.parseApiDateToIso(row.mouEndDate) ?? '';

    this.mouForm.patchValue({
      mouId: row.id,
      selectedDivisions: row.schoolDivisionInvolved ? row.schoolDivisionInvolved.split(',') : [],
      mouOrganisation: row.mouTitle,
      startDate: startIso,
      endDate: endIso,
      isIndefinite: row.mouStatus === 'Active' && !row.mouEndDate,
      spocName: row.spocName,
      spocEmail: row.spocEmailId,
      spocContact: row.spocContactNo,
      lpuSpocName: row.lpuSpocName,
      lpuSpocUid: row.lpuSpocUID,
      lpuSpocEmail: row.lpuSpocEmail
    });

    // Set display variables
    this.mouId = row.id;
    this.AssignedToUid = row.lpuSpocUID;
    this.AssignedToUidName = row.lpuSpocName;
    this.moustatus = row.mouStatus;
    // keep component-level date strings in ISO format (useful for other logic / display)
    this.MouStartDate = startIso || row.mouStartDate;
    this.MouEndDate = endIso || row.mouEndDate;
    this.isIndefiniteMou = row.mouStatus === 'Active' && !row.mouEndDate;
    this.CurrentSchool = row.schoolDivisionInvolved;

    if (!this.OpenMouRenewalModal) {
      console.error('OpenMouRenewalModal template not found. Ensure the template has #OpenMouRenewalModal in the component HTML and is not blocked by *ngIf.');
      return;
    }
    // defer open to next tick so ViewChild is resolved if template rendered conditionally
    setTimeout(() => {
      this.modalService.open(this.OpenMouRenewalModal!, { size: 'xl', windowClass: 'modal-xl', backdrop: 'static' }).result.then(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
        // Modal closed
      }).catch(() => { });
    }, 0);
  }

  statusFilter: string = 'all';
  Tab1statusFilter: string = 'all';
  Tab2statusFilter: string = 'all';
  Tab3statusFilter: string = 'all';
  searchQuery: any = '';

  @ViewChild('ViewRenewedMouDetailsModal') ViewRenewedMouDetailsModal: TemplateRef<any>;
  renewedMouDocumentDetails: any[] = [];

  onCategoryChange(event: any): void {
    this.applyFiltersTab1();
  }

  onCategory2Change(event: any): void {
    this.applyFiltersTab2();
  }

  onCategory3Change(event: any): void {
    this.applyFiltersTab3();
  }

  onStatusChangeTab1(event: any): void {
    this.applyFiltersTab1();
  }

  applyFiltersTab1(): void {
    // First filter by status
    let filtered = this.MouActivityDocumentsMaster.filter(item => {
      if (this.Tab1statusFilter === 'all') {
        return true;
      }

      if (this.Tab1statusFilter === 'active') {
        return item.mouStatus === 'Active';
      } else if (this.Tab1statusFilter === 'expired') {
        return item.mouStatus == 'Expired' && item.renewalCount == 0;
      } else if (this.Tab1statusFilter === 'renewed') {
        return item.renewalCount > 0 || item.renewalCount !== 'null' && item.renewalCount !== null && item.renewalCount !== undefined && item.renewalCount !== '0';
      }
      return true;
    });

    // Then apply search filter if exists
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(item => {
        return Object.entries(item).some(([key, val]) => {
          if (val !== null && val !== undefined) {
            let valueString = String(val).toLowerCase();

            // Special handling for mouid (Numeric & "MOU/x" String Comparison)
            if (key === 'id') {
              const numericId = Number(val);
              if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
                return true;
              }
            }

            // General search for all other fields
            return valueString.includes(query);
          }
          return false;
        });
      });
    }

    this.filteredMouActivityDocuments = filtered;
  }

  OpenAllMouRenewalHistory(row: any): void {
    this.mouId = row.id;
    this.getRenewedMouDetails(row.id);
    this.modalService.open(this.ViewRenewedMouDetailsModal, { size: 'lg', backdrop: 'static' }).result.then(() => {
      // Modal closed
    }).catch(() => {
      window.location.reload()

    });
  }

  // Tab 2 Filters 

  onStatusChangeTab2(event: any): void {
    this.applyFiltersTab2();
  }

  // applyFiltersTab2(): void {
  //   // First filter by status

  //   this.filteredMouActivityAssignedMe = [...this.MouActivityAssignedMeMaster];
  //         this.filteredMouActivityAssignedMe = this.filteredMouActivityAssignedMe.filter((activity: any) => {
  //           return activity.actionAssignedBy == this.EmployeeCode;
  //         });
  //   let filtered = this.filteredMouActivityAssignedMe.filter(item => {
  //     if (this.Tab2statusFilter === 'all') {
  //       return true;
  //     }

  //     if (this.Tab2statusFilter === 'active') {
  //       return item.mouStatus === 'Active';
  //     } else if (this.Tab2statusFilter === 'expired') {
  //       return item.mouStatus === 'Expired';
  //     } else if (this.Tab2statusFilter === 'renewed') {
  //       return item.mouStatus ==='Renewed' ;
  //     }
  //     return true;
  //   });

  //   // Then apply search filter if exists
  //   const query = this.searchTextTab2.trim().toLowerCase();
  // if (query) {
  //   filtered = filtered.filter(item => {
  //     return Object.entries(item).some(([key, val]) => {
  //       if (val !== null && val !== undefined) {
  //         let valueString = String(val).toLowerCase();

  //         // Special handling for mouid (Numeric & "MOU/x" String Comparison)
  //         if (key === 'id') {
  //           const numericId = Number(val);
  //           if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
  //             return true;
  //           }
  //         }

  //         // General search for all other fields
  //         return valueString.includes(query);
  //       }
  //       return false;
  //     });
  //   });
  // }

  //   this.filteredMouActivityAssignedMe = filtered;
  // }

  applyFiltersTab2(): void {

    let filtered = this.MouActivityAssignedMeMaster.filter(
      x => x.actionAssignedBy === this.EmployeeCode
    );

    // -----------------------------
    // School Division Filter
    // -----------------------------

    filtered = filtered.filter(item => this.matchSchoolDivision(item));

    filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryTab2));

    // -----------------------------
    // Status Filter
    // -----------------------------

    switch (this.Tab2statusFilter) {

      case 'active':
        filtered = filtered.filter(
          x => x.mouStatus === 'Active'
        );
        break;

      case 'expired':
        filtered = filtered.filter(
          x => x.mouStatus === 'Expired'
        );
        break;

      case 'renewed':
        filtered = filtered.filter(
          x =>
            x.mouStatus === 'Renewed' ||
            x.renewalVersionCount > 0
        );
        break;
    }

    // -----------------------------
    // Search Filter
    // -----------------------------

    const query = (this.searchTextTab2 || '')
      .trim()
      .toLowerCase();

    if (query) {

      // Normalize search
      const normalizedQuery = query.replace(/\s+/g, '');

      filtered = filtered.filter(item => {

        // Search by Old MOU Id
        if (item.mouId != null) {

          const oldId = item.mouId.toString().toLowerCase();

          if (
            oldId.includes(normalizedQuery) ||
            (`mou/${oldId}`).includes(normalizedQuery)
          ) {
            return true;
          }
        }

        // Search by New MOU Id
        if (item.newMouId != null) {

          const newId = item.newMouId.toString().toLowerCase();

          if (
            newId.includes(normalizedQuery) ||
            (`mou/${newId}`).includes(normalizedQuery)
          ) {
            return true;
          }
        }

        // Search remaining fields
        return Object.entries(item).some(([_, value]) => {

          if (value == null) {
            return false;
          }

          return String(value)
            .toLowerCase()
            .includes(normalizedQuery);

        });

      });

    }

    // -----------------------------
    // Sort Latest First
    // -----------------------------

    filtered.sort((a, b) => b.id - a.id);

    this.filteredMouActivityAssignedMe = filtered;

  }
  private matchSchoolDivision(item: any): boolean {

    if (this.selectedSchoolDivision2 === '0' || this.selectedSchoolDivision2 === '-1') {
      return true;
    }

    if (!item.schoolDivisionId) {
      return false;
    }

    const divisions = item.schoolDivisionId
      .toString()
      .split(',')
      .map((x: string) => x.trim());

    return divisions.includes(this.selectedSchoolDivision2.toString());
  }

  getActiveCountTab2(): number {
    return this.filteredMouActivityAssignedMe.filter(item => {
      return item.mouStatus === 'Active';
    }).length;
  }

  getExpiredCountTab2(): number {
    return this.filteredMouActivityAssignedMe.filter(item => {
      return item.mouStatus === 'Expired';
    }).length;
  }
  getRenewedCountTab2(): number {
    return this.filteredMouActivityAssignedMe.filter(item => {
      return item.mouStatus === 'Renewed';
    }).length;
  }

  OpenAllMouRenewalHistoryTab2(row: any): void {
    this.mouId = row.id;
    this.getRenewedMouDetails(row.id);
    this.modalService.open(this.ViewRenewedMouDetailsModal, { size: 'lg', backdrop: 'static' }).result.then(() => {
      // Modal closed
    }).catch(() => {
      window.location.reload()

    });
  }

  //  Tab -3 Filters

  onStatusChangeTab3(event: any): void {
    this.applyFiltersTab3();
  }

  onSchoolDivisionChangeTab3(event: any): void {
    this.applyFiltersTab3();
  }

  private matchSchoolDivision3(item: any): boolean {
    if (this.selectedSchoolDivision3 === '0' || this.selectedSchoolDivision3 === '-1') {
      return true;
    }
    if (!item.schoolDivisionId) {
      return false;
    }
    const divisions = item.schoolDivisionId
      .toString()
      .split(',')
      .map((x: string) => x.trim());
    return divisions.includes(this.selectedSchoolDivision3.toString());
  }

  applyFiltersTab3(): void {
    let filtered = this.MouActivityAssignedOthersMaster.filter(
      x => x.actionAssignedBy !== this.EmployeeCode
    );

    // Filter by School Division
    filtered = filtered.filter(item => this.matchSchoolDivision3(item));

    filtered = filtered.filter(item => this.matchMouCategory(item, this.SelectedMouCategoryTab3));

    // Filter by Status
    if (this.Tab3statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (this.Tab3statusFilter === 'active') {
          return item.mouStatus === 'Active';
        } else if (this.Tab3statusFilter === 'expired') {
          return item.mouStatus === 'Expired';
        } else if (this.Tab3statusFilter === 'renewed') {
          return item.mouStatus === 'Renewed';
        }
        return true;
      });
    }

    // Then apply search filter if exists
    const query = (this.searchTextTab3 || '').trim().toLowerCase();
    if (query) {
      const normalizedQuery = query.replace(/\s+/g, '');
      filtered = filtered.filter(item => {
        if (item.mouId != null) {
          const oldId = item.mouId.toString().toLowerCase();
          if (oldId.includes(normalizedQuery) || (`mou/${oldId}`).includes(normalizedQuery)) {
            return true;
          }
        }
        if (item.newMouId != null) {
          const newId = item.newMouId.toString().toLowerCase();
          if (newId.includes(normalizedQuery) || (`mou/${newId}`).includes(normalizedQuery)) {
            return true;
          }
        }
        return Object.entries(item).some(([_, value]) => {
          if (value == null) return false;
          return String(value).toLowerCase().includes(normalizedQuery);
        });
      });
    }

    filtered.sort((a, b) => b.id - a.id);
    this.filteredMouActivityAssignedOthers = filtered;
  }


  getActiveCountTab3(): number {
    return this.filteredMouActivityAssignedOthers.filter(item => {
      return item.mouStatus === 'Active';
    }).length;
  }

  getExpiredCountTab3(): number {
    return this.filteredMouActivityAssignedOthers.filter(item => {
      return item.mouStatus === 'Expired';
    }).length;
  }
  getRenewedCountTab3(): number {
    return this.filteredMouActivityAssignedOthers.filter(item => {
      return item.mouStatus === 'Renewed';
    }).length;
  }

  getRenewedMouDetails(mouId: any): void {
    this.mouDocumentsService.GetRenewedMouDetails(mouId).subscribe((response) => {
      if (response.item1.length > 0) {
        this.renewedMouDocumentDetails = response.item1;
      } else {
        this.renewedMouDocumentDetails = [];
      }
    });
  }

  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModalAll') viewActivityActionTakenModalAll: TemplateRef<any>;
  @ViewChild('activityModal') activityModal: TemplateRef<any>;
  @ViewChild('viewMouActivityActionTakenModal') viewMouActivityActionTakenModal: TemplateRef<any>;
  @ViewChild('AssignNewUIDModal') AssignNewUIDModal: TemplateRef<any>;

  searchTextTab1: string = '';
  MouActivityDocumentsMaster: any[] = [];
  filteredMouActivityDocuments: any[] = [];

  searchTextTab2: string = '';
  MouActivityAssignedMeMaster: any[] = [];
  filteredMouActivityAssignedMe: any[] = [];

  searchTextTab3: string = '';
  MouActivityAssignedOthersMaster: any[] = [];
  filteredMouActivityAssignedOthers: any[] = [];

  employeeControl = new FormControl();

  EmployeeData: Employee[] = [];
  filteredEmployeesData: Employee[] = [];
  showSuggestions = false;
  activeSuggestionIndex: number = -1;
  ResponsiblePerson: any = '';
  AssignedToUid: any = '';

  SchoolDivisionInvolved: any;
  DepartmentName: any;
  CurrentMouTitle: any;
  remarks: any;
  Reason: any;
  mouId: any;
  startDate: any;
  endDate: any;
  allSchoolDivisions: SchoolDivision[] = [];
  allPlannerSessions: any[] = [];
  selectedPlannerSession: any = '11';

  EmployeeDetails: any;
  EmployeeCode: any;
  Department: any;
  EmployeeName: any;
  ContactNoX: any;
  UserRole: any;
  isLoginFailed: boolean = false;

  loadingIndicator = false;
  showNoDataFoundMessage: boolean = false;
  ServerUrl: any;
  ColumnMode = ColumnMode;
  columns: any;
  columnsAssigned: any;
  headHtmlData: any[] = [];
  mouActivities: MouActivity[] = [];
  selectedActivityId: any = '';
  selectedRow: any = null;
  uploadEnabled: boolean = false;

  MouActionTakenDocuments: any[] = [];
  filteredMouActionTakenDocuments: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  MouidX: any; IdX: any; MouTitleX: any; StartDateX: any; EndDateX: any; ActivityDetailsX: any; RemarksX: any;

  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) _document: Document,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.mouActivities = mouActivities;
    const stMain = document.getElementById('stMain');
    if (stMain) stMain.innerHTML = '<span class="themeClr text-center"> MOU </span>Activity Action <span class="themeClr">Plan </span> <br/><span class="ms-3">   HOS /COS / Admin </span> ';

    const imgLogo = document.getElementById('imgLogo');
    if (imgLogo) imgLogo.style.width = '164px';

    this.startDate = this.endDate = '';
    this.ServerUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
    let loginName = this.route.snapshot.params['loginName'];

    if (loginName != '' && loginName != undefined) {
      this.storageService.clean();
      this.getToken(loginName);
    }
  }
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
        this.getAllPlannerSession();
        this.GetEmployeeDetails();
        this.GetAllActivities();
        this.GetEmployeeData();
        this.setupEmployeeControl();
        this.GetAllCategories();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  getAllPlannerSession(): void {
    this.mouDocumentsService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1) {
          this.allPlannerSessions = response.item1;
        }
      }
    });
  }

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode; // // Hardcoded as per original
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.UserRole = response.item1[0].userRole;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;

          this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
          this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
        }
      },
      error: err => this.LoginFailed(err)
    });
  }

  reloadGrid1() {
    this.selectedPlannerSession = "0";
    this.searchTextTab1 = "";
    this.GetAllMouDocumentsForApprovals(this.EmployeeCode);
  }

  GetAllMouDocumentsForApprovals(IdCode: any): void {
    this.mouDocumentsService.GetMouDocumentToAssignActivity(IdCode).subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.MouActivityDocumentsMaster = response.item1;
          // Apply Initial Sort
          this.MouActivityDocumentsMaster.sort((a, b) => (b.id - a.id));
          // Initialize filtered list
          this.filteredMouActivityDocuments = [...this.MouActivityDocumentsMaster];

          this.SchoolDivisionInvolved = this.getDivisionNameById(this.MouActivityDocumentsMaster[0].schoolDivisionInvolved);
          this.setupColumns(this.MouActivityDocumentsMaster[0], 'tab1');
          this.loadingIndicator = false;
        } else {
          this.MouActivityDocumentsMaster = [];
          this.filteredMouActivityDocuments = [];
          this.showNoDataFoundMessage = true;
        }
        // Load Tab 3 Data after Tab 1
        this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
      },
      error: err => this.LoginFailed(err)
    });
  }

  reloadGrid2() {
    this.selectedPlannerSession = "0";
    this.searchTextTab2 = "";
    this.GetAllActivtiesAssigned(this.EmployeeCode, '0');
  }
  GetAllActivtiesAssigned(IdCode: any, sessionId: any): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.GetAllActivitiesAssignedwithSession(IdCode, sessionId).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {

          this.MouActivityAssignedMeMaster = response.item1;
          this.filteredMouActivityAssignedMe = [...this.MouActivityAssignedMeMaster];
          this.filteredMouActivityAssignedMe = response.item1.filter((activity: any) => {
            return activity.actionAssignedBy == this.EmployeeCode;
          });

          this.filteredMouActivityAssignedMe.sort((a, b) => b.id - a.id); // Assuming ID exists, mostly checks createdOn usually
          this.setupColumns(this.MouActivityAssignedMeMaster[0], 'assigned');
          this.showNoDataFoundMessage = false;
        } else {
          this.MouActivityAssignedMeMaster = [];
          this.filteredMouActivityAssignedMe = [];
          this.showNoDataFoundMessage = true;
        }
        setTimeout(() => { this.loadingIndicator = false; }, 1500);
      },
      error: err => {
        this.loadingIndicator = false;
        this.LoginFailed(err);
      }
    });
  }

  reloadGrid() {
    this.selectedPlannerSession = "0";
    this.searchTextTab3 = "";
    this.GetOthersActivtiesAssigned(this.EmployeeCode, '0');
  }
  // TAB 3 DATA

  GetOthersActivtiesAssigned(IdCode: any, sessionId: any): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.GetAllActivitiesAssignedwithSession('0', '0').subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.MouActivityAssignedOthersMaster = response.item1;

          this.MouActivityAssignedOthersMaster = response.item1.filter((activity: any) => {
            return activity.actionAssignedBy !== this.EmployeeCode;
          });

          this.MouActivityAssignedOthersMaster.sort((a, b) => a.id - b.id);
          this.setupColumns(this.MouActivityAssignedOthersMaster[0], 'assigned');
          this.showNoDataFoundMessage = false;
          this.filterTab3();
        } else {
          this.MouActivityAssignedOthersMaster = [];
          this.filteredMouActivityAssignedOthers = [];
          this.showNoDataFoundMessage = true;
        }
        setTimeout(() => { this.loadingIndicator = false; }, 1500);
      },
      error: err => {
        this.loadingIndicator = false;
        this.LoginFailed(err);
      }
    });
  }

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      this.allSchoolDivisions = response.item1.length > 0 ? response.item1 : [];
    });
  }

  GetEmployeeData(): void {
    this.mouDocumentsService.GetEmployeeData().subscribe({
      next: response => {
        this.EmployeeData = response.item1.length > 0 ? response.item1 : [];
      },
      error: err => console.error(err)
    });
  }

  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('Uid', this.AssignedToUid);
    formData.append('ActionAssignedBy', this.EmployeeCode);
    formData.append('Remarks', this.remarks);
    formData.append('StartDate', this.startDate);
    formData.append('EndDate', this.endDate);
    this.mouDocumentsService.MouNewActivityPlanAddNew(formData).subscribe({
      next: (data: any) => {
        if (data?.item1?.[0]?.msg === 'success') {
          swal.fire('Success', 'Assigned UID Done.', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          swal.fire('Failed', 'Assigned UID Failed.', 'error');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      },
      complete: () => this.clearFields()
    });
  }

  UploadUID() {
    const formData = new FormData();
    formData.append('RecordId', this.IdX);
    formData.append('Uid', this.AssignedToUid);
    formData.append('MouId', this.MouidX);


    this.mouDocumentsService.ActivityPlanUpdateUID(formData).subscribe({
      next: (data: any) => {
        const result = data?.item1?.[0]?.msg;

        if (result === 'Success') {
          this.showAlert('UID Updated Successfully!', 'success');

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          this.showAlert('Failed to Update UID!', 'error');

        }
      },
      error: (err) => {
        swal.fire('Error', 'Failed to Assign New UID .', 'error');
      },
      complete: () => {
        this.clearFields();
        this.reloadGrid2();
      }

    });
  }

  genericSearch(data: any[], query: string): any[] {
    if (!query || query.trim() === '') {
      return [...data];
    }
    const lowerQuery = query.trim().toLowerCase();
    return data.filter(item => {
      return Object.entries(item).some(([key, val]) => {
        if (val === null || val === undefined) return false;
        const valueString = String(val).toLowerCase();

        // Special Logic: Search by "MOU/123" or just "123" for mouId
        if (key === 'mouId') {
          const numericId = Number(val);
          if (!isNaN(numericId)) {
            if (numericId.toString().includes(lowerQuery) || `mou/${numericId}`.toLowerCase().includes(lowerQuery)) {
              return true;
            }
          }
        }
        return valueString.includes(lowerQuery);
      });
    });
  }

  filterTab1() {
    this.filteredMouActivityDocuments = this.genericSearch(this.MouActivityDocumentsMaster, this.searchTextTab1);
  }

  filterTab2() {
    this.filteredMouActivityAssignedMe = this.genericSearch(this.MouActivityAssignedMeMaster, this.searchTextTab2);
  }

  filterTab3() {
    this.applyFiltersTab3();
  }

  setSessionId(event: any) {
    const selectedId = event.target.value;
    this.selectedPlannerSession = selectedId;
    this.GetAllActivtiesAssigned(this.EmployeeCode, this.selectedPlannerSession);
    this.GetOthersActivtiesAssigned('0', this.selectedPlannerSession);
  }

  setupColumns(dataRow: any, type: 'tab1' | 'assigned') {
    if (!dataRow) return;

    const allKeys = Object.keys(dataRow);
    const exclusions = [
      'newMouId', 'filePath', 'activityDetails', 'activityPerformed', 'mouStartDate',
      'mouEndDate', 'mouStatus', 'approvedBy', 'createdBy', 'mouId', 'schoolDivisionInvolved',
      'isApproved', 'approvalDate', 'disapprovalReason', 'uid', 'id', 'spocContactNo',
      'createdOn', 'actionAssignedBy', 'sessionAcademicYear', 'mouTitle'
    ];

    const filteredCols = allKeys.filter(key => !exclusions.includes(key));

    if (type === 'tab1') {
      this.columns = filteredCols;
    } else {
      this.columnsAssigned = filteredCols;
    }
  }

  setupEmployeeControl() {
    this.employeeControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.onInput());
  }

  onInput() {
    const inputValue = (this.employeeControl.value || '').toLowerCase();
    if (inputValue) {
      this.filteredEmployeesData = this.EmployeeData.filter(employee =>
        employee.employeeName.toLowerCase().includes(inputValue) ||
        employee.employeeCode.toLowerCase().includes(inputValue)
      ).slice(0, 10);
    } else {
      this.filteredEmployeesData = [];
    }
    this.showSuggestions = true;
    this.activeSuggestionIndex = -1;
  }

  selectEmployee(employee: Employee) {
    this.ResponsiblePerson = employee.employeeCode;
    this.AssignedToUid = employee.employeeCode;
    this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
    this.filteredEmployeesData = [];
    this.showSuggestions = false;
    this.checkFormValidity();
    this.checkUIDValidity();
  }

  onKeydown(event: KeyboardEvent) {
    if (this.filteredEmployeesData.length > 0) {
      if (event.key === 'ArrowDown') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.filteredEmployeesData.length;
      } else if (event.key === 'ArrowUp') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.filteredEmployeesData.length) % this.filteredEmployeesData.length;
      } else if (event.key === 'Enter') {
        if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.filteredEmployeesData.length) {
          this.selectEmployee(this.filteredEmployeesData[this.activeSuggestionIndex]);
        }
      }
    }
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  checkFormValidity(): boolean {
    return !!(
      this.startDate &&
      this.endDate &&
      this.remarks &&
      this.AssignedToUid > 0 // Ensures a faculty was selected from suggestions
    );
  }

  checkUIDValidity(): void {
    this.uploadEnabled = this.IdX !== '' && this.AssignedToUid != '';
  }

  clearFields(): void {
    this.mouId = this.startDate = this.endDate = this.ResponsiblePerson = '';
    this.remarks = '';
  }

  onSelect(a: any) {
    this.mouId = a['mouId'];
    this.CurrentMouTitle = a['mouTitle'];
    // this.startDate = a['mouStartDate'];
    // this.endDate = a['mouEndDate'];

    this.modalService.open(this.viewDescModal, { size: 'lg' });
  }

  AssignUid(rows: any) {
    this.MouidX = rows['mouId'];
    this.IdX = rows['id'];
    this.MouTitleX = rows['mouTitle'];
    this.StartDateX = rows['startDate'];
    this.EndDateX = rows['endDate'];
    this.ActivityDetailsX = rows['activityDetails'];
    this.RemarksX = rows['remarks'];
    this.modalService.open(this.AssignNewUIDModal, { size: 'lg' }).result.then(() => window.location.reload()).catch(() => { });
  }

  ViewAllActionTaken(rows: any) {
    this.MouidX = rows['mouId'];
    this.GetAllActionDetails(this.MouidX);
    this.modalService.open(this.viewMouActivityActionTakenModal, { size: 'lg' }).result.then((result) => {
      window.location.reload();
    }).catch((res) => { });
  }

  GetAllActionDetails(id: any) {
    this.mouDocumentsService.GetMouActivityActionTakenDetails(id).subscribe((response) => {
      if (response.item1.length > 0) {
        this.dataSource = response.item1;
        this.allMouActionTakenDetails = response.item1;
      } else {
        this.allMouActionTakenDetails = [];
      }
    });
  }
  openActivityModal(row: any): void {
    this.selectedRow = row;
    this.modalService.open(this.activityModal, { size: 'lg' }).result.then((result) => {
    });
  }

  exportToExcel(data: any[], type: 'tab2' | 'tab3'): void {
    const fileName = 'Mou Plan Report.xlsx';
    const exportedData = data.map(item => ({
      NewMOUId: item.newMouId ?? 'N/A',
      OldMOUId: "MOU/" + item.mouId,
      'Name of Mou Organisation': item.mouTitle,
      'MOU Activity Assigned to Faculty UID': item.uid,
      'MOU Activity Assigned BY ': item.actionAssignedBy,
      'Assigned Date': item.createdOn,
      'Activity Start Date': item.startDate,
      'Activity End Date': item.endDate,
      'Remarks': item.remarks,
      'Details of Allocated MOU Activity': this.removeNumberPrefix(item.activityDetails),
      'Session': item.sessionAcademicYear,
    }));

    const ws = XLSX.utils.json_to_sheet(exportedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }

  exportTab1(): void {
    this.exportToExcelLegacy(this.MouActivityDocumentsMaster);
  }
  exportTab2(): void { this.exportToExcel(this.filteredMouActivityAssignedMe, 'tab2'); }
  exportTab3(): void { this.exportToExcel(this.filteredMouActivityAssignedOthers, 'tab3'); }

  exportToExcelLegacy(data: any[]): void {

    const exportedData = data.map(item => ({
      NewMOUId: item.newMouId ?? 'N/A',
      OldMOUId: "MOU/" + item.mouId,
      MouStatus: item.mouStatus,
      'Name of Mou Organisation': item.mouTitle,
      'Uploaded By': item.createdBy ?? 'N/A',
      'SPOC Name': item.spocName ?? 'N/A',
      'SPOC Email': item.spocEmailId ?? 'N/A',
      'SPOC Contact': item.spocContactNo ?? 'N/A',
      'Action Status': item.isApproved == 1 ? 'Approved' : 'Pending',
      'Approval Date': item.approvalDate ?? 'N/A',
      'Start': item.mouStartDate, 'End': item.mouEndDate,
      'Link': item.filePath
    }));
    const ws = XLSX.utils.json_to_sheet(exportedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Mou_Report.xlsx');
  }

  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
    const element = document.getElementById('ActivityPage');
    if (element) element.hidden = true;
  }

  private showAlert(title: string, icon: 'success' | 'error', reload: boolean = false) {
    swal.fire({ title, icon }).then(() => { if (reload) window.location.reload(); });
  }

  removeNumberPrefix(activityDetails: string): string {
    return activityDetails ? activityDetails.replace(/^\d+-\s*/, '') : '';
  }

  // getDivisionNameById(id: number): string {
  //   const division = this.allSchoolDivisions.find(s => +s.id === +id);
  //   return division ? division.schoolDivision : `ID ${id} not found`;
  // }
  getDivisionNameById(id: any): string {

    if (!id) {
      return '';
    }

    const division = this.allSchoolDivisions.find(
      x => x.id.toString() === id.toString().trim()
    );

    return division ? division.schoolDivision : '';
  }

  onSelectFile(a: any) { window.open(a.filePath, '_blank'); }
  onSelectFileX(a: any) { window.open(this.ServerUrl + a.filePath, '_blank'); }
  onSelectActivityDocument(a: any) { window.open(a.actionTakenDocument, '_blank'); }
  onActivitySelected(event: any) { this.selectedActivityId = event.target.value; }

  partnerNamesMap: { [key: number]: string } = {};
  partnerName: string | undefined;
  selectedId: number | undefined;
  MouPartner: any;
  allMouActionTakenDetails: any;

  reminderDisabled: { [key: string]: boolean } = {};
  reminderSending: { [key: string]: boolean } = {};

  onDownloadFile(remoteUrl: string): void {
    swal.fire({ title: 'Downloading...', didOpen: () => { swal.showLoading(null); } });

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

  ReminderEmailTab2(rows: any) {

    if (!rows) {
      console.error('Rows data is null or undefined');
      return;
    }

    const key = String(rows?.id ?? rows?.mouId ?? '');

    // Prevent duplicate sends / respect previous success
    if (this.reminderSending[key]) {
      return;
    }
    if (this.reminderDisabled[key]) {
      // already sent successfully earlier
      return;
    }

    this.reminderSending[key] = true;

    this.MouidX = rows?.mouId ?? '';
    const uid = rows?.uid ?? '';
    const AssignedBy = rows?.actionAssignedBy ?? '';

    this.MouTitleX = rows?.mouTitle ?? '';

    // Correct property names
    this.StartDateX = rows?.startDate ?? '';
    this.EndDateX = rows?.endDate ?? '';

    this.ActivityDetailsX = rows?.activityDetails ?? '';
    this.RemarksX = rows?.remarks ?? '';
    const formData = new FormData();

    formData.append('MouId', this.MouidX);
    formData.append('Id', rows.id); // Ensure MouId is included if needed by API
    formData.append('Uid', uid);
    formData.append('Remarks', this.RemarksX);
    formData.append('StartDate', this.StartDateX);
    formData.append('EndDate', this.EndDateX);
    formData.append('CreatedBy', AssignedBy);
    formData.append('IpAddress', '');
    formData.append('ActionAssignedBy', AssignedBy);
    formData.append('ActivityDetails', this.ActivityDetailsX);

    // });

    this.mouDocumentsService.MouReminderEmail(formData).subscribe({
      next: (data: any) => {

        const result = data?.item1?.[0]?.msg;
        if (result === 'Successfully' || result === 'success') {
          // mark disabled for this row on success
          this.reminderDisabled[key] = true;
          this.showAlert('Reminder Email Sent Successfully!', 'success');
        } else if (result === 'failed') {
          // keep enabled on failure
          this.reminderDisabled[key] = false;
          this.showAlert('Failed to Send Email!', 'error');
        } else {
          this.reminderDisabled[key] = false;
          this.showAlert('Sending Email Failed', 'error');
        }

      },
      error: (err) => {
        console.error('API Error:', err);
        // keep enabled on error
        this.reminderDisabled[key] = false;
        this.showAlert('Something went wrong', 'error');
      },
      complete: () => {
        // reset sending flag; if success we keep disabled true
        this.reminderSending[key] = false;
        this.clearFields();
        this.reloadGrid2();
      }
    });
  }

  ReminderEmailTab1(rows: any) {

    if (!rows) {
      console.error('Rows data is null or undefined');
      return;
    }

    this.MouidX = rows?.mouId ?? '';
    const uid = rows?.uid ?? '';
    const AssignedBy = rows?.approvedBy ?? '';

    this.MouTitleX = rows?.mouTitle ?? '';

    this.StartDateX = rows?.mouStartDate ?? '';
    this.EndDateX = rows?.mouEndDate ?? '';

    this.ActivityDetailsX = rows?.activityDetails ?? '';
    this.RemarksX = rows?.remarks ?? '';

    const formData = new FormData();

    formData.append('MouId', this.MouidX);
    formData.append('Uid', uid);
    formData.append('Remarks', this.RemarksX);
    formData.append('StartDate', this.StartDateX);
    formData.append('EndDate', this.EndDateX);
    formData.append('CreatedBy', AssignedBy);
    formData.append('IpAddress', '');
    formData.append('ActionAssignedBy', AssignedBy);
    formData.append('ActivityDetails', this.ActivityDetailsX);

    this.mouDocumentsService.MouReminderEmail(formData).subscribe({
      next: (data: any) => {

        if (data?.item1?.[0]?.msg === 'success') {
          this.showAlert('Reminder Email Sent Successfully!', 'success');
        } else {
        }

      },
      error: (err) => {
        console.error('API Error:', err);
        this.showAlert('Something went wrong', 'error');
      },
      complete: () => this.clearFields()
    });
  }
}