import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouActivityApprovalsComponent } from './MouActivityApprovals.component';

describe('MouActivityApprovalsComponent', () => {
  let component: MouActivityApprovalsComponent;
  let fixture: ComponentFixture<MouActivityApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MouActivityApprovalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MouActivityApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
