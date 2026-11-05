import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { getAdminCategories } from "../api/adminCategories";
import { deleteAdminProduct, getAdminProduct, getAdminProducts, saveAdminProduct, uploadProductImage, type AdminProductDetail, type ProductImageDraft, type ProductVariantDraft } from "../api/adminProducts";
import { formatPrice } from "../api/catalog";
import { ApiError } from "../api/client";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { FilePick } from "../components/ui/FilePick";
import { MenuSelect } from "../components/ui/MenuSelect";

const emptyVariant = (): ProductVariantDraft => ({
  sku: "",
  colorName: "",
  colorHex: "#1d1d1f",
  storage: "",
  price: 0,
  stockQuantity: 0,
  isActive: true,
});

const emptyProduct = (): Omit<AdminProductDetail, "id"> => ({
  categoryId: 0,
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  isFeatured: false,
  isNew: false,
  isActive: true,
  images: [{ imageUrl: "/catalog/iphone.svg", altText: "Sản phẩm", sortOrder: 0, isPrimary: true }],
  variants: [emptyVariant()],
});

export function AdminProductsPage() {
  return (
    <AdminGuard>
      <ProductManager />
    </AdminGuard>
  );
}

function ProductManager() {
  const [params] = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyProduct());
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setQuery(urlQuery);
    setPage(1);
  }, [urlQuery]);

  const key = `${query}|${categoryId}|${sort}|${page}|${notice}`;
  const { state, retry } = useRemote(async () => {
    const [products, categories] = await Promise.all([
      getAdminProducts(query, categoryId, sort, page),
      getAdminCategories("", "", 1, 24),
    ]);
    return { products, categories: categories.items };
  }, key);

  async function edit(id: number) {
    const product = await getAdminProduct(id);
    setEditing(product.id);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isActive: product.isActive,
      images: product.images,
      variants: product.variants,
    });
    setFormError("");
  }

  function updateImage(index: number, patch: Partial<ProductImageDraft>) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => {
        if (patch.isPrimary) {
          return { ...(imageIndex === index ? { ...image, ...patch } : image), isPrimary: imageIndex === index };
        }

        return imageIndex === index ? { ...image, ...patch } : image;
      }),
    }));
  }

  function updateVariant(index: number, patch: Partial<ProductVariantDraft>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant)),
    }));
  }

  async function onUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const uploaded = await uploadProductImage(file);
      setForm((current) => ({
        ...current,
        images: [...current.images, { imageUrl: uploaded.imageUrl, altText: current.name || "Sản phẩm", sortOrder: current.images.length, isPrimary: current.images.length === 0 }],
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không tải được ảnh.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const result = await saveAdminProduct(editing, {
        ...form,
        images: form.images.map((image, index) => ({ ...image, sortOrder: index, altText: image.altText || form.name })),
      });
      setNotice(result.message);
      setEditing(null);
      setForm(emptyProduct());
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không lưu được sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number, name: string) {
    if (!window.confirm(`Xóa sản phẩm ${name}?`)) {
      return;
    }

    try {
      const result = await deleteAdminProduct(id);
      setNotice(result.message);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Không xóa được sản phẩm.");
    }
  }

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Sản phẩm</h1>
      <p className="mt-3 text-muted">Sửa tên, ảnh, biến thể, giá và tồn kho. Sản phẩm đang tắt không hiện trên cửa hàng.</p>
      {notice ? <p className="mt-4 text-sm">{notice}</p> : null}
      <form className="mt-8 grid gap-3 rounded-3xl border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Tên</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-line px-3 py-2" required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Danh mục</span>
            <MenuSelect
              wide
              label="Danh mục"
              value={form.categoryId ? String(form.categoryId) : ""}
              options={[
                { value: "", label: "Chọn danh mục" },
                ...(state.status === "ready" ? state.data.categories.map((category) => ({ value: String(category.id), label: category.name })) : []),
              ]}
              onChange={(next) => setForm({ ...form, categoryId: Number(next) })}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted">Mô tả ngắn</span>
            <input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className="w-full rounded-2xl border border-line px-3 py-2" required />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted">Mô tả</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full rounded-2xl border border-line px-3 py-2" required />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Đang bán</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} />Nổi bật</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(event) => setForm({ ...form, isNew: event.target.checked })} />Hàng mới</label>
        </div>
        <div>
          <p className="text-sm font-medium">Ảnh</p>
          <FilePick onPick={(file) => void onUpload(file)} />
          <ul className="mt-3 flex flex-col gap-2">
            {form.images.map((image, index) => (
              <li key={`${image.imageUrl}-${index}`} className="flex flex-wrap items-center gap-2">
                <input value={image.imageUrl} aria-label="Đường dẫn ảnh" onChange={(event) => updateImage(index, { imageUrl: event.target.value })} className="min-w-48 flex-1 rounded-2xl border border-line px-3 py-2 text-sm" />
                <button type="button" className="text-sm underline" onClick={() => updateImage(index, { isPrimary: true })}>{image.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}</button>
                <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, images: form.images.filter((_, imageIndex) => imageIndex !== index) })}>Xóa ảnh</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Biến thể</p>
            <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, variants: [...form.variants, emptyVariant()] })}>Thêm biến thể</button>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {form.variants.map((variant, index) => (
              <li key={variant.id ?? `new-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-3">
                <input value={variant.sku} aria-label="SKU" placeholder="SKU" onChange={(event) => updateVariant(index, { sku: event.target.value })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <input value={variant.colorName} aria-label="Màu" placeholder="Màu" onChange={(event) => updateVariant(index, { colorName: event.target.value })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <input value={variant.colorHex} aria-label="Mã màu" placeholder="#000000" onChange={(event) => updateVariant(index, { colorHex: event.target.value })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <input value={variant.storage} aria-label="Dung lượng" placeholder="Dung lượng" onChange={(event) => updateVariant(index, { storage: event.target.value })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <input type="number" min="0" value={variant.price} aria-label="Giá" onChange={(event) => updateVariant(index, { price: Number(event.target.value) })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <input type="number" min="0" value={variant.stockQuantity} aria-label="Tồn kho" onChange={(event) => updateVariant(index, { stockQuantity: Number(event.target.value) })} className="rounded-2xl border border-line px-3 py-2 text-sm" />
                <button type="button" className="text-left text-sm underline" onClick={() => setForm({ ...form, variants: form.variants.filter((_, variantIndex) => variantIndex !== index) })}>Xóa biến thể</button>
              </li>
            ))}
          </ul>
        </div>
        {formError ? <p className="text-sm">{formError}</p> : null}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{editing ? "Lưu sửa" : "Thêm sản phẩm"}</button>
          {editing ? <button type="button" className="text-sm underline" onClick={() => { setEditing(null); setForm(emptyProduct()); }}>Hủy sửa</button> : null}
        </div>
      </form>
      <form className="mt-8 flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setQuery(String(data.get("q") ?? "").trim()); setPage(1); }}>
        <input key={query} name="q" defaultValue={query} placeholder="Tìm tên hoặc SKU" aria-label="Tìm sản phẩm quản trị" className="rounded-full border border-line bg-surface px-4 py-2 text-sm" />
        <MenuSelect
          label="Lọc danh mục"
          value={categoryId}
          options={[
            { value: "", label: "Mọi danh mục" },
            ...(state.status === "ready" ? state.data.categories.map((category) => ({ value: String(category.id), label: category.name })) : []),
          ]}
          onChange={(next) => { setCategoryId(next); setPage(1); }}
        />
        <MenuSelect
          label="Sắp xếp sản phẩm"
          value={sort}
          options={[
            { value: "", label: "Mới cập nhật" },
            { value: "name", label: "Tên" },
            { value: "price-asc", label: "Giá tăng" },
            { value: "price-desc", label: "Giá giảm" },
            { value: "stock", label: "Tồn kho thấp" },
          ]}
          onChange={(next) => { setSort(next); setPage(1); }}
        />
        <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm">Tìm</button>
      </form>
      <div className="mt-6">
        {state.status === "ready" ? (
          <>
            <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
              {state.data.products.items.map((product) => (
                <li key={product.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-48 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted">{product.categoryName} · {product.variantCount} biến thể · tồn {product.stockQuantity} · {formatPrice(product.minPrice)} · {product.isActive ? "Đang bán" : "Đang tắt"}</p>
                  </div>
                  <button type="button" className="text-sm font-medium underline" onClick={() => void edit(product.id)}>Sửa</button>
                  <button type="button" className="text-sm font-medium underline" onClick={() => void onDelete(product.id, product.name)}>Xóa</button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <button type="button" className="rounded-full border border-line px-4 py-2 disabled:opacity-40" disabled={state.data.products.page <= 1} onClick={() => setPage(state.data.products.page - 1)}>Trước</button>
              <span>Trang {state.data.products.page} / {Math.max(1, Math.ceil(state.data.products.totalCount / state.data.products.pageSize))}</span>
              <button type="button" className="rounded-full border border-line px-4 py-2 disabled:opacity-40" disabled={state.data.products.page * state.data.products.pageSize >= state.data.products.totalCount} onClick={() => setPage(state.data.products.page + 1)}>Sau</button>
            </div>
          </>
        ) : (
          <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
        )}
      </div>
    </section>
  );
}
