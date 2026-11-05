import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router";
import { catalogImage, formatPrice, getProducts, type ProductListItem } from "../../api/catalog";
import { studioPhoto } from "../../catalog/studioPhoto";
import { getWishlist, rememberWishlist, wishlistCount } from "../../api/wishlist";
import { useAuth } from "../../auth/AuthProvider";
import { cartCount, loadCurrentCart, updateVariant } from "../../cart/storage";
import { compareCount } from "../../compare/storage";
import type { Cart } from "../../api/cart";

const categories = [
  { to: "/products", label: "Cửa hàng", end: true },
  { to: "/category/iphone", label: "iPhone", end: false },
  { to: "/category/mac", label: "Mac", end: false },
  { to: "/category/ipad", label: "iPad", end: false },
  { to: "/category/apple-watch", label: "Watch", end: false },
  { to: "/category/airpods", label: "AirPods", end: false },
  { to: "/category/accessories", label: "Phụ kiện", end: false },
];

const moreLinks = [
  { to: "/new", label: "Hàng mới" },
  { to: "/offers", label: "Khuyến mãi" },
  { to: "/bestsellers", label: "Bán chạy" },
  { to: "/compare", label: "So sánh" },
  { to: "/track-order", label: "Theo dõi đơn" },
  { to: "/contact", label: "Liên hệ" },
];

export function Header() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [wish, setWish] = useState(0);
  const [compare, setCompare] = useState(() => compareCount());
  const [count, setCount] = useState(0);

  useEffect(() => {
    const syncWish = () => setWish(wishlistCount());
    const syncCompare = () => setCompare(compareCount());
    window.addEventListener("wishlist-changed", syncWish);
    window.addEventListener("compare-changed", syncCompare);
    return () => {
      window.removeEventListener("wishlist-changed", syncWish);
      window.removeEventListener("compare-changed", syncCompare);
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!user) {
      rememberWishlist([]);
    } else {
      getWishlist()
        .then((wishlist) => rememberWishlist(wishlist.items))
        .catch(() => rememberWishlist([]));
    }
  }, [ready, user]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    let active = true;
    const refresh = () => {
      cartCount()
        .then((value) => {
          if (active) {
            setCount(value);
          }
        })
        .catch(() => {
          if (active) {
            setCount(0);
          }
        });
    };

    refresh();
    window.addEventListener("cart-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("cart-changed", refresh);
    };
  }, [ready, user]);

  useEffect(() => {
    const locked = searchOpen || cartOpen || menuOpen;
    document.body.classList.toggle("overlay-open", locked);
    return () => document.body.classList.remove("overlay-open");
  }, [searchOpen, cartOpen, menuOpen]);

  function closeAll() {
    setSearchOpen(false);
    setCartOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  return (
    <header className="site-header sticky top-0 z-30 border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <button type="button" className="icon-btn inline-flex lg:hidden" aria-label="Mở menu" onClick={() => setMenuOpen(true)}>
          <IconMenu />
        </button>
        <Link to="/" className="nx-logo shrink-0" onClick={closeAll}>
          NEXA
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {categories.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <form
          className="nx-search ml-auto hidden lg:block"
          onSubmit={(event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
            navigate(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
          }}
        >
          <input name="q" placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" />
        </form>
        <div className="flex items-center lg:ml-1">
          <button type="button" className="icon-btn inline-flex lg:hidden" aria-label="Tìm sản phẩm" onClick={() => { setCartOpen(false); setMenuOpen(false); setSearchOpen(true); }}>
            <IconSearch />
          </button>
          <Link
            to="/compare"
            className="icon-btn inline-flex relative"
            title={compare > 0 ? `So sánh (${compare})` : "So sánh"}
            aria-label={compare > 0 ? `So sánh ${compare}` : "So sánh"}
          >
            <IconCompare />
            {compare > 0 ? <span className="count-dot">{compare}</span> : null}
          </Link>
          <Link to="/account/wishlist" className="icon-btn is-wish inline-flex relative" aria-label={wish > 0 ? `Yêu thích ${wish}` : "Yêu thích"}>
            <IconHeart />
            {wish > 0 ? <span className="count-dot">{wish}</span> : null}
          </Link>
          {ready && user ? (
            <div className="relative">
              <button type="button" className="icon-btn inline-flex" aria-label={user.fullName} aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>
                <IconUser />
              </button>
              {accountOpen ? (
                <div className="menu-panel absolute top-11 right-0 w-52 rounded-2xl p-2">
                  <p className="px-3 py-2 text-sm font-medium">{user.fullName}</p>
                  <Link to="/account" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={closeAll}>Tài khoản</Link>
                  <Link to="/account/orders" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={closeAll}>Đơn hàng</Link>
                  <Link to="/account/wishlist" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={closeAll}>Yêu thích</Link>
                  {user.roles.includes("Admin") ? (
                    <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={closeAll}>Quản trị</Link>
                  ) : null}
                  <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-paper" onClick={() => { closeAll(); void logout(); }}>
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className="icon-btn inline-flex" aria-label="Đăng nhập">
              <IconUser />
            </Link>
          )}
          <button type="button" className="icon-btn inline-flex relative" aria-label={count > 0 ? `Giỏ hàng ${count}` : "Giỏ hàng"} onClick={() => { setSearchOpen(false); setMenuOpen(false); setCartOpen(true); }}>
            <IconBag />
            {count > 0 ? <span className="count-dot">{count}</span> : null}
          </button>
        </div>
      </div>
      {searchOpen ? createPortal(<SearchOverlay onClose={() => setSearchOpen(false)} />, document.body) : null}
      {cartOpen ? createPortal(<CartDrawer onClose={() => setCartOpen(false)} />, document.body) : null}
      {menuOpen ? createPortal(
        <MobileMenu
          userName={user?.fullName}
          isAdmin={Boolean(user?.roles.includes("Admin"))}
          compare={compare}
          onLogout={() => void logout()}
          onClose={() => setMenuOpen(false)}
        />,
        document.body,
      ) : null}
    </header>
  );
}

function MobileMenu({
  userName,
  isAdmin,
  compare,
  onLogout,
  onClose,
}: {
  userName?: string;
  isAdmin: boolean;
  compare: number;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mobile-sheet">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Menu</p>
        <button type="button" className="icon-btn inline-flex" aria-label="Đóng menu" onClick={onClose}>
          <IconClose />
        </button>
      </div>
      <nav className="flex flex-col gap-1 text-2xl font-semibold tracking-tight">
        {categories.map((item) => (
          <Link key={item.to} to={item.to} onClick={onClose}>{item.label}</Link>
        ))}
      </nav>
      <nav className="flex flex-col gap-2 text-sm">
        {moreLinks.map((item) => (
          <Link key={item.to} to={item.to} onClick={onClose}>
            {item.label}{item.to === "/compare" && compare > 0 ? ` (${compare})` : ""}
          </Link>
        ))}
        <Link to="/account/wishlist" onClick={onClose}>Yêu thích</Link>
        {userName ? <Link to="/account/orders" onClick={onClose}>Đơn hàng</Link> : null}
        {userName ? <Link to="/account" onClick={onClose}>{userName}</Link> : <Link to="/register" onClick={onClose}>Đăng ký</Link>}
        {isAdmin ? <Link to="/admin" onClick={onClose}>Quản trị</Link> : null}
        {userName ? (
          <button type="button" className="w-fit text-left" onClick={() => { onLogout(); onClose(); }}>
            Đăng xuất
          </button>
        ) : null}
      </nav>
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ProductListItem[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    const handle = window.setTimeout(() => {
      const value = query.trim();
      getProducts(value ? { q: value, pageSize: 6 } : { isFeatured: true, pageSize: 6 })
        .then((result) => {
          if (active) {
            setItems(result.items);
          }
        })
        .catch(() => {
          if (active) {
            setItems([]);
          }
        });
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [query]);

  return (
    <div className="search-scrim" onClick={onClose}>
      <div className="search-panel" role="dialog" aria-label="Tìm sản phẩm" onClick={(event) => event.stopPropagation()}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = query.trim();
            navigate(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
            onClose();
          }}
        >
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm iPhone, Mac, AirPods..."
            aria-label="Tìm sản phẩm"
            className="w-full rounded-full border border-line px-4 py-3 text-base"
          />
        </form>
        <p className="mt-4 px-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">{query.trim() ? "Kết quả" : "Nổi bật"}</p>
        <ul className="mt-2">
          {items.map((product) => (
            <li key={product.id}>
              <Link to={`/products/${product.slug}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-paper" onClick={onClose}>
                {product.primaryImageUrl ? (
                  <img src={catalogImage(product.primaryImageUrl)} alt="" width="48" height="48" loading="lazy" className="media-well size-12 rounded-xl object-contain" />
                ) : null}
                <span>
                  <span className="block text-sm font-medium">{product.name}</span>
                  <span className="block text-xs text-muted">{product.categoryName}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      loadCurrentCart()
        .then((value) => {
          if (active) {
            setCart(value);
          }
        })
        .catch(() => {
          if (active) {
            setCart(null);
          }
        });
    };
    refresh();
    window.addEventListener("cart-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("cart-changed", refresh);
    };
  }, []);

  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer-panel" role="dialog" aria-label="Giỏ hàng" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Giỏ hàng</h2>
          <button type="button" className="icon-btn inline-flex" aria-label="Đóng giỏ hàng" onClick={onClose}>
            <IconClose />
          </button>
        </div>
        {!cart || cart.items.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Giỏ hàng đang trống.</p>
        ) : (
          <ul className="mt-6 flex-1 space-y-4 overflow-auto">
            {cart.items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <img
                  src={studioPhoto(item.productSlug) || (item.imageUrl ? catalogImage(item.imageUrl) : "/photos/phone-studio.jpg")}
                  alt=""
                  width="72"
                  height="72"
                  loading="lazy"
                  className="media-well size-16 rounded-2xl object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/photos/phone-studio.jpg";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted">{item.colorName} · {item.storage}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <label className="text-sm">
                      <span className="sr-only">Số lượng {item.productName}</span>
                      <input
                        type="number"
                        min="1"
                        max={item.stockQuantity}
                        value={item.quantity}
                        className="w-16 rounded-xl border border-line px-2 py-1"
                        onChange={(event) => void updateVariant(item.variantId, Number(event.target.value))}
                      />
                    </label>
                    <p className="text-sm font-medium">{formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto border-t border-line pt-4">
          <p className="flex justify-between text-sm"><span>Tạm tính</span><span className="font-semibold">{formatPrice(cart?.subtotal ?? 0)}</span></p>
          <Link to="/cart" className="hero-cta mt-4 w-full justify-center" onClick={onClose}>Xem giỏ hàng</Link>
        </div>
      </aside>
    </div>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19s-6.2-3.8-8.2-7.4C2.2 9.2 3.2 6.2 6.2 5.6 8 5.2 9.5 6 12 8c2.5-2 4-2.8 5.8-2.4 3 .6 4 3.6 2.4 6-2 3.6-8.2 7.4-8.2 7.4z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c1.4-2.6 3.6-3.7 6.5-3.7s5.1 1.1 6.5 3.7" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8.5h11l-.8 10.2a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h12" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IconCompare() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3.5" width="7.5" height="17" rx="2" />
      <rect x="13.5" y="3.5" width="7.5" height="17" rx="2" />
      <path d="M6.75 17h0.01" />
      <path d="M17.25 17h0.01" />
    </svg>
  );
}
