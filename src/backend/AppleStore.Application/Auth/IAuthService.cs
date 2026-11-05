namespace AppleStore.Application.Auth;

public interface IAuthService
{
    Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);

    Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    Task<AuthSession?> GetCurrentUserAsync(string userId, CancellationToken cancellationToken);

    Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);

    Task<AuthOutcome> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
