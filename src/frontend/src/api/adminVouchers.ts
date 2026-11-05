import { apiFetch } from "./client";

export type Voucher = {
  id: number;
  code: string;
  description: string;
  discountPercent: number;
  minSubtotal: number;
  isActive: boolean;
};

export type VoucherInput = {
  code: string;
  description: string;
  discountPercent: number;
  minSubtotal: number;
  isActive: boolean;
};

export async function getVouchers() {
  const response = await apiFetch("/api/admin/vouchers");
  return (await response.json()) as Voucher[];
}

export async function saveVoucher(input: VoucherInput, id?: number) {
  const response = await apiFetch(id ? `/api/admin/vouchers/${id}` : "/api/admin/vouchers", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as Voucher;
}

export async function deleteVoucher(id: number) {
  await apiFetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
}
