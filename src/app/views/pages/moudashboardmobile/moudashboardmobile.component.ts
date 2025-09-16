import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-moudashboardmobile',
  templateUrl: './moudashboardmobile.component.html',
  styleUrls: ['./moudashboardmobile.component.scss']
})
export class MOUDashboardMobileComponent implements OnInit {
  moudata:any[]=[];
  constructor(private fb: FormBuilder,private cdRef: ChangeDetectorRef,private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private placementService: PlacementService) { }

  ngOnInit(): void {
    //let loginName  = this.route.snapshot.params['loginName']; 
 //   const dataTable = new DataTable("#dataTableExample");
//  (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'MOU <span class="themeClr" >Dashboard</span>';
(<HTMLInputElement>document.getElementById('stMain')).style.display='NONE';
 (<HTMLInputElement>document.getElementById('ulMenu')).style.visibility='hidden';
 (<HTMLInputElement>document.getElementById('imgLogo')).style.width='100%';
 
      // if(loginName != '' && loginName != undefined){
       // this.getToken(loginName);
      // }
      this.route.queryParams
      .subscribe(params => {
        
        let style = params['uid'];
        this.getToken(params['uid']);
      }
    );
   
  }

  
  getToken(id:any){

    this.authService.loginUMSTemp(id).subscribe({
      next: data => {
        
        this.storageService.saveUser(data);
         this.placementService.getmouData(9).subscribe({
           next: data => {
            this.moudata = data.item1;
            
            
           
           },
           });

      },
      error: err => {
       // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }
}
