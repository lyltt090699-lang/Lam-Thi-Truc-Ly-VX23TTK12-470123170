using System.Security.Claims;
using AppleStore.Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ICheckoutService _checkout;

    public OrdersController(ICheckoutService checkout)
    {
        _checkout = checkout;
    }

    [HttpGet]
    public Task<IReadOnlyList<OrderListItemDto>> List(CancellationToken cancellationToken)
    {
        return _checkout.ListAsync(UserId(), cancellationToken);
    }

    [HttpPost("lookup")]
    [AllowAnonymous]
    public async Task<IActionResult> Lookup([FromBody] OrderLookupRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Phone))
        {
            return BadRequest(new { message = "Nhập mã đơn và số điện thoại." });
        }

        var order = await _checkout.LookupAsync(request.Code, request.Phone, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        return Ok(order);
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> Get(string code, CancellationToken cancellationToken)
    {
        var order = await _checkout.GetAsync(UserId(), code, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        return Ok(order);
    }

    [HttpPost("{code}/cancel")]
    public async Task<IActionResult> Cancel(string code, CancellationToken cancellationToken)
    {
        var outcome = await _checkout.CancelAsync(UserId(), code, cancellationToken);
        if (!outcome.IsSuccess)
        {
            return StatusCode(outcome.StatusCode, new { message = outcome.Message });
        }

        return Ok(outcome.Order);
    }

    private string UserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }
}
