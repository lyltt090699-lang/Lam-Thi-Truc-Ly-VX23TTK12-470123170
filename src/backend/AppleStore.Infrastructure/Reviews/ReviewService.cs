using AppleStore.Application.Reviews;
using AppleStore.Domain.Orders;
using AppleStore.Domain.Reviews;
using AppleStore.Infrastructure.Identity;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Reviews;

public sealed class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewSummaryDto?> GetForProductAsync(string slug, string? userId, CancellationToken cancellationToken)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(item => item.Slug == slug && item.IsActive, cancellationToken);
        if (product is null)
        {
            return null;
        }

        var reviews = await _db.Reviews.AsNoTracking()
            .Where(review => review.ProductId == product.Id)
            .OrderByDescending(review => review.CreatedAt)
            .ToListAsync(cancellationToken);
        var names = await AuthorNamesAsync(reviews.Select(review => review.UserId), cancellationToken);

        var hasReviewed = !string.IsNullOrWhiteSpace(userId) && reviews.Any(review => review.UserId == userId);
        var purchased = !string.IsNullOrWhiteSpace(userId) && await HasPurchasedAsync(userId, product.Id, cancellationToken);
        var count = reviews.Count;
        var average = count == 0 ? 0 : Math.Round((decimal)reviews.Average(review => review.Rating), 1);

        return new ReviewSummaryDto
        {
            AverageRating = average,
            Count = count,
            CanReview = purchased && !hasReviewed,
            HasReviewed = hasReviewed,
            Items = reviews.Select(review => Map(review, names.GetValueOrDefault(review.UserId) ?? string.Empty)).ToList()
        };
    }

    public async Task<(ReviewCreateStatus Status, ReviewDto? Review)> CreateAsync(string userId, string slug, CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(item => item.Slug == slug && item.IsActive, cancellationToken);
        if (product is null)
        {
            return (ReviewCreateStatus.MissingProduct, null);
        }

        if (await _db.Reviews.AnyAsync(review => review.UserId == userId && review.ProductId == product.Id, cancellationToken))
        {
            return (ReviewCreateStatus.AlreadyReviewed, null);
        }

        if (!await HasPurchasedAsync(userId, product.Id, cancellationToken))
        {
            return (ReviewCreateStatus.NotPurchased, null);
        }

        var review = new ProductReview
        {
            UserId = userId,
            ProductId = product.Id,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(cancellationToken);

        var author = await _db.Users.AsNoTracking().FirstAsync(user => user.Id == userId, cancellationToken);
        review.Product = product;
        return (ReviewCreateStatus.Created, Map(review, author.FullName));
    }

    public async Task<AdminReviewListDto> GetAdminReviewsAsync(string? query, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 24 ? 8 : pageSize;
        var reviews = QueryReviews();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            reviews = reviews.Where(review =>
                review.Product.Name.Contains(term) ||
                review.Comment.Contains(term) ||
                _db.Users.Any(user => user.Id == review.UserId && (user.FullName.Contains(term) || (user.Email != null && user.Email.Contains(term)))));
        }

        var total = await reviews.CountAsync(cancellationToken);
        var pageItems = await reviews
            .OrderByDescending(review => review.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        var userIds = pageItems.Select(review => review.UserId).Distinct().ToArray();
        var users = await _db.Users.AsNoTracking().Where(user => userIds.Contains(user.Id)).ToListAsync(cancellationToken);

        return new AdminReviewListDto
        {
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            Items = pageItems.Select(review =>
            {
                var user = users.FirstOrDefault(item => item.Id == review.UserId);
                return new AdminReviewDto
                {
                    Id = review.Id,
                    ProductName = review.Product.Name,
                    AuthorName = user?.FullName ?? string.Empty,
                    Email = user?.Email ?? string.Empty,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };
            }).ToList()
        };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (review is null)
        {
            return false;
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private IQueryable<ProductReview> QueryReviews()
    {
        return _db.Reviews.AsNoTracking().Include(review => review.Product);
    }

    private Task<bool> HasPurchasedAsync(string userId, int productId, CancellationToken cancellationToken)
    {
        return _db.OrderItems.AnyAsync(
            item => item.Order.UserId == userId &&
                    item.Order.Status == OrderStatuses.Completed &&
                    item.ProductVariant.ProductId == productId,
            cancellationToken);
    }

    private static ReviewDto Map(ProductReview review, string authorName)
    {
        return new ReviewDto
        {
            Id = review.Id,
            AuthorName = authorName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    private async Task<Dictionary<string, string>> AuthorNamesAsync(IEnumerable<string> userIds, CancellationToken cancellationToken)
    {
        var ids = userIds.Distinct().ToArray();
        var users = await _db.Users.AsNoTracking().Where(user => ids.Contains(user.Id)).ToListAsync(cancellationToken);
        return users.ToDictionary(user => user.Id, user => user.FullName);
    }
}
