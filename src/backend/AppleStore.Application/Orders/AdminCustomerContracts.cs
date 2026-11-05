namespace AppleStore.Application.Orders;

public sealed class AdminCustomerDto
{
    public string Id { get; init; } = string.Empty;

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string? PhoneNumber { get; init; }

    public DateTime CreatedAt { get; init; }
}

public sealed class AdminCustomerListResult
{
    public IReadOnlyList<AdminCustomerDto> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }
}

public sealed class VoucherWriteRequest
{
    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DiscountPercent { get; set; }

    public decimal MinSubtotal { get; set; }

    public bool IsActive { get; set; } = true;
}

public sealed class VoucherDto
{
    public int Id { get; init; }

    public string Code { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public int DiscountPercent { get; init; }

    public decimal MinSubtotal { get; init; }

    public bool IsActive { get; init; }
}

public interface IAdminCustomerService
{
    Task<AdminCustomerListResult> ListAsync(string? query, int page, int pageSize, CancellationToken cancellationToken);
}

public interface IAdminVoucherService
{
    Task<IReadOnlyList<VoucherDto>> ListAsync(CancellationToken cancellationToken);

    Task<VoucherDto?> CreateAsync(VoucherWriteRequest request, CancellationToken cancellationToken);

    Task<VoucherDto?> UpdateAsync(int id, VoucherWriteRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
