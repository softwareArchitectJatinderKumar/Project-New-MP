import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RMSPendeancyComponent } from './rms-pendeancy.component';

describe('RMSPendeancyComponent', () => {
  let component: RMSPendeancyComponent;
  let fixture: ComponentFixture<RMSPendeancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RMSPendeancyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RMSPendeancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
