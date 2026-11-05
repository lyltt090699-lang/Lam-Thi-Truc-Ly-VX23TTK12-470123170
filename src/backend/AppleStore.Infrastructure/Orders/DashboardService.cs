using AppleStore.Application.Auth;
using AppleStore.Application.Orders;
using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Identity;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Orders;

public sealed class DashboardService : IDashboardService
{
    private const int LowStockLimit = 5;

    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardDto> GetAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonth = monthStart.AddMonths(1);
        var previousStart = monthStart.AddMonths(-1);
        var paidOrders = _db.Orders.AsNoTracking().Where(order => order.Status != OrderStatuses.Cancelled);
        var revenue = await paidOrders.SumAsync(order => (decimal?)order.Total, cancellationToken) ?? 0;
        var orderCount = await _db.Orders.CountAsync(cancellationToken);
        var customers = Customers();
        var customerCount = await customers.CountAsync(cancellationToken);
        var productCount = await _db.Products.CountAsync(product => product.IsActive, cancellationToken);
        var revenueThisMonth = await paidOrders.Where(order => order.CreatedAt >= monthStart && order.CreatedAt < nextMonth).SumAsync(order => (decimal?)order.Total, cancellationToken) ?? 0;
        var revenueLastMonth = await paidOrders.Where(order => order.CreatedAt >= previousStart && order.CreatedAt < monthStart).SumAsync(order => (decimal?)order.Total, cancellationToken) ?? 0;
        var ordersThisMonth = await _db.Orders.CountAsync(order => order.CreatedAt >= monthStart && order.CreatedAt < nextMonth, cancellationToken);
        var ordersLastMonth = await _db.Orders.CountAsync(order => order.CreatedAt >= previousStart && order.CreatedAt < monthStart, cancellationToken);
        var customersThisMonth = await customers.CountAsync(user => user.CreatedAt >= monthStart && user.CreatedAt < nextMonth, cancellationToken);
        var customersLastMonth = await customers.CountAsync(user => user.CreatedAt >= previousStart && user.CreatedAt < monthStart, cancellationToken);
        var statusCounts = await _db.Orders
            .AsNoTracking()
            .GroupBy(order => order.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);

        return new DashboardDto
        {
            Revenue = revenue,
            OrderCount = orderCount,
            CustomerCount = customerCount,
            ProductCount = productCount,
            NewThisMonth = customersThisMonth,
            RevenueChange = Change(revenueThisMonth, revenueLastMonth),
            OrderChange = Change(ordersThisMonth, ordersLastMonth),
            CustomerChange = Change(customersThisMonth, customersLastMonth),
            RevenueByDay = await RevenueByDayAsync(cancellationToken),
            RevenueByMonth = await RevenueByMonthAsync(cancellationToken),
            RecentOrders = await RecentOrdersAsync(cancellationToken),
            OrdersByStatus = OrderStatuses.All.Select(status => new StatusCountDto
            {
                Status = status,
                Count = statusCounts.FirstOrDefault(item => item.Status == status)?.Count ?? 0
            }).ToList(),
            Bestsellers = await BestsellersAsync(cancellationToken),
            LowStock = await LowStockAsync(cancellationToken)
        };
    }

    private async Task<IReadOnlyList<RevenuePointDto>> RevenueByDayAsync(CancellationToken cancellationToken)
    {
        var start = DateTime.UtcNow.Date.AddDays(-13);
        var rows = await _db.Orders
            .AsNoTracking()
            .Where(order => order.Status != OrderStatuses.Cancelled && order.CreatedAt >= start)
            .Select(order => new { order.CreatedAt, order.Total })
            .ToListAsync(cancellationToken);
        var byDay = rows
            .GroupBy(order => order.CreatedAt.Date)
            .ToDictionary(group => group.Key, group => group.Sum(order => order.Total));

        return Enumerable.Range(0, 14).Select(offset =>
        {
            var day = start.AddDays(offset);
            return new RevenuePointDto
            {
                Date = day.ToString("yyyy-MM-dd"),
                Revenue = byDay.GetValueOrDefault(day)
            };
        }).ToList();
    }

    private async Task<IReadOnlyList<RevenuePointDto>> RevenueByMonthAsync(CancellationToken cancellationToken)
    {
        var yearStart = new DateTime(DateTime.UtcNow.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var rows = await _db.Orders
            .AsNoTracking()
            .Where(order => order.Status != OrderStatuses.Cancelled && order.CreatedAt >= yearStart)
            .Select(order => new { order.CreatedAt, order.Total })
            .ToListAsync(cancellationToken);
        var byMonth = rows
            .GroupBy(order => order.CreatedAt.Month)
            .ToDictionary(group => group.Key, group => group.Sum(order => order.Total));

        return Enumerable.Range(1, 12).Select(month => new RevenuePointDto
        {
            Date = $"{yearStart.Year}-{month:00}",
            Revenue = byMonth.GetValueOrDefault(month)
        }).ToList();
    }

    private async Task<IReadOnlyList<DashboardOrderDto>> RecentOrdersAsync(CancellationToken cancellationToken)
    {
        return await _db.Orders
            .AsNoTracking()
            .OrderByDescending(order => order.CreatedAt)
            .Take(5)
            .Select(order => new DashboardOrderDto
            {
                Id = order.Id,
                Code = order.Code,
                CustomerName = order.RecipientName,
                Total = order.Total,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private IQueryable<ApplicationUser> Customers()
    {
        return from user in _db.Users.AsNoTracking()
               join userRole in _db.UserRoles on user.Id equals userRole.UserId
               join role in _db.Roles on userRole.RoleId equals role.Id
               where role.Name == AppRoles.Customer
               select user;
    }

    private static decimal? Change(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return null;
        }

        return Math.Round((current - previous) / previous * 100, 1);
    }

    private async Task<IReadOnlyList<DashboardBestsellerDto>> BestsellersAsync(CancellationToken cancellationToken)
    {
        var rows = await _db.OrderItems
            .AsNoTracking()
            .Where(item => item.Order.Status != OrderStatuses.Cancelled && item.ProductVariant.Product.IsActive)
            .GroupBy(item => new { item.ProductVariant.ProductId, item.ProductVariant.Product.Name })
            .Select(group => new DashboardBestsellerDto
            {
                Name = group.Key.Name,
                SoldQuantity = group.Sum(item => item.Quantity)
            })
            .OrderByDescending(item => item.SoldQuantity)
            .ThenBy(item => item.Name)
            .Take(5)
            .ToListAsync(cancellationToken);

        return rows;
    }

    private async Task<IReadOnlyList<LowStockDto>> LowStockAsync(CancellationToken cancellationToken)
    {
        return await _db.ProductVariants
            .AsNoTracking()
            .Where(variant => variant.IsActive && variant.Product.IsActive && variant.StockQuantity <= LowStockLimit)
            .OrderBy(variant => variant.StockQuantity)
            .ThenBy(variant => variant.Sku)
            .Take(8)
            .Select(variant => new LowStockDto
            {
                ProductName = variant.Product.Name,
                Sku = variant.Sku,
                ColorName = variant.ColorName,
                Storage = variant.Storage,
                StockQuantity = variant.StockQuantity
            })
            .ToListAsync(cancellationToken);
    }
}
