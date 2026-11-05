using FluentValidation;

namespace AppleStore.Application.Auth;

public sealed class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty().WithMessage("Nhập email.")
            .EmailAddress().WithMessage("Email không hợp lệ.");

        RuleFor(request => request.Token)
            .NotEmpty().WithMessage("Liên kết đặt lại mật khẩu không hợp lệ.");

        RuleFor(request => request.Password)
            .NotEmpty().WithMessage("Nhập mật khẩu.")
            .MinimumLength(8).WithMessage("Mật khẩu tối thiểu 8 ký tự.")
            .Matches("[a-z]").WithMessage("Mật khẩu cần chữ thường.")
            .Matches("[A-Z]").WithMessage("Mật khẩu cần chữ hoa.")
            .Matches("[0-9]").WithMessage("Mật khẩu cần chữ số.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu cần ký tự đặc biệt.");

        RuleFor(request => request.ConfirmPassword)
            .Equal(request => request.Password).WithMessage("Mật khẩu nhập lại chưa khớp.");
    }
}
