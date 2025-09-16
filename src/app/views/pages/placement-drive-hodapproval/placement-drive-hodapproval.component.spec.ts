import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementDriveHODApprovalComponent } from './placement-drive-hodapproval.component';

describe('PlacementDriveHODApprovalComponent', () => {
  let component: PlacementDriveHODApprovalComponent;
  let fixture: ComponentFixture<PlacementDriveHODApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlacementDriveHODApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlacementDriveHODApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
