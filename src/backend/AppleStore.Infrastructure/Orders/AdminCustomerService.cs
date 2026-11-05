using AppleStore.Application.Auth;
using AppleStore.Application.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Orders;

public sealed class AdminCustomerService : IAdminCustomerService
{
    private readonly AppDbContext _db;

    public AdminCustomerService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminCustomerListResult> ListAsync(string? query, int page, int pageSize, CancellationToken cancellationToken)
    {
        var currentPage = page < 1 ? 1 : page;
        var currentSize = pageSize < 1 ? 8 : Math.Min(pageSize, 24);
        var customers = from user in _db.Users.AsNoTracking()
                        join userRole in _db.UserRoles on user.Id equals userRole.UserId
                        join role in _db.Roles on userRole.RoleId equals role.Id
                        where role.Name == AppRoles.Customer
                        select user;

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            customers = customers.Where(user => user.FullName.Contains(term) || (user.Email != null && user.Email.Contains(term)));
        }

        var ordered = customers.OrderByDescending(user => user.CreatedAt).Select(user => new AdminCustomerDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        });

        var total = await ordered.CountAsync(cancellationToken);
        var items = await ordered.Skip((currentPage - 1) * currentSize).Take(currentSize).ToListAsync(cancellationToken);
        return new AdminCustomerListResult
        {
            Items = items,
            TotalCount = total,
            Page = currentPage,
            PageSize = currentSize
        };
    }
}
