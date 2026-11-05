namespace AppleStore.Domain.Orders;

public class Voucher
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DiscountPercent { get; set; }

    public decimal MinSubtotal { get; set; }

    public bool IsActive { get; set; } = true;
}
