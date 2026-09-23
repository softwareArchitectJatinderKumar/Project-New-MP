using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using PlacementBackend.Interfaces;

namespace PlacementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlacementDetailsController : ControllerBase
    {
        private readonly IPlacementDetailsService _service;

        public PlacementDetailsController(IPlacementDetailsService service)
        {
            _service = service;
        }

        [HttpGet("GetBatchYears")]
        public async Task<IActionResult> GetBatchYears()
        {
            var data = await _service.GetBatchYearListingAsync();
            return Ok(new { item1 = data });
        }

        [HttpGet("GetStreams")]
        public async Task<IActionResult> GetStreams([FromQuery] string batchYear)
        {
            var data = await _service.GetStreamListingAsync(batchYear);
            return Ok(new { item1 = data });
        }

        [HttpGet("GetSubStreams")]
        public async Task<IActionResult> GetSubStreams([FromQuery] string streamList, [FromQuery] string batchYear)
        {
            var data = await _service.GetSubStreamListingAsync(streamList, batchYear);
            return Ok(new { item1 = data });
        }

        [HttpGet("GetPlacementDetails")]
        public async Task<IActionResult> GetPlacementDetails([FromQuery] string batchYear, [FromQuery] int streamId, [FromQuery] string subStreamId)
        {
            var data = await _service.GetPlacementDetailsByCompanyAsync(batchYear, streamId, subStreamId);
            return Ok(new { item1 = data });
        }
    }
}
