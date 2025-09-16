// universityUpdate.model.ts
export interface UniversityUpdate {

    UniversityId?: number;
    RankParameter: string;
    SigninDate: Date;
    ExpiryDate: Date;
    EmailId: string;
    SeatAvailable: number;
    CoordinateName: string;
    ContactNo: string;    
    UpdatedBy: string;
    CoursesOffered: string; 
  }
  