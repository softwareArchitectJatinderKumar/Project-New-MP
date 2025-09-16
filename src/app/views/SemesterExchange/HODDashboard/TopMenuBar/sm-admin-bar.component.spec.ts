import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterMigrationAdminComponent } from './sm-admin-bar.component';

describe('SemesterMigrationAdminComponent', () => {
  let component: SemesterMigrationAdminComponent;
  let fixture: ComponentFixture<SemesterMigrationAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterMigrationAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemesterMigrationAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
