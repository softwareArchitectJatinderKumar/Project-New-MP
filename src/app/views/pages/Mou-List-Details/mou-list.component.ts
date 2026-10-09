import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { MouDocumentsService } from 'src/app/_services/mou-documents.service';
import { LpuPlannerServiceService } from 'src/app/_services/lpu-planner-service.service';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';

interface SchoolDivision {
  id: number;
  schoolDivision: string;
}

@Component({
  selector: 'app-mou-list',
  templateUrl: './mou-list.component.html',
  styleUrls: ['./mou-list.component.scss'],
})
export class MouListDocumentsComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  ColumnMode = ColumnMode;

  isLoginFailed: boolean = false;
  loadingIndicator = false;
  showNoDataFoundMessage: boolean = false;
  serverUrl: any;

  EmployeeDetails: any[] = [];
  MouDocumentDetails: any[] = [];
  filteredMouDocumentDetails: any[] = [];

  Email: any = '';
  EmployeeName: any = '';
  EmployeeCode: any = '';
  Department: any = '';
  DepartmentName: any;

  allSchoolDivisions: SchoolDivision[] = [];
  mouCategories: string[] = [];

  searchQuery: string = '';
  selectedSchoolDivision: any = '0';
  selectedMouCategory: string = '0';
  pageSize: number = 10;
  tableOffset: number = 0;

  constructor(
    private lpuPlannerServiceService: LpuPlannerServiceService,
    private storageService: StorageService,
    private mouDocumentsService: MouDocumentsService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const stMain = document.getElementById('stMain');
    if (stMain) {
      stMain.innerHTML = '<span class="themeClr">List of </span> MoU\'s';
    }
    const imgLogo = document.getElementById('imgLogo');
    if (imgLogo) {
      imgLogo.style.width = '164px';
    }

    this.serverUrl = 'https://files.lpu.in/umsweb/MOUDocuments/';
    this.loadingIndicator = false;

    const loginName = this.route.snapshot.params['loginName'];
    if (loginName != '' && loginName != undefined) {
      this.isLoginFailed = false;
      this.getToken(loginName);
    } else {
      this.LoginFailed('Invalid Login Details');
    }
  }

  getToken(id: any): void {
    this.authService.loginTemp(id).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.GetAllUploadsDetails();
        this.GetEmployeeDetails();
        this.GetAllCategories();
        this.GetAllActivities();
      },
      error: (err) => {
        this.LoginFailed(err);
      },
    });
  }

  LoginFailed(NewError: any): void {
    this.isLoginFailed = true;
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    });
    const element = document.getElementById('adminPage');
    if (element) {
      element.hidden = true;
    }
  }

  GetEmployeeDetails(): void {
    this.mouDocumentsService.GetEmployeeDetails().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          this.EmployeeName = response.item1[0].employeeName;
          this.Email = response.item1[0].email;
          this.EmployeeCode = response.item1[0].employeeCode;
          this.Department = response.item1[0].department;
          this.DepartmentName = response.item1[0].departmentName;
          this.isLoginFailed = false;
        } else {
          this.EmployeeDetails = [];
          this.isLoginFailed = true;
        }
      },
      error: (err) => {
        this.LoginFailed(err);
      },
    });
  }

  GetAllCategories(): void {
    this.mouDocumentsService.GetAllCategories().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          const list: string[] = [];
          response.item1.forEach((x: any) => {
            const val =
              typeof x === 'string'
                ? x
                : x.items ||
                  x.CategoryName ||
                  x.categoryName ||
                  x.category ||
                  x.mouCategory;
            if (
              val &&
              typeof val === 'string' &&
              val.trim() !== '' &&
              !list.includes(val.trim())
            ) {
              list.push(val.trim());
            }
          });
          this.mouCategories = list;
        } else {
          this.mouCategories = [];
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  GetAllActivities(): void {
    this.lpuPlannerServiceService.GetSchoolDivisions().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.allSchoolDivisions = response.item1;
        } else {
          this.allSchoolDivisions = [];
        }
      },
      error: (err) => {
        console.error('Error fetching school divisions:', err);
      },
    });
  }

  GetAllUploadsDetails(): void {
    this.loadingIndicator = true;
    this.mouDocumentsService.GetAllUploadedDocuments().subscribe({
      next: (response) => {
        this.loadingIndicator = false;
        if (response.item1 && response.item1.length > 0) {
          this.MouDocumentDetails = response.item1;
          this.showNoDataFoundMessage = false;
          this.applyFilters();
          this.isLoginFailed = false;
        } else {
          this.MouDocumentDetails = [];
          this.filteredMouDocumentDetails = [];
          this.showNoDataFoundMessage = true;
        }
      },
      error: (err) => {
        this.loadingIndicator = false;
        this.LoginFailed(err);
      },
    });
  }

  // ---------------------------------------------------------------------
  // Filtering (school / category / search)
  // ---------------------------------------------------------------------
  search(): void {
    this.applyFilters();
  }

  onSchoolDivisionChange(event: any): void {
    this.applyFilters();
  }

  onCategoryChange(event: any): void {
    this.applyFilters();
  }

  onPageSizeChange(newSize?: any): void {
    if (newSize) {
      this.pageSize = Number(newSize);
    } else {
      this.pageSize = Number(this.pageSize);
    }
    this.tableOffset = 0;
    if (this.table) {
      this.table.offset = 0;
    }
    this.filteredMouDocumentDetails = [...this.filteredMouDocumentDetails];
  }

  onPageChange(event: any): void {
    this.tableOffset = event.offset;
  }

  applyFilters(): void {
    let filtered = [...this.MouDocumentDetails];

    // Filter by School / Division
    if (
      this.selectedSchoolDivision &&
      this.selectedSchoolDivision.toString() !== '0'
    ) {
      const targetId = this.selectedSchoolDivision.toString().trim();
      const targetDiv = this.allSchoolDivisions.find(
        (d) => d.id.toString() === targetId,
      );
      const targetName = targetDiv
        ? targetDiv.schoolDivision.toLowerCase().trim()
        : '';

      filtered = filtered.filter((item) => {
        const rawSchool = (item.schoolDivisionInvolved || '')
          .toString()
          .toLowerCase();
        const uploadedBy = (item.mouUploadedBy || '').toString().toLowerCase();

        const idMatches = rawSchool
          .split(',')
          .map((s: string) => s.trim())
          .includes(targetId);

        const nameMatches =
          targetName &&
          (rawSchool.includes(targetName) || uploadedBy.includes(targetName));

        return idMatches || nameMatches;
      });
    }

    // Filter by MOU Category
    if (
      this.selectedMouCategory &&
      this.selectedMouCategory !== '0'
    ) {
      const targetCat = this.selectedMouCategory.toString().trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const cat1 = (item.mouCategory || '').toString().trim().toLowerCase();
        const cat2 = (item.category || '').toString().trim().toLowerCase();
        return cat1 === targetCat || cat2 === targetCat;
      });
    }

    // Free text search
    const query = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';
    if (query) {
      filtered = filtered.filter((item) => {
        const idMatch =
          (item.id && `mou/${item.id}`.toLowerCase().includes(query)) ||
          (item.id && item.id.toString().toLowerCase().includes(query)) ||
          (item.newMouId && item.newMouId.toLowerCase().includes(query));

        const orgMatch =
          (item.mouPartnerName &&
            item.mouPartnerName.toLowerCase().includes(query)) ||
          (item.mouTitle && item.mouTitle.toLowerCase().includes(query)) ||
          (item.mouPartner && item.mouPartner.toLowerCase().includes(query));

        const spocNameMatch =
          (item.lpuSpocName &&
            item.lpuSpocName.toLowerCase().includes(query)) ||
          (item.spocName && item.spocName.toLowerCase().includes(query));

        const spocUidMatch =
          (item.lpuSpocUID &&
            item.lpuSpocUID.toString().toLowerCase().includes(query)) ||
          (item.uid && item.uid.toString().toLowerCase().includes(query)) ||
          (item.mouUploadedByUID &&
            item.mouUploadedByUID.toString().toLowerCase().includes(query));

        const schoolMatch =
          (item.schoolDivisionInvolved &&
            item.schoolDivisionInvolved.toString().toLowerCase().includes(query)) ||
          (item.schoolDivisionInvolved &&
            this.getDivisionNames(item.schoolDivisionInvolved)
              .toLowerCase()
              .includes(query)) ||
          (item.mouUploadedBy &&
            item.mouUploadedBy.toLowerCase().includes(query));

        const dateMatch =
          (item.mouStartDate &&
            item.mouStartDate.toLowerCase().includes(query)) ||
          (item.mouEndDate && item.mouEndDate.toLowerCase().includes(query));

        const statusMatch =
          item.mouStatus && item.mouStatus.toLowerCase().includes(query);

        const categoryMatch =
          (item.mouCategory && item.mouCategory.toLowerCase().includes(query)) ||
          (item.category && item.category.toLowerCase().includes(query));

        return (
          idMatch ||
          orgMatch ||
          spocNameMatch ||
          spocUidMatch ||
          schoolMatch ||
          dateMatch ||
          statusMatch ||
          categoryMatch
        );
      });
    }

    this.filteredMouDocumentDetails = [...filtered];
    this.tableOffset = 0;
    if (this.table) {
      this.table.offset = 0;
    }
  }

  getTotalCount(): number {
    return this.MouDocumentDetails.length;
  }

  getActiveCount(): number {
    return this.MouDocumentDetails.filter(
      (item) =>
        item.mouStatus === 'Active' ||
        (!item.mouStatus && item.mouStartDate && !item.mouEndDate),
    ).length;
  }

  getExpiredCount(): number {
    return this.MouDocumentDetails.filter(
      (item) => item.mouStatus === 'Expired',
    ).length;
  }

  // ---------------------------------------------------------------------
  // Division lookups
  // ---------------------------------------------------------------------
  getDivisionNameById(id: number): string {
    const idStr = id.toString();
    const division = this.allSchoolDivisions.find(
      (s) => +s.id === +idStr || s.id.toString() === idStr,
    );
    return division ? division.schoolDivision : `ID ${idStr} not found`;
  }

  getDivisionNames(schoolDivisionInvolved: string): string {
    if (!schoolDivisionInvolved) return 'NA';
    const ids = schoolDivisionInvolved
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((n) => !isNaN(n));
    if (ids.length === 0) return schoolDivisionInvolved;

    const names = ids
      .map((id) => {
        const division = this.allSchoolDivisions.find((s) => +s.id === id);
        return division ? division.schoolDivision : '';
      })
      .filter((name) => !!name);

    return names.length > 0 ? names.join(', ') : schoolDivisionInvolved;
  }

  // ---------------------------------------------------------------------
  // Export to Excel
  // ---------------------------------------------------------------------
  exportToExcel(): void {
    const fileName = 'List_of_MoUs.xlsx';

    const exportedData = this.filteredMouDocumentDetails.map((item, index) => ({
      'Sr. No.': index + 1,
      'MoU ID': item.newMouId || (item.id ? 'MOU/' + item.id : 'N/A'),
      'Name of the Organization': item.mouPartnerName || item.mouTitle || 'N/A',
      'MoU Start Date': item.mouStartDate ?? 'N/A',
      'MoU End Date': item.mouEndDate
        ? item.mouEndDate
        : item.mouStartDate
          ? 'Indefinite'
          : 'N/A',
      'MOU Status':
        item.mouStatus ||
        (item.hasRenewal
          ? 'Renewed'
          : item.mouStartDate && !item.mouEndDate
            ? 'Active'
            : 'N/A'),
      'SPOC Name': item.lpuSpocName || item.spocName || 'N/A',
      'SPOC UID':
        item.lpuSpocUID || item.uid || item.mouUploadedByUID || 'N/A',
      'SPOC School': item.schoolDivisionInvolved
        ? this.getDivisionNames(item.schoolDivisionInvolved)
        : item.mouUploadedBy || 'N/A',
      'MOU Document': item.filePath ? item.filePath : 'No Doc Uploaded',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wscols = [
      { wpx: 60 },
      { wpx: 140 },
      { wpx: 260 },
      { wpx: 130 },
      { wpx: 130 },
      { wpx: 110 },
      { wpx: 180 },
      { wpx: 120 },
      { wpx: 240 },
      { wpx: 260 },
    ];
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'List of MoUs');
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' }),
    );
    link.download = fileName;
    link.click();
  }

  onDownloadFile(remoteUrl: string): void {
    if (!remoteUrl) return;
    swal.fire({
      title: 'Downloading...',
      didOpen: () => {
        swal.showLoading(null);
      },
    });

    this.mouDocumentsService.downloadMOUFile(remoteUrl).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        const fileName = remoteUrl.split('/').pop() || 'Document.pdf';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        swal.close();
      },
      error: async (err) => {
        swal.close();
        if (err.error instanceof Blob) {
          const errorMsg = JSON.parse(await err.error.text());
          swal.fire('Error', errorMsg.message || 'Download failed', 'error');
        } else {
          swal.fire('Error', 'Could not connect to the server', 'error');
        }
      },
    });
  }
}
