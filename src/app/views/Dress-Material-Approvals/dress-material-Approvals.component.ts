import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { DressMaterialService } from 'src/app/_services/dress-material.service';
import { DressMaterialModel } from './dress-material-Approvals.model';

@Component({
  selector: 'app-dress-material-approvals',
  templateUrl: './dress-material-approvals.component.html',
  styleUrls: ['./dress-material-approvals.component.scss']
})
export class DressMaterialApprovalsComponent implements OnInit {

  issueForm: FormGroup;
  loginName: string = '';
  isSubmitting: boolean = false;
  loadingRecords: boolean = false;
  activeTab: 'Pending' | 'Approved' | 'Rejected' = 'Pending';

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
     this.loadMyRecords();
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

    this.dressMaterialService.issueMaterial(
      Material, 
      Quantity, 
      RequestPerson, 
      this.loginName, // LoginId
      this.loginName, // CreatedBy
      18,             // SessionId
      '15731'         // ApproverId
    ).subscribe({
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
          this.loadMyRecords();
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
  switchTab(tab: 'Pending' | 'Approved' | 'Rejected'): void {
    this.activeTab = tab;
    this.loadMyRecords();
  }

  /** Load records for the current user based on active tab */
  loadMyRecords(): void {
    this.loadingRecords = true;
    let action: 'View ById' | 'ApprovalAuthApproved' | 'ApprovalAuthNotApproved' = 'View ById';
    if (this.activeTab === 'Approved') action = 'ApprovalAuthApproved';
    if (this.activeTab === 'Rejected') action = 'ApprovalAuthNotApproved';

    this.dressMaterialService.getAdminMaterials(action).subscribe({
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

  /** Approve or Reject a material */
  adminAction(materialId: number, action: 'Approve' | 'Reject'): void {
    const isApprove = action === 'Approve';
    Swal.fire({
      title: isApprove ? 'Confirm Approval' : 'Confirm Rejection',
      text: isApprove ? 'Please enter remarks for approving this material.' : 'Please enter remarks for rejecting this material.',
      input: 'textarea',
      inputPlaceholder: 'Enter your remarks...',
      inputAttributes: {
        'aria-label': 'Admin remarks'
      },
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#198754' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: isApprove ? 'Yes, Approve it' : 'Yes, Reject it',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return `Please enter remarks before ${isApprove ? 'approving' : 'rejecting'} the material.`;
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const remarks = result.value.trim();

        this.dressMaterialService.ApprovalAction(materialId, remarks, action).subscribe({
          next: (response: any) => {
            Swal.fire({
              icon: 'success',
              title: isApprove ? 'Approved!' : 'Rejected!',
              text: `Material has been ${isApprove ? 'approved' : 'rejected'} successfully.`,
              confirmButtonColor: '#6366f1'
            });

            this.loadMyRecords();
          },
          error: (err: any) => {
            console.error(`${action} error:`, err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to ${action.toLowerCase()} the material.`,
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
