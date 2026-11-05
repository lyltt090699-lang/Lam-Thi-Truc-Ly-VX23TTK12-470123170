import { useState } from "react";
import { Link } from "react-router";
import { formatDateTime } from "../api/checkout";
import { getAdminMessages } from "../api/contact";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function AdminMessagesPage() {
  return (
    <AdminGuard>
      <MessageList />
    </AdminGuard>
  );
}

function MessageList() {
  const [page, setPage] = useState(1);
  const { state, retry } = useRemote(() => getAdminMessages(page), String(page));

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Tin nhắn liên hệ</h1>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" && state.data.items.length === 0 ? <p className="mt-8 text-muted">Chưa có tin nhắn.</p> : null}
      {state.status === "ready" && state.data.items.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
            {state.data.items.map((item) => (
              <li key={item.id} className="p-4">
                <Link to={`/admin/messages/${item.id}`} className="font-medium">
                  {item.fullName}
                  {item.isRead ? "" : " · Chưa đọc"}
                </Link>
                <p className="text-sm text-muted">{item.email} · {formatDateTime(item.createdAt)}</p>
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
