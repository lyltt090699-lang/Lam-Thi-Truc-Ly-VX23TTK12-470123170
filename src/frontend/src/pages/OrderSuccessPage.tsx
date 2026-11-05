import { Link, useParams } from "react-router";
import { getOrder } from "../api/checkout";
import { useAuth } from "../auth/AuthProvider";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const steps = ["Đã xác nhận", "Đang xử lý", "Đang giao", "Đã nhận"];

export function OrderSuccessPage() {
  const { code = "" } = useParams();
  const { user } = useAuth();
  const { state, retry } = useRemote(() => getOrder(code), code);

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />;
  }

  const order = state.data;
  const cancelled = order.status === "Hủy";
  const current = stepOf(order.status);

  return (
    <section className="thanks">
      <p className="thanks-mark" aria-hidden="true">
        <CheckIcon />
      </p>
      <h1>Cảm ơn bạn đã đặt hàng.</h1>
      <p className="thanks-lead">{cancelled ? "Đơn này đã được hủy." : "Đơn hàng đã được ghi nhận."}</p>
      <p className="thanks-code">#{order.code}</p>
      <p className="thanks-total">{dong(order.total)}</p>
      {user ? <p className="thanks-mail">Thông tin đơn được gửi tới {user.email}</p> : null}
      <div className="thanks-actions">
        <Link to={`/account/orders/${order.code}`} className="thanks-track">Theo dõi đơn</Link>
        <Link to="/products" className="thanks-shop">Tiếp tục mua sắm</Link>
      </div>
      {cancelled ? null : (
        <ol className="thanks-steps">
          {steps.map((label, index) => (
            <li key={label} className={index <= current ? "is-done" : undefined}>
              <span>{index <= current ? <CheckIcon /> : null}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function stepOf(status: string) {
  if (status === "Đang xử lý") {
    return 1;
  }
  if (status === "Đang giao") {
    return 2;
  }
  if (status === "Hoàn thành") {
    return 3;
  }
  return 0;
}

function dong(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)}đ`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
