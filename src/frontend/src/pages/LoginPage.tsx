import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { AuthField } from "../components/auth/AuthField";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Nhập email.").email("Email không hợp lệ."),
  password: z.string().min(1, "Nhập mật khẩu."),
});

type LoginForm = z.infer<typeof loginSchema>;

function returnPath(state: unknown) {
  const from = (state as { from?: string } | null)?.from;
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }

  return "/";
}

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice ?? "";
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = returnPath(location.state);
  if (ready && user) {
    return <Navigate to={user.roles.includes("Admin") ? "/admin" : from} replace />;
  }

  async function onSubmit(values: LoginForm) {
    setFormError("");
    try {
      const current = await login(values);
      navigate(current.roles.includes("Admin") ? "/admin" : from);
    } catch (error) {
      if (error instanceof ApiError) {
        const emailMessage = error.errors?.email?.[0];
        const passwordMessage = error.errors?.password?.[0];
        if (emailMessage) {
          setError("email", { message: emailMessage });
        }
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
      <h1 className="text-center text-3xl font-semibold tracking-tight">Đăng nhập</h1>
      <p className="mt-3 text-center text-sm text-muted">Dùng email đã đăng ký.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Email" type="email" autoComplete="email" error={errors.email?.message} registration={register("email")} />
        <AuthField label="Mật khẩu" type="password" autoComplete="current-password" error={errors.password?.message} registration={register("password")} />
        <p className="text-right text-sm">
          <Link to="/forgot-password" className="font-medium text-ink underline">
            Quên mật khẩu?
          </Link>
        </p>
        {notice ? <p className="text-sm text-ink">{notice}</p> : null}
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-medium text-ink underline">
          Đăng ký
        </Link>
      </p>
    </section>
  );
}
