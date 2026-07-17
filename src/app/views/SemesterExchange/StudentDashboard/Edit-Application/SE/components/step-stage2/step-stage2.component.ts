import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  StudentApplication,
  FileSelectedEvent,
  MAX_FILE_SIZE_BYTES,
  StageDetailRow,
  DocumentApproval,
  isDocumentDecided,
  documentApprovalLabel,
} from '../../models/application.models';
import Swal from 'sweetalert2';

/**
 * Stage II Documents: view/update/replace the Stage II document set and
 * download the sample template for each document (where available).
 */
@Component({
  selector: 'app-step-stage2',
  templateUrl: './step-stage2.component.html',
  styleUrls: ['./step-stage2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepStage2Component implements OnChanges {
  @Input() stuApplication!: StudentApplication;
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() documentApprovals: DocumentApproval[] = [];
  @Input() localServerUrl = '';
  @Input() isParentLoading = false;

  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();

  private pendingFiles = new Map<FileSelectedEvent['key'], FileSelectedEvent>();
  private uploadingKeys = new Set<FileSelectedEvent['key']>();
  private wasParentLoading = false;

  constructor(private cdr: ChangeDetectorRef) {}

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
      { key: 'offerLetterPath', label: 'Offer Letter Document', appField: 'offerLetterPath', documentName: 'Offer Letter' },
      { key: 'outBoundTicket', label: 'OutBound Ticket', appField: 'outBoundTicket', documentName: 'OutBound Ticket' },
      { key: 'returnTicketPath', label: 'Return Ticket', appField: 'returnTicketPath', documentName: 'Return Ticket' },
      { key: 'visaDocumentPath', label: 'Visa Document', appField: 'visaDocumentPath', documentName: 'Visa Document' },
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isParentLoading']) {
      if (this.wasParentLoading && !this.isParentLoading) {
        this.uploadingKeys.clear();
        this.cdr.markForCheck();
      }
      this.wasParentLoading = this.isParentLoading;
    }
    if (changes['stuApplication'] && this.stuApplication) {
      this.clearResolvedPendingFiles();
    }
  }

  hasPendingFile(key: FileSelectedEvent['key']): boolean {
    return this.pendingFiles.has(key);
  }

  getPendingFileName(key: FileSelectedEvent['key']): string {
    return this.pendingFiles.get(key)?.fileName ?? '';
  }

  isUploading(key: FileSelectedEvent['key']): boolean {
    return this.uploadingKeys.has(key);
  }

  canUpload(key: FileSelectedEvent['key'], documentName: string): boolean {
    return this.hasPendingFile(key) && !this.isUploading(key) && !this.isUploadDisabled(documentName);
  }

  uploadDoc(key: FileSelectedEvent['key']): void {
    const pending = this.pendingFiles.get(key);
    if (!pending) {
      Swal.fire({ title: 'Please select a file first.', icon: 'warning' });
      return;
    }
    this.uploadingKeys.add(key);
    this.cdr.markForCheck();
    this.fileSelected.emit(pending);
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
      this.pendingFiles.set(key, { key, file, base64, fileName: file.name });
      this.cdr.markForCheck();
    } catch {
      Swal.fire({ title: 'Failed to read file', icon: 'error' });
    }
  }

  private clearResolvedPendingFiles(): void {
    let changed = false;
    for (const doc of this.docKeys) {
      if (this.hasFile(doc.appField)) {
        if (this.pendingFiles.delete(doc.key)) changed = true;
        if (this.uploadingKeys.delete(doc.key)) changed = true;
      }
    }
    if (changed) this.cdr.markForCheck();
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  // @Input() stuApplication!: StudentApplication;
  // @Input() stagesDetail: StageDetailRow[] = [];
  // @Input() localServerUrl = '';

  // @Output() fileSelected = new EventEmitter<FileSelectedEvent>();



  // // readonly docKeys: DocumentKeyConfig[] = DOCUMENT_KEYS.filter(d => d.stage === '2');


  //  readonly docKeys: Array<{
  //   key: FileSelectedEvent['key'];
  //   label: string;
  //   appField: keyof StudentApplication;
  //   documentName: string;
  // }> = [
  //   { key: 'offerLetterPath', label: 'Offer Letter Document', appField: 'offerLetterPath', documentName: 'Offer Letter' },
  //   { key: 'outBoundTicket', label: 'OutBound Ticket', appField: 'outBoundTicket', documentName: 'OutBound Ticket' },
  //   { key: 'returnTicketPath', label: 'Return Ticket', appField: 'returnTicketPath', documentName: 'Return Ticket' },
  // ];

  // getFileName(field: keyof StudentApplication): string {
  //   return (this.stuApplication?.[field] as string) ?? '';
  // }

  // hasFile(field: keyof StudentApplication): boolean {
  //   return !!this.getFileName(field);
  // }

  // viewFile(fileName: string): void {
  //   if (!fileName) return;
  //   window.open(this.localServerUrl + fileName, '_blank');
  // }

  // getStageDocument(documentName: string): StageDetailRow | undefined {
  //   return this.stagesDetail.find(x =>
  //     (x.documentName ?? '').trim().toLowerCase() === documentName.trim().toLowerCase());
  // }

  // hasSampleFormat(documentName: string): boolean {
  //   const row = this.getStageDocument(documentName);
  //   return !!(row && row.sampleFormat);
  // }

  // downloadTemplate(documentName: string): void {
  //   const row = this.getStageDocument(documentName);
  //   if (!row || !row.sampleFormat) return;
  //   window.open(this.localServerUrl + row.sampleFormat, '_blank');
  // }

  // async onFilePicked(event: Event, key: FileSelectedEvent['key']): Promise<void> {
  //   const target = event.target as HTMLInputElement;
  //   const raw = target.files?.[0];
  //   if (!raw) return;

  //   if (raw.size > MAX_FILE_SIZE_BYTES) {
  //     Swal.fire({ title: 'File size exceeds 3MB. Please upload a smaller file.', icon: 'warning' });
  //     target.value = '';
  //     return;
  //   }

  //   const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  //   const file = safeName !== raw.name ? new File([raw], safeName, { type: raw.type }) : raw;

  //   try {
  //     const base64 = await this.readAsBase64(file);
  //     this.fileSelected.emit({ key, file, base64, fileName: file.name });
  //   } catch {
  //     Swal.fire({ title: 'Failed to read file', icon: 'error' });
  //   }
  // }

  // private readAsBase64(file: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve((reader.result as string).split(',')[1]);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // }
}
