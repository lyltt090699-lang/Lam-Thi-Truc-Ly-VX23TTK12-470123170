import { Link, Navigate, useParams } from "react-router";
import { getOrder } from "../api/checkout";
import { useAuth } from "../auth/AuthProvider";
import { studioPhoto } from "../catalog/studioPhoto";
import { useRemote } from "../catalog/useRemote";
import { AccountFrame } from "../components/account/AccountFrame";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { OrderCancelButton } from "../components/orders/OrderCancelButton";

const when = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function OrderDetailPage() {
  const { user, ready } = useAuth();
  const { code = "" } = useParams();
  const { state, retry } = useRemote(() => (ready && user ? getOrder(code) : Promise.resolve(null)), `${ready}|${user?.email ?? ""}|${code}`);

  if (!ready || state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/account/orders/${code}` }} />;
  }

  if (state.status !== "ready" || !state.data) {
    return (
      <AccountFrame>
        <CatalogStatus status={state.status === "ready" || state.status === "missing" ? "error" : state.status} message={"message" in state ? state.message : "Không tìm thấy đơn hàng."} onRetry={retry} />
      </AccountFrame>
    );
  }

  const order = state.data;
  const key = stage(order.status);
  const label = stageLabel(key);

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Đơn #{order.code}</h1>
        <article className="order-card">
          <header>
            <div>
              <strong>{when.format(new Date(order.createdAt))}</strong>
              <span>{order.recipientName} · {order.phone}</span>
              <span>{order.addressLine}</span>
            </div>
            <em className={`order-badge is-${key}`}>{label}</em>
          </header>
          <ul>
            {order.items.map((item, index) => (
              <li key={`${item.sku}-${index}`}>
                <img src={studioPhoto(item.productSlug ?? "") || "/photos/phone-studio.jpg"} alt="" width="72" height="72" loading="lazy" />
                <span>
                  <strong>{item.productName}</strong>
                  <small>{item.colorName}{item.storage ? ` · ${item.storage}` : ""} · x{item.quantity}</small>
                  {item.productSlug && key === "completed" ? (
                    <Link
                      to={`/products/${item.productSlug}?tab=reviews`}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-ink underline hover:no-underline"
                    >
                      ⭐ Đánh giá sản phẩm
                    </Link>
                  ) : null}
                </span>
                <b>{dong(item.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <dl className="account-totals">
            <div><dt>Tạm tính</dt><dd>{dong(order.subtotal)}</dd></div>
            <div><dt>Phí ship</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : dong(order.shippingFee)}</dd></div>
            {order.discount > 0 ? <div><dt>Giảm giá</dt><dd>-{dong(order.discount)}</dd></div> : null}
            <div className="is-total"><dt>Tổng</dt><dd>{dong(order.total)}</dd></div>
          </dl>
          {order.note ? <p className="account-note">{order.note}</p> : null}
          <footer>
            <Link to="/account/orders">Về đơn hàng</Link>
            {key === "processing" ? <OrderCancelButton code={order.code} onCancelled={retry} /> : null}
          </footer>
        </article>
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
