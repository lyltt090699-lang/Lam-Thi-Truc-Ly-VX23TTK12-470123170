using System.Security.Claims;
using AppleStore.Application.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<ForgotPasswordRequest> _forgotPasswordValidator;
    private readonly IValidator<ResetPasswordRequest> _resetPasswordValidator;

    public AuthController(
        IAuthService auth,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IValidator<ForgotPasswordRequest> forgotPasswordValidator,
        IValidator<ResetPasswordRequest> resetPasswordValidator)
    {
        _auth = auth;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _forgotPasswordValidator = forgotPasswordValidator;
        _resetPasswordValidator = resetPasswordValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var validation = await _registerValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError("Thông tin đăng ký chưa hợp lệ.", validation));
        }

        return ToActionResult(await _auth.RegisterAsync(request, cancellationToken));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError("Thông tin đăng nhập chưa hợp lệ.", validation));
        }

        return ToActionResult(await _auth.LoginAsync(request, cancellationToken));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var validation = await _forgotPasswordValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError("Thông tin chưa hợp lệ.", validation));
        }

        return Ok(await _auth.ForgotPasswordAsync(request, cancellationToken));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var validation = await _resetPasswordValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(ToError("Thông tin chưa hợp lệ.", validation));
        }

        return ToActionResult(await _auth.ResetPasswordAsync(request, cancellationToken));
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
        }

        var user = await _auth.GetCurrentUserAsync(userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "Không tìm thấy tài khoản." });
        }

        return Ok(new { email = user.Email, fullName = user.FullName, roles = user.Roles });
    }

    private IActionResult ToActionResult(AuthOutcome outcome)
    {
        if (!outcome.IsSuccess)
        {
            return StatusCode(outcome.StatusCode, new
            {
                message = outcome.Message,
                errors = outcome.Errors
            });
        }

        if (outcome.Session is null)
        {
            return Ok(new { message = outcome.Message });
        }

        return Ok(outcome.Session);
    }

    private static object ToError(string message, FluentValidation.Results.ValidationResult validation)
    {
        return new
        {
            message,
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
