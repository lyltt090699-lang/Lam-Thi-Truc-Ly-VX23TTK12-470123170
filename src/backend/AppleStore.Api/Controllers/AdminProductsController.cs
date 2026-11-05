using AppleStore.Application.Auth;
using AppleStore.Application.Catalog;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/products")]
public class AdminProductsController : ControllerBase
{
    private readonly IAdminProductService _products;
    private readonly IValidator<ProductWriteRequest> _validator;
    private readonly IWebHostEnvironment _environment;

    public AdminProductsController(IAdminProductService products, IValidator<ProductWriteRequest> validator, IWebHostEnvironment environment)
    {
        _products = products;
        _validator = validator;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? q, [FromQuery] int? categoryId, [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return Ok(await _products.GetProductsAsync(q, categoryId, sort, page, pageSize, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await _products.GetProductAsync(id, cancellationToken);
        return product is null ? NotFound(new { message = "Không tìm thấy sản phẩm." }) : Ok(product);
    }

    [HttpPost]
    public Task<IActionResult> Create([FromBody] ProductWriteRequest request, CancellationToken cancellationToken)
    {
        return Save(null, request, cancellationToken);
    }

    [HttpPut("{id:int}")]
    public Task<IActionResult> Update(int id, [FromBody] ProductWriteRequest request, CancellationToken cancellationToken)
    {
        return Save(id, request, cancellationToken);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        return ToResult(await _products.DeleteAsync(id, cancellationToken));
    }

    [HttpPost("images")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadImage(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "Chọn file ảnh." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not ".png" and not ".jpg" and not ".jpeg" and not ".webp" and not ".svg" and not ".gif")
        {
            return BadRequest(new { message = "Chỉ nhận ảnh png, jpg, webp, svg hoặc gif." });
        }

        var folder = Path.Combine(_environment.WebRootPath, "catalog", "uploads");
        Directory.CreateDirectory(folder);
        var name = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(folder, name);
        await using var stream = System.IO.File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);
        return Ok(new { imageUrl = $"/catalog/uploads/{name}" });
    }

    private async Task<IActionResult> Save(int? id, ProductWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });
        }

        var outcome = id is null
            ? await _products.CreateAsync(request, cancellationToken)
            : await _products.UpdateAsync(id.Value, request, cancellationToken);
        return ToResult(outcome);
    }

    private IActionResult ToResult(OperationResult outcome)
    {
        if (!outcome.Succeeded)
        {
            return StatusCode(outcome.StatusCode, new { message = outcome.Message });
        }

        return Ok(new { message = outcome.Message, id = outcome.Id });
    }
}
