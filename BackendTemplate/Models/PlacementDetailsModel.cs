using System;
using System.Collections.Generic;

namespace PlacementBackend.Models
{
    public class BatchYearModel
    {
        public int BatchYearId { get; set; }
        public string BatchYear { get; set; }
    }

    public class StreamModel
    {
        public int StreamId { get; set; }
        public string StreamName { get; set; }
    }

    public class SubStreamModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class PlacementDetailsModel
    {
        public string CompanyName { get; set; }
        public string DriveType { get; set; }
        public int DriveId { get; set; }
        public string DriveCategory { get; set; }
        public string ACTIVE { get; set; }
        public string IsConducted { get; set; }
        public string CompanyRelation { get; set; }
        public string PrimaryDiscipline { get; set; }
        public string Stream { get; set; }
        public string SubStream { get; set; }
        public DateTime? DriveDate { get; set; }
        public string DriveDateStatus { get; set; }
        public string Designation { get; set; }
        public string JobLocation { get; set; }
        public string SalaryPackage { get; set; }
        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
        public string SalaryDesc { get; set; }
        public int? Vacancies { get; set; }
        public string ResultDeclared { get; set; }
        public string PROVIDER { get; set; }
        public string ProviderDetail { get; set; }
        public string OWNERSHIP { get; set; }
        public string Department { get; set; }
        public int? TotalEligibleCandidates { get; set; }
        public int? TotalRegisteredCandidates { get; set; }
        public int? TotalParticipated { get; set; }
        public int? TotalSelectedCandidates { get; set; }
        public int? TotalStreamEligibleCandidates { get; set; }
        public int? TotalStreamRegisteredCandidates { get; set; }
        public int? TotalStreamParticipated { get; set; }
        public int? TotalSelectedCandidates2 { get; set; }
        public string PercentageSelection { get; set; }
        public string PercentageRegisteredCAndidates { get; set; }
    }
}
