import { apiFetch } from "./client";
import type { CheckoutLine } from "./checkout";

export type AdminOrderListItem = {
  id: number;
  code: string;
  status: string;
  customerEmail: string;
  recipientName: string;
  phone: string;
  total: number;
  createdAt: string;
};

export type AdminOrderList = {
  items: AdminOrderListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type AdminOrderDetail = AdminOrderListItem & {
  addressLine: string;
  note: string | null;
  voucherCode: string | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  items: CheckoutLine[];
};

export const orderStatuses = ["Chờ xác nhận", "Đã xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Hủy"];

export async function getAdminOrders(query: { q?: string; status?: string; page?: number }) {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  const response = await apiFetch(`/api/admin/orders${params.size ? `?${params}` : ""}`);
  return (await response.json()) as AdminOrderList;
}

export async function getAdminOrder(id: number) {
  const response = await apiFetch(`/api/admin/orders/${id}`);
  return (await response.json()) as AdminOrderDetail;
}

export async function changeOrderStatus(id: number, status: string) {
  const response = await apiFetch(`/api/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return (await response.json()) as AdminOrderDetail;
}
