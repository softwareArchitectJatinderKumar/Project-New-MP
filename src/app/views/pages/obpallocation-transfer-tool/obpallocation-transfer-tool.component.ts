import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { Title } from '@angular/platform-browser';
//import { AccountService } from 'src/app/_services/account.service';
// import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
//import { User } from 'src/app/_models/user';
import { take } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';
import { PlacementService } from 'src/app/_services/placement.service';
import { StorageService } from 'src/app/_services/storage.service';
import swal from 'sweetalert2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModule
import { FormControl } from '@angular/forms';
import { number } from 'ngx-custom-validators/src/app/number/validator';

interface TransferElements {
  employeeCode: string;
  employeeName: string,
  targetValueType: string;
  plannerSessionID: string;
  assignToType: string;
  completedValue: string;
  metricId: string;
  allocationdepartment: string;
  allocationdepartmentName: string;
  allocationDivisionName: string;
  currentDepartment: string;
  currentDepartmentName: string;
  currentDivisionName: string;
  isMarksAsComplete: string;
  isOk: string;
  dropdownValue?: string; // For dropdown selection
  selected?: boolean; // Optional property for checkbox state
  selectedOption?: string;
  MetricDescription: string;
  TotalTarget: string;
  CurrentApprovingAuth: string;
  CurrentApprovingAuthName: string;
  SourceDivisionName: string;
}

interface SubmitDataMarkasCompleteInterface {
  [key: string]: any; // Allow any string key
  PlannerSessionID?: string; // Optional properties
  AssignedToUID?: string;
  MetricId?: string;
  DepartmentCode?: string; // Optional properties
  AssignToType?: string;
}


@Component({
  selector: 'app-obpallocation-transfer-tool',
  templateUrl: './obpallocation-transfer-tool.component.html',
  styleUrls: ['./obpallocation-transfer-tool.component.scss']
})
export class OBPAllocationTransferToolComponent {
  loginName = "";   routecomponent: string;  uid: string;  Uid: any;  isLoading: any = 0;
  //user:User;
  isCheckedpositive = false;  isCheckedzero = false;  areaFeedback: string = '';  selectedItems: TransferElements[];
  xPlannerSessions = [
    // Populate this array with your session data
    { id: '16', session: 'Academic Year (Jul 24 - Jun 25) )' },
    // { id: '13,14', session: 'Academic Year (Jul 23 - Jun 24) - Calendar Year (Jan- Dec 24) )' },
    // { id: '9,11', session: 'Academic Year (Jul 22 - Jun 23) - Calendar Year (Jan- Dec 23) )'},
    // { Id: '7,8', session: 'Academic Year (Jul 21 - Jun 22) - Calendar Year (Jan- Dec 22) )'},
    // Add more sessions as needed
  ];
  TransferFetched_Data: TransferElements[];  MarkasCompleteRecords: any[] = [];  datasavedornot: boolean = false; searchTerm: any; searchTermDept: any;
  DeptShiftRecords: any[];  MarkasCompleteFilteredRecords: any[] = [];  DeptShiftFilteredRecords: any[] = [];  SubmitDataMarkasComplete: any[] = [];
  SubmitDataShiftDeptAllocations: any[] = [];
  constructor(private router: Router, private route: ActivatedRoute,
    private placementService: PlacementService, private storageService: StorageService,
    private authService: AuthService, private SpinnerService: NgxSpinnerService,
    // private accountService:AccountService,
    // private modalService: BsModalService,
    private title: Title,
    private spinner: NgxSpinnerService, private el: ElementRef) {
    // this.accountService.currentUser$.pipe(take(1)).subscribe(user=>this.user=user);
    // this.routecomponent=this.accountService.doSomething(this.constructor.name,this.router.url);

  }

  selectedTab: string = 'tab1';





  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 30; // Items per page
  //totalItems: number = this.employee.length;
  optionsSession: any[];
  // Sorting variables

  sortOrder: boolean = true;
  selectAll = false;
  selectAllmarkcomplete = false;
  selectAllDeptShift = false;
  currentRating: Number = 5;
  // selectedProduct: any; // Add this property to hold the selected product
  isDropdownOpen: boolean[] = [];
  sessioncontrol = new FormControl();
  sessionSelected: number;

  uniqueRecords: any[] = [];
  selectedemployeeCode: any; // Add this property to hold the selected employee
  selectedDeptemployeeCode: any; // Add this property to hold the selected employee
  UniqueEmployee_Data: any[] = [];
  UniqueEmployee_Data_DeptDiff: any[] = [];
  item: any = { selectedOption: null };
  filteredData: any[] = [];
  filteredDataDept: any[] = [];

  getPlannerSession() {
    this.optionsSession = this.xPlannerSessions;
    // console.log(this.optionsSession);
  }

  GetTransferAllocationApi() {
    // console.log('Transfer allocation API called');
    // console.log('Session is ',this.sessionSelected);
    //this.spinner.show();
    this.spinner.show();
    this.isLoading = 1;
    this.placementService.getTransferAllocationService(this.sessionSelected, '').subscribe(
      (response: any) => {
        this.TransferFetched_Data = response.item1;
        // console.log('TransferFetched_Data',this.TransferFetched_Data);
        this.spinner.hide();
        this.isLoading = 0;
        this.paginatedTransfers;
        this.UniqueEmployee_Data = this.TransferFetched_Data.map((x, index) => {
          return {
            employeeCode: x.employeeCode,
            employeeName: x.employeeName,
            targetValueType: "",
            plannerSessionID: "",
            assignToType: "",
            completedValue: "",
            metricId: "",
            allocationdepartment: "",
            allocationdepartmentName: "",
            allocationDivisionName: x.allocationDivisionName,
            currentDepartment: x.currentDepartment,
            currentDepartmentName: x.currentDepartmentName,
            currentDivisionName: x.currentDivisionName,
            isMarksAsComplete: "",
            isOk: "",
          }
        });


        this.UniqueEmployee_Data_DeptDiff = this.TransferFetched_Data.map((x, index) => {
          return {
            employeeCode: x.employeeCode,
            employeeName: x.employeeName,
            targetValueType: "",
            plannerSessionID: "",
            assignToType: "",
            completedValue: "",
            metricId: "",
            allocationdepartment: x.allocationdepartment,
            allocationdepartmentName: "",
            allocationDivisionName: x.allocationDivisionName,
            currentDepartment: x.currentDepartment,
            currentDepartmentName: x.currentDepartmentName,
            currentDivisionName: x.currentDivisionName,
            isMarksAsComplete: "",
            isOk: "",
          }
        });
        this.UniqueEmployee_Data = this.UniqueEmployee_Data.filter(record => record.allocationDivisionName != record.currentDivisionName);
        const uniqueEmpRecords = new Map();
        this.UniqueEmployee_Data.forEach(record => {
          uniqueEmpRecords.set(record.employeeCode, record); // Replace employeeId with the unique property you want to use
          this.UniqueEmployee_Data = Array.from(uniqueEmpRecords.values());
        });


        this.filteredData = this.UniqueEmployee_Data;      //19-11-2024

        this.UniqueEmployee_Data_DeptDiff = this.UniqueEmployee_Data_DeptDiff.filter(record => record.currentDepartment != record.allocationdepartment && record.allocationDivisionName === record.currentDivisionName);
        const uniqueRecords = new Map();
        this.UniqueEmployee_Data_DeptDiff.forEach(record => {
          uniqueRecords.set(record.employeeCode, record); // Replace employeeId with the unique property you want to use
          this.UniqueEmployee_Data_DeptDiff = Array.from(uniqueRecords.values());
        });

        this.filteredDataDept = this.UniqueEmployee_Data_DeptDiff;      //11-12-2024
        //this.removeDuplicates();
        //  console.log('data is',this.UniqueEmployee_Data);
        //  console.log('diff dept data is ',this.UniqueEmployee_Data_DeptDiff);
      },
      (error) => {
        console.error('Error fetching Transfer Allocations:', error);
        this.spinner.hide();
        this.isLoading = 0;
      }
    );
  }

  optionsselected: { key: string, value: string }[] = []; // Array to hold key-value pairs
  fetchdepartments: any[];

  GetDeptshiftRecords(): void {
    // Example condition: filter records where 'age' is greater than 30
    this.DeptShiftRecords = this.TransferFetched_Data.filter(record => record.employeeCode === this.selectedDeptemployeeCode.employeeCode);
    //console.log('Dept Shift ',this.DeptShiftRecords);


    //this.options = Array.from(new Set(this.DeptShiftRecords.map(record => record.optionValue))); // Ensure uniqueness
    //this.options = this.selectedDeptemployeeCode.employeeCode;

    //Fetch Departments and show in dropdown

    this.placementService.getOBPDepartmentService(this.selectedDeptemployeeCode.employeeCode).subscribe(
      (response: any) => {
        this.fetchdepartments = response.item1;
        this.DeptShiftRecords.forEach(element => {
          // Set the selectedOption to the first department if available
          element.selectedOption = this.fetchdepartments.length > 0 ? this.fetchdepartments[0].departmentCode : undefined;
        });
        //    console.log('Departments are',this.fetchdepartments);
      },
      (error) => {
        console.error('Error fetching planner sessions:', error);
      }
    );

    const newOption = {
      departmentName: this.selectedDeptemployeeCode.currentDepartment, // Key
      departmentCode: this.selectedDeptemployeeCode.currentDepartmentName // Value
    };
    // this.optionsselected.push(this.fetchdepartments);
  }
  GetMarkasCompleteRecords(): void {
    // Example condition: filter records where 'age' is greater than 30
    this.MarkasCompleteRecords = this.TransferFetched_Data.filter(record => record.employeeCode === this.selectedemployeeCode.employeeCode);
    //   console.log('Mark as completed data is ',this.MarkasCompleteRecords);
    // this.MarkasCompleteFilteredRecords = this.MarkasCompleteRecords.filter(record => record.isMarksAsComplete === true);
    //  this.MarkasCompleteFilteredRecords = this.MarkasCompleteRecords.filter(record => record.isMarksAsComplete);
    this.MarkasCompleteFilteredRecords = this.MarkasCompleteRecords;
    // console.log('Fileterd data is ',this.MarkasCompleteFilteredRecords);
  }
  filterUniqueRecords_DivisionToDivision(): void {
    const uniqueSet = new Set(this.UniqueEmployee_Data.map(record => record.employeeCode)); // Assuming 'id' is the unique identifier
    //   console.log('unique set is ',uniqueSet);
    this.uniqueRecords = Array.from(uniqueSet).map(employeeCode =>
      this.UniqueEmployee_Data.find(record => record.employeeCode === employeeCode)
    );
    //  console.log('Unique Records are',this.uniqueRecords);
    // Create a Set to track unique combinations of employeeCode and otherField

  }
  toggleDropdown(index: number) {
    this.isDropdownOpen[index] = !this.isDropdownOpen[index];
  }



  toggleSelectAllMarkasComplete() {
    this.MarkasCompleteFilteredRecords.forEach(metric => {
      metric.selected = this.selectAllmarkcomplete;
    });
  }

  toggleSelectAllDeptShift() {
    this.DeptShiftRecords.forEach(metric => {
      metric.selected = this.selectAllDeptShift;

    });
  }


  openModalTransfer(employeeCode: any, type: any) {

    // console.log('type is ',type);
    if (type === 'Divisions') {
      this.selectedemployeeCode = employeeCode; // Set the selected employee to display in the modal
      // console.log(this.selectedemployeeCode);
      this.GetMarkasCompleteRecords();
    }
    if (type === 'Dept') {
      this.selectedDeptemployeeCode = employeeCode; // Set the selected employee to display in the modal
      //console.log('called dept clicked');
      this.GetDeptshiftRecords();
    }
  }
  closeModal() {
    this.selectedemployeeCode = null; // Clear the selected employee to close the modal
    this.selectedDeptemployeeCode = null;
    this.MarkasCompleteFilteredRecords.forEach(metric => {
      metric.selected = '';
    });
    if (this.datasavedornot == true) {
      this.GetTransferAllocationApi();
      this.datasavedornot = false;
    }
  }


  //16-10-2024
  getSelectedModalData() {
    this.selectedItems = this.MarkasCompleteFilteredRecords.filter(item => item.selected);
    // console.log('Values areSelected',JSON.stringify(this.selectedItems)); 

    //16-10-2024   Submit data to API for DB storage/updation
    this.placementService.TransferOBPMetricAllocation(this.selectedItems, 'MarkasComplete').subscribe({
      next: data => {
        swal.fire(

          { title: 'Transfer Allocations', text: 'Data Saved Successfully !', icon: 'success' }


        ).then(() => {
          this.MarkasCompleteFilteredRecords = this.MarkasCompleteFilteredRecords.filter(item => !item.selected);
          this.refreshModal();
          this.datasavedornot = true;
          this.MarkasCompleteFilteredRecords = [...this.MarkasCompleteFilteredRecords];
          //window.location.reload();
          //  this.closeModal(); // Optionally close the modal
          // localStorage.setItem('sessionselected', JSON.stringify(this.sessionSelected));
          // // window.location.reload();
          //  this.sessionSelected = Number(localStorage.getItem('sessionselected'));
          //  console.log(this.sessionSelected);
          //  console.log(this.sessionSelected);
          //   this.GetTransferAllocationApi();
        });

      },
      error: res => {
        swal.fire(

          { title: 'Transfer Allocations', text: 'Something wrong try again later !', icon: 'error' }

        ).then(() => {
          console.log(this.MarkasCompleteFilteredRecords);
          this.MarkasCompleteFilteredRecords = this.MarkasCompleteFilteredRecords.filter(item => !item.selected);
          console.log(this.MarkasCompleteFilteredRecords);

          //    this.refreshModal();
          //    this.closeModal(); // Optionally close the modal
          localStorage.setItem('sessionselected', JSON.stringify(this.sessionSelected));
          // window.location.reload();
          this.sessionSelected = Number(localStorage.getItem('sessionselected'));
          //console.log(this.sessionSelected);
          //console.log(this.sessionSelected);
          this.GetTransferAllocationApi();

        });
      },
    });

    // this.SubmitDataMarkasComplete = selectedItems.map(item => this.pickKeys(item,
    //    ['plannerSessionID', 'employeeCode','metricId','allocationdepartment','assignToType']));
    //    console.log('final data is ',this.SubmitDataShiftDeptAllocations);
    // You can return this array or perform other actions (e.g., send to server)
    return this.selectedItems;
  }

  filterTable() {
    this.filteredData = this.UniqueEmployee_Data.filter(item => {
      return item.employeeCode.toLowerCase().includes(this.searchTerm.toLowerCase())
      // ||
      //item.city.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  filterTableDept() {
    this.filteredDataDept = this.UniqueEmployee_Data_DeptDiff.filter(item => {
      return item.employeeCode.toLowerCase().includes(this.searchTermDept.toLowerCase())
      // ||
      //item.city.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }
  refreshModal() {
    //   this.MarkasCompleteFilteredRecords.forEach(item => {
    //     item.selected = false;
    // });

    // this.DeptShiftRecords.forEach(item => {
    //   item.selected = false;});

    // Logic to reset or fetch the data for the modal
    // this.DeptShiftRecords = []; // Clear existing records or refetch from service
    //  this.selectedItems = []; // Reset selected items if necessary
    // Optionally, you can call a method to fetch the latest data
    // this.fetchDeptShiftRecords();
  }

  ChangeDeptAllocations() {
    //console.log('DeptShiftRecords are',this.DeptShiftRecords);

    this.selectedItems = this.DeptShiftRecords.filter(item => item.selected);
    //console.log('Values are',this.selectedItems);
    // const selectedValues = this.DeptShiftRecords
    // .filter(item => item.selected)
    // .map(item => ({ name: item.employeeCode, option: item.selectedOption }));
    //  console.log('Values are',JSON.stringify(this.selectedItems)); ;

    // You can return this array or perform other actions (e.g., send to server)
    //16-10-2024   Submit data to API for DB storage/updation
    const keyToCheck = 'selectedOption';

    const allHaveKey = this.selectedItems.every(obj => keyToCheck in obj);
    // console.log('allHaveKey',allHaveKey);
    if (allHaveKey) {

    } else {
      swal.fire(

        { title: 'Department is not selected  ', text: 'Department is not selected!', icon: 'error' }

      )
      return;
    }
    this.placementService.TransferOBPMetricAllocation(this.selectedItems, 'DeptShift').subscribe({
      next: data => {
        swal.fire(

          { title: 'Transfer Allocations', text: 'Data Saved Successfully !', icon: 'success' }

        ).then(() => {
          this.refreshModal();
          this.DeptShiftRecords = this.DeptShiftRecords.filter(item => !item.selected);
          this.datasavedornot = true;
          //  this.closeModal(); // Optionally close the modal
        });

      },
      error: res => {
        swal.fire(

          { title: 'Transfer Allocations', text: 'Something wrong try again later !', icon: 'error' }

        ).then(() => {
          this.DeptShiftRecords = this.DeptShiftRecords.filter(item => !item.selected);
          // this.refreshModal();
          //  this.closeModal(); // Optionally close the modal
        });
      },
    });

    return this.selectedItems;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    //  console.log('Selected Tab is ',this.selectedTab);

  }
  callfxn() {

    (<HTMLElement>document.getElementById('liNews')).style.cssText = 'margin-left: -352px;background: #435895;';
    (<HTMLElement>document.getElementById('fdNew')).style.cssText = 'display:block;';
  }
  closeData() {
    (<HTMLElement>document.getElementById('liNews')).style.cssText = 'margin-left: 4px;background: #435895;';
    (<HTMLElement>document.getElementById('fdNew')).style.cssText = 'display:none;';
  }
  ratingData(val: Number) {

    this.currentRating = val;
  }
  addFeedback() {
    swal.fire({
      title: 'Do you want to write feedback ?',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        this.areaFeedback = login;
      },
      allowOutsideClick: () => !swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        // this.saveFeedBack();

      }
      else {
        this.areaFeedback = 'NA';
        // this.saveFeedBack();
      }
    }
    )
  }

  changeSelection() {
  }

  ngOnInit(): void {
    this.title.setTitle("OBP Allocation Transfer Tool");


    this.loginName = this.Uid = this.route.snapshot.params['loginName'];

    // console.log('login is ',this.loginName);
    if (this.loginName != '' && this.loginName != undefined) {
      this.getToken(this.loginName);

      this.getPlannerSession();
    }


    // this.fetchOptions(); // Call a method to load options
    document.querySelectorAll('.feedback li').forEach(entry => entry.addEventListener('click', e => {
      if (!entry.classList.contains('active')) {
        (<HTMLInputElement>document.querySelector('.feedback li.active')).classList.remove('active');
        entry.classList.add('active');
      }
      e.preventDefault();
    }));
  }



  onOptionSelected(option: { id: number, session: string }) {
    // console.log('Selected Option:', option.id);
    // console.log('Selected Option:', option.session);
    // You can also set the form control value if needed
    this.sessioncontrol.setValue(option.session);
    this.sessionSelected = option.id;
    // console.log(this.sessionSelected);
    this.GetTransferAllocationApi();
    this.filterUniqueRecords_DivisionToDivision();
    //console.log(this.uniqueRecords);

  }
  getToken(id: any) {

    //console.log('id is ',id);
    this.authService.loginTemp(id).subscribe({
      next: (data: any) => {
        //console.log('returned data is',data);
        this.storageService.saveUser(data);
        this.placementService.getPlannerSession().subscribe({
          next: () => {



          },
        });

      },
      error: () => {
        this.isLoading = 0;
        // this.errorMessage = err.error.message;
        // this.isLoginFailed = true;
      }
    });
  }

  checkuncheckallpositive() {

    if (this.isCheckedpositive == true) {
      this.isCheckedpositive = false;
    }
    else {
      this.isCheckedpositive = true;
    }
  }
  checkuncheckallzero() {

    if (this.isCheckedzero == true) {
      this.isCheckedzero = false;
    }
    else {
      this.isCheckedzero = true;
    }
  }



  get totalItems(): number {
    return this.uniqueRecords.length;
  }


  get paginatedTransfers(): TransferElements[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.uniqueRecords.slice(startIndex, startIndex + this.itemsPerPage);
  }
  onPageChange(page: number) {
    this.currentPage = page; // Update current page from the event
  }
}
