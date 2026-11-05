using FluentValidation;

namespace AppleStore.Application.Reviews;

public sealed class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(request => request.Rating)
            .InclusiveBetween(1, 5).WithMessage("Chọn điểm từ 1 đến 5.");

        RuleFor(request => request.Comment)
            .NotEmpty().WithMessage("Nhập nhận xét.")
            .MaximumLength(1000).WithMessage("Nhận xét tối đa 1000 ký tự.");
    }
}
