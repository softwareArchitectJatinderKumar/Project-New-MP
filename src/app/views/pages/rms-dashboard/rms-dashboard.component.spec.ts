import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RMSDashboardComponent } from './rms-dashboard.component';

describe('RMSDashboardComponent', () => {
  let component: RMSDashboardComponent;
  let fixture: ComponentFixture<RMSDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RMSDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RMSDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
