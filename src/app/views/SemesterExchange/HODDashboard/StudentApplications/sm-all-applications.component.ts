import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

@Component({
  selector: 'app-sm-all-applications',
  templateUrl: './sm-all-applications.component.html',
  styleUrls: ['./sm-all-applications.component.scss']
})
export class SmAllApplicationsComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['registrationNo', 'whatsAppNo', 'contactNo', 'emailId', 'isRejected', 'viewDetails'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('dataTable') table: ElementRef;
  Logincheck: boolean = false;
  stuApplication: any[] = [];
  filteredstuApplication: any[] = [];
  serverUrl: string;
  LoginName: string;
  ColumnMode = ColumnMode;
  columns: any;
  headHtmlData: any[] = [];
  loadingIndicator = false;
  searchQuery: any;
  EmployeeDetails: any;
  EmployeeCode: any;
  EmployeeName: any;
  ContactNoX: any;
  DepartmentName: any;
  UserRole: any;
  isLoginFailed: any;
  Department: any;
  loginName:any;
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private semesmigr: SemesterExchangeStuDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private ServicesSM: SemesterExchangeStuDetailsService,
    private studentService: SemesterExchangeStuDetailsService,
    private mouDocumentsService: MouDocumentsService
  ) { }

  ngOnInit(): void {
    const loginName = this.loginName = this.route.snapshot.params['LoginName'];
   
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
      
    }
    else {
      let vl = this.storageService.getUser();
      if (vl != null || vl != undefined) {
        this.Logincheck = true;
      }
      else {
        this.Logincheck = false;
       Swal.fire({
          title: 'Login Failed Kindly login Again!',
          icon: 'error'
        });
        
      }
    }
     
    this.getAllApplicationDetails();
    this.GetEmployeeDetails();
  }
  getToken(id: string): void {
    this.authService.loginTemp(id).subscribe({
      next: (data: any) => {
        this.storageService.saveUser(data);
        this.Logincheck = true;
        
      },
      error: () => {
        this.Logincheck = false;
        this.LoginFailed('');
        
      },
    });

  }
 

  LoginStatus(): boolean {
    const authToken=  this.storageService.getUser();
    
    if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
      this.Logincheck = false;
      return false;
    } else {
      this.Logincheck = true;
      return true;
    }
  }

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: response => {
        if (response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.ContactNoX = response.item1[0].contactNo;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.UserRole = response.item1[0].userRole;
          this.loadingIndicator = false;
          this.isLoginFailed = false;
        } else {
          this.EmployeeDetails = [];
          this.isLoginFailed = true;
        }
      },
      error: err => {
        this.LoginFailed(err);
      }
    });
  }

  LoginFailed(error: any): void {
    this.Logincheck = false;
    Swal.fire({
      title: 'Login Failed',
      text: typeof error === 'string' ? error : 'Login details are invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('HodDashboard');
    if (element) {
      element.hidden = true;
    }
  }

  getAllApplicationDetails(): void {
    this.semesmigr.getAllApplications().subscribe((response) => {
      if (response.item1.length > 0) {
        this.filteredstuApplication = this.stuApplication = response.item1;
        this.loadingIndicator = false;
        this.columns = [];
        this.headHtmlData = [];
        this.headHtmlData = this.stuApplication[0];
        this.columns = Object.keys(this.stuApplication[0]);
        this.columns = this.columns.filter((item: any) => 
          ![
            'contactNo', 'interviewSchedule2', 'filePath2', 'whatsAppNo', 'registrationNo',
            'approvedBy', 'createdBy', 'isAccepted', 'universityOption4', 'isRejected',
            'reasonOfRejection', 'createdOn', 'isActive', 'paymentAmount', 'applicationId',
            'updatedBy', 'documentName', 'filePath', 'updatedOn', 'courseTotalTerms',
            'courseTotalDuration', 'currentYear', 'currentTerm', 'courseMappingFile',
            'countryCode', 'courseMapping', 'englishBonafide', 'consentLetter',
            'bonafideCertificate', 'passport', 'indeminityBond', 'otherDocuments'
          ].includes(item)
        );
        this.loadingIndicator = false;
      } else {
        this.stuApplication = [];
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  search() {
    const query = this.searchQuery?.toLowerCase() || '';
    if (!query) {
      this.filteredstuApplication = [...this.stuApplication];
    } else {
      this.filteredstuApplication = this.stuApplication.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(query))
      );
    }
  }

  onSearchChange(query: string) {
    this.search();
  }

  formatDates(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  exportToExcel(): void {
    const fileName = 'AllStudentApplication_data.xlsx';
    const exportedData = this.stuApplication.map(item => ({
      VID: item.registrationNo,
      contactNo: item.contactNo,
      emailId: item.emailId,
      universityOption1: item.universityOption1,
      universityOption2: item.universityOption2,
      universityOption3: item.universityOption3,
      CourseMapping: item.courseMapping?.length > 0 ? 'Yes' : 'No',
      englishBonafide: item.englishBonafide?.length > 0 ? 'Yes' : 'No',
      consentLetter: item.consentLetter?.length > 0 ? 'Yes' : 'No',
      bonafideCertificate: item.bonafideCertificate?.length > 0 ? 'Yes' : 'No',
      passport: item.passport?.length > 0 ? 'Yes' : 'No',
      indeminityBond: item.indeminityBond?.length > 0 ? 'Yes' : 'No',
      otherDocuments: item.otherDocuments?.length > 0 ? 'Yes' : 'No',
      CreatedOn: this.formatDates(item.createdOn),
      createdBy: item.createdBy,
    }));
    const header = [
      'VID', 'ContactNo', 'EmailId', 'University-Option1', 'University-Option2',
      'University-Option3', 'CourseMapping', 'EnglishBonafide', 'ConsentLetter',
      'BonafideCertificate', 'Passport', 'IndeminityBond', 'OtherDocuments',
      'Application-Date', 'CreatedBy'
    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = Array(header.length).fill({ wpx: 150 });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }

  submitCounsellingRemarks(application: any): void {
    Swal.fire({
      title: "Counselling Remarks",
      input: 'text',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        const Regno = application['applicationId'];
        const formData = new FormData();
        formData.append('ApplicationId', Regno);
        formData.append('CounsellingRemarks', result.value);
        this.handleCounsellingChange(formData);
      }
    });
  }

  private handleCounsellingChange(formData: FormData): void {
    this.studentService.UpdateCounsellingRemarks(formData).subscribe((data: any) => {
      if (data.responseData === 'Cancel') {
        Swal.fire('No Change!', '', 'error');
      } else {
        Swal.fire('Stored Counselling Remarks successfully!', '', 'success').then(() => {
          window.location.reload();
        });
      }
    });
  }

    GetStudentApplication(application: any): void {
      //  alert(this.loginName)
    const Regno = application['registrationNo'];
    this.router.navigate([`ApplicationDetails/${this.loginName}/${Regno}`]);
    // this.router.navigateByUrl('ApplicationDetails/' +  + '/' + Regno);
  }

}

// import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import * as XLSX from 'xlsx';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
// import { SemesterExchangeStuDetailsService } from 'src/app/_services/semester-exchange-stu-details.service';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { StorageService } from 'src/app/_services/storage.service';
// import { AuthService } from 'src/app/_services/auth.service';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

// @Component({
//   selector: 'app-sm-all-applications',
//   templateUrl: './sm-all-applications.component.html',
//   styleUrls: ['./sm-all-applications.component.scss']
// })
// export class SmAllApplicationsComponent implements OnInit { // Added AfterViewInit
//   dataSource: MatTableDataSource<any>;
//   displayedColumns: string[] = ['registrationNo', 'whatsAppNo', 'contactNo', 'emailId', 'isRejected', 'viewDetails'];// ,'createdBy' ,'createdOn','paymentAmount' ,'isActive', 'updatedBy','countryCode'];
//   // displayedColumns: string[] = ['registrationNo','universityOption1' ,'universityOption2' ,'universityOption3' ,'universityOption4' ,'isRejected', 'whatsAppNo'  ,'contactNo' ,'emailId','paymentAmount'];// ,'createdBy' ,'createdOn','paymentAmount' ,'isActive', 'updatedBy','countryCode'];
//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;
//   Logincheck: boolean = false;
//   @ViewChild('dataTable') table: ElementRef;
//   stuApplication: any[] = []; // Initialize as empty array
//   serverUrl: string;
//   loginName: string;
//   ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = []; loadingIndicator = false; searchQuery: any;
//   filteredstuApplication: any[] = [];
//   constructor(private authService: AuthService,
//     private storageService: StorageService,
//     private semesmigr: SemesterExchangeStuDetailsService, private router: Router, private ServicesSM: SemesterExchangeStuDetailsService,
//     private studentService: SemesterExchangeStuDetailsService,
//     private mouDocumentsService: MouDocumentsService,) { }


//   ngOnInit(): void {
//     if (this.Logincheck==true) {
//       this.getAllApplicationDetails();
//       this.GetEmployeeDetails();
//       this.serverUrl = 'https://files.lpu.in/umsweb/DIA/SemesterExchangedocuments/';
//     } else {      
//       this.LoginFailed('unAuthorised Access Login Failed');
//     }
//   }
//   LoginStatus(): boolean {
//     const authToken = this.storageService.getUser();
//     alert(JSON.stringify(authToken))
//     if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
//       this.Logincheck = false;
//       return false;
//     } else {
//       this.Logincheck = true;
//       return true;
//     }

//   }

//   //   // Added on 06-Sep-25
//   EmployeeDetails: any; EmployeeCode: any;
//   EmployeeName: any; ContactNoX: any; DepartmentName: any; UserRole: any; isLoginFailed: any; Department: any;
//   GetEmployeeDetails(): void {
//     this.mouDocumentsService.GetEmployeeDetails().subscribe({
//       next: response => {
//         if (response.item1.length > 0) {
//           this.EmployeeDetails = response.item1;
//           // console.log(JSON.stringify(this.EmployeeDetails))
//           this.EmployeeName = response.item1[0].employeeName;
//           this.EmployeeCode = response.item1[0].employeeCode;
//           this.ContactNoX = response.item1[0].contactNo;
//           this.Department = response.item1[0].department;
//           this.DepartmentName = response.item1[0].departmentName;
//           this.UserRole = response.item1[0].userRole;
//           this.loadingIndicator = false;
//           this.isLoginFailed = false;
//           // if(this.UserRole!=null)
//           // {
//         } else {
//           this.EmployeeDetails = [];
//           this.isLoginFailed = true;
//         }
//       },
//       error: err => {
//         this.LoginFailed(err);
//       }
//     });
//   }



//   LoginFailed(error: any): void {
//     this.Logincheck = true;
//     Swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are invalid!',
//       icon: 'warning',
//     });
//     const element = document.getElementById('HodDashboard');
//     if (element) {
//       element.hidden = true;
//     }
//   }

//   getAllApplicationDetails(): void {
//     // this.semesmigr.getAllApplicationDetails().subscribe((response) => {
//     this.semesmigr.getAllApplications().subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.filteredstuApplication = this.stuApplication = response.item1;
//         this.loadingIndicator = false;
//         this.columns = []; this.headHtmlData = [];
//         this.headHtmlData = this.stuApplication[0];
//         this.columns = Object.keys(this.stuApplication[0]);
//         this.columns = this.columns.filter((item: any) => item !== 'contactNo' && item !== 'interviewSchedule2' && item !== 'filePath2' && item !== 'whatsAppNo' && item !== 'registrationNo' && item !== 'approvedBy' && item !== 'createdBy' && item !== 'isAccepted' && item !== 'universityOption4' && item !== 'isRejected' && item !== 'isAccepted' && item !== 'reasonOfRejection' && item !== 'createdOn' && item !== 'isActive' && item !== 'paymentAmount' && item !== 'applicationId' && item !== 'updatedBy' && item !== 'documentName' && item !== 'filePath' && item !== 'updatedOn' && item !== 'updatedOn' && item !== 'courseTotalTerms' && item !== 'courseTotalDuration' && item !== 'currentYear' && item !== 'currentTerm' && item !== 'courseMappingFile' && item !== 'countryCode' && item !== 'courseMapping' && item !== 'englishBonafide' && item !== 'consentLetter' && item !== 'bonafideCertificate' && item !== 'consentLetter' && item !== 'passport' && item !== 'indeminityBond' && item !== 'otherDocuments');
//         this.columns.push()
//         this.loadingIndicator = false;

//       } else {
//         this.stuApplication = [];
//       }

//     });
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }


//   search() {
//     const query = this.searchQuery.toLowerCase();

//     if (!this.searchQuery) {
//       // Reset the list to the original data when searchQuery is empty
//       this.filteredstuApplication = [...this.stuApplication];
//     } else {
//       this.filteredstuApplication = this.filteredstuApplication.filter(item => {
//         return Object.values(item).some(val =>
//           String(val).toLowerCase().includes(query)
//         );
//       });
//     }


//   }
//   onSearchChange(query: string) {
//     this.search();
//   }

//   formatDates(date: Date): string {
//     const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
//     return DateX;
//   }
//   exportToExcel(): void {
//     const fileName = 'AllStudentApplication_data.xlsx';
//     const exportedData = this.stuApplication.map(item => ({
//       VID: item.registrationNo,
//       contactNo: item.contactNo,
//       emailId: item.emailId,
//       universityOption1: item.universityOption1,
//       universityOption2: item.universityOption2,
//       universityOption3: item.universityOption3,
//       CourseMapping: item.courseMapping?.length > 0 ? 'Yes' : 'No',
//       englishBonafide: item.englishBonafide?.length > 0 ? 'Yes' : 'No',
//       consentLetter: item.consentLetter?.length > 0 ? 'Yes' : 'No',
//       bonafideCertificate: item.bonafideCertificate?.length > 0 ? 'Yes' : 'No',
//       passport: item.passport?.length > 0 ? 'Yes' : 'No',
//       indeminityBond: item.indeminityBond?.length > 0 ? 'Yes' : 'No',
//       otherDocuments: item.otherDocuments?.length > 0 ? 'Yes' : 'No',
//       CreatedOn: this.formatDates(item.createdOn),
//       createdBy: item.createdBy,
//     }));
//     const header = [
//       'VID',
//       'ContactNo',
//       'EmailId',
//       'University-Option1',
//       'University-Option2',
//       'University-Option3',
//       'CourseMapping',
//       'EnglishBonafide',
//       'ConsentLetter',
//       'BonafideCertificate',
//       'Passport',
//       'IndeminityBond',
//       'OtherDocuments',
//       'Application-Date',
//       'CreatedBy'
//     ];
//     const ws_data = [header, ...exportedData.map(item => Object.values(item))];
//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

//     const wscols = [
//       { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }
//     ];
//     ws['!cols'] = wscols;
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
//     link.download = fileName;
//     link.click();
//   }



//   submitCounsellingRemarks(application: any): void {
//     Swal.fire({
//       title: "Counselling  Remarks",
//       input: 'text',
//       showCancelButton: true
//     }).then((result) => {
//       if (result.value) {
//         const Regno = application['applicationId'];
//         const formData = new FormData();
//         formData.append('ApplicationId', Regno);
//         formData.append('CounsellingRemarks', result.value);

//         this.handleCounsellingChange(formData);
//       }
//     });


//   }

//   private handleCounsellingChange(formData: FormData): void {
//     this.studentService.UpdateCounsellingRemarks(formData).subscribe((data: any) => {
//       if (data.responseData === 'Cancel') {
//         Swal.fire('No Change!', '', 'error');
//       } else {
//         Swal.fire('Stored Counselling Remarks successfully!', '', 'success').then(() => {
//           window.location.reload();
//         });
//       }
//     });
//   }
// }

