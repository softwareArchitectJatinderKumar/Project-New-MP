import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdriveattendenceComponent } from './markdriveattendence.component';

describe('MarkdriveattendenceComponent', () => {
  let component: MarkdriveattendenceComponent;
  let fixture: ComponentFixture<MarkdriveattendenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkdriveattendenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarkdriveattendenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
