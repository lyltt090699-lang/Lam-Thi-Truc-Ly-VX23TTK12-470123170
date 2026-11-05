namespace AppleStore.Application.Catalog;

public sealed class AdminCategoryDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string ImageUrl { get; init; } = string.Empty;

    public int DisplayOrder { get; init; }

    public bool IsActive { get; init; }

    public int ProductCount { get; init; }
}

public sealed class AdminCategoryListResult
{
    public IReadOnlyList<AdminCategoryDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }
}

public sealed class CategoryWriteRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }

    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
}

public sealed class CategoryWriteOutcome
{
    public bool Succeeded { get; init; }

    public int StatusCode { get; init; }

    public string Message { get; init; } = string.Empty;

    public AdminCategoryDto? Category { get; init; }

    public static CategoryWriteOutcome Ok(AdminCategoryDto category, string message) => new()
    {
        Succeeded = true,
        StatusCode = 200,
        Message = message,
        Category = category
    };

    public static CategoryWriteOutcome Fail(int statusCode, string message) => new()
    {
        Succeeded = false,
        StatusCode = statusCode,
        Message = message
    };
}

public interface IAdminCategoryService
{
    Task<AdminCategoryListResult> GetCategoriesAsync(string? query, string? sort, int page, int pageSize, CancellationToken cancellationToken);

    Task<CategoryWriteOutcome> CreateAsync(CategoryWriteRequest request, CancellationToken cancellationToken);

    Task<CategoryWriteOutcome> UpdateAsync(int id, CategoryWriteRequest request, CancellationToken cancellationToken);

    Task<CategoryWriteOutcome> DeleteAsync(int id, CancellationToken cancellationToken);
}
