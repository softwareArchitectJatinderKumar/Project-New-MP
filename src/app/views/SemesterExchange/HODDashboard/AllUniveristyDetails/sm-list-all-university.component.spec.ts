import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmListAllUniversityComponent } from './sm-list-all-university.component';

describe('SmListAllUniversityComponent', () => {
  let component: SmListAllUniversityComponent;
  let fixture: ComponentFixture<SmListAllUniversityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmListAllUniversityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmListAllUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
