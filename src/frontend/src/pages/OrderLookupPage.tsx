import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "../api/client";
import { lookupOrder, type CustomerOrder } from "../api/checkout";
import { AuthField } from "../components/auth/AuthField";
import { OrderSummary } from "../components/orders/OrderSummary";

const lookupSchema = z.object({
  code: z.string().trim().min(1, "Nhập mã đơn."),
  phone: z.string().trim().regex(/^0\d{8,10}$/, "Số điện thoại chưa hợp lệ."),
});

type LookupForm = z.infer<typeof lookupSchema>;

export function OrderLookupPage() {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupForm>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { code: "", phone: "" },
  });

  async function onSubmit(values: LookupForm) {
    setFormError("");
    setOrder(null);
    try {
      setOrder(await lookupOrder(values.code, values.phone));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không kết nối được máy chủ.");
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Tra cứu đơn hàng</h1>
      <p className="mt-3 text-sm text-muted">Nhập mã đơn và số điện thoại đã dùng khi đặt hàng.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Mã đơn" error={errors.code?.message} registration={register("code")} />
        <AuthField label="Số điện thoại" autoComplete="tel" error={errors.phone?.message} registration={register("phone")} />
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-40">
          {isSubmitting ? "Đang tra cứu..." : "Tra cứu"}
        </button>
      </form>
      {order ? (
        <div className="mt-10 rounded-3xl border border-line bg-surface p-5">
          <OrderSummary order={order} />
        </div>
      ) : null}
    </section>
  );
}
