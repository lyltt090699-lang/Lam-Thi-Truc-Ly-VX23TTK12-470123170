import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { readCompare, removeCompare, toggleCompare } from "../../compare/storage";

export function CompareProductButton({
  slug,
  compact = false,
  icon = false,
}: {
  slug: string;
  compact?: boolean;
  icon?: boolean;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => readCompare().includes(slug));
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setSelected(readCompare().includes(slug));
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, [slug]);

  function handleAction(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (selected) {
      // Khi đã chọn vào danh sách so sánh, bấm nút sẽ chuyển thẳng qua trang so sánh /compare
      navigate("/compare");
    } else {
      // Chưa chọn thì thêm vào danh sách so sánh
      const res = toggleCompare(slug);
      setMessage(res);
      setSelected(readCompare().includes(slug));
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    removeCompare(slug);
    setSelected(false);
  }

  if (icon) {
    return (
      <button
        type="button"
        className={`compare-icon-btn ${selected ? "is-selected text-ink bg-paper" : "text-muted"}`}
        aria-pressed={selected}
        title={selected ? "Xem trang so sánh" : "Thêm vào so sánh"}
        onClick={handleAction}
      >
        <IconCompare />
      </button>
    );
  }

  if (compact) {
    if (selected) {
      return (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="quick-btn bg-ink text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
            onClick={handleAction}
            title="Đến trang so sánh sản phẩm"
          >
            <span>So sánh</span>
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="quick-btn text-muted hover:text-ink px-2"
            onClick={handleRemove}
            title="Bỏ khỏi so sánh"
            aria-label="Bỏ khỏi so sánh"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="quick-btn hover:bg-paper transition"
        onClick={handleAction}
        title="Thêm vào danh sách so sánh"
      >
        So sánh
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={
            selected
              ? "w-fit rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition flex items-center gap-2"
              : "w-fit rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-paper transition"
          }
          onClick={handleAction}
        >
          {selected ? (
            <>
              <span>Xem so sánh</span>
              <span aria-hidden="true">→</span>
            </>
          ) : (
            "So sánh"
          )}
        </button>
        {selected ? (
          <button
            type="button"
            className="text-xs text-muted hover:text-ink underline"
            onClick={handleRemove}
            title="Bỏ khỏi so sánh"
          >
            Bỏ so sánh
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
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
