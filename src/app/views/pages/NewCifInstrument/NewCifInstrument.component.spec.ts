import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCifInstrumentComponent } from './NewCifInstrument.component';

describe('NewCifInstrumentComponent', () => {
  let component: NewCifInstrumentComponent;
  let fixture: ComponentFixture<NewCifInstrumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewCifInstrumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewCifInstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
