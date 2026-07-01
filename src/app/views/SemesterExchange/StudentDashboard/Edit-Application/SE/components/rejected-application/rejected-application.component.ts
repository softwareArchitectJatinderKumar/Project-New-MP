import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country, University, StudentApplication, FileSelectedEvent } from '../../models/application.models';

/**
 * Shown when an application has been Rejected. Re-uses the same
 * app-step-contact / app-step-university / app-step-details / app-step-documents
 * building blocks the original edit wizard used, with the same back/next +
 * edit/update flow (including document upload) so the student can correct
 * and resubmit. This component is presentational only — every action is
 * emitted back to EditApplicationComponent, which keeps calling the same
 * webapi services (updateApplicationDetails / UpdateDocuments) unchanged.
 */
@Component({
  selector: 'app-rejected-application',
  templateUrl: './rejected-application.component.html',
  styleUrls: ['./rejected-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectedApplicationComponent {
  @Input() studentName = '';
  @Input() registrationNo = '';
  @Input() courseName = '';
  @Input() currentYear = '';
  @Input() cgpa = '';
  @Input() programCode = '';
  @Input() sectionCode = '';
  @Input() currentTerm = '';
  @Input() approvalRemarks = '';

  @Input() stepLabels: string[] = [];
  @Input() currentStep = 1;
  @Input() form!: FormGroup;
  @Input() isEditingStep: boolean[] = [];
  @Input() isSubmitted = false;
  @Input() countries: Country[] = [];
  @Input() uniData: University[] = [];
  @Input() stuApplication!: StudentApplication;
  @Input() localServerUrl = '';
  @Input() isValid = true;

  @Output() goToStep = new EventEmitter<number>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() updateClick = new EventEmitter<number>();
  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
  @Output() submitClick = new EventEmitter<void>();
}
