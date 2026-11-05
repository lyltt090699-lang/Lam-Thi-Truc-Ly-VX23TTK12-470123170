import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "../api/client";
import { sendContact } from "../api/contact";
import { AuthField } from "../components/auth/AuthField";

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Nhập họ tên.").max(100, "Họ tên tối đa 100 ký tự."),
  email: z.string().trim().min(1, "Nhập email.").email("Email không hợp lệ."),
  phone: z.string().trim().refine((value) => value === "" || /^0\d{8,10}$/.test(value), "Số điện thoại chưa hợp lệ."),
  message: z.string().trim().min(1, "Nhập nội dung.").max(2000, "Nội dung tối đa 2000 ký tự."),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactPage() {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: ContactForm) {
    setMessage("");
    setFormError("");
    try {
      const result = await sendContact(values);
      reset();
      setMessage(result.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const nameMessage = error.errors?.fullName?.[0];
        const emailMessage = error.errors?.email?.[0];
        const phoneMessage = error.errors?.phone?.[0];
        const bodyMessage = error.errors?.message?.[0];
        if (nameMessage) {
          setError("fullName", { message: nameMessage });
        }
        if (emailMessage) {
          setError("email", { message: emailMessage });
        }
        if (phoneMessage) {
          setError("phone", { message: phoneMessage });
        }
        if (bodyMessage) {
          setError("message", { message: bodyMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Liên hệ</h1>
      <p className="mt-3 text-sm text-muted">Gửi câu hỏi cho cửa hàng. Tin nhắn được lưu để admin đọc.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Họ tên" autoComplete="name" error={errors.fullName?.message} registration={register("fullName")} />
        <AuthField label="Email" type="email" autoComplete="email" error={errors.email?.message} registration={register("email")} />
        <AuthField label="Số điện thoại" autoComplete="tel" error={errors.phone?.message} registration={register("phone")} />
        <label className="block text-left" htmlFor="message">
          <span className="text-sm font-medium">Nội dung</span>
          <textarea id="message" rows={5} className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3" {...register("message")} />
          {errors.message?.message ? <span className="mt-2 block text-sm text-red-700">{errors.message.message}</span> : null}
        </label>
        {message ? <p className="text-sm">{message}</p> : null}
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
        </button>
      </form>
    </section>
  );
}
