namespace AppleStore.Domain.Orders;

public static class OrderStatuses
{
    public const string Pending = "Chờ xác nhận";
    public const string Confirmed = "Đã xác nhận";
    public const string Processing = "Đang xử lý";
    public const string Shipping = "Đang giao";
    public const string Completed = "Hoàn thành";
    public const string Cancelled = "Hủy";

    public static readonly string[] All =
    [
        Pending,
        Confirmed,
        Processing,
        Shipping,
        Completed,
        Cancelled
    ];
}
