import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-alumni-relation',
  templateUrl: './alumni-relation.component.html',
  styleUrls: ['./alumni-relation.component.scss']
})
export class AlumniRelationComponent implements OnInit {

  constructor(    private authService: AuthService,
    private storageService: StorageService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    
   
 
  }
  getToken(id:any){

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
}
