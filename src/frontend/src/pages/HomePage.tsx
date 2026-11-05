import { useState } from "react";
import { Link } from "react-router";
import { getCategories, getProducts, type Category, type ProductListItem } from "../api/catalog";
import { categoryPhoto } from "../catalog/studioPhoto";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { ProductCard } from "../components/catalog/ProductCard";

type HomeData = {
  categories: Category[];
  products: ProductListItem[];
};

const categoryOrder = ["iphone", "mac", "ipad", "apple-watch", "airpods", "accessories"];

const categoryLines: Record<string, string> = {
  iphone: "Sáng hơn. Rộng hơn. Cho ngày mai.",
  mac: "Mạnh mẽ cho việc tiếp theo.",
  ipad: "Linh hoạt. Mạnh. Nhiều điều hơn.",
  "apple-watch": "Khỏe hơn mỗi ngày.",
  airpods: "Âm thanh đi cùng bạn.",
  accessories: "Phụ kiện cho công việc hằng ngày.",
};

const categoryLabels: Record<string, string> = {
  iphone: "iPhone",
  mac: "Mac",
  ipad: "iPad",
  "apple-watch": "Watch",
  airpods: "AirPods",
  accessories: "Phụ kiện",
};

const arrivalSlugs = ["iphone-16-pro", "macbook-air", "ipad-pro", "watch-series-10", "airpods-4"];
const sellerSlugs = ["iphone-16", "macbook-air", "ipad-air", "watch-series-10", "airpods-4", "usb-c-cable"];

const slides = [
  {
    slug: "iphone-16-pro",
    kicker: "Mạnh mẽ hơn",
    title: "iPhone 16 Pro",
    lead: "Titan. Thông minh. Vượt một bậc.",
    body: "Chip mạnh hơn, camera chuyên nghiệp và Apple Intelligence. iPhone 16 Pro đưa nhiếp ảnh đi xa hơn.",
    photo: "/photos/hero-cut.png",
    shop: "Mua iPhone 16 Pro",
  },
  {
    slug: "macbook-air",
    kicker: "Nhẹ. Đủ dùng. Của bạn.",
    title: "MacBook Air",
    lead: "Mỏng cho mọi việc bạn làm.",
    body: "Laptop nhẹ cho học tập và làm việc. Chọn màu và dung lượng trước khi đặt.",
    photo: "/photos/laptop-studio.jpg",
    shop: "Mua MacBook Air",
  },
  {
    slug: "watch-ultra",
    kicker: "Dành cho ngoài trời",
    title: "Apple Watch Ultra",
    lead: "Mặt lớn hơn. Ngày dài hơn.",
    body: "Cho những ngày dài ngoài trời, mặt đồng hồ lớn và pin ở lại cùng bạn.",
    photo: "/photos/watch-studio.jpg",
    shop: "Mua Watch Ultra",
  },
];

export function HomePage() {
  const { state, retry } = useRemote<HomeData>(async () => {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ pageSize: 24 }),
    ]);
    return { categories, products: products.items };
  }, "home-nexa-exact");

  if (state.status === "loading" || state.status === "error" || state.status === "missing") {
    return (
      <div className="nx-wrap py-16">
        <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
      </div>
    );
  }

  const bySlug = new Map(state.data.products.map((product) => [product.slug, product]));
  const categories = categoryOrder
    .map((slug) => state.data.categories.find((category) => category.slug === slug))
    .filter((category): category is Category => Boolean(category));
  const arrivals = arrivalSlugs.map((slug) => bySlug.get(slug)).filter((item): item is ProductListItem => Boolean(item));
  const sellers = sellerSlugs.map((slug) => bySlug.get(slug)).filter((item): item is ProductListItem => Boolean(item));

  return (
    <div className="nx-home">
      <Hero />

      <section className="nx-wrap nx-block">
        {categories.length === 0 ? (
          <CatalogStatus status="empty" />
        ) : (
          <ul className="nx-cats">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.slug}`} className="nx-cat">
                  <span>
                    <span className="block text-lg font-semibold">{categoryLabels[category.slug] ?? category.name}</span>
                    <span className="mt-1 block max-w-40 text-sm leading-5 text-muted">{categoryLines[category.slug] ?? category.description}</span>
                    <span className="nx-arrow" aria-hidden="true">→</span>
                  </span>
                  {categoryPhoto(category.slug) ? (
                    <img src={categoryPhoto(category.slug)} alt="" width="280" height="180" loading="lazy" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="nx-wrap nx-block">
        <div className="nx-head">
          <div>
            <p className="nx-kicker">Mới nhất</p>
            <h2 className="nx-title">Hàng mới về</h2>
          </div>
          <Link to="/new" className="nx-more">Xem tất cả →</Link>
        </div>
        <ul className="nx-products">
          {arrivals.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} badge={product.slug === "ipad-pro" ? "Bán chạy" : "Mới"} quiet />
            </li>
          ))}
        </ul>
      </section>

      <section className="nx-cinema">
        <div>
          <p className="nx-kicker nx-kicker-light">Cho ý tưởng lớn hơn</p>
          <h2 className="nx-title text-white">MacBook Pro</h2>
          <p className="mt-3 text-lg text-white">Hiệu năng ấn tượng. Một đẳng cấp riêng.</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            Chip M3 Pro và M3 Max, màn hình Liquid Retina XDR và pin cả ngày. MacBook Pro sẵn sàng cho việc bạn nghĩ tới.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to="/products/macbook-pro" className="nx-btn nx-btn-light">Mua MacBook Pro →</Link>
            <Link to="/products/macbook-pro" className="nx-more nx-more-light">Xem thêm</Link>
          </div>
        </div>
        <img src="/photos/laptop-dark.jpg" alt="" width="960" height="540" loading="lazy" />
      </section>

      <section className="nx-wrap nx-block">
        <div className="nx-head">
          <div>
            <p className="nx-kicker">Khách hay chọn</p>
            <h2 className="nx-title">Bán chạy</h2>
          </div>
          <Link to="/bestsellers" className="nx-more">Xem tất cả →</Link>
        </div>
        <ul className="nx-products nx-products-6">
          {sellers.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} quiet />
            </li>
          ))}
        </ul>
      </section>

      <section className="nx-wrap nx-block">
        <div className="nx-eco">
          <div>
            <p className="nx-kicker">Kết nối hơn</p>
            <h2 className="nx-title">Hệ sinh thái Apple</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">Nhiều thiết bị. Một trải nghiệm liền mạch. Mọi thứ hoạt động cùng nhau.</p>
            <Link to="/products" className="nx-more mt-6 inline-block">Khám phá hệ sinh thái →</Link>
          </div>
          <img src="/photos/eco-scene.jpg" alt="" width="720" height="400" loading="lazy" className="nx-eco-shot" />
          <ul className="nx-points">
            <li>
              <strong>Handoff</strong>
              <span>Làm tiếp từ chỗ vừa dừng.</span>
            </li>
            <li>
              <strong>Universal Control</strong>
              <span>Một bàn phím cho mọi thiết bị.</span>
            </li>
            <li>
              <strong>Continuity</strong>
              <span>Thiết kế để dùng cùng nhau.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="nx-wrap">
        <ul className="nx-trust">
          <li>
            <TrustIcon kind="shield" />
            <span><strong>Hàng chính hãng</strong><span>Sản phẩm Apple nguyên bản.</span></span>
          </li>
          <li>
            <TrustIcon kind="warranty" />
            <span><strong>Bảo hành Apple</strong><span>Bảo hành của nhà sản xuất.</span></span>
          </li>
          <li>
            <TrustIcon kind="delivery" />
            <span><strong>Giao hàng toàn quốc</strong><span>Phí ship 30.000đ mỗi đơn.</span></span>
          </li>
          <li>
            <TrustIcon kind="support" />
            <span><strong>Hỗ trợ tận tình</strong><span>Được giải đáp khi cần.</span></span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <section className="nx-hero">
      <div>
        <p className="nx-kicker">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p className="nx-lead">{slide.lead}</p>
        <p className="nx-body">{slide.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link to={`/products/${slide.slug}`} className="nx-btn">{slide.shop} →</Link>
          <Link to={`/products/${slide.slug}`} className="nx-more">Xem thêm</Link>
        </div>
      </div>
      <img src={slide.photo} alt="" width="980" height="640" loading="lazy" className="nx-hero-photo" />
      <div className="nx-pager">
        {slides.map((item, itemIndex) => (
          <button key={item.slug} type="button" aria-label={item.title} aria-pressed={itemIndex === index} onClick={() => setIndex(itemIndex)}>
            {String(itemIndex + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </section>
  );
}

function TrustIcon({ kind }: { kind: "shield" | "warranty" | "delivery" | "support" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === "shield" ? (
        <>
          <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      ) : null}
      {kind === "warranty" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 1.5" />
        </>
      ) : null}
      {kind === "delivery" ? (
        <>
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="17.5" r="1.4" />
          <circle cx="17" cy="17.5" r="1.4" />
        </>
      ) : null}
      {kind === "support" ? (
        <>
          <path d="M4 12a8 8 0 0 1 16 0" />
          <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" />
          <path d="M20 12v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
          <path d="M12 18v1.5a1.5 1.5 0 0 0 1.5 1.5H15" />
        </>
      ) : null}
    </svg>
  );
}
