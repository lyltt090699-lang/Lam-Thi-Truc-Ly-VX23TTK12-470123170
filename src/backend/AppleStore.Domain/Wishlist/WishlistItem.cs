using AppleStore.Domain.Catalog;

namespace AppleStore.Domain.Wishlist;

public class WishlistItem
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
