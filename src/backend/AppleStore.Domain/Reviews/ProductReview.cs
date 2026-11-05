using AppleStore.Domain.Catalog;

namespace AppleStore.Domain.Reviews;

public class ProductReview
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
