import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmsScannerComponent } from './rms-scanner.component';

describe('RmsScannerComponent', () => {
  let component: RmsScannerComponent;
  let fixture: ComponentFixture<RmsScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RmsScannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RmsScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
