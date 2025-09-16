import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivepdfComponent } from './drivepdf.component';

describe('DrivepdfComponent', () => {
  let component: DrivepdfComponent;
  let fixture: ComponentFixture<DrivepdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrivepdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DrivepdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
