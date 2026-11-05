import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { isSaved, setWishlist } from "../../api/wishlist";
import { useAuth } from "../../auth/AuthProvider";

export function SaveProductButton({ productId, compact = false, icon = false }: { productId: number; compact?: boolean; icon?: boolean }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(() => isSaved(productId));
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setSaved(isSaved(productId));
    window.addEventListener("wishlist-changed", sync);
    return () => window.removeEventListener("wishlist-changed", sync);
  }, [productId]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={icon ? "heart-btn" : compact ? "quick-btn" : "w-fit rounded-full border border-line px-4 py-2 text-sm font-medium"}
        aria-pressed={icon ? saved : undefined}
        aria-label={icon ? (saved ? "Đã lưu" : "Yêu thích") : undefined}
        onClick={() => {
          if (!ready) {
            return;
          }

          if (!user) {
            navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
            return;
          }

          void setWishlist(productId, !saved).then(() => {
            setMessage(saved ? "Đã bỏ khỏi yêu thích." : "Đã lưu vào yêu thích.");
          });
        }}
      >
        {icon ? <HeartIcon /> : saved ? "Đã lưu" : compact ? "Lưu" : "Yêu thích"}
      </button>
      {message && !compact && !icon ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
  );
}
