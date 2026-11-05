using AppleStore.Application.Auth;
using AppleStore.Application.Reviews;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/reviews")]
public class AdminReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public AdminReviewsController(IReviewService reviews)
    {
        _reviews = reviews;
    }

    [HttpGet]
    public Task<AdminReviewListDto> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return _reviews.GetAdminReviewsAsync(q, page, pageSize, cancellationToken);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _reviews.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = "Không tìm thấy đánh giá." });
        }

        return Ok(new { message = "Đã xóa đánh giá." });
    }
}
