import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinner {
  @Input() message = 'Loading...';
}
