import { getBestsellers } from "../api/catalog";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { ProductCard } from "../components/catalog/ProductCard";

export function BestsellersPage() {
  const { state, retry } = useRemote(() => getBestsellers(), "bestsellers");

  if (state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Bán chạy</h1>
      <p className="mt-3 text-muted">Xếp theo số lượng đã bán trong các đơn chưa hủy.</p>
      {state.data.length === 0 ? (
        <p className="mt-8 text-muted">Chưa có sản phẩm bán chạy.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
              <p className="mt-3 text-sm text-muted">Đã bán {product.soldQuantity}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
