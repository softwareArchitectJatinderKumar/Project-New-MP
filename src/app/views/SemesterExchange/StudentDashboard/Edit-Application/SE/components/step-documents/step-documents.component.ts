import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StudentApplication, FileSelectedEvent, MAX_FILE_SIZE_BYTES } from '../../models/application.models';
import Swal from 'sweetalert2';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';

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

  constructor(private studentService: SemesterExchangeStuDetailsService) {}

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
