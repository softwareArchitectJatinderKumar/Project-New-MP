import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingcompanyComponent } from './upcomingcompany.component';

describe('UpcomingcompanyComponent', () => {
  let component: UpcomingcompanyComponent;
  let fixture: ComponentFixture<UpcomingcompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpcomingcompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpcomingcompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
