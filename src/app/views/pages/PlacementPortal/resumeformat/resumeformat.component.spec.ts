import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeformatComponent } from './resumeformat.component';

describe('ResumeformatComponent', () => {
  let component: ResumeformatComponent;
  let fixture: ComponentFixture<ResumeformatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResumeformatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResumeformatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
