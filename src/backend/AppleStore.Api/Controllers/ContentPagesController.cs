using AppleStore.Application.Content;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/pages")]
public class ContentPagesController : ControllerBase
{
    private readonly IContentService _content;

    public ContentPagesController(IContentService content)
    {
        _content = content;
    }

    [HttpGet]
    public Task<IReadOnlyList<ContentPageListItemDto>> List(CancellationToken cancellationToken)
    {
        return _content.GetPagesAsync(cancellationToken);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> Get(string slug, CancellationToken cancellationToken)
    {
        var page = await _content.GetPageAsync(slug, cancellationToken);
        if (page is null)
        {
            return NotFound(new { message = "Không tìm thấy trang." });
        }

        return Ok(page);
    }
}
