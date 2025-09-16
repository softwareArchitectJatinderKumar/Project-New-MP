import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Angular Material imports
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-estate-actionable-point',
  standalone: true,
  templateUrl: './estate-actionable-point.component.html',
  styleUrls: ['./estate-actionable-point.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatStepperModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatPaginatorModule ,
    MatTableModule,
    MatButtonModule,
    MatCardModule, MatSelectModule,
    MatOptionModule, MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule, MatIconModule
  ]

})
export class EstateActionablePointComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  LocalUrl: any;
  serverUrl: any;
  @ViewChild(MatSort) sort: MatSort;

  errorMessage: any;
  isLoginFailed: boolean = false;
  inspectionType: any = '';





  actionablePoint: { session: string; functionName: string; task: string; activityDescription: string; startDate: any; endDate: any; responsibility: string; priority: string; supportingDocumentRequired: boolean; attachment: any; };
  UniqueId: string;
  EncryptKey: string;
  ipaddress: string;
  isAuthenticate: boolean;
  userName: any;
  routecomponent: string;
  assignForm!: FormGroup;

  //08/07/2025
  engineers: any[] = [];
  selectedEngineers: any[] = [];
  description: any;
  location:any;
  selectedFileURL: any;

  responsibilities: number[] = [];


  

  displayedColumns = ['id', 'name', 'role'];

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private Agreement: AgreementEntryService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private ObpService: ObpAutoAssignService,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    private modalService: NgbModal,

  ) { }

  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);

    }

  }
  LoginId: any;



  data: any = {
    session: '',
    functionName: '',
    task: '',
    description: '',
    responsibilities: [],
    priority: '',
    startDate: '',
    endDate: ''
  };


   ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  //08/07/2025
  loadEngineers(): void {
    this.ObpService.getSiteEngineers().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.engineers = res;
        } else if (res?.data && Array.isArray(res.data)) {
          this.engineers = res.data;
        } else if (res?.item1 && Array.isArray(res.item1)) {
          this.engineers = res.item1;
        } else {
          this.engineers = [];
          console.error('Unexpected response shape:', res);
        }

        this.responsibilities = this.engineers
          .filter(e => e.preSelected)
          .map(e => e.employeeCode);

      },
      error: err => {
        console.error('Error loading engineers:', err);
        this.engineers = [];
      }
    });
    this.getInspectionData();
  }
  ConstructionDetails: any[] = [];
 dataSource = new MatTableDataSource<any>();

statusFilter: string = '';
textFilter: string = '';

getInspectionData(): void {
  this.ObpService.getInspectionDetails().subscribe((response) => {
    if (response.item1 && response.item1.length > 0) {
      const dataWithId = response.item1.map((item: any, index: number) => ({
        ...item,
        localId: index + 1
      }));

      this.dataSource.data = dataWithId;

      this.dataSource.filterPredicate = this.customFilterPredicate();
      this.updateTableFilter(); // Apply current filter values
    } else {
      this.dataSource.data = [];
    }
  });
}

customFilterPredicate(): (data: any, filter: string) => boolean {
  return (data: any, filter: string): boolean => {
    const parsed = JSON.parse(filter);
    const status = data.status?.toLowerCase() || '';
    const taskDescription = data.taskDescription?.toLowerCase() || '';

    const matchStatus = parsed.status
      ? status === parsed.status.toLowerCase()
      : true;

    const matchText = parsed.text
      ? taskDescription.includes(parsed.text.toLowerCase())
      : true;

    return matchStatus && matchText;
  };
}


// Custom filter logic for text + status
// customFilterPredicate(): (data: any, filter: string) => boolean {
//   return (data: any, filter: string): boolean => {
//     const searchStr = JSON.parse(filter);
//     const textMatch =
//       data.taskDescription?.toLowerCase().includes(searchStr.text) ||
//       data.employeeName?.toLowerCase().includes(searchStr.text);
//     const statusMatch = searchStr.status ? data.taskStatus === searchStr.status : true;
//     return textMatch && statusMatch;
//   };
// }

// Apply both filters
applyFilter(event: Event): void {
  this.textFilter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.updateTableFilter();
}

 onStatusChange(value: string): void {
    this.statusFilter = value;
    this.updateTableFilter();
  }

  updateTableFilter(): void {
    const filter = {
      text: this.textFilter,
      status: this.statusFilter
    };
    this.dataSource.filter = JSON.stringify(filter);
  }

  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }

        this.loadEngineers();
        this.serverUrl = 'https://files.lpu.in/umsweb/Construction/ConstructionInspection/';
        // this.LocalUrl = 'http://172.19.2.52/umsweb/webftp/Construction/ConstructionInspection/';

        const element = document.getElementById('OBPAdminAction');
        if (element) {
          element.hidden = false;
        }
        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'OBP Estate <span class="themeClr" >Verification</span>';
        (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';
        // (<HTMLInputElement>document.getElementById('DocumentDetailsTable')).style.display = 'none';
      },
      error: _err => {
        this.LoginFailed(_err);
      }
    });
  }

  LoginFailed(NewError: any) {
    this.errorMessage = NewError;
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('stMain');
    if (element) {
      element.hidden = true;
    }
  }


  submitForm(form: NgForm) {
    if (form.valid) {
      console.log('Form Data:', this.data);
      // Submit to server or perform your action
    }
  }

  triggerFileInput(): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.click();
    } else {
      console.error('fileInputRef not found.');
    }
  }
  file: any;

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.file = target?.files?.[0] ?? null;
    // this.actionablePoint.attachment = file;
  }
  // in component class
  fileStatus: any;
  fileData: any;
  FileData: any;
  selectedFile: File | null = null;
  fileName: string = '';
  uploadEnabled: boolean = false;
  EngineerName: any;
  EngineerId: any;
  onFileSelected(event: any): void {

    this.fileStatus = false;
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (!file) return;

    if (file.size > 500 * 1024) {
      swal.fire({
        title: 'File size exceeds 500 KB. Please upload a smaller file.',
        text: 'Invalid File size',
        icon: 'warning'
      });
      target.value = '';
      return;
    }

    const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!fileNameRegex.test(file.name)) {
      const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const modifiedFile = new File([file], validFileName, { type: file.type });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(modifiedFile);
      target.files = dataTransfer.files;

      this.selectedFile = modifiedFile;
      this.fileName = validFileName;
      this.fileStatus = true;

      reader.readAsDataURL(modifiedFile);
    } else {
      this.selectedFile = file;
      this.fileName = file.name;
      this.fileStatus = true;
      reader.readAsDataURL(file);
    }
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.FileData = base64Data;
      this.uploadEnabled = true;
    };
  }

  onSubmitTask(): void {
    if (!this.description || !this.responsibilities) {
      alert('Please fill required fields');
      return;
    }

    const formData = new FormData();
    formData.append('EmployeeUID', this.responsibilities.toString());  // single UID
    formData.append('InspectionType', this.inspectionType);
    formData.append('TaskDescription', this.description);
    formData.append('ImageURL', this.fileName);
    formData.append('ImageData', this.FileData);

    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });

    this.ObpService.insertConstructionInspectionTask(formData).subscribe({
      next: () => swal.fire({
        title: 'Saved Successfully!',
        icon: 'success'
      }).then(() => {
        window.location.reload();
      }),
      error: (err) => alert('Error inserting task: ' + err.message)
    });
  }



  onReset(): void {
    // Reset the form
    this.actionablePoint = {
      session: 'Jul-2024 :: Jun-2025',
      functionName: 'Actionable Points',
      task: '',
      activityDescription: '',
      startDate: null,
      endDate: null,
      responsibility: '',
      priority: '',
      supportingDocumentRequired: false,
      attachment: null
    };
  }


  onEngineersChanged(event: any): void {
    this.selectedEngineers = event.value; // event.value is number[]
  }

  downloadImage(imageUrl: string) {
    // Convert backslashes to forward slashes if necessary
    const cleanUrl = imageUrl.replace(/\\/g, '/');
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.target = '_blank';
    link.download = 'image_' + Date.now() + '.jpg'; // You can adjust the filename as needed
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // For strict security environments:
    window.open(this.serverUrl+cleanUrl, '_blank');
  }

  engdownloadImage(proofImageURL: string) {
    // Convert backslashes to forward slashes if necessary
    const cleanUrl = proofImageURL.replace(/\\/g, '/');
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.target = '_blank';
    link.download = 'image_' + Date.now() + '.jpg'; // You can adjust the filename as needed
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // For strict security environments:
    window.open(this.serverUrl+cleanUrl, '_blank');
  }
}
