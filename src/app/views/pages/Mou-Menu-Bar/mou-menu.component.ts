import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { StorageService } from 'src/app/_services/storage.service';

export interface MouMenu {
  id: number;
  title: string;
  route: string;
  icon: string;
  visible: boolean;
}

@Component({
  selector: 'app-mou-menu',
  templateUrl: './mou-menu.component.html',
  styleUrls: ['./mou-menu.component.css'],
})
export class MouMenuComponent implements OnInit, OnDestroy {
  loginName: string = '';
  employeeCode: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private mouDocumentsService: MouDocumentsService,
  ) {}

  ngOnInit(): void {
    this.extractLoginName();
    this.checkMenuAccess();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  extractLoginName(): void {
    let activeRoute = this.route;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }
    const params = activeRoute.snapshot.params;
    this.loginName = params['loginName'] || params['LoginName'] || '';

    if (!this.loginName) {
      const urlSegments = this.router.url.split('/');
      if (urlSegments.length > 0) {
        const lastSegment = urlSegments[urlSegments.length - 1];
        if (
          lastSegment &&
          !lastSegment.includes('?') &&
          lastSegment !== 'home' &&
          lastSegment !== ''
        ) {
          this.loginName = lastSegment;
        }
      }
    }
  }

  checkMenuAccess(): void {
    // Listen for employee details emitted by any component
    this.mouDocumentsService.employeeDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response && response.item1 && response.item1.length > 0) {
          this.employeeCode = response.item1[0].employeeCode
            ? response.item1[0].employeeCode.toString().trim()
            : '';
          this.updateMenuVisibility();
        }
      });

    // If already logged in with a valid token, ensure details are fetched (cached via shareReplay)
    if (this.storageService.isLoggedIn()) {
      this.mouDocumentsService
        .GetEmployeeDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response && response.item1 && response.item1.length > 0) {
              this.employeeCode = response.item1[0].employeeCode
                ? response.item1[0].employeeCode.toString().trim()
                : '';
            }
            this.updateMenuVisibility();
          },
          error: () => {
            this.updateMenuVisibility();
          },
        });
    }
  }

  updateMenuVisibility(): void {
    const allowedCodes = [
      '31309',
      '34350',
      '16865',
      '29364',
      '31930',
      '31352',
      '30683',
      '22648',
    ];
    const hasFullAccess = allowedCodes.includes(this.employeeCode);

    this.menus.forEach((menu) => {
      if (hasFullAccess) {
        menu.visible = true;
      } else {
        menu.visible =
          menu.route === '/MouNewRequest' ||
          menu.route === '/MouActivityTakeAction' ||
          menu.route === '/ListMous';
      }
    });
  }

  menus: MouMenu[] = [
    {
      id: 1,
      title: 'New MOU Request ',
      route: '/MouNewRequest',
      icon: 'bi bi-house-door-fill',
      visible: true,
    },
    {
      id: 2,
      title: "List of MoU's",
      route: '/ListMous',
      icon: 'bi bi-card-checklist',
      visible: true,
    },
    {
      id: 3,
      title: 'MOU Approval',
      route: '/MouApprovals',
      icon: 'bi bi-check-circle-fill',
      visible: true,
    },
    {
      id: 4,
      title: 'MOU Plan Activity',
      route: '/MouActivityPlan',
      icon: 'bi bi-calendar-event-fill',
      visible: true,
    },
    {
      id: 5,
      title: 'MOU Take Action',
      route: '/MouActivityTakeAction',
      icon: 'bi bi-lightning-charge-fill',
      visible: true,
    },
    {
      id: 6,
      title: 'MOU Activity Approval',
      route: '/MouActivityApprovals',
      icon: 'bi bi-clipboard-check-fill',
      visible: true,
    },
  ];

  navigate(menu: MouMenu): void {
    this.extractLoginName();
    if (this.loginName) {
      this.router.navigate([menu.route, this.loginName]);
    } else {
      this.router.navigate([menu.route]);
    }
  }
}

// import { Component } from '@angular/core';
// import { Router } from '@angular/router';

// export interface MenuItem {
//   title: string;
//   route: string;
//   icon: string;
// }

// @Component({
//   selector: 'app-mou-menu',
//   templateUrl: './mou-menu.component.html',
//   styleUrls: ['./mou-menu.component.css']
// })
// export class MouMenuComponent {

//   constructor(private router: Router) { }

//   menuItems: MenuItem[] = [

//     {
//       title: 'Home',
//       route: '/home',
//       icon: 'bi-house-door-fill'
//     },

//     {
//       title: 'New MOU Request',
//       route: '/new-mou-request',
//       icon: 'bi-file-earmark-plus-fill'
//     },

//     {
//       title: 'MOU Approval',
//       route: '/mou-approval',
//       icon: 'bi-check-circle-fill'
//     },

//     {
//       title: 'MOU Plan Activity',
//       route: '/mou-plan-activity',
//       icon: 'bi-calendar-event-fill'
//     },

//     {
//       title: 'MOU Take Action',
//       route: '/mou-take-action',
//       icon: 'bi-lightning-fill'
//     },

//     {
//       title: 'MOU Activity Approval',
//       route: '/mou-activity-approval',
//       icon: 'bi-clipboard-check-fill'
//     }

//   ];

//   navigate(menu: MenuItem): void {

//     this.router.navigate([menu.route]);

//   }

// }
