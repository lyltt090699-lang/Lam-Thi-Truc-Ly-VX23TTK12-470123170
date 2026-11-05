using System.Security.Claims;
using AppleStore.Application.Reviews;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Route("api/products/{slug}/reviews")]
public class ProductReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;
    private readonly IValidator<CreateReviewRequest> _validator;

    public ProductReviewsController(IReviewService reviews, IValidator<CreateReviewRequest> validator)
    {
        _reviews = reviews;
        _validator = validator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string slug, CancellationToken cancellationToken)
    {
        var summary = await _reviews.GetForProductAsync(slug, UserId(), cancellationToken);
        if (summary is null)
        {
            return NotFound(new { message = "Không tìm thấy sản phẩm." });
        }

        return Ok(summary);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(string slug, [FromBody] CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                message = validation.Errors[0].ErrorMessage,
                errors = validation.Errors
                    .GroupBy(error => char.ToLowerInvariant(error.PropertyName[0]) + error.PropertyName[1..])
                    .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())
            });
        }

        var (status, review) = await _reviews.CreateAsync(UserId() ?? string.Empty, slug, request, cancellationToken);
        return status switch
        {
            ReviewCreateStatus.MissingProduct => NotFound(new { message = "Không tìm thấy sản phẩm." }),
            ReviewCreateStatus.NotPurchased => StatusCode(403, new { message = "Chỉ được đánh giá sản phẩm từ đơn hàng đã hoàn thành." }),
            ReviewCreateStatus.AlreadyReviewed => Conflict(new { message = "Bạn đã đánh giá sản phẩm này." }),
            _ => Ok(review)
        };
    }

    private string? UserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
