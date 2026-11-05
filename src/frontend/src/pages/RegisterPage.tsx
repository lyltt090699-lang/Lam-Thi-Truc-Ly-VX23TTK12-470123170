import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { passwordSchema } from "../auth/passwordSchema";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { AuthField } from "../components/auth/AuthField";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Nhập họ tên.").max(100, "Họ tên tối đa 100 ký tự."),
    email: z.string().trim().min(1, "Nhập email.").email("Email không hợp lệ."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp.",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { user, ready, register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (ready && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterForm) {
    setFormError("");
    try {
      await registerAccount(values);
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError) {
        applyFieldErrors(error, setError);
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <section className="auth-card mx-auto w-full max-w-md">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Đăng ký</h1>
      <p className="mt-3 text-center text-sm text-muted">Tạo tài khoản để mua hàng ở các bước sau.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Họ tên" autoComplete="name" error={errors.fullName?.message} registration={register("fullName")} />
        <AuthField label="Email" type="email" autoComplete="email" error={errors.email?.message} registration={register("email")} />
        <AuthField label="Mật khẩu" type="password" autoComplete="new-password" error={errors.password?.message} registration={register("password")} />
        <AuthField label="Nhập lại mật khẩu" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} registration={register("confirmPassword")} />
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-ink underline">
          Đăng nhập
        </Link>
      </p>
    </section>
  );
}

function applyFieldErrors(error: ApiError, setError: (name: keyof RegisterForm, error: { message: string }) => void) {
  const fields: Array<keyof RegisterForm> = ["fullName", "email", "password", "confirmPassword"];
  for (const field of fields) {
    const message = error.errors?.[field]?.[0];
    if (message) {
      setError(field, { message });
    }
  }
}
