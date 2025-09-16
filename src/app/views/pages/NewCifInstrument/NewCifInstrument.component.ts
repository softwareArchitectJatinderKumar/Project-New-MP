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
import { ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Inject, TemplateRef } from '@angular/core';
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
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
interface SchoolDivision {
  id: string;
  schoolDivision: string;
}

@Component({
  selector: 'app-content',
  templateUrl: './NewCifInstrument.component.html',
  styleUrls: ['./NewCifInstrument.component.scss']
})
export class NewCifInstrumentComponent implements OnInit {

  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  htmlText = `<p> Description </p>`

  isLoginFailed: boolean = false; dynamicForm: FormGroup;
  responses: any; fileDataX: File; fileStatus: boolean; FileData: any; fileName: string;
  uploadEnabled: boolean = false; properties: any[] = [];
  responsesData: any[] = [];
  loadingIndicator: boolean; columns: any;
  fileData: File;
  constructor(
    private LpuCIFWebInstrumentService: LpuCIFWebService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal, private router: Router,
    private storageService: StorageService, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
    private fb: FormBuilder) { }

  validationForm1: FormGroup;
  isForm1Submitted: boolean = false;
  ITitle: string = '';
  IStatus: string = '';
  IDescription: string = '';
  fileNames: any = '';

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

  ngOnInit(): void {
    this.LoadForm();
    this.getAllInstrumentsDetail();
    this.isForm1Submitted = false;
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">CIF Instrument </span> Master';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }

  }

  get InstrumentTitle() { return this.validationForm1.get('InstrumentTitle'); }
  get Description() { return this.validationForm1.get('Description'); }
  get Status() { return this.validationForm1.get('Status'); }


  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        // this.getBooksDetail();
        this.dynamicForm = this.fb.group({});
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }



  getAllInstrumentsDetail(): void {
    this.LpuCIFWebInstrumentService.GetAllInstrumentsData().subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.AllInstrumentsDetails = response.item1;
        this.TempAllInstrumentsDetails = this.AllInstrumentsDetails;
        // console.log(JSON.stringify(this.AllInstrumentsDetails))
        this.loadingIndicator = false;
        this.columns = []; this.headHtmlData = [];
        this.headHtmlData = this.TempAllInstrumentsDetails[0];
        this.columns = Object.keys(this.TempAllInstrumentsDetails[0]);
        this.columns = this.columns.filter((item: any) => item !== 'imageUrl' && item !== 'description' && item !== 'isActive' && item !== 'id' && item !== 'categoryId' && item !== 'labName' && item !== 'isHourly');
        this.columns.push()
        this.loadingIndicator = false;
      }
      else {
        this.TempAllInstrumentsDetails = [];
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



  LoadForm(): void {
    this.validationForm1 = this.formBuilder.group({
      InstrumentTitle: ['', Validators.required],
      Description: ['', Validators.required],
      Status: ['', Validators.required],
      file: [null, Validators.required],

    });

  }

  LoginFailed(_NewError: any) {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('NewInstrument-Entry');
    if (element) {
      element.hidden = true;
    }
  }


  onFileSelected(e: any): void {
    const reader = new FileReader();
    const target = e.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;
    if (file && file.size > 10148576) {
      swal.fire({
        title: 'File size exceeds 10MB. Please upload a smaller file.',
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

      this.fileData = modifiedFile;
      this.fileStatus = true;

      reader.readAsDataURL(modifiedFile);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = validFileName;
      };
      this.uploadEnabled = true;
      return;
    }

    this.fileData = file;
    this.fileStatus = true;
    // alert(10);
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const ssss = reader.result as string;
        const ssssArray = ssss.split(',');
        this.FileData = ssssArray[1];
        this.fileName = file.name;


      };
    }
  }

  finishFunction() {
    this.spinner.show();
    let a = this.validationForm1.controls;

    const denominations =
    {
      InstrumentTitle: this.validationForm1.controls.InstrumentTitle.value,
      Status: this.validationForm1.controls.Status.value,
      Description: this.validationForm1.controls.Description.value,
    }
    const formData = new FormData();
    formData.append('InstrumentTitle', denominations.InstrumentTitle);
    formData.append('Status', denominations.Status);
    formData.append('Description', denominations.Description);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });
    this.spinner.hide();
    this.LpuCIFWebInstrumentService.InsertInstrumentDetails(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'OK') {
          swal.fire({
            title: 'Instrument Data Save Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else {
          swal.fire({
            title: 'Something Went Wrong, Try again later',
            icon: 'error'
          }).then(() => {
            window.location.reload();
          });
        }
      },
      error: (error: any) => {
        swal.fire({
          title: 'Error',
          text: 'Failed to Upload.',
          icon: 'error'
        }).then(() => {
          window.location.reload();
        });
      },
      complete: () => {
      }
    });
  }


  get form1() {
    return this.validationForm1.controls;
  }


  form1Submit() {
    if (this.validationForm1.valid) {
      this.finishFunction();
    }
    this.isForm1Submitted = true;
  }


  //  Tab two Edit Instruments to upload image and description

  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  AllInstrumentsDetails: any[] = []; TempAllInstrumentsDetails: any[] = [];
  headHtmlData: never[]; isInputDisabled: boolean = true; InstrumentId: any; InstrumentTitles: any;
  fileNamesX: string; ColumnMode = ColumnMode; FileDataX: string; searchQueryx: any; StatusInstrument: any = false;


  ChangeStatus(event: any) {
    this.StatusInstrument = event.target.checked;
    // alert(this.StatusInstrument);
  }

  searchx() {
    const query = this.searchQueryx.toLowerCase();
    this.TempAllInstrumentsDetails = this.AllInstrumentsDetails.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      );
    });
  }

  onSelectFile(a: any) {
    let aa = a;
    window.open(aa.imageUrl, '_blank');
  }


  exportToExcel(): void {
    const fileName = 'Instruments_Document_report.xlsx';
    const exportedData = this.AllInstrumentsDetails.map(item => ({
      Id: item.instrumentId,
      Title: item.instrumentName,
      Description: item.description
    }));
    const header = [
      'Id',
      'Title',
      'Description',
    ];
    const ws_data = [header, ...exportedData.map(item => Object.values(item))];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
    for (let i = 1; i < ws_data.length; i++) { // Start from 1 to skip the header row
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 3 }); // Column 7 is DocumentUrl
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
  onSelect(a: any) {
    let aa = a;
    this.InstrumentId = aa['id'];
    this.InstrumentTitles = aa['instrumentName'];
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {

      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  fileChosen: { [key: number]: boolean } = {};
  onFileXSelected(event: any, id: number): void {
    this.fileChosen[id] = event.target.files.length > 0;
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (file && file.size > 10148576) {
      swal.fire({
        title: 'File size exceeds 10 MB. Please upload a smaller file.',
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


  UpdateFileDocument(Id: any) {
    if (this.fileChosen[Id]) {
      const formData = new FormData();
      formData.append('InstrumentId', Id);
      formData.append('IsActive', this.StatusInstrument);
      formData.append('FilePath', this.fileName);
      formData.append('File', this.FileDataX);

      this.LpuCIFWebInstrumentService.UpdateInstrumentImageFile(formData).subscribe({
        next: (data: any) => {
          const result = data.item1[0]['msg'];
          if (result === 'ok') {
            swal.fire({
              title: 'Uploaded the Document',
              text: 'Document uploaded successfully!',
              icon: 'success',
              timer: 5000, // Display for 3 seconds
              showConfirmButton: false,
            }).then(() => {
              window.location.reload(); // Reload the page after the success message
            });
          } else if (result === 'Failed') {
            swal.fire({
              title: 'Failed to Upload',
              text: result,
              icon: 'error',
              timer: 5000, // Display for 3 seconds
              showConfirmButton: false,
            });
          }
        },
        error: (error: any) => {
          swal.fire({
            title: 'Error',
            text: 'Internal Server error',
            icon: 'error',
            timer: 10000, // Display for 3 seconds
            showConfirmButton: false,
          });
        },
        complete: () => {

        },
      });
    }
  }



  // UpdateFileDocument(Id: any) {
  //   if (this.fileChosen[Id]) {
  //     const formData = new FormData();
  //     formData.append('InstrumentId', Id);
  //     formData.append('IsActive', this.StatusInstrument );
  //     formData.append('FilePath', this.fileName);
  //     formData.append('File', this.FileDataX);
  //     // formData.forEach((value, key) => {
  //     //   console.log(key, value);
  //     // });
  //     this.LpuCIFWebInstrumentService.UpdateInstrumentImageFile(formData).subscribe({
  //       next: (data: any) => {
  //         const result = data.item1[0]['msg'];
  //         // alert(JSON.stringify(result))
  //         if (result === 'ok') {
  //           swal.fire({
  //             title: 'Uploaded the Document',
  //             text: data.item1[0]['msg'],
  //             icon: 'success'
  //           }).then(() => {
  //             // window.location.reload();
  //           });
  //         } else if (result === 'Failed') {
  //           swal.fire({
  //             title: 'Failed to Upload',
  //             text: result,
  //             icon: 'error'
  //           });
  //         }
  //       },
  //       error: (error: any) => {
  //         swal.fire({
  //           title: 'Error',
  //           text: 'Internal Server error',
  //           icon: 'error'
  //         });
  //       },
  //       complete: () => {
  //         window.location.reload();
  //       }
  //     });
  //   }
  // }
}
