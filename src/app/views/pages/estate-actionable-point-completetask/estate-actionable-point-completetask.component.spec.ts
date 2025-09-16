import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateActionablePointCompleteTaskComponent } from './estate-actionable-point-completetask.component';

describe('EstateActionablePointComponent', () => {
  let component: EstateActionablePointCompleteTaskComponent;
  let fixture: ComponentFixture<EstateActionablePointCompleteTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstateActionablePointCompleteTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstateActionablePointCompleteTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
