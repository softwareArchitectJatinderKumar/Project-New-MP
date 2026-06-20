import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  Validator, AbstractControl, ValidationErrors
} from '@angular/forms';

export interface DialEntry { name: string; dial: string; }

export const DIAL_CODES: DialEntry[] = [
  { name: 'Afghanistan', dial: '+93' },
  { name: 'Albania', dial: '+355' },
  { name: 'Algeria', dial: '+213' },
  { name: 'Argentina', dial: '+54' },
  { name: 'Australia', dial: '+61' },
  { name: 'Austria', dial: '+43' },
  { name: 'Bahrain', dial: '+973' },
  { name: 'Bangladesh', dial: '+880' },
  { name: 'Belgium', dial: '+32' },
  { name: 'Brazil', dial: '+55' },
  { name: 'Canada', dial: '+1' },
  { name: 'Chile', dial: '+56' },
  { name: 'China', dial: '+86' },
  { name: 'Colombia', dial: '+57' },
  { name: 'Czech Republic', dial: '+420' },
  { name: 'Denmark', dial: '+45' },
  { name: 'Egypt', dial: '+20' },
  { name: 'Ethiopia', dial: '+251' },
  { name: 'Finland', dial: '+358' },
  { name: 'France', dial: '+33' },
  { name: 'Germany', dial: '+49' },
  { name: 'Ghana', dial: '+233' },
  { name: 'Greece', dial: '+30' },
  { name: 'Hong Kong', dial: '+852' },
  { name: 'Hungary', dial: '+36' },
  { name: 'India', dial: '+91' },
  { name: 'Indonesia', dial: '+62' },
  { name: 'Iran', dial: '+98' },
  { name: 'Iraq', dial: '+964' },
  { name: 'Ireland', dial: '+353' },
  { name: 'Israel', dial: '+972' },
  { name: 'Italy', dial: '+39' },
  { name: 'Japan', dial: '+81' },
  { name: 'Jordan', dial: '+962' },
  { name: 'Kenya', dial: '+254' },
  { name: 'Kuwait', dial: '+965' },
  { name: 'Lebanon', dial: '+961' },
  { name: 'Malaysia', dial: '+60' },
  { name: 'Mexico', dial: '+52' },
  { name: 'Morocco', dial: '+212' },
  { name: 'Myanmar', dial: '+95' },
  { name: 'Nepal', dial: '+977' },
  { name: 'Netherlands', dial: '+31' },
  { name: 'New Zealand', dial: '+64' },
  { name: 'Nigeria', dial: '+234' },
  { name: 'Norway', dial: '+47' },
  { name: 'Oman', dial: '+968' },
  { name: 'Pakistan', dial: '+92' },
  { name: 'Philippines', dial: '+63' },
  { name: 'Poland', dial: '+48' },
  { name: 'Portugal', dial: '+351' },
  { name: 'Qatar', dial: '+974' },
  { name: 'Romania', dial: '+40' },
  { name: 'Russia', dial: '+7' },
  { name: 'Saudi Arabia', dial: '+966' },
  { name: 'Singapore', dial: '+65' },
  { name: 'South Africa', dial: '+27' },
  { name: 'South Korea', dial: '+82' },
  { name: 'Spain', dial: '+34' },
  { name: 'Sri Lanka', dial: '+94' },
  { name: 'Sweden', dial: '+46' },
  { name: 'Switzerland', dial: '+41' },
  { name: 'Taiwan', dial: '+886' },
  { name: 'Tanzania', dial: '+255' },
  { name: 'Thailand', dial: '+66' },
  { name: 'Turkey', dial: '+90' },
  { name: 'UAE', dial: '+971' },
  { name: 'Uganda', dial: '+256' },
  { name: 'Ukraine', dial: '+380' },
  { name: 'United Kingdom', dial: '+44' },
  { name: 'United States', dial: '+1' },
  { name: 'Vietnam', dial: '+84' },
  { name: 'Yemen', dial: '+967' },
  { name: 'Zimbabwe', dial: '+263' },
];

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {
  @Input() placeholder = 'Enter phone number';

  readonly dialCodes = DIAL_CODES;
  selectedDial = '+91';
  numberPart = '';
  isDisabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get combinedValue(): string {
    const digits = this.numberPart.replace(/\D/g, '');
    return digits ? `${this.selectedDial}${digits}` : '';
  }

  onDialChange(): void {
    this.onChange(this.combinedValue);
    this.onTouched();
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    input.value = digits;
    this.numberPart = digits;
    this.onChange(this.combinedValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    if (!value) { this.numberPart = ''; return; }
    const sorted = [...this.dialCodes].sort((a, b) => b.dial.length - a.dial.length);
    const match = sorted.find(d => value.startsWith(d.dial));
    if (match) {
      this.selectedDial = match.dial;
      this.numberPart = value.slice(match.dial.length);
    } else {
      this.numberPart = value.replace(/^\+?/, '');
    }
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }

  validate(control: AbstractControl): ValidationErrors | null {
    const val: string = control.value || '';
    if (!val) return null;
    const digits = val.replace(/^\+/, '');
    if (!/^\d+$/.test(digits) || digits.length < 8 || digits.length > 14) {
      return { invalidPhoneLength: true };
    }
    return null;
  }
}
