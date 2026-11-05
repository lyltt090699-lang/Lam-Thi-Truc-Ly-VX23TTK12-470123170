import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { catalogImage, getProduct, type ProductDetail } from "../../api/catalog";
import { studioPhoto } from "../../catalog/studioPhoto";
import { clearCompare, readCompare, removeCompare } from "../../compare/storage";

export function CompareFloatingBar() {
  const { pathname } = useLocation();
  const [slugs, setSlugs] = useState(() => readCompare());
  const [products, setProducts] = useState<ProductDetail[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(readCompare());
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, []);

  useEffect(() => {
    if (slugs.length === 0) {
      setProducts([]);
      return;
    }

    let active = true;
    Promise.all(
      slugs.map((slug) =>
        getProduct(slug).catch(() => null)
      )
    ).then((results) => {
      if (active) {
        setProducts(results.filter((item): item is ProductDetail => item !== null));
      }
    });

    return () => {
      active = false;
    };
  }, [slugs]);

  // Don't show floating bar on /compare, checkout, or admin
  if (
    slugs.length === 0 ||
    pathname === "/compare" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] rounded-full border border-line bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all sm:px-5"
      role="region"
      aria-label="Thanh so sánh sản phẩm"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Thumbnails of selected products */}
        <div className="flex items-center -space-x-1 sm:space-x-2">
          {products.map((product) => {
            const img = product.images.find((i) => i.isPrimary) ?? product.images[0];
            const photo = studioPhoto(product.slug, product.categorySlug) || (img ? catalogImage(img.imageUrl) : "");
            return (
              <div
                key={product.slug}
                className="group relative flex size-9 items-center justify-center rounded-full border border-line bg-paper p-0.5 sm:size-10"
                title={product.name}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt={product.name}
                    width="36"
                    height="36"
                    className="size-full rounded-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/photos/card-gold.jpg";
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-muted">SP</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeCompare(product.slug);
                  }}
                  className="absolute -top-1 -right-1 hidden size-4 items-center justify-center rounded-full bg-ink text-[10px] text-white shadow group-hover:flex"
                  title={`Bỏ ${product.name} khỏi so sánh`}
                  aria-label={`Bỏ ${product.name}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex size-9 items-center justify-center rounded-full border border-dashed border-line text-muted text-xs sm:size-10"
              title="Thêm sản phẩm khác để so sánh"
            >
              +
            </div>
          ))}
        </div>

        {/* Info & action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs font-medium text-muted md:inline">
            So sánh ({slugs.length}/3)
          </span>

          <Link
            to="/compare"
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-neutral-800 transition sm:text-sm sm:px-5 sm:py-2"
          >
            <span>So sánh ngay</span>
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-muted hover:text-ink underline px-1 py-1 transition"
            title="Xóa danh sách so sánh"
          >
            Xóa
          </button>
        </div>
      </div>
    </aside>
  );
}
