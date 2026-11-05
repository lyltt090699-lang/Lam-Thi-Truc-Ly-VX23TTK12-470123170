import { apiFetch } from "./client";

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: string;
};

export type AdminCustomerList = {
  items: AdminCustomer[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function getAdminCustomers(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const response = await apiFetch(`/api/admin/customers${params.size ? `?${params}` : ""}`);
  return (await response.json()) as AdminCustomerList;
}
