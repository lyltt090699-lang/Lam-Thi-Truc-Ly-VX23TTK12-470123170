using AppleStore.Application.Catalog;
using AppleStore.Domain.Catalog;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Catalog;

public sealed class AdminProductService : IAdminProductService
{
    private readonly AppDbContext _db;

    public AdminProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminProductListResult> GetProductsAsync(string? query, int? categoryId, string? sort, int page, int pageSize, CancellationToken cancellationToken)
    {
        var products = _db.Products.AsNoTracking().Include(product => product.Category).Include(product => product.Variants).AsQueryable();
        if (categoryId is > 0)
        {
            products = products.Where(product => product.CategoryId == categoryId);
        }

        var loaded = await products.ToListAsync(cancellationToken);
        var term = query?.Trim();
        if (!string.IsNullOrWhiteSpace(term))
        {
            loaded = loaded
                .Where(product =>
                    product.Name.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || product.Slug.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || product.Variants.Any(variant => variant.Sku.Contains(term, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        loaded = sort switch
        {
            "name" => loaded.OrderBy(product => product.Name).ToList(),
            "price-asc" => loaded.OrderBy(product => product.Variants.Select(variant => variant.Price).DefaultIfEmpty().Min()).ToList(),
            "price-desc" => loaded.OrderByDescending(product => product.Variants.Select(variant => variant.Price).DefaultIfEmpty().Min()).ToList(),
            "stock" => loaded.OrderBy(product => product.Variants.Sum(variant => variant.StockQuantity)).ToList(),
            _ => loaded.OrderByDescending(product => product.UpdatedAt).ToList()
        };

        var size = Math.Clamp(pageSize <= 0 ? 8 : pageSize, 1, 24);
        var total = loaded.Count;
        var pageCount = Math.Max(1, (int)Math.Ceiling(total / (double)size));
        var current = Math.Clamp(page <= 0 ? 1 : page, 1, pageCount);

        return new AdminProductListResult
        {
            Items = loaded.Skip((current - 1) * size).Take(size).Select(product => new AdminProductListItemDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                IsNew = product.IsNew,
                VariantCount = product.Variants.Count,
                StockQuantity = product.Variants.Sum(variant => variant.StockQuantity),
                MinPrice = product.Variants.Select(variant => variant.Price).DefaultIfEmpty().Min()
            }).ToList(),
            TotalCount = total,
            Page = current,
            PageSize = size
        };
    }

    public async Task<AdminProductDetailDto?> GetProductAsync(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(item => item.Images)
            .Include(item => item.Variants)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (product is null)
        {
            return null;
        }

        return new AdminProductDetailDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            Name = product.Name,
            Slug = product.Slug,
            ShortDescription = product.ShortDescription,
            Description = product.Description,
            IsFeatured = product.IsFeatured,
            IsNew = product.IsNew,
            IsActive = product.IsActive,
            Images = product.Images.OrderBy(image => image.SortOrder).Select(image => new ProductImageWrite
            {
                ImageUrl = image.ImageUrl,
                AltText = image.AltText,
                SortOrder = image.SortOrder,
                IsPrimary = image.IsPrimary
            }).ToList(),
            Variants = product.Variants.OrderBy(variant => variant.Id).Select(variant => new ProductVariantWrite
            {
                Id = variant.Id,
                Sku = variant.Sku,
                ColorName = variant.ColorName,
                ColorHex = variant.ColorHex,
                Storage = variant.Storage,
                Price = variant.Price,
                StockQuantity = variant.StockQuantity,
                IsActive = variant.IsActive
            }).ToList()
        };
    }

    public async Task<OperationResult> CreateAsync(ProductWriteRequest request, CancellationToken cancellationToken)
    {
        var product = new Product { CreatedAt = DateTime.UtcNow };
        var error = await ApplyAsync(product, request, null, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);
        return OperationResult.Ok("Đã thêm sản phẩm.", product.Id);
    }

    public async Task<OperationResult> UpdateAsync(int id, ProductWriteRequest request, CancellationToken cancellationToken)
    {
        var product = await _db.Products.Include(item => item.Images).Include(item => item.Variants).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (product is null)
        {
            return OperationResult.Fail(404, "Không tìm thấy sản phẩm.");
        }

        var error = await ApplyAsync(product, request, id, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return OperationResult.Ok("Đã cập nhật sản phẩm.", product.Id);
    }

    public async Task<OperationResult> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (product is null)
        {
            return OperationResult.Fail(404, "Không tìm thấy sản phẩm.");
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(cancellationToken);
        return OperationResult.Ok("Đã xóa sản phẩm.", id);
    }

    private async Task<OperationResult?> ApplyAsync(Product product, ProductWriteRequest request, int? currentId, CancellationToken cancellationToken)
    {
        var categoryExists = await _db.Categories.AnyAsync(category => category.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            return OperationResult.Fail(400, "Danh mục không tồn tại.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugText.Create(request.Name) : SlugText.Create(request.Slug);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return OperationResult.Fail(400, "Tên sản phẩm không tạo được đường dẫn.");
        }

        var slugTaken = currentId is null
            ? await _db.Products.AnyAsync(item => item.Slug == slug, cancellationToken)
            : await _db.Products.AnyAsync(item => item.Slug == slug && item.Id != currentId.Value, cancellationToken);
        if (slugTaken)
        {
            return OperationResult.Fail(409, "Đường dẫn sản phẩm đã tồn tại.");
        }

        var skus = request.Variants.Select(variant => variant.Sku.Trim()).ToList();
        if (skus.Distinct(StringComparer.OrdinalIgnoreCase).Count() != skus.Count)
        {
            return OperationResult.Fail(400, "SKU bị trùng trong sản phẩm.");
        }

        var choices = request.Variants.Select(variant => $"{variant.ColorName.Trim()}|{variant.Storage.Trim()}").ToList();
        if (choices.Distinct(StringComparer.OrdinalIgnoreCase).Count() != choices.Count)
        {
            return OperationResult.Fail(400, "Màu và dung lượng bị trùng.");
        }

        var skuTaken = currentId is null
            ? await _db.ProductVariants.AnyAsync(variant => skus.Contains(variant.Sku), cancellationToken)
            : await _db.ProductVariants.AnyAsync(variant => variant.ProductId != currentId.Value && skus.Contains(variant.Sku), cancellationToken);
        if (skuTaken)
        {
            return OperationResult.Fail(409, "SKU đã được dùng ở sản phẩm khác.");
        }

        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Slug = slug;
        product.ShortDescription = request.ShortDescription.Trim();
        product.Description = request.Description.Trim();
        product.IsFeatured = request.IsFeatured;
        product.IsNew = request.IsNew;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        _db.ProductImages.RemoveRange(product.Images);
        product.Images.Clear();
        var images = request.Images.Select((image, index) => new ProductImage
        {
            ImageUrl = image.ImageUrl.Trim(),
            AltText = string.IsNullOrWhiteSpace(image.AltText) ? product.Name : image.AltText.Trim(),
            SortOrder = image.SortOrder == 0 ? index : image.SortOrder,
            IsPrimary = image.IsPrimary
        }).ToList();
        if (!images.Any(image => image.IsPrimary))
        {
            images[0].IsPrimary = true;
        }

        foreach (var image in images)
        {
            product.Images.Add(image);
        }

        var incomingIds = request.Variants.Where(variant => variant.Id is > 0).Select(variant => variant.Id!.Value).ToHashSet();
        var removed = product.Variants.Where(variant => !incomingIds.Contains(variant.Id)).ToList();
        _db.ProductVariants.RemoveRange(removed);
        foreach (var variant in removed)
        {
            product.Variants.Remove(variant);
        }

        foreach (var input in request.Variants)
        {
            var variant = input.Id is > 0 ? product.Variants.FirstOrDefault(item => item.Id == input.Id) : null;
            variant ??= new ProductVariant();
            variant.Sku = input.Sku.Trim();
            variant.ColorName = input.ColorName.Trim();
            variant.ColorHex = input.ColorHex.Trim();
            variant.Storage = input.Storage.Trim();
            variant.Price = input.Price;
            variant.StockQuantity = input.StockQuantity;
            variant.IsActive = input.IsActive;
            if (variant.Id == 0)
            {
                product.Variants.Add(variant);
            }
        }

        return null;
    }
}
