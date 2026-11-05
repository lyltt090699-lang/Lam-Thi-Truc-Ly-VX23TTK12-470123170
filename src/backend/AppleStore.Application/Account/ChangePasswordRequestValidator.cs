using FluentValidation;

namespace AppleStore.Application.Account;

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(request => request.CurrentPassword)
            .NotEmpty().WithMessage("Nhập mật khẩu hiện tại.");

        RuleFor(request => request.NewPassword)
            .NotEmpty().WithMessage("Nhập mật khẩu mới.")
            .MinimumLength(8).WithMessage("Mật khẩu tối thiểu 8 ký tự.")
            .Matches("[a-z]").WithMessage("Mật khẩu cần chữ thường.")
            .Matches("[A-Z]").WithMessage("Mật khẩu cần chữ hoa.")
            .Matches("[0-9]").WithMessage("Mật khẩu cần chữ số.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu cần ký tự đặc biệt.");

        RuleFor(request => request.ConfirmPassword)
            .Equal(request => request.NewPassword).WithMessage("Mật khẩu nhập lại chưa khớp.");
    }
}
