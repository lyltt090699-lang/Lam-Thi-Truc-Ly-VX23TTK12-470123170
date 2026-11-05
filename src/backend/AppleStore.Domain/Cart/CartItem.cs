using AppleStore.Domain.Catalog;

namespace AppleStore.Domain.Cart;

public class CartItem
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int ProductVariantId { get; set; }

    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; }
}
