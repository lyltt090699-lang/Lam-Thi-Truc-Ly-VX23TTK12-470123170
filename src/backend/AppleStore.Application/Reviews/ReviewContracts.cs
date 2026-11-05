namespace AppleStore.Application.Reviews;

public sealed class ReviewDto
{
    public int Id { get; init; }

    public string AuthorName { get; init; } = string.Empty;

    public int Rating { get; init; }

    public string Comment { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}

public sealed class ReviewSummaryDto
{
    public decimal AverageRating { get; init; }

    public int Count { get; init; }

    public bool CanReview { get; init; }

    public bool HasReviewed { get; init; }

    public IReadOnlyList<ReviewDto> Items { get; init; } = [];
}

public sealed class CreateReviewRequest
{
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;
}

public sealed class AdminReviewDto
{
    public int Id { get; init; }

    public string ProductName { get; init; } = string.Empty;

    public string AuthorName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public int Rating { get; init; }

    public string Comment { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}

public sealed class AdminReviewListDto
{
    public IReadOnlyList<AdminReviewDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }
}

public enum ReviewCreateStatus
{
    Created,
    MissingProduct,
    NotPurchased,
    AlreadyReviewed
}
