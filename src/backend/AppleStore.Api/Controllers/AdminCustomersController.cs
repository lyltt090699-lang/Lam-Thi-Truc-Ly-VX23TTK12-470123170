using AppleStore.Application.Auth;
using AppleStore.Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/customers")]
public class AdminCustomersController : ControllerBase
{
    private readonly IAdminCustomerService _customers;

    public AdminCustomersController(IAdminCustomerService customers)
    {
        _customers = customers;
    }

    [HttpGet]
    public Task<AdminCustomerListResult> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return _customers.ListAsync(q, page, pageSize, cancellationToken);
    }
}
