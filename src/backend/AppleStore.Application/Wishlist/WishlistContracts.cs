using AppleStore.Application.Catalog;

namespace AppleStore.Application.Wishlist;

public sealed class WishlistSetRequest
{
    public int ProductId { get; set; }

    public bool Saved { get; set; }
}

public sealed class WishlistDto
{
    public IReadOnlyList<ProductListItemDto> Items { get; init; } = [];
}

public interface IWishlistService
{
    Task<WishlistDto> GetAsync(string userId, CancellationToken cancellationToken);

    Task<WishlistDto?> SetAsync(string userId, int productId, bool saved, CancellationToken cancellationToken);
}
