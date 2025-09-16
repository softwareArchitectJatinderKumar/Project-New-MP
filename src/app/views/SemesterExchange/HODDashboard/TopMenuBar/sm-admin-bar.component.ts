// import { ActivatedRoute } from '@angular/router';
// import { Title } from '@angular/platform-browser';

// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import { Router } from '@angular/router';
// import { Component, OnInit } from '@angular/core';
// import swal from 'sweetalert2';

// import { UntypedFormBuilder } from '@angular/forms';

// @Component({
//   selector: 'app-sm-admin-bar',
//   templateUrl: './sm-admin-bar.component.html',
//   styleUrls: ['./sm-admin-bar.component.scss']
// })
// export class SemesterMigrationAdminComponent implements OnInit {

//   Stages: any[] = ['1', '2', '3', '4', '5', '6', '7', '8']; // Stage for sending the inner component
//   LoginStatus: boolean = false;
//   loading: boolean = true;  // Loading flag to handle async login

//   pageTitle = 'Semester Exchange <span class="themeClr"> Admin Panel </span>';
//   logoWidth = '164px';

//   loginName: any;

//   constructor(
//     private storageService: StorageService,
//     private authService: AuthService,
//     private route: ActivatedRoute,
//     public formBuilder: UntypedFormBuilder,
//     private router: Router,
//     private title: Title
//   ) { }

//   encryptStageId(stageId: number): string {
//     return btoa(stageId.toString());
//   }

//   navigateToStageDocuments(stage: number) {
//     this.router.navigateByUrl('/StageWiseList/' + stage);
//   }

//   goto(val: any) {
//     this.router.navigateByUrl(val);
//   }

//   ngOnInit(): void {
//         (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester Exchange <span class="themeClr"> Admin Panel </span>';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     this.title.setTitle("Semester Exchange Approvals");

//     const loginName = this.route.snapshot.params['loginName'];
//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//     }
//     else {
//       let vl = this.storageService.getUser ();
//       if (vl != null && vl != undefined) {
//         this.LoginStatus = true;
//         this.loading = false;
//       }
//       else {
//         this.LoginStatus = false;
//         this.loading = false;
//         swal.fire({
//           title: 'Login Failed Kindly login Again!',
//           icon: 'error'
//         });
//         setTimeout(() => {
//           window.location.href = 'https://ums.lpu.in/lpuums';
//         }, 2500);
//       }
//     }
//   }

//   getToken(id: string): void {
//     this.authService.loginTemp(id).subscribe({
//       next: (data: any) => {
//         this.storageService.saveUser (data);
//         this.loginName = id;
//         this.LoginStatus = true;
//         this.loading = false;
//       },
//       error: () => {
//         this.LoginStatus = false;
//         this.loading = false;
//         swal.fire({
//           title: 'Login Failed Kindly login Again!',
//           icon: 'error'
//         });
//         setTimeout(() => {
//           window.location.href = 'https://ums.lpu.in/lpuums';
//         }, 1000);
//       },
//     });
//   }

// }


import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';

import { UntypedFormBuilder } from '@angular/forms';



@Component({
  selector: 'app-sm-admin-bar',
  templateUrl: './sm-admin-bar.component.html',
  styleUrls: ['./sm-admin-bar.component.scss']
})
export class SemesterMigrationAdminComponent implements OnInit {

  Stages: any[] = ['1', '2', '3', '4', '5', '6', '7', '8']; // Stage for sending the inner component
  LoginStatus: boolean = false;
  public isBasicExampleMenuCollapsed = true;

  defaultNavbarCode: any;
  navbarBrandCode: any;
  brandImageCode: any;
  brandImageTextCode: any;
  navbarFormCode: any;
  navbarTextCode: any;
  navbarColorCode: any;
  navbarTogglerCode: any;
  registrationNo: any;
  loginName: any;
  // router: any;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private title: Title
  ) { }

  encryptStageId(stageId: number): string {
    return btoa(stageId.toString());
  }
  navigateToStageDocuments(stage: number) {
    this.router.navigateByUrl('/StageWiseList/' + stage);
  }


 
  gotoWithToken(route: string, LoginName: string) {
    this.router.navigate([`${route}/${LoginName}`]);
  }
  
  
  goto(route: string) {
    this.router.navigate([route]);
  }
  

  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'Semester Exchange <span class="themeClr"> Admin Panel </span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    this.title.setTitle("Semester Exchange Admin Panel");

    const loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
    else {
      let vl = this.storageService.getUser();
      if (vl != null || vl != undefined) {
        this.LoginStatus = true;
      }
      else {
        this.LoginStatus = false;
        swal.fire({
          title: 'Login Failed Kindly login Again!',
          icon: 'error'
        });
        setTimeout(() => {
          window.location.href = 'https://ums.lpu.in/lpuums';
        }, 25000);
      }
    }

  }
  getToken(id: string): void {
    this.authService.loginTemp(id).subscribe({
      next: (data: any) => {
        this.storageService.saveUser(data);
        this.loginName = id;
        this.LoginStatus = true;
      },
      error: () => {
        this.LoginStatus = false;

        swal.fire({
          title: 'Login Failed Kindly login Again!',
          icon: 'error'
        });
        setTimeout(() => {
          window.location.href = 'https://ums.lpu.in/lpuums';
        }, 1000);
      },
    });
  }

}

