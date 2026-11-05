using System.Security.Claims;
using AppleStore.Application.Wishlist;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/wishlist")]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlist;

    public WishlistController(IWishlistService wishlist)
    {
        _wishlist = wishlist;
    }

    [HttpGet]
    public Task<WishlistDto> Get(CancellationToken cancellationToken)
    {
        return _wishlist.GetAsync(UserId(), cancellationToken);
    }

    [HttpPut]
    public async Task<IActionResult> Set([FromBody] WishlistSetRequest request, CancellationToken cancellationToken)
    {
        var wishlist = await _wishlist.SetAsync(UserId(), request.ProductId, request.Saved, cancellationToken);
        if (wishlist is null)
        {
            return NotFound(new { message = "Không tìm thấy sản phẩm." });
        }

        return Ok(wishlist);
    }

    private string UserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }
}
