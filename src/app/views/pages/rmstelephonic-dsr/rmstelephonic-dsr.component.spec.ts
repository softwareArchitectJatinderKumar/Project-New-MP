import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RMSTelephonicDSRComponent } from './rmstelephonic-dsr.component';

describe('RMSTelephonicDSRComponent', () => {
  let component: RMSTelephonicDSRComponent;
  let fixture: ComponentFixture<RMSTelephonicDSRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RMSTelephonicDSRComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RMSTelephonicDSRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
