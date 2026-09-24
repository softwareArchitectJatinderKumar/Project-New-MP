import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { DressMaterialService } from 'src/app/_services/dress-material.service';
import { DressMaterialModel } from './dress-material.model';

@Component({
  selector: 'app-dress-material',
  templateUrl: './dress-material.component.html',
  styleUrls: ['./dress-material.component.scss']
})
export class DressMaterialComponent implements OnInit {

  issueForm: FormGroup;
  loginName: string = '';
  isSubmitting: boolean = false;
  loadingRecords: boolean = false;
  activeTab: string = 'issue'; // 'issue' | 'records'

  // Records table
  materialRecords: DressMaterialModel[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dressMaterialService: DressMaterialService
  ) { }

  ngOnInit(): void {
    this.loginName = this.route.snapshot.paramMap.get('loginName') || '';
    this.initForm();
  }

  initForm(): void {
    this.issueForm = this.fb.group({
      Material: ['', [Validators.required, Validators.maxLength(1500)]],
      RequestPerson: ['', [Validators.required, Validators.maxLength(20)]],
      Quantity: [null, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
    });
  }

  /** Helper to check touched + invalid for template */
  isTouchedInvalid(controlName: string): boolean {
    const control = this.issueForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /** Get validation error message for a control */
  getErrorMessage(controlName: string): string {
    const control = this.issueForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      switch (controlName) {
        case 'Material': return 'Material name is required.';
        case 'RequestPerson': return 'Request person is required.';
        case 'Quantity': return 'Quantity is required.';
        default: return 'This field is required.';
      }
    }
    if (control.hasError('min')) {
      return 'Quantity must be at least 1.';
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid number.';
    }
    if (control.hasError('maxlength')) {
      const max = control.errors?.maxlength?.requiredLength;
      return `Maximum ${max} characters allowed.`;
    }
    return '';
  }

  /** Submit the Issue / Add form */
  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.issueForm.controls).forEach(key => {
      this.issueForm.get(key)?.markAsTouched();
    });

    if (this.issueForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    this.isSubmitting = true;

    const { Material, Quantity, RequestPerson } = this.issueForm.value;

    this.dressMaterialService.issueMaterial(Material, Quantity, RequestPerson).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        const result = response?.item1?.[0] || response?.[0] || response;

        if (result?.Msg === 'Success' || result?.msg === 'Success') {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Dress material request has been submitted successfully.',
            confirmButtonColor: '#6366f1'
          });
          this.issueForm.reset();
          // Refresh records if on records tab
          if (this.activeTab === 'records') {
            this.loadMyRecords();
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: result?.Msg || result?.msg || 'Failed to submit the request. Please try again.',
            confirmButtonColor: '#ef4444'
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('DressMaterial Issue Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred. Please try again later.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  /** Switch active tab */
  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'records') {
      this.loadMyRecords();
    }
  }

  /** Load records for the current user */
  loadMyRecords(): void {
    this.loadingRecords = true;
    this.dressMaterialService.getMyMaterials().subscribe({
      next: (response: any) => {
        this.loadingRecords = false;
        this.materialRecords = response?.item1 || response || [];
        this.currentPage = 1;
      },
      error: (err: any) => {
        this.loadingRecords = false;
        console.error('Load records error:', err);
        this.materialRecords = [];
      }
    });
  }

  /** Return a material */
  returnMaterial(materialId: number): void {
    Swal.fire({
      title: 'Confirm Return',
      text: 'Are you sure you want to return this material?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Return it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dressMaterialService.returnMaterial(materialId).subscribe({
          next: (response: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Returned!',
              text: 'Material has been returned successfully.',
              confirmButtonColor: '#6366f1'
            });
            this.loadMyRecords();
          },
          error: (err: any) => {
            console.error('Return error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to return the material.',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  /** Pagination helpers */
  get paginatedRecords(): DressMaterialModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.materialRecords.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.materialRecords.length / this.itemsPerPage) || 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  /** Reset the form */
  resetForm(): void {
    this.issueForm.reset();
  }
}
