using FluentValidation;

namespace AppleStore.Application.Orders;

public sealed class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest>
{
    public PlaceOrderRequestValidator()
    {
        RuleFor(request => request.RecipientName)
            .NotEmpty().WithMessage("Nhập họ tên người nhận.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");
        RuleFor(request => request.Phone)
            .NotEmpty().WithMessage("Nhập số điện thoại.")
            .Matches(@"^0\d{8,10}$").WithMessage("Số điện thoại chưa hợp lệ.");
        RuleFor(request => request.AddressLine)
            .NotEmpty().WithMessage("Nhập địa chỉ giao hàng.")
            .MaximumLength(300).WithMessage("Địa chỉ tối đa 300 ký tự.");
        RuleFor(request => request.Note)
            .MaximumLength(500).WithMessage("Ghi chú tối đa 500 ký tự.");
        RuleFor(request => request.VoucherCode)
            .MaximumLength(50).WithMessage("Mã giảm giá tối đa 50 ký tự.");
    }
}
