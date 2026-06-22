import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StudentApplication, FileSelectedEvent, MAX_FILE_SIZE_BYTES } from '../../models/application.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-step-documents',
  templateUrl: './step-documents.component.html',
  styleUrls: ['./step-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDocumentsComponent {
  @Input() stuApplication!: StudentApplication;
  @Input() isEditing = false;
  @Input() isLocked = false;
  @Input() localServerUrl = '';
  @Input() hideBackNext = false;

  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
  @Output() editClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() submitClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();

  readonly docKeys: Array<{ key: FileSelectedEvent['key']; label: string; appField: keyof StudentApplication }> = [
    { key: 'fees',    label: 'Fees Proof Document',   appField: 'feesProofFileName' },
    { key: 'resume',  label: 'Resume Document',       appField: 'resumeFileName' },
    { key: 'consent', label: 'Consent Letter',        appField: 'consentLetterFileName' },
    { key: 'passport',label: 'Passport File',         appField: 'passportFileName' },
    { key: 'english', label: 'English Test Proof',    appField: 'englishTestDocumentFile' },
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
