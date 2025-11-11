// field-config.interface.ts
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'radio' | 'textarea';
  options?: { label: string; value: any }[]; // Used for radio buttons
  value?: any; // Default value
}