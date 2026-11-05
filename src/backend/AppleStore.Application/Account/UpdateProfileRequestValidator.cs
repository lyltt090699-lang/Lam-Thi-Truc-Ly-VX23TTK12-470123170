using FluentValidation;

namespace AppleStore.Application.Account;

public sealed class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(request => request.FullName)
            .NotEmpty().WithMessage("Nhập họ tên.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        RuleFor(request => request.PhoneNumber)
            .Must(phone => string.IsNullOrWhiteSpace(phone) || System.Text.RegularExpressions.Regex.IsMatch(phone.Trim(), "^0\\d{8,10}$"))
            .WithMessage("Số điện thoại chưa hợp lệ.");
    }
}
