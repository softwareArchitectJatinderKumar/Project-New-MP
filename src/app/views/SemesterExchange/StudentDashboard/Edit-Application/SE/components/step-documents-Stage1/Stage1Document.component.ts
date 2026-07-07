import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
}
  from '@angular/core';
import {
  StudentApplication,
  FileSelectedEvent,
  MAX_FILE_SIZE_BYTES,
  StageDetailRow,
  DocumentApproval,
  isDocumentDecided,
  documentApprovalLabel,
}
  from '../../models/application.models';
import Swal from 'sweetalert2';

/**
 * Stage I Documents — dedicated component (separated out of the former
 * combined Stage1/Stage2 view). Shows every Stage I document required from
 * the student with: sample template download, upload/replace file input
 * (auto-emits on selection so the parent can call the same UpdateDocuments
 * webapi it already used), and a "View" button for whatever is on file.
 */
@Component({
  selector: 'stage-1-Documents',
  templateUrl: './Stage1Document.component.html',
  styleUrls: ['./step-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stage1DocumentComponent {
  @Input() stuApplication!: StudentApplication;
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() documentApprovals: DocumentApproval[] = [];
  @Input() localServerUrl = '';

  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();

  /** Once a document has been Approved or Rejected, its upload/replace input is disabled. */
  isUploadDisabled(documentName: string): boolean {
    return isDocumentDecided(this.documentApprovals, documentName);
  }

  /** 'Approved' | 'Rejected' | '' — shown next to the upload input once a decision exists. */
  approvalLabel(documentName: string): string {
    return documentApprovalLabel(this.documentApprovals, documentName);
  }

  readonly docKeys: Array<{
    key: FileSelectedEvent['key'];
    label: string;
    appField: keyof StudentApplication;
    documentName: string;
  }> = [
    { key: 'fees', label: 'Fees Proof Document', appField: 'feesProofFileName', documentName: 'Fees Paid' },
    { key: 'resume', label: 'Resume Document', appField: 'resumeFileName', documentName: 'Resume' },
    { key: 'consent', label: 'Consent Letter', appField: 'consentLetterFileName', documentName: 'Consent Letter' },
    { key: 'passport', label: 'Passport File', appField: 'passportFileName', documentName: 'Passport' },
    { key: 'english', label: 'English Test Proof', appField: 'englishTestDocumentFile', documentName: 'English Test Proof' },
    { key: 'affidavitPath', label: 'Affidavit', appField: 'affidavitPath', documentName: 'Affidavit' },
    { key: 'indeminityBondPath', label: 'Indeminity Bond', appField: 'indeminityBondPath', documentName: 'Indeminity Bond' },
  ];

  getFileName(field: keyof StudentApplication): string {
    return (this.stuApplication?.[field] as string) ?? '';
  }

  hasFile(field: keyof StudentApplication): boolean {
    return !!this.getFileName(field);
  }

  viewFile(fileName: string): void {
    if (!fileName) return;
    window.open(this.localServerUrl + fileName, '_blank');
  }

  getStageDocument(documentName: string): StageDetailRow | undefined {
    return this.stagesDetail.find(x =>
      (x.documentName ?? '').trim().toLowerCase() === documentName.trim().toLowerCase()
    );
  }

  hasSampleFormat(documentName: string): boolean {
    const row = this.getStageDocument(documentName);
    return !!(row && row.sampleFormat);
  }

  downloadTemplate(documentName: string): void {
    const row = this.getStageDocument(documentName);
    if (!row || !row.sampleFormat) return;
    window.open(this.localServerUrl + row.sampleFormat, '_blank');
  }

  async onFilePicked(event: Event, key: FileSelectedEvent['key']): Promise<void> {
    const target = event.target as HTMLInputElement;
    const raw = target.files?.[0];
    if (!raw) return;
    if (raw.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3MB. Please upload a smaller file.', icon: 'warning' });
      target.value = '';
      return;
    }
    const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const file = safeName !== raw.name ? new File([raw], safeName, { type: raw.type }) : raw;
    try {
      const base64 = await this.readAsBase64(file);
      this.fileSelected.emit({ key, file, base64, fileName: file.name });
    } catch {
      Swal.fire({ title: 'Failed to read file', icon: 'error' });
    }
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
