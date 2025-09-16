import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeReportComponent } from './administrative-report.component';

describe('AdministrativeReportComponent', () => {
  let component: AdministrativeReportComponent;
  let fixture: ComponentFixture<AdministrativeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrativeReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
