using System.Collections.Generic;
using System.Threading.Tasks;
using PlacementBackend.Models;

namespace PlacementBackend.Interfaces
{
    public interface IPlacementDetailsService
    {
        Task<IEnumerable<BatchYearModel>> GetBatchYearListingAsync();
        Task<IEnumerable<StreamModel>> GetStreamListingAsync(string batchYear);
        Task<IEnumerable<SubStreamModel>> GetSubStreamListingAsync(string streamList, string batchYear);
        Task<IEnumerable<PlacementDetailsModel>> GetPlacementDetailsByCompanyAsync(string batchYear, int streamId, string subStreamId);
    }
}
