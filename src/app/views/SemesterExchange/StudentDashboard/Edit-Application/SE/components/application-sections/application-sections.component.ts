import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  Country, University, StudentApplication, StageDetailRow, FileSelectedEvent,
} from '../../models/application.models';

/**
 * Edit / update wizard for the application sections (Academic, Contact,
 * University, Passport/Visa/English/Sponsor, Documents) — one section
 * visible at a time, with Back / Next navigation between them.
 *
 * Purely presentational: all webapi calls stay in the parent component,
 * this component only forwards user actions via outputs.
 */
@Component({
  selector: 'app-application-sections',
  templateUrl: './application-sections.component.html',
  styleUrls: ['./application-sections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSectionsComponent {
  @Input() form!: FormGroup;
  @Input() isEditingStep: boolean[] = [];
  @Input() isSubmitted = false;
  @Input() countries: Country[] = [];
  @Input() uniData: University[] = [];
  @Input() stuApplication!: StudentApplication;
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() currentStep = 0;
  @Input() stepLabels: string[] = [];
  @Input() localServerUrl = '';
  @Input() studentStatus = 'pending';

  @Input() isStep1Valid = true;
  @Input() isStep2Valid = true;
  @Input() isStep3Valid = true;

  // ── Academic summary (read-only) ────────────────────────────────────────
  @Input() studentName = '';
  @Input() registrationNo = '';
  @Input() courseName = '';
  @Input() currentYear = '';
  @Input() cgpa = '';
  @Input() programCode = '';
  @Input() sectionCode = '';
  @Input() currentTerm = '';

  @Output() goToStepClick = new EventEmitter<number>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() updateClick = new EventEmitter<number>();
  @Output() submitClick = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();

  get isRejected(): boolean {
    return this.stuApplication?.isLocked === 'False' || (this.stuApplication?.isLocked as any) === '0';
  }
}
