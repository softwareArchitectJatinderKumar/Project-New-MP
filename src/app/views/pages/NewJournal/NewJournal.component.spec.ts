import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewJournalComponent } from './NewJournal.component';

describe('NewJournalComponent', () => {
  let component: NewJournalComponent;
  let fixture: ComponentFixture<NewJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewJournalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
