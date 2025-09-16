import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon'; 

import {
  FormBuilder,
  FormsModule,
  
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { TablerIconsModule } from 'angular-tabler-icons';
// Angular Material imports
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-estate-actionable-point',
  standalone: true,
  templateUrl: './estate-actionable-point-completetask.component.html',
  styleUrls: ['./estate-actionable-point-completetask.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule, MatCheckboxModule, MatDatepickerModule, NgSelectModule,MatIconModule
  ]
})
export class EstateActionablePointCompleteTaskComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  LocalUrl: any;
  serverUrl: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  errorMessage: any;
  isLoginFailed: boolean = false;
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });


  actionablePoint: { session: string; functionName: string; task: string; activityDescription: string; startDate: any; endDate: any; responsibility: string; priority: string; supportingDocumentRequired: boolean; attachment: any; };
  UniqueId: string;
  EncryptKey: string;
  ipaddress: string;
  isAuthenticate: boolean;
  userName: any;
  routecomponent: string;
  assignForm!: FormGroup;
  // taskList = ['Task A', 'Task B', 'Task C'];
  priorities = ['Low', 'Medium', 'High'];

  taskList: any[] = [];
  fileStatus: any;
  fileData: any;
  FileData: any;
  //selectedFile: File | null = null;
  fileName: string = '';
  uploadEnabled: boolean = false;

  



  // constructor(private route: ActivatedRoute ,private _formBuilder: FormBuilder ,private ObpService: ObpAutoAssignService,) { }

  constructor(
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
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
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        var authToken = this.storageService.getUser();
        if (this.storageService.isLoggedIn() == false && authToken == 'Token Expired') {
          this.LoginFailed('Token Expired');
        }

        this.getInspectionData();
        this.initializeForm();
        //this.serverUrl = 'https://files.lpu.in/umsweb/Construction/ConstructionInspection/';
        // this.LocalUrl = 'http://172.19.2.52/umsweb/webftp/Construction/ConstructionInspection/';

        const element = document.getElementById('OBPAdminAction');
        if (element) {
          element.hidden = false;
        }
        (<HTMLInputElement>document.getElementById('stMain')).innerHTML = 'OBP Inspection <span class="themeClr" >Engineer Task</span>';
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



  onFileChange(event: any): void {
    this.actionablePoint.attachment = event.target.files[0] || null;
  }


  //Add 21-07/2025
  ConstructionDetails: any[] = [];




  // Added on 22- july-25
  formdata: FormGroup;
  task: any = { taskDescription: 'Example Task Description' };
  InspectionType: any = ' ';
  Description: any = '';
  startDate: any = '';
  endDate: any = '';
  status: any = '';

  //fileDataMap: Map<number, string> = new Map();






  selectedFile?: File;
  selectedFileName: string = '';




  initializeForm(): void {
    this.formdata = this.fb.group({
      InspectionType: ['', Validators.required],
      Remarks: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      Status: ['Pending', Validators.required],
      proofImageURL: [''],
    });
  }

downloadImage(proofImageURL: string) {
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



  getInspectionData(): void {
  this.ObpService.getEmployeeInspectionDetails().subscribe({
    next: (response) => {
      if (response.item1 && response.item1.length > 0) {
        this.ConstructionDetails = response.item1.map((task: any) => {
  const formatDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }
    if (typeof date === 'string' && date.includes('/Date(')) {
      const timestamp = parseInt(date.replace(/\/Date\((\d+)\)\//, '$1'), 10);
      return new Date(timestamp).toISOString().split('T')[0];
    }
    return '';
  };

  return {
    ...task,
    status: task.status || 'Pending',
    remarks: task.remarks || '',
    startDate: formatDate(task.startDate),
    endDate: formatDate(task.enddate)  // <-- fixed key name here
  };
});

      } else {
        this.ConstructionDetails = [];
        Swal.fire('Info', 'No inspection tasks found', 'info');
      }
    },
    error: (err) => {
      console.error('Error fetching inspection data:', err);
      Swal.fire('Error', 'Failed to load inspection data', 'error');
    }
  });
}




 // file-upload.component.ts
// Optimized file upload and submit logic

fileDataMap: Map<number, {
  fileName: string;
  fileType: string;
  base64Data: string;
}> = new Map();

onFileSelected(event: Event, index: number): void {
  this.fileStatus = false;
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    this.fileDataMap.delete(index);
    return;
  }

  const MAX_SIZE_KB = 500 * 1024;
  if (file.size > MAX_SIZE_KB) {
    Swal.fire({
      title: 'File size exceeds 500 KB. Please upload a smaller file.',
      text: 'Invalid File size',
      icon: 'warning'
    });
    input.value = '';
    this.fileDataMap.delete(index);
    return;
  }

  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  let finalFile = file;
  let fileName = file.name;

  if (!fileNameRegex.test(file.name)) {
    fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    finalFile = new File([file], fileName, { type: file.type });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(finalFile);
    input.files = dataTransfer.files;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64Data = (reader.result as string).split(',')[1];

    this.fileDataMap.set(index, {
      fileName,
      fileType: finalFile.type,
      base64Data
    });

    this.fileStatus = true;
    this.uploadEnabled = true;
  };

  reader.readAsDataURL(finalFile);
}

async onSubmitTable(index: number): Promise<void> {
  debugger;
  try {
    const task = this.ConstructionDetails[index];
    const remarks = task.remarks?.trim();
    const startDate = task.startDate;
    const endDate = task.endDate;
    const status = task.status;

    const fileData = this.fileDataMap.get(index);
    const proofImageURL = fileData?.fileName || '';
    const proofImageData = fileData?.base64Data || '';

    if (!remarks) {
      await Swal.fire('Error', 'Please enter remarks', 'error');
      return;
    }
    if (!startDate || !endDate) {
      await Swal.fire('Error', 'Select both start and end dates', 'error');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      await Swal.fire('Error', 'End date cannot be before start date', 'error');
      return;
    }

    

    await this.sendData(task.taskID, remarks, startDate, endDate, status, proofImageURL, proofImageData);
    await Swal.fire('Success!', 'Task updated successfully', 'success');
  } catch (error) {
    console.error('Submit error:', error);
    await Swal.fire('Error', 'Failed to submit task', 'error');
  }
}

private sendData(
  taskID: number,
  remarks: string,
  startDate: string,
  endDate: string,
  status: string,
  proofImageURL: string,
  proofImageData: string
): Promise<void> {
  const formData = new FormData();
  formData.append('TaskId', taskID.toString());
  formData.append('Remarks', remarks);
  formData.append('StartDate', new Date(startDate).toISOString());
  formData.append('EndDate', new Date(endDate).toISOString());
  formData.append('Status', status);
  formData.append('AssignedBy', this.storageService.getUser());

  if (proofImageURL) formData.append('ProofImageURL', proofImageURL);
  if (proofImageData) formData.append('ProofImageData', proofImageData);

  // Debug helper (optional)
  formData.forEach((val, key) => console.log(key + ':', val));

  return new Promise<void>((resolve, reject) => {
    this.ObpService.UpdateConstructionInspectionTask(formData).subscribe({
      next: () => resolve(),
      error: (err) => reject(err)
    });
  });
}


isDownloadDisabled(task: any): boolean {
  return task.endDate !== '' && task.status === 'Completed';
}


}