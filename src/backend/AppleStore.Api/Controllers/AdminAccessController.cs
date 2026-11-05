using AppleStore.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin")]
public class AdminAccessController : ControllerBase
{
    [HttpGet("access")]
    public IActionResult Access()
    {
        return Ok(new { message = "Khu quản trị đang mở." });
    }
}
