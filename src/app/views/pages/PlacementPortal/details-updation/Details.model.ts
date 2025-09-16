// university.model.ts
export interface CotnactDetails {
    Id: any;
    EmailId: string;
    Mobile: number;
    LinkedInUrl : string ; 
    SkypId : string; 
    WhatsAppNo : string; 
    MicrosoftId : string;
    PanCardNo : string;
    AadhaarNo : string;
    DrivingLicenseNo : string;
    PassportNo : string;
  };
  
  export interface FamilyFriendsDetails{
  ID: number;
	Relationship: string;
	Name:string;
  Age :string;
	Status :string;
	Desig :string;
	EmployerName :string;
	EmployerAddress :string;
	ContactNumber :string;
	EmailId :string;
	SMSSent :boolean;
	EmailSent :boolean;
  }