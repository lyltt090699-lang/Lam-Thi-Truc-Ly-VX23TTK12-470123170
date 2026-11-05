using AppleStore.Domain.Account;
using AppleStore.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppleStore.Infrastructure.Persistence;

public sealed class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.Property(address => address.RecipientName).HasMaxLength(100).IsRequired();
        builder.Property(address => address.Phone).HasMaxLength(20).IsRequired();
        builder.Property(address => address.AddressLine).HasMaxLength(300).IsRequired();
        builder.HasIndex(address => address.UserId);
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(address => address.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
