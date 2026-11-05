import { useSearchParams } from "react-router";
import { getCategories, getProducts, type Category } from "../../api/catalog";
import { useRemote } from "../../catalog/useRemote";
import { MenuSelect } from "../ui/MenuSelect";
import { CatalogStatus } from "./CatalogStatus";
import { ProductGrid } from "./ProductGrid";

type ProductBrowserProps = {
  title: string;
  description: string;
  categorySlug?: string;
  isNew?: boolean;
  showCategoryFilter?: boolean;
};

export function ProductBrowser({ title, description, categorySlug, isNew, showCategoryFilter }: ProductBrowserProps) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const selectedCategory = categorySlug ?? params.get("category") ?? "";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const color = params.get("color") ?? "";
  const storage = params.get("storage") ?? "";
  const inStock = params.get("inStock") === "1";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? "1") || 1;
  const key = `${title}|${selectedCategory}|${q}|${minPrice}|${maxPrice}|${color}|${storage}|${inStock}|${sort}|${page}|${isNew ?? false}`;

  const { state, retry } = useRemote(async () => {
    const [categories, result] = await Promise.all([
      showCategoryFilter ? getCategories() : Promise.resolve([] as Category[]),
      getProducts({
        q,
        categorySlug: selectedCategory || undefined,
        minPrice,
        maxPrice,
        color,
        storage,
        inStock,
        isNew,
        sort: sort === "newest" ? undefined : sort,
        page,
        pageSize: 6,
      }),
    ]);
    return { categories, result };
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

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{description}</p>
      <form
        key={`${q}|${minPrice}|${maxPrice}`}
        className="filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          update({
            q: String(data.get("q") ?? "").trim(),
            minPrice: String(data.get("minPrice") ?? "").trim(),
            maxPrice: String(data.get("maxPrice") ?? "").trim(),
          });
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block text-muted">Từ khóa</span>
          <input name="q" defaultValue={q} placeholder="Ví dụ: iph" className="w-full rounded-2xl border border-line bg-paper px-3 py-2" />
        </label>
        {showCategoryFilter ? (
          <label className="text-sm">
            <span className="mb-1 block text-muted">Danh mục</span>
            <MenuSelect
              wide
              label="Danh mục"
              value={selectedCategory}
              options={[
                { value: "", label: "Tất cả" },
                ...(state.status === "ready" ? state.data.categories.map((category) => ({ value: category.slug, label: category.name })) : []),
              ]}
              onChange={(next) => update({ category: next })}
            />
          </label>
        ) : null}
        <label className="text-sm">
          <span className="mb-1 block text-muted">Màu</span>
          <MenuSelect
            wide
            label="Màu"
            value={color}
            options={[
              { value: "", label: "Tất cả" },
              ...(state.status === "ready" ? state.data.result.colors.map((item) => ({ value: item, label: item })) : []),
            ]}
            onChange={(next) => update({ color: next })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Dung lượng</span>
          <MenuSelect
            wide
            label="Dung lượng"
            value={storage}
            options={[
              { value: "", label: "Tất cả" },
              ...(state.status === "ready" ? state.data.result.storages.map((item) => ({ value: item, label: item })) : []),
            ]}
            onChange={(next) => update({ storage: next })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Giá từ</span>
          <input name="minPrice" defaultValue={minPrice} inputMode="numeric" className="w-full rounded-2xl border border-line bg-paper px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Giá đến</span>
          <input name="maxPrice" defaultValue={maxPrice} inputMode="numeric" className="w-full rounded-2xl border border-line bg-paper px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Sắp xếp</span>
          <MenuSelect
            wide
            label="Sắp xếp"
            value={sort}
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "price-asc", label: "Giá tăng" },
              { value: "price-desc", label: "Giá giảm" },
              { value: "name", label: "Tên" },
            ]}
            onChange={(next) => update({ sort: next === "newest" ? "" : next })}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(event) => update({ inStock: event.target.checked ? "1" : "" })} />
          Còn hàng
        </label>
        <div className="flex items-end">
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
            Lọc
          </button>
        </div>
      </form>
      <div className="mt-8">
        {state.status === "ready" ? (
          <>
            <p className="mb-4 text-sm text-muted">{state.data.result.totalCount} sản phẩm</p>
            <ProductGrid products={state.data.result.items} />
            <div className="mt-6 flex items-center gap-3 text-sm">
              <button type="button" className="rounded-full border border-line px-4 py-2 disabled:opacity-40" disabled={state.data.result.page <= 1} onClick={() => update({ page: String(state.data.result.page - 1) }, false)}>
                Trước
              </button>
              <span>
                Trang {state.data.result.page} / {Math.max(1, Math.ceil(state.data.result.totalCount / state.data.result.pageSize))}
              </span>
              <button
                type="button"
                className="rounded-full border border-line px-4 py-2 disabled:opacity-40"
                disabled={state.data.result.page * state.data.result.pageSize >= state.data.result.totalCount}
                onClick={() => update({ page: String(state.data.result.page + 1) }, false)}
              >
                Sau
              </button>
            </div>
          </>
        ) : (
          <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
        )}
      </div>
    </section>
  );
}
