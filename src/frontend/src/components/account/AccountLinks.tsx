import { NavLink } from "react-router";

export function AccountLinks() {
  return (
    <nav className="flex flex-wrap gap-4 text-sm">
      <NavLink to="/account" className={({ isActive }) => (isActive ? "font-semibold" : "text-muted")}>
        Hồ sơ
      </NavLink>
      <NavLink to="/account/security" className={({ isActive }) => (isActive ? "font-semibold" : "text-muted")}>
        Bảo mật
      </NavLink>
      <NavLink to="/account/addresses" className={({ isActive }) => (isActive ? "font-semibold" : "text-muted")}>
        Địa chỉ
      </NavLink>
    </nav>
  );
}
