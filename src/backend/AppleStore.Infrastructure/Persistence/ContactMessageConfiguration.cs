using AppleStore.Domain.Contact;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppleStore.Infrastructure.Persistence;

public sealed class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.Property(message => message.FullName).HasMaxLength(100).IsRequired();
        builder.Property(message => message.Email).HasMaxLength(256).IsRequired();
        builder.Property(message => message.Phone).HasMaxLength(20);
        builder.Property(message => message.Message).HasMaxLength(2000).IsRequired();
    }
}
