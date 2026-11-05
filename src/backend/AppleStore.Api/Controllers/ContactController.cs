using AppleStore.Application.Contact;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contact;
    private readonly IValidator<ContactRequest> _validator;

    public ContactController(IContactService contact, IValidator<ContactRequest> validator)
    {
        _contact = contact;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContactRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                message = validation.Errors[0].ErrorMessage,
                errors = validation.Errors
                    .GroupBy(error => char.ToLowerInvariant(error.PropertyName[0]) + error.PropertyName[1..])
                    .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())
            });
        }

        var message = await _contact.CreateAsync(request, cancellationToken);
        return Ok(new { id = message.Id, message = "Đã gửi liên hệ." });
    }
}
