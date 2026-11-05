using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppleStore.Infrastructure.Persistence;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(order => order.Code).HasMaxLength(20);
        builder.HasIndex(order => order.Code).IsUnique();
        builder.Property(order => order.Status).HasMaxLength(50);
        builder.Property(order => order.RecipientName).HasMaxLength(100);
        builder.Property(order => order.Phone).HasMaxLength(20);
        builder.Property(order => order.AddressLine).HasMaxLength(300);
        builder.Property(order => order.Note).HasMaxLength(500);
        builder.Property(order => order.VoucherCode).HasMaxLength(50);
        builder.Property(order => order.Subtotal).HasPrecision(18, 0);
        builder.Property(order => order.ShippingFee).HasPrecision(18, 0);
        builder.Property(order => order.Discount).HasPrecision(18, 0);
        builder.Property(order => order.Total).HasPrecision(18, 0);
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(order => order.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(order => order.Items)
            .WithOne(item => item.Order)
            .HasForeignKey(item => item.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Property(item => item.ProductName).HasMaxLength(200);
        builder.Property(item => item.Sku).HasMaxLength(50);
        builder.Property(item => item.ColorName).HasMaxLength(80);
        builder.Property(item => item.Storage).HasMaxLength(80);
        builder.Property(item => item.UnitPrice).HasPrecision(18, 0);
        builder.HasOne(item => item.ProductVariant)
            .WithMany()
            .HasForeignKey(item => item.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
{
    public void Configure(EntityTypeBuilder<Voucher> builder)
    {
        builder.Property(voucher => voucher.Code).HasMaxLength(50);
        builder.HasIndex(voucher => voucher.Code).IsUnique();
        builder.Property(voucher => voucher.Description).HasMaxLength(200);
        builder.Property(voucher => voucher.MinSubtotal).HasPrecision(18, 0);
    }
}
