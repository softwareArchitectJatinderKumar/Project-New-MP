import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmAllApplicationsComponent } from './sm-all-applications.component';

describe('SmAllApplicationsComponent', () => {
  let component: SmAllApplicationsComponent;
  let fixture: ComponentFixture<SmAllApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmAllApplicationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmAllApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
