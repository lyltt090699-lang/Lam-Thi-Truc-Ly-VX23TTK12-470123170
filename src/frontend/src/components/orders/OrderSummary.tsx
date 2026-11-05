import { formatPrice } from "../../api/catalog";
import { formatDateTime, type CustomerOrder } from "../../api/checkout";

export function OrderSummary({ order }: { order: CustomerOrder }) {
  return (
    <div>
      <p className="text-lg font-semibold">Mã đơn {order.code}</p>
      <p className="mt-2 text-sm">Trạng thái: {order.status}</p>
      <p className="mt-2 text-sm text-muted">{formatDateTime(order.createdAt)}</p>
      <p className="mt-6">{order.recipientName}</p>
      <p className="text-sm text-muted">{order.phone}</p>
      <p className="text-sm text-muted">{order.addressLine}</p>
      {order.note ? <p className="mt-2 text-sm">{order.note}</p> : null}
      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={`${item.sku}-${item.quantity}`}>
            <p className="font-medium">{item.productName}</p>
            <p className="text-sm text-muted">{item.colorName} · {item.storage} · x{item.quantity}</p>
            <p className="text-sm">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt>Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        <div className="flex justify-between gap-4"><dt>Phí giao hàng</dt><dd>{formatPrice(order.shippingFee)}</dd></div>
        <div className="flex justify-between gap-4"><dt>Giảm giá</dt><dd>{formatPrice(order.discount)}</dd></div>
        <div className="flex justify-between gap-4 text-base font-semibold"><dt>Tổng</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>
    </div>
  );
}
