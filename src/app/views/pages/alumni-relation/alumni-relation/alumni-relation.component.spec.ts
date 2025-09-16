import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumniRelationComponent } from './alumni-relation.component';

describe('AlumniRelationComponent', () => {
  let component: AlumniRelationComponent;
  let fixture: ComponentFixture<AlumniRelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlumniRelationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumniRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
