import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalEditorBoardComponent } from './journal-editor-board.component';

describe('JournalEditorBoardComponent', () => {
  let component: JournalEditorBoardComponent;
  let fixture: ComponentFixture<JournalEditorBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalEditorBoardComponent]
    });
    fixture = TestBed.createComponent(JournalEditorBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
