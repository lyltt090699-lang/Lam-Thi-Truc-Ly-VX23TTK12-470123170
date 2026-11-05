import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="text-sm text-muted">Đang kiểm tra quyền...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles.includes("Admin")) {
    return (
      <section className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Không có quyền</h1>
        <p className="mt-4 text-muted">Tài khoản khách không vào được khu quản trị.</p>
      </section>
    );
  }

  return children;
}
