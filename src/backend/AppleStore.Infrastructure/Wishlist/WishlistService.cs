using AppleStore.Application.Catalog;
using AppleStore.Application.Wishlist;
using AppleStore.Domain.Catalog;
using AppleStore.Domain.Wishlist;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Wishlist;

public sealed class WishlistService : IWishlistService
{
    private readonly AppDbContext _db;

    public WishlistService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<WishlistDto> GetAsync(string userId, CancellationToken cancellationToken)
    {
        var items = await _db.WishlistItems
            .AsNoTracking()
            .Include(item => item.Product)
            .ThenInclude(product => product.Category)
            .Include(item => item.Product)
            .ThenInclude(product => product.Images)
            .Include(item => item.Product)
            .ThenInclude(product => product.Variants)
            .Where(item => item.UserId == userId && item.Product.IsActive && item.Product.Category.IsActive)
            .OrderByDescending(item => item.CreatedAt)
            .ToListAsync(cancellationToken);

        return new WishlistDto
        {
            Items = items.Select(item => MapListItem(item.Product)).ToList()
        };
    }

    public async Task<WishlistDto?> SetAsync(string userId, int productId, bool saved, CancellationToken cancellationToken)
    {
        var existing = await _db.WishlistItems
            .FirstOrDefaultAsync(item => item.UserId == userId && item.ProductId == productId, cancellationToken);

        if (!saved)
        {
            if (existing is not null)
            {
                _db.WishlistItems.Remove(existing);
                await _db.SaveChangesAsync(cancellationToken);
            }

            return await GetAsync(userId, cancellationToken);
        }

        var productExists = await _db.Products.AnyAsync(
            product => product.Id == productId && product.IsActive && product.Category.IsActive,
            cancellationToken);
        if (!productExists)
        {
            return null;
        }

        if (existing is null)
        {
            _db.WishlistItems.Add(new WishlistItem
            {
                UserId = userId,
                ProductId = productId,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(cancellationToken);
        }

        return await GetAsync(userId, cancellationToken);
    }

    private static ProductListItemDto MapListItem(Product product)
    {
        var prices = product.Variants.Where(variant => variant.IsActive).Select(variant => variant.Price).ToList();
        var primaryImage = product.Images.OrderByDescending(image => image.IsPrimary).ThenBy(image => image.SortOrder).FirstOrDefault();

        return new ProductListItemDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            ShortDescription = product.ShortDescription,
            CategoryName = product.Category.Name,
            CategorySlug = product.Category.Slug,
            IsFeatured = product.IsFeatured,
            IsNew = product.IsNew,
            PrimaryImageUrl = primaryImage?.ImageUrl,
            MinPrice = prices.Count == 0 ? 0 : prices.Min(),
            MaxPrice = prices.Count == 0 ? 0 : prices.Max()
        };
    }
}
