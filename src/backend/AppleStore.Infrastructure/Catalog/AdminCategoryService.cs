using AppleStore.Application.Catalog;
using AppleStore.Domain.Catalog;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Catalog;

public sealed class AdminCategoryService : IAdminCategoryService
{
    private readonly AppDbContext _db;

    public AdminCategoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminCategoryListResult> GetCategoriesAsync(string? query, string? sort, int page, int pageSize, CancellationToken cancellationToken)
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .Select(category => new AdminCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                ProductCount = category.Products.Count
            })
            .ToListAsync(cancellationToken);

        var term = query?.Trim();
        if (!string.IsNullOrWhiteSpace(term))
        {
            categories = categories
                .Where(category =>
                    category.Name.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || category.Slug.Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        categories = sort switch
        {
            "name" => categories.OrderBy(category => category.Name).ToList(),
            "name-desc" => categories.OrderByDescending(category => category.Name).ToList(),
            _ => categories.OrderBy(category => category.DisplayOrder).ThenBy(category => category.Name).ToList()
        };

        var size = Math.Clamp(pageSize <= 0 ? 8 : pageSize, 1, 24);
        var total = categories.Count;
        var pageCount = Math.Max(1, (int)Math.Ceiling(total / (double)size));
        var current = Math.Clamp(page <= 0 ? 1 : page, 1, pageCount);

        return new AdminCategoryListResult
        {
            Items = categories.Skip((current - 1) * size).Take(size).ToList(),
            TotalCount = total,
            Page = current,
            PageSize = size
        };
    }

    public async Task<CategoryWriteOutcome> CreateAsync(CategoryWriteRequest request, CancellationToken cancellationToken)
    {
        var category = new Category();
        var error = await ApplyAsync(category, request, null, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return CategoryWriteOutcome.Ok(Map(category, 0), "Đã thêm danh mục.");
    }

    public async Task<CategoryWriteOutcome> UpdateAsync(int id, CategoryWriteRequest request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.Include(item => item.Products).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (category is null)
        {
            return CategoryWriteOutcome.Fail(404, "Không tìm thấy danh mục.");
        }

        var error = await ApplyAsync(category, request, id, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return CategoryWriteOutcome.Ok(Map(category, category.Products.Count), "Đã cập nhật danh mục.");
    }

    public async Task<CategoryWriteOutcome> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.Include(item => item.Products).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (category is null)
        {
            return CategoryWriteOutcome.Fail(404, "Không tìm thấy danh mục.");
        }

        if (category.Products.Count > 0)
        {
            return CategoryWriteOutcome.Fail(409, "Danh mục còn sản phẩm, không xóa được.");
        }

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(cancellationToken);
        return CategoryWriteOutcome.Ok(Map(category, 0), "Đã xóa danh mục.");
    }

    private async Task<CategoryWriteOutcome?> ApplyAsync(Category category, CategoryWriteRequest request, int? currentId, CancellationToken cancellationToken)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugText.Create(request.Name) : SlugText.Create(request.Slug);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return CategoryWriteOutcome.Fail(400, "Tên danh mục không tạo được đường dẫn.");
        }

        var slugTaken = currentId is null
            ? await _db.Categories.AnyAsync(item => item.Slug == slug, cancellationToken)
            : await _db.Categories.AnyAsync(item => item.Slug == slug && item.Id != currentId.Value, cancellationToken);
        if (slugTaken)
        {
            return CategoryWriteOutcome.Fail(409, "Đường dẫn danh mục đã tồn tại.");
        }

        category.Name = request.Name.Trim();
        category.Slug = slug;
        category.Description = request.Description.Trim();
        category.ImageUrl = request.ImageUrl.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        return null;
    }

    private static AdminCategoryDto Map(Category category, int productCount)
    {
        return new AdminCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductCount = productCount
        };
    }
}
