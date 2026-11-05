import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAdminPages, updateAdminPage, type AdminContentPage } from "../api/adminContent";
import { ApiError } from "../api/client";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { AuthField } from "../components/auth/AuthField";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const contentSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề.").max(160, "Tiêu đề tối đa 160 ký tự."),
  body: z.string().trim().min(1, "Nhập nội dung.").max(4000, "Nội dung tối đa 4000 ký tự."),
});

type ContentForm = z.infer<typeof contentSchema>;

export function AdminContentPagesPage() {
  return (
    <AdminGuard>
      <ContentEditor />
    </AdminGuard>
  );
}

function ContentEditor() {
  const { state, retry } = useRemote(getAdminPages, "admin-pages");
  const [selected, setSelected] = useState<AdminContentPage | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Trang nội dung</h1>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <ul className="space-y-2 text-sm">
            {state.data.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  className={selected?.id === page.id ? "font-semibold" : "text-muted"}
                  onClick={() => {
                    setSelected(page);
                    setFormKey((value) => value + 1);
                  }}
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <PageForm
              key={formKey}
              page={selected}
              onSaved={(page) => {
                setSelected(page);
                retry();
              }}
            />
          ) : (
            <p className="text-sm text-muted">Chọn một trang để sửa.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function PageForm({ page, onSaved }: { page: AdminContentPage; onSaved: (page: AdminContentPage) => void }) {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: { title: page.title, body: page.body },
  });

  async function onSubmit(values: ContentForm) {
    setMessage("");
    setFormError("");
    try {
      const saved = await updateAdminPage(page.id, values);
      onSaved(saved);
      setMessage("Đã lưu trang.");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không kết nối được máy chủ.");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted">/{page.slug}</p>
      <AuthField label="Tiêu đề" error={errors.title?.message} registration={register("title")} />
      <label className="block text-left" htmlFor="body">
        <span className="text-sm font-medium">Nội dung</span>
        <textarea id="body" rows={10} className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3" {...register("body")} />
        {errors.body?.message ? <span className="mt-2 block text-sm text-red-700">{errors.body.message}</span> : null}
      </label>
      {message ? <p className="text-sm">{message}</p> : null}
      {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
      <button type="submit" disabled={isSubmitting} className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
        {isSubmitting ? "Đang lưu..." : "Lưu trang"}
      </button>
    </form>
  );
}
