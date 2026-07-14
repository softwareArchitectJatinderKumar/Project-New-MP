import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  StageDetailRow, MAX_FILE_SIZE_BYTES, DocumentApproval,StudentApplication, isDocumentDecided, documentApprovalLabel,
} from '../../models/application.models';
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
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() stageDocumentData: StageDetailRow[] = [];//DocumentApprovals
  @Input() documentApprovals: DocumentApproval[] = [];
  @Input() localServerUrl = '';

  @Output() uploadStage = new EventEmitter<number>();
  @Output() stageFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() viewDocument = new EventEmitter<string>();
  @Input() stuApplication!: StudentApplication;
  /** Once a document has been Approved or Rejected, its upload/replace input is disabled. */
  isUploadDisabled(row: StageDetailRow): boolean {
    return isDocumentDecided(this.documentApprovals, row.documentName);
  }

  /** 'Approved' | 'Rejected' | '' — shown next to the upload input once a decision exists. */
  approvalLabel(row: StageDetailRow): string {
    return documentApprovalLabel(this.documentApprovals, row.documentName);
  }

  get stage2Rows(): StageDetailRow[] {
    console.log(this.stagesDetail, this.stageDocumentData, this.documentApprovals);
    const master = (this.stagesDetail ?? []).filter(r => {
      const name = String((r as any)?.stageName ?? '').trim().toLowerCase();
      return name === 'stage ii' || name === 'stage2';
    });

    return master.map(masterRow => {
      const uploaded = (this.stageDocumentData ?? []).find(
        d => String(d.documentName ?? '').trim().toLowerCase() === String(masterRow.documentName ?? '').trim().toLowerCase()
      );
      return uploaded
        ? { ...masterRow, document: uploaded.document, applicationId: uploaded.applicationId }
        : masterRow;
    });
  }

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
}
