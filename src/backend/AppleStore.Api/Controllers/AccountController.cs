using System.Security.Claims;
using AppleStore.Application.Account;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _account;
    private readonly IValidator<UpdateProfileRequest> _profileValidator;
    private readonly IValidator<ChangePasswordRequest> _passwordValidator;
    private readonly IValidator<AddressWriteRequest> _addressValidator;

    public AccountController(
        IAccountService account,
        IValidator<UpdateProfileRequest> profileValidator,
        IValidator<ChangePasswordRequest> passwordValidator,
        IValidator<AddressWriteRequest> addressValidator)
    {
        _account = account;
        _profileValidator = profileValidator;
        _passwordValidator = passwordValidator;
        _addressValidator = addressValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await _account.GetProfileAsync(UserId(), cancellationToken);
        if (profile is null)
        {
            return Unauthorized(new { message = "Không tìm thấy tài khoản." });
        }

        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var validation = await _profileValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError(validation));
        }

        var profile = await _account.UpdateProfileAsync(UserId(), request, cancellationToken);
        if (profile is null)
        {
            return BadRequest(new { message = "Không lưu được hồ sơ." });
        }

        return Ok(profile);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var validation = await _passwordValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError(validation));
        }

        var (success, message) = await _account.ChangePasswordAsync(UserId(), request, cancellationToken);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    [HttpGet("addresses")]
    public Task<IReadOnlyList<AddressDto>> GetAddresses(CancellationToken cancellationToken)
    {
        return _account.GetAddressesAsync(UserId(), cancellationToken);
    }

    [HttpPost("addresses")]
    public async Task<IActionResult> CreateAddress([FromBody] AddressWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _addressValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError(validation));
        }

        var existing = await _account.GetAddressesAsync(UserId(), cancellationToken);
        if (existing.Count >= 10)
        {
            return Conflict(new { message = "Chỉ lưu tối đa 10 địa chỉ." });
        }

        var address = await _account.CreateAddressAsync(UserId(), request, cancellationToken);
        if (address is null)
        {
            return Conflict(new { message = "Chỉ lưu tối đa 10 địa chỉ." });
        }

        return Ok(address);
    }

    [HttpPut("addresses/{id:int}")]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddressWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _addressValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError(validation));
        }

        var address = await _account.UpdateAddressAsync(UserId(), id, request, cancellationToken);
        if (address is null)
        {
            return NotFound(new { message = "Không tìm thấy địa chỉ." });
        }

        return Ok(address);
    }

    [HttpDelete("addresses/{id:int}")]
    public async Task<IActionResult> DeleteAddress(int id, CancellationToken cancellationToken)
    {
        var deleted = await _account.DeleteAddressAsync(UserId(), id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = "Không tìm thấy địa chỉ." });
        }

        return Ok(new { message = "Đã xóa địa chỉ." });
    }

    private string UserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }

    private static object ToError(FluentValidation.Results.ValidationResult validation)
    {
        return new
        {
            message = validation.Errors[0].ErrorMessage,
            errors = validation.Errors
                .GroupBy(error => ToFieldName(error.PropertyName))
                .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())
        };
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
