import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementrecordComponent } from './placementrecord.component';

describe('PlacementrecordComponent', () => {
  let component: PlacementrecordComponent;
  let fixture: ComponentFixture<PlacementrecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementrecordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
