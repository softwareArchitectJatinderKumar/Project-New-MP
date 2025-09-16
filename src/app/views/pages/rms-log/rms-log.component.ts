import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
// import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {NgbRatingConfig} from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject, debounceTime, filter, fromEvent, map } from 'rxjs';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { RMSService } from 'src/app/_services/rms.service';
@Component({
  selector: 'app-rms-log',
  templateUrl: './rms-log.component.html',
  styleUrls: ['./rms-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class RMSLogComponent implements OnInit {
  @ViewChild('rmsStudentOption') rmsStudentOption: TemplateRef<any>;
  @ViewChild('ngSelectComponentSubCategory') ngSelectComponentSubCategory: NgSelectComponent;
  displayInstructionBlock:boolean=true;
  displayInstructionBlockSelection:boolean=true;
  rmsCategories:any=[];
  rmsMessageType:any;
  rmsBlockData:any;
  rmsOtherRooms:any;
  staffList:any;
  allListData:any;
  studentList:any;
  anyOtherRoomIsShowing:boolean = false;
  setRoomTypeValue:any='';
  selectedMessageType:any='';
  concernedWith:any = '';
  forBlockShowing:any=[];
  showBlockSpecialCase:boolean = false;
  enteredRoomno:any='';
  concernedStaffRegId:any='';
  studenthostelDataDetails:any;
  modalReference:any;
  masterCategories:any;
  categories:any;
  searchCategories:any;
  subcategories:any;
  specificCategories:any;
  subSpecificCategories:any;
  specificNameNew:any='';
  optionRMS:any='A';
  textName:any='Sub Category';
  selectedMasterCategory:any='0';
  selectedCategory:any='0';
  selectedSubCategory:any='0';
  selectedSpecificCategory:any='0';
  selectedBlockNo:any='0';
  selectedSubBlock:any='0';
  selectedOtherRooms:any='0';
  contactNumber:any='';
  rmsSdesc:any='';
  rmsSubject:any='';
  selectAvailableDate: NgbDateStruct;
  selectedDealingPerson:any='';
  rmsType:any='';
  minDate:NgbDateStruct;
  constructor(private fb: FormBuilder,private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) document: Document,
    private modalService: NgbModal,
    config: NgbRatingConfig,
    private deviceService: DeviceDetectorService,
    private route: ActivatedRoute,private storageService: StorageService,
    private authService: AuthService,
    private rmsService: RMSService,
    private sanitizer: DomSanitizer) {
     
    
  
  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    
  }
  ngOnInit(): void {
    
    this.forBlockShowing.push('67');
    this.forBlockShowing.push('51');
    this.forBlockShowing.push('142');
    this.forBlockShowing.push('56');
    this.forBlockShowing.push('44');

    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    //(<HTMLInputElement>document.getElementById('btnPlannerDashboard')).style.display='none';
    (<HTMLInputElement>document.getElementById('navHeader')).style.display='none';
    
    let loginName  = this.route.snapshot.params['loginName'];
    // if(this.deviceService.isMobile()){
    //   (<HTMLInputElement>document.getElementById('ulMenu')).style.display='none';
    //   (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='block';
      
    // }
    // else{
    //   (<HTMLInputElement>document.getElementById('ulMenu')).style.display='block';
    //   (<HTMLInputElement>document.getElementById('ulmenu1')).style.display='none';
    // }
 //   const dataTable = new DataTable("#dataTableExample");


       if(loginName != '' && loginName != undefined){
        this.getToken(loginName);
       }
    

    //   document.querySelectorAll('.feedback li').forEach(entry => entry.addEventListener('click', e => {
    //     if(!entry.classList.contains('active')) {
    //       (<HTMLInputElement>document.querySelector('.feedback li.active')).classList.remove('active');
    //         entry.classList.add('active');
    //     }
    //     e.preventDefault();
    // }));

  }

  checkType(val:any){
    this.optionRMS = val;
    if(this.optionRMS === 'A'){
      this.textName = 'Sub Category';
    }
    else{
      this.textName = 'Category';
    }
  }

  // ExportTOExcel() {  
  //   // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
  //   // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
  //   // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
  //   // XLSX.writeFile(wb, 'Data.xlsx');  

  //   let element = document.getElementById('dataTableExample1');
  //   const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
 
  //   /* generate workbook and add the worksheet */
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 
  //   /* save to file */  
  //   XLSX.writeFile(wb, this.selectedReportTypeName +'.xlsx');


  // }  


  getToken(id:any){

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
       
            
           
            this.getMtsCategory();

            this.openRMSStudentOptionModal();
      },
      error: err => {
       // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

 getMtsCategory(){
  this.rmsService.getMtsRMSCategories().subscribe({
    next: data => {
     this.rmsCategories = data;
     this.rmsType  = this.rmsCategories.item1[0]['types'];
     this.getMtsMessageType();
    },
    });
 }

 getMtsMessageType(){
  this.rmsService.getMtsRMSMessageType().subscribe({
    next: data => {
     this.rmsMessageType = data.item1;
     this.getBlockNames();
    },
    });
 }

getBlockNames(){
  this.rmsService.getBlockData().subscribe({
    next: data => {
     this.rmsBlockData = data;
     this.getStundentHostelData();
    },
    });
 }

 getStundentHostelData(){
  this.rmsService.getStundentHostel().subscribe({
    next: data => {
      this.getRoomsOthers();
     this.studenthostelDataDetails = data;
     if(this.studenthostelDataDetails.length > 0){
     this.selectedBlockNo = this.studenthostelDataDetails.item1[0]['hostelShortName'];

    this.enteredRoomno = this.studenthostelDataDetails.item1[0]['roomNumber'];

    if(typeof(this.enteredRoomno)  === 'string')
     {
        this.selectedSubBlock = this.enteredRoomno.substring(0, 1);
        
     }
    }
    },
    });
 }
 setMessageType(event:any){
  
  
  if(event.target != undefined){
    this.selectedMessageType = event.target.value;
    // if(event.target.value === 'AO'){
    //   this.anyOtherRoomIsShowing = true;
    // }
    // else{
    //   this.anyOtherRoomIsShowing = false;
    // }
  }
 }

 capturedRMS():any{
  alert(1);
if(this.rmsType=='OO' && this.optionRMS === 'A'){
  if(this.selectedMessageType == ''){
   
      swal.fire(

        {title: 'RMS', text: 'Please choose message type !', icon: 'error'}

        );
        return false;
       
    
  }
  if(this.selectedCategory == '0'){
    swal.fire(

      {title: 'RMS', text: 'Please select category !', icon: 'error'}

      );
      return false;
  }

  if(this.selectedSubCategory == '0'){
    swal.fire(

      {title: 'RMS', text: 'Please select sub category !', icon: 'error'}

      );
      return false;
  }

  if(this.showBlockSpecialCase == true){
    if(this.selectedBlockNo === '0'){
      swal.fire(

        {title: 'RMS', text: 'Please select block !', icon: 'error'}
  
        );
        return false;
    }
    if(this.selectedSubBlock === '0'){
      swal.fire(

        {title: 'RMS', text: 'Please select sub block !', icon: 'error'}
  
        );
        return false;
    }
    
    if(this.setRoomTypeValue == ''){
      swal.fire(

        {title: 'RMS', text: 'Please select room type !', icon: 'error'}
  
        );
        return false;
    }
    if(this.setRoomTypeValue == 'RN'){
      if(this.enteredRoomno == ''){
        swal.fire(

          {title: 'RMS', text: 'Please enter room number !', icon: 'error'}
    
          );
          return false;
      }
    }
    else{

      if(this.selectedOtherRooms == '0'){
        swal.fire(

          {title: 'RMS', text: 'Please select room !', icon: 'error'}
    
          );
          return false;
      }

    }

  }

  if(this.contactNumber == ''){
    swal.fire(

      {title: 'RMS', text: 'Please enter contact number !', icon: 'error'}

      );
      return false;
  }


  if(this.rmsSubject == ''){
    swal.fire(

      {title: 'RMS', text: 'Please enter subject !', icon: 'error'}

      );
      return false;
  }
  if(this.rmsSubject == ''){
    swal.fire(

      {title: 'RMS', text: 'Please enter subject !', icon: 'error'}

      );
      return false;
  }
  if(this.rmsSdesc == ''){
    swal.fire(

      {title: 'RMS', text: 'Please enter rms description !', icon: 'error'}

      );
      return false;
  }
  debugger;
if(this.optionRMS == 'A'){
  let catsubCatIds :any='';
  let filterRmsData  = this.rmsCategories.item1.filter((x:any)=>x.id==this.selectedCategory && x.subCategoryID== this.selectedSubCategory);
  catsubCatIds = filterRmsData[0]['catSubCatId'];
 

 const checkData = {
  catsubcatId:catsubCatIds,
  Subject:this.rmsSubject,
  Description:this.rmsSdesc
 }

 



 this.rmsService.checkDuplicateRMS(checkData).subscribe({
  next: data => {
    debugger;
    if(data.item1.length > 0){


        if( data.item1[0]['isNotAllowed'] == '1')
        {
          swal.fire(

            {title: 'RMS', text: 'Dear User,As you are submitting the same complaint again,it may lead to withdrawing the RMS facility from your account.', icon: 'error'}
      
            );
            
        }
        else{
            if(this.rmsSdesc.length > 2000){
              swal.fire(

                {title: 'RMS', text: 'Dear User, you can not enter more than the limit of 2000 characters.', icon: 'error'}
          
                );
            }
        }
    }
    else{
      if(this.rmsSdesc.length > 2000){
        swal.fire(

          {title: 'RMS', text: 'Dear User, you can not enter more than the limit of 2000 characters.', icon: 'error'}
    
          );
      }
      else{
        alert('captured rms');
      }
    }
  },
});
}



  }
  else{

  }
 
}




 getRoomsOthers(){
  this.rmsService.getOtherRooms().subscribe({
    next: data => {
     this.rmsOtherRooms = data.item1;
     this.getStudentStaffList();
    },
    });
 }

 getStudentStaffList(){
  this.rmsService.getStudentStaffList().subscribe({
    next: data => {
      
     this.studentList = data.item1;
     this.staffList = data.item2;
     
    },
    });
 }
back(){
  this.displayInstructionBlock = true;
  this.displayInstructionBlockSelection = false;
}
 goToCaptureRms(){
  this.displayInstructionBlock = false;
  this.displayInstructionBlockSelection = true;
  this.rmsType = this.optionRMS=='A' ? this.rmsCategories.item1[0]['types'] :  this.rmsCategories.item2[0]['types']
 let masterCategory = this.optionRMS=='A' ? this.rmsCategories.item1 :  this.rmsCategories.item2;
 this.masterCategories = [...new Set(masterCategory.map((item:any) => item.masterCategory))]; // [ 'A', 'B']
// let cats = masterCategory.filter(x=>x['masterCategory']==='')
//  const newArr = unique(array, ['class', 'fare']);

 //this.categories = [...new Set(masterCategory.map((item:any) => item.category && item.id))]; // [ 'A', 'B']
  //this.modalReference.close();

  let seen = new Set();
  if(this.optionRMS==='A'){
  let filtered = this.rmsCategories.item1.filter((entry:any) => {
    const key = entry.catSubCatId + "\u0000" + entry.prefiixText;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seen.has(key);
    if (keep) {
      seen.add(key);
    }
    return keep;
  });

  this.searchCategories = filtered;
}

// else{
  masterCategory = this.optionRMS=='A' ? this.rmsCategories.item1 :  this.rmsCategories.item2;
  let cats = masterCategory;//.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
  this.subcategories = [];
  this.categories = [];
  this.selectedCategory='0';
  this.selectedSubCategory='0';
  let seens = new Set();
  let filtered = cats.filter((entry:any) => {
    const key = entry.id + "\u0000" + entry.category;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seens.has(key);
    if (keep) {
      seens.add(key);
    }
    return keep;
  });

 
this.categories = filtered;
if(this.categories.length == 1){
  this.selectedCategory = this.categories[0]['id'];




  let masterCategory = this.optionRMS=='A' ? this.rmsCategories.item1 :  this.rmsCategories.item2;
  let cats = masterCategory;//.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
  
  let vals = cats.filter((x:any)=>x['id']===parseInt(this.selectedCategory));

  let filteredV = vals.filter((entry:any) => {
    const key = entry.subCategoryID + "\u0000" + entry.subCategory;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seen.has(key);
    if (keep) {
      seen.add(key);
    }
    return keep;
  });
  this.subcategories = filteredV;
  // if(this.subcategories.length == 1){
  //   this.selectedSubCategory = this.subcategories[0]['subCategoryID'].toString();
  //   this.selectedDealingPerson = this.subcategories[0]['employeeName'] + '::' + this.subcategories[0]['userId'];
  //   
  // }

  // this.subcategories = cats.filter((x:any)=>x['id']=== parseInt(this.selectedCategory));
  // if(this.subcategories.length == 1){
  //   this.selectedSubCategory = this.subcategories[0]['subCategoryID'].toString();
  // }
  
}
//}

 }

 handleChange(event:any){
  
  
  if(event.target != undefined){
    this.setRoomTypeValue = event.target.value;
    if(event.target.value === 'AO'){
      this.anyOtherRoomIsShowing = true;
    }
    else{
      this.anyOtherRoomIsShowing = false;
    }
  }
 }

 
 handleChangeConcerned(event:any){
  
  
  if(event.target != undefined){
    this.concernedWith = event.target.value;
    if(this.concernedWith === 'SO'){
      this.allListData = this.staffList;
    }
    else{
      this.allListData = this.studentList;
    }
  }
 }
 onchangeSearchList(event:any){

 }

 onchangeSearchCategories(event:any){
  
  let aaa = event;
  let masterCategory = this.rmsCategories.item1;
 this.masterCategories = [...new Set(masterCategory.map((item:any) => item.masterCategory))]; // [ 'A', 'B']
 this.selectedMasterCategory = event['masterCategory'];
 let cats = masterCategory.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
 this.subcategories = [];
  this.categories = [];
  this.selectedCategory='0';
  this.selectedSubCategory='0';
  let seen = new Set();
  let filtered = cats.filter((entry:any) => {
    const key = entry.id + "\u0000" + entry.category;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seen.has(key);
    if (keep) {
      seen.add(key);
    }
    return keep;
  });

 
this.categories = filtered;
if(this.categories.length > 0){
this.selectedCategory = event['id'];
this.subcategories = cats.filter((x:any)=>x['id']=== parseInt(this.selectedCategory));
if(this.subcategories.length > 0){
  this.selectedSubCategory= event['subCategoryID'];

  this.selectedDealingPerson = event['employeeName'] + '::' + event['userId'];
}
}
  
 }
 

 onChangeMasterCategory() {
  let masterCategory = this.rmsCategories.item1;
  let cats = masterCategory.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
  this.subcategories = [];
  this.categories = [];
  this.selectedCategory='0';
  this.selectedSubCategory='0';
  let seen = new Set();
  let filtered = cats.filter((entry:any) => {
    const key = entry.id + "\u0000" + entry.category;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seen.has(key);
    if (keep) {
      seen.add(key);
    }
    return keep;
  });

 
this.categories = filtered;
if(this.categories.length == 1){
  this.selectedCategory = this.categories[0]['id'];
  this.subcategories = cats.filter((x:any)=>x['id']=== parseInt(this.selectedCategory));
  if(this.subcategories.length == 1){
    this.selectedSubCategory = this.subcategories[0]['subCategoryID'].toString();
  }
  
}
}

onChangeCategory(val:any){
  debugger;
  this.ngSelectComponentSubCategory.handleClearClick();
  this.selectedCategory = val.id;
  if(this.forBlockShowing.filter((x: any)=>x == this.selectedCategory).length > 0)
  {
    this.showBlockSpecialCase = true;
  }
  else{
    this.showBlockSpecialCase = false;
  }
  this.selectedDealingPerson ='';
  let masterCategory = this.rmsCategories.item1;
  let cats = masterCategory.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
  if(this.rmsType == 'OO'){
    this.subcategories = masterCategory.filter((x:any)=>x['id']===parseInt(this.selectedCategory));
    let seen = new Set();
    this.subcategories = this.subcategories.filter((entry:any) => {
      const key = entry.subCategoryID + "\u0000" + entry.subCategory;
      //                       ^---- a string you know won't be in either name or surname
      const keep = !seen.has(key);
      if (keep) {
        seen.add(key);
      }
      return keep;
    });
  }
  else{
  this.subcategories = cats.filter((x:any)=>x['id']===parseInt(this.selectedCategory));
  }
  if(this.subcategories.length == 1){
    this.selectedSubCategory = this.subcategories[0]['subCategoryID'].toString();
    this.selectedDealingPerson = this.subcategories[0]['employeeName'] + '::' + this.subcategories[0]['userId'];
    
  }
}

onChangeSubCategory(val:any){
  debugger;
  this.selectedSubCategory = val.subCategoryID;
  if(this.optionRMS=='A'){

  let masterCategory = this.rmsCategories.item1;
  if(this.rmsType != 'OO'){
  let cats = masterCategory.filter((x:any)=>x['masterCategory']===this.selectedMasterCategory);
  let catssub = cats.filter((x:any)=>x['id']===parseInt(this.selectedCategory));
  let sub  = catssub.filter((x:any)=>x['subCategoryID']===parseInt(this.selectedSubCategory));
  this.selectedDealingPerson = sub[0]['employeeName'] + '::' + sub[0]['userId'];
  }
  else{
    let cats = masterCategory.filter((x:any)=>x['id']===parseInt(this.selectedCategory));
    let catssub = cats.filter((x:any)=>x['id']===parseInt(this.selectedCategory));
    let sub  = catssub.filter((x:any)=>x['subCategoryID']===parseInt(this.selectedSubCategory));
    this.selectedDealingPerson = sub[0]['employeeName'] + '::' + sub[0]['userId'];
    if(this.optionRMS == 'A' && (this.selectedCategory == 133 || this.selectedCategory == 219 || this.selectedCategory == 220 || this.selectedCategory == 221 || this.selectedCategory == 222))
    {
      let sub  = this.rmsCategories.item1.filter((x:any)=>x['subCategoryID']===parseInt(this.selectedSubCategory));
    
      let seen = new Set();
    let filtered = sub.filter((entry:any) => {
      const key = entry.specificId + "\u0000" + entry.specificCategory;
      //                       ^---- a string you know won't be in either name or surname
      const keep = !seen.has(key);
      if (keep) {
        seen.add(key);
      }
      return keep;
    });
  
    this.specificCategories = filtered;
      
    }



  }
  }
  else{
    let sub  = this.rmsCategories.item2.filter((x:any)=>x['subCategoryID']===parseInt(this.selectedSubCategory));
    
    let seen = new Set();
  let filtered = sub.filter((entry:any) => {
    const key = entry.specificId + "\u0000" + entry.specificCategory;
    //                       ^---- a string you know won't be in either name or surname
    const keep = !seen.has(key);
    if (keep) {
      seen.add(key);
    }
    return keep;
  });

  this.specificCategories = filtered;
    
  }
}


onChangeSpecificCategory(){
  let sub  = this.rmsCategories.item2.filter((x:any)=>x['subCategoryID']===parseInt(this.selectedSubCategory));
    

    let seen = new Set();
    

    let filterSubSpecific  = sub.filter((x:any)=>x.specificId === parseInt(this.selectedSpecificCategory));

   let filteredSubSpecificCategories = filterSubSpecific.filter((entry:any) => {
      const key = entry.subSpecificId + "\u0000" + entry.subSpecificDescription;
      //                       ^---- a string you know won't be in either name or surname
      const keep = !seen.has(key);
      if (keep) {
        seen.add(key);
      }
      return keep;
    });

    this.subSpecificCategories = filteredSubSpecificCategories;
}




  openRMSStudentOptionModal(){

     
this.displayInstructionBlockSelection = false;
  //   this.modalReference = this.modalService.open(this.rmsStudentOption,{ windowClass: 'modal fade' });
  //   this.modalReference.result.then(() => {

  //   }).catch(() => {});
   }
 

}
