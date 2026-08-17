import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoadingSpinner } from './components/loading-spinner/loading-spinner';
import { Pagination } from './components/pagination/pagination';

/**
 * Declares/exports the small shared components used by both the help-desk and help-desk-news
 * feature modules (Angular 14 has no standalone-by-default components, so anything not declared
 * in an NgModule can't be used in a template).
 */
@NgModule({
  declarations: [LoadingSpinner, Pagination],
  imports: [CommonModule, FormsModule],
  exports: [LoadingSpinner, Pagination],
})
export class SharedModule {}
