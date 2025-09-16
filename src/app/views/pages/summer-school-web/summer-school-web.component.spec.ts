import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummerSchoolWebComponent } from './summer-school-web.component';

describe('SummerSchoolWebComponent', () => {
  let component: SummerSchoolWebComponent;
  let fixture: ComponentFixture<SummerSchoolWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummerSchoolWebComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummerSchoolWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
