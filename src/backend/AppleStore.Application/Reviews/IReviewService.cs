namespace AppleStore.Application.Reviews;

public interface IReviewService
{
    Task<ReviewSummaryDto?> GetForProductAsync(string slug, string? userId, CancellationToken cancellationToken);

    Task<(ReviewCreateStatus Status, ReviewDto? Review)> CreateAsync(string userId, string slug, CreateReviewRequest request, CancellationToken cancellationToken);

    Task<AdminReviewListDto> GetAdminReviewsAsync(string? query, int page, int pageSize, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
