import { Link } from "react-router";
import { catalogImage, formatPrice, type ProductListItem } from "../../api/catalog";
import { studioPhoto } from "../../catalog/studioPhoto";
import { CompareProductButton } from "./CompareProductButton";
import { SaveProductButton } from "./SaveProductButton";

const swatches: Record<string, string[]> = {
  "iphone-16": ["#1d1d1f", "#3d4c8a"],
  "iphone-16-pro": ["#c2b8ae", "#c2a98a", "#f5f5f7"],
  "ipad-air": ["#6e8ca0", "#6b5b95"],
  "ipad-pro": ["#e3e4e5", "#2b2b2b"],
  "macbook-air": ["#2c3642", "#f0e6d8"],
  "macbook-pro": ["#2b2b2b", "#e3e4e5"],
  "watch-series-10": ["#1a1a1a", "#e6c2b0"],
  "watch-ultra": ["#d7c4a3", "#1d1d1f"],
  "airpods-4": ["#f5f5f7"],
  "airpods-max": ["#2c3642", "#f0e6d8"],
  "usb-c-cable": ["#f5f5f7"],
  "silicone-case": ["#1d1d1f", "#7f9db3"],
};

const names: Record<string, string> = {
  "usb-c-cable": "USB-C Cable",
  "silicone-case": "Silicone Case",
};

export function ProductCard({ product, badge, quiet = false, listing = false }: { product: ProductListItem; badge?: string; quiet?: boolean; listing?: boolean }) {
  const name = names[product.slug] ?? product.name;
  const image = studioPhoto(product.slug, product.categorySlug) || catalogImage(product.primaryImageUrl);
  const label = badge ?? (product.isNew ? "Mới" : "");
  const dots = swatches[product.slug] ?? [];

  return (
    <article className={listing ? "product-card listing-card" : "product-card"}>
      <Link to={`/products/${product.slug}`} className="product-media">
        {label ? <span className={label === "Bán chạy" ? "badge-new badge-seller" : label === "Khuyến mãi" ? "badge-new badge-promo" : "badge-new"}>{label}</span> : null}
        {image ? (
          <img src={image} alt={name} width="480" height="480" loading="lazy" className="product-shot" />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-muted">Chưa có ảnh</div>
        )}
      </Link>
      {listing ? (
        <>
          <CompareProductButton slug={product.slug} icon />
          <SaveProductButton productId={product.id} icon />
        </>
      ) : quiet ? null : (
        <div className="product-actions">
          <SaveProductButton productId={product.id} compact />
          <CompareProductButton slug={product.slug} compact />
        </div>
      )}
      <div className="product-meta">
        <h2 className="text-sm font-semibold tracking-tight">
          <Link to={`/products/${product.slug}`}>{name}</Link>
        </h2>
        <p className="text-sm text-muted">{listing ? `${new Intl.NumberFormat("vi-VN").format(product.minPrice)}đ` : product.minPrice === product.maxPrice ? formatPrice(product.minPrice) : `Từ ${formatPrice(product.minPrice)}`}</p>
        {!listing && dots.length > 0 ? (
          <span className="nx-dots">
            {dots.map((color) => (
              <img key={color} src={dot(color)} alt="" width="10" height="10" loading="lazy" />
            ))}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function dot(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="${color}" stroke="#d9d9d9" stroke-width="0.6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
