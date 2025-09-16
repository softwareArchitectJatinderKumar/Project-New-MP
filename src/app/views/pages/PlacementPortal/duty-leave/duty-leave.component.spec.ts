import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyLeaveComponent } from './duty-leave.component';

describe('DutyLeaveComponent', () => {
  let component: DutyLeaveComponent;
  let fixture: ComponentFixture<DutyLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DutyLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DutyLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
