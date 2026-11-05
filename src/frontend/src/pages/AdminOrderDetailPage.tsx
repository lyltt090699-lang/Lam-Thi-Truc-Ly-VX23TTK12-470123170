import { useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError } from "../api/client";
import { formatPrice } from "../api/catalog";
import { formatDateTime } from "../api/checkout";
import { changeOrderStatus, getAdminOrder, orderStatuses } from "../api/adminOrders";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { MenuSelect } from "../components/ui/MenuSelect";

export function AdminOrderDetailPage() {
  const { id = "" } = useParams();
  return (
    <AdminGuard>
      <AdminOrderDetail id={id} />
    </AdminGuard>
  );
}

function AdminOrderDetail({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const { state, retry } = useRemote(() => getAdminOrder(Number(id)), `${id}|${revision}`);
  const order = state.status === "ready" ? state.data : null;
  const selected = status || order?.status || orderStatuses[0];

  if (state.status === "loading") {
    return (
      <section>
        <AdminNav />
        <CatalogStatus status="loading" />
      </section>
    );
  }

  if (state.status !== "ready") {
    return (
      <section>
        <AdminNav />
        <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />
      </section>
    );
  }

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">{order?.code}</h1>
      <p className="mt-2 text-sm text-muted">{order ? formatDateTime(order.createdAt) : ""}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Người nhận</h2>
          <p className="mt-3">{order?.recipientName}</p>
          <p className="text-sm text-muted">{order?.customerEmail}</p>
          <p className="text-sm text-muted">{order?.phone}</p>
          <p className="text-sm text-muted">{order?.addressLine}</p>
          {order?.note ? <p className="mt-2 text-sm">{order.note}</p> : null}
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Tiền</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>Tạm tính</dt><dd>{formatPrice(order?.subtotal ?? 0)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Phí giao hàng</dt><dd>{formatPrice(order?.shippingFee ?? 0)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Giảm giá</dt><dd>{formatPrice(order?.discount ?? 0)}</dd></div>
            <div className="flex justify-between gap-4 font-semibold"><dt>Tổng</dt><dd>{formatPrice(order?.total ?? 0)}</dd></div>
          </dl>
          {order?.voucherCode ? <p className="mt-3 text-sm">Mã {order.voucherCode}</p> : null}
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {order?.items.map((item) => (
          <li key={item.sku}>
            <p className="font-medium">{item.productName}</p>
            <p className="text-sm text-muted">{item.colorName} · {item.storage} · {item.sku} · x{item.quantity}</p>
          </li>
        ))}
      </ul>
      <form
        className="mt-8 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          void changeOrderStatus(Number(id), selected)
            .then(() => {
              setMessage("Đã cập nhật trạng thái.");
              setStatus("");
              setRevision((value) => value + 1);
            })
            .catch((error: unknown) => {
              setMessage(error instanceof ApiError ? error.message : "Không cập nhật được trạng thái.");
            });
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">Trạng thái</span>
          <MenuSelect
            className="mt-2"
            label="Trạng thái"
            value={selected}
            disabled={order?.status === "Hủy"}
            options={orderStatuses.map((item) => ({ value: item, label: item }))}
            onChange={setStatus}
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40" disabled={order?.status === "Hủy"}>
          Cập nhật
        </button>
      </form>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
      <Link to="/admin/orders" className="mt-6 inline-block text-sm font-medium underline">Về danh sách đơn</Link>
    </section>
  );
}
