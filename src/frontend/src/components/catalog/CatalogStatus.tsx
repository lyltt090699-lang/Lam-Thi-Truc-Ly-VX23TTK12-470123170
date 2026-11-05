import { Link } from "react-router";

type CatalogStatusProps = {
  status: "loading" | "empty" | "missing" | "error";
  message?: string;
  onRetry?: () => void;
};

export function CatalogStatus({ status, message, onRetry }: CatalogStatusProps) {
  if (status === "loading") {
    return (
      <div className="skeleton-stack" role="status" aria-label="Đang tải">
        <span className="skeleton-bar" />
        <span className="skeleton-bar" />
        <span className="skeleton-bar" />
      </div>
    );
  }

  if (status === "empty") {
    return <p className="text-sm text-muted">Chưa có sản phẩm trong mục này.</p>;
  }

  if (status === "missing") {
    return (
      <section className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">Không tìm thấy</h1>
        <p className="mt-4 text-muted">{message ?? "Nội dung này không còn trên cửa hàng."}</p>
        <Link to="/products" className="mt-8 inline-block text-sm font-medium underline">
          Xem tất cả sản phẩm
        </Link>
      </section>
    );
  }

  return (
    <div role="alert">
      <p className="text-sm text-ink">{message ?? "Không tải được dữ liệu."}</p>
      {onRetry ? (
        <button type="button" className="mt-4 text-sm font-medium underline" onClick={onRetry}>
          Thử lại
        </button>
      ) : null}
    </div>
  );
}
