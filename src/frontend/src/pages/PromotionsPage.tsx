import { Link } from "react-router";
import { formatPrice, getPromotions } from "../api/catalog";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function PromotionsPage() {
  const { state, retry } = useRemote(() => getPromotions(), "promotions");

  if (state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Khuyến mãi</h1>
      <p className="mt-3 text-muted">Nhập mã khi đặt hàng. Chỉ các mã đang dùng mới được áp dụng.</p>
      {state.data.length === 0 ? (
        <p className="mt-8 text-muted">Chưa có chương trình khuyến mãi.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {state.data.map((promotion) => (
            <li key={promotion.code} className="rounded-3xl border border-line bg-surface p-6">
              <p className="text-2xl font-semibold tracking-tight">{promotion.code}</p>
              <p className="mt-3 text-muted">{promotion.description}</p>
              <p className="mt-4 font-medium">Giảm {promotion.discountPercent}%</p>
              {promotion.minSubtotal > 0 ? <p className="mt-2 text-sm text-muted">Đơn từ {formatPrice(promotion.minSubtotal)}</p> : null}
              <Link to="/checkout" className="mt-6 inline-block text-sm font-medium underline">Dùng khi đặt hàng</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
