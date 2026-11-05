namespace AppleStore.Application.Orders;

public sealed class AdminOrderListItemDto
{
    public int Id { get; init; }

    public string Code { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public string CustomerEmail { get; init; } = string.Empty;

    public string RecipientName { get; init; } = string.Empty;

    public string Phone { get; init; } = string.Empty;

    public decimal Total { get; init; }

    public DateTime CreatedAt { get; init; }
}

public sealed class AdminOrderListResult
{
    public IReadOnlyList<AdminOrderListItemDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }
}

public sealed class AdminOrderDetailDto
{
    public int Id { get; init; }

    public string Code { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public string CustomerEmail { get; init; } = string.Empty;

    public string RecipientName { get; init; } = string.Empty;

    public string Phone { get; init; } = string.Empty;

    public string AddressLine { get; init; } = string.Empty;

    public string? Note { get; init; }

    public string? VoucherCode { get; init; }

    public decimal Subtotal { get; init; }

    public decimal ShippingFee { get; init; }

    public decimal Discount { get; init; }

    public decimal Total { get; init; }

    public DateTime CreatedAt { get; init; }

    public IReadOnlyList<CheckoutLineDto> Items { get; init; } = [];
}

public sealed class OrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public sealed class AdminOrderStatusOutcome
{
    public int StatusCode { get; init; }

    public string Message { get; init; } = string.Empty;

    public AdminOrderDetailDto? Order { get; init; }

    public bool IsSuccess => StatusCode == 200;
}

public interface IAdminOrderService
{
    Task<AdminOrderListResult> ListAsync(string? query, string? status, int page, int pageSize, CancellationToken cancellationToken);

    Task<AdminOrderDetailDto?> GetAsync(int id, CancellationToken cancellationToken);

    Task<AdminOrderStatusOutcome> ChangeStatusAsync(int id, string status, CancellationToken cancellationToken);
}
