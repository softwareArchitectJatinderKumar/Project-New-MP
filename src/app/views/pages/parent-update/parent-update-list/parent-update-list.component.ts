import { Component, OnInit, ViewChild} from '@angular/core';
import { CohortnetworkService } from 'src/app/_services/cohortnetwork.service';
import { AuthService } from 'src/app/_services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { StorageService } from 'src/app/_services/storage.service';
import { CohortcommonService } from 'src/app/_services/cohortcommon.service';
import { ActivatedRoute } from '@angular/router';
import { AppApiUrls} from 'src/app/app.constant';
import { MatSort } from '@angular/material/sort';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-parent-update-list',
  templateUrl: './parent-update-list.component.html',
  styleUrls: ['./parent-update-list.component.scss']
})
export class ParentUpdateListComponent implements OnInit {
  contactList : any[] = [];
  displayedColumns: string[] = []; // Initialize an empty array initially
  message: any;
  dataSource: MatTableDataSource<any>;
  showLoader = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private CohortnetworkService: CohortnetworkService,
    private authService: AuthService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private CohortcommonService: CohortcommonService,
    private deviceService: DeviceDetectorService,
    ) {
      this.dataSource = new MatTableDataSource();
    }

  ngOnInit(): void {
    debugger;
     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr" ></span>';
     //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
     (<HTMLInputElement>document.getElementById('imgLogo')).style.width='164px';
     
     let loginName  = this.route.snapshot.params['loginName'];
     if(this.deviceService.isMobile()){
       (<HTMLInputElement>document.getElementById('ulMenu')).style.display='none';
      // (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='block';
       
     }
     else{
       (<HTMLInputElement>document.getElementById('ulMenu')).style.display='block';
     //  (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='none';
     }
    if(loginName != '' && loginName != undefined){
      this.getToken(loginName);
     }
  

  }

  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        this.getContactList();
    

      },
      error: err => {
       // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

  getContactList() {
    this.showLoader = true;
  
    this.CohortnetworkService.getRoadmap(AppApiUrls.API_PARENT_PARENTCONTACTLIST ).subscribe(
      (data: any) => {
        this.contactList = data;
        this.displayedColumns = Object.keys(data[0]).filter(column => column !== 'id');
        this.displayedColumns = [...this.displayedColumns, 'action'];
        this.dataSource.data = this.contactList; // Set data to the dataSource
        this.showLoader = false;

      },
      (error: any) => {
        console.error('An error occurred:', error);
      }
    );
  }
  
   performAction(contact: any) {
    console.log('Action performed for:', contact);
    this.showLoader = true;
    const requestBody = { id: contact.id }; // Create the request body
    this.CohortnetworkService.postWithAuth(AppApiUrls.API_PARENT_UPDATECONTACT , requestBody).subscribe((data: any) => {
      this.message= data;
      this.CohortcommonService.successPopup(data.message );
      this.getContactList();  
    },
    (error: any) => {
      console.error('An error occurred:', error);
    }
  );
  }

  
}
