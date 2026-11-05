using AppleStore.Application.Catalog;
using AppleStore.Domain.Catalog;
using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Catalog;

public sealed class CatalogService : ICatalogService
{
    private readonly AppDbContext _db;

    public CatalogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken)
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.DisplayOrder)
            .ThenBy(category => category.Name)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductListResult?> GetProductsAsync(ProductQuery query, CancellationToken cancellationToken)
    {
        var slug = query.CategorySlug?.Trim();
        if (!string.IsNullOrWhiteSpace(slug))
        {
            var categoryExists = await _db.Categories.AnyAsync(
                category => category.IsActive && category.Slug == slug,
                cancellationToken);
            if (!categoryExists)
            {
                return null;
            }
        }

        var products = _db.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Images)
            .Include(product => product.Variants)
            .Where(product => product.IsActive && product.Category.IsActive);

        if (!string.IsNullOrWhiteSpace(slug))
        {
            products = products.Where(product => product.Category.Slug == slug);
        }

        if (query.IsNew == true)
        {
            products = products.Where(product => product.IsNew);
        }

        if (query.IsFeatured == true)
        {
            products = products.Where(product => product.IsFeatured);
        }

        var loaded = await products.ToListAsync(cancellationToken);
        var term = query.Query?.Trim();
        if (!string.IsNullOrWhiteSpace(term))
        {
            loaded = loaded
                .Where(product =>
                    product.Name.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || product.ShortDescription.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || product.Category.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var facetSource = loaded.Where(product => product.Variants.Any(variant => VariantMatches(variant, query, false))).ToList();
        var matched = loaded.Where(product => product.Variants.Any(variant => VariantMatches(variant, query, true))).ToList();
        matched = SortProducts(matched, query.Sort);

        var pageSize = Math.Clamp(query.PageSize <= 0 ? 6 : query.PageSize, 1, 24);
        var totalCount = matched.Count;
        var pageCount = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize));
        var page = Math.Clamp(query.Page <= 0 ? 1 : query.Page, 1, pageCount);

        return new ProductListResult
        {
            Items = matched.Skip((page - 1) * pageSize).Take(pageSize).Select(MapListItem).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            Colors = facetSource
                .SelectMany(product => product.Variants.Where(variant => VariantMatches(variant, query, false)))
                .Select(variant => variant.ColorName)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(name => name)
                .ToList(),
            Storages = facetSource
                .SelectMany(product => product.Variants.Where(variant => VariantMatches(variant, query, false)))
                .Select(variant => variant.Storage)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(name => name)
                .ToList()
        };
    }

    public async Task<ProductDetailDto?> GetProductAsync(string slug, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(item => item.Category)
            .Include(item => item.Images)
            .Include(item => item.Variants)
            .FirstOrDefaultAsync(
                item => item.IsActive && item.Category.IsActive && item.Slug == slug,
                cancellationToken);

        if (product is null)
        {
            return null;
        }

        var variants = product.Variants
            .Where(variant => variant.IsActive)
            .OrderBy(variant => variant.Price)
            .ThenBy(variant => variant.Storage)
            .Select(variant => new ProductVariantDto
            {
                Id = variant.Id,
                Sku = variant.Sku,
                ColorName = variant.ColorName,
                ColorHex = variant.ColorHex,
                Storage = variant.Storage,
                Price = variant.Price,
                StockQuantity = variant.StockQuantity
            })
            .ToList();

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            ShortDescription = product.ShortDescription,
            Description = product.Description,
            CategoryName = product.Category.Name,
            CategorySlug = product.Category.Slug,
            IsFeatured = product.IsFeatured,
            IsNew = product.IsNew,
            Images = product.Images
                .OrderBy(image => image.SortOrder)
                .Select(image => new ProductImageDto
                {
                    ImageUrl = image.ImageUrl,
                    AltText = image.AltText,
                    IsPrimary = image.IsPrimary
                })
                .ToList(),
            Variants = variants
        };
    }

    private static bool VariantMatches(ProductVariant variant, ProductQuery query, bool applyChoice)
    {
        if (!variant.IsActive)
        {
            return false;
        }

        if (query.MinPrice is decimal minPrice && variant.Price < minPrice)
        {
            return false;
        }

        if (query.MaxPrice is decimal maxPrice && variant.Price > maxPrice)
        {
            return false;
        }

        if (query.InStock == true && variant.StockQuantity <= 0)
        {
            return false;
        }

        if (!applyChoice)
        {
            return true;
        }

        if (!string.IsNullOrWhiteSpace(query.Color)
            && !string.Equals(variant.ColorName, query.Color.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(query.Storage)
            && !string.Equals(variant.Storage, query.Storage.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    }

    public async Task<IReadOnlyList<PromotionDto>> GetPromotionsAsync(CancellationToken cancellationToken)
    {
        return await _db.Vouchers
            .AsNoTracking()
            .Where(voucher => voucher.IsActive)
            .OrderBy(voucher => voucher.Code)
            .Select(voucher => new PromotionDto
            {
                Code = voucher.Code,
                Description = voucher.Description,
                DiscountPercent = voucher.DiscountPercent,
                MinSubtotal = voucher.MinSubtotal
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BestsellerDto>> GetBestsellersAsync(CancellationToken cancellationToken)
    {
        var soldRows = await _db.OrderItems
            .AsNoTracking()
            .Where(item => item.Order.Status != OrderStatuses.Cancelled
                && item.ProductVariant.Product.IsActive
                && item.ProductVariant.Product.Category.IsActive)
            .GroupBy(item => item.ProductVariant.ProductId)
            .Select(group => new
            {
                ProductId = group.Key,
                SoldQuantity = group.Sum(item => item.Quantity)
            })
            .OrderByDescending(row => row.SoldQuantity)
            .ThenBy(row => row.ProductId)
            .Take(12)
            .ToListAsync(cancellationToken);

        if (soldRows.Count == 0)
        {
            return [];
        }

        var ids = soldRows.Select(row => row.ProductId).ToList();
        var products = await _db.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Images)
            .Include(product => product.Variants)
            .Where(product => ids.Contains(product.Id))
            .ToListAsync(cancellationToken);
        var byId = products.ToDictionary(product => product.Id);

        return soldRows
            .Where(row => byId.ContainsKey(row.ProductId))
            .Select(row => MapBestseller(byId[row.ProductId], row.SoldQuantity))
            .ToList();
    }

    private static List<Product> SortProducts(List<Product> products, string? sort)
    {
        return sort switch
        {
            "price-asc" => products.OrderBy(MinActivePrice).ThenBy(product => product.Name).ToList(),
            "price-desc" => products.OrderByDescending(MinActivePrice).ThenBy(product => product.Name).ToList(),
            "name" => products.OrderBy(product => product.Name).ToList(),
            _ => products.OrderByDescending(product => product.CreatedAt).ToList()
        };
    }

    private static decimal MinActivePrice(Product product)
    {
        var prices = product.Variants.Where(variant => variant.IsActive).Select(variant => variant.Price).ToList();
        return prices.Count == 0 ? 0 : prices.Min();
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

    private static BestsellerDto MapBestseller(Product product, int soldQuantity)
    {
        var item = MapListItem(product);
        return new BestsellerDto
        {
            Id = item.Id,
            Name = item.Name,
            Slug = item.Slug,
            ShortDescription = item.ShortDescription,
            CategoryName = item.CategoryName,
            CategorySlug = item.CategorySlug,
            IsFeatured = item.IsFeatured,
            IsNew = item.IsNew,
            PrimaryImageUrl = item.PrimaryImageUrl,
            MinPrice = item.MinPrice,
            MaxPrice = item.MaxPrice,
            SoldQuantity = soldQuantity
        };
    }
}
