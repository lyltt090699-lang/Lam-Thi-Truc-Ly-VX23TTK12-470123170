import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider";

const links = [
  { to: "/admin", label: "Tổng quan", end: true, icon: "home" },
  { to: "/admin/products", label: "Sản phẩm", end: false, icon: "box" },
  { to: "/admin/categories", label: "Danh mục", end: false, icon: "grid" },
  { to: "/admin/orders", label: "Đơn hàng", end: false, icon: "bag" },
  { to: "/admin/customers", label: "Khách hàng", end: false, icon: "users" },
  { to: "/admin/reviews", label: "Đánh giá", end: false, icon: "star" },
  { to: "/admin/vouchers", label: "Mã giảm giá", end: false, icon: "tag" },
  { to: "/admin/pages", label: "Trang nội dung", end: false, icon: "file" },
  { to: "/admin/messages", label: "Tin nhắn", end: false, icon: "mail" },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/admin/products?q=${encodeURIComponent(value)}` : "/admin/products");
  }

  return (
    <aside className="admin-side">
      <p className="admin-brand">NEXA <span>Quản trị</span></p>
      <form className="admin-search" onSubmit={onSearch}>
        <SearchIcon />
        <input aria-label="Tìm sản phẩm" placeholder="Tìm kiếm..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </form>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          <SideIcon name={link.icon} />
          {link.label}
        </NavLink>
      ))}
      <button type="button" className="admin-logout" onClick={() => void logout()}>
        <SideIcon name="out" />
        Đăng xuất
      </button>
    </aside>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function SideIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "home" ? <path d="M4 11l8-7 8 7v8H4z" /> : null}
      {name === "box" ? <path d="M4 8l8-4 8 4-8 4zm0 0v8l8 4 8-4V8" /> : null}
      {name === "grid" ? <path d="M5 5h6v6H5zm8 0h6v6h-6zM5 13h6v6H5zm8 0h6v6h-6z" /> : null}
      {name === "bag" ? <path d="M6 8h12l-1 12H7zm3 0a3 3 0 0 1 6 0" /> : null}
      {name === "users" ? <path d="M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5M4 19a4 4 0 0 1 8 0m2 0a3.5 3.5 0 0 1 6 0" /> : null}
      {name === "star" ? <path d="M12 4l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" /> : null}
      {name === "tag" ? <path d="M4 12l8-8h7v7l-8 8zM16 8h.01" /> : null}
      {name === "file" ? <path d="M7 4h7l5 5v11H7zM14 4v5h5" /> : null}
      {name === "mail" ? <path d="M4 7h16v10H4zm0 0l8 6 8-6" /> : null}
      {name === "out" ? <path d="M10 6H6v12h4M10 12h8m0 0l-3-3m3 3l-3 3" /> : null}
    </svg>
  );
}
