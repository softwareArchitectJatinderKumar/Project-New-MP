import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateActionablePointComponent } from './estate-actionable-point.component';

describe('EstateActionablePointComponent', () => {
  let component: EstateActionablePointComponent;
  let fixture: ComponentFixture<EstateActionablePointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstateActionablePointComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstateActionablePointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
