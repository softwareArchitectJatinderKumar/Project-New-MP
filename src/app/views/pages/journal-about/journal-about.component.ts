
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';

import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
// import { CookieService } from 'ngx-cookie-service';
// import { LoginSessionService } from 'src/app/_services/login-session.service';
import swal from 'sweetalert2';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';

 
import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
import { DatePipe } from '@angular/common';

interface Book {
  id: number; bookId: string;  aboutBook: string;    bookPages: number;  totalCopies: number;  languages?: string;  ratingPoint?: string;
  publisher?: string;  publicationAddress?: string;  comments?: string;  issnNo?: string;  regNo?: string;  periodicity?: string;
  scope?: string;  charges?: string; openAccess?: string;  modeofAvailable?: string;  review?: string;  editorName?: string;  editorDesignation?: string;
  createdBy?: string;  editorCategory?: string;  imagePath?: string;
}
@Component({
  selector: 'app-journal-about',
  templateUrl: './journal-about.component.html',
  styleUrls: ['./journal-about.component.scss']
})
export class JournalAboutComponent implements OnInit {
  data: any[] =[];    BookId: any;  bookData: any;  JournalDetails: any;  //detailsArray: any;
  name: any;
  fileDataX: File;
  fileStatus: boolean;
  fileName: string;

  constructor(
    private journalWebApiService: LpujournalbookService, 
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    // private AuthSession: LoginSessionService,
    private router: Router,
    private route: ActivatedRoute,
    // private cookieService: CookieService,
  ) { }

  ngOnInit(): void {
    let BookId  = this.route.snapshot.params['Id'];
    let name  = this.route.snapshot.params['name'];
      if (BookId != undefined && BookId != null) {
        this.BookId = BookId;
        this.name= name;
        const journalCookiesData = {
          BookId: this.BookId,
          name: this.name,          
        };

        // this.cookieService.set('BookData', JSON.stringify(journalCookiesData));
        this.GetJournalDetailsAbout(this.BookId);
      } 
  }
  imageLoadError: boolean = false;
  GetJournalDetailsAbout(JournalId: any): void {
    this.journalWebApiService.GetJournalDetailsforAboutPage(JournalId).subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.bookData = response.item1[0];
        this.JournalDetails = this.bookData['journalDetails']
        this.extractDetails();
      }
      else {
        this.bookData = [];
        // this.router.navigateByUrl('/');
      }
      // console.log("javas  "+ JSON.stringify(this.bookData))
    });
  }
  extractDetails() {
    // Split the journalDetails string using the # delimiter
    const items = this.JournalDetails.split('#').map((item: string) => item.trim());

    // Split each item by the first occurrence of ":" and create an object for key-value
    this.detailsArray = items.map((item: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: (part: any) => any): [any, any]; new(): any; }; }; }) => {
      const [key, value] = item.split(':').map(part => part.trim());
      return { key, value };
    });
  }
  isEditMode = false;
  editableData: any = {};
  detailsArray: { key: string, value: string }[] = []; 
  imagePreview: string | ArrayBuffer | null = null; // For image preview
  selectedFile: File | null = null; // Holds the selected image file
  processJournalDetails() {
    if (this.bookData?.journalDetails) {
      const details = this.bookData.journalDetails.split('#');
      this.detailsArray = details.map((detail: { split: (arg0: string) => [any, any]; }) => {
        const [key, value] = detail.split(':');
        return { key: key.trim(), value: value.trim() };
      });
    }
  }
  toggleEditMode(enableEdit = true) {
    this.isEditMode = enableEdit;
    if (enableEdit) {
      // Populate editableData with bookData for editing
      this.editableData = { ...this.bookData };
      this.editableData.details = { ...this.detailsArray.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}) };
    } else {
      // Reset changes if cancel is clicked
      this.editableData = {};
    }
  }

  saveChanges() {
    // Merge edited details back into bookData
    this.detailsArray.forEach(detail => {
      detail.value = this.editableData.details[detail.key];
    });

    this.bookData = { ...this.bookData, ...this.editableData };
    // console.log("Dat a "+ JSON.stringify(this.bookData))
    // alert("Dat a "+ JSON.stringify(this.bookData))
    // API call to save changes (example, replace with actual service call)
    // this.apiService.updateJournal(this.bookData).subscribe(response => {
    //   this.toggleEditMode(false); // Exit edit mode after saving
    // });

    this.toggleEditMode(false); // Exit edit mode for now
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; // Preview the selected image
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  // onFileXSelected(event: any, id: number): void {
  //   this.fileChosen[id] = event.target.files.length > 0;
  //   const reader = new FileReader();
  //   const target = event.target as HTMLInputElement;
  //   const file: File | null = (target.files as FileList)[0] || null;
  
  //   if (file && file.size > 3148576) {
  //     swal.fire({
  //       title: 'File size exceeds 3 MB. Please upload a smaller file.',
  //       text: 'Invalid File size',
  //       icon: 'warning'
  //     });
  //     target.value = '';
  //     return;
  //   }
  
  //   const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  //   if (file && !fileNameRegex.test(file.name)) {
  //     const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
 
  //     const modifiedFile = new File([file], validFileName, { type: file.type });
  //     const dataTransfer = new DataTransfer();
  //     dataTransfer.items.add(modifiedFile);
  //     target.files = dataTransfer.files;
  
  //     this.fileDataX = modifiedFile;
  //     this.fileStatus = true;
      
  //     reader.readAsDataURL(modifiedFile);
  //     reader.onload = () => {
  //       const ssss = reader.result as string;
  //       const ssssArray = ssss.split(',');
  //       this.fileDataX = ssssArray[1];
  //       this.fileName = validFileName;
  //     };
  //     return;
  //   }
  
  //   this.fileDataX = file;
  //   this.fileStatus = true;
  
  //   if (file) {
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       const ssss = reader.result as string;
  //       const ssssArray = ssss.split(',');
  //       this.FileDataX = ssssArray[1];
  //       this.fileName = file.name;
  //     };
  //   }
  // }

  // saveOrUpdateData() {
  //   const payload = {
  //     id: this.bookData.id,
  //     journalTitle: this.bookData.journalTitle,
  //     subTitle: this.bookData.subTitle,
  //     introduction: this.bookData.introduction,
  //     volume: this.bookData.volume,
  //     publishDate: this.bookData.publishDate,
  //     scopeofJournal: this.bookData.scopeofJournal,
  //     thrustArea: this.bookData.thrustArea,
  //     articleType: this.bookData.articleType,
  //     editorName: this.bookData.editorName,
  //     designation: this.bookData.designation,
  //     editorAddress: this.bookData.editorAddress,
  //     editorType: this.bookData.editorType,
  //     journalDetails: this.bookData.journalDetails
  //   };

  //   // this.http.post('SAVE_UPDATE_API_ENDPOINT_HERE', payload).subscribe(
  //   //   response => {
  //   //     console.log('Data saved/updated successfully', response);
  //   //   },
  //   //   error => {
  //   //     console.error('Error saving/updating data', error);
  //   //   }
  //   // );
  // }
}
