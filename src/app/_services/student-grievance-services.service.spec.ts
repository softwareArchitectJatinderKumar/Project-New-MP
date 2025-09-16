import { TestBed } from '@angular/core/testing';

import { StudentGrievanceServicesService } from './student-grievance-services.service';

describe('StudentGrievanceServicesService', () => {
  let service: StudentGrievanceServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGrievanceServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
