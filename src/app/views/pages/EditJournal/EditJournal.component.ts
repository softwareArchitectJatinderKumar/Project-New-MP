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
  templateUrl: './EditJournal.component.html',
  styleUrls: ['./EditJournal.component.scss']
})
export class EditJournalComponent implements OnInit {
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  allJournals: any;
  filteredJournal: any | null = null;
  selectedJournalId: string = '';
  currentStep: number = 1;
  AllJournalsDetails:  any[] = []; TempAllJournalsDetails : any[]=[];  headHtmlData: never[]; isInputDisabled:boolean = true;    JournalId: any; fileNamesX: string;   ColumnMode = ColumnMode;    FileDataX: string;      searchQueryx: any;

  validationForm1: UntypedFormGroup;
  validationForm2: UntypedFormGroup;

  isForm1Submitted: Boolean;    isForm2Submitted: Boolean;

  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  htmlText = `<p> Journal Introduction </p>`
  // quillConfig = {
  //   toolbar: {
  //     container: [
  //       ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  //       ['code-block'],
  //       //  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  //       [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  //       [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
  //       [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
  //       //  [{ 'direction': 'rtl' }],                         // text direction

  //       //  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  //       [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  //       [{ 'align': [] }],

  //       //  ['clean'],                                         // remove formatting button

  //       //  ['link'],
  //       ['link', 'image', 'video']
  //     ],
  //   },
  // }
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
  ImageUrl: any;

  constructor( private LpujournalbookService: LpujournalbookService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,  private router: Router,
    private storageService: StorageService, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder, private journalService: LpujournalbookService) {}
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
  


  ngOnInit(): void {
    this.getAllJournals();

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

    // this.quantities().push(this.newQuantity());
    // this.validationForm2 = this.formBuilder.group({
    //   ISSNNo: ['', Validators.required],
    //   RegNo: ['', Validators.required],
    //   Periodicity: ['', Validators.required],
    //   Language: ['', Validators.required],
    //   Scope: ['', Validators.required],
    //   ArticleProcessCharges: ['', Validators.required],
    //   OpenAccess: ['', Validators.required],
    //   Print: ['', Validators.required],
    //   Online: ['', Validators.required],
    //   ReviewProcess: ['', Validators.required]

    // });

    this.isForm1Submitted = false;
    this.isForm2Submitted = false;

    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">Journal </span> Master';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
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
  
  // Fetch all journals on initialization
  getAllJournals(): void {
    this.journalService.GetAllBooksDetails().subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.allJournals = response.item1;  
        // console.log(this.allJournals)      
      // Assuming the data structure might be like { data: [...] }
      // this.allJournals = Array.isArray(data) ? data : data.item1 || [];  // E
    }
    else {
        console.error('Error fetching journals');
      }
  });
  }

  // Filter a journal by ID
  filterJournalById(): void {
    // alert("data " +JSON.stringify(this.allJournals.filter((item: { id: any }) => item.id == this.selectedJournalId)));
    // console.log("data " +JSON.stringify(this.allJournals.filter((item: { id: any }) => item.id == this.selectedJournalId)));
   // alert("data " +JSON.stringify(this.allJournals.filter((item: { id: any; }) => item.id.equal(this.selectedJournalId)))); //
    this.filteredJournal = this.allJournals.filter((item: { id: any }) => item.id == this.selectedJournalId);//;this.allJournals.find(journal =>journal.id == this.selectedJournalId) || null;
    if (this.filteredJournal) {
      this.currentStep = 1;  // Reset to first step
      
      if (this.validationForm1) {
        this.validationForm1.patchValue({
          id: this.filteredJournal.id,
          journalTitle: this.filteredJournal.journalTitle,
          introduction: this.filteredJournal.introduction,
          subTitle: this.filteredJournal.subTitle,
          volumne: this.filteredJournal.volumne,
          scopeofJournal: this.filteredJournal.scopeofJournal,
          publishDate: this.filteredJournal.publishDate,
          thrustArea: this.filteredJournal.thrustArea,
          articleType: this.filteredJournal.articleType,
          imageUrl: this.filteredJournal.imageUrl
        });
      }
        // this.form2.patchValue({
        //   id: this.filteredJournal.id,
        //   journalTitle: this.filteredJournal.journalTitle,
        //   articleType: this.filteredJournal.articleType,
        //   publishDate: this.filteredJournal.publishDate
        // });
        // id= this.filteredJournal.id,
       
      
      // ScopeofJournal: this.validationForm1.controls.scopeofjournals.value,
      // ThrustArea: this.validationForm1.controls.thrustArea.value,
      // ArticleType: this.validationForm1.controls.ArticleType.value,
      // JournalMasterNewDetails: this.keyData,
      // JournalMasterNewEditors: this.EditorData
    }
  }

  // Navigate to next step
  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  // Navigate to previous step
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Save journal (implement API call here)
  saveJournal(): void {
    // console.log('Saving journal', this.filteredJournal);
    // Add your save logic here
  } 
  
  get form1() {
    return this.validationForm1.controls;
  }

  /**
   * Returns form
   */
  get form2() {
    return this.validationForm2.controls;
  }
  
  form1Submit() {
    if (this.validationForm1.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm1Submitted = true;
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
    // console.log("On Focus");
  }
  onBlur = () => {
    // console.log("Blurred");
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
  form2Submit() {
    
    if (this.validationForm2.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm2Submitted = true;
  }

  
  onSubmitFinal() {
    // console.log(this.editorForm.value);
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

}