import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentUpdateListComponent } from './parent-update-list.component';

describe('ParentUpdateListComponent', () => {
  let component: ParentUpdateListComponent;
  let fixture: ComponentFixture<ParentUpdateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentUpdateListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentUpdateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
