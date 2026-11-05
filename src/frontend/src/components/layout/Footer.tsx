import { useState } from "react";
import { Link } from "react-router";

export function Footer() {
  const [note, setNote] = useState("");

  return (
    <footer className="site-footer">
      <div className="nx-wrap nx-footer">
        <div>
          <p className="nx-logo">NEXA</p>
          <p className="mt-3 max-w-xs text-sm leading-6">Điểm đến cho sản phẩm Apple. Công nghệ cho ngày mai tươi sáng hơn.</p>
          <div className="nx-social">
            <Link to="/contact" aria-label="Instagram"><SocialIcon kind="instagram" /></Link>
            <Link to="/contact" aria-label="YouTube"><SocialIcon kind="youtube" /></Link>
            <Link to="/contact" aria-label="X"><SocialIcon kind="x" /></Link>
            <Link to="/contact" aria-label="Facebook"><SocialIcon kind="facebook" /></Link>
          </div>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <p className="footer-title mb-1">Cửa hàng</p>
          <Link to="/category/iphone">iPhone</Link>
          <Link to="/category/mac">Mac</Link>
          <Link to="/category/ipad">iPad</Link>
          <Link to="/category/apple-watch">Watch</Link>
          <Link to="/category/airpods">AirPods</Link>
          <Link to="/category/accessories">Phụ kiện</Link>
        </nav>
        <nav className="flex flex-col gap-2 text-sm">
          <p className="footer-title mb-1">Hỗ trợ</p>
          <Link to="/track-order">Theo dõi đơn</Link>
          <Link to="/pages/returns">Đổi trả</Link>
          <Link to="/pages/warranty">Bảo hành</Link>
          <Link to="/pages/help">Trợ giúp</Link>
          <Link to="/contact">Liên hệ</Link>
        </nav>
        <nav className="flex flex-col gap-2 text-sm">
          <p className="footer-title mb-1">Giới thiệu</p>
          <Link to="/pages/story">Câu chuyện</Link>
          <Link to="/pages/how-to-buy">Hướng dẫn mua</Link>
          <Link to="/pages/delivery">Giao hàng</Link>
          <Link to="/pages/privacy">Bảo mật</Link>
          <Link to="/pages/terms">Điều khoản</Link>
        </nav>
        <form
          className="text-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("email") ?? "").trim();
            setNote(value ? "Đã ghi nhận email." : "Nhập email của bạn.");
          }}
        >
          <p className="footer-title">Nhận tin mới</p>
          <p className="mt-2 text-muted">Sản phẩm, ưu đãi và tin tức mới nhất.</p>
          <div className="nx-news">
            <input name="email" type="email" placeholder="Nhập email" aria-label="Email" />
            <button type="submit" aria-label="Đăng ký">→</button>
          </div>
          {note ? <p className="mt-2">{note}</p> : null}
        </form>
      </div>
      <div className="nx-legal">
        <p>© 2026 NEXA. Đã đăng ký bản quyền.</p>
        <p>
          <Link to="/pages/privacy">Bảo mật</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/pages/terms">Điều khoản</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/pages/privacy">Cookie</Link>
        </p>
        <p>Việt Nam (VND)</p>
      </div>
    </footer>
  );
}

function SocialIcon({ kind }: { kind: "instagram" | "youtube" | "x" | "facebook" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === "instagram" ? (
        <>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {kind === "youtube" ? (
        <>
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <path d="m11 10 4 2-4 2z" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {kind === "x" ? <path d="M5 5 19 19M19 5 5 19" /> : null}
      {kind === "facebook" ? <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v6h3v-6h2.2l.8-3H13V9c0-.6.4-1 1-1z" fill="currentColor" stroke="none" /> : null}
    </svg>
  );
}
