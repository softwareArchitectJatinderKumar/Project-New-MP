import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-step-nav',
  templateUrl: './step-nav.component.html',
  styleUrls: ['./step-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepNavComponent {
  @Input() isEditing = false;
  @Input() isLocked = false;
  @Input() isValid = true;
  @Input() showBack = true;
  @Input() showNext = true;
  @Input() showEdit = true;

  @Output() editClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() updateClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();
}
