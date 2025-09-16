import { Component, OnInit } from '@angular/core';
import { CareerService } from 'src/app/_services/career.service';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
@Component({
  selector: 'app-career-services',
  templateUrl: './CareerServices.component.html',
  styleUrls: ['./CareerServices.component.scss']
})
export class CareerServicesComponent implements OnInit {
  StudentVerification: string = "";
  Name: string = "";
  ProgramName: string = "";
  datagrid: any = [];
  ExitStatus: string = "";
  ProgCategory: any[] = [];
  selectedMentors: string = "";
  BatchYear:string="";
  ProgramList:any[]=[];
  preparednessValue:string ="";
  Hname : string="";
  Stype :any[]=[];
  constructor(private Agreement: AgreementEntryService, private service: CareerService,
    private route: ActivatedRoute, private storageService: StorageService,
    private authService: AuthService) { }

  ngOnInit(): void {

    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }

  }


  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);

      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }



  onchange(event: any) {
    this.getdata();
  }
  onCategoryChange(event: any): void{
    
    this.getCategory();
  }

  getdata() {
    this.service.GetStudentRecord(this.StudentVerification).subscribe((data: any) => {
      console.log(data)

      this.datagrid = data.item1;
      debugger;
      this.Name = this.datagrid[0].name;
      this.ProgramName = this.datagrid[0].programName;
      this.ExitStatus = this.datagrid[0].exitStatus;
    })
    this.getYear();
    this.Category();
  }

  Category() {
    this.service.FillProgram("2025").subscribe((data: any) => {
      console.log(data.item1);
      this.ProgCategory = data.item1;
    });
  }

  

getCategory() {
  this.service.GetCourse(this.ProgramName,this.BatchYear,this.StudentVerification).subscribe((data: any) => {
    console.log(data)

    this.datagrid = data.item1;
      this.ProgramList=data.item1;
  })
  this.StudyType();
}

getYear() {
  this.service.GetYear(this.StudentVerification).subscribe((data: any) => {
    console.log(data)

    this.datagrid = data.item1;
      debugger;
      this.BatchYear = this.datagrid[0].batchYear;
  })
  
}

StudyType() {
  this.service.GetHigherStudy().subscribe((data: any) => {
    console.log(data)

    this.datagrid = data.item1;
      debugger;
      this.Stype = data.item1;
  })
  
}


}
