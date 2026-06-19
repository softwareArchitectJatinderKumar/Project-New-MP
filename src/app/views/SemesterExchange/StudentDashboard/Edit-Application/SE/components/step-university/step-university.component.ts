import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { University } from '../../models/application.models';

@Component({
  selector: 'app-step-university',
  templateUrl: './step-university.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepUniversityComponent {
  @Input() form!: FormGroup;
  @Input() isEditing = false;
  @Input() isSubmitted = false;
  @Input() uniData: University[] = [];
  @Input() isLocked = false;
  @Input() isValid = true;

  @Output() editClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() updateClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();

  get passportStatus(): string {
    return this.form.get('PassportStatus')?.value ?? '';
  }

  get uni1(): string { return this.form.get('UniversityOption1')?.value ?? ''; }
  get uni2(): string { return this.form.get('UniversityOption2')?.value ?? ''; }

  trackByUniversityName(_: number, item: University): string {
    return item.universityName;
  }
}
