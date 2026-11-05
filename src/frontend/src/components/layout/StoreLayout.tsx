import { Outlet, useLocation } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import { AdminSidebar } from "../admin/AdminSidebar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { CompareFloatingBar } from "../catalog/CompareFloatingBar";

export function StoreLayout() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith("/admin");
  const checkout = pathname === "/checkout" || pathname.startsWith("/checkout/success");
  const home = pathname === "/";

  if (admin) {
    return (
      <div className="admin-app">
        <AdminSidebar />
        <div className="admin-main">
          <AdminTop />
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={home ? "flex-1" : checkout ? "checkout-main" : "mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"}>
        <Outlet />
      </main>
      {checkout ? null : <Footer />}
      <CompareFloatingBar />
    </div>
  );
}

function AdminTop() {
  const { user } = useAuth();
  const name = user?.fullName || "Quản trị";
  const initial = name.trim().charAt(0).toUpperCase() || "Q";

  return (
    <div className="admin-top">
      <p className="admin-user">
        <span className="admin-avatar" aria-hidden="true">{initial}</span>
        {name}
      </p>
    </div>
  );
}
