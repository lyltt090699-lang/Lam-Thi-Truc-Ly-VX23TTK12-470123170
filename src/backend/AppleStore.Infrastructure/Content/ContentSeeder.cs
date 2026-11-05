using AppleStore.Domain.Content;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AppleStore.Infrastructure.Content;

public static class ContentSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("ContentSeed");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.ContentPages.AnyAsync())
        {
            logger.LogInformation("Content pages already exist.");
            return;
        }

        db.ContentPages.AddRange(
            Page("gioi-thieu", "Giới thiệu", 1, """
                Apple Store là cửa hàng demo cho đồ án bán sản phẩm công nghệ của Apple.

                Khách xem danh mục, chọn màu và dung lượng, rồi đặt hàng. Đơn được lưu để cửa hàng xác nhận. Chưa có thanh toán trực tuyến.
                """),
            Page("cau-hoi-thuong-gap", "Câu hỏi thường gặp", 2, """
                Làm sao đặt hàng? Thêm sản phẩm vào giỏ, đăng nhập, rồi mở trang Đặt hàng.

                Làm sao theo dõi đơn? Khách đã đăng nhập xem mục Đơn hàng. Khách chưa đăng nhập dùng Tra cứu đơn với mã đơn và số điện thoại.

                Mã giảm giá nhập ở đâu? Nhập ở trang Đặt hàng rồi bấm Áp dụng. Chỉ mã đang dùng mới được tính.
                """),
            Page("huong-dan-mua-hang", "Hướng dẫn mua hàng", 3, """
                Chọn sản phẩm, màu và dung lượng. Kiểm tra giá và số lượng còn lại trước khi thêm vào giỏ.

                Đăng nhập để đặt hàng. Có thể chọn địa chỉ đã lưu hoặc nhập địa chỉ mới.

                Sau khi đặt, đơn ở trạng thái Chờ xác nhận. Cửa hàng sẽ cập nhật trạng thái khi xử lý.
                """),
            Page("chinh-sach-van-chuyen", "Chính sách vận chuyển", 4, """
                Phí giao hàng cố định cho mỗi đơn trong bản demo.

                Thời gian giao phụ thuộc khu vực. Trạng thái đơn chuyển sang Đang giao khi cửa hàng đã gửi hàng.
                """),
            Page("chinh-sach-doi-tra", "Chính sách đổi trả", 5, """
                Khách liên hệ cửa hàng nếu sản phẩm lỗi hoặc không đúng đơn đã đặt.

                Đơn đã hủy được cộng lại tồn kho. Bản demo chưa có cổng đổi trả tự động.
                """),
            Page("chinh-sach-bao-hanh", "Chính sách bảo hành", 6, """
                Sản phẩm Apple trong cửa hàng demo được mô tả kèm thông tin bảo hành của hãng.

                Giữ mã đơn để cửa hàng đối chiếu khi cần hỗ trợ.
                """),
            Page("chinh-sach-bao-mat", "Chính sách bảo mật", 7, """
                Cửa hàng lưu email, họ tên, số điện thoại và địa chỉ để xử lý đơn hàng.

                Mật khẩu được băm, không lưu dạng chữ thường. Bản demo chưa gửi email thật.
                """),
            Page("dieu-khoan", "Điều khoản sử dụng", 8, """
                Đây là website đồ án. Thông tin sản phẩm và đơn hàng dùng để minh họa luồng mua hàng.

                Khách chịu trách nhiệm với nội dung đánh giá và tin nhắn liên hệ do mình gửi.
                """));
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded content pages.");
    }

    private static ContentPage Page(string slug, string title, int sortOrder, string body)
    {
        return new ContentPage
        {
            Slug = slug,
            Title = title,
            Body = body.Trim(),
            SortOrder = sortOrder
        };
    }
}
