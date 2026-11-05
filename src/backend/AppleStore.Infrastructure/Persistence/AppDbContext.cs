using AppleStore.Domain.Account;
using AppleStore.Domain.Cart;
using AppleStore.Domain.Catalog;
using AppleStore.Domain.Contact;
using AppleStore.Domain.Content;
using AppleStore.Domain.Orders;
using AppleStore.Domain.Reviews;
using AppleStore.Domain.Wishlist;
using AppleStore.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<ProductImage> ProductImages => Set<ProductImage>();

    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();

    public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<Voucher> Vouchers => Set<Voucher>();

    public DbSet<CustomerAddress> Addresses => Set<CustomerAddress>();

    public DbSet<ProductReview> Reviews => Set<ProductReview>();

    public DbSet<ContentPage> ContentPages => Set<ContentPage>();

    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
