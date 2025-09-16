import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementsummaryComponent } from './placementsummary.component';

describe('PlacementsummaryComponent', () => {
  let component: PlacementsummaryComponent;
  let fixture: ComponentFixture<PlacementsummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementsummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
