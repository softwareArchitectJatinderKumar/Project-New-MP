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
  selector: 'app-step-stage2',
  templateUrl: './step-stage2.component.html',
  styleUrls: ['./step-stage2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepStage2Component {
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
    key: 'offerLetter',
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
    key: 'returnTicket',
    label: 'Return Ticket',
    appField: 'returnTicketPath',
    stage: '2',
    documentName: 'Return Ticket'
  }
    ];


  get stage2Rows(): StageDetailRow[] {
    return (this.stagesDetail ?? []).filter(r => {
      const name = String((r as any)?.stageName ?? '').trim().toLowerCase();
      return name === 'stage ii' || name === 'stage2';
    });
  }

  existingDocPathForStage2(row: StageDetailRow): string | null {
    const uploaded = (this.stageDocumentData ?? []).find(
      d => String(d.documentName ?? '').trim().toLowerCase() === String(row.documentName ?? '').trim().toLowerCase()
    );
    return (uploaded && uploaded.document) ? uploaded.document : null;
  }

  viewStage2(row: StageDetailRow): void {
    const file = this.existingDocPathForStage2(row);
    if (file) this.viewDocument.emit(file);
  }

  uploadRow(row: StageDetailRow): void {
    const index = this.getRowIndex(row);
    if (index >= 0) this.uploadStage.emit(index);
  }

  async onStageFilePicked(event: Event, row: StageDetailRow): Promise<void> {
    const index = this.getRowIndex(row);
    if (index < 0) return;
    const file = await this.sanitizeAndRead(event);
    if (!file) return;
    this.stagesDetail[index].fileName = file.fileName;
    this.stagesDetail[index].fileObject = file.raw;
    this.stageFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
    this.uploadStage.emit(index);
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



// import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
// import { StageDetailRow, CourseRow, MAX_FILE_SIZE_BYTES } from '../../models/application.models';
// import Swal from 'sweetalert2';


// @Component({
//   selector: 'app-step-stage2',
//   templateUrl: './step-stage2.component.html',
//   styleUrls: ['./step-stage2.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class StepStage2Component {
//   @Input() stageDocumentData: StageDetailRow[] = [];
//   @Input() stagesDetail: StageDetailRow[] = [];
//   @Input() courseRows: CourseRow[] = [];
//   @Input() isSavingCourses = false;
//   @Input() localServerUrl = '';
//   @Input() isLocked = false;
//   @Input() stuApplication: any;
//   @Input() activePanel: 'stage1' | 'stage2' | 'course' | null = null;
//   @Input() canEditStageDocs = true;
//   @Input() courseMappingDisabled = false;

//   @Output() uploadStage = new EventEmitter<number>();
//   @Output() stageFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
//   @Output() courseFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
//   @Output() addCourseRow = new EventEmitter<void>();
//   @Output() removeCourseRow = new EventEmitter<number>();
//   @Output() saveCourses = new EventEmitter<void>();
//   @Output() viewDocument = new EventEmitter<string>();
//   @Output() prevClick = new EventEmitter<void>();



//   get stage1Rows(): StageDetailRow[] {
//     return (this.stagesDetail ?? []).filter(r => this.isStage1(r));
//   }

//   // get stage2Rows(): StageDetailRow[] {
//   //   return (this.stagesDetail ?? []).filter(r => this.isStage2(r));
//   // }

//   // ==========================================
//   // STAGE I SPECIFIC LOGIC
//   // ==========================================
//   viewStage1(row: StageDetailRow): void {
//     const file = this.existingDocPathForStage1(row);
//     if (file) this.viewDocument.emit(file);
//   }

//   existingDocPathForStage1(row: StageDetailRow): string | null {
//     // const name = String(row?.documentName ?? '').trim().toLowerCase();

//     // if (!name || !this.stuApplication) return null;

//     // const fieldGroups = [
//     //   { match: (n: string) => n.includes('consent'), fields: ['consentLetterFileName', 'consentLetterDocumentPath'] },
//     //   { match: (n: string) => n.includes('passport'), fields: ['passportFileName', 'passportDocumentPath'] },
//     //   { match: (n: string) => n.includes('fees'), fields: ['feesProofFileName', 'feesProofDocumentPath'] },
//     //   { match: (n: string) => n.includes('resume') || n.includes('cv'), fields: ['resumeFileName', 'resumeDocumentPath'] },
//     //   { match: (n: string) => n.includes('english') || n.includes('test'), fields: ['englishTestDocumentPath', 'englishProofFileName'] },
//     // ];

//     // const group = fieldGroups.find(g => g.match(name));
//     // return group ? this.pickAppField(...group.fields) : null;

//     const similarRow = this.stageDocumentData.filter((stageDoc) => stageDoc.documentName == row.documentName)
//     // if (row && row.documentName && typeof row.filePath === 'string' && row.documentName.trim()) {
//     //   return row.documentName.trim();
//     // }
//     return similarRow.length> 0 && similarRow[0].document ? similarRow[0].document : null ;
//     // return null
//   }

//   // ==========================================
//   // STAGE II SPECIFIC LOGIC
//   // ==========================================

//   // get stage2Rows(): StageDetailRow[] {

//   //   // let data = (this.stagesDetail ?? []).filter(r => this.isStage2(r));
//   //   // return data
//   //   return (this.stagesDetail ?? []).filter(r => {
//   //     const name = String(r.stageName ?? '').trim().toLowerCase();
//   //     return name === 'stage ii' || name === 'stage2';
//   //   });
//   // }

//   get stage2Rows(): any[] {
//     // 1. Get the master list of required rows for Stage II
//     const masterStage2 = (this.stagesDetail ?? []).filter(r => {
//       const name = String(r.stageName ?? '').trim().toLowerCase();
//       return name === 'stage ii' || name === 'stage2';
//     });

//     // 2. Map and merge with the uploaded document data passed from parent (stageDocumentData)
//     return masterStage2.map(masterRow => {
//       // Find matching uploaded data by Document Name
//       const uploadedData = (this.stageDocumentData || []).find(
//         uploaded => String(uploaded.documentName).trim().toLowerCase() === String(masterRow.documentName).trim().toLowerCase()
//       );

//       // Return a combined object containing master requirement fields + actual uploaded document strings
//       return {
//         ...masterRow,
//         // If an uploaded record matches, inject its file name string into the row
//         document: uploadedData ? uploadedData.document : masterRow.document || null,
//         applicationId: uploadedData ? uploadedData.applicationId : masterRow.applicationId
//       };
//     });
//   }

//   existingDocPathForStage2(row: any): string | null {
//     if (row && row.document && typeof row.document === 'string' && row.document.trim()) {
//       return row.document.trim();
//     }
//     return null;
//   }

// viewStage2(row: any): void {
//     const file = this.existingDocPathForStage2(row);
//     if (file) {
//       this.viewDocument.emit(file);
//     }
//   }

//   //local path 
// localpath = 'assets/SemesterExchange';

// downloadLocal(docName: string): void {
//   const fileUrl = `${this.localpath}/${docName}`;

//   fetch(fileUrl)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('File not found');
//       }
//       return response.blob();
//     })
//     .then(blob => {
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = docName;
//       document.body.appendChild(a);
//       a.click();

//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     })
//     .catch(err => {
//       console.error('Document not found:', err);
//     });
// }
//   // existingDocPathForStage2(row: any): string | null {
//   //   if (!row) return null;
//   //   if (row.document && typeof row.document === 'string' && row.document.trim()) {
//   //     return row.document.trim();
//   //   }
//   //   if (row.filePath && typeof row.filePath === 'string' && row.filePath.trim()) {
//   //     return row.filePath.trim();
//   //   }
//   //   return null;
//   // }


//   // ==========================================
//   // COMMON / UTILITY METHODS
//   // ==========================================
//   async onStageFilePicked(event: Event, row: StageDetailRow): Promise<void> {
//     const index = this.getRowIndex(row);
//     if (index < 0) return;
//     const file = await this.sanitizeAndRead(event);
//     if (!file) return;
//     this.stagesDetail[index].fileName = file.fileName;
//     this.stagesDetail[index].fileObject = file.raw;
//     this.stageFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
   
//   }

//   async onCourseFilePicked(event: Event, index: number): Promise<void> {
//     const file = await this.sanitizeAndRead(event);
//     if (!file) return;
//     this.courseFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
//   }

//   uploadRow(row: StageDetailRow): void {
//     const index = this.getRowIndex(row);
//     if (index < 0) return;
//     this.uploadStage.emit(index);
//   }

//   downloadStageFile(row: StageDetailRow, event: Event): void {
//     event.preventDefault();
//     const index = this.getRowIndex(row);
//     if (index < 0) return;
//     const liveRow = this.stagesDetail[index];
//     if (!liveRow?.fileObject) { Swal.fire('No file available to download'); return; }
//     const url = URL.createObjectURL(liveRow.fileObject);
//     const a = document.createElement('a');
//     a.href = url; a.download = liveRow.fileName || 'download';
//     document.body.appendChild(a); a.click();
//     document.body.removeChild(a); URL.revokeObjectURL(url);
//   }

//   private pickAppField(...keys: string[]): string | null {
//     for (const k of keys) {
//       const v = this.stuApplication?.[k] || this.stuApplication?.[k.charAt(0).toUpperCase() + k.slice(1)];
//       if (typeof v === 'string' && v.trim()) return v.trim();
//     }
//     return null;
//   }

//   private async sanitizeAndRead(event: Event): Promise<{ raw: File; fileName: string; base64: string } | null> {
//     const target = event.target as HTMLInputElement;
//     const raw = target.files?.[0];
//     if (!raw) return null;
//     if (raw.size > MAX_FILE_SIZE_BYTES) {
//       Swal.fire({ title: 'File size exceeds 3MB', icon: 'warning' });
//       target.value = ''; return null;
//     }
//     const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
//     const file = safeName !== raw.name ? new File([raw], safeName, { type: raw.type }) : raw;
//     const base64 = await new Promise<string>((resolve, reject) => {
//       const r = new FileReader();
//       r.onload = () => resolve((r.result as string).split(',')[1]);
//       r.onerror = reject;
//       r.readAsDataURL(file);
//     });
//     return { raw: file, fileName: file.name, base64 };
//   }

//   private getRowIndex(row: StageDetailRow): number {

//     for(let i = 0 ; i< this.stagesDetail.length ;i++){
//       if(this.stagesDetail[i].id == row.id){
//         return i;
//       }
//     }
//     return -1;
//   }

//   private isStage1(r: StageDetailRow): boolean {
//     const stage = Number((r as any)?.stage);
//     const stageName = String((r as any)?.stageName ?? '').toLowerCase();
//     const normalized = stageName.replace(/[\s-]/g, '');
//     return stage === 11 || normalized === 'stagei';
//   }

// private isStage2(r: StageDetailRow): boolean {
//     const name = String(r?.stageName ?? '').trim().toLowerCase();
//     return name === 'stage ii' || name === 'stage2';
//   }

//   showPanel(panel: 'stage1' | 'stage2' | 'course'): boolean {
//     if (panel === 'stage1') return this.isLocked;
//     if (panel === 'stage2') return this.isLocked; 
//     // if (panel === 'course') return this.isLocked;
//     return true;
//   }
// }
