import { useState } from "react";
import { cancelOrder } from "../../api/checkout";
import { ApiError } from "../../api/client";

export function OrderCancelButton({ code, onCancelled }: { code: string; onCancelled: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setBusy(true);
    setError("");
    try {
      await cancelOrder(code);
      onCancelled();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Không kết nối được máy chủ.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="order-cancel" onClick={() => setConfirming(true)}>
        Hủy đơn
      </button>
    );
  }

  return (
    <span className="order-cancel-confirm">
      <span>Hủy đơn này?</span>
      <button type="button" onClick={() => setConfirming(false)} disabled={busy}>
        Giữ đơn
      </button>
      <button type="button" className="is-danger" onClick={() => void cancel()} disabled={busy}>
        {busy ? "Đang hủy..." : "Xác nhận"}
      </button>
      {error ? <span className="account-note is-error">{error}</span> : null}
    </span>
  );
}
