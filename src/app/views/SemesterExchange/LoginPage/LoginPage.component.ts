import { FormControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import Swal from 'sweetalert2';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { LoginSessionService } from 'src/app/_services/login-session.service';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-LoginPage',
  templateUrl: './LoginPage.component.html',
  styleUrls: ['./LoginPage.component.scss'],
  // standalone: false
})
export class LoginPageNComponent implements OnInit {
  pageTitle = 'Portal';
  registrationNumber: any; regdId: any; DriveDropDown: any; showNoDataFoundMessage: boolean; UserData: any; isLoginFailed: boolean;
  EmployeeDetails: any; EmployeeName: any; EmployeeCode: any; Department: any; DepartmentName: any; loadingIndicator: boolean; CandidateName: any;
  UserId: any; Designation: any; EmailId: any; MobileNo: any; UserRole: any; SupervisorName: any; SecretKey: any; storeResult: number = 0;

  showPassword: boolean = false;
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  constructor(
    private CIFwebService: LpuCIFWebService,
    private storageService: StorageService,
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    private AuthSession: LoginSessionService,
    private router: Router, private route: ActivatedRoute,
    private mouDocumentsService: MouDocumentsService,
    private title: Title
  ) { }

  ngOnInit(): void {
    const stMainElement = document.getElementById('stMain') as HTMLInputElement;
    if (stMainElement) {
      stMainElement.innerHTML = `Semester <span class="text-info">Exchange </span>${this.pageTitle}`;
    }
    const imgLogoElement = document.getElementById('imgLogo') as HTMLImageElement;
    if (imgLogoElement) {
      imgLogoElement.style.width = '164px';
    }

    this.title.setTitle(this.pageTitle);
  }


  formdata = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    UserRoleS: new FormControl('', [Validators.required]),
  })
  get email() {
    return this.formdata.get('Email');
  }
  get passwordText() {
    return this.formdata.get('password')
  }

  OnSubmit() {
    var DataX = this.formdata.value;
    var uid = DataX.Email;
    this.SecretKey = DataX.password;
    this.UserRole = DataX.UserRoleS;
    this.getToken(uid, this.SecretKey, this.UserRole);
  }
  CheckUserType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    // console.log('Selected Role Value:', selectedValue);

    if (selectedValue === '') {
      console.warn('Please select a valid role.');
    } 
  }


  get userRole() {
    return this.formdata.get('UserRoleS');
  }

  getToken(id: any, key: any, Role: any) {
    // this.cookieService.delete('authData');
    // this.AuthSession.clearSession();
    if (Role === 'Staff') {
      this.authService.loginInternalUser(id, key).subscribe({
        next: data => {
          this.storageService.saveUser(data.token);
          this.GetEmployeeDetails();
        },
        error: _err => {
          this.LoginFailed(_err);
        }
      });
    }
    

  }
  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    this.formdata.reset();
  }
 
  GetEmployeeDetails() {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.CandidateName = this.EmployeeName = response.item1[0].employeeName;
          this.UserId = this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.Designation = response.item1[0].department;
          this.EmailId = response.item1[0].email?.length > 3 ? response.item1[0].email : response.item1[0].officialEmailId;
          this.MobileNo = response.item1[0].contactNo;
          this.UserRole = '400000';
          this.SupervisorName = this.EmployeeName;

          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;
          this.isLoginFailed = false;
          var DataX = this.formdata.value;
         

          this.AuthSession.addToSession(this.EmployeeDetails);
 

        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
          this.LoginFailed("Error");
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });

    this.formdata.reset();

  }
  StoreInternalUserInDataBase() {
    const formData = new FormData();
    formData.append("UserEmail", this.EmailId);
    formData.append("CandidateName", this.CandidateName,);
    formData.append("SupervisorName", this.SupervisorName);
    formData.append("MobileNumber", this.MobileNo);
    formData.append("SchoolName", this.Department);
    formData.append("DepartmentName", this.DepartmentName);
    formData.append("IdProofType", 'UMS ID');
    formData.append("IdProofNumber", this.UserId);
    formData.append("UserType", this.UserRole);
    formData.append("Address", 'Internal User');
    formData.append("PasswordText", btoa(this.SecretKey));
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });
    return new Promise<void>((resolve, reject) => {
      this.CIFwebService.NewUserRecord(formData).subscribe({
        next: (data) => {
          let result = data.item1[0]['msg'];
          let errorCode = data.item1[0]['returnId'];

          if (result === 'Success') {
            this.storeResult = 1;
            resolve();
          } else if (result === 'Already Stored') {
            this.storeResult = 2;
            resolve();
          } else if (errorCode === -1) {
            this.storeResult = -1;
            reject('Error in user storage');
          }
        },
        error: (err) => {
          this.storeResult = -1;
          reject(err);
        }
      });
    });
  }

  VisitUrl(Id: any, name: any, Sufix: any) {
    this.router.navigateByUrl(Id + '/' + name + '/' + Sufix).then(() => {
      window.location.reload();
    });
  }

  LogoutUser() {
    this.AuthSession.clearSession(); // if you have a method like this
    this.router.navigateByUrl('/login'); // adjust to your login path
  }

}

