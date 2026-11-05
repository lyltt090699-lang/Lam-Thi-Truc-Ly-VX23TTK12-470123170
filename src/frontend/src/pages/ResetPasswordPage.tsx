import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { resetPassword } from "../api/auth";
import { ApiError } from "../api/client";
import { passwordSchema } from "../auth/passwordSchema";
import { AuthField } from "../components/auth/AuthField";

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp.",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!email || !token) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Liên kết không hợp lệ</h1>
        <p className="mt-4 text-sm text-muted">Hãy tạo lại liên kết từ trang quên mật khẩu.</p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium underline">
          Quên mật khẩu
        </Link>
      </section>
    );
  }

  async function onSubmit(values: ResetForm) {
    setFormError("");
    try {
      const result = await resetPassword({
        email,
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      navigate("/login", { replace: true, state: { notice: result.message } });
    } catch (error) {
      if (error instanceof ApiError) {
        const passwordMessage = error.errors?.password?.[0];
        if (passwordMessage) {
          setError("password", { message: passwordMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <section className="auth-card mx-auto w-full max-w-md">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Đặt lại mật khẩu</h1>
      <p className="mt-3 text-center text-sm text-muted">{email}</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Mật khẩu mới" type="password" autoComplete="new-password" error={errors.password?.message} registration={register("password")} />
        <AuthField label="Nhập lại mật khẩu" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} registration={register("confirmPassword")} />
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Đang lưu..." : "Lưu mật khẩu mới"}
        </button>
      </form>
    </section>
  );
}
