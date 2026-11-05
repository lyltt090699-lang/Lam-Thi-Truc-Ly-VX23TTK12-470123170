using AppleStore.Application.Orders;
using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Orders;

public sealed class AdminVoucherService : IAdminVoucherService
{
    private readonly AppDbContext _db;

    public AdminVoucherService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<VoucherDto>> ListAsync(CancellationToken cancellationToken)
    {
        var vouchers = await _db.Vouchers.AsNoTracking().OrderBy(voucher => voucher.Code).ToListAsync(cancellationToken);
        return vouchers.Select(Map).ToList();
    }

    public async Task<VoucherDto?> CreateAsync(VoucherWriteRequest request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await _db.Vouchers.AnyAsync(voucher => voucher.Code == code, cancellationToken))
        {
            return null;
        }

        var voucher = new Voucher
        {
            Code = code,
            Description = request.Description.Trim(),
            DiscountPercent = request.DiscountPercent,
            MinSubtotal = request.MinSubtotal,
            IsActive = request.IsActive
        };
        _db.Vouchers.Add(voucher);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(voucher);
    }

    public async Task<VoucherDto?> UpdateAsync(int id, VoucherWriteRequest request, CancellationToken cancellationToken)
    {
        var voucher = await _db.Vouchers.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (voucher is null)
        {
            return null;
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var duplicated = await _db.Vouchers.AnyAsync(item => item.Id != id && item.Code == code, cancellationToken);
        if (duplicated)
        {
            return null;
        }

        voucher.Code = code;
        voucher.Description = request.Description.Trim();
        voucher.DiscountPercent = request.DiscountPercent;
        voucher.MinSubtotal = request.MinSubtotal;
        voucher.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return Map(voucher);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var voucher = await _db.Vouchers.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (voucher is null)
        {
            return false;
        }

        _db.Vouchers.Remove(voucher);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static VoucherDto Map(Voucher voucher)
    {
        return new VoucherDto
        {
            Id = voucher.Id,
            Code = voucher.Code,
            Description = voucher.Description,
            DiscountPercent = voucher.DiscountPercent,
            MinSubtotal = voucher.MinSubtotal,
            IsActive = voucher.IsActive
        };
    }
}
