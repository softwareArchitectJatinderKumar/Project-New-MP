// university.model.ts
export interface University {
    UniversityId?: number;
    UniversityName: string;
    CountryName: string;
    SeatAvailable: number;
    SemesterAcademicYear: number;
    RankParameters: string;
    UniversityRank: number;
    RankParameter: string;
    SigninDate: string;
    ExpiryDate: string;
    CoordinateName: string;
    EmailId: string;
    ContactNo: string;
    NominationDeadLineAutumn: Date;
    ApplicationDeadLineAutumn:Date;
    MobilityAutumn: string;
    NominationDeadLineSpring: Date;
    ApplicationDeadLineSpring: Date;
    MobilitySpring: string;
    FactSheetLink: string;
    CourseLink: string;
    NominationApplicationFormats: string;
    DocumentsRequired: string;
    // CoursesOffered: string; 
//     UniversityName,	Country, Seats,	,	,Ranking,	SigningDate,	ExpiryDate,CoordinatorName,EmailId,ContatNumber,NominationDeadLineAutumn,
// ApplicationDeadLineAutumn,
// MobilityAutumn,NominationDeadLineSpring,
// ApplicationDeadLineSpring,MobilitySpring,FactSheetLink,CourseLink,Nomination_Application_Formats,DocumentsRequired

  }
  