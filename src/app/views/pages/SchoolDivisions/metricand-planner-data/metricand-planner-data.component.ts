import { PlacementPortalService } from 'src/app/_services/placement-portal.service';

import { Component, Input, OnInit, TemplateRef, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

import { MatPaginator, _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
@Component({
  selector: 'app-metricand-planner-data',
  templateUrl: './metricand-planner-data.component.html',
  styleUrls: ['./metricand-planner-data.component.scss'],
})
export class MetricandPlannerDataComponent implements OnInit {
  activeTab: string = 'OBP-UIDWise';
  @ViewChild('viewDQARemarksModal') viewDQARemarksModal: TemplateRef<any>;
  @Input() remarksData: any; @Input() allocationData: any; isLogin: boolean = false; loadingIndicator = false;
  showNoDataFoundMessage: boolean = false; userId: any; DQRemarks: any = 'select'; SchoolIndex: number = 0; DepartmentIndex: number = -1;
  DQRemarksText: any = ''; otherRemarkText: any = ''; selectedId: number; ColumnMode = ColumnMode; columns: any; headHtmlData: any[] = [];
  studentLists: any[]; p: any = 1; perPage: any = 5; allSchoolDivisions: any; allDepartmentName: any; OBPFilledDetails: any; OBPFilledDetailsUidWise: any;
  tempId: any; OBPAchievement: string = ''; SelectedUid: any; DQARemarksData: any; AlreadyFilled: boolean; viewState: { [key: number]: boolean } = {}; alreadyFilled: { [key: number]: boolean } = {};
  UID: any; OBPFilledDate: any;

  constructor(private placementPortalService: PlacementPortalService, private lpuPlannerServiceService: LpuPlannerServiceService, private storageService: StorageService, private modalService: NgbModal, private authService: AuthService,
    public formBuilder: UntypedFormBuilder, private fb: FormBuilder, private route: ActivatedRoute, private router: Router) { }
  row: any = {}; //
  ngOnInit(): void {
    (<HTMLInputElement>document.getElementById('stMain')).innerHTML =
      'OBP Daily  <span class="themeClr" >Filled Progress</span>';
    (<HTMLInputElement>document.getElementById('imgLogo')).style.width =
      '164px';
    this.loadingIndicator = false;
    this.route.paramMap.subscribe(params => {
      if (params.has('loginName') && params.has('uid') && params.has('date')) {
        let loginName = params.get('loginName');
        var UID = params.get('uid');
        this.OBPFilledDate = params.get('date');
        this.getToken(loginName);
        this.setDataGrid(UID, this.OBPFilledDate)
        this.isLogin = true;
      } else if (params.has('loginName')) {
        let loginName = params.get('loginName');
        this.getToken(loginName);
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
    });
  }
  getToken(id: any) {
    this.authService.loginTemp(id).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.GetAllActivities();
      },
      error: (err) => {
        this.loadingIndicator = false;
      },
    });
  }
  setDataGrid(loginName: any, DateX: any) {
    this.OBPFilledDetails = this.OBPFilledDetailsUidWise = [];
    this.SchoolIndex = this.DepartmentIndex = -1;
    this.userId = this.tempId = loginName;
    this.GetDecodedData(this.userId, DateX);
    this.userId = this.tempId = null;
  }
  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  clearGrid() {
    this.OBPFilledDetails = this.OBPFilledDetailsUidWise = [];
    this.SchoolIndex = this.DepartmentIndex = -1;
    this.userId = this.tempId = null;
  }
  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe((response) => {
      if (response.item1.length > 0) {
        this.allSchoolDivisions = response.item1;
      } else {
        this.allSchoolDivisions = [];
      }
    });
  }
  loadData(event: Event) { }

  setDQRemarkss(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const SelectedDQ = Array.from(selectElement.options).findIndex(
      (option) => option.value === selectedValue
    );
    this.DQRemarks = SelectedDQ;
  }

  getAllDivisions(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const SchoolIndex = Array.from(selectElement.options).findIndex(
      (option) => option.value === selectedValue
    );

    if (SchoolIndex !== -1) {
      selectElement.selectedIndex = SchoolIndex;

      this.selectedId = parseInt(selectedValue, 10);

      this.GetDepartmentforSchoolId(this.selectedId);
    }
  }

  GetDepartmentforSchoolId(Id: any) {
    // this.placementPortalService.GetSchoolDivisionsDepartment(Id).subscribe((response) => {
    this.lpuPlannerServiceService
      .GetSchoolDivisionsDepartment(Id)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.allDepartmentName = response.item1;
        } else {
          this.allDepartmentName = [];
        }
      });
  }

  loadPlannerDetails(event: Event) {
    var selectedDName = (event.target as HTMLSelectElement).value;
    this.GetObpDailyFilledProgrees('', selectedDName);
  }

  GetObpDailyFilledProgrees(Uid: any, DCode: any) {
    this.loadingIndicator = true;
    this.lpuPlannerServiceService.GetObpDailyFilledProgrees(Uid, DCode, null)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.OBPFilledDetails = response.item1;
          // console.log(
          //   'OBPProgress ID ' + JSON.stringify(this.OBPFilledDetails)
          // );
          this.columns = [];
          this.headHtmlData = [];
          this.headHtmlData = this.OBPFilledDetails[0];
          this.columns = Object.keys(this.OBPFilledDetails[0]);
          this.columns = this.columns.filter(
            (item: any) =>
              item !== 'supportingDocument' &&
              item !== 'obpProgressId' &&
              item !== 'allocationId' &&
              item !== 'assignedToUID' &&
              item !== 'quantity' &&
              item !== 'filledStageQuantity' &&
              item != 'totalTargetValue' &&
              item != 'targetValueType' &&
              item != 'stageDescription' &&
              item != 'assignToType'
          );
          this.columns.push();
        } else {
          this.OBPFilledDetails = [];
        }
      });
    this.loadingIndicator = false;
  }

  isFormValid(form: any): boolean {
    const isDQRemarksValid = this.DQRemarks !== 0;
    const isOtherRemarkValid =
      this.DQRemarks !== 3 ||
      (this.DQRemarks === 3 && this.otherRemarkText.trim().length > 0);
    return form.valid && isDQRemarksValid && isOtherRemarkValid;
  }

  onSelectFile(a: any) {
    window.open(a.supportingDocument, '_blank');
  }

  OpenRemarksModal(a: any) {
    // const UID = +a.assignedToUID.split('::')[1];
    // const ObpFilledDate = a.obpFilledDate;
    // const AllocationId = +a.allocationId;
    const AllocationId = parseInt(a.allocationId, 10);
    const ObpFilledDate = new Date(a.obpFilledDate);
    const day = ObpFilledDate.getDate();
    const month = ObpFilledDate.getMonth() + 1; // Months are zero-indexed
    const year = ObpFilledDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    this.lpuPlannerServiceService
      .GetDQARemarsUidWiseWithAllocationId(formattedDate, AllocationId)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.DQARemarksData = response.item1;
          this.row = this.DQARemarksData;
          this.AlreadyFilled = true;
        } else {
          this.DQARemarksData = [];
          this.AlreadyFilled = false;
          this.row = a;
        }

        this.viewState[a] = !this.viewState[a];
        this.alreadyFilled[a] = this.AlreadyFilled;
        const modalRef = this.modalService.open(this.viewDQARemarksModal, {
          size: 'sm',
        });

        modalRef.componentInstance.remarksData = this.DQARemarksData;
        modalRef.componentInstance.allocationData = a;

        modalRef.result
          .then((result) => {
            console.log('Modal closed: ' + result);
          })
          .catch((res) => { });
      });
  }

  GetRemarks(a: any) {
    const UID = +a.assignedToUID.split('::')[1];
    const AllocationId = a.allocationId;
    this.lpuPlannerServiceService
      .GetDQARemarsUidWise(UID)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.DQARemarksData = response.item1;
          this.columns = [];
          this.headHtmlData = [];
          this.headHtmlData = this.DQARemarksData[0];
          this.columns = Object.keys(this.DQARemarksData[0]);
          this.columns = this.columns.filter(
            (item: any) =>
              item !== 'id' &&
              item !== 'entryBy' &&
              item !== 'entryDateTime' &&
              item !== 'ipAddress'
          );
          this.columns.push();
        }
      });
  }
  SaveRemarks(a: any) {
    this.OBPAchievement =
      a.totalTargetValue +
      ' ' +
      a.targetValueType +
      ' Filled Qty ' +
      a.filledStageQuantity;
    const AllocationId = a.allocationId;
    const SatisfactoryremarksText =
      a.DQRemarks == 1
        ? 'Satisfactory'
        : a.DQRemarks == 2
          ? 'Not Satisfactory'
          : 'Others';
    const formData = new FormData();
    formData.append('AllocationId', AllocationId);
    formData.append('EmployeeCode', a.assignedToUID.split('::')[1]);
    formData.append('OBPAchievement', this.OBPAchievement);
    formData.append(
      'DQARemarks',
      a.DQRemarksText.length > 0 ? a.DQRemarksText : 'NA'
    );
    formData.append('DQASatisfactionLevel', SatisfactoryremarksText);
    formData.append(
      'DQAOtherRemarks',
      a.otherRemarkText?.length > 0 ? a.otherRemarkText : 'NA'
    );
    formData.append('DPRFilledDate', a.obpFilledDate);
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });
    this.lpuPlannerServiceService
      .PostDQARemarksObpDailyProgress(formData)
      .subscribe({
        next: (data: any) => {
          const result = data.item1[0]['msg'];
          if (result === 'Success') {
            swal
              .fire({
                title: 'DQA Remarks Stored Successfully!',
                icon: 'success',
              })
              .then(() => {
                window.location.reload();
              });
          } else if (result === 'Failed') {
            swal
              .fire({
                title: 'Failed To Store DQA Remarks ',
                icon: 'error',
              })
              .then(() => {
                window.location.reload();
              });
          } else if (result === 'Already Stored') {
            swal
              .fire({
                title: 'DQA Remarks are already submitted ',
                icon: 'error',
              })
              .then(() => {
                window.location.reload();
              });
          } else {
            swal
              .fire({
                title: 'Something Went Wrong, Try again later',
                icon: 'error',
              })
              .then(() => {
                window.location.reload();
              });
          }
        },
        error: (error: any) => {
          swal
            .fire({
              title: 'Error',
              text: 'Failed to Save Remarks.',
              icon: 'error',
            })
            .then(() => {
              window.location.reload();
            });
        },
        complete: () => { },
      });
  }

  exportToExcel(): void {
    const fileNamex = 'OBPPlannerFilledDetails.xlsx';
    const exportedData = this.OBPFilledDetails.map(
      (item: {
        plannerSession: any;
        metricId: any;
        metricDescription: any;
        totalTargetValue: any;
        stageDescription: any;
        assignedToUID: any;
        assignToType: any;
        obpFilledDate: any;
        filledStageQuantity: any;
      }) => ({
        Planner_Session: item.plannerSession,
        MetricId: item.metricId,
        MetricDescription: item.metricDescription,
        TotalTargetValue: item.totalTargetValue,
        StageDescription: item.stageDescription,
        AssignedToUID: item.assignedToUID,
        AssignToType: item.assignToType,
        ObpFilledDate: item.obpFilledDate,
        FilledStageQuantity: item.filledStageQuantity,
      })
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.OBPFilledDetails);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' })
    );
    link.download = fileNamex;
    link.click();
  }

  onPageChange(event: any): void {
    this.p = event;
  }
  perPageItems(xperPage: any) {
    this.perPage = xperPage;
  }

  //Tab Two
  setUserID() {
    this.tempId = this.userId;
    const date = new Date();
    date.setDate(date.getDate() - 20);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const presentDate = `${day}/${month}/${year}`;
    this.GetFilledProgreesByUID(this.userId, this.OBPFilledDate?.length > 0 ? this.OBPFilledDate : null);
    this.userId = null;
  }

  GetFilledProgreesByUID(ID: any, DateData: any) {
    this.loadingIndicator = true;
    this.lpuPlannerServiceService
      .GetObpDailyFilledProgrees(ID, '', DateData)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.OBPFilledDetailsUidWise = response.item1;
          this.columns = [];
          this.headHtmlData = [];
          this.headHtmlData = this.OBPFilledDetailsUidWise[0];
          this.columns = Object.keys(this.OBPFilledDetailsUidWise[0]);

          this.columns = this.columns.filter(
            (item: any) =>
              item !== 'supportingDocument' &&
              item !== 'allocationId' &&
              item !== 'assignedToUID' &&
              item !== 'quantity' &&
              item !== 'filledStageQuantity' &&
              item != 'totalTargetValue' &&
              item != 'targetValueType' &&
              item != 'stageDescription' &&
              item != 'assignToType'
          );
          this.columns.push();
        } else {
          this.OBPFilledDetailsUidWise = [];
          (<HTMLInputElement>(
            document.getElementById('ResultTableUIDWise')
          )).style.display = 'none';
        }
      });
    this.loadingIndicator = false;
  }
  GetDecodedData(ID: any, DateData: any) {
    this.loadingIndicator = true;
    this.lpuPlannerServiceService
      .GetDecodedObpDailyFilledProgrees(ID, '', DateData)
      .subscribe((response) => {
        if (response.item1.length > 0) {
          this.OBPFilledDetailsUidWise = response.item1;
          this.columns = [];
          this.headHtmlData = [];
          this.headHtmlData = this.OBPFilledDetailsUidWise[0];
          this.columns = Object.keys(this.OBPFilledDetailsUidWise[0]);

          this.columns = this.columns.filter(
            (item: any) =>
              item !== 'supportingDocument' &&
              item !== 'allocationId' &&
              item !== 'assignedToUID' &&
              item !== 'quantity' &&
              item !== 'filledStageQuantity' &&
              item != 'totalTargetValue' &&
              item != 'targetValueType' &&
              item != 'stageDescription' &&
              item != 'assignToType'
          );
          this.columns.push();
        } else {
          this.OBPFilledDetailsUidWise = [];
          (<HTMLInputElement>(
            document.getElementById('ResultTableUIDWise')
          )).style.display = 'none';
        }
      });
    this.loadingIndicator = false;
  }

  exportToExcelUID(): void {
    const fileName = 'UIDetailsExcel.xlsx';
    const exportedData = this.OBPFilledDetailsUidWise.map(
      (item: {
        plannerSession: any;
        metricId: any;
        metricDescription: any;
        totalTargetValue: any;
        stageDescription: any;
        assignedToUID: any;
        assignToType: any;
        obpFilledDate: any;
        filledStageQuantity: any;
      }) => ({
        Planner_Session: item.plannerSession,
        MetricId: item.metricId,
        MetricDescription: item.metricDescription,
        TotalTargetValue: item.totalTargetValue,
        StageDescription: item.stageDescription,
        AssignedToUID: item.assignedToUID,
        AssignToType: item.assignToType,
        ObpFilledDate: item.obpFilledDate,
        FilledStageQuantity: item.filledStageQuantity,
      })
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' })
    );
    link.download = fileName;
    link.click();
  }
}
