// import {
//   StageDetailRow, MAX_FILE_SIZE_BYTES, DocumentApproval, StudentApplication, isDocumentDecided, documentApprovalLabel,
// } from '../../models/application.models';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country, University, StudentApplication, StageDetailRow, FileSelectedEvent, DocumentApproval ,MAX_FILE_SIZE_BYTES, isDocumentDecided, documentApprovalLabel,} from '../../models/application.models';
import Swal from 'sweetalert2';

/**
 * Shown once an application is Approved. Presents Stage II documents only
 * (per requirement scope) with sample-template download, replace/update
 * file upload and a view button for whatever has already been submitted.
 * All actual webapi calls (upload / view) remain owned by the parent
 * EditApplicationComponent — this component only emits the same events the
 * existing Stage-II panel used, so uploadStageDocumentRow / onStageFilePicked /
 * viewDocument keep working unmodified.
 */
@Component({
  selector: 'app-approved-application',
  templateUrl: './approved-application.component.html',
  styleUrls: ['./approved-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovedApplicationComponent {

    @Input() studentName = '';
    @Input() registrationNo = '';
    @Input() courseName = '';
    @Input() currentYear = '';
    @Input() cgpa = '';
    @Input() programCode = '';
    @Input() sectionCode = '';
    @Input() currentTerm = '';
  
    @Input() stepLabels: string[] = [];
  
    @Input() form!: FormGroup;
    @Input() isEditingStep: boolean[] = [];
    @Input() isSubmitted = false;
    @Input() countries: Country[] = [];
    @Input() uniData: University[] = [];
    @Input() stuApplication!: StudentApplication;
    @Input() localServerUrl = '';
    @Input() isValid1 = true;
    @Input() isValid2 = true;
    @Input() isValid3 = true;
    @Input() stagesDetail: StageDetailRow[] = [];
    @Input() documentApprovals: DocumentApproval[] = [];
    @Input() isParentLoading = false;
  
    @Output() editClick = new EventEmitter<number>();
    @Output() cancelClick = new EventEmitter<number>();
    @Output() updateClick = new EventEmitter<number>();
    @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
    @Output() submitClick = new EventEmitter<void>();
  

    
  // @Input() stagesDetail: StageDetailRow[] = [];
  @Input() stageDocumentData: StageDetailRow[] = [];//DocumentApprovals
  // @Input() documentApprovals: DocumentApproval[] = [];
  // @Input() localServerUrl = '';

  @Output() uploadStage = new EventEmitter<number>();
  @Output() stageFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() viewDocument = new EventEmitter<string>();
  // @Input() stuApplication!: StudentApplication;
  /** Once a document has been Approved or Rejected, its upload/replace input is disabled. */
  isUploadDisabled(row: StageDetailRow): boolean {
    return isDocumentDecided(this.documentApprovals, row.documentName);
  }

  /** 'Approved' | 'Rejected' | '' — shown next to the upload input once a decision exists. */
  approvalLabel(row: StageDetailRow): string {
    return documentApprovalLabel(this.documentApprovals, row.documentName);
  }

  get stage1Rows(): StageDetailRow[] {
    console.table(
      this.stagesDetail.map(x => ({
        document: x.documentName,
        stage: x.stageName
      }))
    );
    const rows = (this.stagesDetail ?? []).filter(r => {
      const name = String(r.stageName ?? '').trim().toLowerCase();
      return name === 'stage i' || name === 'stage1';
    });
    return rows;
  }

  get stage2Rows(): StageDetailRow[] {
    const rows = (this.stagesDetail ?? []).filter(r => {
      const name = String(r.stageName ?? '').trim().toLowerCase();
      return name === 'stage ii' || name === 'stage2';
    });
    return rows;
  }
  // get stage1Rows(): StageDetailRow[] {
  //   console.log('********* Stage DEtails data ***********' + JSON.stringify(this.stagesDetail));
  //   const master = (this.stagesDetail ?? []).filter(r => {
  //     const name = String((r as any)?.stageName ?? '').trim().toLowerCase();
  //     return name === 'stage i' || name === 'stage1';
  //   });

  //   return master.map(masterRow => {
  //     const uploaded = (this.stageDocumentData ?? []).find(
  //       d => String(d.documentName ?? '').trim().toLowerCase() === String(masterRow.documentName ?? '').trim().toLowerCase()
  //     );
  //     return uploaded
  //       ? { ...masterRow, document: uploaded.document, applicationId: uploaded.applicationId }
  //       : masterRow;
  //   });
  // }
  activeStage: 'stage1' | 'stage2' = 'stage1';
  setActiveStage(stage: 'stage1' | 'stage2'): void {
    this.activeStage = stage;
  }

  get currentRows(): StageDetailRow[] {

    return this.activeStage === 'stage1'
      ? this.stage1Rows
      : this.stage2Rows;
  }

  get currentStageName(): string {
    return this.activeStage === 'stage1'
      ? 'Stage I'
      : 'Stage II';
  }
  // get stage2Rows(): StageDetailRow[] {
  //   console.log('********* Stage DEtails data ***********' + JSON.stringify(this.stagesDetail));
  //   const master = (this.stagesDetail ?? []).filter(r => {
  //     const name = String((r as any)?.stageName ?? '').trim().toLowerCase();
  //     return name === 'stage ii' || name === 'stage2';
  //   });

  //   return master.map(masterRow => {
  //     const uploaded = (this.stageDocumentData ?? []).find(
  //       d => String(d.documentName ?? '').trim().toLowerCase() === String(masterRow.documentName ?? '').trim().toLowerCase()
  //     );
  //     return uploaded
  //       ? { ...masterRow, document: uploaded.document, applicationId: uploaded.applicationId }
  //       : masterRow;
  //   });
  // }

  existingDocPath(row: StageDetailRow): string | null {
    return row?.document && typeof row.document === 'string' && row.document.trim() ? row.document.trim() : null;
  }

  hasSampleFormat(row: StageDetailRow): boolean {
    return !!row?.sampleFormat;
  }

  downloadTemplate(row: StageDetailRow): void {
    if (!row?.sampleFormat) return;
    window.open(this.localServerUrl + row.sampleFormat, '_blank');
  }

  view(row: StageDetailRow): void {
    const file = this.existingDocPath(row);
    if (file) this.viewDocument.emit(file);
  }

  uploadRow(row: StageDetailRow): void {
    const index = this.getRowIndex(row);
    if (index >= 0) this.uploadStage.emit(index);
  }

  async onFilePicked(event: Event, row: StageDetailRow): Promise<void> {
    const index = this.getRowIndex(row);
    if (index < 0) return;
    const file = await this.sanitizeAndRead(event);
    if (!file) return;
    this.stagesDetail[index].fileName = file.fileName;
    this.stagesDetail[index].fileObject = file.raw;
    this.stagesDetail[index].isUploaded = false;
    this.stageFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
  }

  private getRowIndex(row: StageDetailRow): number {
    for (let i = 0; i < this.stagesDetail.length; i++) {
      if (this.stagesDetail[i].id === row.id) return i;
    }
    return -1;
  }

  private async sanitizeAndRead(event: Event): Promise<{ raw: File; fileName: string; base64: string } | null> {
    const target = event.target as HTMLInputElement;
    const raw = target.files?.[0];
    if (!raw) return null;
    if (raw.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3MB', icon: 'warning' });
      target.value = '';
      return null;
    }
    const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const file = safeName !== raw.name ? new File([raw], safeName, { type: raw.type }) : raw;
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    return { raw: file, fileName: file.name, base64 };
  }





  
    activeTab: 'application'| 'stage1' | 'stage2' = 'stage1';
    currentStep = 0;
    /** Drives the transition loader shown while moving between wizard steps or nav tabs. */
    isSwitching = false;
  
    private readonly transitionDelayMs = 350;
  
    constructor(private cdr: ChangeDetectorRef) {}
  
    nextStep(): void {
      if (this.isEditingStep[this.currentStep]) {
        Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving on.', 'warning');
        return;
      }
      const maxStep = (this.stepLabels.length || 5) - 1;
      if (this.currentStep >= maxStep) return;
      this.switchStep(this.currentStep + 1);
    }
  
    prevStep(): void {
      if (this.isEditingStep[this.currentStep]) {
        Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving back.', 'warning');
        return;
      }
      if (this.currentStep <= 0) return;
      this.switchStep(this.currentStep - 1);
    }
  
    goToStep(index: number): void {
      if (this.isEditingStep[this.currentStep]) {
        Swal.fire('Please Update or Cancel', 'Save or cancel changes before navigating.', 'warning');
        return;
      }
      if (index <= this.currentStep && index !== this.currentStep) {
        this.switchStep(index);
      }
    }
  
    setTab(tab: 'stage1' | 'stage2'): void {
      if (tab === this.activeTab) return;
      if (this.isEditingStep.some(e => e)) {
        Swal.fire('Please Update or Cancel', 'Save or cancel changes before switching tabs.', 'warning');
        return;
      }
      this.isSwitching = true;
      setTimeout(() => {
        this.activeTab = tab;
        this.isSwitching = false;
        // Required with OnPush: this callback runs outside any template event,
        // so the view won't otherwise re-render and the loader would stay stuck on screen.
        this.cdr.markForCheck();
      }, this.transitionDelayMs);
    }
  
    private switchStep(index: number): void {
      this.isSwitching = true;
      setTimeout(() => {
        this.currentStep = index;
        this.isSwitching = false;
        // Required with OnPush: this callback runs outside any template event,
        // so the view won't otherwise re-render and the loader would stay stuck on screen.
        this.cdr.markForCheck();
      }, this.transitionDelayMs);
    }
}
