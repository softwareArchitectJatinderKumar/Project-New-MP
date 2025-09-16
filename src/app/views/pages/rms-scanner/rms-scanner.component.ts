import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
import { ContentChange, SelectionChange } from 'ngx-quill';
import { NgxSpinnerService } from 'ngx-spinner';
import { RMSService } from 'src/app/_services/rms.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { QrCodeErrorCorrectionLevel, RGBAColor } from "ng-qrcode"

@Component({
  selector: 'app-rms-scanner',
  templateUrl: './rms-scanner.component.html',
  styleUrls: ['./rms-scanner.component.scss']
})
export class RmsScannerComponent implements OnInit {
  @ViewChild('ngSelectComponentCategory') ngSelectComponentCategory: NgSelectComponent;
  @ViewChild('ngSelectComponentSubCategory') ngSelectComponentSubCategory: NgSelectComponent;
  showQR:any=false;
  myAngularxQrCode='';
  validationForm1: UntypedFormGroup;
  validationForm2: UntypedFormGroup;
  fromtime = {hour: 13, minute: 30};
  endtime = {hour: 13, minute: 30};
  isForm1Submitted: Boolean;
  isForm2Submitted: Boolean;
  addStudentIds:any=0;
  vidNumber:any='';
  @ViewChild('basicModal') basicModal: TemplateRef<Element>;
  @ViewChild('StudentModal') StudentModal: TemplateRef<Element>;
  
  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  htmlText = `<p> Journal Introduction </p>`
  quillConfig = {
     toolbar: {
       container: [
         ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
         ['code-block'],
        //  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
         [{ 'list': 'ordered'}, { 'list': 'bullet' }],
         [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
         [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        //  [{ 'direction': 'rtl' }],                         // text direction

        //  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
         [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

         [{ 'align': [] }],

        //  ['clean'],                                         // remove formatting button

        //  ['link'],
         ['link', 'image', 'video']
       ],
     },
  }
  keyData:any[] = [];
  EditorData:any[] = [];
  editorForm: FormGroup;  
  showSubmit:any=false;
  filteredEventRegisterationData: any[] = []; 
  PropertiesData: any[] = []; 
  chunkedProperties: any[][] = [];
  dataSource: any; showNoDataFoundMessage: boolean; filterText: any;
  isLoginFailed: boolean=false; journalForm!: FormGroup; dynamicForm: FormGroup;
  JournalTitle: string; SubTitle: string; Introduction: string;
  Volume: string; PublishDate: string; ScopeOfJournal: string; ThrustArea: string; ArticleType: string;
  responses: any;   fileData: File;   fileStatus: boolean;    FileData: File;  fileName: string;
  uploadEnabled: boolean= false; properties: any[] = [];
  responsesData: any[]=[];
  rmsMasterCategories:any;
  rmsScannerData:any;
  rmsCategories:any;
  rmsSubCategories:any;
  rmsScannerStudents:any;
  mCategory:any='Select Master Category';
  Category:any='Select Category';
  scannerTitle:any='';
  scannerType:any='0';
  fileNames:string; ISSNNo:string; RegNo :string;Periodicity:string;Language:string;Scope:string;ArticleProcessCharges:string;
  OpenAccess:string;Print:string;Online:string;ReviewProcess:string;
  constructor(
    private LpujournalbookService: LpujournalbookService,
    private rMSService: RMSService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private storageService: StorageService, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }
  ngOnInit(): void {   
    
    this.validationForm1 = this.formBuilder.group({
      scannerTitle: ['', Validators.required],
      mCategory : ['', Validators.required],
      Category : ['', Validators.required],
      fromtime: ['', Validators.required],
      SubCategory:['', Validators.required],
      endtime: ['', Validators.required],
      startdate: ['', Validators.required],
      enddate: ['', Validators.required],
      scannerType: ['', Validators.required],
    });
    this.editorForm = this.fb.group({  
      EditorinChief: this.fb.array([]) ,  
    });  

    this.quantities().push(this.newQuantity());  
this.validationForm2 = this.formBuilder.group({
  ISSNNo: ['', Validators.required],
  RegNo : ['', Validators.required],
  Periodicity : ['', Validators.required],
  Language : ['', Validators.required],
  Scope : ['', Validators.required],
  ArticleProcessCharges: ['', Validators.required],
  OpenAccess:['', Validators.required],
  Print:['', Validators.required],
  Online:['', Validators.required],
  ReviewProcess:['', Validators.required]

});


    /**
     * formw value validation
     */
    

    this.isForm1Submitted = false;
    this.isForm2Submitted = false;

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">RMS </span> QR Scanner';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }

  get journalTitle() { return this.journalForm.get('journalTitle'); }
  get subTitle() { return this.journalForm.get('subTitle'); }
  get introduction() { return this.journalForm.get('introduction'); }
  get volume() { return this.journalForm.get('volume'); }
  get publishDate() { return this.journalForm.get('publishDate'); }
  get scopeOfJournal() { return this.journalForm.get('scopeOfJournal'); }
  get thrustArea() { return this.journalForm.get('thrustArea'); }
  get articleType() { return this.journalForm.get('articleType'); }
  quantities() : FormArray {  
    return this.editorForm.get("EditorinChief") as FormArray  
  }  

  newQuantity(): FormGroup {  
    return this.fb.group({  
      EditorName: '',  
      Designation: '',  
      Email: '',  
      EditorAddress: '',  
      EditorType: '',  
    })  
  }  

  addQuantity() {  
    this.quantities().push(this.newQuantity());  
  }  
     
  removeQuantity(i:number) {  
    this.quantities().removeAt(i);  
  }  



  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.getStudentRMSMasterCategory();
      //  this.createFormControls();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  onSelectionChanged = (event: SelectionChange) => {
    if(event.oldRange == null) {
      this.onFocus();
    }
    if(event.range == null) {
      this.onBlur();
    }
  }

  onContentChanged = (event: ContentChange) => {
    // console.log(event.html);
  }

  onFocus = () => {
    console.log("On Focus");
  }
  onBlur = () => {
    console.log("Blurred");
  }


  onSubmitFinal() {  
    console.log(this.editorForm.value);  
  }  


  // private createFormControls(): void {
  //   this.properties.forEach(PropertiesData => {
  //     this.dynamicForm.addControl(PropertiesData.items, new FormControl(''));
  //   });
  // }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.LpujournalbookService.GetJournalProperties().subscribe((response) => {
        // Handle the response
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
    const element = document.getElementById('JournalForm');
    if (element) {
      element.hidden = true;
    }
  }

  onMasterCategory(event:any){
    debugger;
    this.ngSelectComponentSubCategory.handleClearClick();
    this.ngSelectComponentCategory.handleClearClick();
    this.showQR = false;
    this.showSubmit = false;
    this.getStudentRMSCategory(event.masterCategory);
  }

  onCategory(event:any){
  
    this.getStudentRMSSubCategory(event.categoryId);
  }

  getStudentRMSMasterCategory(): void {
    this.rMSService.getStudentRMSMasterCategory().subscribe((response) => {

      this.rmsMasterCategories = response.item1;
      this.getRMsScannerData();
      // console.log(" Properties " + JSON.stringify(this.PropertiesData))
    });
  }

  viewScanner(ids:any){
    debugger;
 let bbb = this.rmsScannerData.filter((x:any)=>x.id==ids);

// if(bbb.length > 0){
// const qrCodeValues =
//   {

//     id :ids,
//     masterId : bbb[0]['catsubCatId'],
//     //JournalTitle:this.validationForm1.controls.journalTitle
//   }
if(bbb.length > 0){
  this.myAngularxQrCode = bbb[0]['encryptedId'].toString();

  
  
    this.modalService.open(this.basicModal, {}).result.then((result) => {
     // this.basicModalCloseResult = "Modal closed" + result;
    }).catch((res) => {});
}



  }

  AddScannerStudents(ids:any){
    debugger;
 let bbb = this.rmsScannerData.filter((x:any)=>x.id==ids);

// if(bbb.length > 0){
// const qrCodeValues =
//   {

//     id :ids,
//     masterId : bbb[0]['catsubCatId'],
//     //JournalTitle:this.validationForm1.controls.journalTitle
//   }
if(bbb.length > 0){
 
this.addStudentIds = ids;
    this.getStudentRMSScanner(ids);
  
    this.modalService.open(this.StudentModal, {}).result.then((result) => {
     // this.basicModalCloseResult = "Modal closed" + result;
    }).catch((res) => {});
}



  }


  
  addStudents(){
    let a = this;
    if(this.vidNumber == ''){
      swal.fire({
        title: 'Specified Student',
        text: 'Please enter VID Number !',
        icon: 'warning'
      });
     
    }
    else{

      const checkData = {
        MasterId:this.addStudentIds.toString(),
        VidNo:this.vidNumber,
       }

      this.rMSService.addQRStudentsScanner(checkData).subscribe({
        next: data => {
          if(data.item1[0]['status']== true){
            swal.fire(  {title: 'RMS ', text: data.item1[0]['msg'], icon: 'success'}).then(function() {
              a.vidNumber='';
              a.getRMsScannerData();
              a.getStudentRMSScanner(a.addStudentIds.toString());
          });
          }
          else{
            swal.fire(  {title: 'RMS ', text: 'Something wrong try again later !', icon: 'error'}).then(function() {
              a.getRMsScannerData();
          });
          }
          },
      });
    }
  }

  changeStatus(id:any){
    this.rMSService.updateQRScanner(id).subscribe((response) => {
      this.getRMsScannerData();
  });
  }

getRMsScannerData(){
  this.rMSService.getQRScanner().subscribe((response) => {

    this.rmsScannerData = response.item1;
    
    // console.log(" Properties " + JSON.stringify(this.PropertiesData))
  });
}


  getStudentRMSCategory(catName:any): void {
    this.rMSService.getStudentRMSCategory(catName).subscribe((response) => {
debugger;
      this.rmsCategories = response.item1;
      if(this.rmsCategories.length  > 0 && this.rmsCategories.length == 1){
       
       
      //  this.Category   = this.rmsCategories[0]['categoryId'];
      }
      else{
        // this.Category   ='Search Category';
        // this.Category = 'Select Category';
        // this.validationForm1.controls.Category.setValue('');
      }
      
      // console.log(" Properties " + JSON.stringify(this.PropertiesData))
    });
  }


  getStudentRMSSubCategory(catId:any): void {
    this.rMSService.getStudentRMSSubCategory(catId).subscribe((response) => {

      this.rmsSubCategories = response.item1;
    
      
      // console.log(" Properties " + JSON.stringify(this.PropertiesData))
    });
  }


  getStudentRMSScanner(masterId:any): void {
    this.rMSService.getStudentRMSScanner(masterId).subscribe((response) => {
debugger;
      this.rmsScannerStudents = response.item1;
    
      
      // console.log(" Properties " + JSON.stringify(this.PropertiesData))
    });
  }


  private chunkProperties(): void {
    for (let i = 0; i < this.PropertiesData.length; i += 3) {
      this.chunkedProperties.push(this.PropertiesData.slice(i, i + 3));
    }
  }

  onFileSelected(e: any): void {
    debugger;
    console.log(e);
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
   
    // var idxDot = file.Nam
    // var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    // if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
    //     //TO DO
    // }else{
    //     alert("Only jpg/jpeg and png files are allowed!");
    // }   
    let fileExtension
    let fileNames = file.name.split('.')
    fileExtension =  fileNames[1];
     if (fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png"){
        //TO DO
    }else{
            swal.fire({
        title: 'Journal File',
        text: 'Only jpg/jpeg and png files are allowed!',
        icon: 'warning'
      });
      target.value = '';
      return;
    }



      if (file && file.size > 1048576) {
      swal.fire({
        title: 'File size exceeds 1MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    
    this.FileData = file;





    // const reader = new FileReader();
    // const target = event.target as HTMLInputElement;
    // const file: File | null = (target.files as FileList)[0] || null;
    // if (file && file.size > 1048576) {
    //   swal.fire({
    //     title: 'File size exceeds 1MB. Please upload a smaller file.',
    //     text: 'Invalid File size',
    //     icon: 'warning'
    //   });
    //   target.value = '';
    //   return;
    // }

    // const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    // if (file && !fileNameRegex.test(file.name)) {
    //   const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    //   const modifiedFile = new File([file], validFileName, { type: file.type });
    //   const dataTransfer = new DataTransfer();
    //   dataTransfer.items.add(modifiedFile);
    //   target.files = dataTransfer.files;

    //   this.fileData = modifiedFile;
    //   this.fileStatus = true;

    //   reader.readAsDataURL(modifiedFile);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.FileData = ssssArray[1];
    //     this.fileName = validFileName;
    //   };
    //   this.uploadEnabled = true;
    //   return;
    // }

    // this.fileData = file;
    // this.fileStatus = true;
    // alert(10);  
    // if (file) {
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     const ssss = reader.result as string;
    //     const ssssArray = ssss.split(',');
    //     this.FileData = ssssArray[1];
    //     this.fileName = file.name;
    //     alert(10);  
    //       this.uploadEnabled = true;
    //   };
    // }
  }

  addJournal() {
    const formData = new FormData();
    formData.append('JournalTitle', this.JournalTitle);
    formData.append('SubTitle', this.SubTitle);
    formData.append('Introduction', this.Introduction);
    formData.append('Volume', this.Volume);
    formData.append('PublishDate', this.PublishDate);
    formData.append('ScopeOfJournal', this.ScopeOfJournal);
    formData.append('ThrustArea', this.ThrustArea);
    formData.append('ArticleType', this.ArticleType);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    
    // this.LpujournalbookService.JournalMasterNewEntry(formData).subscribe((response) => {
    //   if (response.item1.length > 0) {
    //     this.responses = response.item1[0];
    //     if (this.responses.returnData === '-1') {
    //       swal.fire(
    //         { title: 'Duplicate Entry Not Allowed ', icon: 'error' }
    //       );
    //     } else if (this.responses.returnData === 'success') {
    //       swal.fire(
    //         { title: 'Journal Added Successfully: ', text: this.responses.returnData, icon: 'success' }
    //       );
    //     } 
    //   }
    //   this.clearData();
    // });
  }
clearData(): void{
  this.JournalTitle = this.SubTitle =  this.Introduction = this.Volume=   this.PublishDate = this.ScopeOfJournal = this.ThrustArea = this.ArticleType= ' '
}
finishFunction() {
  debugger;
  this.spinner.show();
  let a = this.validationForm1.controls;
  let a2 = this.validationForm2.controls;
  let editControls:any =this.editorForm.get("EditorinChief");

  const denominations =
  {

    JournalTitle : this.validationForm1.controls.journalTitle.value,
    SubTitle : this.validationForm1.controls.subTitle.value,
    Volume : this.validationForm1.controls.Volume.value,
    PublishDate : this.validationForm1.controls.publishDate.value,
    Introduction :this.validationForm1.controls.Introduction.value,
    ScopeofJournal: this.validationForm1.controls.scopeofjournals.value,
    ThrustArea:this.validationForm1.controls.thrustArea.value,
    ArticleType:this.validationForm1.controls.ArticleType.value,
    JournalMasterNewDetails:this.keyData,
    JournalMasterNewEditors:this.EditorData
    //JournalTitle:this.validationForm1.controls.journalTitle
  }

  denominations.JournalMasterNewDetails.push({
    KeyName:'ISSNNo',
    KeyValue:this.validationForm2.controls.ISSNNo.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'RegNo',
    KeyValue:this.validationForm2.controls.RegNo.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'Periodicity',
    KeyValue:this.validationForm2.controls.Periodicity.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'Language',
    KeyValue:this.validationForm2.controls.Language.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'Scope',
    KeyValue:this.validationForm2.controls.Scope.value,
  });
  denominations.JournalMasterNewDetails.push({
    KeyName:'ArticleProcessCharges',
    KeyValue:this.validationForm2.controls.ArticleProcessCharges.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'OpenAccess',
    KeyValue:this.validationForm2.controls.OpenAccess.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'Print',
    KeyValue:this.validationForm2.controls.Print.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'Online',
    KeyValue:this.validationForm2.controls.Online.value,
  });

  denominations.JournalMasterNewDetails.push({
    KeyName:'ReviewProcess',
    KeyValue:this.validationForm2.controls.ReviewProcess.value,
  });
  
  
for(let i=0; i < editControls?.controls.length; i++){

  denominations.JournalMasterNewEditors.push({
    EditorName: editControls?.controls[i].controls.EditorName.value,  
    Designation: editControls?.controls[i].controls.Designation.value,  
    Email:editControls?.controls[i].controls.Email.value,
    EditorAddress: editControls?.controls[i].controls.EditorAddress.value,
    EditorType: editControls?.controls[i].controls.EditorType.value,
  });

}


const formData = new FormData();
formData.append('JournalTitle', denominations.JournalTitle);
formData.append('SubTitle', denominations.SubTitle);
formData.append('Introduction', denominations.Introduction);
formData.append('Volume', denominations.Volume);
formData.append('PublishDate', denominations.PublishDate);
formData.append('ScopeofJournal', denominations.ScopeofJournal);
formData.append('ThrustArea', denominations.ThrustArea);
formData.append('ArticleType', denominations.ArticleType);
formData.append('File', this.FileData);
formData.append('JournalMasterNewDetails', JSON.stringify(denominations.JournalMasterNewDetails));
formData.append('JournalMasterNewEditors', JSON.stringify(denominations.JournalMasterNewEditors));


debugger;
this.LpujournalbookService.addJournalData(formData).subscribe({
  next: data => {
    this.spinner.hide();

    swal.fire(  {title: 'Journal ', text: 'Journal Data Save Successfully  !', icon: 'success'}).then(function() {
      window.location.reload();
  });
},
});

}

/**
 * Returns form
 */
get form1() {
  return this.validationForm1.controls;
}

/**
 * Returns form
 */
get form2() {
  return this.validationForm2.controls;
}

/**
 * Go to next step while form value is valid
 */
form1Submit() {


  if(this.validationForm1.valid) {
   this.showQR = false;
    let fValue:any;
    let tValue:any;
   if(this.validationForm1.controls.fromtime.value['minute'].toString() == '0'){
    fValue = '00';
   }
   else{
    fValue = this.validationForm1.controls.fromtime.value['minute'].toString()
   }

   if(this.validationForm1.controls.endtime.value['minute'].toString() == '0'){
    tValue = '00';
   }
   else{
    tValue = this.validationForm1.controls.endtime.value['minute'].toString()
   }


   let fromTimes = this.validationForm1.controls.fromtime.value['hour'].toString() + ':' + fValue;
   let endtimes = this.validationForm1.controls.endtime.value['hour'].toString() + ':' + tValue;

   const checkData = {
    ScannerTitle:this.validationForm1.controls.scannerTitle.value,
    StartDate:this.validationForm1.controls.startdate.value,
    EndDate:this.validationForm1.controls.enddate.value,
    FromTime:fromTimes,
    ToTime:endtimes,
    CatsubCatId:this.validationForm1.controls.SubCategory.value,
    scannerType:this.validationForm1.controls.scannerType.value,
   }
   let a = this;
   this.rMSService.addQRScanner(checkData).subscribe({
   
    next: data => {
    if(data.item1[0]['status']== true){
      swal.fire(  {title: 'RMS ', text: data.item1[0]['msg'], icon: 'success'}).then(function() {
        a.getRMsScannerData();
    });
    }
    else{
      swal.fire(  {title: 'RMS ', text: 'Something wrong try again later !', icon: 'error'}).then(function() {
        window.location.reload();
    });
    }
    },
  });

  }
 
}
resetData(){
  window.location.reload();
}
/**
 * Go to next step while form value is valid
 */
form2Submit() {
  debugger;
  if(this.validationForm2.valid) {
    this.wizardForm.goToNextStep();
  }
  this.isForm2Submitted = true;
}

}