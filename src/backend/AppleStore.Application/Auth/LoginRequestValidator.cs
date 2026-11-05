using FluentValidation;

namespace AppleStore.Application.Auth;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty().WithMessage("Nhập email.")
            .EmailAddress().WithMessage("Email không hợp lệ.");

        RuleFor(request => request.Password)
            .NotEmpty().WithMessage("Nhập mật khẩu.");
    }
}
