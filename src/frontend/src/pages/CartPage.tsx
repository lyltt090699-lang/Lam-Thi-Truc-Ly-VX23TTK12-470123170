import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { catalogImage, formatPrice } from "../api/catalog";
import { studioPhoto } from "../catalog/studioPhoto";
import { useAuth } from "../auth/AuthProvider";
import { loadCurrentCart, updateVariant } from "../cart/storage";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function CartPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const { state, retry } = useRemote(() => loadCurrentCart(), `${ready}|${user?.email ?? ""}|${revision}`);

  async function change(variantId: number, quantity: number) {
    await updateVariant(variantId, quantity);
    setRevision((value) => value + 1);
  }

  if (!ready || state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  return (
    <section>
      <p className="section-kicker">Giỏ hàng</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sản phẩm đã chọn.</h1>
      {state.data.items.length === 0 ? (
        <p className="mt-8 text-muted">Giỏ hàng đang trống. <Link to="/products" className="font-medium text-ink underline">Xem store</Link></p>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ul className="divide-y divide-line">
            {state.data.items.map((item) => (
              <li key={item.variantId} className="flex flex-wrap items-center gap-4 py-5">
                <img
                  src={studioPhoto(item.productSlug) || (item.imageUrl ? catalogImage(item.imageUrl) : "/photos/phone-studio.jpg")}
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                  className="media-well size-24 rounded-2xl object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/photos/phone-studio.jpg";
                  }}
                />
                <div className="min-w-48 flex-1">
                  <Link to={`/products/${item.productSlug}`} className="font-medium">{item.productName}</Link>
                  <p className="mt-1 text-sm text-muted">{item.colorName} · {item.storage}</p>
                  <p className="mt-1 text-sm">{formatPrice(item.unitPrice)}</p>
                </div>
                <label className="text-sm">
                  <span className="sr-only">Số lượng {item.productName}</span>
                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity}
                    value={item.quantity}
                    className="w-20 rounded-2xl border border-line bg-surface px-3 py-2"
                    onChange={(event) => void change(item.variantId, Number(event.target.value))}
                  />
                </label>
                <p className="w-32 text-right font-medium">{formatPrice(item.lineTotal)}</p>
                <button type="button" className="text-sm underline" onClick={() => void change(item.variantId, 0)}>Xóa</button>
              </li>
            ))}
          </ul>
          <aside className="summary-panel lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Tóm tắt</h2>
            <p className="mt-4 flex justify-between text-sm"><span>Tạm tính</span><span>{formatPrice(state.data.subtotal)}</span></p>
            <p className="mt-2 text-sm text-muted">Phí giao và mã giảm giá tính ở bước đặt hàng.</p>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              onClick={() => {
                if (!user) {
                  navigate("/login", { state: { from: "/checkout" } });
                  return;
                }

                navigate("/checkout");
              }}
            >
              Đặt hàng
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
