import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsUpdationComponent } from './details-updation.component';

describe('DetailsUpdationComponent', () => {
  let component: DetailsUpdationComponent;
  let fixture: ComponentFixture<DetailsUpdationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsUpdationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsUpdationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
