import { Link, useSearchParams } from "react-router";
import { getProducts, type Category, type ProductListItem } from "../../api/catalog";
import { categoryPhoto } from "../../catalog/studioPhoto";
import { useRemote } from "../../catalog/useRemote";
import { MenuSelect } from "../ui/MenuSelect";
import { CatalogStatus } from "./CatalogStatus";
import { ProductCard } from "./ProductCard";

const labels: Record<string, string> = {
  iphone: "iPhone",
  mac: "Mac",
  ipad: "iPad",
  "apple-watch": "Watch",
  airpods: "AirPods",
  accessories: "Phụ kiện",
};

const lines: Record<string, string> = {
  iphone: "Mạnh. Đẹp. Dành cho bạn.",
  mac: "Mạnh mẽ cho việc tiếp theo.",
  ipad: "Linh hoạt. Mạnh. Nhiều điều hơn.",
  "apple-watch": "Khỏe hơn mỗi ngày.",
  airpods: "Âm thanh đi cùng bạn.",
  accessories: "Phụ kiện cho công việc hằng ngày.",
};

const series: Record<string, string[]> = {
  iphone: ["iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13"],
  mac: ["MacBook Air", "MacBook Pro"],
  ipad: ["iPad Air", "iPad Pro"],
  "apple-watch": ["Series 10", "Ultra"],
  airpods: ["AirPods 4", "AirPods Max"],
};

const prices = [
  { id: "", label: "Giá", min: "", max: "" },
  { id: "under-15", label: "Dưới 15.000.000đ", min: "", max: "15000000" },
  { id: "15-25", label: "15–25 triệu", min: "15000000", max: "25000000" },
  { id: "25-35", label: "25–35 triệu", min: "25000000", max: "35000000" },
  { id: "over-35", label: "Trên 35.000.000đ", min: "35000000", max: "" },
];

export function ListingView({ category }: { category: Category }) {
  const [params, setParams] = useSearchParams();
  const seriesQuery = params.get("series") ?? "";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const color = params.get("color") ?? "";
  const storage = params.get("storage") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? "1") || 1;
  const priceId = prices.find((item) => item.min === minPrice && item.max === maxPrice)?.id ?? "";
  const chips = series[category.slug] ?? [];
  const label = labels[category.slug] ?? category.name;
  const key = `${category.slug}|${seriesQuery}|${minPrice}|${maxPrice}|${color}|${storage}|${sort}|${page}`;

  const { state, retry } = useRemote(async () => {
    return getProducts({
      q: seriesQuery,
      categorySlug: category.slug,
      minPrice,
      maxPrice,
      color,
      storage,
      sort: sort === "newest" ? undefined : sort,
      page,
      pageSize: 9,
    });
  }, key);

  function update(next: Record<string, string | null>, resetPage = true) {
    const updated = new URLSearchParams(params);
    for (const [name, value] of Object.entries(next)) {
      if (!value) {
        updated.delete(name);
      } else {
        updated.set(name, value);
      }
    }
    if (resetPage) {
      updated.delete("page");
    }
    setParams(updated);
  }

  const result = state.status === "ready" ? state.data : null;
  const pageCount = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;

  return (
    <section className="listing">
      <p className="listing-crumb">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true"> / </span>
        <span>{label}</span>
      </p>
      <div className="listing-hero">
        <div>
          <h1>{label}</h1>
          <p>{lines[category.slug] ?? category.description}</p>
        </div>
        {category.slug === "iphone" ? (
          <img src="/photos/list-hero.jpg" alt="" width="720" height="360" loading="lazy" />
        ) : categoryPhoto(category.slug) ? (
          <img src={categoryPhoto(category.slug)} alt="" width="720" height="360" loading="lazy" />
        ) : null}
      </div>

      <div className="listing-chips">
        <button type="button" className="listing-chip" aria-pressed={seriesQuery === ""} onClick={() => update({ series: "" })}>
          Tất cả
        </button>
        {chips.map((item) => (
          <button key={item} type="button" className="listing-chip" aria-pressed={seriesQuery === item} onClick={() => update({ series: item })}>
            {item}
          </button>
        ))}
        {category.slug === "iphone" ? (
          <Link to="/category/accessories" className="listing-chip">
            Phụ kiện
          </Link>
        ) : null}
      </div>

      <div className="listing-filters">
        <MenuSelect
          label="Giá"
          value={priceId}
          options={prices.map((item) => ({ value: item.id, label: item.label }))}
          onChange={(next) => {
            const picked = prices.find((item) => item.id === next) ?? prices[0];
            update({ minPrice: picked.min, maxPrice: picked.max });
          }}
        />
        <MenuSelect
          label="Dung lượng"
          value={storage}
          options={[{ value: "", label: "Dung lượng" }, ...(result?.storages.map((item) => ({ value: item, label: item })) ?? [])]}
          onChange={(next) => update({ storage: next })}
        />
        <MenuSelect
          label="Màu"
          value={color}
          options={[{ value: "", label: "Màu" }, ...(result?.colors.map((item) => ({ value: item, label: item })) ?? [])]}
          onChange={(next) => update({ color: next })}
        />
        <MenuSelect
          label="Dòng máy"
          value={seriesQuery}
          options={[{ value: "", label: "Dòng máy" }, ...chips.map((item) => ({ value: item, label: item }))]}
          onChange={(next) => update({ series: next })}
        />
        <MenuSelect
          className="listing-sort"
          label="Sắp xếp"
          value={sort}
          options={[
            { value: "newest", label: "Sắp xếp" },
            { value: "price-asc", label: "Giá tăng dần" },
            { value: "price-desc", label: "Giá giảm dần" },
            { value: "name", label: "Tên" },
          ]}
          onChange={(next) => update({ sort: next === "newest" ? "" : next })}
        />
      </div>

      {result ? (
        result.items.length === 0 ? (
          <CatalogStatus status="empty" />
        ) : (
          <ul className="listing-grid">
            {ordered(result.items, sort).map((product) => (
              <li key={product.id}>
                <ProductCard product={product} listing badge={badgeFor(product)} />
              </li>
            ))}
          </ul>
        )
      ) : state.status === "ready" ? null : (
        <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
      )}

      {result && result.totalCount > 0 ? (
        <nav className="listing-pager" aria-label="Trang">
          {Array.from({ length: pageCount }, (_, index) => {
            const number = index + 1;
            return (
              <button key={number} type="button" aria-current={number === result.page ? "page" : undefined} onClick={() => update({ page: String(number) }, false)}>
                {number}
              </button>
            );
          })}
        </nav>
      ) : null}
    </section>
  );
}

const showcase = ["iphone-16-pro", "iphone-16-pro-max", "iphone-16", "iphone-15", "iphone-15-plus", "iphone-14", "iphone-13", "iphone-se", "iphone-16e"];

function ordered(items: ProductListItem[], sort: string) {
  if (sort !== "newest") {
    return items;
  }
  return [...items].sort((left, right) => showcase.indexOf(left.slug) - showcase.indexOf(right.slug) || left.name.localeCompare(right.name));
}

function badgeFor(product: ProductListItem) {
  if (product.slug === "iphone-16") {
    return "Khuyến mãi";
  }
  if (product.slug === "iphone-16-pro" || product.isNew) {
    return "Mới";
  }
  return "";
}
