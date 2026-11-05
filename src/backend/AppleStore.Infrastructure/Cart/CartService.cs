using AppleStore.Application.Cart;
using AppleStore.Domain.Cart;
using AppleStore.Domain.Catalog;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Cart;

public sealed class CartService : ICartService
{
    private readonly AppDbContext _db;

    public CartService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CartDto> GetAsync(string userId, CancellationToken cancellationToken)
    {
        var items = await _db.CartItems
            .AsNoTracking()
            .Include(item => item.ProductVariant)
            .ThenInclude(variant => variant.Product)
            .ThenInclude(product => product.Images)
            .Where(item => item.UserId == userId && item.ProductVariant.IsActive && item.ProductVariant.Product.IsActive)
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);
        return ToCart(items.Select(item => (item.ProductVariant, item.Quantity)));
    }

    public async Task<CartDto> SetQuantityAsync(string userId, int variantId, int quantity, CancellationToken cancellationToken)
    {
        var variant = await ActiveVariant(variantId, cancellationToken);
        var existing = await _db.CartItems.FirstOrDefaultAsync(item => item.UserId == userId && item.ProductVariantId == variantId, cancellationToken);
        if (variant is null || quantity <= 0)
        {
            if (existing is not null)
            {
                _db.CartItems.Remove(existing);
                await _db.SaveChangesAsync(cancellationToken);
            }

            return await GetAsync(userId, cancellationToken);
        }

        var nextQuantity = Math.Min(quantity, variant.StockQuantity);
        if (nextQuantity <= 0)
        {
            if (existing is not null)
            {
                _db.CartItems.Remove(existing);
                await _db.SaveChangesAsync(cancellationToken);
            }

            return await GetAsync(userId, cancellationToken);
        }

        if (existing is null)
        {
            _db.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductVariantId = variantId,
                Quantity = nextQuantity
            });
        }
        else
        {
            existing.Quantity = nextQuantity;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetAsync(userId, cancellationToken);
    }

    public async Task<CartDto> MergeAsync(string userId, IReadOnlyList<CartLineInput> items, CancellationToken cancellationToken)
    {
        foreach (var input in items)
        {
            if (input.Quantity <= 0)
            {
                continue;
            }

            var variant = await ActiveVariant(input.VariantId, cancellationToken);
            if (variant is null || variant.StockQuantity <= 0)
            {
                continue;
            }

            var existing = await _db.CartItems.FirstOrDefaultAsync(
                item => item.UserId == userId && item.ProductVariantId == input.VariantId,
                cancellationToken);
            var combined = Math.Min((existing?.Quantity ?? 0) + input.Quantity, variant.StockQuantity);
            if (existing is null)
            {
                _db.CartItems.Add(new CartItem
                {
                    UserId = userId,
                    ProductVariantId = input.VariantId,
                    Quantity = combined
                });
            }
            else
            {
                existing.Quantity = combined;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetAsync(userId, cancellationToken);
    }

    public async Task<CartDto> PreviewAsync(IReadOnlyList<CartLineInput> items, CancellationToken cancellationToken)
    {
        var lines = new List<(ProductVariant Variant, int Quantity)>();
        foreach (var input in items.Where(item => item.Quantity > 0))
        {
            var variant = await ActiveVariant(input.VariantId, cancellationToken);
            if (variant is null)
            {
                continue;
            }

            var quantity = Math.Min(input.Quantity, variant.StockQuantity);
            if (quantity > 0)
            {
                lines.Add((variant, quantity));
            }
        }

        return ToCart(lines);
    }

    private Task<ProductVariant?> ActiveVariant(int variantId, CancellationToken cancellationToken)
    {
        return _db.ProductVariants
            .Include(variant => variant.Product)
            .ThenInclude(product => product.Images)
            .FirstOrDefaultAsync(
                variant => variant.Id == variantId && variant.IsActive && variant.Product.IsActive && variant.Product.Category.IsActive,
                cancellationToken);
    }

    private static CartDto ToCart(IEnumerable<(ProductVariant Variant, int Quantity)> lines)
    {
        var items = lines.Select(line =>
        {
            var image = line.Variant.Product.Images.OrderByDescending(item => item.IsPrimary).ThenBy(item => item.SortOrder).FirstOrDefault();
            return new CartLineDto
            {
                VariantId = line.Variant.Id,
                ProductName = line.Variant.Product.Name,
                ProductSlug = line.Variant.Product.Slug,
                ImageUrl = image?.ImageUrl,
                ColorName = line.Variant.ColorName,
                Storage = line.Variant.Storage,
                UnitPrice = line.Variant.Price,
                Quantity = line.Quantity,
                StockQuantity = line.Variant.StockQuantity,
                LineTotal = line.Variant.Price * line.Quantity
            };
        }).ToList();

        return new CartDto
        {
            Items = items,
            Subtotal = items.Sum(item => item.LineTotal)
        };
    }
}
