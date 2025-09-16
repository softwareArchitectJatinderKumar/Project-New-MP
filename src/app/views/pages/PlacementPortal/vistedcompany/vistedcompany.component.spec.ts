import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistedcompanyComponent } from './vistedcompany.component';

describe('VistedcompanyComponent', () => {
  let component: VistedcompanyComponent;
  let fixture: ComponentFixture<VistedcompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VistedcompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VistedcompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
