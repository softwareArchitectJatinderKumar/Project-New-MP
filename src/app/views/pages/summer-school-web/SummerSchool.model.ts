// university.model.ts
export interface SchoolDetails {
    Id?: number;
    UniversityName: string;
    Participants: number;
    Country: string;
    CreatedOn: Date;
    StartDate: Date;
    EndDate: Date;
    CreatedBy: string;
    isActive: boolean;
    UploadProof: string;
    FilePath: string;
  }
  export interface DropDownList {
    code: any
    text: any
}

export interface UpdateSchoolData {
  Id?: number;
  UniversityName: string;
  Participants: number;
  Country: string;
  CreatedOn: Date;
  StartDate: Date;
  EndDate: Date;
  CreatedBy: string;
  isActive: boolean;
  UploadProof: string;
  FilePath: string;
}
