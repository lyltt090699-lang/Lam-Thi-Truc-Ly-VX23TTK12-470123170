import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { StoreLayout } from "./components/layout/StoreLayout";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminContentPagesPage } from "./pages/AdminContentPagesPage";
import { AdminMessageDetailPage } from "./pages/AdminMessageDetailPage";
import { AdminMessagesPage } from "./pages/AdminMessagesPage";
import { AdminCustomersPage } from "./pages/AdminCustomersPage";
import { AdminOrderDetailPage } from "./pages/AdminOrderDetailPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminReviewsPage } from "./pages/AdminReviewsPage";
import { AdminVouchersPage } from "./pages/AdminVouchersPage";
import { AccountPage } from "./pages/AccountPage";
import { AddressesPage } from "./pages/AddressesPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { BestsellersPage } from "./pages/BestsellersPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContentPage } from "./pages/ContentPage";
import { ComparePage } from "./pages/ComparePage";
import { ContactPage } from "./pages/ContactPage";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewProductsPage } from "./pages/NewProductsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrderLookupPage } from "./pages/OrderLookupPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductListPage } from "./pages/ProductListPage";
import { PromotionsPage } from "./pages/PromotionsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { WishlistPage } from "./pages/WishlistPage";

const legacyPages: Record<string, string> = {
  "dieu-khoan": "terms",
  "chinh-sach-bao-mat": "privacy",
  "chinh-sach-doi-tra": "returns",
  "chinh-sach-bao-hanh": "warranty",
  "cau-hoi-thuong-gap": "help",
  "gioi-thieu": "story",
  "huong-dan-mua-hang": "how-to-buy",
  "chinh-sach-van-chuyen": "delivery",
};

function LegacyRedirect({ base }: { base: string }) {
  const params = useParams();
  const location = useLocation();
  const rest = params["*"] ?? "";
  const next = rest ? `${base}/${rest}` : base;
  return <Navigate to={`${next}${location.search}`} replace />;
}

function LegacyPageRedirect() {
  const params = useParams();
  const rest = params["*"] ?? "";
  return <Navigate to={`/pages/${legacyPages[rest] ?? rest}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/new" element={<NewProductsPage />} />
            <Route path="/offers" element={<PromotionsPage />} />
            <Route path="/bestsellers" element={<BestsellersPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success/:code" element={<OrderSuccessPage />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/orders/:code" element={<OrderDetailPage />} />
            <Route path="/track-order" element={<OrderLookupPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/profile" element={<AccountPage />} />
            <Route path="/account/security" element={<ChangePasswordPage />} />
            <Route path="/account/addresses" element={<AddressesPage />} />
            <Route path="/account/wishlist" element={<WishlistPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/pages/:slug" element={<ContentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/pages" element={<AdminContentPagesPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />
            <Route path="/admin/messages/:id" element={<AdminMessageDetailPage />} />
            <Route path="/san-pham/*" element={<LegacyRedirect base="/products" />} />
            <Route path="/san-pham" element={<LegacyRedirect base="/products" />} />
            <Route path="/danh-muc/*" element={<LegacyRedirect base="/category" />} />
            <Route path="/hang-moi" element={<LegacyRedirect base="/new" />} />
            <Route path="/khuyen-mai" element={<LegacyRedirect base="/offers" />} />
            <Route path="/ban-chay" element={<LegacyRedirect base="/bestsellers" />} />
            <Route path="/gio-hang" element={<LegacyRedirect base="/cart" />} />
            <Route path="/dat-hang/thanh-cong/*" element={<LegacyRedirect base="/checkout/success" />} />
            <Route path="/dat-hang" element={<LegacyRedirect base="/checkout" />} />
            <Route path="/don-hang/*" element={<LegacyRedirect base="/account/orders" />} />
            <Route path="/don-hang" element={<LegacyRedirect base="/account/orders" />} />
            <Route path="/tra-cuu-don" element={<LegacyRedirect base="/track-order" />} />
            <Route path="/tai-khoan" element={<LegacyRedirect base="/account" />} />
            <Route path="/doi-mat-khau" element={<LegacyRedirect base="/account/security" />} />
            <Route path="/so-dia-chi" element={<LegacyRedirect base="/account/addresses" />} />
            <Route path="/yeu-thich" element={<LegacyRedirect base="/account/wishlist" />} />
            <Route path="/so-sanh" element={<LegacyRedirect base="/compare" />} />
            <Route path="/lien-he" element={<LegacyRedirect base="/contact" />} />
            <Route path="/dang-nhap" element={<LegacyRedirect base="/login" />} />
            <Route path="/dang-ky" element={<LegacyRedirect base="/register" />} />
            <Route path="/quen-mat-khau" element={<LegacyRedirect base="/forgot-password" />} />
            <Route path="/dat-lai-mat-khau" element={<LegacyRedirect base="/reset-password" />} />
            <Route path="/trang/*" element={<LegacyPageRedirect />} />
            <Route path="/admin/danh-muc" element={<LegacyRedirect base="/admin/categories" />} />
            <Route path="/admin/san-pham" element={<LegacyRedirect base="/admin/products" />} />
            <Route path="/admin/don-hang/*" element={<LegacyRedirect base="/admin/orders" />} />
            <Route path="/admin/don-hang" element={<LegacyRedirect base="/admin/orders" />} />
            <Route path="/admin/khach-hang" element={<LegacyRedirect base="/admin/customers" />} />
            <Route path="/admin/ma-giam-gia" element={<LegacyRedirect base="/admin/vouchers" />} />
            <Route path="/admin/danh-gia" element={<LegacyRedirect base="/admin/reviews" />} />
            <Route path="/admin/trang-noi-dung" element={<LegacyRedirect base="/admin/pages" />} />
            <Route path="/admin/tin-nhan/*" element={<LegacyRedirect base="/admin/messages" />} />
            <Route path="/admin/tin-nhan" element={<LegacyRedirect base="/admin/messages" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
