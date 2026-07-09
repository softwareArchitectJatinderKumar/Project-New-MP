/**
 * Pure, presentation-agnostic helpers shared by the MOU report grid and
 * its filters. Kept free of component state so they're independently
 * testable and reusable wherever the same rules apply.
 */

/**
 * True when any field on `record` contains `query` (case-insensitive).
 * `id` gets special handling so a search for "12" or "mou/12" also matches
 * a row whose numeric id is 12.
 */
export function matchesSearchQuery(record: Record<string, unknown>, query: string): boolean {
  return Object.entries(record).some(([key, val]) => {
    if (val === null || val === undefined) {
      return false;
    }
    const valueString = String(val).toLowerCase();

    if (key === 'id') {
      const numericId = Number(val);
      if (!isNaN(numericId) && (numericId.toString().includes(query) || `mou/${numericId}`.includes(query))) {
        return true;
      }
    }
    return valueString.includes(query);
  });
}

/**
 * Derives the lifecycle status of an MOU from its date range.
 * Indefinite MOUs are always Active; a missing start date is always
 * Expired; otherwise Active while `today` falls within [start, end]
 * (or there is no end date at all).
 */
export function computeMouStatus(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  isIndefinite: boolean
): 'Active' | 'Expired' {
  if (isIndefinite) {
    return 'Active';
  }

  const start = startDate ? new Date(startDate) : null;
  if (!start) {
    return 'Expired';
  }

  const end = endDate ? new Date(endDate) : null;
  const today = new Date();
  return !end || (today >= start && today <= end) ? 'Active' : 'Expired';
}

/**
 * Fields excluded from the auto-generated "extra" grid columns because
 * they already have a dedicated, hand-authored column/handler.
 */
export const EXCLUDED_DYNAMIC_COLUMNS: ReadonlySet<string> = new Set([
  'fileName', 'newMouId', 'mouPartnerName', 'mouUploadedBy', 'mouUploadedByUID',
  'mouApprovedBy', 'mouEndDate', 'mouStartDate', 'mouStatus', 'filePath', 'uid',
  'updatedOn', 'facultyName', 'mouTitle', 'spocContactNo', 'spocName', 'spocEmailId',
  'mouPartner', 'createdOn', 'createdBy', 'ipAddress', 'updatedBy', 'disapprovalReason',
  'approvedBy', 'isActive', 'isApproved', 'approvalDate', 'schoolDivisionInvolved',
  'mouId', 'id', 'activityStartDate', 'activityEndDate', 'assignedBy', 'assignedTo'
]);

/** Formats any date-ish value as an `<input type="date">`-compatible `yyyy-MM-dd` string. */
export function toDateInputValue(date: unknown): string {
  if (!date) {
    return '';
  }
  const parsed = new Date(date as string | number | Date);
  if (isNaN(parsed.getTime())) {
    return '';
  }
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return [parsed.getFullYear(), month, day].join('-');
}
