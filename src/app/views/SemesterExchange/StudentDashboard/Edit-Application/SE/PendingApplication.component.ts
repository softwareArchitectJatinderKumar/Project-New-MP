import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationStateService, ApplicationStatus } from './application-state.service';

/**
 * Pending application: nav-tab layout with an editable "My Application"
 * overview and a "Stage I Documents" tab where the student can upload /
 * replace their initial document set (no Stage II tab yet — that only
 * appears once approved).
 */
@Component({
  selector: 'app-pending-application',
  templateUrl: './PendingApplication.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class PendingApplicationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private loginName!: string;

  /** 'application' | 'stage1' — kept local since Pending never shows the Stage II tab. */
  activeTab: 'application' | 'stage1' = 'stage1';

  constructor(
    public s: ApplicationStateService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginName = this.route.snapshot.params['LoginName'];
    const registrationNo = this.route.snapshot.params['RegistrationNo'] ?? null;

    this.s.statusResolved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => this.redirectIfStatusChanged(status));

    if (this.loginName) {
      this.s.init(this.loginName, registrationNo);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: 'application' | 'stage1'): void {
    this.activeTab = tab;
  }

  private redirectIfStatusChanged(status: ApplicationStatus): void {
    if (status === 'Pending') return;
    const routeMap: Record<ApplicationStatus, string> = { Rejected: 'rejected', Approved: 'approved', Pending: 'pending' };
    this.router.navigate(['../', routeMap[status], this.loginName, this.s.RegistrationNo], { relativeTo: this.route });
  }
}
