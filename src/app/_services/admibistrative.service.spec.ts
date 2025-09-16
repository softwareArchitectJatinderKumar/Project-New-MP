import { TestBed } from '@angular/core/testing';

import { AdmibistrativeService } from './admibistrative.service';

describe('AdmibistrativeService', () => {
  let service: AdmibistrativeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmibistrativeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
