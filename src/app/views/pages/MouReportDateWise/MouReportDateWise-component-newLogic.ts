import { CommonModule } from '@angular/common';
import { MouActivity } from './MouActivity';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { ObpAutoAssignService } from 'src/app/_services/obpAuto-assign';
import { mouActivities } from './mouActivities';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { AgreementEntryService } from 'src/app/_services/agreement-entry.service';
import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DOCUMENT } from '@angular/common';
import { Details, RESPONSE, RESULT } from 'src/app/_model/placementDrive';
import { DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { MatTableDataSource } from '@angular/material/table';

import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { RMSService } from 'src/app/_services/rms.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-MouReportDateWise11',
  templateUrl: './MouReportDateWise.component-new-logic.html',
  styleUrls: ['./MouReportDateWise.component.scss'],
  providers: [DatePipe]
})
export class MouReportDateWiseComponent implements OnInit {


  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ngSelectComponentStream') ngSelectComponentStream: NgSelectComponent;
  @ViewChild('verticalCenteredModal') verticalCenteredModal: TemplateRef<any>;
  @ViewChild('viewDescModal') viewDescModal: TemplateRef<any>;
  @ViewChild('viewActivityActionTakenModal') viewActivityActionTakenModal: TemplateRef<any>;
  searchQuery: any;

  @ViewChild('getMetric', { static: true }) getMetric!: NgForm;
  fromDate: any = 0; MouDataColumns: any; toDate: any = 0; 
  dataSource: any[] = []; data: any; MouData: any; // DEveloper Name Jatinder31309
  dataShowing: any = false;
  //dataSource = new MatTableDataSource<any>;
  dataSources: MatTableDataSource<any> = new MatTableDataSource<any>();
  constructor(private http: HttpClient, private MOUService: MouDocumentsService, private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private Agreement: AgreementEntryService,
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private ObpService: ObpAutoAssignService,
    private datePipe: DatePipe,
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) _document: Document,
    private modalService: NgbModal,
    private mouDocumentsService: MouDocumentsService,) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    });
  }
  displayedColumns: string[] = [
    'dsrRatingDO',
    'totalRMS', 'responseasperpolicyCount', 'incompleteresponseCount', 'issuenoteffectivelyredressedCount', 'lateresponseCount'
  ];
  HeaddisplayedColumns: string[] = [
    'DsrRating DO',
    'Total RMS', 'Responseas /PolicyCount', 'Incomplete ResponseCount', 'Issuenot-Effectively-RedressedCount', 'Late-ResponseCount'
  ];
  dataLoaded: boolean = false;

  ngOnInit(): void {
    let loginName = this.route.snapshot.params['loginName'];
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML = '<span class="themeClr">MOU DateWise</span> Report  <span class="themeClr"></span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width = '164px';

    if (loginName != '' && loginName != undefined) {
      this.getToken(loginName);
    }
  }
  getToken(id: any) {

    this.authService.loginTemp(id).subscribe({
      next: data => {

        this.storageService.saveUser(data);
        // this.showData();
      },
      error: err => {
        // this.isLoading=0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

  Reset() {
    window.location.reload();

  }
  exportExcel() {
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);  
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
    // XLSX.writeFile(wb, 'Data.xlsx');  

    let element = document.getElementById('dataTableExampleNews');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'MouReportDateWise.xlsx');


  }
  ResetData() {
    this.fromDate = this.toDate = '';
    this.MouData = [];
    this.dataShowing = false;
  }
  isLoading: boolean = false;



  showData() {
    this.isLoading = true;
    this.MOUService.MouActivityandActionDetails(this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.dataSource = data.item1;
        // console.log(JSON.stringify(this.dataSource))
        this.dataLoaded = true;
        this.MouData = data.item1;
        if (this.MouData?.length > 0) {
          this.MouDataColumns = Object.keys(this.MouData[0]);
        }
        this.dataShowing = true;
        setTimeout(() => {

          var wrapper1 = (<HTMLInputElement>document.getElementById('wrapper1'));
          var wrapper2 = (<HTMLInputElement>document.getElementById('wrapper2'));
          wrapper1.onscroll = function () {
            wrapper2.scrollLeft = wrapper1.scrollLeft;
          };
          wrapper2.onscroll = function () {
            wrapper1.scrollLeft = wrapper2.scrollLeft;
          };

        }, 4000);

      },
      error: (error) => {
        this.dataShowing = false;
        console.error('Error fetching data', error);
      },
      complete: () => {
        this.dataShowing = true;
        // console.log('Data fetching complete');
        this.isLoading = false;
      }
    });
  }

  DownloadUploadedAction(row: any) {
    // console.log(JSON.stringify(row));
    alert(JSON.stringify(row));
    //mouActionTakenDocument
    window.open(row.mouActionTakenDocument, '_blank');
  }

  Activities: any;
  Activity: any='';
  selectedActivityType: string = '';  

  sessionId: any = ''; // Default empty value
  items: any[] = []; // Array to store dropdown options
  SessionId: any = 'Select';   
  ParticipantsCount: any='';
  formdata = new FormGroup({
    mouActivity: new FormControl('', Validators.required),
    remarks: new FormControl('', Validators.required),
    CompletedDate: new FormControl('', Validators.required),
    File: new FormControl('', Validators.required),
    sessionId: new FormControl('Select', Validators.required),    
    ParticipantsCount: new FormControl('', Validators.required),    
  })

  getDropdownData(): void {
    this.ObpService.GetAllOBPPlannerSessions().subscribe({
      next: response => {
        if (response.item1 ) {
          this.items = response.item1;  
          // console.log(JSON.stringify(this.items))
        }
      }
    })
  }


  @ViewChild('fileInput') fileInput!: ElementRef;
  isLogin: boolean = false;
  loadingIndicator = false; showNoDataFoundMessage: boolean = false;
  userId: any; MouIdList: any; mouId: any; MouIdListSort: any; MouActivityData: any[] = []; MouActivityDocuments: any[] = [];


  errorMessage: any; isLoginFailed: boolean = false; MouPartner: any; FileData: any; array: any[] = []; fileData: File | null = null; // Updated type
  fileStatus: boolean = false; fileName: string; fileChosen: { [key: number]: boolean } = {}; uploadEnabled: boolean = false; MouActivityDataX: any[];
  filterText: string = ''; filteredMouActivityData: any[] = []; filteredMouActivityDataX: any[] = []; updateEnabled: boolean; developerText: string = "jatinder 31309";



  TableData: any = []; Arr = Array; TableDataCreatedBy: any = []; form: FormGroup; partnerNamesMap: { [key: number]: string } = {};
  selectedId: number | undefined; partnerName: string | undefined; mouActivity: any; CompletedDate: any; endDate: any; EmployeeDetails: any;
  EmployeeCode: any; Department: any; EmployeeName: any; ContactNoX: any; ServerUrl: any; mouActivities: MouActivity[] = []; selectedActivityId: number;
  ResponsiblePerson: any = ''; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];

  MouActionTakenDocuments: any[] = []; filteredMouActionTakenDocuments: any[] = [];


  takeActionForm!: FormGroup;
  
  DocumentName: string = '';
  expectedStartDate: string = '';
  expectedEndDate: string = '';
  uploadedFileUrl: string = '';
  currentDisapprovalReason: string = '';
  Remarks: any;
  MouStatus: any;

  filteredMouActivityDocuments: any[] = [];
  ExpectedstartDate: any;
  ExpectedEndDate: any;
  DepartmentName: any;
  UploadedFileUrl: any = '';
  PresentDate: any ='';
  CurrentApprovalStatus: any;
  CurrentdisapprovalReason: any;
  ActivityDetails: any;

  onSelect(a: any) {
    let aa = a;
    alert(JSON.stringify(aa))
    this.mouId = aa['mouid']
    this.ActivityDetails = aa['activityDetails'];
    if(this.ActivityDetails?.length>0){
    const [id, description] = this.ActivityDetails.split('-', 2);
    // Assign the values to the class properties
    this.selectedActivityId = parseInt(id, 10);
    this.DocumentName = description;
    }
    else{

    }
    this.ExpectedstartDate = a['activityStartDate'];
    this.ExpectedEndDate = a['activityEndDate'];
    this.UploadedFileUrl=a['mouDocument'] ;
    this.CurrentApprovalStatus = a['mouActivityApprovalStatus'];
    this.CurrentdisapprovalReason = a['mouActivityDisapprovalReason'];
    this.MouStatus=aa['mouStatus']==null?'NA':aa['mouStatus'];
    // alert(this.MouStatus)
    // <ng-container *ngIf="row.approvalStatus != null && row.disapprovalReason?.length > 0;" >
    this.PresentDate =  this.datePipe.transform(new Date(), 'dd-MMM-yyyy');
      // alert(this.formatDates(this.PresentDate) +">" + this.formatDates(this.ExpectedEndDate))
    // if(this.formatDates(this.PresentDate) > this.formatDates(this.ExpectedEndDate))
    // {
    //   // alert('Not Applicable')
    //   swal.fire({
    //     title: 'Since Expected End Date is Lapsed So Action is not Allowed , Contact Your HOS',
    //     icon: 'error'
    //   })
    // }
    // else
    // {
    this.modalService.open(this.viewDescModal, { size: 'sm' }).result.then((result) => {
      // console.log("Modal closed" + result);
      window.location.reload();
    }).catch((res) => { });
  //  }
}

  testClick(a: any): void {
    const fileUrl = `assets/MouTemplateDocuments/${this.selectedActivityId}.zip`;
    const link = document.createElement('a');
    const selectedActivity = this.mouActivities.find(activity => activity.id === +a);
    if (selectedActivity) {
      // alert('Selected Activity Description:'+ selectedActivity?.description);
      this.DocumentName =  selectedActivity?.description
    }
    link.href = fileUrl;
    link.download = `${this.selectedActivityId}.zip`;
    link.click();
  }
  onActivitySelected(event: any): void {
    this.selectedActivityId = event.target.value;
    const selectedActivity = this.mouActivities.find(activity => activity.id === +this.selectedActivityId);;
    if (selectedActivity) {
      // console.log('Selected Activity Description:', selectedActivity?.description);
//      alert('Selected Activity Description:'+ selectedActivity?.description);
      this.DocumentName =  selectedActivity?.description
    }
    else
    {
      alert(1)
      this.testClick(event.target.value)
    }
  }

  checkFormValidity(): void {
    this.uploadEnabled = this.mouId !== '' && this.Remarks?.length<4
      && this.DocumentName != ''
      && this.CompletedDate !== ''
      && this.fileData != null
  }
  formatDates(date: Date): string {
    const DateX = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return DateX;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSources.filter = filterValue.trim().toLowerCase();
  }

  isUpdateEnabled(document: any): boolean {
    return document.disapprovalReason && document.disapprovalReason.length > 0;
  }

  onFileSelected(event: any): void {
    const reader = new FileReader();
    const target = event.target as HTMLInputElement;
    const file: File | null = (target.files as FileList)[0] || null;

    if (file) {
      if (file.size > 5001576) {
        swal.fire({
          title: 'File size exceeds 5MB. Please upload a smaller file.',
          text: 'Invalid File size',
          icon: 'warning'
        });
        target.value = '';
        this.fileData = null;
        this.fileStatus = false;
        this.checkFormValidity();
        return;
      }

      const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!fileNameRegex.test(file.name)) {
        const validFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const modifiedFile = new File([file], validFileName, { type: file.type });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(modifiedFile);
        target.files = dataTransfer.files;
        this.fileData = modifiedFile;
        this.fileName = validFileName;
      } else {
        this.fileData = file;
        this.fileName = file.name;
      }

      reader.readAsDataURL(this.fileData);
      reader.onload = () => {
        const result = reader.result as string;
        const resultArray = result.split(',');
        this.FileData = resultArray[1];
        this.fileStatus = true;
        this.checkFormValidity();
      };
    } else {
      this.fileData = null;
      this.fileStatus = false;
      this.checkFormValidity();
    }
  }

  UploadActivity() {
    const formData = new FormData();
    formData.append('MouId', this.mouId);
    formData.append('Uid', this.EmployeeCode);
    formData.append('CompletedDate', this.CompletedDate);
    formData.append('FilePath', this.fileName);
    formData.append('File', this.FileData);
    formData.append('DocumentName', this.DocumentName);
    formData.append('Remarks', this.Remarks);
    formData.append('MouStatus', this.MouStatus);
    formData.append('SessionId', this.sessionId);
    formData.append('ActivityTitle', this.Activity);
    formData.append('ActivityCategory', this.selectedActivityType);
    formData.append('ParticipantsCount', this.ParticipantsCount);
    // formData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    this.mouDocumentsService.InsertMouActivityActionTaken(formData).subscribe({
      next: (data: any) => {
        const result = data.item1[0]['msg'];
        if (result === 'success') {
          swal.fire({
            title: 'Action Planned Stored Successfully!',
            // text: '',
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } else if (result === '-1') {
          swal.fire({
            title: 'Action is already Stored for this MOU',
            icon: 'error'
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
        this.clearFields();
      }
    });
  }

  clearFields(): void {
    this.mouId = this.CompletedDate = this.ResponsiblePerson = '';
    if(this.selectedActivityId == 11 || this.selectedActivityId==12 || this.selectedActivityId==14 || this.selectedActivityId==23 )
    {
      swal.fire({
        title: 'Since this Activity is also involved IQAC Interface thus Redirecting to the IQAC interface ',
        text: 'You are Kindly requested to fill the details in IQAC.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'https://ums.lpu.in/lpuums/frmIQACdetails.aspx';
      });
    }

  }
}
