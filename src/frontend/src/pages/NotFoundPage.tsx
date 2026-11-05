import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Không tìm thấy trang</h1>
      <p className="mt-4 text-muted">Địa chỉ này chưa có trong cửa hàng.</p>
      <Link to="/" className="mt-8 inline-block text-sm font-medium underline">
        Về trang chủ
      </Link>
    </section>
  );
}
