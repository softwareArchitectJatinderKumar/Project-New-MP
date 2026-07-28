import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class Stage1DocumentComponent implements OnChanges {
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

  constructor(private cdr: ChangeDetectorRef) {}

  /** Once a document has been Approved or Rejected, its upload/replace input is disabled. */
  isUploadDisabled(documentName: string): boolean {
    return isDocumentDecided(this.documentApprovals, documentName);
  }

  /** 'Approved' | 'Rejected' | '' — shown next to the upload input once a decision exists. */
  approvalLabel(documentName: string): string {
    console.log(this.documentApprovals)
    return documentApprovalLabel(this.documentApprovals, documentName);
  }

  readonly docKeys: Array<{
    key: FileSelectedEvent['key'];
    label: string;
    appField: keyof StudentApplication;
    documentName: string;
  }> = [
    { key: 'fees', label: 'Fees Proof', appField: 'feesProofFileName', documentName: 'Fees Proof' },
    { key: 'resume', label: 'Resume Document', appField: 'resumeFileName', documentName: 'Resume' },
    { key: 'consent', label: 'Consent Letter', appField: 'consentLetterFileName', documentName: 'Consent Letter' },
    { key: 'passport', label: 'Passport File', appField: 'passportFileName', documentName: 'Passport' },
    // { key: 'english', label: 'English Test Proof', appField: 'englishTestDocumentFile', documentName: 'English Proof' },
    { key: 'affidavitPath', label: 'Affidavit', appField: 'affidavitPath', documentName: 'Affidavit' },
    { key: 'indeminityBondPath', label: 'Indeminity Bond', appField: 'indeminityBondPath', documentName: 'Indemnity Bond' },
    // { key: 'englishTestDocumentPath', label: 'English Proof', appField: 'englishTestDocumentPath', documentName: 'English Proof' },
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
    const fromApp = this.getFileName(doc.appField);
    if (fromApp) return fromApp;
    const row = this.getStageDocument(doc.documentName);
    const fromStage = row?.document ?? row?.filePath;
    return typeof fromStage === 'string' && fromStage.trim() ? fromStage.trim() : '';
  }

  hasUploadedFile(doc: { appField: keyof StudentApplication; documentName: string }): boolean {
    return !!this.getUploadedPath(doc);
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

  // Keep the existing StageDetails check
  if (!row || !row.sampleFormat) {
    return;
  }

  let assetFile = '';

  if (documentName === 'Consent Letter') {
    assetFile = 'SE-Consent-Letter.pdf';
  } else if (documentName === 'Affidavit') {
    assetFile = 'Affidavit-Format.pdf';
  } else if (documentName === 'Indeminity Bond') {
    assetFile = 'Indeminity-Bond.pdf';
  } else {
    window.open(this.localServerUrl + row.sampleFormat, '_blank')
  }

  const link = document.createElement('a');
  link.href = `assets/SemesterExchange/${assetFile}`;
  link.download = assetFile;
  link.click();
}
  // downloadTemplate(documentName: string): void {
  //   const row = this.getStageDocument(documentName);
  //   if (!row || !row.sampleFormat) return;
  //   window.open(this.localServerUrl + row.sampleFormat, '_blank');
  // }

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
}
