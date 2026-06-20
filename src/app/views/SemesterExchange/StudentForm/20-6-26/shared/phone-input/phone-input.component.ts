import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  Validator, AbstractControl, ValidationErrors
} from '@angular/forms';

export interface DialEntry { name: string; dial: string; }

export const DIAL_CODES: DialEntry[] = [
  { name: 'Afghanistan',    dial: '+93' },
  { name: 'Albania',        dial: '+355' },
  { name: 'Algeria',        dial: '+213' },
  { name: 'Argentina',      dial: '+54' },
  { name: 'Australia',      dial: '+61' },
  { name: 'Austria',        dial: '+43' },
  { name: 'Bahrain',        dial: '+973' },
  { name: 'Bangladesh',     dial: '+880' },
  { name: 'Belgium',        dial: '+32' },
  { name: 'Brazil',         dial: '+55' },
  { name: 'Canada',         dial: '+1' },
  { name: 'Chile',          dial: '+56' },
  { name: 'China',          dial: '+86' },
  { name: 'Colombia',       dial: '+57' },
  { name: 'Czech Republic', dial: '+420' },
  { name: 'Denmark',        dial: '+45' },
  { name: 'Egypt',          dial: '+20' },
  { name: 'Ethiopia',       dial: '+251' },
  { name: 'Finland',        dial: '+358' },
  { name: 'France',         dial: '+33' },
  { name: 'Germany',        dial: '+49' },
  { name: 'Ghana',          dial: '+233' },
  { name: 'Greece',         dial: '+30' },
  { name: 'Hong Kong',      dial: '+852' },
  { name: 'Hungary',        dial: '+36' },
  { name: 'India',          dial: '+91' },
  { name: 'Indonesia',      dial: '+62' },
  { name: 'Iran',           dial: '+98' },
  { name: 'Iraq',           dial: '+964' },
  { name: 'Ireland',        dial: '+353' },
  { name: 'Israel',         dial: '+972' },
  { name: 'Italy',          dial: '+39' },
  { name: 'Japan',          dial: '+81' },
  { name: 'Jordan',         dial: '+962' },
  { name: 'Kenya',          dial: '+254' },
  { name: 'Kuwait',         dial: '+965' },
  { name: 'Lebanon',        dial: '+961' },
  { name: 'Malaysia',       dial: '+60' },
  { name: 'Mexico',         dial: '+52' },
  { name: 'Morocco',        dial: '+212' },
  { name: 'Myanmar',        dial: '+95' },
  { name: 'Nepal',          dial: '+977' },
  { name: 'Netherlands',    dial: '+31' },
  { name: 'New Zealand',    dial: '+64' },
  { name: 'Nigeria',        dial: '+234' },
  { name: 'Norway',         dial: '+47' },
  { name: 'Oman',           dial: '+968' },
  { name: 'Pakistan',       dial: '+92' },
  { name: 'Philippines',    dial: '+63' },
  { name: 'Poland',         dial: '+48' },
  { name: 'Portugal',       dial: '+351' },
  { name: 'Qatar',          dial: '+974' },
  { name: 'Romania',        dial: '+40' },
  { name: 'Russia',         dial: '+7' },
  { name: 'Saudi Arabia',   dial: '+966' },
  { name: 'Singapore',      dial: '+65' },
  { name: 'South Africa',   dial: '+27' },
  { name: 'South Korea',    dial: '+82' },
  { name: 'Spain',          dial: '+34' },
  { name: 'Sri Lanka',      dial: '+94' },
  { name: 'Sweden',         dial: '+46' },
  { name: 'Switzerland',    dial: '+41' },
  { name: 'Taiwan',         dial: '+886' },
  { name: 'Tanzania',       dial: '+255' },
  { name: 'Thailand',       dial: '+66' },
  { name: 'Turkey',         dial: '+90' },
  { name: 'UAE',            dial: '+971' },
  { name: 'Uganda',         dial: '+256' },
  { name: 'Ukraine',        dial: '+380' },
  { name: 'United Kingdom', dial: '+44' },
  { name: 'United States',  dial: '+1' },
  { name: 'Vietnam',        dial: '+84' },
  { name: 'Yemen',          dial: '+967' },
  { name: 'Zimbabwe',       dial: '+263' },
];

// Subscriber-number digit lengths per country dial code.
// These are the digits AFTER the country code (i.e. the local number, no leading 0).
export const SUBSCRIBER_LENGTHS: Record<string, { min: number; max: number }> = {
  '+93':  { min: 9,  max: 9  },  // Afghanistan
  '+355': { min: 9,  max: 9  },  // Albania
  '+213': { min: 9,  max: 9  },  // Algeria
  '+54':  { min: 10, max: 10 },  // Argentina
  '+61':  { min: 9,  max: 9  },  // Australia
  '+43':  { min: 4,  max: 12 },  // Austria (variable landline/mobile)
  '+973': { min: 8,  max: 8  },  // Bahrain
  '+880': { min: 10, max: 10 },  // Bangladesh
  '+32':  { min: 8,  max: 9  },  // Belgium
  '+55':  { min: 10, max: 11 },  // Brazil (mobile 11, landline 10)
  '+1':   { min: 10, max: 10 },  // Canada / USA
  '+56':  { min: 9,  max: 9  },  // Chile
  '+86':  { min: 7,  max: 11 },  // China (variable)
  '+57':  { min: 10, max: 10 },  // Colombia
  '+420': { min: 9,  max: 9  },  // Czech Republic
  '+45':  { min: 8,  max: 8  },  // Denmark
  '+20':  { min: 10, max: 10 },  // Egypt
  '+251': { min: 9,  max: 9  },  // Ethiopia
  '+358': { min: 5,  max: 12 },  // Finland (variable)
  '+33':  { min: 9,  max: 9  },  // France
  '+49':  { min: 2,  max: 11 },  // Germany (variable)
  '+233': { min: 9,  max: 9  },  // Ghana
  '+30':  { min: 10, max: 10 },  // Greece
  '+852': { min: 8,  max: 8  },  // Hong Kong
  '+36':  { min: 8,  max: 9  },  // Hungary
  '+91':  { min: 10, max: 10 },  // India
  '+62':  { min: 8,  max: 11 },  // Indonesia
  '+98':  { min: 10, max: 10 },  // Iran
  '+964': { min: 10, max: 10 },  // Iraq
  '+353': { min: 7,  max: 9  },  // Ireland
  '+972': { min: 8,  max: 9  },  // Israel
  '+39':  { min: 6,  max: 11 },  // Italy (variable)
  '+81':  { min: 9,  max: 10 },  // Japan
  '+962': { min: 9,  max: 9  },  // Jordan
  '+254': { min: 9,  max: 9  },  // Kenya
  '+965': { min: 8,  max: 8  },  // Kuwait
  '+961': { min: 7,  max: 8  },  // Lebanon
  '+60':  { min: 9,  max: 10 },  // Malaysia
  '+52':  { min: 10, max: 10 },  // Mexico
  '+212': { min: 9,  max: 9  },  // Morocco
  '+95':  { min: 7,  max: 9  },  // Myanmar
  '+977': { min: 9,  max: 10 },  // Nepal
  '+31':  { min: 9,  max: 9  },  // Netherlands
  '+64':  { min: 8,  max: 10 },  // New Zealand
  '+234': { min: 10, max: 10 },  // Nigeria
  '+47':  { min: 8,  max: 8  },  // Norway
  '+968': { min: 8,  max: 8  },  // Oman
  '+92':  { min: 10, max: 10 },  // Pakistan
  '+63':  { min: 10, max: 10 },  // Philippines
  '+48':  { min: 9,  max: 9  },  // Poland
  '+351': { min: 9,  max: 9  },  // Portugal
  '+974': { min: 8,  max: 8  },  // Qatar
  '+40':  { min: 9,  max: 9  },  // Romania
  '+7':   { min: 10, max: 10 },  // Russia
  '+966': { min: 9,  max: 9  },  // Saudi Arabia
  '+65':  { min: 8,  max: 8  },  // Singapore
  '+27':  { min: 9,  max: 9  },  // South Africa
  '+82':  { min: 9,  max: 10 },  // South Korea
  '+34':  { min: 9,  max: 9  },  // Spain
  '+94':  { min: 9,  max: 9  },  // Sri Lanka
  '+46':  { min: 7,  max: 9  },  // Sweden
  '+41':  { min: 9,  max: 9  },  // Switzerland
  '+886': { min: 9,  max: 9  },  // Taiwan
  '+255': { min: 9,  max: 9  },  // Tanzania
  '+66':  { min: 9,  max: 9  },  // Thailand
  '+90':  { min: 10, max: 10 },  // Turkey
  '+971': { min: 9,  max: 9  },  // UAE
  '+256': { min: 9,  max: 9  },  // Uganda
  '+380': { min: 9,  max: 9  },  // Ukraine
  '+44':  { min: 9,  max: 10 },  // United Kingdom
  '+84':  { min: 9,  max: 10 },  // Vietnam
  '+967': { min: 9,  max: 9  },  // Yemen
  '+263': { min: 9,  max: 9  },  // Zimbabwe
};

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
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

  // Dynamic subscriber-length limits based on the selected country
  get lengthRule(): { min: number; max: number } {
    return SUBSCRIBER_LENGTHS[this.selectedDial] ?? { min: 6, max: 12 };
  }

  get maxSubscriberLength(): number {
    return this.lengthRule.max;
  }

  // Human-readable hint shown below the input
  get lengthHint(): string {
    const { min, max } = this.lengthRule;
    return min === max ? `${min} digits` : `${min}–${max} digits`;
  }

  get combinedValue(): string {
    const digits = this.numberPart.replace(/\D/g, '');
    return digits ? `${this.selectedDial}${digits}` : '';
  }

  onDialChange(): void {
    // Trim the subscriber number if it now exceeds the new country's max
    const maxLen = this.lengthRule.max;
    if (this.numberPart.length > maxLen) {
      this.numberPart = this.numberPart.slice(0, maxLen);
    }
    this.onChange(this.combinedValue);
    this.onTouched();
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.lengthRule.max);
    input.value = digits;
    this.numberPart = digits;
    this.onChange(this.combinedValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    if (!value) { this.numberPart = ''; return; }
    // Sort longest-first to avoid ambiguous prefix matches (e.g. +1 vs +1868)
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

  validate(_control: AbstractControl): ValidationErrors | null {
    const digits = this.numberPart.replace(/\D/g, '');
    if (!digits) return null; // empty → valid (optional field support)

    const { min, max } = this.lengthRule;
    if (digits.length < min || digits.length > max) {
      return {
        invalidPhoneLength: {
          expected: min === max ? `${min} digits` : `${min}–${max} digits`,
          actual: digits.length
        }
      };
    }
    return null;
  }
}
