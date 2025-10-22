import { TemplateRef, ViewChild } from '@angular/core';

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
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';
import { HeadMapping, MetricMapping } from '../Services/HeadMapping.service';
import { PlanningrankingService } from 'src/app/_services/planningranking.service';

@Component({
  selector: 'app-metric-mapping',
  templateUrl: './HeadMappingWithAssistant.html',
  styleUrls: ['./HeadMappingWithAssistant.scss']
})
export class OBPMetricBinding implements OnInit {
  isLoginFailed: boolean
  // Data table source
  public mappingData$!: Observable<MetricMapping[]>;

  // Reactive Form Group
  public mappingForm!: FormGroup;

  // State variables for the form mode
  public isUpdateMode = false;
  private currentEditId: number | null = null;

  // Radio button options
  public isActiveOptions = [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }];
  public typeOptions = ['PA', 'AO', 'DE'];

  // Table columns (for dynamic display)
  public tableColumns: string[] = ['id', 'headUID', 'assistantUID', 'isActive', 'metricId', 'type', 'Actions'];

  // Pagination & filtering state (reactive)
  public pageSizes: number[] = [5, 10, 25, 50];
  public totalRecords = 0;

  private pageSize$ = new BehaviorSubject<number>(10);
  private currentPage$ = new BehaviorSubject<number>(1);
  private searchTerm$ = new BehaviorSubject<string>('');

  // Exposed observable for template display (filtered + paged)
  public displayedData$!: Observable<MetricMapping[]>;

  constructor(
    private fb: FormBuilder,
    private HeadMapping: HeadMapping, private PlanningrankingService: PlanningrankingService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private authService: AuthService, private storageService: StorageService,

  ) { }

  ngOnInit(): void {
    // Initialize form in all cases so template bindings work
    this.initForm();

    // If loginName param provided, perform temp login first then load mappings.
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    } else {
      // No temp login required; load mappings directly so the template can display data
      this.GetAllEventsData();
    }
  }


  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.GetAllEventsData();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }
  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('EventCalenders');
    if (element) {
      element.hidden = true;
    }
  }
  // ngOnInit(): void {
  //   this.GetAllEventsData();
  //   this.mappingData$ = this.HeadMappingData;// this.HeadMapping.data$;
  //   this.initForm();
  // }
  loadingIndicator = false;
  sessionId: any = 'Select'; // Default empty value
  items: any[] = []; // Array to store dropdown options 

  HeadMappingData: any; filteredHeadMappingData: any;


  GetAllEventsData(): void {
    this.loadingIndicator = true;

    // Populate mappingData$ observable from the service so template can use async pipe
    this.mappingData$ = this.PlanningrankingService.GetHeadMappings().pipe(
      map((response: any) => response?.item1 ?? []),
      tap((arr: MetricMapping[]) => {
        // Keep local copies for filtering and other UI usage
        this.HeadMappingData = arr;
        this.filteredHeadMappingData = arr;
        this.loadingIndicator = false;
        this.totalRecords = arr.length;
        // Derive dynamic columns from the first record
        if (arr && arr.length > 0) {
          const keys = Object.keys(arr[0]);
          // Ensure Actions column is last
          this.tableColumns = [...keys.filter(k => k.toLowerCase() !== 'actions'), 'Actions'];
        } else {
          this.tableColumns = ['Actions'];
        }
      }),
      catchError(err => {
        console.error('Failed to load head mappings', err);
        // Provide an empty array so the template stays stable
        this.HeadMappingData = [];
        this.filteredHeadMappingData = [];
        this.loadingIndicator = false;
        this.isLoginFailed = true; // signal error state if needed in UI
        return of([] as MetricMapping[]);
      })
    );

    // Ensure displayedData$ is derived from mappingData$ + search + paging
    this.displayedData$ = combineLatest([this.mappingData$, this.searchTerm$, this.pageSize$, this.currentPage$]).pipe(
      map(([arr, term, size, page]) => {
        const list: MetricMapping[] = (arr as MetricMapping[]) || [];
        const filtered = this.applyFilter(list, term as string);
        this.totalRecords = filtered.length;
        return this.applyPaging(filtered, page as number, size as number);
      }),
      // hide loader when displayed data recalculated
      tap(() => { this.loadingIndicator = false; }),
      catchError(err => {
        console.error('displayedData$ error', err);
        return of([] as MetricMapping[]);
      })
    );
  }
  // Initialize the Reactive Form
  private initForm(): void {
    this.mappingForm = this.fb.group({
      HeadUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      AssistantUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      // IsActive is intentionally omitted for add mode; it will be added dynamically for edit mode
      MetricId: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      Type: ['PA', Validators.required] // Default to PA
    });
  }

  // Handles both Add (Submit) and Update actions
  public onSubmit(): void {
    if (this.mappingForm.invalid) {
      // Mark all fields as touched to display errors
      this.mappingForm.markAllAsTouched();
      return;
    }

    const formData = this.mappingForm.value;

    if (this.isUpdateMode && this.currentEditId !== null) {
      // 5. Update Button Logic: Update existing record
      const updatedRecord: MetricMapping = {Id: this.currentEditId, ...formData };

      
      const MformData = new FormData();
      MformData.append('HeadUID', formData.HeadUID);
      MformData.append('AssistantUID', formData.AssistantUID);
      MformData.append('MetricId', formData.MetricId);
  MformData.append('Type', formData.Type);
  // Use Remarks from the form (added during edit) and the currentEditId for Id
  const remarksVal = this.mappingForm.get('Remarks')?.value ?? formData.Remarks ?? '';
  MformData.append('Remarks', remarksVal);
  const idVal = (this.currentEditId !== null && this.currentEditId !== undefined) ? String(this.currentEditId) : String(formData.Id ?? '');
  MformData.append('Id', idVal);

      // console.log("Form Data")
      // MformData.forEach((value, key) => {
      //   console.log(key, value);
      // });
      this.PlanningrankingService.updateRecord(MformData).pipe(take(1)).subscribe({
        next: (res: any) => {
          alert('Record Updated successfully!');
          this.GetAllEventsData();
          this.loadingIndicator = false;
        },
        error: (err: any) => {
          console.error('InsertHeadMapping failed', err);
          alert('Failed to add new record.');
          this.loadingIndicator = false;
        }
      });


      // this.HeadMapping.updateRecord(updatedRecord);
      // alert(`Record ID ${this.currentEditId} updated successfully!`);
      // Refresh list after update
      this.GetAllEventsData();




    } else {
      // 3. Add Button Logic: Add new record
      // Call InsertHeadMapping API in PlanningrankingService
      this.loadingIndicator = true;
      // Exclude IsActive from payload when inserting new records
      const payload: any = { ...formData };
      if ('IsActive' in payload) delete payload.IsActive;

      const MformData = new FormData();
      MformData.append('HeadUID', formData.HeadUID);
      MformData.append('AssistantUID', formData.AssistantUID);
      MformData.append('MetricId', formData.MetricId);
      MformData.append('Type', formData.Type);

      // console.log("Form Data")
      // MformData.forEach((value, key) => {
      //   console.log(key, value);
      // });
      this.PlanningrankingService.InsertHeadMapping(MformData).pipe(take(1)).subscribe({
        next: (res: any) => {
          alert('New record added successfully!');
          this.GetAllEventsData();
          this.loadingIndicator = false;
        },
        error: (err: any) => {
          console.error('InsertHeadMapping failed', err);
          alert('Failed to add new record.');
          this.loadingIndicator = false;
        }
      });
    }

    // Reset state and form
    this.isUpdateMode = false;
    this.currentEditId = null;
    this.mappingForm.reset({ Type: 'PA' }); // Reset with defaults; IsActive hidden for new records
    // Remove IsActive and Remarks controls if present so add mode doesn't include them
    if (this.mappingForm.get('IsActive')) {
      this.mappingForm.removeControl('IsActive');
    }
    if (this.mappingForm.get('Remarks')) {
      this.mappingForm.removeControl('Remarks');
    }
  }

  // 4. Edit Button Logic: Populate form and switch to Update mode
  public onEdit(record: MetricMapping): void {
    this.isUpdateMode = true;
    // support dynamic/api-casing for properties (headUID vs HeadUID etc.)
    const get = (key: string) => this.getProp(record, key);
    this.currentEditId = get('Id') ?? get('id') ?? (record as any).Id ?? null;

    // Ensure IsActive control exists for edit mode
    if (!this.mappingForm.get('IsActive')) {
      this.mappingForm.addControl('IsActive', this.fb.control(null, Validators.required));
    }

    // Ensure Remarks control exists for edit mode and is required
    if (!this.mappingForm.get('Remarks')) {
      this.mappingForm.addControl('Remarks', this.fb.control('', Validators.required));
    }

    // Populate the form with the selected record's data (using case-insensitive lookup)
    this.mappingForm.patchValue({
      HeadUID: get('HeadUID') ?? get('headUID') ?? get('headUid') ?? null,
      AssistantUID: get('AssistantUID') ?? get('assistantUID') ?? get('assistantUid') ?? null,
      IsActive: get('IsActive') ?? get('isActive') ?? 1,
      MetricId: get('MetricId') ?? get('metricId') ?? null,
      Type: get('Type') ?? get('type') ?? 'PA'
    });
    // Make IsActive required when editing
    this.mappingForm.get('IsActive')?.setValidators([Validators.required]);
    this.mappingForm.get('IsActive')?.updateValueAndValidity();

    // Optionally scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helper for deleting a record (optional, but good practice)
  // Delete functionality removed as per requirements

  // ---------- Client-side filtering & paging helpers ----------
  private applyFilter(data: MetricMapping[], term: string): MetricMapping[] {
    if (!term) return data;
    const lower = term.toLowerCase();
    return data.filter(item => {
      return Object.keys(item).some(k => {
        const v = (item as any)[k];
        return v != null && String(v).toLowerCase().includes(lower);
      });
    });
  }

  private applyPaging(data: MetricMapping[], page: number, size: number): MetricMapping[] {
    const start = ((page || 1) - 1) * (size || 10);
    return data.slice(start, start + (size || 10));
  }

  // Case-insensitive property getter to tolerate different API casing
  private getProp(obj: any, key: string): any {
    if (!obj || !key) return undefined;
    if (key in obj) return obj[key];
    const lower = key.toLowerCase();
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lower);
    return foundKey ? obj[foundKey] : undefined;
  }

  public onSearch(term: string): void {
    this.loadingIndicator = true;
    this.searchTerm$.next(term || '');
    this.currentPage$.next(1);
  }

  public onPageSizeChange(size: number | string): void {
    const s = typeof size === 'string' ? parseInt(size, 10) : size;
    this.loadingIndicator = true;
    this.pageSize$.next(s || 10);
    this.currentPage$.next(1);
  }

  public goToPage(page: number): void {
    if (page < 1) return;
    this.currentPage$.next(page);
  }

  public get currentPage(): number {
    return this.currentPage$.value;
  }

  public get pageSize(): number {
    return this.pageSize$.value;
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / (this.pageSize || 1)));
  }

  // Export currently displayed data to Excel
  public exportToExcel(): void {
    this.loadingIndicator = true;
    // take current filtered data snapshot
    this.mappingData$.pipe(take(1)).subscribe((arr: MetricMapping[]) => {
      const data = (arr || []).map(r => {
        // convert to plain object with readable keys
        const obj: any = {};
        Object.keys(r).forEach(k => obj[k] = (r as any)[k]);
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'HeadMappings');
      XLSX.writeFile(wb, `HeadMappings_${new Date().toISOString().slice(0, 10)}.xlsx`);
      this.loadingIndicator = false;
    }, err => {
      console.error('Export failed', err);
      this.loadingIndicator = false;
    });
  }

  // Helper to convert 1/0 to Yes/No for display
  public isActiveDisplay(value: 0 | 1): string {
    return value === 1 ? 'Yes' : 'No';
  }
}