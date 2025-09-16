import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDriveMessagesComponent } from './detail-drive-messages.component';

describe('DetailDriveMessagesComponent', () => {
  let component: DetailDriveMessagesComponent;
  let fixture: ComponentFixture<DetailDriveMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailDriveMessagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailDriveMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
