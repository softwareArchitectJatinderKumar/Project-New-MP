import { Pipe, PipeTransform } from '@angular/core';

/**
 * RoleFilterPipe
 *
 * Filters an array of Application objects by a per-row boolean flag set
 * during enrichAndFilterApplications().
 *
 * Usage in template:
 *   [rows]="visibleApplications | roleFilter:'_isCounsellor'"
 *   [rows]="visibleApplications | roleFilter:'_isFaculty'"
 *   [rows]="visibleApplications | roleFilter:'_isHoW'"
 *
 * Because visibleApplications is a flat union of all non-HOD rows for the
 * logged-in user, each dashboard section uses this pipe to show only the
 * rows that belong to it — without creating separate arrays in the component.
 *
 * Register in your module:
 *   declarations: [ RoleFilterPipe ]
 *   exports:      [ RoleFilterPipe ]   // if shared across modules
 */
@Pipe({
  name: 'roleFilter',
  pure: true,   // pure = re-evaluates only when reference changes (safe here
                // because buildVisibleApplications() always returns a new array)
})
export class RoleFilterPipe implements PipeTransform {
  transform(items: any[], flag: string): any[] {
    if (!items?.length || !flag) return items ?? [];
    return items.filter(item => !!item[flag]);
  }
}
