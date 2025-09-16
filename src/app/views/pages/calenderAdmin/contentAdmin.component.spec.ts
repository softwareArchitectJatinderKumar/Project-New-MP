import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentAdminComponent } from './contentAdmin.component';

describe('ContentComponent', () => {
  let component: ContentAdminComponent;
  let fixture: ComponentFixture<ContentAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
