import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningReportComponent } from './planning-report.component';

describe('PlanningReportComponent', () => {
  let component: PlanningReportComponent;
  let fixture: ComponentFixture<PlanningReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanningReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
