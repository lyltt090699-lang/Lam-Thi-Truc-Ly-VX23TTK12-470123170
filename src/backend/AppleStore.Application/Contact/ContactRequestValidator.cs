using System.Text.RegularExpressions;
using FluentValidation;

namespace AppleStore.Application.Contact;

public sealed class ContactRequestValidator : AbstractValidator<ContactRequest>
{
    public ContactRequestValidator()
    {
        RuleFor(request => request.FullName)
            .NotEmpty().WithMessage("Nhập họ tên.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        RuleFor(request => request.Email)
            .NotEmpty().WithMessage("Nhập email.")
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .MaximumLength(256).WithMessage("Email tối đa 256 ký tự.");

        RuleFor(request => request.Phone)
            .Must(phone => string.IsNullOrWhiteSpace(phone) || Regex.IsMatch(phone.Trim(), "^0\\d{8,10}$"))
            .WithMessage("Số điện thoại chưa hợp lệ.");

        RuleFor(request => request.Message)
            .NotEmpty().WithMessage("Nhập nội dung.")
            .MaximumLength(2000).WithMessage("Nội dung tối đa 2000 ký tự.");
    }
}
