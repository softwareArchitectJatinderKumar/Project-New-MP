import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObpallocationTransferToolComponent } from './obpallocation-transfer-tool.component';

describe('ObpallocationTransferToolComponent', () => {
  let component: ObpallocationTransferToolComponent;
  let fixture: ComponentFixture<ObpallocationTransferToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObpallocationTransferToolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObpallocationTransferToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
