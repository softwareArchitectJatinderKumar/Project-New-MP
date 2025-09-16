import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricandPlannerDataComponent } from './metricand-planner-data.component';

describe('MetricandPlannerDataComponent', () => {
  let component: MetricandPlannerDataComponent;
  let fixture: ComponentFixture<MetricandPlannerDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricandPlannerDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricandPlannerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
