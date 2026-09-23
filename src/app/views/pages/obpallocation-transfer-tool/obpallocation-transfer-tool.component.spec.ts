import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OBPAllocationTransferToolComponent } from './obpallocation-transfer-tool.component';

describe('OBPAllocationTransferToolComponent', () => {
  let component: OBPAllocationTransferToolComponent;
  let fixture: ComponentFixture<OBPAllocationTransferToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OBPAllocationTransferToolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OBPAllocationTransferToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

