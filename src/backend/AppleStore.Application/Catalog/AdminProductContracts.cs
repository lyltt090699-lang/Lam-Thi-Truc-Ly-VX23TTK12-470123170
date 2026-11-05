namespace AppleStore.Application.Catalog;

public sealed class AdminProductListItemDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string CategoryName { get; init; } = string.Empty;

    public int CategoryId { get; init; }

    public bool IsActive { get; init; }

    public bool IsFeatured { get; init; }

    public bool IsNew { get; init; }

    public int VariantCount { get; init; }

    public int StockQuantity { get; init; }

    public decimal MinPrice { get; init; }
}

public sealed class AdminProductListResult
{
    public IReadOnlyList<AdminProductListItemDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }
}

public sealed class ProductImageWrite
{
    public string ImageUrl { get; set; } = string.Empty;

    public string AltText { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsPrimary { get; set; }
}

public sealed class ProductVariantWrite
{
    public int? Id { get; set; }

    public string Sku { get; set; } = string.Empty;

    public string ColorName { get; set; } = string.Empty;

    public string ColorHex { get; set; } = string.Empty;

    public string Storage { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
}

public sealed class ProductWriteRequest
{
    public int CategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }

    public string ShortDescription { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsFeatured { get; set; }

    public bool IsNew { get; set; }

    public bool IsActive { get; set; } = true;

    public List<ProductImageWrite> Images { get; set; } = [];

    public List<ProductVariantWrite> Variants { get; set; } = [];
}

public sealed class AdminProductDetailDto
{
    public int Id { get; init; }

    public int CategoryId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string ShortDescription { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public bool IsFeatured { get; init; }

    public bool IsNew { get; init; }

    public bool IsActive { get; init; }

    public IReadOnlyList<ProductImageWrite> Images { get; init; } = [];

    public IReadOnlyList<ProductVariantWrite> Variants { get; init; } = [];
}

public sealed class OperationResult
{
    public bool Succeeded { get; init; }

    public int StatusCode { get; init; }

    public string Message { get; init; } = string.Empty;

    public int? Id { get; init; }

    public static OperationResult Ok(string message, int? id = null) => new()
    {
        Succeeded = true,
        StatusCode = 200,
        Message = message,
        Id = id
    };

    public static OperationResult Fail(int statusCode, string message) => new()
    {
        Succeeded = false,
        StatusCode = statusCode,
        Message = message
    };
}

public interface IAdminProductService
{
    Task<AdminProductListResult> GetProductsAsync(string? query, int? categoryId, string? sort, int page, int pageSize, CancellationToken cancellationToken);

    Task<AdminProductDetailDto?> GetProductAsync(int id, CancellationToken cancellationToken);

    Task<OperationResult> CreateAsync(ProductWriteRequest request, CancellationToken cancellationToken);

    Task<OperationResult> UpdateAsync(int id, ProductWriteRequest request, CancellationToken cancellationToken);

    Task<OperationResult> DeleteAsync(int id, CancellationToken cancellationToken);
}
