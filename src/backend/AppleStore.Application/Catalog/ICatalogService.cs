namespace AppleStore.Application.Catalog;

public interface ICatalogService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken);

    Task<ProductListResult?> GetProductsAsync(ProductQuery query, CancellationToken cancellationToken);

    Task<ProductDetailDto?> GetProductAsync(string slug, CancellationToken cancellationToken);

    Task<IReadOnlyList<PromotionDto>> GetPromotionsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<BestsellerDto>> GetBestsellersAsync(CancellationToken cancellationToken);
}
