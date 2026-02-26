import { PlacementService } from 'src/app/_services/placement.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';
import { HeadMapping, MetricMapping } from '../Services/HeadMapping.service';
import { PlanningrankingService } from 'src/app/_services/planningranking.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
interface SchoolDivision {
    id: number;
    schoolDivision: string;
}
interface MetricDetails {
    id: number;
    description: string;
}
interface Employee {
    employeeName: string;
    employeeCode: string;
}
interface SchoolDivision {
    id: number;
    schoolDivision: string;
}

@Component({
    selector: 'app-metric-mapping',
    templateUrl: './HeadMappingWithAssistant.html',
    styleUrls: ['./HeadMappingWithAssistant.scss']
})
export class OBPMetricBinding implements OnInit {
    SchoolIndex: number = 0;
    DepartmentIndex: number = 0;
    SchoolInvolved: any;
    selectedId: any;
    selectedSchoolDivisions: any[] = [];
    allSchoolDivisions: SchoolDivision[] = [];
    selectedDivisions: any[] = [];
    allDepartmentName: any;
    hasSelectionError: boolean = false;
    SchoolId: FormControl<any>;
    // logic start 19-Nov-25
    allMetricDescription: MetricDetails[] = [];
    GetAllMetricDetails(): void {
        this.PlanningrankingService.FetchObpMetricDetails(0).subscribe((response) => {
            if (response.item1.length > 0) {
                this.allMetricDescription = response.item1;
            } else {
                this.allMetricDescription = [];
            }
        });
    }
    getMetricDetailsById(id: number): string {
        const idStr = id.toString();
        let metric: MetricDetails | undefined;
        for (const value of this.allMetricDescription) {
            if (+value.id === +idStr) {
                metric = value;
                break;
            }
        }
        return metric ? metric.description : `ID ${idStr} not found`;
    }

    // Logic End 19-Nov
    changeResponsiblePlanned(event: any) {
        for (let i = 0; i < event.length; i++) {
            this.selectedDivisions.push(event[i].id);
        }
        this.hasSelectionError = this.selectedDivisions.length === 0;
    }
    onDivisionSelected(event: any, id: number): void {
        if (event.target.checked) {
            this.selectedDivisions.push(id);
        } else {
            this.selectedDivisions = this.selectedDivisions.filter(divId => divId !== id);
        }
    }
    getSelectedDivisionsText(): string {
        return this.selectedDivisions.map(id => this.getDivisionNameById(id)).join(', ');
    }

    getDivisionNameById(id: number): string {
        const idStr = id.toString();
        let division: SchoolDivision | undefined;
        for (const school of this.allSchoolDivisions) {
            if (+school.id === +idStr) {
                division = school;
                break;
            }
        }
        return division ? division.schoolDivision : `ID ${idStr} not found`;
    }

    getDivisionNamesByIds(ids: number[]): string {
        return ids.map(id => this.getDivisionNameById(id)).join(', ');
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

    getAllDivisions(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        const selectedValue = selectElement.value;
        const SchoolIndex = Array.from(selectElement.options).findIndex(option => option.value === selectedValue);

        if (SchoolIndex !== -1) {
            selectElement.selectedIndex = SchoolIndex;

            this.selectedId = selectedValue;

            this.GetDepartmentforSchoolId(this.selectedId);
        }

    }

    GetDepartmentforSchoolId(Id: any) {
        this.lpuPlannerServiceService.GetSchoolDivisionsDepartment(Id).subscribe((response) => {
            if (response.item1.length > 0) {
                this.allDepartmentName = response.item1;
            } else {
                this.allDepartmentName = [];
            }
        });
    }

    isLoginFailed: boolean = false;
    public mappingData$!: Observable<MetricMapping[]>;

    public mappingForm!: FormGroup;

    public isUpdateMode = false;
    private currentEditId: any | null = null;
    public typeOptions = ['PA', 'AO', 'DE'];
    public tableColumns: any[] = ['id', 'headUID', 'assistantUID', 'isActive', 'metricId', 'type', 'Actions'];
    public pageSizes: number[] = [5, 10, 25, 50];
    public totalRecords = 0;

    private pageSize$ = new BehaviorSubject<number>(10);
    private currentPage$ = new BehaviorSubject<number>(1);
    private searchTerm$ = new BehaviorSubject<string>('');
    public displayedData$!: Observable<MetricMapping[]>;

    constructor(
        private cdRef: ChangeDetectorRef, private mouDocumentsService: MouDocumentsService,
        private lpuPlannerServiceService: LpuPlannerServiceService,
        private placementService: PlacementService,
        private fb: FormBuilder,
        private HeadMapping: HeadMapping, private PlanningrankingService: PlanningrankingService,
        public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
        private authService: AuthService, private storageService: StorageService,
        private title: Title
    ) { }
    ngOnInit(): void {
        this.initForm();
        let loginName = this.route.snapshot.params['loginName'];
        if (loginName != '' && loginName != undefined) {
            this.getToken(loginName);
        }
    }
    GetEmployeeData(): void {
        this.mouDocumentsService.GetEmployeeData().subscribe({
            next: response => {
                if (response.item1.length > 0) {
                    this.EmployeeData = response.item1;
                } else {
                    this.EmployeeData = [];
                }
            },
            error: err => {
                console.error(err);
            }
        });
    }
    getToken(id: any) {
        this.authService.loginTemp(id).subscribe({
            next: data => {
                this.storageService.saveUser(data);
                const authToken = this.storageService.getUser();
                if (!this.storageService.isLoggedIn() || authToken === 'Token Expired') {
                    this.LoginFailed('Token Expired');
                }
                this.GetAllEventsData();
                this.GetEmployeeData();
                this.GetAllActivities();
                this.GetAllMetricDetails();
                const stMainElement = document.getElementById('stMain');
                if (stMainElement) {
                    stMainElement.innerHTML = 'OBP Head<span class="themeClr"> Metric Mapping</span>';
                }

                const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
                if (imgLogoElement) {
                    imgLogoElement.style.width = '164px';
                }
            },
            error: _err => {
                this.LoginFailed(_err);
            }
        });
    }
    LoginFailed(_NewError: any) {
        this.isLoginFailed = true;
        this.loadingIndicator = false;
        swal.fire({
            title: 'Login Failed',
            text: 'Login details are Invalid!',
            icon: 'warning',
        })
        const element = document.getElementById('OBPHeadMapping');
        if (element) {
            element.hidden = true;
        }

        const stMainElement = document.getElementById('stMain');
        if (stMainElement) {
            stMainElement.innerHTML = 'OBP Head<span class="themeClr"> Metric Mapping</span>';
        }

        const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
        if (imgLogoElement) {
            imgLogoElement.style.width = '164px';
        }

    }

    loadingIndicator = false;
    sessionId: any = 'Select';
    items: any[] = [];

    HeadMappingData: any; filteredHeadMappingData: any;

    public onMultiSelectChange(event: any): void {
        const selectElement = event.target as HTMLSelectElement;
        const selectedOptions = Array.from(selectElement.options)
            .filter(option => option.selected)
            .map(option => parseInt(option.value, 10))
            .filter(id => !isNaN(id));
        this.selectedDivisions = selectedOptions;
        this.mappingForm.get('SchoolId')?.setValue(this.selectedDivisions.length > 0 ? 'selected' : '');
    }
    GetAllEventsData(): void {
        this.loadingIndicator = true;
        const startTime = new Date().getTime();

        this.mappingData$ = this.PlanningrankingService.GetHeadMappings().pipe(
            map((response: any) => response?.item1 ?? []),
            tap((arr: MetricMapping[]) => {

                this.HeadMappingData = arr;
                this.filteredHeadMappingData = arr;
                this.loadingIndicator = false;
                this.totalRecords = arr.length;

                if (arr && arr.length > 0) {
                    const keys = Object.keys(arr[0]);

                    this.tableColumns = [...keys.filter(k => k.toLowerCase() !== 'actions'), 'Actions'];
                } else {
                    this.tableColumns = ['Actions'];
                }
            }),
            catchError(err => {
                console.error('Failed to load head mappings', err);

                this.HeadMappingData = [];
                this.filteredHeadMappingData = [];
                this.loadingIndicator = false;
                this.isLoginFailed = true;
                return of([] as MetricMapping[]);
            })
        );
        const elapsed = new Date().getTime() - startTime;
        const remainingDelay = Math.max(1500 - elapsed, 0);
        setTimeout(() => {
            this.loadingIndicator = false;
        }, remainingDelay);
        this.displayedData$ = combineLatest([this.mappingData$, this.searchTerm$, this.pageSize$, this.currentPage$]).pipe(
            map(([arr, term, size, page]) => {
                const list: MetricMapping[] = (arr as MetricMapping[]) || [];
                const filtered = this.applyFilter(list, term as string);
                this.totalRecords = filtered.length;
                return this.applyPaging(filtered, page as number, size as number);
            }),
            tap(() => { this.loadingIndicator = false; }),
            catchError(err => {
                console.error('displayedData$ error', err);
                return of([] as MetricMapping[]);
            })
        );

    }
    private initForm(): void {
        this.mappingForm = this.fb.group({
            HeadUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            AssistantUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            MetricId: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            Type: ['PA', Validators.required],
            SchoolId: ['']
        });
    }
    // ---------- Client-side filtering & paging helpers ----------
    private applyFilter(data: MetricMapping[], term: string): MetricMapping[] {
        if (!term) return data;
        const lower = term.toLowerCase();
        return data.filter(item => {
            return Object.keys(item).some(k => {
                const v = (item as any)[k];
                return v != null && String(v).toLowerCase().includes(lower);
            });
        });
    }
    private applyPaging(data: MetricMapping[], page: number, size: number): MetricMapping[] {
        const start = ((page || 1) - 1) * (size || 10);
        return data.slice(start, start + (size || 10));
    }

    private getProp(obj: any, key: string): any {
        if (!obj || !key) return undefined;
        if (key in obj) return obj[key];
        const lower = key.toLowerCase();
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lower);
        return foundKey ? obj[foundKey] : undefined;
    }

    public onSearch(term: string): void {
        this.loadingIndicator = true;
        this.searchTerm$.next(term || '');
        this.currentPage$.next(1);
    }

    public onPageSizeChange(size: number | string): void {
        const s = typeof size === 'string' ? parseInt(size, 10) : size;
        this.loadingIndicator = true;
        this.pageSize$.next(s || 10);
        this.currentPage$.next(1);
    }

    public goToPage(page: number): void {
        if (page < 1) return;
        this.currentPage$.next(page);
    }

    public get currentPage(): number {
        return this.currentPage$.value;
    }

    public get pageSize(): number {
        return this.pageSize$.value;
    }

    public get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalRecords / (this.pageSize || 1)));
    }
    public exportToExcel(): void {
        this.loadingIndicator = true;
        this.mappingData$.pipe(take(1)).subscribe((arr: MetricMapping[]) => {
            const data = (arr || []).map(r => {
                const obj: any = {};
                Object.keys(r).forEach(k => obj[k] = (r as any)[k]);
                return obj;
            });
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'HeadMappings');
            XLSX.writeFile(wb, `HeadMappings_${new Date().toISOString().slice(0, 10)}.xlsx`);
            this.loadingIndicator = false;
        }, err => {
            console.error('Export failed', err);
            this.loadingIndicator = false;
        });
    }
    public isActiveOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];

    private normalizeIsActiveToYesNo(raw: any): 'Yes' | 'No' {
        if (raw === 1 || raw === '1' || raw === true || raw === 'true') return 'Yes';
        if (raw === 0 || raw === '0' || raw === false || raw === 'false') return 'No';
        if (typeof raw === 'string') {
            const s = raw.trim().toLowerCase();
            if (s === 'yes' || s === 'y') return 'Yes';
            if (s === 'no' || s === 'n') return 'No';
        }
        return 'Yes';
    }


    public onEdit(record: MetricMapping | any): void {

        this.isUpdateMode = true;
        const get = (k: string) => this.getProp(record, k);
        this.currentEditId = Number(get('Id') ?? get('id') ?? (record as any).Id ?? null);

        if (!this.mappingForm.get('IsActive')) {
            this.mappingForm.addControl('IsActive', this.fb.control(null, Validators.required));
        }

        if (!this.mappingForm.get('Remarks')) {
            this.mappingForm.addControl('Remarks', this.fb.control('', Validators.required));
        }

        const headUid = get('HeadUID') ?? get('headUID') ?? get('headUid') ?? null;
        const assistantUid = get('AssistantUID') ?? get('assistantUID') ?? get('assistantUid') ?? null;
        const metricId = get('MetricId') ?? get('metricId') ?? get('metricid') ?? null;

        this.AssignedToUid = headUid;
        this.AssistantUid = assistantUid;
        this.AssignToMetricId = metricId;

        this.headControl.setValue(this.getEmployeeDisplay(headUid));
        this.assistantControl.setValue(this.getEmployeeDisplay(assistantUid));
        this.metricControl.setValue(this.getMetricDescriptionDisplay(metricId));
        const rawIsActive = get('IsActive') ?? get('isActive') ?? undefined;
        const isActiveVal = this.normalizeIsActiveToYesNo(rawIsActive);

        const rawSchoolDivisionIds = get('SchoolID') ?? get('schoolID') ?? get('SchoolDivisionIDs') ?? get('SchoolIds') ?? get('schoolIds') ?? null;

        const schoolIds: string[] = rawSchoolDivisionIds
            ? String(rawSchoolDivisionIds).split(',')
                .map(s => s.trim())
                .filter(id => id)
            : [];

        this.selectedDivisions = schoolIds;

        this.mappingForm.patchValue({
            HeadUID: headUid,
            AssistantUID: assistantUid,
            MetricId: metricId,
            IsActive: isActiveVal,
            Type: get('Type') ?? get('type') ?? 'PA',
            Remarks: get('Remarks') ?? get('remarks') ?? '',
            SchoolId: schoolIds.join(',')
        });



        this.mappingForm.patchValue({
            HeadUID: headUid,
            AssistantUID: assistantUid,
            MetricId: metricId,
            IsActive: isActiveVal,
            Type: get('Type') ?? get('type') ?? 'PA',
            Remarks: get('Remarks') ?? get('remarks') ?? '',
            SchoolId: schoolIds.join(',')
        });

        this.mappingForm.get('IsActive')?.setValidators([Validators.required]);
        this.mappingForm.get('IsActive')?.updateValueAndValidity();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    public onSubmit(): void {
        if (this.mappingForm.invalid) {
            this.mappingForm.markAllAsTouched();
            return;
        }

        const formData = this.mappingForm.value;
        const schoolDivisionIDs = this.selectedDivisions.join(','); // Get comma-separated string for submission
        if (this.isUpdateMode && this.currentEditId !== null) {
            const MformData = new FormData();
            MformData.append('HeadUID', String(this.AssignedToUid));
            MformData.append('AssistantUID', String(this.AssistantUid));
            MformData.append('MetricId', String(formData.MetricId));
            MformData.append('Type', String(formData.Type));
            MformData.append('SchoolId', schoolDivisionIDs);
            const remarksVal = String(this.mappingForm.get('Remarks')?.value ?? '');
            MformData.append('Remarks', remarksVal);

            const isActiveVal = this.normalizeIsActiveToYesNo(this.mappingForm.get('IsActive')?.value);
            MformData.append('IsActive', isActiveVal);

            const idVal = String(this.currentEditId);
            MformData.append('Id', idVal);
            this.PlanningrankingService.updateRecord(MformData).pipe(take(1)).subscribe({
                next: (res: any) => {
                    const sres = res.item1[0];
                    if (sres.msg === '-1') {
                        swal.fire(
                            { title: 'Failed to Update', icon: 'error' }
                        ), setTimeout(() => {
                            window.location.reload();
                        }, 112200);
                    } else if (sres.msg === '1') {
                        swal.fire(
                            { title: 'Updation done : ', text: sres.msg, icon: 'success' }
                        ), setTimeout(() => {
                            window.location.reload();
                        }, 2200);
                    }

                    this.GetAllEventsData();
                    this.loadingIndicator = false;
                },
                error: (err: any) => {
                    console.error('Update failed', err);
                    this.loadingIndicator = false;
                }
            });
        } else {
            this.loadingIndicator = true;
            const payload: any = { ...formData };
            if ('IsActive' in payload) delete payload.IsActive;

            const MformData = new FormData();
            MformData.append('HeadUID', this.AssignedToUid);
            MformData.append('AssistantUID', formData.AssistantUID);
            MformData.append('MetricId', formData.MetricId);
            MformData.append('Type', formData.Type);
            MformData.append('SchoolId', schoolDivisionIDs);
            this.PlanningrankingService.InsertHeadMapping(MformData).pipe(take(1)).subscribe({
                next: (res: any) => {
                    swal.fire({
                        title: 'Success!',
                        text: 'New record added successfully!',
                        icon: 'success'
                    });
                    this.GetAllEventsData();
                    this.loadingIndicator = false;
                    window.location.reload();
                },
                error: (err: any) => {
                    console.error('InsertHeadMapping failed', err);
                    swal.fire({
                        title: 'Failed to Add Record',
                        text: 'An error occurred while adding the new record.',
                        icon: 'error'
                    });
                    this.loadingIndicator = false;
                    window.location.reload();
                }
            });
        }

        this.isUpdateMode = false;
        this.currentEditId = null;
        this.mappingForm.reset({ Type: 'PA' });
        if (this.mappingForm.get('IsActive')) this.mappingForm.removeControl('IsActive');
        if (this.mappingForm.get('Remarks')) this.mappingForm.removeControl('Remarks');
    }
    public isActiveDisplay(value: any): string {
        if (value === undefined || value === null) return '';
        if (value === 1 || value === '1' || value === true || value === 'True') return 'Yes';
        if (value === 0 || value === '0' || value === false || value === 'False') return 'No';
        if (typeof value === 'string') {
            const s = value.trim().toLowerCase();
            if (s === 'yes' || s === 'y') return 'Yes';
            if (s === 'no' || s === 'n') return 'No';
            return value;
        }
        return String(value);
    }

    public onCancelUpdate(): void {
        this.isUpdateMode = false;
        this.mappingForm.reset();
        this.headControl.setValue('');
        this.assistantControl.setValue('');
        this.metricControl.setValue('');
        this.selectedDivisions = [];
        this.AssignedToUid = null;
        this.AssistantUid = null;
        this.AssignToMetricId = null;
        this.currentEditId = null;
        this.filteredHeadsData = [];
        this.filteredAssistantsData = [];
        this.filteredMetricData = [];
        this.showHeadSuggestions = false;
        this.showAssistantSuggestions = false;
        this.showMetricSuggestions = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    public onDelete(record: MetricMapping | any): void {
        this.isUpdateMode = true;
        const get = (k: string) => this.getProp(record, k);
        this.currentEditId = Number(get('Id') ?? get('id') ?? (record as any).Id ?? null);

        swal.fire({
            title: 'Confirm Action',
            text: 'Are you sure you want to Inactive this record? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Proceed!',
            cancelButtonText: 'No, Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const get = (k: string) => this.getProp(record, k);
                this.currentEditId = Number(get('Id') ?? get('id') ?? (record as any).Id ?? null);
                const MformData = new FormData();
                MformData.append('RecordId', this.currentEditId);

                this.PlanningrankingService.deleteRecord(MformData).pipe(take(1)).subscribe({
                    next: (res: any) => {
                        const sres = res.item1[0];
                        if (sres.msg === '-1') {
                            swal.fire(
                                { title: 'Action Failed', icon: 'error' }
                            ), setTimeout(() => {
                                window.location.reload();
                            }, 112200);
                        } else if (sres.msg === '1') {
                            swal.fire(
                                { title: 'Action completed : ', text: sres.msg, icon: 'success' }
                            ), setTimeout(() => {
                                window.location.reload();
                            }, 2200);
                        }

                        this.GetAllEventsData();
                        this.loadingIndicator = false;
                    },
                    error: (err: any) => {
                        console.error('Update failed', err);
                        this.loadingIndicator = false;
                    }
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });

            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    employeeControl = new FormControl();
    employees: Employee[] = [];
    filteredEmployees: Employee[] = [];
    filteredEmployeesData: any;
    showSuggestions = false;
    activeSuggestionIndex: number = -1;
    uploadEnabled: boolean = false;
    EmployeeData: Employee[] = [];
    onInput() {
        const inputValue = this.employeeControl.value.toLowerCase();
        if (inputValue) {
            this.filteredEmployeesData = this.EmployeeData.filter(employee =>
                employee.employeeName.toLowerCase().includes(inputValue) || employee.employeeCode.toLowerCase().includes(inputValue)
            ).slice(0, 10);
        } else {
            this.filteredEmployeesData = [];
        }
        this.showSuggestions = true;
        this.activeSuggestionIndex = -1;
    }
    onMouseEnter(index: number) {
        this.activeSuggestionIndex = index;
    }

    onMouseClick(employee: any) {
        this.selectEmployee(employee);
    }
    selectEmployee(employee: Employee) {
        this.ResponsiblePerson = employee.employeeCode;
        this.AssignedToUid = employee.employeeCode;
        this.employeeControl.setValue(`${employee.employeeName} (${employee.employeeCode})`);
        this.filteredEmployeesData = [];
        this.showSuggestions = false;
        this.checkUIDValidity();
    }
    checkUIDValidity(): void {
        this.uploadEnabled = this.AssignedToUid != '';
    }
    hideSuggestions() {
        setTimeout(() => this.showSuggestions = false, 200);
    }
    ResponsiblePerson: any = '';
    headControl = new FormControl('');
    AssignedToUid: any;
    filteredHeadsData: Employee[] = [];
    showHeadSuggestions = false;
    activeHeadSuggestionIndex: number = -1;
    AssistantUid: any;
    assistantControl = new FormControl('');
    filteredAssistantsData: Employee[] = [];
    showAssistantSuggestions = false;
    activeAssistantSuggestionIndex: number = -1;
    activeMetricSuggestionIndex: number = -1;

    onHeadInput() {
        const inputValue = this.headControl.value ? this.headControl.value.toLowerCase() : '';
        if (inputValue) {
            this.filteredHeadsData = this.EmployeeData.filter(employee =>
                employee.employeeName.toLowerCase().includes(inputValue) || employee.employeeCode.toString().includes(inputValue)
            ).slice(0, 10);
            this.showHeadSuggestions = true;
        } else {
            this.filteredHeadsData = [];
            this.showHeadSuggestions = false;
        }
        this.activeHeadSuggestionIndex = -1;
    }

    selectHead(employee: Employee) {
        this.AssignedToUid = employee.employeeCode;
        this.mappingForm.get('HeadUID')?.setValue(employee.employeeCode); // Set the form control value for submission
        this.headControl.setValue(`${employee.employeeName} (${employee.employeeCode})`); // Set the display value

        this.filteredHeadsData = [];
        this.showHeadSuggestions = false;
        this.checkHeadUIDValidity();
    }
    checkHeadUIDValidity(): void {
    }
    hideHeadSuggestions() {
        setTimeout(() => this.showHeadSuggestions = false, 200);
    }
    onAssistantInput() {
        const inputValue = this.assistantControl.value ? this.assistantControl.value.toLowerCase() : '';
        if (inputValue) {
            this.filteredAssistantsData = this.EmployeeData.filter(employee =>
                employee.employeeName.toLowerCase().includes(inputValue) || employee.employeeCode.toString().includes(inputValue)
            ).slice(0, 10);
            this.showAssistantSuggestions = true;
        } else {
            this.filteredAssistantsData = [];
            this.showAssistantSuggestions = false;
        }
        this.activeAssistantSuggestionIndex = -1;
    }
    selectAssistant(employee: Employee) {
        this.AssistantUid = employee.employeeCode;
        this.mappingForm.get('AssistantUID')?.setValue(employee.employeeCode); // Set the form control value for submission
        this.assistantControl.setValue(`${employee.employeeName} (${employee.employeeCode})`); // Set the display value

        this.filteredAssistantsData = [];
        this.showAssistantSuggestions = false;
        this.checkAssistantUIDValidity();
    }
    checkAssistantUIDValidity(): void {
    }
    hideAssistantSuggestions() {
        setTimeout(() => this.showAssistantSuggestions = false, 200);
    }
    metricControl = new FormControl('');
    filteredMetricData: MetricDetails[] = [];
    showMetricSuggestions: boolean = false;
    AssignToMetricId: any;
    onKeydown(event: KeyboardEvent, type: 'head' | 'assistant' | 'metric') {
        let activeIndex: number;
        let filteredData: Employee[] | MetricDetails[];
        let selectFunction: (item: any) => void;
        if (type === 'head') {
            activeIndex = this.activeHeadSuggestionIndex;
            filteredData = this.filteredHeadsData;
            selectFunction = this.selectHead.bind(this);
        } else if (type === 'assistant') {
            activeIndex = this.activeAssistantSuggestionIndex;
            filteredData = this.filteredAssistantsData;
            selectFunction = this.selectAssistant.bind(this);
        }
        else { // type === 'metric'
            activeIndex = this.activeMetricSuggestionIndex;
            filteredData = this.filteredMetricData;
            selectFunction = this.selectMetric.bind(this);
        }
        if (filteredData.length === 0) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
            event.preventDefault();
        } else {
            return;
        }
        if (event.key === 'ArrowDown') {
            activeIndex = (activeIndex + 1) % filteredData.length;
        } else if (event.key === 'ArrowUp') {
            activeIndex = (activeIndex - 1 + filteredData.length) % filteredData.length;
        } else if (event.key === 'Enter') {
            if (activeIndex >= 0) {
                selectFunction(filteredData[activeIndex]);
            }
        }
        if (type === 'head') {
            this.activeHeadSuggestionIndex = activeIndex;
        } else if (type === 'assistant') {
            this.activeAssistantSuggestionIndex = activeIndex;
        } else { // type === 'metric'
            this.activeMetricSuggestionIndex = activeIndex;
        }
    }
    onMetricInput() {
        const inputValue = this.metricControl.value ? this.metricControl.value.toLowerCase() : '';
        if (inputValue) {
            this.filteredMetricData = this.allMetricDescription.filter(metric =>
                metric.id.toString().includes(inputValue)
            );
            this.showMetricSuggestions = true;
        } else {
            this.filteredMetricData = [];
            this.showMetricSuggestions = false;
        }
        this.activeMetricSuggestionIndex = -1;
    }
    selectMetric(metric: MetricDetails) {
        this.AssignToMetricId = metric.id;
        this.mappingForm.get('MetricId')?.setValue(metric.id);

        this.metricControl.setValue(`${metric.description} (${metric.id})`);

        this.filteredMetricData = [];
        this.showMetricSuggestions = false;
    }

    hideMetricSuggestions() {
        setTimeout(() => this.showMetricSuggestions = false, 200);
    }

    getEmployeeDisplay(uid: string | number | null | undefined): string {
        if (!uid) return '';
        const employee = this.EmployeeData.find(e => e.employeeCode.toString() === uid.toString());
        return employee ? `${employee.employeeName} (${employee.employeeCode})` : `${uid}`;
    }

    getMetricDescriptionDisplay(id: string | number | null | undefined): string {
        if (!id) return '';
        const metric = this.allMetricDescription.find(m => m.id.toString() === id.toString());
        return metric ? `${metric.description} (${metric.id})` : `ID ${id}`;
    }

    getSchoolNamesDisplay(ids: (number | string)[] | string | null | undefined): string {
        if (!ids) return '';

        const schoolIds = Array.isArray(ids)
            ? ids.map(id => id.toString())
            : (ids as string).split(',').map(id => id.trim()).filter(id => id);

        const names = this.allSchoolDivisions
            .filter(school => schoolIds.includes(school.id.toString()))
            .map(school => school.schoolDivision); // Uses the correct property: schoolDivision

        return names.join(', ');
    }
}
