namespace AppleStore.Application.Catalog;

public sealed class ProductQuery
{
    public string? Query { get; init; }

    public string? CategorySlug { get; init; }

    public decimal? MinPrice { get; init; }

    public decimal? MaxPrice { get; init; }

    public string? Color { get; init; }

    public string? Storage { get; init; }

    public bool? InStock { get; init; }

    public bool? IsNew { get; init; }

    public bool? IsFeatured { get; init; }

    public string? Sort { get; init; }

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 6;
}

public sealed class ProductListRequest
{
    public string? Q { get; set; }

    public string? CategorySlug { get; set; }

    public decimal? MinPrice { get; set; }

    public decimal? MaxPrice { get; set; }

    public string? Color { get; set; }

    public string? Storage { get; set; }

    public bool? InStock { get; set; }

    public bool? IsNew { get; set; }

    public bool? IsFeatured { get; set; }

    public string? Sort { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 6;

    public ProductQuery ToQuery()
    {
        return new ProductQuery
        {
            Query = Q,
            CategorySlug = CategorySlug,
            MinPrice = MinPrice,
            MaxPrice = MaxPrice,
            Color = Color,
            Storage = Storage,
            InStock = InStock,
            IsNew = IsNew,
            IsFeatured = IsFeatured,
            Sort = Sort,
            Page = Page,
            PageSize = PageSize
        };
    }
}

public sealed class ProductListResult
{
    public IReadOnlyList<ProductListItemDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }

    public IReadOnlyList<string> Colors { get; init; } = [];

    public IReadOnlyList<string> Storages { get; init; } = [];
}
