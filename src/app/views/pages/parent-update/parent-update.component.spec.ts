import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentUpdateComponent } from './parent-update.component';

describe('ParentUpdateComponent', () => {
  let component: ParentUpdateComponent;
  let fixture: ComponentFixture<ParentUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
