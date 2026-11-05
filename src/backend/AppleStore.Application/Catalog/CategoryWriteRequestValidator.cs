using FluentValidation;

namespace AppleStore.Application.Catalog;

public sealed class CategoryWriteRequestValidator : AbstractValidator<CategoryWriteRequest>
{
    public CategoryWriteRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().WithMessage("Nhập tên danh mục.").MaximumLength(100);
        RuleFor(request => request.Description).NotEmpty().WithMessage("Nhập mô tả.").MaximumLength(500);
        RuleFor(request => request.ImageUrl).NotEmpty().WithMessage("Nhập đường dẫn ảnh.").MaximumLength(300);
        RuleFor(request => request.DisplayOrder).GreaterThanOrEqualTo(0).WithMessage("Thứ tự không được âm.");
        RuleFor(request => request.Slug).MaximumLength(150).When(request => !string.IsNullOrWhiteSpace(request.Slug));
    }
}
