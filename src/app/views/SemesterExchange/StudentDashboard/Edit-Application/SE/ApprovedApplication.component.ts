import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationStateService, ApplicationStatus } from './application-state.service';

/**
 * Approved application: read-only "My Application" overview plus
 * Stage I / Stage II document tabs.
 */
@Component({
  selector: 'app-approved-application',
  templateUrl: './ApprovedApplication.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class ApprovedApplicationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private loginName!: string;

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

  private redirectIfStatusChanged(status: ApplicationStatus): void {
    if (status === 'Approved') return;
    const routeMap: Record<ApplicationStatus, string> = { Rejected: 'rejected', Approved: 'approved', Pending: 'pending' };
    this.router.navigate(['../', routeMap[status], this.loginName, this.s.RegistrationNo], { relativeTo: this.route });
  }
}
