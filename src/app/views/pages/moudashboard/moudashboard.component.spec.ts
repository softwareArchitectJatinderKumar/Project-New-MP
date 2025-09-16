import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOUDashboardComponent } from './moudashboard.component';

describe('MOUDashboardComponent', () => {
  let component: MOUDashboardComponent;
  let fixture: ComponentFixture<MOUDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MOUDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MOUDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
