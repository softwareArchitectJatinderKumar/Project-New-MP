import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOUDashboardMobileComponent } from './moudashboardmobile.component';

describe('MOUDashboardMobileComponent', () => {
  let component: MOUDashboardMobileComponent;
  let fixture: ComponentFixture<MOUDashboardMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MOUDashboardMobileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MOUDashboardMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
