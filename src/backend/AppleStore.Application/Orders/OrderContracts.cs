namespace AppleStore.Application.Orders;

public sealed class CheckoutQuoteRequest
{
    public string? VoucherCode { get; set; }
}

public sealed class PlaceOrderRequest
{
    public string RecipientName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public string? Note { get; set; }

    public string? VoucherCode { get; set; }
}

public sealed class CheckoutLineDto
{
    public int VariantId { get; init; }

    public string ProductName { get; init; } = string.Empty;

    public string ProductSlug { get; init; } = string.Empty;

    public string Sku { get; init; } = string.Empty;

    public string ColorName { get; init; } = string.Empty;

    public string Storage { get; init; } = string.Empty;

    public decimal UnitPrice { get; init; }

    public int Quantity { get; init; }

    public decimal LineTotal { get; init; }
}

public sealed class CheckoutQuoteDto
{
    public IReadOnlyList<CheckoutLineDto> Items { get; init; } = [];

    public decimal Subtotal { get; init; }

    public decimal ShippingFee { get; init; }

    public decimal Discount { get; init; }

    public decimal Total { get; init; }

    public string? VoucherCode { get; init; }

    public string? VoucherMessage { get; init; }

    public bool VoucherApplied { get; init; }
}

public sealed class OrderListLineDto
{
    public string ProductName { get; init; } = string.Empty;

    public string ProductSlug { get; init; } = string.Empty;

    public string ColorName { get; init; } = string.Empty;

    public string Storage { get; init; } = string.Empty;

    public decimal LineTotal { get; init; }
}

public sealed class OrderListItemDto
{
    public string Code { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public decimal Total { get; init; }

    public DateTime CreatedAt { get; init; }

    public int ItemCount { get; init; }

    public IReadOnlyList<OrderListLineDto> Items { get; init; } = [];
}

public sealed class OrderLookupRequest
{
    public string Code { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}

public sealed class OrderDto
{
    public string Code { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public string RecipientName { get; init; } = string.Empty;

    public string Phone { get; init; } = string.Empty;

    public string AddressLine { get; init; } = string.Empty;

    public string? Note { get; init; }

    public string? VoucherCode { get; init; }

    public decimal Subtotal { get; init; }

    public decimal ShippingFee { get; init; }

    public decimal Discount { get; init; }

    public decimal Total { get; init; }

    public IReadOnlyList<CheckoutLineDto> Items { get; init; } = [];
}

public sealed class PlaceOrderOutcome
{
    public int StatusCode { get; init; }

    public string Message { get; init; } = string.Empty;

    public OrderDto? Order { get; init; }

    public bool IsSuccess => StatusCode == 200;
}

public interface ICheckoutService
{
    Task<CheckoutQuoteDto> QuoteAsync(string userId, string? voucherCode, CancellationToken cancellationToken);

    Task<PlaceOrderOutcome> PlaceAsync(string userId, PlaceOrderRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<OrderListItemDto>> ListAsync(string userId, CancellationToken cancellationToken);

    Task<OrderDto?> GetAsync(string userId, string code, CancellationToken cancellationToken);

    Task<OrderDto?> LookupAsync(string code, string phone, CancellationToken cancellationToken);

    Task<PlaceOrderOutcome> CancelAsync(string userId, string code, CancellationToken cancellationToken);
}
