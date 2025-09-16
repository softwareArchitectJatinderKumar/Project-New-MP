import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionRMSComponent } from './ConstructionRMS.component';

describe('UniHospitalMedicalCoverageComponent', () => {
  let component: ConstructionRMSComponent;
  let fixture: ComponentFixture<ConstructionRMSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstructionRMSComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstructionRMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
