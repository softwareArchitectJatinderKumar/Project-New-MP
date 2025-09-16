import { TestBed } from '@angular/core/testing';

import { StudentGrievanceServicesLocalService } from './student-grievance-services-local.service';

describe('StudentGrievanceServicesLocalService', () => {
  let service: StudentGrievanceServicesLocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGrievanceServicesLocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
