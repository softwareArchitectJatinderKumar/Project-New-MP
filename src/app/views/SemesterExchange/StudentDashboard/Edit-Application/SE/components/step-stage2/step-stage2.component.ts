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

import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';

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
  private fileInputs = new Map<FileSelectedEvent['key'], HTMLInputElement>();
  private wasParentLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private studentService: SemesterExchangeStuDetailsService,
  ) {}

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
    const app = this.stuApplication as unknown as Record<string, unknown>;
    if (!app) return '';
    const direct = app[field as string];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    const pascal = `${String(field).charAt(0).toUpperCase()}${String(field).slice(1)}`;
    const alt = app[pascal];
    return typeof alt === 'string' ? alt.trim() : '';
  }

  getUploadedPath(doc: { appField: keyof StudentApplication; documentName: string }): string {
    const row = this.getStageDocument(doc.documentName);
    const fromStage = row?.document ?? row?.filePath;
    return typeof fromStage === 'string' && fromStage.trim() ? fromStage.trim() : '';
  }

  hasUploadedFile(doc: { appField: keyof StudentApplication; documentName: string }): boolean {
    return !!this.getUploadedPath(doc);
  }

  viewFile(fileName: any): void {
    const fileStr = String(fileName ?? '').trim();
    if (!fileStr || ['na', 'n/a', 'none', 'null', 'undefined'].includes(fileStr.toLowerCase())) {
      Swal.fire({
        title: 'File Not Found',
        text: 'No document file is available for download.',
        icon: 'info',
      });
      return;
    }

    const fullUrl = fileStr.startsWith('http://') || fileStr.startsWith('https://')
      ? fileStr
      : `${this.localServerUrl}${fileStr}`;

    Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while your document is being retrieved.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    this.studentService.downloadFile(fullUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const name = fileStr.split('/').pop() || 'Document.pdf';
        link.download = name;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        Swal.close();
      },
      error: async (err) => {
        Swal.close();
        if (err?.error instanceof Blob) {
          try {
            const errorMsg = JSON.parse(await err.error.text());
            Swal.fire('Error', errorMsg.message || 'Download failed', 'error');
          } catch {
            Swal.fire('Error', 'Download failed', 'error');
          }
        } else {
          Swal.fire('Error', 'Could not connect to the server or download file', 'error');
        }
      },
    });
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
        this.finishActiveUploads();
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

  async onFilePicked(event: Event, key: FileSelectedEvent['key'], input: HTMLInputElement): Promise<void> {
    this.fileInputs.set(key, input);
    const raw = input.files?.[0];
    if (!raw) return;
    if (raw.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3MB. Please upload a smaller file.', icon: 'warning' });
      input.value = '';
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
      input.value = '';
    }
  }

  private finishActiveUploads(): void {
    for (const key of [...this.uploadingKeys]) {
      this.resetRowState(key);
    }
  }

  private resetRowState(key: FileSelectedEvent['key']): void {
    this.pendingFiles.delete(key);
    this.uploadingKeys.delete(key);
    const input = this.fileInputs.get(key);
    if (input) input.value = '';
    this.cdr.markForCheck();
  }

  private clearResolvedPendingFiles(): void {
    let changed = false;
    for (const doc of this.docKeys) {
      if (this.hasUploadedFile(doc)) {
        if (this.pendingFiles.delete(doc.key)) changed = true;
        if (this.uploadingKeys.delete(doc.key)) changed = true;
        const input = this.fileInputs.get(doc.key);
        if (input?.value) {
          input.value = '';
          changed = true;
        }
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
