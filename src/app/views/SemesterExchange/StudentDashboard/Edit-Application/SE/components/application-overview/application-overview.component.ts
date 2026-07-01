import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country, University, StudentApplication, FileSelectedEvent } from '../../models/application.models';

/**
 * "My Application" overview — shows every application section (Academic,
 * Contact, University, Passport/Visa/English/Sponsor, Documents) stacked on
 * a single page, each under its own blue section heading.
 *
 * Read-only by default (used by the Approved page). Set [editable]="true"
 * (used by the Pending page) to allow per-section Edit/Update — no
 * back/next, since every section is already visible at once.
 */
@Component({
  selector: 'app-application-overview',
  templateUrl: './application-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationOverviewComponent {
  @Input() form!: FormGroup;
  @Input() countries: Country[] = [];
  @Input() uniData: University[] = [];
  @Input() stuApplication!: StudentApplication;
  @Input() localServerUrl = '';
  @Input() studentStatus = 'pending';

  /** Allow per-section Edit/Update instead of pure read-only. */
  @Input() editable = false;
  /** Set false when a separate Stage I Documents tab already covers document management (e.g. Pending). */
  @Input() showDocuments = true;
  @Input() isEditingStep: boolean[] = [];
  @Input() isSubmitted = false;
  @Input() isStep1Valid = true;
  @Input() isStep2Valid = true;
  @Input() isStep3Valid = true;

  @Output() editClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() updateClick = new EventEmitter<number>();
  @Output() submitClick = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();

  // ── Academic summary (read-only) ────────────────────────────────────────
  @Input() studentName = '';
  @Input() registrationNo = '';
  @Input() courseName = '';
  @Input() currentYear = '';
  @Input() cgpa = '';
  @Input() programCode = '';
  @Input() sectionCode = '';
  @Input() currentTerm = '';
}
