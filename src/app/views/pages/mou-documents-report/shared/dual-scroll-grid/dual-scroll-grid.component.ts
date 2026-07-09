import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopScrollSyncDirective } from '../top-scroll-sync.directive';

/**
 * Reusable grid shell that adds a scrollbar mirrored at the TOP of any
 * wide, horizontally-scrollable grid (in addition to the native one at the
 * bottom) and keeps a vertical scrollbar reachable without scrolling the
 * whole page. Drop any grid — ngx-datatable, a plain <table>, anything —
 * inside via content projection; nothing about this component is tied to
 * a specific grid library.
 *
 * Standalone, so any module (or another standalone component) can import
 * it directly without extra NgModule wiring.
 *
 * Usage:
 *   <app-dual-scroll-grid scrollTargetSelector=".datatable-body">
 *     <ngx-datatable ...></ngx-datatable>
 *   </app-dual-scroll-grid>
 *
 *   <app-dual-scroll-grid>          <!-- host content itself scrolls -->
 *     <table>...</table>
 *   </app-dual-scroll-grid>
 */
@Component({
  selector: 'app-dual-scroll-grid',
  standalone: true,
  imports: [CommonModule, TopScrollSyncDirective],
  templateUrl: './dual-scroll-grid.component.html',
  styleUrls: ['./dual-scroll-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DualScrollGridComponent {
  /**
   * CSS selector (relative to the projected content) for the element that
   * actually scrolls horizontally. Leave empty when the projected content
   * itself is the scrollable element (e.g. a plain <table> wrapper).
   */
  @Input() scrollTargetSelector = '';

  /** Caps the grid's vertical scroll area so the page doesn't grow unbounded. */
  @Input() maxHeight = '62vh';

  /** Set false to opt a plain-scrolling grid (e.g. a native <table>) into horizontal auto-scroll on the shell itself. */
  @Input() nativeHorizontalScroll = false;
}
