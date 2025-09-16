import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalAboutComponent } from './journal-about.component';

describe('JournalAboutComponent', () => {
  let component: JournalAboutComponent;
  let fixture: ComponentFixture<JournalAboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalAboutComponent]
    });
    fixture = TestBed.createComponent(JournalAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
