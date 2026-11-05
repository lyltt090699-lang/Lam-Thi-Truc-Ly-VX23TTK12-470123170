using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AppleStore.Infrastructure.Orders;

public static class VoucherSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("VoucherSeed");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.Vouchers.AnyAsync())
        {
            logger.LogInformation("Voucher seed already exists.");
            return;
        }

        db.Vouchers.Add(new Voucher
        {
            Code = "APPLE10",
            Description = "Giảm 10% cho đơn hàng.",
            DiscountPercent = 10,
            MinSubtotal = 0,
            IsActive = true
        });
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded demo voucher APPLE10.");
    }
}
