using AppleStore.Application.Auth;
using AppleStore.Application.Catalog;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/categories")]
public class AdminCategoriesController : ControllerBase
{
    private readonly IAdminCategoryService _categories;
    private readonly IValidator<CategoryWriteRequest> _validator;

    public AdminCategoriesController(IAdminCategoryService categories, IValidator<CategoryWriteRequest> validator)
    {
        _categories = categories;
        _validator = validator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? q, [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return Ok(await _categories.GetCategoriesAsync(q, sort, page, pageSize, cancellationToken));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu danh mục chưa hợp lệ." });
        }

        var outcome = await _categories.CreateAsync(request, cancellationToken);
        return ToResult(outcome);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu danh mục chưa hợp lệ." });
        }

        var outcome = await _categories.UpdateAsync(id, request, cancellationToken);
        return ToResult(outcome);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var outcome = await _categories.DeleteAsync(id, cancellationToken);
        return ToResult(outcome);
    }

    private IActionResult ToResult(CategoryWriteOutcome outcome)
    {
        if (!outcome.Succeeded)
        {
            return StatusCode(outcome.StatusCode, new { message = outcome.Message });
        }

        return Ok(new { message = outcome.Message, category = outcome.Category });
    }
}
