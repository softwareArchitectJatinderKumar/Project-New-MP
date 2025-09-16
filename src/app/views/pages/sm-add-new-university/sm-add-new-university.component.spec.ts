import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmAddNewUniversityComponent } from './sm-add-new-university.component';

describe('SmtAddNewUniversityComponent', () => {
  let component: SmAddNewUniversityComponent;
  let fixture: ComponentFixture<SmAddNewUniversityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmAddNewUniversityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmAddNewUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
