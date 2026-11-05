import { Link, useParams } from "react-router";
import { formatDateTime } from "../api/checkout";
import { getAdminMessage } from "../api/contact";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function AdminMessageDetailPage() {
  return (
    <AdminGuard>
      <MessageDetail />
    </AdminGuard>
  );
}

function MessageDetail() {
  const { id = "" } = useParams();
  const { state, retry } = useRemote(() => getAdminMessage(Number(id)), id);

  return (
    <section>
      <AdminNav />
      <Link to="/admin/messages" className="text-sm font-medium">
        Quay lại tin nhắn
      </Link>
      {state.status !== "ready" ? (
        <div className="mt-8">
          <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
        </div>
      ) : (
        <article className="mt-6 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{state.data.fullName}</h1>
          <p className="mt-3 text-sm text-muted">{state.data.email}{state.data.phone ? ` · ${state.data.phone}` : ""}</p>
          <p className="mt-1 text-sm text-muted">{formatDateTime(state.data.createdAt)}</p>
          <p className="mt-6 leading-7">{state.data.message}</p>
        </article>
      )}
    </section>
  );
}
