import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StageDetailRow, CourseRow, MAX_FILE_SIZE_BYTES } from '../../models/application.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-step-stage2',
  templateUrl: './step-stage2.component.html',
  styleUrls: ['./step-stage2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepStage2Component {
  @Input() stageDocumentData: StageDetailRow[] = [];
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() courseRows: CourseRow[] = [];
  @Input() isSavingCourses = false;
  @Input() localServerUrl = '';
  @Input() isLocked = false;
  @Input() stuApplication: any;
  /** When set, renders only that panel and hides internal tab bar */
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

  get stage1Rows(): StageDetailRow[] {
    return (this.stagesDetail ?? []).filter(r => this.isStage1(r));
  }

  get stage2Rows(): StageDetailRow[] {
    return (this.stagesDetail ?? []).filter(r => this.isStage2(r));
  }

  async onStageFilePicked(event: Event, row: StageDetailRow): Promise<void> {
    const index = this.getRowIndex(row);
    if (index < 0) return;
    const file = await this.sanitizeAndRead(event);
    if (!file) return;
    this.stagesDetail[index].fileName = file.fileName;
    this.stagesDetail[index].fileObject = file.raw;
    this.stageFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
  }

  async onCourseFilePicked(event: Event, index: number): Promise<void> {
    const file = await this.sanitizeAndRead(event);
    if (!file) return;
    this.courseFilePicked.emit({ index, file: file.raw, fileName: file.fileName, base64: file.base64 });
  }

  uploadRow(row: StageDetailRow): void {
    const index = this.getRowIndex(row);
    if (index < 0) return;
    this.uploadStage.emit(index);
  }

  downloadStageFile(row: StageDetailRow, event: Event): void {
    event.preventDefault();
    const index = this.getRowIndex(row);
    if (index < 0) return;
    const liveRow = this.stagesDetail[index];
    if (!liveRow?.fileObject) { Swal.fire('No file available to download'); return; }
    const url = URL.createObjectURL(liveRow.fileObject);
    const a = document.createElement('a');
    a.href = url; a.download = liveRow.fileName || 'download';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  /** Maps Stage I checklist row → already-uploaded file from getStudentDetailsBYId(). */
  existingDocPathFor(row: StageDetailRow): string | null {
    const name = String(row?.documentName ?? '').trim().toLowerCase();
    if (!name || !this.stuApplication) return null;

    const fieldGroups: Array<{ match: (n: string) => boolean; fields: string[] }> = [
      {
        match: n => n.includes('consent'),
        fields: ['consentLetterFileName', 'ConsentLetterFileName', 'consentLetterDocumentPath', 'ConsentLetterDocumentPath'],
      },
      {
        match: n => n.includes('passport'),
        fields: ['passportFileName', 'PassportFileName', 'passportDocumentPath', 'PassportDocumentPath'],
      },
      {
        match: n => n.includes('fees'),
        fields: ['feesProofFileName', 'FeesProofFileName', 'feesProofDocumentPath', 'FeesProofDocumentPath'],
      },
      {
        match: n => n.includes('resume') || n.includes('cv'),
        fields: ['resumeFileName', 'ResumeFileName', 'resumeDocumentPath', 'ResumeDocumentPath'],
      },
      {
        match: n => n.includes('english') || n.includes('test'),
        fields: [
          'englishTestDocumentPath', 'EnglishTestDocumentPath',
          'englishProofFileName', 'EnglishProofFileName',
          'englishTestDocumentFile', 'EnglishTestDocumentFile',
        ],
      },
    ];

    const group = fieldGroups.find(g => g.match(name));
    return group ? this.pickAppField(...group.fields) : null;
  }

  viewExisting(row: StageDetailRow): void {
    const file = this.existingDocPathFor(row);
    if (file) this.viewDocument.emit(file);
  }

  private pickAppField(...keys: string[]): string | null {
    for (const k of keys) {
      const v = this.stuApplication?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
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

  private getRowIndex(row: StageDetailRow): number {
    return (this.stagesDetail ?? []).indexOf(row);
  }

  private isStage1(r: StageDetailRow): boolean {
    const stage = Number((r as any)?.stage);
    const stageName = String((r as any)?.stageName ?? '').toLowerCase();
    const normalized = stageName.replace(/[\s-]/g, '');
    return stage === 11 || normalized === 'stagei';
  }

  private isStage2(r: StageDetailRow): boolean {
    const stage = Number((r as any)?.stage);
    const stageName = String((r as any)?.stageName ?? '').toLowerCase();
    const normalized = stageName.replace(/[\s-]/g, '');
    return stage === 22 || normalized === 'stageii';
  }

  showPanel(panel: 'stage1' | 'stage2' | 'course'): boolean {
    if (this.activePanel) return this.activePanel === panel;
    if (panel === 'stage1') return this.isLocked;
    if (panel === 'course') return !this.isLocked;
    return true;
  }
}
