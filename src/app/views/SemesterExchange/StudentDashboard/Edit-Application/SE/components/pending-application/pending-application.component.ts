import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country, University, StudentApplication, StageDetailRow, FileSelectedEvent, DocumentApproval } from '../../models/application.models';
import Swal from 'sweetalert2';

/**
 * Shown while an application is Pending (not yet locked/decided). Presents
 * the application as its own step-by-step wizard (Academic Summary -> Contact
 * -> University -> Passport/Visa/English/Sponsor -> Documents) with
 * Back/Next plus per-section Edit/Update, alongside a "Stage I Documents"
 * nav tab. Step/tab navigation state is kept local to this component (it
 * never overlaps with RejectedApplicationComponent's wizard, since only one
 * of the two is ever rendered at a time) so a short loading transition can
 * be shown whenever the visible section changes, without touching the
 * Rejected flow. All edits/uploads are still emitted up to
 * EditApplicationComponent, which owns every webapi call unchanged.
 */
@Component({
  selector: 'app-pending-application',
  templateUrl: './pending-application.component.html',
  styleUrls: ['./pending-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingApplicationComponent {
  @Input() studentName = '';
  @Input() registrationNo = '';
  @Input() courseName = '';
  @Input() currentYear = '';
  @Input() cgpa = '';
  @Input() programCode = '';
  @Input() sectionCode = '';
  @Input() currentTerm = '';

  @Input() stepLabels: string[] = [];

  @Input() form!: FormGroup;
  @Input() isEditingStep: boolean[] = [];
  @Input() isSubmitted = false;
  @Input() countries: Country[] = [];
  @Input() uniData: University[] = [];
  @Input() stuApplication!: StudentApplication;
  @Input() localServerUrl = '';
  @Input() isValid1 = true;
  @Input() isValid2 = true;
  @Input() isValid3 = true;
  @Input() stagesDetail: StageDetailRow[] = [];
  @Input() documentApprovals: DocumentApproval[] = [];

  @Output() editClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() updateClick = new EventEmitter<number>();
  @Output() fileSelected = new EventEmitter<FileSelectedEvent>();
  @Output() submitClick = new EventEmitter<void>();

  activeTab: 'application' | 'stage1' = 'application';
  currentStep = 0;
  /** Drives the transition loader shown while moving between wizard steps or nav tabs. */
  isSwitching = false;

  private readonly transitionDelayMs = 350;

  constructor(private cdr: ChangeDetectorRef) {}

  nextStep(): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving on.', 'warning');
      return;
    }
    const maxStep = (this.stepLabels.length || 5) - 1;
    if (this.currentStep >= maxStep) return;
    this.switchStep(this.currentStep + 1);
  }

  prevStep(): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before moving back.', 'warning');
      return;
    }
    if (this.currentStep <= 0) return;
    this.switchStep(this.currentStep - 1);
  }

  goToStep(index: number): void {
    if (this.isEditingStep[this.currentStep]) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before navigating.', 'warning');
      return;
    }
    if (index <= this.currentStep && index !== this.currentStep) {
      this.switchStep(index);
    }
  }

  setTab(tab: 'application' | 'stage1'): void {
    if (tab === this.activeTab) return;
    if (this.isEditingStep.some(e => e)) {
      Swal.fire('Please Update or Cancel', 'Save or cancel changes before switching tabs.', 'warning');
      return;
    }
    this.isSwitching = true;
    setTimeout(() => {
      this.activeTab = tab;
      this.isSwitching = false;
      // Required with OnPush: this callback runs outside any template event,
      // so the view won't otherwise re-render and the loader would stay stuck on screen.
      this.cdr.markForCheck();
    }, this.transitionDelayMs);
  }

  private switchStep(index: number): void {
    this.isSwitching = true;
    setTimeout(() => {
      this.currentStep = index;
      this.isSwitching = false;
      // Required with OnPush: this callback runs outside any template event,
      // so the view won't otherwise re-render and the loader would stay stuck on screen.
      this.cdr.markForCheck();
    }, this.transitionDelayMs);
  }
}
