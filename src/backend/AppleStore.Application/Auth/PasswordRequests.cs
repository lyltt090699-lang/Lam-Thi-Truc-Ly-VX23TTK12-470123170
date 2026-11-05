namespace AppleStore.Application.Auth;

public sealed class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public sealed class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
}

public sealed class ForgotPasswordResponse
{
    public string Message { get; init; } = string.Empty;

    public string? ResetUrl { get; init; }
}
