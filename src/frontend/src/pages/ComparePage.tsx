import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ApiError } from "../api/client";
import { catalogImage, formatPrice, getProduct, type ProductDetail } from "../api/catalog";
import { studioPhoto } from "../catalog/studioPhoto";
import { useRemote } from "../catalog/useRemote";
import { clearCompare, readCompare, removeCompare } from "../compare/storage";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function ComparePage() {
  const [slugs, setSlugs] = useState(() => readCompare());

  useEffect(() => {
    const sync = () => setSlugs(readCompare());
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, []);

  const { state, retry } = useRemote(() => loadProducts(slugs), slugs.join("|"));

  if (state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  const products = state.data;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">So sánh sản phẩm</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length > 0 ? `Đang so sánh ${products.length}/3 sản phẩm.` : "So sánh thông số, màu sắc và giá bán."}
          </p>
        </div>
        {products.length > 0 ? (
          <div className="flex items-center gap-3">
            {products.length < 3 ? (
              <Link to="/products" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-paper transition">
                + Thêm sản phẩm
              </Link>
            ) : null}
            <button
              type="button"
              className="text-sm text-muted hover:text-ink underline transition"
              onClick={clearCompare}
            >
              Xóa tất cả
            </button>
          </div>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-line bg-surface p-10 text-center">
          <p className="text-lg font-semibold text-ink">Chưa có sản phẩm nào trong danh sách so sánh</p>
          <p className="mt-2 text-sm text-muted">
            Hãy khám phá các dòng iPhone, Mac, iPad, Apple Watch... và nhấn nút "So sánh" để đặt cạnh nhau.
          </p>
          <div className="mt-6">
            <Link to="/products" className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-neutral-800 transition inline-block">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        </div>
      ) : null}

      {products.length === 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm text-muted">
          <span>Bạn đã chọn 1 sản phẩm. Hãy chọn thêm ít nhất 1 sản phẩm nữa để bắt đầu so sánh chi tiết.</span>
          <Link to="/products" className="font-semibold text-ink underline hover:no-underline">
            + Chọn thêm sản phẩm
          </Link>
        </div>
      ) : null}
      {products.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="p-4 font-medium">Thông tin</th>
                {products.map((product) => (
                  <th key={product.slug} className="p-4 font-medium">
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <th className="p-4 font-medium">Ảnh</th>
                {products.map((product) => {
                  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
                  const photo = studioPhoto(product.slug, product.categorySlug) || (image ? catalogImage(image.imageUrl) : "");
                  return (
                    <td key={product.slug} className="p-4">
                      {photo ? (
                        <img
                          src={photo}
                          alt={image?.altText || product.name}
                          width="120"
                          height="120"
                          loading="lazy"
                          className="media-well size-24 rounded-2xl object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/photos/card-gold.jpg";
                          }}
                        />
                      ) : (
                        <span className="text-muted">Chưa có ảnh</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <CompareRow label="Danh mục" products={products} value={(product) => product.categoryName} />
              <CompareRow label="Mô tả" products={products} value={(product) => product.shortDescription} />
              <CompareRow label="Giá thấp nhất" products={products} value={(product) => priceText(product, "min")} />
              <CompareRow label="Giá cao nhất" products={products} value={(product) => priceText(product, "max")} />
              <CompareRow label="Màu" products={products} value={(product) => unique(product, "colorName")} />
              <CompareRow label="Dung lượng" products={products} value={(product) => unique(product, "storage")} />
              <CompareRow label="Tình trạng" products={products} value={(product) => (product.variants.some((variant) => variant.stockQuantity > 0) ? "Còn hàng" : "Hết hàng")} />
              <tr>
                <th className="p-4 font-medium">Bỏ chọn</th>
                {products.map((product) => (
                  <td key={product.slug} className="p-4">
                    <button type="button" className="text-sm font-medium underline" onClick={() => removeCompare(product.slug)}>
                      Bỏ khỏi so sánh
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function CompareRow({
  label,
  products,
  value,
}: {
  label: string;
  products: ProductDetail[];
  value: (product: ProductDetail) => string;
}) {
  return (
    <tr className="border-b border-line">
      <th className="p-4 font-medium">{label}</th>
      {products.map((product) => (
        <td key={product.slug} className="p-4">
          {value(product)}
        </td>
      ))}
    </tr>
  );
}

function unique(product: ProductDetail, key: "colorName" | "storage") {
  const values = [...new Set(product.variants.map((variant) => variant[key]))];
  return values.length === 0 ? "—" : values.join(", ");
}

function priceText(product: ProductDetail, edge: "min" | "max") {
  const prices = product.variants.map((variant) => variant.price);
  if (prices.length === 0) {
    return "—";
  }

  return formatPrice(edge === "min" ? Math.min(...prices) : Math.max(...prices));
}

async function loadProducts(slugs: string[]) {
  const products: ProductDetail[] = [];
  for (const slug of slugs) {
    try {
      products.push(await getProduct(slug));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        removeCompare(slug);
        continue;
      }

      throw error;
    }
  }

  return products;
}
