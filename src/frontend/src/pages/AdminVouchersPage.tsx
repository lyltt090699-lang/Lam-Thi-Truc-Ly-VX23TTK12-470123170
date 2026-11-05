import { useState } from "react";
import { ApiError } from "../api/client";
import { deleteVoucher, getVouchers, saveVoucher, type Voucher } from "../api/adminVouchers";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const emptyForm = { code: "", description: "", discountPercent: "10", minSubtotal: "0", isActive: true };

export function AdminVouchersPage() {
  return (
    <AdminGuard>
      <VoucherManager />
    </AdminGuard>
  );
}

function VoucherManager() {
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const { state, retry } = useRemote(() => getVouchers(), String(revision));

  function edit(voucher: Voucher) {
    setEditing(voucher);
    setForm({
      code: voucher.code,
      description: voucher.description,
      discountPercent: String(voucher.discountPercent),
      minSubtotal: String(voucher.minSubtotal),
      isActive: voucher.isActive,
    });
    setMessage("");
  }

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Mã giảm giá</h1>
      <form
        className="mt-6 grid gap-3 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          void saveVoucher(
            {
              code: form.code,
              description: form.description,
              discountPercent: Number(form.discountPercent),
              minSubtotal: Number(form.minSubtotal),
              isActive: form.isActive,
            },
            editing?.id,
          )
            .then(() => {
              setMessage(editing ? "Đã cập nhật mã giảm giá." : "Đã thêm mã giảm giá.");
              setEditing(null);
              setForm(emptyForm);
              setRevision((value) => value + 1);
            })
            .catch((error: unknown) => {
              setMessage(error instanceof ApiError ? error.message : "Không lưu được mã giảm giá.");
            });
        }}
      >
        <label className="text-sm">
          <span className="font-medium">Mã</span>
          <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="mt-2 w-full rounded-2xl border border-line px-4 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Mô tả</span>
          <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-line px-4 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Phần trăm giảm</span>
          <input type="number" min="1" max="100" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} className="mt-2 w-full rounded-2xl border border-line px-4 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Đơn tối thiểu</span>
          <input type="number" min="0" value={form.minSubtotal} onChange={(event) => setForm({ ...form, minSubtotal: event.target.value })} className="mt-2 w-full rounded-2xl border border-line px-4 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Đang dùng
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">{editing ? "Lưu" : "Thêm"}</button>
          {editing ? (
            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Hủy sửa
            </button>
          ) : null}
        </div>
      </form>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" ? (
        <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
          {state.data.map((voucher) => (
            <li key={voucher.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{voucher.code}</p>
                <p className="text-sm text-muted">{voucher.description} · {voucher.discountPercent}% · {voucher.isActive ? "Đang dùng" : "Tạm ẩn"}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" className="underline" onClick={() => edit(voucher)}>Sửa</button>
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    void deleteVoucher(voucher.id).then(() => {
                      setMessage("Đã xóa mã giảm giá.");
                      setRevision((value) => value + 1);
                    });
                  }}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
