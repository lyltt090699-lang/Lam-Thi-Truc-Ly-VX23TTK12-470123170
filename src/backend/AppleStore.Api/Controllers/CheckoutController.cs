using System.Security.Claims;
using AppleStore.Application.Orders;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/checkout")]
public class CheckoutController : ControllerBase
{
    private readonly ICheckoutService _checkout;
    private readonly IValidator<PlaceOrderRequest> _validator;

    public CheckoutController(ICheckoutService checkout, IValidator<PlaceOrderRequest> validator)
    {
        _checkout = checkout;
        _validator = validator;
    }

    [HttpPost("quote")]
    public Task<CheckoutQuoteDto> Quote([FromBody] CheckoutQuoteRequest request, CancellationToken cancellationToken)
    {
        return _checkout.QuoteAsync(UserId(), request.VoucherCode, cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> Place([FromBody] PlaceOrderRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                message = "Thông tin đặt hàng chưa hợp lệ.",
                errors = validation.Errors
                    .GroupBy(error => ToFieldName(error.PropertyName))
                    .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())
            });
        }

        var outcome = await _checkout.PlaceAsync(UserId(), request, cancellationToken);
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

    private static string ToFieldName(string propertyName)
    {
        if (string.IsNullOrWhiteSpace(propertyName))
        {
            return "form";
        }

        return char.ToLowerInvariant(propertyName[0]) + propertyName[1..];
    }
}
