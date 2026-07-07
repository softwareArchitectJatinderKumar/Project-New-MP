import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  StudentApplication,
  FileSelectedEvent,
  MAX_FILE_SIZE_BYTES,
  StageDetailRow,
  // DocumentKeyConfig,
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
export class StepStage2Component {
  @Input() stuApplication!: StudentApplication;
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() localServerUrl = '';

  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();

  

  // readonly docKeys: DocumentKeyConfig[] = DOCUMENT_KEYS.filter(d => d.stage === '2');


   readonly docKeys: Array<{
    key: FileSelectedEvent['key'];
    label: string;
    appField: keyof StudentApplication;
    documentName: string;
  }> = [
    { key: 'offerLetterPath', label: 'Offer Letter Document', appField: 'offerLetterPath', documentName: 'Offer Letter' },
    { key: 'outBoundTicket', label: 'OutBound Ticket', appField: 'outboundTicket', documentName: 'OutBound Ticket' },
    { key: 'returnTicketPath', label: 'Return Ticket', appField: 'returnTicketPath', documentName: 'Return Ticket' },
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
      (x.documentName ?? '').trim().toLowerCase() === documentName.trim().toLowerCase());
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
