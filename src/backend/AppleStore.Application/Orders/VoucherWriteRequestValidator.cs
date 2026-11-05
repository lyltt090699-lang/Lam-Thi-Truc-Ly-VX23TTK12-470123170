using FluentValidation;

namespace AppleStore.Application.Orders;

public sealed class VoucherWriteRequestValidator : AbstractValidator<VoucherWriteRequest>
{
    public VoucherWriteRequestValidator()
    {
        RuleFor(request => request.Code)
            .NotEmpty().WithMessage("Nhập mã giảm giá.")
            .MaximumLength(50).WithMessage("Mã giảm giá tối đa 50 ký tự.");
        RuleFor(request => request.Description)
            .NotEmpty().WithMessage("Nhập mô tả.")
            .MaximumLength(200).WithMessage("Mô tả tối đa 200 ký tự.");
        RuleFor(request => request.DiscountPercent)
            .InclusiveBetween(1, 100).WithMessage("Phần trăm giảm từ 1 đến 100.");
        RuleFor(request => request.MinSubtotal)
            .GreaterThanOrEqualTo(0).WithMessage("Giá trị đơn tối thiểu không âm.");
    }
}
