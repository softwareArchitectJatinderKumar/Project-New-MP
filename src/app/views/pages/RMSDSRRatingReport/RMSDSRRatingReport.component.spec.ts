/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RMSDSRRatingReportComponent } from './RMSDSRRatingReport.component';

describe('RMSDSRRatingReportComponent', () => {
  let component: RMSDSRRatingReportComponent;
  let fixture: ComponentFixture<RMSDSRRatingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RMSDSRRatingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RMSDSRRatingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
