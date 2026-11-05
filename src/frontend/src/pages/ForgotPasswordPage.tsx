import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { requestPasswordReset } from "../api/auth";
import { ApiError } from "../api/client";
import { AuthField } from "../components/auth/AuthField";

const forgotSchema = z.object({
  email: z.string().trim().min(1, "Nhập email.").email("Email không hợp lệ."),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotForm) {
    setFormError("");
    setMessage("");
    setResetUrl("");
    try {
      const result = await requestPasswordReset(values.email);
      setMessage(result.message);
      setResetUrl(result.resetUrl ?? "");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không kết nối được máy chủ.");
    }
  }

  return (
    <section className="auth-card mx-auto w-full max-w-md">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Quên mật khẩu</h1>
      <p className="mt-3 text-center text-sm text-muted">
        Đồ án chưa gửi email. Nếu tài khoản tồn tại, liên kết đặt lại hiện ngay trên trang này và trong log backend.
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Email" type="email" autoComplete="email" error={errors.email?.message} registration={register("email")} />
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Đang tạo liên kết..." : "Tạo liên kết đặt lại"}
        </button>
      </form>
      {message ? <p className="mt-6 text-sm text-ink">{message}</p> : null}
      {resetUrl ? (
        <p className="mt-3 break-all text-sm">
          <a href={resetUrl} className="font-medium text-ink underline">
            Mở trang đặt lại mật khẩu
          </a>
        </p>
      ) : null}
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-ink underline">
          Về đăng nhập
        </Link>
      </p>
    </section>
  );
}
