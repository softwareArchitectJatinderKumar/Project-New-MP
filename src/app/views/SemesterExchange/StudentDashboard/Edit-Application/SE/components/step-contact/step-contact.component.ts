import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country } from '../../models/application.models';

@Component({
  selector: 'app-step-contact',
  templateUrl: './step-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContactComponent {
  @Input() form!: FormGroup;
  @Input() isEditing = false;
  @Input() isSubmitted = false;
  @Input() countries: Country[] = [];
  @Input() isLocked = false;
  @Input() isValid = true;
  @Input() hideBackNext = false;

  @Output() editClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() updateClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();

  get hasRelative(): boolean {
    return this.form.get('HasRelativeDetails')?.value === 'Yes';
  }

  showOptionalRelativeField(controlName: 'RelativeEmail' | 'RelativePhone'): boolean {
    if (this.isEditing) return true;
    return this.hasMeaningfulValue(this.form.get(controlName)?.value);
  }

  private hasMeaningfulValue(value: unknown): boolean {
    const v = String(value ?? '').trim();
    if (!v) return false;
    return !['na', 'n/a', 'none', 'null', '-'].includes(v.toLowerCase());
  }

  trackByCountryName(_: number, item: Country): string {
    return item.name;
  }
}
