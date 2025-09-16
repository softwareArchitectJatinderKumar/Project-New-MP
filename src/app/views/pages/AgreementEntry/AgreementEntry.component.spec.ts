import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementEntryComponent } from './AgreementEntry.component';

describe('AgreementEntryComponent', () => {
  let component: AgreementEntryComponent;
  let fixture: ComponentFixture<AgreementEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgreementEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgreementEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
