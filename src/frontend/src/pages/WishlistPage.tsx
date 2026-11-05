import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getWishlist } from "../api/wishlist";
import { useAuth } from "../auth/AuthProvider";
import { useRemote } from "../catalog/useRemote";
import { AccountFrame } from "../components/account/AccountFrame";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { ProductCard } from "../components/catalog/ProductCard";

export function WishlistPage() {
  const { user, ready } = useAuth();
  const [revision, setRevision] = useState(0);
  const { state, retry } = useRemote(
    () => (ready && user ? getWishlist() : Promise.resolve({ items: [] })),
    `${ready}|${user?.email ?? ""}|${revision}`,
  );

  useEffect(() => {
    const sync = () => setRevision((value) => value + 1);
    window.addEventListener("wishlist-changed", sync);
    return () => window.removeEventListener("wishlist-changed", sync);
  }, []);

  if (!ready || state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/account/wishlist" }} />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Yêu thích</h1>
        {state.data.items.length === 0 ? (
          <p className="order-empty">Chưa có sản phẩm yêu thích.</p>
        ) : (
          <ul className="account-grid">
            {state.data.items.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} listing />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountFrame>
  );
}
