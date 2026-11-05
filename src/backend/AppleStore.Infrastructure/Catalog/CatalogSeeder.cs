using AppleStore.Domain.Catalog;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AppleStore.Infrastructure.Catalog;

public static class CatalogSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CatalogSeed");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (await db.Categories.AnyAsync())
        {
            logger.LogInformation("Catalog seed already exists.");
            await AddMissingPhonesAsync(db, logger);
            return;
        }

        var createdAt = DateTime.UtcNow;
        var categories = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase)
        {
            ["iphone"] = Category("iPhone", "iphone", "Điện thoại iPhone.", 1),
            ["ipad"] = Category("iPad", "ipad", "Máy tính bảng iPad.", 2),
            ["mac"] = Category("Mac", "mac", "Máy tính Mac.", 3),
            ["apple-watch"] = Category("Apple Watch", "apple-watch", "Đồng hồ Apple Watch.", 4),
            ["airpods"] = Category("AirPods", "airpods", "Tai nghe AirPods.", 5),
            ["accessories"] = Category("Accessories", "accessories", "Phụ kiện cho thiết bị Apple.", 6)
        };

        var products = new List<Product>
        {
            Product(categories["iphone"], "iPhone 16", "iphone-16", "iPhone 16 với nút Camera Control.", "Màn hình sáng, chip nhanh và camera dùng hàng ngày. Chọn màu và dung lượng trước khi mua.", true, true, createdAt, [
                Variant("IP16-BLK-128", "Đen", "#1d1d1f", "128GB", 22990000, 24),
                Variant("IP16-BLK-256", "Đen", "#1d1d1f", "256GB", 25990000, 18),
                Variant("IP16-ULT-128", "Xanh lưu ly", "#3d4c8a", "128GB", 22990000, 3)
            ]),
            Product(categories["iphone"], "iPhone 16 Pro", "iphone-16-pro", "iPhone 16 Pro khung titan.", "Phù hợp người cần camera và hiệu năng cao hơn. Giá thay đổi theo dung lượng.", true, false, createdAt.AddMinutes(-1), [
                Variant("IP16P-NAT-256", "Titan tự nhiên", "#c2b8ae", "256GB", 30990000, 15),
                Variant("IP16P-NAT-512", "Titan tự nhiên", "#c2b8ae", "512GB", 36990000, 8),
                Variant("IP16P-DES-256", "Titan sa mạc", "#c2a98a", "256GB", 30990000, 11)
            ]),
            Product(categories["ipad"], "iPad Air", "ipad-air", "iPad Air mỏng, nhẹ.", "Dùng để học, ghi chú và xem nội dung. Có hai mức dung lượng.", false, true, createdAt.AddMinutes(-2), [
                Variant("IPAD-AIR-BLU-128", "Xanh", "#6e8ca0", "128GB", 16990000, 20),
                Variant("IPAD-AIR-PUR-256", "Tím", "#6b5b95", "256GB", 19990000, 14)
            ]),
            Product(categories["ipad"], "iPad Pro", "ipad-pro", "iPad Pro cho công việc nặng.", "Màn hình lớn và hiệu năng cao cho dựng hình, vẽ và làm việc đa nhiệm.", true, false, createdAt.AddMinutes(-3), [
                Variant("IPAD-PRO-SLV-256", "Bạc", "#e3e4e5", "256GB", 28990000, 10),
                Variant("IPAD-PRO-BLK-512", "Đen không gian", "#2b2b2b", "512GB", 36990000, 6)
            ]),
            Product(categories["mac"], "MacBook Air", "macbook-air", "MacBook Air mỏng cho học tập và làm việc.", "Máy nhẹ, pin lâu. Chọn màu và dung lượng SSD.", true, true, createdAt.AddMinutes(-4), [
                Variant("MBA-MID-256", "Nửa đêm", "#2c3642", "256GB", 26990000, 16),
                Variant("MBA-STR-512", "Ánh sao", "#f0e6d8", "512GB", 31990000, 9)
            ]),
            Product(categories["mac"], "MacBook Pro", "macbook-pro", "MacBook Pro cho công việc chuyên môn.", "Hiệu năng cao hơn MacBook Air. Bản 1TB đang còn ít.", false, false, createdAt.AddMinutes(-5), [
                Variant("MBP-BLK-512", "Đen không gian", "#2b2b2b", "512GB", 49990000, 7),
                Variant("MBP-SLV-1TB", "Bạc", "#e3e4e5", "1TB", 58990000, 2)
            ]),
            Product(categories["apple-watch"], "Apple Watch Series 10", "watch-series-10", "Apple Watch Series 10 mỏng hơn.", "Theo dõi sức khỏe và thông báo hằng ngày. Có hai cỡ mặt.", false, true, createdAt.AddMinutes(-6), [
                Variant("AWS10-BLK-42", "Đen bóng", "#1a1a1a", "42mm", 10990000, 22),
                Variant("AWS10-RSG-46", "Vàng hồng", "#e6c2b0", "46mm", 11990000, 12)
            ]),
            Product(categories["apple-watch"], "Apple Watch Ultra", "watch-ultra", "Apple Watch Ultra cho hoạt động ngoài trời.", "Pin lâu và mặt đồng hồ lớn. Có hai màu dây.", true, false, createdAt.AddMinutes(-7), [
                Variant("AWU-NAT-49", "Tự nhiên", "#d7c4a3", "49mm", 21990000, 8),
                Variant("AWU-BLK-49", "Đen", "#1d1d1f", "49mm", 21990000, 4)
            ]),
            Product(categories["airpods"], "AirPods 4", "airpods-4", "AirPods 4 gọn, đeo thoải mái.", "Bản chống ồn giá cao hơn bản chuẩn.", false, true, createdAt.AddMinutes(-8), [
                Variant("AP4-WHT-STD", "Trắng", "#f5f5f7", "Chuẩn", 3490000, 30),
                Variant("AP4-WHT-ANC", "Trắng", "#f5f5f7", "Chống ồn", 4990000, 18)
            ]),
            Product(categories["airpods"], "AirPods Max", "airpods-max", "AirPods Max chụp tai.", "Tai nghe chụp tai cho nghe nhạc và gọi. Hai màu có cùng giá.", false, false, createdAt.AddMinutes(-9), [
                Variant("APM-MID", "Nửa đêm", "#2c3642", "Chuẩn", 12990000, 5),
                Variant("APM-STR", "Ánh sao", "#f0e6d8", "Chuẩn", 12990000, 5)
            ]),
            Product(categories["accessories"], "Cáp USB-C", "usb-c-cable", "Cáp USB-C sạc và truyền dữ liệu.", "Chọn độ dài 1 mét hoặc 2 mét.", false, false, createdAt.AddMinutes(-10), [
                Variant("CABLE-WHT-1M", "Trắng", "#f5f5f7", "1m", 490000, 40),
                Variant("CABLE-WHT-2M", "Trắng", "#f5f5f7", "2m", 690000, 25)
            ]),
            Product(categories["accessories"], "Ốp silicone iPhone 16", "silicone-case", "Ốp silicone cho iPhone 16.", "Hai màu. Giá đã gồm ốp, chưa gồm máy.", false, false, createdAt.AddMinutes(-11), [
                Variant("CASE-BLK-16", "Đen", "#1d1d1f", "iPhone 16", 1290000, 28),
                Variant("CASE-BLU-16", "Xanh mùa đông", "#7f9db3", "iPhone 16", 1290000, 17)
            ])
        };

        db.Categories.AddRange(categories.Values);
        db.Products.AddRange(products);
        await db.SaveChangesAsync();
        logger.LogInformation("Catalog seed created {CategoryCount} categories and {ProductCount} products.", categories.Count, products.Count);
        await AddMissingPhonesAsync(db, logger);
    }

    private static async Task AddMissingPhonesAsync(AppDbContext db, ILogger logger)
    {
        var category = await db.Categories.FirstOrDefaultAsync(category => category.Slug == "iphone");
        if (category == null)
        {
            return;
        }

        var slugs = await db.Products.Select(product => product.Slug).ToListAsync();
        var createdAt = DateTime.UtcNow;
        var added = new List<Product>();

        void Add(string name, string slug, string shortDescription, string description, bool featured, bool isNew, params ProductVariant[] variants)
        {
            if (slugs.Contains(slug))
            {
                return;
            }

            added.Add(Product(category, name, slug, shortDescription, description, featured, isNew, createdAt, variants));
        }

        Add("iPhone 16 Pro Max", "iphone-16-pro-max", "iPhone 16 Pro Max màn hình lớn.", "Bản màn hình lớn của iPhone 16 Pro.", false, false, Variant("IP16PM-NAT-256", "Titan tự nhiên", "#c2b8ae", "256GB", 34990000, 10));
        Add("iPhone 15", "iphone-15", "iPhone 15 cho dùng hằng ngày.", "Chọn màu và dung lượng trước khi đặt.", false, false, Variant("IP15-PNK-128", "Hồng", "#e7b7c6", "128GB", 22990000, 20));
        Add("iPhone 15 Plus", "iphone-15-plus", "iPhone 15 Plus màn hình rộng.", "Pin lâu hơn bản thường.", false, false, Variant("IP15P-TEA-128", "Xanh", "#7fbfc7", "128GB", 25990000, 16));
        Add("iPhone 14", "iphone-14", "iPhone 14 gọn.", "Máy gọn cho gọi, chụp và làm việc nhẹ.", false, false, Variant("IP14-BLU-128", "Xanh", "#7ea0c4", "128GB", 19990000, 18));
        Add("iPhone 13", "iphone-13", "iPhone 13.", "Lựa chọn giá dễ hơn trong dòng iPhone.", false, false, Variant("IP13-BLK-128", "Đen", "#1d1d1f", "128GB", 15990000, 14));
        Add("iPhone SE", "iphone-se", "iPhone SE nhỏ gọn.", "Máy nhỏ, một mức dung lượng.", false, false, Variant("IPSE-BLK-128", "Đen", "#1d1d1f", "128GB", 11990000, 22));
        Add("iPhone 16e", "iphone-16e", "iPhone 16e.", "Bản gọn trong dòng iPhone 16.", false, false, Variant("IP16E-WHT-128", "Trắng", "#f5f5f7", "128GB", 21990000, 12));

        if (added.Count == 0)
        {
            return;
        }

        db.Products.AddRange(added);
        await db.SaveChangesAsync();
        logger.LogInformation("Added {Count} iPhone listing products.", added.Count);
    }

    private static Category Category(string name, string slug, string description, int order)
    {
        return new Category
        {
            Name = name,
            Slug = slug,
            Description = description,
            ImageUrl = $"/catalog/{slug}.svg",
            DisplayOrder = order,
            IsActive = true
        };
    }

    private static Product Product(
        Category category,
        string name,
        string slug,
        string shortDescription,
        string description,
        bool featured,
        bool isNew,
        DateTime createdAt,
        ProductVariant[] variants)
    {
        var product = new Product
        {
            Category = category,
            Name = name,
            Slug = slug,
            ShortDescription = shortDescription,
            Description = description,
            IsFeatured = featured,
            IsNew = isNew,
            IsActive = true,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        };

        product.Images.Add(new ProductImage
        {
            ImageUrl = $"/catalog/{slug}.svg",
            AltText = name,
            SortOrder = 0,
            IsPrimary = true
        });

        foreach (var variant in variants)
        {
            product.Variants.Add(variant);
        }

        return product;
    }

    private static ProductVariant Variant(string sku, string color, string hex, string storage, decimal price, int stock)
    {
        return new ProductVariant
        {
            Sku = sku,
            ColorName = color,
            ColorHex = hex,
            Storage = storage,
            Price = price,
            StockQuantity = stock,
            IsActive = true
        };
    }
}
