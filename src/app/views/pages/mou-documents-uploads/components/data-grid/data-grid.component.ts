import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mou-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class MouDataGridComponent implements AfterViewInit, OnDestroy {
  /**
   * Optional CSS selector relative to the projected content for the actual
   * element that scrolls horizontally (e.g. '.datatable-body' for ngx-datatable).
   * If empty, the projected container itself is used.
   */
  @Input() scrollTargetSelector: string = '';

  /** Max height for vertical scrolling within the grid. */
  @Input() maxHeight: string = '62vh';

  /** Loading state of the grid data. */
  @Input() loading: boolean = false;

  @ViewChild('topScrollbar', { static: true }) topScrollbar!: ElementRef<HTMLDivElement>;
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef<HTMLDivElement>;

  scrollWidth: number = 0;
  private resizeObserver?: ResizeObserver;
  private syncing: boolean = false;
  private targetElement: HTMLElement | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Wait for the projected content to render
    setTimeout(() => {
      this.setupScrolling();
    }, 200);
  }

  setupScrolling() {
    const container = this.gridContainer.nativeElement;
    
    // Find the scroll target
    if (this.scrollTargetSelector) {
      this.targetElement = container.querySelector(this.scrollTargetSelector) as HTMLElement;
    }
    
    if (!this.targetElement) {
      // Fallback: look for generic table or let container scroll
      const table = container.querySelector('table') as HTMLElement;
      this.targetElement = table ? (table.parentElement || table) : container;
    }

    if (this.targetElement) {
      // Sync scrollbars
      this.targetElement.addEventListener('scroll', this.onBottomScroll);
      this.topScrollbar.nativeElement.addEventListener('scroll', this.onTopScroll);

      // Observe size changes to update scrollbar width
      this.resizeObserver = new ResizeObserver(() => {
        this.updateScrollWidth();
      });
      this.resizeObserver.observe(this.targetElement);
      this.updateScrollWidth();
    }
  }

  private updateScrollWidth() {
    if (this.targetElement) {
      this.scrollWidth = this.targetElement.scrollWidth;
      this.cdr.detectChanges();
    }
  }

  private onTopScroll = () => {
    if (this.syncing || !this.targetElement) return;
    this.syncing = true;
    this.targetElement.scrollLeft = this.topScrollbar.nativeElement.scrollLeft;
    requestAnimationFrame(() => this.syncing = false);
  };

  private onBottomScroll = () => {
    if (this.syncing || !this.targetElement) return;
    this.syncing = true;
    this.topScrollbar.nativeElement.scrollLeft = this.targetElement.scrollLeft;
    requestAnimationFrame(() => this.syncing = false);
  };

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.targetElement) {
      this.targetElement.removeEventListener('scroll', this.onBottomScroll);
    }
    if (this.topScrollbar?.nativeElement) {
      this.topScrollbar.nativeElement.removeEventListener('scroll', this.onTopScroll);
    }
  }
}
