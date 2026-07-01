import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Country, SelectOption, ENGLISH_OPTIONS, ENGLISH_TEST_NAMES, AVAILABLE_FUNDS_OPTIONS } from '../../models/application.models';

@Component({
  selector: 'app-step-details',
  templateUrl: './step-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDetailsComponent {
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

  readonly englishOptions: SelectOption[] = ENGLISH_OPTIONS;
  readonly englishTestNames: string[] = ENGLISH_TEST_NAMES;
  readonly availableFundsOptions: SelectOption[] = AVAILABLE_FUNDS_OPTIONS;

  get visaRejected(): boolean {
    return this.form.get('IsVisaRejected')?.value === 'Yes';
  }

  get englishTestType(): string {
    return this.form.get('EnglishTestType')?.value ?? '';
  }

  get hasEnglishYear(): boolean {
    return !!this.form.get('EnglishTestYear')?.value;
  }

  /** Hides sponsor name/relation/email/phone when sponsor is Parents */
  get showSponsorDetails(): boolean {
    const val = (this.form.get('SponsorType')?.value ?? '').trim().toLowerCase();
    return !!val && val !== 'parents' && val !== 'parent';
  }

  showOptionalSponsorField(controlName: 'SponsorName' | 'SponsorRelation' | 'SponsorEmail' | 'SponsorContact'): boolean {
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
