using AppleStore.Domain.Orders;
using FluentValidation;

namespace AppleStore.Application.Orders;

public sealed class OrderStatusRequestValidator : AbstractValidator<OrderStatusRequest>
{
    public OrderStatusRequestValidator()
    {
        RuleFor(request => request.Status)
            .Must(status => Allowed.Contains(status))
            .WithMessage("Trạng thái đơn không hợp lệ.");
    }

    public static readonly string[] Allowed =
    [
        OrderStatuses.Pending,
        OrderStatuses.Confirmed,
        OrderStatuses.Processing,
        OrderStatuses.Shipping,
        OrderStatuses.Completed,
        OrderStatuses.Cancelled
    ];
}
