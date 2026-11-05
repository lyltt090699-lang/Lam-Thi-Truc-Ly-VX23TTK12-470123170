import type { ProductListItem } from "../../api/catalog";
import { CatalogStatus } from "./CatalogStatus";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return <CatalogStatus status="empty" />;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
