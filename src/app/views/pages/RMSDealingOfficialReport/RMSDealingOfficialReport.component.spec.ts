/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RMSDealingOfficialReportComponent } from './RMSDealingOfficialReport.component';

describe('RMSDealingOfficialReportComponent', () => {
  let component: RMSDealingOfficialReportComponent;
  let fixture: ComponentFixture<RMSDealingOfficialReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RMSDealingOfficialReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RMSDealingOfficialReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
