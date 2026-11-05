namespace AppleStore.Application.Cart;

public sealed class CartLineInput
{
    public int VariantId { get; set; }

    public int Quantity { get; set; }
}

public sealed class CartUpdateRequest
{
    public int VariantId { get; set; }

    public int Quantity { get; set; }
}

public sealed class CartMergeRequest
{
    public List<CartLineInput> Items { get; set; } = [];
}

public sealed class CartLineDto
{
    public int VariantId { get; init; }

    public string ProductName { get; init; } = string.Empty;

    public string ProductSlug { get; init; } = string.Empty;

    public string? ImageUrl { get; init; }

    public string ColorName { get; init; } = string.Empty;

    public string Storage { get; init; } = string.Empty;

    public decimal UnitPrice { get; init; }

    public int Quantity { get; init; }

    public int StockQuantity { get; init; }

    public decimal LineTotal { get; init; }
}

public sealed class CartDto
{
    public IReadOnlyList<CartLineDto> Items { get; init; } = [];

    public decimal Subtotal { get; init; }
}

public interface ICartService
{
    Task<CartDto> GetAsync(string userId, CancellationToken cancellationToken);

    Task<CartDto> SetQuantityAsync(string userId, int variantId, int quantity, CancellationToken cancellationToken);

    Task<CartDto> MergeAsync(string userId, IReadOnlyList<CartLineInput> items, CancellationToken cancellationToken);

    Task<CartDto> PreviewAsync(IReadOnlyList<CartLineInput> items, CancellationToken cancellationToken);
}
