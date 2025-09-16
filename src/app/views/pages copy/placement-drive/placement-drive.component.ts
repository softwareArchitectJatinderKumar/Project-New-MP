import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { NgSelectComponent } from '@ng-select/ng-select';
@Component({
  selector: 'app-placement-drive',
  templateUrl: './placement-drive.component.html',
  styleUrls: ['./placement-drive.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class PlacementDriveComponent implements OnInit {
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  
  form: FormGroup;
  myArray: any[]=[];
  driveAttendance: any[]=[];
  staticArray:any=[];
  batchYearData: any=[];
  batchYearCompanyData: any=[];
  batchYearStreamData: any=[];
  streamData: any[]=[];
  selectedStream:any='';
  selectedBatchyear:any = null;
  roundData:any[] = [];
  selectedRoundData:any = null;
  selectedStreams:any = null;
  selection:any='';
  constructor(private fb: FormBuilder,private cdRef: ChangeDetectorRef,private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private placementService: PlacementService,) { 
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  rows = [
     {driveId: 1, desc: "foo", showDetail: false},
     {driveId: 2, desc: "bar", showDetail: false},
  ]
  ngOnInit(): void {
    let loginName  = this.route.snapshot.params['loginName']; 
 //   const dataTable = new DataTable("#dataTableExample");

        
       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }
   
  }

  panels = ['First', 'Second', 'Third'];
 
  selectedDate: NgbDateStruct;

  profileForm = new FormGroup({
    BatchYear: new FormControl(''),
    Company: new FormControl(''),
    //Feedback: new FormControl(''),
    
  });


  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }


  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {
        
        this.storageService.saveUser(data);
         this.placementService.getBatchyears().subscribe({
           next: data => {
            debugger;
            this.batchYearData = data.item1;
            this.getround();
           
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

  getround(){
    this.placementService.getRounds().subscribe({
      next: data => {
       debugger;
       this.roundData = data.item1;

      
      },
      });
  }

  changeLeagueOwner($event:any){
    
    this.batchYearCompanyData = [];
    this.batchYearStreamData = [];
   
    if($event.batchYear != ''){
      debugger;
      this.selectedBatchyear = $event.batchYear;
      this.getCompany($event.batchYear);
    }

  }
  changeCompany(event:any){
    if(event  != undefined){
    if(event.companyId != ''){
      debugger;
      this.selection=event.companyId;
      this.getStream(event.companyId,this.selectedBatchyear);
    }
  }
  }
  changeCompanyStream(event:any){
    debugger;
    if(event != undefined){
    this.selectedStream = '';
    for(let i=0; i < event.length; i++){
      this.selectedStream += event[i]['stream'] + ',';
    }
    this.selectedStream.substring(0, this.selectedStream.length - 1);
  }
  }

getCompany(batchYear:any){
 
  this.ngSelectComponentStream.handleClearClick();
  this.ngSelectComponent.handleClearClick();
  this.streamData = [];
  this.placementService.getCompanyByBatchyears(batchYear).subscribe({
    next: data => {
     debugger;
     
     this.batchYearCompanyData = data.item1;

    
    },
    });
}

getStream(companyId:any,batchYear:any){
  this.ngSelectComponentStream.handleClearClick();
  this.placementService.getStreamByBatchyears(batchYear,companyId).subscribe({
    next: data => {
     debugger;
     this.batchYearStreamData = data.item1;
    
    
    },
    });
}
showDriveData(){
  this.getDriveStream(this.selection,this.selectedBatchyear,this.selectedStream);
}
getDriveStream(companyId:any,batchYear:any,stream:any){
  this.placementService.getDriveByStreamBatchyears(batchYear,companyId,stream).subscribe({
    next: data => {
     debugger;
     this.streamData = data.item1;

    
    },
    });
}

  addCreds(driveId:any){
    debugger;
    let aaaaa = this.selectedRoundData;
    let aa = this.streamData.filter(x=>x['driveId']==driveId);
    if(aa.length > 0){

    
    let aa1 = this.myArray.filter(x=>x['driveId']==driveId);
if(aa1.length == 0){
  let dtaNew = this.roundData.filter(x=>x.parameterid == this.selectedRoundData);
  this.getAttendance(driveId,this.selectedRoundData);
  this.myArray.push({"driveId":driveId, "value":this.selectedRoundData,"roundname":dtaNew[0]['parametername'],"roundid":dtaNew[0]['parameterid']});
}
else{
  
  let indexFound = this.streamData.filter(x => x.driveId ===driveId && x.value ===this.selectedRoundData);
  if(indexFound.length == 0){
    let dtaNew = this.roundData.filter(x=>x.parameterid == this.selectedRoundData);
    this.getAttendance(driveId,this.selectedRoundData);
    this.myArray.push({"driveId":driveId, "value":this.selectedRoundData,"roundname":dtaNew[0]['parametername'],"roundid":dtaNew[0]['parameterid']});
  }
//  this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])+1


}
    }
  
}

getAttendance(driveId:any,roundId:any){
  this.placementService.getDriveAttendanceDetails(driveId,roundId).subscribe({
    next: data => {
     debugger;
for(let i=0; i < data.item1.length; i++){
  let f = this.driveAttendance.filter(x=> x['roundId']==roundId);
  if(f.length ==0){
     this.driveAttendance.push(data.item1[i]);
  }
     }
    
    },
    });
}

  removeCreds(driveId:any){
    let aa = this.streamData.filter(x=>x['driveId']==driveId);
    if(aa.length > 0){
      //let aa1 = this.myArray.filter(x=>x['driveId']==driveId);
      let lastElement = this.myArray.length - 1;
      let dd = [];
      for(let i =0; i < this.myArray.length; i++){
        if(i != lastElement){
        dd.push(this.myArray[i]);
        }
      }
      this.myArray = dd;
      
      //let indexFound = this.myArray.findIndex(x => x.driveId ===driveId);
      //this.myArray[indexFound]['value'] = parseInt(this.myArray[indexFound]['value'])-1;
     // this.myArray.splice( lastElement, 1 );
      
    }
    
  }

  onSubmit1(){
    console.warn(this.form.value);

  }

  getDriveData(driveId:any){
    this.staticArray = [];
    if(this.myArray.length > 0){
      this.staticArray =  this.myArray.filter(x=>x['driveId']==driveId);
    // if(a.length > 0){
    // for(let i=0; i < a[0]['value']; i++){
    //   this.staticArray.push(1);
    // }
  }
    
    return this.staticArray;
  }


  getRoundDriveData(roundId:any){
    this.staticArray = [];
    if(this.driveAttendance.length > 0){
      return   this.driveAttendance.filter(x=>x['roundId']==roundId);
    // if(a.length > 0){
    // for(let i=0; i < a[0]['value']; i++){
    //   this.staticArray.push(1);
    // }
  }
  else{
return [];
  }
    
   
  }

}
