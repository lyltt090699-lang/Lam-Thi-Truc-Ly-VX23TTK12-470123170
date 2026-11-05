using AppleStore.Application.Auth;
using AppleStore.Application.Orders;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IAdminOrderService _orders;
    private readonly IValidator<OrderStatusRequest> _validator;

    public AdminOrdersController(IAdminOrderService orders, IValidator<OrderStatusRequest> validator)
    {
        _orders = orders;
        _validator = validator;
    }

    [HttpGet]
    public Task<AdminOrderListResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return _orders.ListAsync(q, status, page, pageSize, cancellationToken);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var order = await _orders.GetAsync(id, cancellationToken);
        if (order is null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        return Ok(order);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] OrderStatusRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });
        }

        var outcome = await _orders.ChangeStatusAsync(id, request.Status, cancellationToken);
        if (!outcome.IsSuccess)
        {
            return StatusCode(outcome.StatusCode, new { message = outcome.Message });
        }

        return Ok(outcome.Order);
    }
}
