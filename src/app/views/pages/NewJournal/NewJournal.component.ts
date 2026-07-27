import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ChangeDetectionStrategy, ChangeDetectorRef,  ElementRef, Inject, TemplateRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnMode } from '@swimlane/ngx-datatable';

import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
import { ContentChange, SelectionChange } from 'ngx-quill';
import { NgxSpinnerService } from 'ngx-spinner';
import { Console } from 'console';
interface SchoolDivision {
  id: string;
  schoolDivision: string;
}

@Component({
  selector: 'app-content',
  templateUrl: './NewJournal.component.html',
  styleUrls: ['./NewJournal.component.scss']
})
export class NewJournalComponent implements OnInit {
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  AllJournalsDetails:  any[] = []; TempAllJournalsDetails : any[]=[];  headHtmlData: never[]; isInputDisabled:boolean = true;    JournalId: any; fileNamesX: string;   ColumnMode = ColumnMode;    FileDataX: string;      searchQueryx: any;

  onSelectFile(a:any){
    let aa = a;   
    window.open(aa.imageUrl,'_blank');
  }


  // gotToAboutPage(a: any) {
  //   let aa = a;
  //   this.JournalId = aa['id'];
  //   this.Title = aa['journalTitle'];    
  //     this.router.navigateByUrl(this.JournalId+ '/' + this.Title + '/' + 'About');
  // }
  onSelect(a: any) {
    let aa = a;
    this.JournalId = aa['id'];
    this.Title = aa['journalTitle'];
    this.modalService.open(this.viewDescModal, {size: 'sm'}).result.then((result) => {

      // console.log("Modal closed" + result);
    }).catch((res) => {});
  }
  onEditClick(a: any)
  {
    // alert(" " + JSON.stringify(a))
   this.router.navigateByUrl(a.id+ '/' + a.journalTitle + '/' + 'About');
  }
  UpdateFileDocument(Id: any) {
    if (this.fileChosen[Id]) {
    const formData = new FormData();
    formData.append('JournalId', Id);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileDataX);
  
    this.LpujournalbookService.UpdateJournalImageFile(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'ok') {
          swal.fire({
            title: 'Uploaded the Document',
            text: data.item1[0]['msg'],
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else  if (result === 'Failed') {
          swal.fire({
            title: 'Failed to Upload',
            text: result,
            icon: 'error'
          });
        }
      },
      error: (error: any) => {
        swal.fire({
          title: 'Error',
          text: 'Internal Server error',
          icon: 'error'
        });
      },
      complete: () => {
        window.location.reload();
      }
    });
    }
  }
  fileChosen: { [key: number]: boolean } = {};
  onFileXSelected(event: any, id: number): void {
    this.fileChosen[id] = event.target.files.length > 0;
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
  
    if (file && file.size > 3148576) {
      swal.fire({
        title: 'File size exceeds 3 MB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }
  
    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (file && !fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
 
      const modifiedFile = new File([file], validFileName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;
  
      this.fileDataX = modifiedFile;
      this.fileStatus = true;
      
      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileDataX = ssssArray[1];
        this.fileName = validFileName;
      };
      return;
    }
  
    this.fileDataX = file;
    this.fileStatus = true;
  
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileDataX = ssssArray[1];
        this.fileName = file.name;
      };
    }
  }
  exportToExcel(): void {
    const fileName = 'Journals_Document_report.xlsx';
    const exportedData = this.AllJournalsDetails.map(item => ({
      Id: item.id,
      Title:item.journalTitle,
      Introduction: item.introduction
    }));
    const header = [
      'JournalId',
      'Title',
      'Introduction',
    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c:3 }); // Column 7 is DocumentUrl
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.f = `HYPERLINK("${cell.v}", "Download Attachement")`;
      }
    }
    const wscols = [
      { wpx: 200 }, { wpx: 200 }, { wpx: 200 }
    ];
    ws['!cols'] = wscols;
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([blobData], { type: 'application/octet-stream' }));
    link.download = fileName;
    link.click();
  }
 
  getBooksDetail(): void {
    this.LpujournalbookService.GetAllBooksDetails().subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.AllJournalsDetails = response.item1;
        this.TempAllJournalsDetails = this.AllJournalsDetails; 
        this.loadingIndicator = false;
        this.columns =[];        this.headHtmlData=[];
     
            this.headHtmlData = this.TempAllJournalsDetails[0];
            this.columns = Object.keys(this.TempAllJournalsDetails[0]);
            // ["id","journalTitle","introduction","subTitle","volumne","scopeofJournal","publishDate","thrustArea","articleType","imageUrl"]
            this.columns = this.columns.filter((item: any) => item !== 'imageUrl'  && item !== 'volumne' && item !== 'introduction' && item !== 'publishDate'  && item !== 'scopeofJournal' && item !== 'thrustArea' && item !== 'articleType' );
            this.columns.push()
         this.loadingIndicator = false;
      }
      else {
        this.TempAllJournalsDetails = [];
      }
    });
  }
  
  onNewFileSelected(e: any): void {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    let fileExtension
    let fileNames = file.name.split('.')
    fileExtension = fileNames[1];
    if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png") {
      //TO DO
    } else {
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
    this.fileDataX = file;
    this.isInputDisabled= false;
  }
  validationForm1: UntypedFormGroup;
  validationForm2: UntypedFormGroup;

  isForm1Submitted: Boolean;    isForm2Submitted: Boolean;

  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  htmlText = `<p> Journal Introduction </p>`
  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['code-block'],
        //  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
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
  keyData: any[] = [];    EditorData: any[] = [];   editorForm: FormGroup;  filteredEventRegisterationData: any[] = [];
  PropertiesData: any[] = [];   chunkedProperties: any[][] = [];
  dataSource: any; showNoDataFoundMessage: boolean; filterText: any;
  isLoginFailed: boolean = false; journalForm!: FormGroup; dynamicForm: FormGroup;
  JournalTitle: string; SubTitle: string; Introduction: string; Title: string;
  Volume: string; PublishDate: string; ScopeOfJournal: string; ThrustArea: string; ArticleType: string;
  responses: any; fileDataX: File; fileStatus: boolean; FileData: File; fileName: string;
  uploadEnabled: boolean = false; properties: any[] = [];
  responsesData: any[] = [];    fileNames: string; ISSNNo: string; RegNo: string; Periodicity: string; Language: string; Scope: string; ArticleProcessCharges: string;
  OpenAccess: string; Print: string; Online: string; ReviewProcess: string;
  loadingIndicator: boolean;     columns: any;
  constructor(
    private LpujournalbookService: LpujournalbookService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,  private router: Router,
    private storageService: StorageService, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }
  ngOnInit(): void {

    this.validationForm1 = this.formBuilder.group({
      journalTitle: ['', Validators.required],
      subTitle: ['', Validators.required],
      Volume: ['', Validators.required],
      publishDate: ['', Validators.required],
      Introduction: ['', Validators.required],
      scopeofjournals: ['', Validators.required],
      thrustArea: ['', Validators.required],
      ArticleType: ['', Validators.required],
      file: ['', Validators.required]

    });
    this.editorForm = this.fb.group({
      EditorinChief: this.fb.array([]),
    });

    this.quantities().push(this.newQuantity());
    this.validationForm2 = this.formBuilder.group({
      ISSNNo: ['', Validators.required],
      RegNo: ['', Validators.required],
      Periodicity: ['', Validators.required],
      Language: ['', Validators.required],
      Scope: ['', Validators.required],
      ArticleProcessCharges: ['', Validators.required],
      OpenAccess: ['', Validators.required],
      Print: ['', Validators.required],
      Online: ['', Validators.required],
      ReviewProcess: ['', Validators.required]

    });


    /**
     * formw value validation
     */


    this.isForm1Submitted = false;
    this.isForm2Submitted = false;

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Journal </span> Master';
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
  quantities(): FormArray {
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

  removeQuantity(i: number) {
    this.quantities().removeAt(i);
  }


  searchx() {
    const query = this.searchQueryx.toLowerCase();
    this.TempAllJournalsDetails = this.AllJournalsDetails.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      );
    });
  }
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.LoadForm();
        this.GetJournalProperties();
        this.getBooksDetail();
        this.dynamicForm = this.fb.group({});
        this.createFormControls();
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  onSelectionChanged = (event: SelectionChange) => {
    if (event.oldRange == null) {
      this.onFocus();
    }
    if (event.range == null) {
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

  LoadForm(): void {
    this.journalForm = this.fb.group({
      journalTitle: ['', [Validators.required, Validators.maxLength(200)]],
      subTitle: ['', [Validators.required, Validators.maxLength(500)]],
      introduction: ['', [Validators.required, Validators.maxLength(1000)]],
      volume: ['', [Validators.required, Validators.maxLength(20)]],
      publishDate: ['', Validators.required],
      scopeOfJournal: ['', [Validators.required, Validators.maxLength(1000)]],
      thrustArea: ['', [Validators.required, Validators.maxLength(1000)]],
      articleType: ['', [Validators.required, Validators.maxLength(1000)]],
      file: ['', Validators.required],
      Property: ['', Validators.required],
    });

  }
  private createFormControls(): void {
    this.properties.forEach(PropertiesData => {
      this.dynamicForm.addControl(PropertiesData.items, new FormControl(''));
    });
  }

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
  GetJournalProperties(): void {
    this.LpujournalbookService.GetJournalProperties().subscribe((response) => {
      if (response.item1.length > 0) {
        this.PropertiesData = response.item1;
        
        let vals =

          this.chunkProperties();
      } else {
        this.PropertiesData = [];
      }
      // console.log(" Properties " + JSON.stringify(this.PropertiesData))
    });
  }
  private chunkProperties(): void {
    for (let i = 0; i < this.PropertiesData.length; i += 3) {
      this.chunkedProperties.push(this.PropertiesData.slice(i, i + 3));
    }
  }

  onFileSelected(e: any): void {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    let fileExtension
    let fileNames = file.name.split('.')
    fileExtension = fileNames[1];
    if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png") {
      //TO DO
    } else {
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
  clearData(): void {
    this.JournalTitle = this.SubTitle = this.Introduction = this.Volume = this.PublishDate = this.ScopeOfJournal = this.ThrustArea = this.ArticleType = ' '
  }
  finishFunction() {
    
    this.spinner.show();
    let a = this.validationForm1.controls;
    let a2 = this.validationForm2.controls;
    let editControls: any = this.editorForm.get("EditorinChief");

    const denominations =
    {

      JournalTitle: this.validationForm1.controls.journalTitle.value,
      SubTitle: this.validationForm1.controls.subTitle.value,
      Volume: this.validationForm1.controls.Volume.value,
      PublishDate: this.validationForm1.controls.publishDate.value,
      Introduction: this.validationForm1.controls.Introduction.value,
      ScopeofJournal: this.validationForm1.controls.scopeofjournals.value,
      ThrustArea: this.validationForm1.controls.thrustArea.value,
      ArticleType: this.validationForm1.controls.ArticleType.value,
      JournalMasterNewDetails: this.keyData,
      JournalMasterNewEditors: this.EditorData
      //JournalTitle:this.validationForm1.controls.journalTitle
    }

    denominations.JournalMasterNewDetails.push({
      KeyName: 'ISSNNo',
      KeyValue: this.validationForm2.controls.ISSNNo.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'RegNo',
      KeyValue: this.validationForm2.controls.RegNo.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'Periodicity',
      KeyValue: this.validationForm2.controls.Periodicity.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'Language',
      KeyValue: this.validationForm2.controls.Language.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'Scope',
      KeyValue: this.validationForm2.controls.Scope.value,
    });
    denominations.JournalMasterNewDetails.push({
      KeyName: 'ArticleProcessCharges',
      KeyValue: this.validationForm2.controls.ArticleProcessCharges.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'OpenAccess',
      KeyValue: this.validationForm2.controls.OpenAccess.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'Print',
      KeyValue: this.validationForm2.controls.Print.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'Online',
      KeyValue: this.validationForm2.controls.Online.value,
    });

    denominations.JournalMasterNewDetails.push({
      KeyName: 'ReviewProcess',
      KeyValue: this.validationForm2.controls.ReviewProcess.value,
    });


    for (let i = 0; i < editControls?.controls.length; i++) {

      denominations.JournalMasterNewEditors.push({
        EditorName: editControls?.controls[i].controls.EditorName.value,
        Designation: editControls?.controls[i].controls.Designation.value,
        Email: editControls?.controls[i].controls.Email.value,
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


    
    this.LpujournalbookService.addJournalData(formData).subscribe({
      next: data => {
        this.spinner.hide();

        swal.fire({ title: 'Journal ', text: 'Journal Data Save Successfully  !', icon: 'success' }).then(function () {
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


    if (this.validationForm1.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm1Submitted = true;
  }

  /**
   * Go to next step while form value is valid
   */
  form2Submit() {
    
    if (this.validationForm2.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm2Submitted = true;
  }

}
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// import Swal from 'sweetalert2';
// import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { AuthService } from 'src/app/_services/auth.service';
// import { StorageService } from 'src/app/_services/storage.service';
// import * as XLSX from 'xlsx';
// import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
// import swal from 'sweetalert2';
// import { ColumnMode } from '@swimlane/ngx-datatable';
// import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
// import { ActivatedRoute } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
// import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
// import { ContentChange, SelectionChange } from 'ngx-quill';
// import { NgxSpinnerService } from 'ngx-spinner';
// interface SchoolDivision {
//   id: string;
//   schoolDivision: string;
// }

// @Component({
//   selector: 'app-content',
//   templateUrl: './NewJournal.component.html',
//   styleUrls: ['./NewJournal.component.scss']
// })
// export class NewJournalComponent implements OnInit {


//   validationForm1: UntypedFormGroup;
//   validationForm2: UntypedFormGroup;

//   isForm1Submitted: Boolean;
//   isForm2Submitted: Boolean;

//   @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
//   htmlText = `<p> Journal Introduction </p>`
//   quillConfig = {
//      toolbar: {
//        container: [
//          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//          ['code-block'],
//         //  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
//          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
//          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
//         //  [{ 'direction': 'rtl' }],                         // text direction

//         //  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
//          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

//          [{ 'align': [] }],

//         //  ['clean'],                                         // remove formatting button

//         //  ['link'],
//          ['link', 'image', 'video']
//        ],
//      },
//   }
//   keyData:any[] = [];
//   EditorData:any[] = [];
//   editorForm: FormGroup;  
//   filteredEventRegisterationData: any[] = []; 
//   PropertiesData: any[] = []; 
//   chunkedProperties: any[][] = [];
//   dataSource: any; showNoDataFoundMessage: boolean; filterText: any;
//   isLoginFailed: boolean=false; journalForm!: FormGroup; dynamicForm: FormGroup;
//   JournalTitle: string; SubTitle: string; Introduction: string;
//   Volume: string; PublishDate: string; ScopeOfJournal: string; ThrustArea: string; ArticleType: string;
//   responses: any;   fileData: File;   fileStatus: boolean;    FileData: File;  fileName: string;
//   uploadEnabled: boolean= false; properties: any[] = [];
//   responsesData: any[]=[];
//   fileNames:string; ISSNNo:string; RegNo :string;Periodicity:string;Language:string;Scope:string;ArticleProcessCharges:string;
//   OpenAccess:string;Print:string;Online:string;ReviewProcess:string;
//   constructor(
//     private LpujournalbookService: LpujournalbookService,
//     private spinner: NgxSpinnerService,
//     private storageService: StorageService, private authService: AuthService,
//     public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
//     private fb: FormBuilder) { }
//   ngOnInit(): void {   
    
//     this.validationForm1 = this.formBuilder.group({
//       journalTitle : ['', Validators.required],
//       subTitle : ['', Validators.required],
//       Volume : ['', Validators.required],
//       publishDate : ['', Validators.required],
//       Introduction : ['', Validators.required],
//       scopeofjournals: ['', Validators.required],
//       thrustArea:['', Validators.required],
//       ArticleType:['', Validators.required],
//       file:['', Validators.required]

//     });
//     this.editorForm = this.fb.group({  
//       EditorinChief: this.fb.array([]) ,  
//     });  

//     this.quantities().push(this.newQuantity());  
// this.validationForm2 = this.formBuilder.group({
//   ISSNNo: ['', Validators.required],
//   RegNo : ['', Validators.required],
//   Periodicity : ['', Validators.required],
//   Language : ['', Validators.required],
//   Scope : ['', Validators.required],
//   ArticleProcessCharges: ['', Validators.required],
//   OpenAccess:['', Validators.required],
//   Print:['', Validators.required],
//   Online:['', Validators.required],
//   ReviewProcess:['', Validators.required]

// });


//     /**
//      * formw value validation
//      */
    

//     this.isForm1Submitted = false;
//     this.isForm2Submitted = false;

//     (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Journal </span> Master';
//     (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
//     let loginName = this.route.snapshot.params['loginName'];
//     if (loginName != '' && loginName != undefined) {
//       this.getToken(loginName);
//     }
//   }

//   get journalTitle() { return this.journalForm.get('journalTitle'); }
//   get subTitle() { return this.journalForm.get('subTitle'); }
//   get introduction() { return this.journalForm.get('introduction'); }
//   get volume() { return this.journalForm.get('volume'); }
//   get publishDate() { return this.journalForm.get('publishDate'); }
//   get scopeOfJournal() { return this.journalForm.get('scopeOfJournal'); }
//   get thrustArea() { return this.journalForm.get('thrustArea'); }
//   get articleType() { return this.journalForm.get('articleType'); }
//   quantities() : FormArray {  
//     return this.editorForm.get("EditorinChief") as FormArray  
//   }  

//   newQuantity(): FormGroup {  
//     return this.fb.group({  
//       EditorName: '',  
//       Designation: '',  
//       Email: '',  
//       EditorAddress: '',  
//       EditorType: '',  
//     })  
//   }  

//   addQuantity() {  
//     this.quantities().push(this.newQuantity());  
//   }  
     
//   removeQuantity(i:number) {  
//     this.quantities().removeAt(i);  
//   }  



//   getToken(id: any) {
//     this.authService.loginTemp(id).subscribe({
//       next: data => {
//         this.storageService.saveUser(data);
//         this.LoadForm();
//         this.GetJournalProperties();
//         this.dynamicForm = this.fb.group({});
//         this.createFormControls();
//       },
//       error: _err => {
//         this.LoginFailed(_err);
//       }
//     });
//   }

//   onSelectionChanged = (event: SelectionChange) => {
//     if(event.oldRange == null) {
//       this.onFocus();
//     }
//     if(event.range == null) {
//       this.onBlur();
//     }
//   }

//   onContentChanged = (event: ContentChange) => {
//     // console.log(event.html);
//   }

//   onFocus = () => {
//     console.log("On Focus");
//   }
//   onBlur = () => {
//     console.log("Blurred");
//   }


//   onSubmitFinal() {  
//     console.log(this.editorForm.value);  
//   }  

//   LoadForm(): void{
//     this.journalForm = this.fb.group({
//       journalTitle: ['', [Validators.required, Validators.maxLength(200)]],
//       subTitle: ['', [Validators.required, Validators.maxLength(500)]],
//       introduction: ['', [Validators.required, Validators.maxLength(1000)]],
//       volume: ['', [Validators.required, Validators.maxLength(20)]],
//       publishDate: ['', Validators.required],
//       scopeOfJournal: ['', [Validators.required, Validators.maxLength(1000)]],
//       thrustArea: ['', [Validators.required, Validators.maxLength(1000)]],
//       articleType: ['', [Validators.required, Validators.maxLength(1000)]]  ,
//       file: ['', Validators.required],
//       Property:['', Validators.required],
//     });
   
//   }
//   private createFormControls(): void {
//     this.properties.forEach(PropertiesData => {
//       this.dynamicForm.addControl(PropertiesData.items, new FormControl(''));
//     });
//   }

//   onSubmit(): void {
//     if (this.dynamicForm.valid) {
//       this.LpujournalbookService.GetJournalProperties().subscribe((response) => {
//         // Handle the response
//       });
//     }
//   }
//   LoginFailed(_NewError: any) {
//     this.isLoginFailed = true;
//     swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are Invalid!',
//       icon: 'warning',
//     })
//     const element = document.getElementById('JournalForm');
//     if (element) {
//       element.hidden = true;
//     }
//   }
//   GetJournalProperties(): void {
//     this.LpujournalbookService.GetJournalProperties().subscribe((response) => {
//       if (response.item1.length > 0) {
//         this.PropertiesData =  response.item1;





// debugger;
// let vals = 

       
//         this.chunkProperties();
//       } else {
//         this.PropertiesData = [];
//       }
//       // console.log(" Properties " + JSON.stringify(this.PropertiesData))
//     });
//   }
//   private chunkProperties(): void {
//     for (let i = 0; i < this.PropertiesData.length; i += 3) {
//       this.chunkedProperties.push(this.PropertiesData.slice(i, i + 3));
//     }
//   }

//   onFileSelected(e: any): void {
//     debugger;
//     console.log(e);
//     const target = e.target as HTMLInputElement;
//     const file: File = (target.files as FileList)[0];
   
//     // var idxDot = file.Nam
//     // var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
//     // if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
//     //     //TO DO
//     // }else{
//     //     alert("Only jpg/jpeg and png files are allowed!");
//     // }   
//     let fileExtension
//     let fileNames = file.name.split('.')
//     fileExtension =  fileNames[1];
//      if (fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png"){
//         //TO DO
//     }else{
//             swal.fire({
//         title: 'Journal File',
//         text: 'Only jpg/jpeg and png files are allowed!',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }



//       if (file && file.size > 1048576) {
//       swal.fire({
//         title: 'File size exceeds 1MB. Please upload a smaller file.',
//         text: 'Invalid File size',
//         icon: 'warning'
//       });
//       target.value = '';
//       return;
//     }

    
//     this.FileData = file;





//     // const reader = new FileReader();
//     // const target = event.target as HTMLInputElement;
//     // const file: File | null = (target.files as FileList)[0] || null;
//     // if (file && file.size > 1048576) {
//     //   swal.fire({
//     //     title: 'File size exceeds 1MB. Please upload a smaller file.',
//     //     text: 'Invalid File size',
//     //     icon: 'warning'
//     //   });
//     //   target.value = '';
//     //   return;
//     // }

//     // const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
//     // if (file && !fileNameRegex.test(file.name)) {
//     //   const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

//     //   const modifiedFile = new File([file], validFileName, { type: file.type });
//     //   const dataTransfer = new DataTransfer();
//     //   dataTransfer.items.add(modifiedFile);
//     //   target.files = dataTransfer.files;

//     //   this.fileData = modifiedFile;
//     //   this.fileStatus = true;

//     //   reader.readAsDataURL(modifiedFile);
//     //   reader.onload = () => {
//     //     const ssss = reader.result as string;
//     //     const ssssArray = ssss.split(',');
//     //     this.FileData = ssssArray[1];
//     //     this.fileName = validFileName;
//     //   };
//     //   this.uploadEnabled = true;
//     //   return;
//     // }

//     // this.fileData = file;
//     // this.fileStatus = true;
//     // alert(10);  
//     // if (file) {
//     //   reader.readAsDataURL(file);
//     //   reader.onload = () => {
//     //     const ssss = reader.result as string;
//     //     const ssssArray = ssss.split(',');
//     //     this.FileData = ssssArray[1];
//     //     this.fileName = file.name;
//     //     alert(10);  
//     //       this.uploadEnabled = true;
//     //   };
//     // }
//   }

//   addJournal() {
//     const formData = new FormData();
//     formData.append('JournalTitle', this.JournalTitle);
//     formData.append('SubTitle', this.SubTitle);
//     formData.append('Introduction', this.Introduction);
//     formData.append('Volume', this.Volume);
//     formData.append('PublishDate', this.PublishDate);
//     formData.append('ScopeOfJournal', this.ScopeOfJournal);
//     formData.append('ThrustArea', this.ThrustArea);
//     formData.append('ArticleType', this.ArticleType);
//     formData.append('FilePath', this.fileName);
//     formData.append('File', this.FileData);
//     alert('test Save '  )
//     // this.LpujournalbookService.JournalMasterNewEntry(formData).subscribe((response) => {
//     //   if (response.item1.length > 0) {
//     //     this.responses = response.item1[0];
//     //     if (this.responses.returnData === '-1') {
//     //       swal.fire(
//     //         { title: 'Duplicate Entry Not Allowed ', icon: 'error' }
//     //       );
//     //     } else if (this.responses.returnData === 'success') {
//     //       swal.fire(
//     //         { title: 'Journal Added Successfully: ', text: this.responses.returnData, icon: 'success' }
//     //       );
//     //     } 
//     //   }
//     //   this.clearData();
//     // });
//   }
// clearData(): void{
//   this.JournalTitle = this.SubTitle =  this.Introduction = this.Volume=   this.PublishDate = this.ScopeOfJournal = this.ThrustArea = this.ArticleType= ' '
// }
// finishFunction() {
//   debugger;
//   this.spinner.show();
//   let a = this.validationForm1.controls;
//   let a2 = this.validationForm2.controls;
//   let editControls:any =this.editorForm.get("EditorinChief");

//   const denominations =
//   {

//     JournalTitle : this.validationForm1.controls.journalTitle.value,
//     SubTitle : this.validationForm1.controls.subTitle.value,
//     Volume : this.validationForm1.controls.Volume.value,
//     PublishDate : this.validationForm1.controls.publishDate.value,
//     Introduction :this.validationForm1.controls.Introduction.value,
//     ScopeofJournal: this.validationForm1.controls.scopeofjournals.value,
//     ThrustArea:this.validationForm1.controls.thrustArea.value,
//     ArticleType:this.validationForm1.controls.ArticleType.value,
//     JournalMasterNewDetails:this.keyData,
//     JournalMasterNewEditors:this.EditorData
//     //JournalTitle:this.validationForm1.controls.journalTitle
//   }

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'ISSNNo',
//     KeyValue:this.validationForm2.controls.ISSNNo.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'RegNo',
//     KeyValue:this.validationForm2.controls.RegNo.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'Periodicity',
//     KeyValue:this.validationForm2.controls.Periodicity.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'Language',
//     KeyValue:this.validationForm2.controls.Language.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'Scope',
//     KeyValue:this.validationForm2.controls.Scope.value,
//   });
//   denominations.JournalMasterNewDetails.push({
//     KeyName:'ArticleProcessCharges',
//     KeyValue:this.validationForm2.controls.ArticleProcessCharges.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'OpenAccess',
//     KeyValue:this.validationForm2.controls.OpenAccess.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'Print',
//     KeyValue:this.validationForm2.controls.Print.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'Online',
//     KeyValue:this.validationForm2.controls.Online.value,
//   });

//   denominations.JournalMasterNewDetails.push({
//     KeyName:'ReviewProcess',
//     KeyValue:this.validationForm2.controls.ReviewProcess.value,
//   });
  
  
// for(let i=0; i < editControls?.controls.length; i++){

//   denominations.JournalMasterNewEditors.push({
//     EditorName: editControls?.controls[i].controls.EditorName.value,  
//     Designation: editControls?.controls[i].controls.Designation.value,  
//     Email:editControls?.controls[i].controls.Email.value,
//     EditorAddress: editControls?.controls[i].controls.EditorAddress.value,
//     EditorType: editControls?.controls[i].controls.EditorType.value,
//   });

// }


// const formData = new FormData();
// formData.append('JournalTitle', denominations.JournalTitle);
// formData.append('SubTitle', denominations.SubTitle);
// formData.append('Introduction', denominations.Introduction);
// formData.append('Volume', denominations.Volume);
// formData.append('PublishDate', denominations.PublishDate);
// formData.append('ScopeofJournal', denominations.ScopeofJournal);
// formData.append('ThrustArea', denominations.ThrustArea);
// formData.append('ArticleType', denominations.ArticleType);
// formData.append('File', this.FileData);
// formData.append('JournalMasterNewDetails', JSON.stringify(denominations.JournalMasterNewDetails));
// formData.append('JournalMasterNewEditors', JSON.stringify(denominations.JournalMasterNewEditors));


// debugger;
// this.LpujournalbookService.addJournalData(formData).subscribe({
//   next: data => {
//     this.spinner.hide();

//     swal.fire(  {title: 'Journal ', text: 'Journal Data Save Successfully  !', icon: 'success'}).then(function() {
//       window.location.reload();
//   });
// },
// });

// }

// /**
//  * Returns form
//  */
// get form1() {
//   return this.validationForm1.controls;
// }

// /**
//  * Returns form
//  */
// get form2() {
//   return this.validationForm2.controls;
// }

// /**
//  * Go to next step while form value is valid
//  */
// form1Submit() {


//   if(this.validationForm1.valid) {
//     this.wizardForm.goToNextStep();
//   }
//   this.isForm1Submitted = true;
// }

// /**
//  * Go to next step while form value is valid
//  */
// form2Submit() {
//   debugger;
//   if(this.validationForm2.valid) {
//     this.wizardForm.goToNextStep();
//   }
//   this.isForm2Submitted = true;
// }

// }