import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RMSLogComponent } from './rms-log.component';

describe('PlanningReportComponent', () => {
  let component: RMSLogComponent;
  let fixture: ComponentFixture<RMSLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RMSLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RMSLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
