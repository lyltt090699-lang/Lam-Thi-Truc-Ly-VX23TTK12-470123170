import { useState, type FormEvent } from "react";
import { catalogImage } from "../api/catalog";
import { deleteAdminCategory, getAdminCategories, saveAdminCategory, type AdminCategory, type CategoryWrite } from "../api/adminCategories";
import { ApiError } from "../api/client";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { MenuSelect } from "../components/ui/MenuSelect";

const emptyForm: CategoryWrite = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "/catalog/accessories.svg",
  displayOrder: 10,
  isActive: true,
};

export function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <CategoryManager />
    </AdminGuard>
  );
}

function CategoryManager() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryWrite>(emptyForm);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const key = `${query}|${sort}|${page}|${notice}`;
  const { state, retry } = useRemote(() => getAdminCategories(query, sort, page), key);

  function edit(category: AdminCategory) {
    setEditing(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setFormError("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const result = await saveAdminCategory(editing, form);
      setNotice(result.message);
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không lưu được danh mục.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(category: AdminCategory) {
    if (!window.confirm(`Xóa danh mục ${category.name}?`)) {
      return;
    }

    try {
      const result = await deleteAdminCategory(category.id);
      setNotice(result.message);
      if (editing === category.id) {
        setEditing(null);
        setForm(emptyForm);
      }
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Không xóa được danh mục.");
    }
  }

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Danh mục</h1>
      <p className="mt-3 text-muted">Thêm, sửa, tắt hoặc xóa danh mục. Danh mục còn sản phẩm thì không xóa được.</p>
      {notice ? <p className="mt-4 text-sm">{notice}</p> : null}
      <form className="mt-8 grid gap-3 rounded-3xl border border-line bg-surface p-4 sm:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Tên</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-line px-3 py-2" required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Đường dẫn</span>
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Để trống để tự tạo" className="w-full rounded-2xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Mô tả</span>
          <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-2xl border border-line px-3 py-2" required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Ảnh</span>
          <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className="w-full rounded-2xl border border-line px-3 py-2" required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Thứ tự</span>
          <input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} className="w-full rounded-2xl border border-line px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Đang bán
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
            {editing ? "Lưu sửa" : "Thêm danh mục"}
          </button>
          {editing ? (
            <button type="button" className="text-sm underline" onClick={() => { setEditing(null); setForm(emptyForm); }}>
              Hủy sửa
            </button>
          ) : null}
        </div>
        {formError ? <p className="text-sm sm:col-span-2">{formError}</p> : null}
      </form>
      <form
        className="mt-8 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setQuery(String(data.get("q") ?? "").trim());
          setPage(1);
        }}
      >
        <input name="q" defaultValue={query} placeholder="Tìm tên hoặc đường dẫn" aria-label="Tìm danh mục" className="rounded-full border border-line bg-surface px-4 py-2 text-sm" />
        <MenuSelect
          label="Sắp xếp danh mục"
          value={sort}
          options={[
            { value: "", label: "Thứ tự hiển thị" },
            { value: "name", label: "Tên" },
            { value: "name-desc", label: "Tên giảm" },
          ]}
          onChange={(next) => { setSort(next); setPage(1); }}
        />
        <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm">Tìm</button>
      </form>
      <div className="mt-6">
        {state.status === "ready" ? (
          <>
            <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
              {state.data.items.length === 0 ? <li className="p-4 text-sm text-muted">Chưa có danh mục khớp bộ lọc.</li> : null}
              {state.data.items.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center gap-4 p-4">
                  <img src={catalogImage(category.imageUrl)} alt="" width="48" height="48" loading="lazy" className="media-well size-12 rounded-2xl object-contain" />
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted">{category.slug} · {category.productCount} sản phẩm · {category.isActive ? "Đang bán" : "Đang tắt"}</p>
                  </div>
                  <button type="button" className="text-sm font-medium underline" onClick={() => edit(category)}>Sửa</button>
                  <button type="button" className="text-sm font-medium underline" onClick={() => void onDelete(category)}>Xóa</button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <button type="button" className="rounded-full border border-line px-4 py-2 disabled:opacity-40" disabled={state.data.page <= 1} onClick={() => setPage(state.data.page - 1)}>Trước</button>
              <span>Trang {state.data.page}</span>
              <button type="button" className="rounded-full border border-line px-4 py-2 disabled:opacity-40" disabled={state.data.page * state.data.pageSize >= state.data.totalCount} onClick={() => setPage(state.data.page + 1)}>Sau</button>
            </div>
          </>
        ) : (
          <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />
        )}
      </div>
    </section>
  );
}
