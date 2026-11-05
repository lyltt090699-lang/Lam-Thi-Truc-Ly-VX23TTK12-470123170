using AppleStore.Application.Auth;
using AppleStore.Application.Content;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/pages")]
public class AdminContentPagesController : ControllerBase
{
    private readonly IContentService _content;
    private readonly IValidator<ContentUpdateRequest> _validator;

    public AdminContentPagesController(IContentService content, IValidator<ContentUpdateRequest> validator)
    {
        _content = content;
        _validator = validator;
    }

    [HttpGet]
    public Task<IReadOnlyList<AdminContentPageDto>> List(CancellationToken cancellationToken)
    {
        return _content.GetAdminPagesAsync(cancellationToken);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ContentUpdateRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });
        }

        var page = await _content.UpdatePageAsync(id, request, cancellationToken);
        if (page is null)
        {
            return NotFound(new { message = "Không tìm thấy trang." });
        }

        return Ok(page);
    }
}
