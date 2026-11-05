using FluentValidation;

namespace AppleStore.Application.Catalog;

public sealed class ProductWriteRequestValidator : AbstractValidator<ProductWriteRequest>
{
    public ProductWriteRequestValidator()
    {
        RuleFor(request => request.CategoryId).GreaterThan(0).WithMessage("Chọn danh mục.");
        RuleFor(request => request.Name).NotEmpty().WithMessage("Nhập tên sản phẩm.").MaximumLength(200);
        RuleFor(request => request.ShortDescription).NotEmpty().WithMessage("Nhập mô tả ngắn.").MaximumLength(300);
        RuleFor(request => request.Description).NotEmpty().WithMessage("Nhập mô tả.");
        RuleFor(request => request.Images).NotEmpty().WithMessage("Thêm ít nhất một ảnh.");
        RuleFor(request => request.Variants).NotEmpty().WithMessage("Thêm ít nhất một biến thể.");
        RuleForEach(request => request.Images).ChildRules(image =>
        {
            image.RuleFor(item => item.ImageUrl).NotEmpty().MaximumLength(300);
            image.RuleFor(item => item.AltText).NotEmpty().MaximumLength(200);
        });
        RuleForEach(request => request.Variants).ChildRules(variant =>
        {
            variant.RuleFor(item => item.Sku).NotEmpty().MaximumLength(50);
            variant.RuleFor(item => item.ColorName).NotEmpty().MaximumLength(50);
            variant.RuleFor(item => item.ColorHex).NotEmpty().MaximumLength(7);
            variant.RuleFor(item => item.Storage).NotEmpty().MaximumLength(50);
            variant.RuleFor(item => item.Price).GreaterThan(0);
            variant.RuleFor(item => item.StockQuantity).GreaterThanOrEqualTo(0);
        });
    }
}
