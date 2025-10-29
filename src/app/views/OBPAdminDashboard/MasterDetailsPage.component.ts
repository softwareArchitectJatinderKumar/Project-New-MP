
import { _MatPaginatorBase } from '@angular/material/paginator';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { PlanningrankingService } from 'src/app/_services/planningranking.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, catchError, take, finalize } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { DataTableColumn } from '../../views/DynamicDataGrid/Dynamic-Datagrid-Component';


type ActiveTab = 'metric' | 'criteria' | 'indicator';

@Component({
  selector: 'app-master-details-page',
  templateUrl: './MasterDetailsPage.component.html',
  styleUrls: ['./MasterDetailsPage.scss']
})
export class MasterDetailsPageComponent implements OnInit {
  activeTab: ActiveTab = 'metric';

  // --- Data & Columns ---
  metricColumns: DataTableColumn[] = [];
  metricRecords: any[] = [];
  criteriaColumns: DataTableColumn[] = [];
  criteriaRecords: any[] = [];
  indicatorColumns: DataTableColumn[] = [];
  indicatorRecords: any[] = [];

  // --- Loading States (Bind these to a loading spinner in the HTML) ---
  isMetricLoading: boolean = false;
  isCriteriaLoading: boolean = false;
  isIndicatorLoading: boolean = false;

  isLoginFailed: boolean = false;

  constructor(
    private fb: FormBuilder, private dataService: PlanningrankingService,
    private PlanningrankingService: PlanningrankingService,
    public formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private authService: AuthService, private storageService: StorageService,

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
        this.loadData('metric');

        const stMainElement = document.getElementById('stMain');
        if (stMainElement) {
          stMainElement.innerHTML = 'OBP Admin <span class="themeClr"> Dashboard</span>';
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
    swal.fire({
      title: 'Login Failed',
      text: 'Login details are Invalid!',
      icon: 'warning',
    })
    const element = document.getElementById('OBPAdminDashboard');
    if (element) {
      element.hidden = true;
    }
  }

  loadingIndicator = false;


  selectTab(tab: ActiveTab): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.loadData(tab);
    }
  }


  loadData(tab: ActiveTab): void {

    let apiCall: any;
    let records = tab == 'metric' ? this.metricRecords :
      tab == 'criteria' ? this.criteriaRecords : this.indicatorRecords;

    if (records.length > 0) {
      return;
    }
    this.loadingIndicator = true;
    switch (tab) {
      case 'metric':

        this.isMetricLoading = true;
        apiCall = this.dataService.apiCallgetMetricMasterDetails();
        this.metricRecords = apiCall;

        break;
      case 'criteria':
        this.isCriteriaLoading = true;
        apiCall = this.dataService.getCriteriaMasterDetails();
        this.criteriaRecords = apiCall;
        break;
      case 'indicator':

        this.isIndicatorLoading = true;
        apiCall = this.dataService.getKeyIndicatorMasterDetails();
        this.indicatorRecords = apiCall;
        break;
    }

    apiCall.pipe(
      finalize(() => {
        if (tab === 'metric') this.isMetricLoading = false;
        if (tab === 'criteria') this.isCriteriaLoading = false;
        if (tab === 'indicator') this.isIndicatorLoading = false;
        this.loadingIndicator = false;
      })
    ).subscribe({
      next: (response: any) => {

        const dataArray: any[] = response && response.item1 ? response.item1 : [];

        if (dataArray && dataArray.length > 0) {

          const columns = this.generateColumnsFromData(dataArray);

          if (tab === 'metric') {
            this.metricRecords = dataArray;
            this.metricColumns = columns;
          } else if (tab === 'criteria') {
            this.criteriaRecords = dataArray;
            this.criteriaColumns = columns;
          } else if (tab === 'indicator') {
            this.indicatorRecords = dataArray;
            this.indicatorColumns = columns;
          }
        } else {
          console.warn(`API call succeeded for ${tab}, but data array is empty.`);
        }
      },
      error: (err: any) => {

      }
    });
  }

  // -------------------------------------------------------------------
  // Utility functions (remains the same)
  // -------------------------------------------------------------------
  private generateColumnsFromData(data: any[]): DataTableColumn[] {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);

    return keys.map(key => ({
      field: key,
      header: this.beautifyLabel(key)
    }));
  }

  private beautifyLabel(label: string): string {
    if (!label) return label;
    return label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  private getMockMetricData(count: number): any[] { /* ... */ return Array.from({ length: count }, (_, i) => ({ metricId: `M${100 + i}`, metricName: `Metric Title ${i + 1}`, /* ... */ })); }
  private getMockCriteriaData(count: number): any[] { /* ... */ return Array.from({ length: count }, (_, i) => ({ criteriaId: `CRI${500 + i}`, description: `Evaluation details for item ${i + 1}.`, /* ... */ })); }
  private getMockIndicatorData(count: number): any[] { /* ... */ return Array.from({ length: count }, (_, i) => ({ indicatorCode: `KI${700 + i}`, title: `Key Performance Indicator ${i + 1}`, /* ... */ })); }
}
