# Website Thương mại Điện tử Apple Store (NEXA)

Website thương mại điện tử chuyên cung cấp các sản phẩm công nghệ của hệ sinh thái Apple (iPhone, Mac, iPad, Apple Watch, AirPods, Phụ kiện). Hệ thống cung cấp trải nghiệm mua sắm hiện đại, cho phép khách hàng duyệt xem sản phẩm, tìm kiếm, lọc theo thông số, quản lý giỏ hàng, áp dụng mã ưu đãi, đặt hàng COD và tra cứu đơn hàng trực tiếp. Quản trị viên (Admin) được trang bị trung tâm điều hành toàn diện để quản lý danh mục, sản phẩm, đơn hàng, khách hàng, mã giảm giá, đánh giá và các trang nội dung chính sách.

Toàn bộ ứng dụng tuân thủ kiến trúc tách biệt hoàn toàn (Decoupled Architecture): Frontend Single Page Application (React) giao tiếp độc quyền với Backend Web API (ASP.NET Core) qua chuẩn RESTful API và JWT Authentication. Backend làm việc trực tiếp với hệ quản trị cơ sở dữ liệu Microsoft SQL Server.

---

## 1. Công nghệ Sử dụng

### Frontend
- **Framework & Runtime**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, CSS Modules linh hoạt
- **Routing & State**: React Router DOM (v6)
- **Biểu mẫu & Xác thực**: React Hook Form, Zod Schema Validation

### Backend
- **Nền tảng**: ASP.NET Core 8 Web API
- **Xác thực & Phân quyền**: ASP.NET Core Identity kết hợp JSON Web Token (JWT) Bearer
- **ORM & Data Access**: Entity Framework Core 8 (Code-First)
- **Kiểm định dữ liệu**: FluentValidation
- **Cơ sở dữ liệu**: Microsoft SQL Server

---

## 2. Kiến trúc Hệ thống

Frontend không bao giờ kết nối trực tiếp với SQL Server. Mọi truy vấn và nghiệp vụ đều đi qua tầng API:

```text
AppleStore/
├── src/
│   ├── frontend/                       React SPA, Vite, Tailwind CSS
│   └── backend/
│       ├── AppleStore.sln
│       ├── AppleStore.Api/             Controller RESTful, CORS, JWT Auth, Swagger, Static Files
│       ├── AppleStore.Application/     DTOs, Service Interfaces, Validators
│       ├── AppleStore.Domain/          Entities, Enums, Business Rules
│       └── AppleStore.Infrastructure/  EF Core DbContext, Identity, Seed Data, Migrations
├── releases/                           Lưu trữ toàn bộ các Phase ZIP lịch sử
├── setup/                              Công cụ đóng gói và hướng dẫn cấu hình SQL Server
└── README.md                           Tài liệu hướng dẫn duy nhất của dự án
```

---

## 3. Yêu cầu Môi trường

Trước khi cài đặt và chạy hệ thống, đảm bảo máy tính đã cài đặt:
- **Node.js**: Phiên bản 20 trở lên (kèm `npm`)
- **.NET SDK**: Phiên bản 8.0 trở lên
- **Microsoft SQL Server**: Bản Developer, Enterprise hoặc SQL Server Express đang chạy

---

## 4. Cấu hình Cơ sở Dữ liệu SQL Server

Chuỗi kết nối cơ sở dữ liệu được đặt tại `src/backend/AppleStore.Api/appsettings.json`, khóa `ConnectionStrings:DefaultConnection`.

Mặc định, cấu hình sử dụng Windows Authentication trên instance `localhost`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=AppleStore;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

*Lưu ý theo từng môi trường:*
* **Instance mặc định**: Giữ nguyên `Server=localhost`.
* **SQL Server Express**: Đổi thành `Server=localhost\\SQLEXPRESS`.
* **Sử dụng tài khoản SQL (sa)**:
  ```text
  Server=localhost;Database=AppleStore;User ID=sa;Password=<MatKhauCuaBan>;TrustServerCertificate=True;MultipleActiveResultSets=true
  ```

---

## 5. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Chạy Backend API
Từ thư mục gốc của dự án, mở Terminal và chạy lệnh:
```powershell
dotnet run --project src/backend/AppleStore.Api --launch-profile http
```
* **Quá trình tự động**: Ngay khi khởi động, Backend sẽ tự động kiểm tra, khởi tạo cơ sở dữ liệu `AppleStore` trên SQL Server, chạy toàn bộ các bản Migration và nạp dữ liệu mẫu (Seed Data) hoàn chỉnh.
* Khi terminal xuất hiện dòng thông báo:
  ```text
  SQL Server database is ready
  Now listening on: http://localhost:5139
  ```
* Địa chỉ Swagger API: `http://localhost:5139/swagger`
* Địa chỉ kiểm tra sức khỏe hệ thống: `http://localhost:5139/api/health`

### Bước 2: Chạy Frontend
Mở một cửa sổ Terminal thứ hai, di chuyển vào thư mục `src/frontend`:
```powershell
cd src/frontend
npm install
npm run dev
```
* Ứng dụng Frontend sẽ khởi chạy tại: `http://localhost:5173`
* Mở trình duyệt web và truy cập `http://localhost:5173` để trải nghiệm hệ thống.

---

## 6. Tài khoản Trải nghiệm Hệ thống (Demo Accounts)

Hệ thống đã tạo sẵn 2 tài khoản mẫu trong cơ sở dữ liệu phục vụ nghiệm thu:

| Vai trò | Tên tài khoản (Email) | Mật khẩu | Quyền hạn & Chức năng |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@applestore.local` | `Admin@123` | Toàn quyền quản trị hệ thống tại `/admin`: Bảng điều khiển, Doanh thu, Danh mục, Sản phẩm, Đơn hàng, Khách hàng, Mã giảm giá, Đánh giá, Trang nội dung, Tin nhắn liên hệ. |
| **Khách hàng (Customer)** | `customer@applestore.local` | `Customer@123` | Trải nghiệm mua sắm: Xem giỏ hàng, Yêu thích, So sánh, Đặt hàng COD, Quản lý đơn cá nhân tại `/account/orders`, Đổi mật khẩu, Sổ địa chỉ. |

---

## 7. Kịch bản Kiểm thử & Hướng dẫn Sử dụng Chi tiết

### Kịch bản 1: Mua sắm & Đặt hàng Trực tuyến (Khách hàng)
1. **Duyệt xem sản phẩm**:
   - Truy cập `http://localhost:5173`.
   - Xem thanh điều hướng các dòng sản phẩm: **iPhone**, **Mac**, **iPad**, **Watch**, **AirPods**, **Phụ kiện**.
   - Vào các trang chuyên biệt: `/new` (Hàng mới), `/bestsellers` (Bán chạy), `/offers` (Khuyến mãi).
2. **Tìm kiếm & Bộ lọc**:
   - Nhập từ khóa tìm kiếm trên thanh Header (ví dụ: `iph`, `pro`, `mac`).
   - Sử dụng bộ lọc theo mức giá, dung lượng, màu sắc và sắp xếp theo giá tăng/giảm hoặc mới nhất.
3. **Chi tiết sản phẩm**:
   - Bấm vào một sản phẩm (ví dụ: `iPhone 16 Pro Max`).
   - Chọn màu sắc và dung lượng tương ứng: Quan sát giá bán và số lượng tồn kho tự động thay đổi theo biến thể đã chọn.
4. **Giỏ hàng & Danh sách yêu thích & So sánh**:
   - Bấm **Thêm vào giỏ**: Sản phẩm được lưu trong giỏ hàng.
   - Bấm biểu tượng Trái tim để đưa vào danh sách Yêu thích.
   - Truy cập `/compare` để so sánh trực quan tối đa 3 sản phẩm cùng lúc.
5. **Tiến hành Đặt hàng (Checkout)**:
   - Bấm vào giỏ hàng và chọn **Thanh toán**.
   - Đăng nhập bằng tài khoản `customer@applestore.local` / `Customer@123`.
   - Điền thông tin giao hàng: Họ tên, Số điện thoại, Địa chỉ nhận hàng.
   - Nhập mã ưu đãi: `APPLE10` và bấm **Áp dụng** -> Giảm ngay 10% tổng tiền hàng.
   - Chọn hình thức: **Thanh toán khi nhận hàng (COD)**.
   - Bấm **Đặt hàng ngay** -> Màn hình hiển thị mã đơn hàng thành công (ví dụ: `ORD-...`).

### Kịch bản 2: Quản lý & Tra cứu Đơn hàng
1. **Khách hàng đã đăng nhập**:
   - Vào menu tài khoản -> **Đơn hàng của tôi** (`/account/orders`).
   - Xem chi tiết tiến trình đơn hàng: Chờ xác nhận, Đã xác nhận, Đang xử lý, Đang giao, Hoàn thành.
   - Thử hủy đơn hàng khi đơn còn ở trạng thái Chờ xác nhận -> Hệ thống cập nhật trạng thái Đã hủy và **tự động hoàn lại số lượng tồn kho**.
2. **Tra cứu nhanh không cần đăng nhập**:
   - Truy cập trang `/track-order`.
   - Nhập Mã đơn hàng và Số điện thoại đặt hàng để tra cứu tiến độ vận chuyển tức thì.

### Kịch bản 3: Trung tâm Điều hành Quản trị (Admin Dashboard)
1. **Đăng nhập Quản trị**:
   - Đăng nhập với tài khoản `admin@applestore.local` / `Admin@123`.
   - Truy cập `http://localhost:5173/admin`.
2. **Báo cáo & Tổng quan**:
   - Thẻ KPI: Doanh thu thực tế, Số lượng đơn hàng, Số khách hàng, Số sản phẩm.
   - Biểu đồ doanh thu theo tháng, danh sách đơn hàng mới nhất, top sản phẩm bán chạy và cảnh báo tồn kho thấp.
3. **Quản lý Danh mục & Sản phẩm**:
   - `/admin/categories`: Thêm mới, sửa, xóa danh mục Apple.
   - `/admin/products`: Thêm sản phẩm mới, cập nhật giá, thông số kỹ thuật, quản lý danh sách biến thể (màu sắc, dung lượng, tồn kho).
4. **Xử lý Đơn hàng**:
   - `/admin/orders`: Xem danh sách đơn, lọc theo trạng thái, cập nhật trạng thái đơn (Chờ xác nhận -> Đã xác nhận -> Đang xử lý -> Đang giao -> Đã giao).
5. **Khách hàng, Mã giảm giá & Đánh giá**:
   - `/admin/customers`: Xem danh sách khách hàng và lịch sử mua sắm.
   - `/admin/vouchers`: Quản lý mã khuyến mãi, thiết lập tỷ lệ giảm và hạn dùng.
   - `/admin/reviews`: Kiểm duyệt và phản hồi đánh giá của khách hàng.
   - `/admin/messages`: Đọc và giải đáp các thư liên hệ từ khách hàng gửi qua form `/contact`.

---

## 8. Migration & Cập nhật Cơ sở Dữ liệu

Toàn bộ các tệp Migration được lưu trữ tại `src/backend/AppleStore.Infrastructure/Persistence/Migrations`.

Khi triển khai hoặc chạy ứng dụng lần đầu, **không cần chạy lệnh cập nhật thủ công**, Backend đã tích hợp sẵn cơ chế tự động áp dụng Migration khi khởi động:
```csharp
context.Database.Migrate();
```

Khi phát triển thêm tính năng mới cần bổ sung Migration:
```powershell
dotnet tool restore
dotnet ef migrations add TenMigration --project src/backend/AppleStore.Infrastructure --startup-project src/backend/AppleStore.Api --output-dir Persistence/Migrations
```

---

## 9. Bộ công cụ Đóng gói Phát hành (Release Packaging)

Hệ thống được trang bị bộ script PowerShell tự động trong thư mục `setup/`:
- **Đóng gói từng Phase (Phase ZIP)**:
  ```powershell
  .\setup\pack-release.ps1 -Name "apple-store-phase-XX-..."
  ```
  *Chứa snapshot mã nguồn sạch tại thời điểm phase đó, duy nhất 01 tệp `README.md`, tuyệt đối không lồng `releases/`, không chứa tài liệu nội bộ và build artifacts.*
- **Đóng gói Bàn giao Cuối cùng (Final Delivery ZIP)**:
  ```powershell
  .\setup\pack-final.ps1
  ```
  *Tự động build Frontend, Backend, kiểm tra Migrations, tạo tệp `AppleStore_Final_Source.zip` tại thư mục tạm `TEMP`, đóng gói sạch nguồn kèm toàn bộ các Phase ZIP trong `releases/`, kiểm định tự động không chứa `.cursor` hay tệp nội bộ, sau đó triển khai vào `releases/`.*
