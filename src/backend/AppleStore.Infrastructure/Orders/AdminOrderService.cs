using AppleStore.Application.Orders;
using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Orders;

public sealed class AdminOrderService : IAdminOrderService
{
    private readonly AppDbContext _db;

    public AdminOrderService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminOrderListResult> ListAsync(string? query, string? status, int page, int pageSize, CancellationToken cancellationToken)
    {
        var currentPage = page < 1 ? 1 : page;
        var currentSize = pageSize < 1 ? 8 : Math.Min(pageSize, 24);
        var orders = _db.Orders.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            orders = orders.Where(order =>
                order.Code.Contains(term) ||
                order.RecipientName.Contains(term) ||
                order.Phone.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            orders = orders.Where(order => order.Status == status);
        }

        var joined = from order in orders
                     join user in _db.Users on order.UserId equals user.Id
                     orderby order.CreatedAt descending
                     select new AdminOrderListItemDto
                     {
                         Id = order.Id,
                         Code = order.Code,
                         Status = order.Status,
                         CustomerEmail = user.Email ?? string.Empty,
                         RecipientName = order.RecipientName,
                         Phone = order.Phone,
                         Total = order.Total,
                         CreatedAt = order.CreatedAt
                     };

        var total = await joined.CountAsync(cancellationToken);
        var items = await joined.Skip((currentPage - 1) * currentSize).Take(currentSize).ToListAsync(cancellationToken);
        return new AdminOrderListResult
        {
            Items = items,
            TotalCount = total,
            Page = currentPage,
            PageSize = currentSize
        };
    }

    public async Task<AdminOrderDetailDto?> GetAsync(int id, CancellationToken cancellationToken)
    {
        var order = await _db.Orders.AsNoTracking().Include(item => item.Items).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (order is null)
        {
            return null;
        }

        var email = await _db.Users.Where(user => user.Id == order.UserId).Select(user => user.Email).FirstOrDefaultAsync(cancellationToken);
        return Map(order, email ?? string.Empty);
    }

    public async Task<AdminOrderStatusOutcome> ChangeStatusAsync(int id, string status, CancellationToken cancellationToken)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        var order = await _db.Orders.Include(item => item.Items).ThenInclude(item => item.ProductVariant).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (order is null)
        {
            return new AdminOrderStatusOutcome { StatusCode = 404, Message = "Không tìm thấy đơn hàng." };
        }

        if (order.Status == OrderStatuses.Cancelled && status != OrderStatuses.Cancelled)
        {
            return new AdminOrderStatusOutcome { StatusCode = 409, Message = "Đơn đã hủy, không đổi được trạng thái." };
        }

        if (order.Status != OrderStatuses.Cancelled && status == OrderStatuses.Cancelled)
        {
            foreach (var item in order.Items)
            {
                item.ProductVariant.StockQuantity += item.Quantity;
            }
        }

        order.Status = status;
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        var email = await _db.Users.Where(user => user.Id == order.UserId).Select(user => user.Email).FirstOrDefaultAsync(cancellationToken);
        return new AdminOrderStatusOutcome
        {
            StatusCode = 200,
            Message = "Đã cập nhật trạng thái.",
            Order = Map(order, email ?? string.Empty)
        };
    }

    private static AdminOrderDetailDto Map(Order order, string email)
    {
        return new AdminOrderDetailDto
        {
            Id = order.Id,
            Code = order.Code,
            Status = order.Status,
            CustomerEmail = email,
            RecipientName = order.RecipientName,
            Phone = order.Phone,
            AddressLine = order.AddressLine,
            Note = order.Note,
            VoucherCode = order.VoucherCode,
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            Discount = order.Discount,
            Total = order.Total,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(item => new CheckoutLineDto
            {
                VariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                Sku = item.Sku,
                ColorName = item.ColorName,
                Storage = item.Storage,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity,
                LineTotal = item.UnitPrice * item.Quantity
            }).ToList()
        };
    }
}
