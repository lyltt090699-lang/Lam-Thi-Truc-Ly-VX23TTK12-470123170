import { useState } from "react";
import { formatDateTime } from "../api/checkout";
import { getAdminCustomers } from "../api/adminCustomers";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function AdminCustomersPage() {
  return (
    <AdminGuard>
      <CustomerList />
    </AdminGuard>
  );
}

function CustomerList() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const { state, retry } = useRemote(() => getAdminCustomers(applied, page), `${applied}|${page}`);

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Khách hàng</h1>
      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied(q.trim());
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">Tên hoặc email</span>
          <input value={q} onChange={(event) => setQ(event.target.value)} className="mt-2 rounded-2xl border border-line px-4 py-2" />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">Tìm</button>
      </form>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" && state.data.items.length === 0 ? <p className="mt-8 text-muted">Không có khách hàng.</p> : null}
      {state.status === "ready" && state.data.items.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
            {state.data.items.map((customer) => (
              <li key={customer.id} className="p-4">
                <p className="font-medium">{customer.fullName}</p>
                <p className="text-sm text-muted">{customer.email}{customer.phoneNumber ? ` · ${customer.phoneNumber}` : ""}</p>
                <p className="text-sm text-muted">{formatDateTime(customer.createdAt)}</p>
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
