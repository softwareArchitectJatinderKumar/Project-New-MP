import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementDriveComponent } from './placement-drive.component';

describe('PlacementDriveComponent', () => {
  let component: PlacementDriveComponent;
  let fixture: ComponentFixture<PlacementDriveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlacementDriveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlacementDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
