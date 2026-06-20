import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe — Angular memoises the result per unique input string,
 * so template calls like `key | beautifyLabel` never re-run unless
 * the key value itself changes.
 *
 * Declare in your module: `declarations: [BeautifyLabelPipe]`
 */
@Pipe({ name: 'beautifyLabel', pure: true })
export class BeautifyLabelPipe implements PipeTransform {

  private static readonly CUSTOM: Record<string, string> = {
    isVisaRejected:        'Is Visa Rejected?',
    relativeNotApplicable: 'Relative at Abroad',
    sponsorName:           'Sponsor Type',
    acceptPolicy:          'Declaration Statement',
  };

  transform(label: string): string {
    return (
      BeautifyLabelPipe.CUSTOM[label] ??
      label
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace('Id',       'ID')
        .replace('No',       'No.')
        .replace('Upto',     'Up To')
        .replace('Whatsapp', 'WhatsApp')
        .trim()
    );
  }
}
