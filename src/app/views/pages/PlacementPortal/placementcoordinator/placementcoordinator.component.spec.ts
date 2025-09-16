import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementcoordinatorComponent } from './placementcoordinator.component';

describe('PlacementcoordinatorComponent', () => {
  let component: PlacementcoordinatorComponent;
  let fixture: ComponentFixture<PlacementcoordinatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementcoordinatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementcoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
