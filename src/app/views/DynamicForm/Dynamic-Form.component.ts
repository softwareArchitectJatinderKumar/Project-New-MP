// dynamic-form/dynamic-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from './Field-config';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.html',
  styleUrls: ['./dynamic-form.component.css'],
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  public form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.createFormGroup();
  }

  // 1. Dynamic FormGroup Creator
  private createFormGroup(): FormGroup {
    const group: any = {};
    this.fields.forEach((field) => {
      // **All Fields are REQUIRED** (per requirement)
      const control = this.fb.control(field.value || '', Validators.required);
      group[field.name] = control;
    });
    return this.fb.group(group);
  }

  // 2. Submit Handler
  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
    } else {
      // Optional: Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
    }
  }

  // 3. Cancel Handler
  onCancel() {
    this.cancelled.emit();
  }
}