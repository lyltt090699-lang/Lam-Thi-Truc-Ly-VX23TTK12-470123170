namespace AppleStore.Application.Orders;

public sealed class DashboardDto
{
    public decimal Revenue { get; init; }

    public int OrderCount { get; init; }

    public int CustomerCount { get; init; }

    public int ProductCount { get; init; }

    public int NewThisMonth { get; init; }

    public decimal? RevenueChange { get; init; }

    public decimal? OrderChange { get; init; }

    public decimal? CustomerChange { get; init; }

    public IReadOnlyList<RevenuePointDto> RevenueByDay { get; init; } = [];

    public IReadOnlyList<RevenuePointDto> RevenueByMonth { get; init; } = [];

    public IReadOnlyList<DashboardOrderDto> RecentOrders { get; init; } = [];

    public IReadOnlyList<StatusCountDto> OrdersByStatus { get; init; } = [];

    public IReadOnlyList<DashboardBestsellerDto> Bestsellers { get; init; } = [];

    public IReadOnlyList<LowStockDto> LowStock { get; init; } = [];
}

public sealed class RevenuePointDto
{
    public string Date { get; init; } = string.Empty;

    public decimal Revenue { get; init; }
}

public sealed class StatusCountDto
{
    public string Status { get; init; } = string.Empty;

    public int Count { get; init; }
}

public sealed class DashboardBestsellerDto
{
    public string Name { get; init; } = string.Empty;

    public int SoldQuantity { get; init; }
}

public sealed class DashboardOrderDto
{
    public int Id { get; init; }

    public string Code { get; init; } = string.Empty;

    public string CustomerName { get; init; } = string.Empty;

    public decimal Total { get; init; }

    public string Status { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}

public sealed class LowStockDto
{
    public string ProductName { get; init; } = string.Empty;

    public string Sku { get; init; } = string.Empty;

    public string ColorName { get; init; } = string.Empty;

    public string Storage { get; init; } = string.Empty;

    public int StockQuantity { get; init; }
}
