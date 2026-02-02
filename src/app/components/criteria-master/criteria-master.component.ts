import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CriteriaService } from '../../_services/criteria.service';
import { Criteria, KeyIndicator, Metric, Division } from '../../_model/criteria.model';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-criteria-master',
  // templateUrl: './newcomponent.html',
  templateUrl: './criteria-master.component.html',
  styleUrls: ['./criteria-master.component.scss']
})
export class CriteriaMasterComponent implements OnInit, OnDestroy {
  // Main form
  criteriaForm: FormGroup;
  uploadForm: FormGroup;
  
  // Data
  criteriaList: Criteria[] = [];
  divisions: Division[] = [];
  keyIndicators: KeyIndicator[] = [];
  metrics: Metric[] = [];
  
  // Selection
  selectedDivisionId: number = 0;
  selectedCriteriaId: number = 0;
  selectedIndicatorId: number = 0;
  selectedMetricId: number = 0;
  
  // UI State
  isLoading: boolean = false;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Form visibility
  showAddForm: boolean = false;
  showUploadForm: boolean = false;
  editingCriteria: boolean = false;
  
  // File upload
  selectedFile: File | null = null;
  
  // Additional data for template
  metricSources: any[] = [];
  mainPoints: any[] = [];
  subPoints: any[] = [];
  totalWeightage: number = 0;
  
  // Table DataSource
  criteriaDataSource = new MatTableDataSource<Criteria>();
  indicatorDataSource = new MatTableDataSource<KeyIndicator>();
  metricDataSource = new MatTableDataSource<Metric>();
  
  // Table Columns
  criteriaDisplayedColumns: string[] = ['id', 'name', 'isActive', 'actions'];
  indicatorDisplayedColumns: string[] = ['id', 'indicatorDesc', 'isActive', 'actions'];
  metricDisplayedColumns: string[] = ['id', 'metricDesc', 'category', 'isActive', 'actions'];
  
  // Paginator & Sort
  @ViewChild('criteriaPaginator') criteriaPaginator!: MatPaginator;
  @ViewChild('criteriaSort') criteriaSort!: MatSort;
  @ViewChild('indicatorPaginator') indicatorPaginator!: MatPaginator;
  @ViewChild('indicatorSort') indicatorSort!: MatSort;
  @ViewChild('metricPaginator') metricPaginator!: MatPaginator;
  @ViewChild('metricSort') metricSort!: MatSort;
  
  // SweetAlert References
  @ViewChild('successSwal') successSwal!: SwalComponent;
  @ViewChild('errorSwal') errorSwal!: SwalComponent;
  
  // Tab control
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  
  // constructor(
  //   private fb: FormBuilder,
  //   private criteriaService: CriteriaService,
  //   private dialog: MatDialog,
  //   private snackBar: MatSnackBar,
  //   private spinner: NgxSpinnerService
  // ) {
  //   this.criteriaForm = this.fb.group({
  //     id: [0],
  //     name: ['', [Validators.required, Validators.maxLength(500)]],
  //     divisionId: [0, Validators.required],
  //     isActive: [true]
  //   });
    
  //   this.uploadForm = this.fb.group({
  //     file: [null, Validators.required]
  //   });
  // }
  isLoginFailed: boolean=false;
  
   constructor(
      private lpuPlannerServiceService: LpuPlannerServiceService,private criteriaService: CriteriaService,private dialog: MatDialog,     private snackBar: MatSnackBar,
      private fb: FormBuilder,
      @Inject(DOCUMENT) _document: Document,
      private route: ActivatedRoute,
      private storageService: StorageService,
      private authService: AuthService,
      private modalService: NgbModal,
      private mouDocumentsService: MouDocumentsService
    ) {

       this.criteriaForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.maxLength(500)]],
      divisionId: [0, Validators.required],
      isActive: [true]
    });
    
    this.uploadForm = this.fb.group({
      file: [null, Validators.required]
    });
    }
  ngOnInit(): void {
        const stMain = document.getElementById('stMain');
        if (stMain) stMain.innerHTML = '<span class="themeClr text-center"> Criteria </span> <span class="themeClr">Plan </span>  <span class="ms-1">   Master </span> ';
        
        const imgLogo = document.getElementById('imgLogo');
        if (imgLogo) imgLogo.style.width = '164px';
    
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
        if (this.storageService.isLoggedIn() == false || authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }
         this.loadDivisions();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

      LoginFailed(_NewError: any) {
      this.isLoginFailed = true;
      swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
      const element = document.getElementById('MasterPage');
      if (element) element.hidden = true;
    }
  // ngOnInit(): void {
  //   this.loadDivisions();
  //   this.setupTableFeatures();
  // }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Load divisions for dropdown
  loadDivisions(): void {
    this.isLoading = true;
    this.criteriaService.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (divisions: Division[]) => {
          this.divisions = divisions;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.showError('Failed to load divisions');
          this.isLoading = false;
        }
      });
  }
  
  // Setup table features
  setupTableFeatures(): void {
    // Criteria table
    this.criteriaDataSource.paginator = this.criteriaPaginator;
    this.criteriaDataSource.sort = this.criteriaSort;
    
    // Indicator table
    this.indicatorDataSource.paginator = this.indicatorPaginator;
    this.indicatorDataSource.sort = this.indicatorSort;
    
    // Metric table
    this.metricDataSource.paginator = this.metricPaginator;
    this.metricDataSource.sort = this.metricSort;
  }
  
  // Division change handler
  onDivisionChange(): void {
    if (this.selectedDivisionId > 0) {
      this.loadCriteriasByDivision();
      this.loadKeyIndicatorsByDivision();
      this.loadMetricsByDivision();
    } else {
      this.clearAllData();
    }
  }
  
  // Load criteria by division
  loadCriteriasByDivision(): void {
    this.isLoading = true;
    this.criteriaService.getCriteriasByDivision(this.selectedDivisionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (criteria: Criteria[]) => {
          this.criteriaList = criteria;
          this.criteriaDataSource.data = criteria;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.showError('Failed to load criteria');
          this.isLoading = false;
        }
      });
  }
  
  // Load key indicators by division
  loadKeyIndicatorsByDivision(): void {
    this.isLoading = true;
    // this.criteriaService.getKeyIndicatorsByDivision(this.selectedDivisionId)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (indicators: KeyIndicator[]) => {
    //       this.keyIndicators = indicators;
    //       this.indicatorDataSource.data = indicators;
    //       this.isLoading = false;
    //     },
    //     error: (error: any) => {
    //       this.showError('Failed to load key indicators');
    //       this.isLoading = false;
    //     }
    //   });
  }
  
  // Load metrics by division
  loadMetricsByDivision(): void {
    this.isLoading = true;
    // this.criteriaService.getMetricsByDivision(this.selectedDivisionId)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (metrics: Metric[]) => {
    //       this.metrics = metrics;
    //       this.metricDataSource.data = metrics;
    //       this.isLoading = false;
    //     },
    //     error: (error: any) => {
    //       this.showError('Failed to load metrics');
    //       this.isLoading = false;
    //     }
    //   });
  }
  
  // Clear all data
  clearAllData(): void {
    this.criteriaList = [];
    this.keyIndicators = [];
    this.metrics = [];
    this.criteriaDataSource.data = [];
    this.indicatorDataSource.data = [];
    this.metricDataSource.data = [];
  }
  
  // Save criteria
  saveCriteria(): void {
    if (this.criteriaForm.invalid) {
      this.showError('Please fill all required fields');
      return;
    }
    
    this.isSaving = true;
    const criteria = this.criteriaForm.value;
    criteria.divisionId = this.selectedDivisionId;
    
    this.criteriaService.saveCriteria(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          this.isSaving = false;
          if (result.success) {
            this.showSuccess('Criteria saved successfully');
            this.criteriaForm.reset({ id: 0, isActive: true });
            this.loadCriteriasByDivision();
          } else {
            this.showError(result.message || 'Failed to save criteria');
          }
        },
        error: (error: any) => {
          this.isSaving = false;
          this.showError('An error occurred while saving criteria');
        }
      });
  }
  
  // Activate criteria
  activateCriteria(criteria: Criteria): void {
    this.criteriaService.activateCriteria(criteria.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          if (result.success) {
            this.showSuccess('Criteria activated successfully');
            this.loadCriteriasByDivision();
          } else {
            this.showError(result.message || 'Failed to activate criteria');
          }
        },
        error: (error: any) => {
          this.showError('An error occurred while activating criteria');
        }
      });
  }
  
  // Deactivate criteria
  deactivateCriteria(criteria: Criteria): void {
    this.criteriaService.deactivateCriteria(criteria.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          if (result.success) {
            this.showSuccess('Criteria deactivated successfully');
            this.loadCriteriasByDivision();
          } else {
            this.showError(result.message || 'Failed to deactivate criteria');
          }
        },
        error: (error: any) => {
          this.showError('An error occurred while deactivating criteria');
        }
      });
  }
  
  // Upload criteria from Excel
  uploadCriteriaFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isSaving = true;
      const file = input.files[0];
      
      this.criteriaService.uploadCriteriaFile(file, this.selectedDivisionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: any) => {
            this.isSaving = false;
            if (result.success) {
              this.showSuccess('Criteria uploaded successfully');
              this.loadCriteriasByDivision();
            } else {
              this.showError(result.message || 'Failed to upload criteria');
            }
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError('An error occurred while uploading criteria');
          }
        });
    }
  }
  
  // Export criteria to Excel
  exportCriteria(): void {
    // this.criteriaService.exportCriteria(this.selectedDivisionId)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (blob: Blob) => {
    //       const url = window.URL.createObjectURL(blob);
    //       const a = document.createElement('a');
    //       a.href = url;
    //       a.download = 'Criteria.xlsx';
    //       a.click();
    //       window.URL.revokeObjectURL(url);
    //     },
    //     error: (error: any) => {
    //       this.showError('Failed to export criteria');
    //     }
    //   });
  }
  
  // Tab event handlers
  onCriteriaSaved(): void {
    this.loadCriteriasByDivision();
  }
  
  onCriteriaActivated(): void {
    this.loadCriteriasByDivision();
  }
  
  onCriteriaDeactivated(): void {
    this.loadCriteriasByDivision();
  }
  
  onIndicatorSaved(): void {
    this.loadKeyIndicatorsByDivision();
  }
  
  onIndicatorActivated(): void {
    this.loadKeyIndicatorsByDivision();
  }
  
  onIndicatorDeactivated(): void {
    this.loadKeyIndicatorsByDivision();
  }
  
  onMetricSaved(): void {
    this.loadMetricsByDivision();
  }
  
  onMetricActivated(): void {
    this.loadMetricsByDivision();
  }
  
  onMetricDeactivated(): void {
    this.loadMetricsByDivision();
  }
  
  onSourceSaved(): void {
    // Refresh sources if needed
  }
  
  onSourceActivated(): void {
    // Refresh sources if needed
  }
  
  onSourceDeactivated(): void {
    // Refresh sources if needed
  }
  
  onWeightageSaved(): void {
    // Refresh weightage if needed
  }
  
  onStageSaved(): void {
    // Refresh stages if needed
  }
  
  onChecklistSaved(): void {
    // Refresh checklist if needed
  }
  
  // Show success message
  showSuccess(message: string): void {
    this.successMessage = message;
    this.successSwal?.fire();
  }
  
  // Show error message
  showError(message: string): void {
    this.errorMessage = message;
    this.errorSwal?.fire();
  }
  
  // Reset form
  resetForm(): void {
    this.criteriaForm.reset({ id: 0, isActive: true });
    this.editingCriteria = false;
    this.showAddForm = false;
  }
  
  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  
  // Upload file
  uploadFile(): void {
    if (this.selectedFile) {
      this.isSaving = true;
      this.criteriaService.uploadCriteriaFile(this.selectedFile, this.selectedDivisionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: any) => {
            this.isSaving = false;
            if (result.success) {
              this.showSuccess('Criteria uploaded successfully');
              this.loadCriteriasByDivision();
              this.selectedFile = null;
              this.showUploadForm = false;
            } else {
              this.showError(result.message || 'Failed to upload criteria');
            }
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError('An error occurred while uploading criteria');
          }
        });
    }
  }
  
  // Edit criteria
  editCriteria(criteria: Criteria): void {
    this.editingCriteria = true;
    this.criteriaForm.patchValue({
      id: criteria.id,
      name: criteria.name,
      divisionId: criteria.divisionId,
      isActive: criteria.isActive
    });
    this.showAddForm = true;
  }
  
  // Apply filter to table
  applyFilter(event: Event, dataSource: MatTableDataSource<any>): void {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
    
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }
}


// import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
// import { NgSelectComponent } from '@ng-select/ng-select';
// import { DOCUMENT, DatePipe } from '@angular/common';
// import swal from 'sweetalert2';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { MatTableDataSource } from '@angular/material/table';
// import * as XLSX from 'xlsx';

// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';

// // Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTableModule } from '@angular/material/table';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDialogModule, MatDialog } from '@angular/material/dialog';
// import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatTooltipModule } from '@angular/material/tooltip';

// // Models and Services
// import { Division, Criteria, CriteriaRequest } from '../../_model/criteria.model';
// import { CriteriaService } from '../../_services/criteria.service';

// // Edit Modal Component
// import { EditCriteriaDialogComponent } from '../edit-criteria-dialog/edit-criteria-dialog.component';
// import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';

// @Component({
//   selector: 'app-criteria-master',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     // Angular Material
//     MatCardModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatInputModule,
//     MatButtonModule,
//     MatTableModule,
//     MatTabsModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatDialogModule,
//     MatSnackBarModule,
//     MatChipsModule,
//     MatTooltipModule
//   ],
//   templateUrl: './criteria-master.component.html',
//   styleUrls: ['./criteria-master.component.scss']
// })
// export class CriteriaMasterComponent implements OnInit  {
//   // Data
//   divisions: Division[] = [];
//   selectedDivision: number | null = null;
//   criterias: Criteria[] = [];
  
//   // Form data
//   newCriteria: CriteriaRequest = {
//     criteriaDesc: '',
//     divisionId: 0
//   };
  
//   // File upload
//   uploadFile: File | null = null;
//   uploadErrors: string[] = [];
//   uploadedCriterias: Array<{ Criteria: string; RowNumber: number }> = [];
  
//   // UI State
//   activeTab = 0;
//   isLoading = false;
//   errorMessage = '';
//   successMessage = '';
  
//   // Table columns for Material Table
//   displayedColumns: string[] = ['id', 'name', 'isActive', 'Actions'];

 

//    constructor(
//       private lpuPlannerServiceService: LpuPlannerServiceService,private criteriaService: CriteriaService,private dialog: MatDialog,     private snackBar: MatSnackBar,
//       private fb: FormBuilder,
//       @Inject(DOCUMENT) _document: Document,
//       private route: ActivatedRoute,
//       private storageService: StorageService,
//       private authService: AuthService,
//       private modalService: NgbModal,
//       private mouDocumentsService: MouDocumentsService
//     ) {}
//   ngOnInit(): void {
//         const stMain = document.getElementById('stMain');
//         if (stMain) stMain.innerHTML = '<span class="themeClr text-center"> Criteria </span> <span class="themeClr">Plan </span> <br/><span class="ms-3">   Master </span> ';
        
//         const imgLogo = document.getElementById('imgLogo');
//         if (imgLogo) imgLogo.style.width = '164px';
    
//         let loginName = this.route.snapshot.params['loginName'];
    
//         if (loginName != '' && loginName != undefined) {
//           this.storageService.clean();
//           this.getToken(loginName);
//         }
//   }

//   ngOnDestroy(): void {
//     // Clean up if needed
//   }
//   isLoginFailed: boolean = false;
//  getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         var authToken = this.storageService.getUser();
//         if (this.storageService.isLoggedIn() == false || authToken == 'Token Expired') {
//           this.LoginFailed('Token Expired');
//         }
//          this.loadDivisions();
//       },
//       error: _err => {
//         this.LoginFailed(_err);
//       }
//     });
//   }
//     LoginFailed(_NewError: any) {
//       this.isLoginFailed = true;
//       swal.fire({ title: 'Login Failed', text: 'Login details are Invalid!', icon: 'warning' });
//       const element = document.getElementById('MasterPage');
//       if (element) element.hidden = true;
//     }
//   loadDivisions(): void {
//     this.isLoading = true;
//     this.criteriaService.getDivisions().subscribe({
//       next: (divisions: Division[]) => {
//         this.divisions = divisions;
//         this.isLoading = false;
//       },
//       error: (error: any) => {
//         this.errorMessage = 'Failed to load divisions';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Load criterias when division changes
//    */
//   onDivisionChange(): void {
//     if (this.selectedDivision) {
//       this.loadCriterias(this.selectedDivision);
//     } else {
//       this.criterias = [];
//     }
//   }

//   /**
//    * Load criterias by division
//    */
//   loadCriterias(divisionId: number): void {
//     this.isLoading = true;
//     this.criteriaService.getCriteriasByDivision(divisionId).subscribe({
//       next: (criterias: Criteria[]) => {
//         this.criterias = criterias;
//         // console.log(JSON.stringify(this.criterias))
//         this.isLoading = false;
//       },
//       error: (error: any) => {
//         this.errorMessage = 'Failed to load criterias';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Save new criteria
//    */
//   saveCriteria(): void {
//     if (!this.newCriteria.criteriaDesc || !this.newCriteria.divisionId) {
//       this.errorMessage = 'Please fill all required fields';
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = '';
//     this.successMessage = '';

//     this.criteriaService.saveCriteria(this.newCriteria).subscribe({
//       next: (response: any) => {
//         this.successMessage = 'Criteria saved successfully';
//         this.newCriteria.criteriaDesc = '';
//         if (this.selectedDivision) {
//           this.loadCriterias(this.selectedDivision);
//         }
//         this.isLoading = false;
//         this.showSuccess('Criteria saved successfully');
//       },
//       error: (error: any) => {
//         this.errorMessage = error.error?.message || 'Failed to save criteria';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Deactivate criteria
//    */
//   deactivateCriteria(criteriaId: number): void {
//     if (!confirm('Are you sure you want to deactivate this criteria?')) {
//       return;
//     }

//     this.isLoading = true;
//     this.criteriaService.deactivateCriteria(criteriaId).subscribe({
//       next: (response: any) => {
//         this.successMessage = 'Criteria deactivated successfully';
//         if (this.selectedDivision) {
//           this.loadCriterias(this.selectedDivision);
//         }
//         this.isLoading = false;
//         this.showSuccess('Criteria deactivated successfully');
//       },
//       error: (error: any) => {
//         this.errorMessage = 'Failed to deactivate criteria';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Activate criteria
//    */
//   activateCriteria(criteriaId: number): void {
//     this.isLoading = true;
//     this.criteriaService.activateCriteria(criteriaId).subscribe({
//       next: (response: any) => {
//         this.successMessage = 'Criteria activated successfully';
//         if (this.selectedDivision) {
//           this.loadCriterias(this.selectedDivision);
//         }
//         this.isLoading = false;
//         this.showSuccess('Criteria activated successfully');
//       },
//       error: (error: any) => {
//         this.errorMessage = 'Failed to activate criteria';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Open edit criteria dialog
//    */
//   editCriteria(criteriaId: number): void {
//     const dialogRef = this.dialog.open(EditCriteriaDialogComponent, {
//       width: '500px',
//       data: {
//         criteriaId,
//         divisionId: this.selectedDivision
//       }
//     });

//     dialogRef.afterClosed().subscribe((result: any) => {
//       if (result?.success) {
//         this.successMessage = 'Criteria renamed successfully';
//         if (this.selectedDivision) {
//           this.loadCriterias(this.selectedDivision);
//         }
//       }
//     });
//   }

//   /**
//    * Handle file selection
//    */
//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.uploadFile = input.files[0];
//     }
//   }

//   /**
//    * Upload criteria file
//    */
//   uploadCriteriaFile(): void {
//     if (!this.uploadFile) {
//       this.errorMessage = 'Please select a file';
//       return;
//     }

//     const extension = this.uploadFile.name.split('.').pop()?.toLowerCase();
//     if (extension !== 'xls' && extension !== 'xlsx') {
//       this.errorMessage = 'Please upload only .xls or .xlsx extension file';
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = '';
//     this.successMessage = '';
//     this.uploadErrors = [];

//     this.criteriaService.uploadCriteriaFile(this.uploadFile).subscribe({
//       next: (response: any) => {
//         if (response.hasErrors) {
//           this.errorMessage = 'File has validation errors';
//           this.uploadErrors = response.errors || [];
//         } else {
//           this.successMessage = 'File uploaded successfully';
//           this.uploadedCriterias = response.criterias || [];
//           if (this.selectedDivision) {
//             this.loadCriterias(this.selectedDivision);
//           }
//         }
//         this.isLoading = false;
//       },
//       error: (error: any) => {
//         this.errorMessage = 'Failed to upload file';
//         this.isLoading = false;
//         this.showError(error);
//       }
//     });
//   }

//   /**
//    * Reset form
//    */
//   resetForm(): void {
//     this.newCriteria.criteriaDesc = '';
//     this.selectedDivision = null;
//     this.errorMessage = '';
//     this.successMessage = '';
//     this.criterias = [];
//     this.uploadFile = null;
//     this.uploadErrors = [];
//     this.uploadedCriterias = [];
//   }

//   /**
//    * Clear messages
//    */
//   clearMessages(): void {
//     this.errorMessage = '';
//     this.successMessage = '';
//   }

//   /**
//    * Show success notification
//    */
//   private showSuccess(message: string): void {
//     this.snackBar.open(message, 'Close', {
//       duration: 3000,
//       horizontalPosition: 'end',
//       verticalPosition: 'top',
//       panelClass: ['snackbar-success']
//     });
//   }

//   /**
//    * Show error notification
//    */
//   private showError(error: any): void {
//     this.snackBar.open(error.message || 'An error occurred', 'Close', {
//       duration: 5000,
//       horizontalPosition: 'end',
//       verticalPosition: 'top',
//       panelClass: ['snackbar-error']
//     });
//   }
// }
