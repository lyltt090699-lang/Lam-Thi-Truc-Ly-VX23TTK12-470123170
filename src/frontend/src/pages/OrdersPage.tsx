import { useState } from "react";
import { Link, Navigate } from "react-router";
import { getMyOrders } from "../api/checkout";
import { useAuth } from "../auth/AuthProvider";
import { studioPhoto } from "../catalog/studioPhoto";
import { useRemote } from "../catalog/useRemote";
import { AccountFrame } from "../components/account/AccountFrame";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { OrderCancelButton } from "../components/orders/OrderCancelButton";

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
] as const;
type Filter = (typeof filters)[number]["key"];

const when = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function OrdersPage() {
  const { user, ready } = useAuth();
  const { state, retry } = useRemote(() => (ready && user ? getMyOrders() : Promise.resolve([])), `${ready}|${user?.email ?? ""}`);
  const [filter, setFilter] = useState<Filter>("all");

  if (!ready || state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/account/orders" }} />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  const orders = state.data.filter((order) => filter === "all" || stage(order.status) === filter);

  return (
    <AccountFrame>
      <section className="your-orders">
        <h1>Đơn hàng của bạn</h1>
        <div className="order-filters" role="tablist" aria-label="Trạng thái đơn">
          {filters.map((item) => (
            <button key={item.key} type="button" className={item.key === "all" ? undefined : `is-${item.key}`} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
        {orders.length === 0 ? <p className="order-empty">Không có đơn trong mục này.</p> : null}
        <ul>
          {orders.map((order) => {
            const key = stage(order.status);
            const label = stageLabel(key);
            return (
              <li key={order.code} className="order-card">
                <header>
                  <div>
                    <strong>Đơn #{order.code}</strong>
                    <span>{when.format(new Date(order.createdAt))}</span>
                  </div>
                  <em className={`order-badge is-${key}`}>{label}</em>
                </header>
                <ul>
                  {(order.items ?? []).map((item, index) => (
                    <li key={`${order.code}-${index}`}>
                      <img src={studioPhoto(item.productSlug) || "/photos/phone-studio.jpg"} alt="" width="72" height="72" loading="lazy" />
                      <span>
                        <strong>{item.productName}</strong>
                        <small>{item.colorName}{item.storage ? ` · ${item.storage}` : ""}</small>
                        {item.productSlug && key === "completed" ? (
                          <Link
                            to={`/products/${item.productSlug}?tab=reviews`}
                            className="mt-1 inline-block text-xs font-semibold text-ink underline hover:no-underline"
                          >
                            ⭐ Đánh giá
                          </Link>
                        ) : null}
                      </span>
                      <b>{dong(item.lineTotal)}</b>
                    </li>
                  ))}
                </ul>
                <footer>
                  <span>Tổng <strong>{dong(order.total)}</strong></span>
                  <span className="order-actions">
                    {key === "processing" ? <OrderCancelButton code={order.code} onCancelled={retry} /> : null}
                    <Link to={`/account/orders/${order.code}`}>Xem đơn</Link>
                  </span>
                </footer>
              </li>
            );
          })}
        </ul>
      </section>
    </AccountFrame>
  );
}

function stage(status: string) {
  if (status === "Đang giao") {
    return "shipping";
  }
  if (status === "Hoàn thành") {
    return "completed";
  }
  if (status === "Hủy") {
    return "cancelled";
  }
  return "processing";
}

function stageLabel(key: string) {
  if (key === "shipping") {
    return "Đang giao";
  }
  if (key === "completed") {
    return "Hoàn thành";
  }
  if (key === "cancelled") {
    return "Đã hủy";
  }
  return "Đang xử lý";
}

function dong(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)}đ`;
}
