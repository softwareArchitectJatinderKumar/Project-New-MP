import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  @Input() title!: string;
  @Input() isEditing = false;
}
