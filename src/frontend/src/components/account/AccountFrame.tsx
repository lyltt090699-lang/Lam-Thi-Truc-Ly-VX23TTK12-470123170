import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider";

const links = [
  { to: "/account", label: "Tổng quan", end: true, icon: "grid" },
  { to: "/account/orders", label: "Đơn hàng", end: false, icon: "bag" },
  { to: "/account/wishlist", label: "Yêu thích", end: false, icon: "heart" },
  { to: "/account/addresses", label: "Địa chỉ", end: false, icon: "pin" },
  { to: "/account/profile", label: "Thông tin cá nhân", end: true, icon: "user" },
  { to: "/account/security", label: "Bảo mật", end: false, icon: "lock" },
] as const;

export function AccountFrame({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.fullName ?? "";
  const initial = name.trim().charAt(0).toUpperCase() || "N";

  return (
    <div className="account-shell">
      <aside className="account-side">
        <div className="account-person">
          <span className="account-avatar">{initial}</span>
          <span>
            <strong>{name}</strong>
            <small>{user?.email}</small>
          </span>
        </div>
        <nav className="account-nav">
          {links.map((link) => (
            <NavLink key={link.label} to={link.to} end={link.end} className={({ isActive }) => [link.icon === "heart" ? "is-wish" : "", isActive ? "is-active" : ""].filter(Boolean).join(" ") || undefined}>
              <SideIcon kind={link.icon} />
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              void logout().then(() => navigate("/"));
            }}
          >
            <SideIcon kind="out" />
            Đăng xuất
          </button>
        </nav>
      </aside>
      <div className="account-main">{children}</div>
    </div>
  );
}

function SideIcon({ kind }: { kind: "grid" | "bag" | "heart" | "pin" | "user" | "lock" | "out" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === "grid" ? <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /> : null}
      {kind === "bag" ? <path d="M6 8h12l-1 12H7zM9 8V7a3 3 0 0 1 6 0v1" /> : null}
      {kind === "heart" ? <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" /> : null}
      {kind === "pin" ? <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /> : null}
      {kind === "user" ? <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM5 20a7 7 0 0 1 14 0" /> : null}
      {kind === "lock" ? <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /> : null}
      {kind === "out" ? <path d="M10 7V5H5v14h5v-2M10 12h9M16 9l3 3-3 3" /> : null}
    </svg>
  );
}
