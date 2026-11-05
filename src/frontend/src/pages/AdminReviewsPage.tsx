import { useState } from "react";
import { ApiError } from "../api/client";
import { formatDateTime } from "../api/checkout";
import { deleteReview, getAdminReviews } from "../api/reviews";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { StarRatingDisplay } from "../components/catalog/ProductReviews";

export function AdminReviewsPage() {
  return (
    <AdminGuard>
      <ReviewList />
    </AdminGuard>
  );
}

function ReviewList() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const { state, retry } = useRemote(() => getAdminReviews(applied, page), `${applied}|${page}`);

  async function remove(id: number) {
    setError("");
    try {
      await deleteReview(id);
      retry();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Không kết nối được máy chủ.");
    }
  }

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Đánh giá</h1>
      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied(q.trim());
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">Sản phẩm, khách hoặc nội dung</span>
          <input value={q} onChange={(event) => setQ(event.target.value)} className="mt-2 rounded-2xl border border-line px-4 py-2" />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">Tìm</button>
      </form>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" && state.data.items.length === 0 ? <p className="mt-8 text-muted">Chưa có đánh giá.</p> : null}
      {state.status === "ready" && state.data.items.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
            {state.data.items.map((review) => (
              <li key={review.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{review.productName}</p>
                  <StarRatingDisplay rating={review.rating} size={15} />
                </div>
                <p className="text-sm text-muted mt-0.5">{review.authorName} · {review.email}</p>
                <p className="mt-2 text-sm">{review.comment}</p>
                <p className="mt-2 text-xs text-muted">{formatDateTime(review.createdAt)}</p>
                <button type="button" className="mt-3 text-sm font-medium" onClick={() => void remove(review.id)}>
                  Xóa
                </button>
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
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
