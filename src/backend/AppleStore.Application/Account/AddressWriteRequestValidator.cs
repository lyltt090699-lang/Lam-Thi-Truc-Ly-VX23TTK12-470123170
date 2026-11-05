using FluentValidation;

namespace AppleStore.Application.Account;

public sealed class AddressWriteRequestValidator : AbstractValidator<AddressWriteRequest>
{
    public AddressWriteRequestValidator()
    {
        RuleFor(request => request.RecipientName)
            .NotEmpty().WithMessage("Nhập họ tên người nhận.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        RuleFor(request => request.Phone)
            .NotEmpty().WithMessage("Nhập số điện thoại.")
            .Matches("^0\\d{8,10}$").WithMessage("Số điện thoại chưa hợp lệ.");

        RuleFor(request => request.AddressLine)
            .NotEmpty().WithMessage("Nhập địa chỉ.")
            .MaximumLength(300).WithMessage("Địa chỉ tối đa 300 ký tự.");
    }
}
