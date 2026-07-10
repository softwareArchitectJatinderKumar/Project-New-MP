import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
  styleUrls: ['./mou-menu.component.css']
})
export class MouMenuComponent {

  constructor(private router: Router) { }

  menus: MouMenu[] = [
    {
      id: 1,
      title: 'Home',
      route: '/home',
      icon: 'bi bi-house-door-fill',
      visible: true
    },
    {
      id: 2,
      title: 'New MOU Request',
      route: '/new-mou-request',
      icon: 'bi bi-file-earmark-plus-fill',
      visible: true
    },
    {
      id: 3,
      title: 'MOU Approval',
      route: '/mou-approval',
      icon: 'bi bi-check-circle-fill',
      visible: true
    },
    {
      id: 4,
      title: 'MOU Plan Activity',
      route: '/mou-plan-activity',
      icon: 'bi bi-calendar-event-fill',
      visible: true
    },
    {
      id: 5,
      title: 'MOU Take Action',
      route: '/mou-take-action',
      icon: 'bi bi-lightning-charge-fill',
      visible: true
    },
    {
      id: 6,
      title: 'MOU Activity Approval',
      route: '/mou-activity-approval',
      icon: 'bi bi-clipboard-check-fill',
      visible: true
    }
  ];

  navigate(menu: MouMenu): void {
    this.router.navigate([menu.route]);
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