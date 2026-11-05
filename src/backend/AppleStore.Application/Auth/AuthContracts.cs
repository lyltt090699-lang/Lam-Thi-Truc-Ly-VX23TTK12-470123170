namespace AppleStore.Application.Auth;

public sealed class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
}

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public sealed class AuthSession
{
    public string Token { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string FullName { get; init; } = string.Empty;

    public IReadOnlyList<string> Roles { get; init; } = [];
}

public sealed class AuthOutcome
{
    public bool IsSuccess { get; init; }

    public int StatusCode { get; init; }

    public string Message { get; init; } = string.Empty;

    public Dictionary<string, string[]> Errors { get; init; } = [];

    public AuthSession? Session { get; init; }

    public static AuthOutcome SuccessMessage(string message)
    {
        return new AuthOutcome
        {
            IsSuccess = true,
            StatusCode = 200,
            Message = message
        };
    }

    public static AuthOutcome Success(AuthSession session)
    {
        return new AuthOutcome
        {
            IsSuccess = true,
            StatusCode = 200,
            Session = session
        };
    }

    public static AuthOutcome Failure(int statusCode, string message, Dictionary<string, string[]>? errors = null)
    {
        return new AuthOutcome
        {
            IsSuccess = false,
            StatusCode = statusCode,
            Message = message,
            Errors = errors ?? []
        };
    }
}
