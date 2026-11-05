using FluentValidation;

namespace AppleStore.Application.Auth;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(request => request.FullName)
            .NotEmpty().WithMessage("Nhập họ tên.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        RuleFor(request => request.Email)
            .NotEmpty().WithMessage("Nhập email.")
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .MaximumLength(256).WithMessage("Email tối đa 256 ký tự.");

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
