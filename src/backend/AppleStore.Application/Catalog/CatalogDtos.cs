namespace AppleStore.Application.Catalog;

public sealed class CategoryDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string ImageUrl { get; init; } = string.Empty;

    public int DisplayOrder { get; init; }
}

public sealed class PromotionDto
{
    public string Code { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public int DiscountPercent { get; init; }

    public decimal MinSubtotal { get; init; }
}

public sealed class BestsellerDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string ShortDescription { get; init; } = string.Empty;

    public string CategoryName { get; init; } = string.Empty;

    public string CategorySlug { get; init; } = string.Empty;

    public bool IsFeatured { get; init; }

    public bool IsNew { get; init; }

    public string? PrimaryImageUrl { get; init; }

    public decimal MinPrice { get; init; }

    public decimal MaxPrice { get; init; }

    public int SoldQuantity { get; init; }
}

public sealed class ProductListItemDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string ShortDescription { get; init; } = string.Empty;

    public string CategoryName { get; init; } = string.Empty;

    public string CategorySlug { get; init; } = string.Empty;

    public bool IsFeatured { get; init; }

    public bool IsNew { get; init; }

    public string? PrimaryImageUrl { get; init; }

    public decimal MinPrice { get; init; }

    public decimal MaxPrice { get; init; }
}

public sealed class ProductDetailDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Slug { get; init; } = string.Empty;

    public string ShortDescription { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string CategoryName { get; init; } = string.Empty;

    public string CategorySlug { get; init; } = string.Empty;

    public bool IsFeatured { get; init; }

    public bool IsNew { get; init; }

    public IReadOnlyList<ProductImageDto> Images { get; init; } = [];

    public IReadOnlyList<ProductVariantDto> Variants { get; init; } = [];
}

public sealed class ProductImageDto
{
    public string ImageUrl { get; init; } = string.Empty;

    public string AltText { get; init; } = string.Empty;

    public bool IsPrimary { get; init; }
}

public sealed class ProductVariantDto
{
    public int Id { get; init; }

    public string Sku { get; init; } = string.Empty;

    public string ColorName { get; init; } = string.Empty;

    public string ColorHex { get; init; } = string.Empty;

    public string Storage { get; init; } = string.Empty;

    public decimal Price { get; init; }

    public int StockQuantity { get; init; }
}
