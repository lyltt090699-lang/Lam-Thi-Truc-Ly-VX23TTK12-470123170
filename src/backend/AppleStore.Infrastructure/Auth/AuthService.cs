using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppleStore.Application.Auth;
using AppleStore.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AppleStore.Infrastructure.Auth;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly RoleManager<IdentityRole> _roles;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtSettings _jwt;
    private readonly FrontendSettings _frontend;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> users,
        RoleManager<IdentityRole> roles,
        SignInManager<ApplicationUser> signInManager,
        IOptions<JwtSettings> jwt,
        IOptions<FrontendSettings> frontend,
        ILogger<AuthService> logger)
    {
        _users = users;
        _roles = roles;
        _signInManager = signInManager;
        _jwt = jwt.Value;
        _frontend = frontend.Value;
        _logger = logger;
    }

    public async Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var email = request.Email.Trim();
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = request.FullName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var result = await _users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return AuthOutcome.Failure(400, "Không tạo được tài khoản.", MapIdentityErrors(result));
        }

        await EnsureRoleAsync(AppRoles.Customer);
        var roleResult = await _users.AddToRoleAsync(user, AppRoles.Customer);
        if (!roleResult.Succeeded)
        {
            return AuthOutcome.Failure(400, "Không gán được quyền khách hàng.", MapIdentityErrors(roleResult));
        }

        return AuthOutcome.Success(await CreateSessionAsync(user));
    }

    public async Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var email = request.Email.Trim();
        var user = await _users.FindByEmailAsync(email);
        if (user is null)
        {
            return InvalidLogin();
        }

        var signIn = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (signIn.IsLockedOut)
        {
            return AuthOutcome.Failure(401, "Tài khoản tạm khóa. Thử lại sau ít phút.");
        }

        if (!signIn.Succeeded)
        {
            return InvalidLogin();
        }

        return AuthOutcome.Success(await CreateSessionAsync(user));
    }

    public async Task<AuthSession?> GetCurrentUserAsync(string userId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _users.FindByIdAsync(userId);
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            return null;
        }

        var roles = await _users.GetRolesAsync(user);
        return new AuthSession
        {
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles.ToArray()
        };
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        const string message = "Nếu email đã đăng ký, liên kết đặt lại mật khẩu sẽ hiện bên dưới.";
        var user = await _users.FindByEmailAsync(request.Email.Trim());
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            return new ForgotPasswordResponse { Message = message };
        }

        var token = await _users.GeneratePasswordResetTokenAsync(user);
        var resetUrl = $"{_frontend.Url.TrimEnd('/')}/dat-lai-mat-khau?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(token)}";
        _logger.LogInformation("Password reset link for {Email}: {ResetUrl}", user.Email, resetUrl);

        return new ForgotPasswordResponse
        {
            Message = message,
            ResetUrl = resetUrl
        };
    }

    public async Task<AuthOutcome> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _users.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            return AuthOutcome.Failure(400, "Liên kết đặt lại mật khẩu không còn hiệu lực.");
        }

        var result = await _users.ResetPasswordAsync(user, request.Token, request.Password);
        if (!result.Succeeded)
        {
            var invalidToken = result.Errors.Any(error => error.Code is "InvalidToken");
            if (invalidToken)
            {
                return AuthOutcome.Failure(400, "Liên kết đặt lại mật khẩu không còn hiệu lực.");
            }

            return AuthOutcome.Failure(400, "Không đặt lại được mật khẩu.", MapIdentityErrors(result));
        }

        return AuthOutcome.SuccessMessage("Đã đặt lại mật khẩu. Hãy đăng nhập.");
    }

    private async Task EnsureRoleAsync(string role)
    {
        if (!await _roles.RoleExistsAsync(role))
        {
            await _roles.CreateAsync(new IdentityRole(role));
        }
    }

    private async Task<AuthSession> CreateSessionAsync(ApplicationUser user)
    {
        var roles = await _users.GetRolesAsync(user);
        return new AuthSession
        {
            Token = CreateToken(user, roles),
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = roles.ToArray()
        };
    }

    private string CreateToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new("fullName", user.FullName)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_jwt.ExpiresHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static AuthOutcome InvalidLogin()
    {
        return AuthOutcome.Failure(401, "Email hoặc mật khẩu không đúng.");
    }

    private static Dictionary<string, string[]> MapIdentityErrors(IdentityResult result)
    {
        var errors = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var error in result.Errors)
        {
            var (field, message) = error.Code switch
            {
                "DuplicateUserName" or "DuplicateEmail" => ("email", "Email này đã được đăng ký."),
                "PasswordTooShort" => ("password", "Mật khẩu tối thiểu 8 ký tự."),
                "PasswordRequiresDigit" => ("password", "Mật khẩu cần chữ số."),
                "PasswordRequiresLower" => ("password", "Mật khẩu cần chữ thường."),
                "PasswordRequiresUpper" => ("password", "Mật khẩu cần chữ hoa."),
                "PasswordRequiresNonAlphanumeric" => ("password", "Mật khẩu cần ký tự đặc biệt."),
                _ => ("form", "Không tạo được tài khoản. Kiểm tra lại thông tin.")
            };

            if (!errors.TryGetValue(field, out var messages))
            {
                messages = [];
                errors[field] = messages;
            }

            if (!messages.Contains(message))
            {
                messages.Add(message);
            }
        }

        return errors.ToDictionary(pair => pair.Key, pair => pair.Value.ToArray());
    }
}
