/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MouReportDateWiseComponent } from './MouReportDateWise.component';

describe('MouReportDateWiseComponent', () => {
  let component: MouReportDateWiseComponent;
  let fixture: ComponentFixture<MouReportDateWiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MouReportDateWiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MouReportDateWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
