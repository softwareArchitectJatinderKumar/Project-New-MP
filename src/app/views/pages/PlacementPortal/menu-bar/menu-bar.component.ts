import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {
  columns: any;    headHtmlData: any[] = [];  studentLists: any[];
  errorMessage: any; serverUrl: any;
  isLoginFailed: boolean;
  // @ Input () Pid: any;
  CandidateData: any;
  CandidateDataIn: any;
  PlacementId: any;
  showNoDataFoundMessage: boolean;
  data: number;
  registrationNumber: any;
  constructor(
    private placementPortalService: PlacementPortalService,
    private storageService: StorageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    
  ) { }

  ngOnInit(): void {
    this.registrationNumber='11910459';//'11910459';//'12320283'; //12208517 
    this.GetCandidateData(this.registrationNumber);
  //   (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'LPU Placement <span class="themeClr" >Portal</span>';
  //   (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
  //  let loginName = this.route.snapshot.params['loginName']; 
  //  if (loginName != '' && loginName != undefined) {
  //    this.getToken(loginName);
  //  }    
  }

   
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';// this.serverUrl = 'http://172.19.2.52/umsweb/webftp/MOUDocuments/';
        // this.LoginId = id.LoginId;
      },
      error: err => {
      }
    });
  }

  GetCandidateData(regNo: any): void {
    // debugger;
    this.registrationNumber = +regNo;
    this.placementPortalService.GetPlacementCandidateProfile(this.registrationNumber).subscribe({
      next: response => {
        if (response.item1 && response.item1.length > 0) {
          this.CandidateData = response.item1;
          this.CandidateDataIn = this.CandidateData[0];
          this.PlacementId= this.CandidateData[0].uniquePlacementId;
          this.showNoDataFoundMessage = false;
          this.data=  +this.PlacementId;
          // console.log("PlacementId Data Menu bar " + this.data)
        }
        else {
          this.showNoDataFoundMessage = true;
        }
      },
      error: err => {
        
      }
    });
  }

}
