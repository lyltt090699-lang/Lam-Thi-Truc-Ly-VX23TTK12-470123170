import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { z } from "zod";
import { changePassword } from "../api/account";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { AccountFrame } from "../components/account/AccountFrame";
import { AuthField } from "../components/auth/AuthField";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự.")
      .regex(/[a-z]/, "Mật khẩu cần chữ thường.")
      .regex(/[A-Z]/, "Mật khẩu cần chữ hoa.")
      .regex(/[0-9]/, "Mật khẩu cần chữ số.")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu cần ký tự đặc biệt."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp.",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
  const { user, ready } = useAuth();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  if (!ready) {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/account/security" }} />;
  }

  async function onSubmit(values: ChangePasswordForm) {
    setMessage("");
    setFormError("");
    try {
      const result = await changePassword(values);
      reset();
      setMessage(result.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const currentMessage = error.errors?.currentPassword?.[0];
        const newMessage = error.errors?.newPassword?.[0];
        const confirmMessage = error.errors?.confirmPassword?.[0];
        if (currentMessage) {
          setError("currentPassword", { message: currentMessage });
        }
        if (newMessage) {
          setError("newPassword", { message: newMessage });
        }
        if (confirmMessage) {
          setError("confirmPassword", { message: confirmMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Bảo mật</h1>
        <form className="account-panel account-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthField label="Mật khẩu hiện tại" type="password" autoComplete="current-password" error={errors.currentPassword?.message} registration={register("currentPassword")} />
          <AuthField label="Mật khẩu mới" type="password" autoComplete="new-password" error={errors.newPassword?.message} registration={register("newPassword")} />
          <AuthField label="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} registration={register("confirmPassword")} />
          {message ? <p className="account-note">{message}</p> : null}
          {formError ? <p className="account-note is-error">{formError}</p> : null}
          <button type="submit" disabled={isSubmitting} className="account-primary">
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </AccountFrame>
  );
}
