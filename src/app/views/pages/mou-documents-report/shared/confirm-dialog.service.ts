import { Injectable } from '@angular/core';
import swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Centralizes the SweetAlert2 usage that was previously duplicated across
 * every confirm/notify/prompt call in the component. Root-provided so it's
 * tree-shakable and reusable by any other feature that needs the same
 * dialog patterns; swapping the underlying dialog library later only means
 * changing this one file.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  /** Escape hatch for one-off dialogs (custom HTML, input validators, etc.) that don't fit the helpers below. */
  open(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return swal.fire(options);
  }

  /** Yes/No confirmation. Resolves true only when the user confirms. */
  confirm(options: {
    title: string;
    text?: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<boolean> {
    return swal
      .fire({
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        ...options
      })
      .then(result => !!result.value);
  }

  /** Simple title/text/icon notice with a single OK button. */
  notify(title: string, text: string, icon: SweetAlertIcon): Promise<SweetAlertResult> {
    return swal.fire(title, text, icon);
  }

  showLoading(title: string): void {
    swal.fire({ title, didOpen: () => swal.showLoading(null) });
  }

  close(): void {
    swal.close();
  }

  isCancelled(result: SweetAlertResult): boolean {
    return result.dismiss === swal.DismissReason.cancel;
  }
}
