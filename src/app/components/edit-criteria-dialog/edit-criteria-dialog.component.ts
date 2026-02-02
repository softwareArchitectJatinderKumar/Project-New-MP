/**
 * Edit Criteria Dialog Component
 * For Angular 14+ standalone component pattern
 */
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CriteriaService } from '../../_services/criteria.service';

@Component({
  selector: 'app-edit-criteria-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Criteria</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Criteria Description</mat-label>
        <input matInput [(ngModel)]="newDescription" required>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="save()" 
              [disabled]="isLoading || !newDescription">
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">Save Changes</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      min-width: 300px;
    }
    mat-dialog-content {
      padding-top: 20px;
    }
  `]
})
export class EditCriteriaDialogComponent implements OnInit {
  criteriaId: number;
  divisionId: number | null;
  newDescription = '';
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { criteriaId: number; divisionId: number | null },
    private dialogRef: MatDialogRef<EditCriteriaDialogComponent>,
    private criteriaService: CriteriaService
  ) {
    this.criteriaId = data.criteriaId;
    this.divisionId = data.divisionId;
  }

  ngOnInit(): void {
    this.loadCriteria();
  }

  loadCriteria(): void {
    this.criteriaService.getCriteriaById(this.criteriaId).subscribe({
      next: (criteria) => {
        this.newDescription = criteria.name;
      },
      error: (error) => {
        console.error('Failed to load criteria', error);
      }
    });
  }

  save(): void {
    if (!this.newDescription || !this.divisionId) {
      return;
    }

    this.isLoading = true;
    this.criteriaService.renameCriteria({
      criteriaId: this.criteriaId,
      desc: this.newDescription,
      divId: this.divisionId
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close({ success: true });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to rename criteria', error);
        alert('Failed to rename criteria');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
