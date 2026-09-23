using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using PlacementBackend.Models;
using PlacementBackend.Interfaces;

namespace PlacementBackend.Services
{
    public class PlacementDetailsService : IPlacementDetailsService
    {
        private readonly string _connectionString;

        public PlacementDetailsService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("NewUMSConnectionString");
        }

        public async Task<IEnumerable<BatchYearModel>> GetBatchYearListingAsync()
        {
            var results = new List<BatchYearModel>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("pPlacementProgramMasterListing", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ListType", "Batch");

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(new BatchYearModel
                            {
                                BatchYearId = Convert.ToInt32(reader["BatchYearId"]),
                                BatchYear = reader["BatchYear"].ToString()
                            });
                        }
                    }
                }
            }
            return results;
        }

        public async Task<IEnumerable<StreamModel>> GetStreamListingAsync(string batchYear)
        {
            var results = new List<StreamModel>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("pPlacementProgramMasterListing", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ListType", "Stream");
                    cmd.Parameters.AddWithValue("@BatchYear", batchYear);

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(new StreamModel
                            {
                                StreamId = Convert.ToInt32(reader["StreamId"]),
                                StreamName = reader["StreamName"].ToString()
                            });
                        }
                    }
                }
            }
            return results;
        }

        public async Task<IEnumerable<SubStreamModel>> GetSubStreamListingAsync(string streamList, string batchYear)
        {
            var results = new List<SubStreamModel>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("pPlacementDriveMasterListing", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ListType", "SubStreamFeedback");
                    cmd.Parameters.AddWithValue("@StreamList", streamList);
                    cmd.Parameters.AddWithValue("@BatchYear", batchYear);

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(new SubStreamModel
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                Name = reader["Name"].ToString()
                            });
                        }
                    }
                }
            }
            return results;
        }

        public async Task<IEnumerable<PlacementDetailsModel>> GetPlacementDetailsByCompanyAsync(string batchYear, int streamId, string subStreamId)
        {
            var results = new List<PlacementDetailsModel>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("pGetPlacementDetailsByCompany", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BatchYear", batchYear);
                    cmd.Parameters.AddWithValue("@StreamId", streamId);
                    cmd.Parameters.AddWithValue("@SubStreamId", subStreamId);

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(new PlacementDetailsModel
                            {
                                CompanyName = reader["CompanyName"]?.ToString(),
                                DriveType = reader["DriveType"]?.ToString(),
                                DriveId = Convert.ToInt32(reader["DriveId"]),
                                DriveCategory = reader["DriveCategory"]?.ToString(),
                                ACTIVE = reader["ACTIVE"]?.ToString(),
                                IsConducted = reader["IsConducted"]?.ToString(),
                                CompanyRelation = reader["CompanyRelation"]?.ToString(),
                                PrimaryDiscipline = reader["PrimaryDiscipline"]?.ToString(),
                                Stream = reader["Stream"]?.ToString(),
                                SubStream = reader["SubStream"]?.ToString(),
                                DriveDate = reader["DriveDate"] != DBNull.Value ? Convert.ToDateTime(reader["DriveDate"]) : (DateTime?)null,
                                DriveDateStatus = reader["DriveDateStatus"]?.ToString(),
                                Designation = reader["Designation"]?.ToString(),
                                JobLocation = reader["JobLocation"]?.ToString(),
                                SalaryPackage = reader["SalaryPackage"]?.ToString(),
                                MinSalary = reader["MinSalary"] != DBNull.Value ? Convert.ToDecimal(reader["MinSalary"]) : (decimal?)null,
                                MaxSalary = reader["MaxSalary"] != DBNull.Value ? Convert.ToDecimal(reader["MaxSalary"]) : (decimal?)null,
                                SalaryDesc = reader["SalaryDesc"]?.ToString(),
                                Vacancies = reader["Vacancies"] != DBNull.Value ? Convert.ToInt32(reader["Vacancies"]) : (int?)null,
                                ResultDeclared = reader["ResultDeclared"]?.ToString(),
                                PROVIDER = reader["PROVIDER"]?.ToString(),
                                ProviderDetail = reader["ProviderDetail"]?.ToString(),
                                OWNERSHIP = reader["OWNERSHIP"]?.ToString(),
                                Department = reader["Department"]?.ToString(),
                                TotalEligibleCandidates = reader["TotalEligibleCandidates"] != DBNull.Value ? Convert.ToInt32(reader["TotalEligibleCandidates"]) : (int?)null,
                                TotalRegisteredCandidates = reader["TotalRegisteredCandidates"] != DBNull.Value ? Convert.ToInt32(reader["TotalRegisteredCandidates"]) : (int?)null,
                                TotalParticipated = reader["TotalParticipated"] != DBNull.Value ? Convert.ToInt32(reader["TotalParticipated"]) : (int?)null,
                                TotalSelectedCandidates = reader["TotalSelectedCandidates"] != DBNull.Value ? Convert.ToInt32(reader["TotalSelectedCandidates"]) : (int?)null,
                                TotalStreamEligibleCandidates = reader["TotalStreamEligibleCandidates"] != DBNull.Value ? Convert.ToInt32(reader["TotalStreamEligibleCandidates"]) : (int?)null,
                                TotalStreamRegisteredCandidates = reader["TotalStreamRegisteredCandidates"] != DBNull.Value ? Convert.ToInt32(reader["TotalStreamRegisteredCandidates"]) : (int?)null,
                                TotalStreamParticipated = reader["TotalStreamParticipated"] != DBNull.Value ? Convert.ToInt32(reader["TotalStreamParticipated"]) : (int?)null,
                                TotalSelectedCandidates2 = reader["TotalSelectedCandidates2"] != DBNull.Value ? Convert.ToInt32(reader["TotalSelectedCandidates2"]) : (int?)null,
                                PercentageSelection = reader["PercentageSelection"]?.ToString(),
                                PercentageRegisteredCAndidates = reader["PercentageRegisteredCAndidates"]?.ToString()
                            });
                        }
                    }
                }
            }
            return results;
        }
    }
}
