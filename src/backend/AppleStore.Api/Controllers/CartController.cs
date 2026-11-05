using System.Security.Claims;
using AppleStore.Application.Cart;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cart;

    public CartController(ICartService cart)
    {
        _cart = cart;
    }

    [HttpGet]
    [Authorize]
    public Task<CartDto> Get(CancellationToken cancellationToken)
    {
        return _cart.GetAsync(UserId(), cancellationToken);
    }

    [HttpPut]
    [Authorize]
    public Task<CartDto> SetQuantity([FromBody] CartUpdateRequest request, CancellationToken cancellationToken)
    {
        return _cart.SetQuantityAsync(UserId(), request.VariantId, request.Quantity, cancellationToken);
    }

    [HttpPost("merge")]
    [Authorize]
    public Task<CartDto> Merge([FromBody] CartMergeRequest request, CancellationToken cancellationToken)
    {
        return _cart.MergeAsync(UserId(), request.Items, cancellationToken);
    }

    [HttpPost("preview")]
    public Task<CartDto> Preview([FromBody] CartMergeRequest request, CancellationToken cancellationToken)
    {
        return _cart.PreviewAsync(request.Items, cancellationToken);
    }

    private string UserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }
}
