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
  StageDetailRow, CourseRow
}
  from '../../models/application.models';
import Swal from 'sweetalert2';
@Component({
  selector: 'stage-1-Documents',
  templateUrl: './Stage1Document.component.html',
  styleUrls: ['./step-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stage1DocumentComponent {
  @Input() stuApplication!: StudentApplication;
  @Input() stageDocumentData: StageDetailRow[] = [];
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() courseRows: CourseRow[] = [];
  @Input() isSavingCourses = false;
  @Input() localServerUrl = '';
  @Input() isLocked = false;
  @Input() activePanel: 'stage1' | 'stage2' | 'course' | null = null;
  @Input() canEditStageDocs = true;
  @Input() courseMappingDisabled = false;

  @Output() uploadStage = new EventEmitter<number>();
  @Output() stageFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() courseFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() addCourseRow = new EventEmitter<void>();
  @Output() removeCourseRow = new EventEmitter<number>();
  @Output() saveCourses = new EventEmitter<void>();
  @Output() viewDocument = new EventEmitter<string>();
  @Output() prevClick = new EventEmitter<void>();
  @Input() isEditing = false;

  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
  @Output() editClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() submitClick = new EventEmitter<void>();




  readonly docKeys: Array<{
    key: FileSelectedEvent['key'];
    label: string;
    appField: keyof StudentApplication;
    stage: string;
    documentName: string;
  }> = [{
    key: 'fees',
    label: 'Fees Proof Document',
    appField: 'feesProofFileName',
    stage: '1',
    documentName: 'Fees Paid'
  },
  {
    key: 'resume',
    label: 'Resume Document',
    appField: 'resumeFileName',
    stage: '1',
    documentName: 'Resume/Cv'
  },
  {
    key: 'consent',
    label: 'Consent Letter',
    appField: 'consentLetterFileName',
    stage: '1',
    documentName: 'Consent Letter'
  },
  {
    key: 'passport',
    label: 'Passport File',
    appField: 'passportFileName',
    stage: '1',
    documentName: 'Passport'
  },
  {
    key: 'english',
    label: 'English Test Proof',
    appField: 'englishTestDocumentFile',
    stage: '1',
    documentName: 'English Test Proof'
  },
  {
    key: 'affidavitPath',
    label: 'Affidavit',
    appField: 'affidavitPath',
    stage: '1',
    documentName: 'Affidavit'
  },
  {
    key: 'indeminityBondPath',
    label: 'Indeminity Bond',
    appField: 'indeminityBondPath',
    stage: '1',
    documentName: 'Indeminity Bond'
  },
  {
    key: 'offerLetterPath',
    label: 'Offer Letter',
    appField: 'offerLetterPath',
    stage: '2',
    documentName: 'Offer Letter'
  },
  {
    key: 'outBoundTicket',
    label: 'OutBound Ticket',
    appField: 'outBoundTicket',
    stage: '2',
    documentName: 'OutBound Ticket'
  },
  {
    key: 'returnTicketPath',
    label: 'Return Ticket',
    appField: 'returnTicketPath',
    stage: '2',
    documentName: 'Return Ticket'
  }
    ];


  async onStageFilePicked(event: Event, row: StageDetailRow): Promise<void> {
    const index = this.getRowIndex(row);
    if (index < 0) return;
    const file = await this.sanitizeAndRead(event);
    if (!file) return;
    this.stagesDetail[index].fileName = file.fileName;
    this.stagesDetail[index].fileObject = file.raw;
    this.stageFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });

  }
  private getRowIndex(row: StageDetailRow): number {

    for (let i = 0; i < this.stagesDetail.length; i++) {
      if (this.stagesDetail[i].id == row.id) {
        return i;
      }
    }
    return -1;
  }

  private async sanitizeAndRead(event: Event): Promise<{ raw: File; fileName: string; base64: string } | null> {
    const target = event.target as HTMLInputElement;
    const raw = target.files?.[0];
    if (!raw) return null;
    if (raw.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({ title: 'File size exceeds 3MB', icon: 'warning' });
      target.value = ''; return null;
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



  getFileName(field: keyof StudentApplication): string {
    return (this.stuApplication?.[field] as string) ?? '';
  }
  hasFile(field: keyof StudentApplication): boolean {
    return !!this.getFileName(field);
  }
  viewFile(fileName: string): void {
    if (!fileName) {
      return;
    }
    window.open(this.localServerUrl + fileName, '_blank');
  }
  getStageDocument(documentName: string): StageDetailRow | undefined {

    return this.stagesDetail.find(x =>
      (x.documentName ?? '').trim().toLowerCase() ===
      documentName.trim().toLowerCase()
    );

  }
  hasSampleFormat(documentName: string): boolean {

    const row = this.getStageDocument(documentName);

    return !!(row && row.sampleFormat);

  }
  downloadTemplate(documentName: string): void {

    const row = this.getStageDocument(documentName);

    if (!row || !row.sampleFormat) {
      return;
    }

    window.open(
      this.localServerUrl + row.sampleFormat,
      '_blank'
    );

  }
  async onFilePicked(event: Event, key: FileSelectedEvent['key']): Promise<void> {
    const target = event.target as HTMLInputElement;
    const raw = target.files?.[0];
    if (!raw) {
      return;
    }
    if (raw.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({
        title: 'File size exceeds 3MB. Please upload a smaller file.',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
    const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const file = safeName !== raw.name ? new File([raw], safeName, {
      type: raw.type
    }) : raw;
    try {
      const base64 = await this.readAsBase64(file);
      this.fileSelected.emit({
        key,
        file,
        base64,
        fileName: file.name
      });
    } catch {
      Swal.fire({
        title: 'Failed to read file',
        icon: 'error'
      });
    }
  }
  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string)
        .split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
// import { StudentApplication, FileSelectedEvent, MAX_FILE_SIZE_BYTES, StageDetailRow } from '../../models/application.models';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'stage-1-Documents',
//   templateUrl: './Stage1Document.component.html',
//   styleUrls: ['./step-documents.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class Stage1DocumentComponent {
//   @Input() stuApplication!: StudentApplication;
//   @Input() isEditing = false;
//   @Input() isLocked = false;
//   @Input() localServerUrl = '';
//   @Input() hideBackNext = false;
//   @Input() stageDocumentData: StageDetailRow[] = [];
//   @Input() stagesDetail: StageDetailRow[] = [];

//   @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
//   @Output() editClick = new EventEmitter<void>();
//   @Output() cancelClick = new EventEmitter<void>();
//   @Output() submitClick = new EventEmitter<void>();
//   @Output() prevClick = new EventEmitter<void>();

//   readonly docKeys: Array<{ key: FileSelectedEvent['key']; label: string; appField: keyof StudentApplication , stage: string}> = [
//     { key: 'fees',    label: 'Fees Proof Document',   appField: 'feesProofFileName' ,stage :'1'},
//     { key: 'resume',  label: 'Resume Document',       appField: 'resumeFileName' ,stage :'1'},
//     { key: 'consent', label: 'Consent Letter',        appField: 'consentLetterFileName' ,stage :'1'},
//     { key: 'passport',label: 'Passport File',         appField: 'passportFileName' ,stage :'1'},
//     { key: 'english', label: 'English Test Proof',    appField: 'englishTestDocumentFile' ,stage :'1'},
//     { key: 'affidavitPath', label: 'Affidavit ',    appField: 'affidavitPath' ,stage :'1'},
//     { key: 'indeminityBondPath', label: 'Indeminity Bond ',    appField: 'indeminityBondPath' ,stage :'1'},
//     { key: 'offerLetterPath', label: 'OfferLetter ',    appField: 'offerLetterPath' ,stage :'2'},
//     { key: 'outBoundTicket', label: 'OutBound Ticket',    appField: 'outBoundTicket' ,stage :'2'},
//     { key: 'returnTicketPath', label: 'Return Ticket',    appField: 'returnTicketPath' ,stage :'2'},
//   ];

//   getFileName(field: keyof StudentApplication): string {
//     console.log(  this.stageDocumentData)
//     console.log(  this.stagesDetail)
//     return (this.stuApplication?.[field] as string) ?? '';
//   }

//   hasFile(field: keyof StudentApplication): boolean {
//     return !!this.getFileName(field);
//   }

//   viewFile(fileName: string): void {
//     if (!fileName) return;
//     window.open(this.localServerUrl + fileName, '_blank');
//   }

//   async onFilePicked(event: Event, key: FileSelectedEvent['key']): Promise<void> {
//     const target = event.target as HTMLInputElement;
//     const raw = target.files?.[0];
//     if (!raw) return;

//     if (raw.size > MAX_FILE_SIZE_BYTES) {
//       Swal.fire({ title: 'File size exceeds 3MB. Please upload a smaller file.', icon: 'warning' });
//       target.value = '';
//       return;
//     }

//     const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
//     const file = safeName !== raw.name ? new File([raw], safeName, { type: raw.type }) : raw;

//     try {
//       const base64 = await this.readAsBase64(file);
//       this.fileSelected.emit({ key, file, base64, fileName: file.name });
//     } catch {
//       Swal.fire({ title: 'Failed to read file', icon: 'error' });
//     }
//   }

//   private readAsBase64(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve((reader.result as string).split(',')[1]);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   }
// }
