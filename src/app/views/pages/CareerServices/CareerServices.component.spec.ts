import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerServicesComponent } from './CareerServices.component';

describe('CareerServicesComponent', () => {
  let component: CareerServicesComponent;
  let fixture: ComponentFixture<CareerServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CareerServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
