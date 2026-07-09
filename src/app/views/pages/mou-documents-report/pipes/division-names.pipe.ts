import { Pipe, PipeTransform } from '@angular/core';

import { SchoolDivision } from '../models/mou-document.model';

/**
 * Resolves a comma-separated list of division ids (as stored on
 * `schoolDivisionInvolved`) into display names.
 *
 * Pure by default, so Angular only re-evaluates it when its inputs change
 * by reference — a measurable win over calling a lookup method from inside
 * a `*ngFor` in the template, which reruns on every change-detection pass
 * for every row and every column.
 *
 * Standalone so it can be imported directly wherever it's needed.
 */
@Pipe({
  name: 'divisionNames',
  standalone: true,
  pure: true
})
export class DivisionNamesPipe implements PipeTransform {
  transform(
    schoolDivisionInvolved: string | null | undefined,
    allDivisions: SchoolDivision[] | null | undefined
  ): string[] {
    if (!schoolDivisionInvolved || !allDivisions?.length) {
      return [];
    }
    return schoolDivisionInvolved.split(',').map(idStr => this.resolveName(idStr, allDivisions));
  }

  private resolveName(idStr: string, allDivisions: SchoolDivision[]): string {
    const id = Number(idStr);
    const division = allDivisions.find(school => +school.id === id);
    return division ? division.schoolDivision : `ID ${idStr} not found`;
  }
}
