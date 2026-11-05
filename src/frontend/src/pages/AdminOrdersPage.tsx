import { useState } from "react";
import { Link } from "react-router";
import { formatPrice } from "../api/catalog";
import { formatDateTime } from "../api/checkout";
import { getAdminOrders, orderStatuses } from "../api/adminOrders";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { MenuSelect } from "../components/ui/MenuSelect";

export function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminOrderList />
    </AdminGuard>
  );
}

function AdminOrderList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [applied, setApplied] = useState({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const { state, retry } = useRemote(
    () => getAdminOrders({ q: applied.q, status: applied.status, page }),
    `${applied.q}|${applied.status}|${page}`,
  );

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Đơn hàng</h1>
      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied({ q: q.trim(), status });
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">Mã, tên hoặc số điện thoại</span>
          <input value={q} onChange={(event) => setQ(event.target.value)} className="mt-2 rounded-2xl border border-line px-4 py-2" />
        </label>
        <label className="text-sm">
          <span className="block font-medium">Trạng thái</span>
          <MenuSelect
            className="mt-2"
            label="Trạng thái"
            value={status}
            options={[{ value: "", label: "Tất cả" }, ...orderStatuses.map((item) => ({ value: item, label: item }))]}
            onChange={setStatus}
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">Lọc</button>
      </form>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" && state.data.items.length === 0 ? <p className="mt-8 text-muted">Không có đơn hàng.</p> : null}
      {state.status === "ready" && state.data.items.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
            {state.data.items.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link to={`/admin/orders/${order.id}`} className="font-medium">{order.code}</Link>
                  <p className="text-sm text-muted">{order.customerEmail} · {order.recipientName} · {order.phone}</p>
                  <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
                </div>
                <p className="text-sm">{order.status}</p>
                <p className="font-medium">{formatPrice(order.total)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <button type="button" className="underline disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button>
            <span>Trang {state.data.page}</span>
            <button type="button" className="underline disabled:opacity-40" disabled={page * state.data.pageSize >= state.data.totalCount} onClick={() => setPage((value) => value + 1)}>Sau</button>
          </div>
        </>
      ) : null}
    </section>
  );
}
