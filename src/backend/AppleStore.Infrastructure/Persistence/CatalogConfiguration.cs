using AppleStore.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppleStore.Infrastructure.Persistence;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.Property(category => category.Name).HasMaxLength(100).IsRequired();
        builder.Property(category => category.Slug).HasMaxLength(150).IsRequired();
        builder.Property(category => category.Description).HasMaxLength(500).IsRequired();
        builder.Property(category => category.ImageUrl).HasMaxLength(300).IsRequired();
        builder.HasIndex(category => category.Slug).IsUnique();
    }
}

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(product => product.Name).HasMaxLength(200).IsRequired();
        builder.Property(product => product.Slug).HasMaxLength(150).IsRequired();
        builder.Property(product => product.ShortDescription).HasMaxLength(300).IsRequired();
        builder.Property(product => product.Description).IsRequired();
        builder.HasIndex(product => product.Slug).IsUnique();
        builder.HasOne(product => product.Category)
            .WithMany(category => category.Products)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.Property(image => image.ImageUrl).HasMaxLength(300).IsRequired();
        builder.Property(image => image.AltText).HasMaxLength(200).IsRequired();
        builder.HasOne(image => image.Product)
            .WithMany(product => product.Images)
            .HasForeignKey(image => image.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.Property(variant => variant.Sku).HasMaxLength(50).IsRequired();
        builder.Property(variant => variant.ColorName).HasMaxLength(50).IsRequired();
        builder.Property(variant => variant.ColorHex).HasMaxLength(7).IsRequired();
        builder.Property(variant => variant.Storage).HasMaxLength(50).IsRequired();
        builder.Property(variant => variant.Price).HasPrecision(18, 0);
        builder.HasIndex(variant => variant.Sku).IsUnique();
        builder.HasIndex(variant => new { variant.ProductId, variant.ColorName, variant.Storage }).IsUnique();
        builder.HasOne(variant => variant.Product)
            .WithMany(product => product.Variants)
            .HasForeignKey(variant => variant.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
