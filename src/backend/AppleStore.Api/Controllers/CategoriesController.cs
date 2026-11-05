using AppleStore.Application.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICatalogService _catalog;

    public CategoriesController(ICatalogService catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _catalog.GetCategoriesAsync(cancellationToken);
        return Ok(categories);
    }
}
