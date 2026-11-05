using AppleStore.Application.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ICatalogService _catalog;

    public ProductsController(ICatalogService catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductListRequest request, CancellationToken cancellationToken)
    {
        var products = await _catalog.GetProductsAsync(request.ToQuery(), cancellationToken);
        if (products is null)
        {
            return NotFound(new { message = "Không tìm thấy danh mục." });
        }

        return Ok(products);
    }

    [HttpGet("promotions")]
    public Task<IReadOnlyList<PromotionDto>> Promotions(CancellationToken cancellationToken)
    {
        return _catalog.GetPromotionsAsync(cancellationToken);
    }

    [HttpGet("bestsellers")]
    public Task<IReadOnlyList<BestsellerDto>> Bestsellers(CancellationToken cancellationToken)
    {
        return _catalog.GetBestsellersAsync(cancellationToken);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var product = await _catalog.GetProductAsync(slug, cancellationToken);
        if (product is null)
        {
            return NotFound(new { message = "Không tìm thấy sản phẩm." });
        }

        return Ok(product);
    }
}
