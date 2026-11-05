using FluentValidation;

namespace AppleStore.Application.Content;

public sealed class ContentUpdateRequestValidator : AbstractValidator<ContentUpdateRequest>
{
    public ContentUpdateRequestValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty().WithMessage("Nhập tiêu đề.")
            .MaximumLength(160).WithMessage("Tiêu đề tối đa 160 ký tự.");

        RuleFor(request => request.Body)
            .NotEmpty().WithMessage("Nhập nội dung.")
            .MaximumLength(4000).WithMessage("Nội dung tối đa 4000 ký tự.");
    }
}
