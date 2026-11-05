using FluentValidation;

namespace AppleStore.Application.Auth;

public sealed class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty().WithMessage("Nhập email.")
            .EmailAddress().WithMessage("Email không hợp lệ.");
    }
}
