import { Component, OnInit } from '@angular/core';
import { AppApiUrls} from 'src/app/app.constant';
import { CohortcommonService } from 'src/app/_services/cohortcommon.service';
import { MatDialog } from '@angular/material/dialog';
import { CohortnetworkService } from 'src/app/_services/cohortnetwork.service';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { DeviceDetectorService } from 'ngx-device-detector';
@Component({  selector: 'app-alumni-profile',
  templateUrl: './alumni-profile.component.html',
  styleUrls: ['./alumni-profile.component.scss']
})
export class AlumniProfileComponent implements OnInit {
  studentDetails: any[] = [];
  alumniProfile: any[] = [];
  getAlumni: any[] = [];
  alumniForm: FormGroup;
  url : any;;
  fbLink : any;
  instagram : any;
  linkedin : any;
  isEligible: string;
  sLink : any;
  submittedURL: string = '';
  showForm : boolean = false;
  show : boolean = true;
  showLoader = true;
  constructor(private CohortnetworkService: CohortnetworkService,
    private CohortcommonService: CohortcommonService,
    public _matDialog: MatDialog,
    private authService: AuthService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private deviceService: DeviceDetectorService,
    private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
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

  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        this.getStudentDetails();
    this.initializeForm();
    this.getAlumniProfile();

      },
      error: err => {
       // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

  getStudentDetails(){
    this.showLoader = true;
    this.CohortnetworkService.getRoadmap(AppApiUrls.API_COHORT_GETSTUDENTDETAILS)
  .subscribe((data: any) => {
        this.studentDetails = data;
        this.showLoader = false;
      },
      (error: any) => {
        console.error('An error occurred:', error);
      }
    );
   }
  initializeForm() {
    this.alumniForm = this._formBuilder.group({
      url: ['', [Validators.required, Validators.pattern( '^https?://.+')]],
      fbLink: ['', [ Validators.pattern('^(https?:\/\/)?(www\.)?facebook\.com\/(profile\.php\?id=\d+|[a-zA-Z0-9\.]+)\/?(\\?.*)?$')]],
      linkedin: ['', [ Validators.pattern('^https?://.+')]],
      instagram: ['', [ Validators.pattern('^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_\.]+\/?(\\?.*)?$')]]
    });
  }  
  getAlumniProfile(): void {
    this.CohortnetworkService.getRoadmap(AppApiUrls.API_ALUMNI_GETALUMNIPOFILE ).subscribe((data: any) => {
        this.getAlumni = data.item1;
      
      },
      (error: any) => {
       console.error('An error occurred:', error);
      }
    );
  }
  submitForm(): void {
    this.CohortnetworkService.postWithAuth(AppApiUrls.API_ALUMNI_SAVEALUMNIPROFILE, {
      Link: this.alumniForm.controls.url.value || "",
      FbLink: this.alumniForm.controls.fbLink.value || "",
      LinkedinLink: this.alumniForm.controls.linkedin.value || "",
      InstaLink: this.alumniForm.controls.instagram.value || ""
    }).subscribe((data: any) => {
      this.alumniProfile = data;
      this.CohortcommonService.successPopup(data.message);
      console.log("alumni", this.alumniProfile);
      // Hide the form after successful submission
      this.showForm = false;
      this.getAlumniProfile();
    });
  }
                                                                                                                                                               
  editUrl(): void {
    // Show the form again for editing
    this.showForm = true;
  
    this.alumniForm.patchValue({
    url: this.getAlumni[0].sLink || '',
    fbLink: this.getAlumni[0].fbLink || '',
    linkedin: this.getAlumni[0].linkedinLink || '',
    instagram: this.getAlumni[0].instaLink || '',
  });
}
}
