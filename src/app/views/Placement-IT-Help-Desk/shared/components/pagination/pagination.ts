import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Generic client-side pager: "Showing X to Y of Z entries" + prev/next + records-per-page.
 * Angular 14 port note: source uses signal inputs/outputs (`input.required`, `output`) and
 * `computed()`; ported here to classic `@Input`/`@Output` + getters (Angular 14 has no signals).
 */
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  @Input() totalItems!: number;
  @Input() currentPage!: number;
  @Input() pageSize!: number;
  @Input() pageSizeOptions: readonly number[] = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(Number(size));
  }
}
