import { apiFetch } from "./client";

export type CheckoutLine = {
  variantId: number;
  productName: string;
  productSlug?: string;
  sku: string;
  colorName: string;
  storage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type CheckoutQuote = {
  items: CheckoutLine[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  voucherCode: string | null;
  voucherMessage: string | null;
  voucherApplied: boolean;
};

export type CustomerOrder = CheckoutQuote & {
  code: string;
  status: string;
  createdAt: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  note: string | null;
};

export type OrderListLine = {
  productName: string;
  productSlug: string;
  colorName: string;
  storage: string;
  lineTotal: number;
};

export type OrderListItem = {
  code: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  items: OrderListLine[];
};

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateTime(value: string) {
  return dateTime.format(new Date(value));
}

export type PlaceOrderInput = {
  recipientName: string;
  phone: string;
  addressLine: string;
  note: string;
  voucherCode: string;
};

export async function quoteCheckout(voucherCode: string) {
  const response = await apiFetch("/api/checkout/quote", {
    method: "POST",
    body: JSON.stringify({ voucherCode }),
  });
  return (await response.json()) as CheckoutQuote;
}

export async function placeOrder(input: PlaceOrderInput) {
  const response = await apiFetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
  window.dispatchEvent(new Event("cart-changed"));
  return (await response.json()) as CustomerOrder;
}

export async function cancelOrder(code: string) {
  const response = await apiFetch(`/api/orders/${encodeURIComponent(code)}/cancel`, { method: "POST" });
  return (await response.json()) as CustomerOrder;
}

export async function getOrder(code: string) {
  const response = await apiFetch(`/api/orders/${encodeURIComponent(code)}`);
  return (await response.json()) as CustomerOrder;
}

export async function getMyOrders() {
  const response = await apiFetch("/api/orders");
  return (await response.json()) as OrderListItem[];
}

export async function lookupOrder(code: string, phone: string) {
  const response = await apiFetch("/api/orders/lookup", {
    method: "POST",
    body: JSON.stringify({ code, phone }),
  });
  return (await response.json()) as CustomerOrder;
}
