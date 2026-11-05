using AppleStore.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppleStore.Infrastructure.Persistence;

public sealed class ContentPageConfiguration : IEntityTypeConfiguration<ContentPage>
{
    public void Configure(EntityTypeBuilder<ContentPage> builder)
    {
        builder.Property(page => page.Slug).HasMaxLength(80).IsRequired();
        builder.Property(page => page.Title).HasMaxLength(160).IsRequired();
        builder.Property(page => page.Body).HasMaxLength(4000).IsRequired();
        builder.HasIndex(page => page.Slug).IsUnique();
    }
}
