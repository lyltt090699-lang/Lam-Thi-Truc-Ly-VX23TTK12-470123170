import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { catalogImage, formatPrice, getProduct, getProducts, type ProductDetail, type ProductVariant } from "../api/catalog";
import { getReviews } from "../api/reviews";
import { studioPhoto } from "../catalog/studioPhoto";
import { addVariant } from "../cart/storage";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { ProductCard } from "../components/catalog/ProductCard";
import { ProductReviews } from "../components/catalog/ProductReviews";
import { SaveProductButton } from "../components/catalog/SaveProductButton";
import { CompareProductButton } from "../components/catalog/CompareProductButton";

const leads: Record<string, string> = {
  "iphone-16-pro": "Titan. Bền. Đẹp.",
};

const galleries: Record<string, string[]> = {
  "iphone-16-pro": ["/photos/card-gold.jpg", "/photos/card-black.jpg", "/photos/cat-iphone.jpg"],
};

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { state, retry } = useRemote(() => getProduct(slug), slug);

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />;
  }

  return <ProductDetailView key={state.data.slug} product={state.data} />;
}

function ProductDetailView({ product }: { product: ProductDetail }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const photos = galleryOf(product);
  const [imageIndex, setImageIndex] = useState(0);
  const [colorName, setColorName] = useState(product.variants[0]?.colorName ?? "");
  const [storage, setStorage] = useState(product.variants[0]?.storage ?? "");
  const [cartMessage, setCartMessage] = useState("");
  const [tab, setTab] = useState<"overview" | "specs" | "reviews">(() =>
    searchParams.get("tab") === "reviews" ? "reviews" : "overview"
  );

  useEffect(() => {
    if (searchParams.get("tab") === "reviews") {
      setTab("reviews");
      const el = document.querySelector(".detail-tabs");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams]);
  const reviews = useRemote(() => getReviews(product.slug), `detail-reviews-${product.slug}`);
  const summary = reviews.state.status === "ready" ? reviews.state.data : null;
  const colors = uniqueVariants(product.variants, "colorName");
  const storages = product.variants.filter((variant) => variant.colorName === colorName);
  const selected = product.variants.find((variant) => variant.colorName === colorName && variant.storage === storage);
  const photo = photos[imageIndex] ?? photos[0];

  function chooseColor(nextColor: string) {
    setColorName(nextColor);
    const nextStorages = product.variants.filter((variant) => variant.colorName === nextColor);
    if (!nextStorages.some((variant) => variant.storage === storage)) {
      setStorage(nextStorages[0]?.storage ?? "");
    }
  }

  return (
    <article className="detail">
      <p className="listing-crumb">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/category/${product.categorySlug}`}>{product.categoryName}</Link>
        <span aria-hidden="true"> / </span>
        <span>{product.name}</span>
      </p>
      <div className="detail-top">
        <div className="detail-gallery">
          <ul className="detail-thumbs">
            {photos.map((src, index) => (
              <li key={src}>
                <button type="button" className="detail-thumb" aria-label={`${product.name} ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}>
                  <img src={src} alt="" width="72" height="72" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
          {photo ? (
            <img src={photo} alt={product.name} width="900" height="900" loading="lazy" className="detail-shot" />
          ) : (
            <div className="detail-shot detail-empty">Chưa có ảnh</div>
          )}
        </div>
        <div className="detail-buy">
          <h1>{product.name}</h1>
          <p className="detail-lead">{leads[product.slug] ?? product.shortDescription}</p>
          <button
            type="button"
            className="detail-rating w-fit text-left hover:opacity-75 transition cursor-pointer"
            onClick={() => {
              setTab("reviews");
              document.querySelector(".detail-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
            title="Xem và gửi đánh giá"
          >
            <Stars value={summary?.averageRating ?? 0} />
            <span>{summary ? `${summary.averageRating.toFixed(1)} (${summary.count} đánh giá)` : "Đánh giá"}</span>
          </button>
          {selected ? <p className="detail-price">{dong(selected.price)}</p> : null}
          {product.variants.length === 0 || !selected ? (
            <p className="mt-8 text-sm text-muted">Sản phẩm chưa có phiên bản bán.</p>
          ) : (
            <>
              <fieldset className="detail-field">
                <legend>Chọn màu</legend>
                <div className="detail-dots">
                  {colors.map((variant) => (
                    <button key={variant.colorName} type="button" aria-label={variant.colorName} aria-pressed={variant.colorName === colorName} onClick={() => chooseColor(variant.colorName)}>
                      <img src={solidSwatch(variant.colorHex)} alt="" width="22" height="22" loading="lazy" />
                    </button>
                  ))}
                </div>
                <p>{colorName}</p>
              </fieldset>
              <fieldset className="detail-field">
                <legend>Dung lượng</legend>
                <div className="detail-storage">
                  {storages.map((variant) => (
                    <button key={variant.storage} type="button" aria-pressed={variant.storage === storage} onClick={() => setStorage(variant.storage)}>
                      {variant.storage}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="detail-buy-row">
                <button
                  type="button"
                  className="detail-now"
                  disabled={selected.stockQuantity <= 0}
                  onClick={() => {
                    void addVariant(selected.id, 1, selected.stockQuantity).then(() => navigate("/checkout"));
                  }}
                >
                  Mua ngay
                </button>
                <button
                  type="button"
                  className="detail-bag"
                  disabled={selected.stockQuantity <= 0}
                  onClick={() => {
                    void addVariant(selected.id, 1, selected.stockQuantity).then(() => setCartMessage("Đã thêm vào giỏ hàng."));
                  }}
                >
                  Thêm vào giỏ
                </button>
                <SaveProductButton productId={product.id} icon />
                <CompareProductButton slug={product.slug} icon />
              </div>
              {cartMessage ? <p className="text-sm">{cartMessage}</p> : null}
              <p className="detail-stock">{selected.stockQuantity > 0 ? `Còn ${selected.stockQuantity}` : "Hết hàng"} · {selected.sku}</p>
            </>
          )}
          <ul className="detail-trust">
            <li><TrustIcon kind="check" />Hàng Apple chính hãng</li>
            <li><TrustIcon kind="truck" />Giao hàng toàn quốc</li>
            <li><TrustIcon kind="shield" />Bảo hành 12 tháng</li>
          </ul>
        </div>
      </div>

      <div className="detail-tabs" role="tablist">
        <button type="button" aria-pressed={tab === "overview"} onClick={() => setTab("overview")}>Tổng quan</button>
        <button type="button" aria-pressed={tab === "specs"} onClick={() => setTab("specs")}>Thông số</button>
        <button type="button" aria-pressed={tab === "reviews"} onClick={() => setTab("reviews")}>Đánh giá ({summary?.count ?? 0})</button>
      </div>

      {tab === "overview" ? <Overview product={product} /> : null}
      {tab === "specs" ? <Specs product={product} colors={colors} /> : null}
      {tab === "reviews" ? <ProductReviews slug={product.slug} heading={false} /> : null}
      <RelatedProducts slug={product.slug} categorySlug={product.categorySlug} />
    </article>
  );
}

function Overview({ product }: { product: ProductDetail }) {
  const closer = product.slug === "iphone-16-pro" ? "/photos/detail-closer.jpg" : studioPhoto(product.slug, product.categorySlug);
  return (
    <div className="detail-overview">
      <section className="detail-look">
        <p className="nx-kicker">{product.name}</p>
        <h2>Nhìn gần hơn.</h2>
        <p>{product.slug === "iphone-16-pro" ? "Hệ thống camera mới, màn hình sáng hơn và chip A18 Pro. iPhone 16 Pro được thiết kế cho Apple Intelligence." : product.description}</p>
        {closer ? <img src={closer} alt="" width="1200" height="680" loading="lazy" /> : null}
      </section>
      {product.categorySlug === "iphone" ? (
        <section className="detail-camera">
          <div>
            <p className="nx-kicker">Camera</p>
            <h2>Ghi lại từng chi tiết.</h2>
            <p>{product.description}</p>
          </div>
          <div className="detail-camera-photo">
            <img src="/photos/detail-camera.jpg" alt="" width="720" height="420" loading="lazy" />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Specs({ product, colors }: { product: ProductDetail; colors: ProductVariant[] }) {
  const storages = [...new Set(product.variants.map((variant) => variant.storage))];
  return (
    <dl className="detail-specs">
      <div>
        <dt>Danh mục</dt>
        <dd>{product.categoryName}</dd>
      </div>
      <div>
        <dt>Màu sắc</dt>
        <dd>{colors.map((variant) => variant.colorName).join(", ") || "—"}</dd>
      </div>
      <div>
        <dt>Dung lượng</dt>
        <dd>{storages.join(", ") || "—"}</dd>
      </div>
      <div>
        <dt>Phiên bản</dt>
        <dd>{product.variants.length}</dd>
      </div>
      <div>
        <dt>Giá</dt>
        <dd>{product.variants.length > 0 ? formatPrice(Math.min(...product.variants.map((variant) => variant.price))) : "—"}</dd>
      </div>
    </dl>
  );
}

function RelatedProducts({ slug, categorySlug }: { slug: string; categorySlug: string }) {
  const { state } = useRemote(() => getProducts({ categorySlug, pageSize: 8 }), `related-${categorySlug}`);
  if (state.status !== "ready") {
    return null;
  }

  const items = state.data.items.filter((item) => item.slug !== slug).slice(0, 3);
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="detail-related">
      <p className="nx-kicker">Cùng dòng</p>
      <h2>Xem thêm</h2>
      <ul className="listing-grid">
        {items.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="detail-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 20 20" className={star <= Math.round(value) ? "is-on" : undefined}>
          <path d="m10 2.5 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L5.7 16l.9-5L2.9 7.7l5-.6z" />
        </svg>
      ))}
    </span>
  );
}

function TrustIcon({ kind }: { kind: "check" | "truck" | "shield" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === "check" ? <path d="m5 12 5 5L20 7" /> : null}
      {kind === "truck" ? (
        <>
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="17.5" r="1.3" />
          <circle cx="17" cy="17.5" r="1.3" />
        </>
      ) : null}
      {kind === "shield" ? (
        <>
          <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
          <path d="m8.2 12.2 2.5 2.5 5-5.2" />
        </>
      ) : null}
    </svg>
  );
}

function galleryOf(product: ProductDetail) {
  const preset = galleries[product.slug] ?? [];
  if (preset.length > 0) {
    return preset;
  }
  const studio = studioPhoto(product.slug, product.categorySlug);
  const fromDb = product.images.map((image) => catalogImage(image.imageUrl)).filter((url) => url && !url.endsWith(".svg"));
  const photos = [...new Set([...(studio ? [studio] : []), ...fromDb])];
  return photos.length > 0 ? photos : product.images.map((image) => catalogImage(image.imageUrl)).filter(Boolean);
}

function solidSwatch(hex: string) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#d2d2d7";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${safe}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function dong(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function uniqueVariants(variants: ProductVariant[], key: "colorName") {
  const seen = new Set<string>();
  return variants.filter((variant) => {
    const value = variant[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
