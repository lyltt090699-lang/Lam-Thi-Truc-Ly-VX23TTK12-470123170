using AppleStore.Application.Auth;
using AppleStore.Application.Contact;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/messages")]
public class AdminMessagesController : ControllerBase
{
    private readonly IContactService _contact;

    public AdminMessagesController(IContactService contact)
    {
        _contact = contact;
    }

    [HttpGet]
    public Task<ContactMessageListDto> List([FromQuery] int page = 1, [FromQuery] int pageSize = 8, CancellationToken cancellationToken = default)
    {
        return _contact.GetMessagesAsync(page, pageSize, cancellationToken);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var message = await _contact.GetMessageAsync(id, cancellationToken);
        if (message is null)
        {
            return NotFound(new { message = "Không tìm thấy tin nhắn." });
        }

        return Ok(message);
    }
}
