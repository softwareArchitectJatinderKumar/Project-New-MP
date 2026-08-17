import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

import {
  createEmptySearchCriteria,
  HelpDeskSearchCriteria,
} from '../../models/help-desk.model';
import {
  REQUEST_TYPE_OPTIONS,
  SUB_REQUEST_OPTIONS,
  SUBMENU_OPTIONS,
} from '../../models/help-desk.constants';

/**
 * Collapsible advanced-search filter bar for the "Show Requests" tab.
 * Angular 14 port note: source uses `signal`/`computed`/`output()`; ported to a plain property,
 * getters, and `@Output()` + `EventEmitter` (Angular 14 has no signals API).
 */
@Component({
  selector: 'app-advanced-search-panel',
  templateUrl: './advanced-search-panel.html',
  styleUrls: ['./advanced-search-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchPanel {
  @Output() apply = new EventEmitter<HelpDeskSearchCriteria>();
  @Output() reset = new EventEmitter<void>();

  protected readonly requestForOptions = REQUEST_TYPE_OPTIONS;

  protected criteria: HelpDeskSearchCriteria = createEmptySearchCriteria();

  protected get subjectOptions(): readonly string[] {
    return SUB_REQUEST_OPTIONS[this.criteria.requestFor] ?? [];
  }

  protected get submenuOptions(): readonly string[] {
    return SUBMENU_OPTIONS[this.criteria.requestFor] ?? [];
  }

  protected get hasCriteria(): boolean {
    return Object.values(this.criteria).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      return true;
    });
  }

  updateField<K extends keyof HelpDeskSearchCriteria>(
    field: K,
    value: HelpDeskSearchCriteria[K],
  ): void {
    const next = { ...this.criteria, [field]: value };
    if (field === 'requestFor') {
      next.subject = '';
      next.submenu = '';
    }
    this.criteria = next;
  }

  onApply(): void {
    this.apply.emit(this.criteria);
  }

  onReset(): void {
    this.criteria = createEmptySearchCriteria();
    this.reset.emit();
  }
}
