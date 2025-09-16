import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoUApprovalComponent } from './MoUApproval.component';

describe('MoUApprovalComponent', () => {
  let component: MoUApprovalComponent;
  let fixture: ComponentFixture<MoUApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoUApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoUApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
