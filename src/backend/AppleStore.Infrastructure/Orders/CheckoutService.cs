using AppleStore.Application.Orders;
using AppleStore.Domain.Catalog;
using AppleStore.Domain.Orders;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Orders;

public sealed class CheckoutService : ICheckoutService
{
    public const decimal ShippingFee = 30000;

    private readonly AppDbContext _db;

    public CheckoutService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CheckoutQuoteDto> QuoteAsync(string userId, string? voucherCode, CancellationToken cancellationToken)
    {
        var lines = await LoadLinesAsync(userId, cancellationToken);
        return await BuildQuoteAsync(lines, voucherCode, cancellationToken);
    }

    public async Task<PlaceOrderOutcome> PlaceAsync(string userId, PlaceOrderRequest request, CancellationToken cancellationToken)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        var cartItems = await _db.CartItems
            .Include(item => item.ProductVariant)
            .ThenInclude(variant => variant.Product)
            .Where(item => item.UserId == userId)
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);

        var lines = cartItems
            .Where(item => item.ProductVariant.IsActive && item.ProductVariant.Product.IsActive)
            .Select(item => (item, item.ProductVariant))
            .ToList();
        if (lines.Count == 0)
        {
            return Fail(400, "Giỏ hàng đang trống.");
        }

        if (lines.Any(line => line.item.Quantity > line.ProductVariant.StockQuantity || line.item.Quantity <= 0))
        {
            return Fail(409, "Một sản phẩm trong giỏ không còn đủ hàng.");
        }

        var quote = await BuildQuoteAsync(lines.Select(line => ToLine(line.ProductVariant, line.item.Quantity)).ToList(), request.VoucherCode, cancellationToken);
        if (!string.IsNullOrWhiteSpace(request.VoucherCode) && !quote.VoucherApplied)
        {
            return Fail(400, quote.VoucherMessage ?? "Mã giảm giá không hợp lệ.");
        }

        foreach (var line in lines)
        {
            line.ProductVariant.StockQuantity -= line.item.Quantity;
        }

        var order = new Order
        {
            Code = await NextCodeAsync(cancellationToken),
            UserId = userId,
            Status = OrderStatuses.Pending,
            RecipientName = request.RecipientName.Trim(),
            Phone = request.Phone.Trim(),
            AddressLine = request.AddressLine.Trim(),
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            VoucherCode = quote.VoucherApplied ? quote.VoucherCode : null,
            Subtotal = quote.Subtotal,
            ShippingFee = quote.ShippingFee,
            Discount = quote.Discount,
            Total = quote.Total,
            CreatedAt = DateTime.UtcNow,
            Items = lines.Select(line => new OrderItem
            {
                ProductVariantId = line.ProductVariant.Id,
                ProductName = line.ProductVariant.Product.Name,
                Sku = line.ProductVariant.Sku,
                ColorName = line.ProductVariant.ColorName,
                Storage = line.ProductVariant.Storage,
                UnitPrice = line.ProductVariant.Price,
                Quantity = line.item.Quantity
            }).ToList()
        };

        _db.Orders.Add(order);
        _db.CartItems.RemoveRange(cartItems);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new PlaceOrderOutcome
        {
            StatusCode = 200,
            Message = "Đặt hàng thành công.",
            Order = MapOrder(order)
        };
    }

    public async Task<IReadOnlyList<OrderListItemDto>> ListAsync(string userId, CancellationToken cancellationToken)
    {
        return await _db.Orders
            .AsNoTracking()
            .Where(order => order.UserId == userId)
            .OrderByDescending(order => order.CreatedAt)
            .Select(order => new OrderListItemDto
            {
                Code = order.Code,
                Status = order.Status,
                Total = order.Total,
                CreatedAt = order.CreatedAt,
                ItemCount = order.Items.Count,
                Items = order.Items.Select(item => new OrderListLineDto
                {
                    ProductName = item.ProductName,
                    ProductSlug = item.ProductVariant.Product.Slug,
                    ColorName = item.ColorName,
                    Storage = item.Storage,
                    LineTotal = item.UnitPrice * item.Quantity
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderDto?> GetAsync(string userId, string code, CancellationToken cancellationToken)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Include(item => item.Items)
            .ThenInclude(item => item.ProductVariant)
            .ThenInclude(variant => variant.Product)
            .FirstOrDefaultAsync(item => item.UserId == userId && item.Code == code, cancellationToken);
        return order is null ? null : MapOrder(order);
    }

    public async Task<PlaceOrderOutcome> CancelAsync(string userId, string code, CancellationToken cancellationToken)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        var order = await _db.Orders
            .Include(item => item.Items)
            .ThenInclude(item => item.ProductVariant)
            .FirstOrDefaultAsync(item => item.UserId == userId && item.Code == code, cancellationToken);
        if (order is null)
        {
            return Fail(404, "Không tìm thấy đơn hàng.");
        }

        if (order.Status is not (OrderStatuses.Pending or OrderStatuses.Confirmed or OrderStatuses.Processing))
        {
            return Fail(409, "Đơn này không hủy được nữa.");
        }

        foreach (var item in order.Items)
        {
            item.ProductVariant.StockQuantity += item.Quantity;
        }

        order.Status = OrderStatuses.Cancelled;
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new PlaceOrderOutcome
        {
            StatusCode = 200,
            Message = "Order cancelled.",
            Order = MapOrder(order)
        };
    }

    public async Task<OrderDto?> LookupAsync(string code, string phone, CancellationToken cancellationToken)
    {
        var normalizedCode = code.Trim();
        var normalizedPhone = phone.Trim();
        var order = await _db.Orders
            .AsNoTracking()
            .Include(item => item.Items)
            .ThenInclude(item => item.ProductVariant)
            .ThenInclude(variant => variant.Product)
            .FirstOrDefaultAsync(item => item.Code == normalizedCode && item.Phone == normalizedPhone, cancellationToken);
        return order is null ? null : MapOrder(order);
    }

    private async Task<List<CheckoutLineDto>> LoadLinesAsync(string userId, CancellationToken cancellationToken)
    {
        var items = await _db.CartItems
            .AsNoTracking()
            .Include(item => item.ProductVariant)
            .ThenInclude(variant => variant.Product)
            .Where(item => item.UserId == userId && item.ProductVariant.IsActive && item.ProductVariant.Product.IsActive)
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);
        return items.Select(item => ToLine(item.ProductVariant, item.Quantity)).ToList();
    }

    private async Task<CheckoutQuoteDto> BuildQuoteAsync(IReadOnlyList<CheckoutLineDto> lines, string? voucherCode, CancellationToken cancellationToken)
    {
        var subtotal = lines.Sum(line => line.LineTotal);
        var shipping = lines.Count == 0 ? 0 : ShippingFee;
        var code = string.IsNullOrWhiteSpace(voucherCode) ? null : voucherCode.Trim();
        decimal discount = 0;
        string? message = null;
        var applied = false;

        if (code is not null)
        {
            var normalized = code.ToUpperInvariant();
            var voucher = await _db.Vouchers.AsNoTracking().FirstOrDefaultAsync(
                item => item.Code.ToUpper() == normalized && item.IsActive,
                cancellationToken);
            if (voucher is null)
            {
                message = "Mã giảm giá không hợp lệ.";
            }
            else if (subtotal < voucher.MinSubtotal)
            {
                message = "Đơn chưa đủ điều kiện dùng mã giảm giá.";
            }
            else
            {
                discount = decimal.Round(subtotal * voucher.DiscountPercent / 100m, 0, MidpointRounding.AwayFromZero);
                if (discount > subtotal)
                {
                    discount = subtotal;
                }

                applied = discount > 0;
                code = voucher.Code;
                message = voucher.Description;
            }
        }

        return new CheckoutQuoteDto
        {
            Items = lines,
            Subtotal = subtotal,
            ShippingFee = shipping,
            Discount = discount,
            Total = subtotal + shipping - discount,
            VoucherCode = applied ? code : code,
            VoucherMessage = message,
            VoucherApplied = applied
        };
    }

    private async Task<string> NextCodeAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var code = $"DH{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(1000, 10000)}";
            var exists = await _db.Orders.AnyAsync(order => order.Code == code, cancellationToken);
            if (!exists)
            {
                return code;
            }
        }

        return $"DH{DateTime.UtcNow:yyyyMMddHHmmss}";
    }

    private static CheckoutLineDto ToLine(ProductVariant variant, int quantity)
    {
        return new CheckoutLineDto
        {
            VariantId = variant.Id,
            ProductName = variant.Product.Name,
            ProductSlug = variant.Product.Slug,
            Sku = variant.Sku,
            ColorName = variant.ColorName,
            Storage = variant.Storage,
            UnitPrice = variant.Price,
            Quantity = quantity,
            LineTotal = variant.Price * quantity
        };
    }

    private static OrderDto MapOrder(Order order)
    {
        return new OrderDto
        {
            Code = order.Code,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            RecipientName = order.RecipientName,
            Phone = order.Phone,
            AddressLine = order.AddressLine,
            Note = order.Note,
            VoucherCode = order.VoucherCode,
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            Discount = order.Discount,
            Total = order.Total,
            Items = order.Items.Select(item => new CheckoutLineDto
            {
                VariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                ProductSlug = item.ProductVariant?.Product?.Slug ?? string.Empty,
                Sku = item.Sku,
                ColorName = item.ColorName,
                Storage = item.Storage,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity,
                LineTotal = item.UnitPrice * item.Quantity
            }).ToList()
        };
    }

    private static PlaceOrderOutcome Fail(int statusCode, string message)
    {
        return new PlaceOrderOutcome
        {
            StatusCode = statusCode,
            Message = message
        };
    }
}
