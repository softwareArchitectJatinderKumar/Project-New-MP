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

  @Output() uploadStage = new EventEmitter<number>();
  @Output() stageFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() courseFilePicked = new EventEmitter<{ index: number; file: File; fileName: string; base64: string }>();
  @Output() addCourseRow = new EventEmitter<void>();
  @Output() removeCourseRow = new EventEmitter<number>();
  @Output() saveCourses = new EventEmitter<void>();
  @Output() viewDocument = new EventEmitter<string>();
  @Output() prevClick = new EventEmitter<void>();

  async onStageFilePicked(event: Event, index: number): Promise<void> {
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

  downloadStageFile(index: number, event: Event): void {
    event.preventDefault();
    const row = this.stagesDetail[index];
    if (!row?.fileObject) { Swal.fire('No file available to download'); return; }
    const url = URL.createObjectURL(row.fileObject);
    const a = document.createElement('a');
    a.href = url; a.download = row.fileName || 'download';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
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
}
