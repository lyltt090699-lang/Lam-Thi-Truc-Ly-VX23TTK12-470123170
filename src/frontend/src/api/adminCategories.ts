import { apiFetch } from "./client";

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
};

export type AdminCategoryList = {
  items: AdminCategory[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type CategoryWrite = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

export async function getAdminCategories(query: string, sort: string, page: number, pageSize = 8) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (query) {
    params.set("q", query);
  }
  if (sort) {
    params.set("sort", sort);
  }

  const response = await apiFetch(`/api/admin/categories?${params.toString()}`);
  return (await response.json()) as AdminCategoryList;
}

export async function saveAdminCategory(id: number | null, input: CategoryWrite) {
  const response = await apiFetch(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as { message: string; category: AdminCategory };
}

export async function deleteAdminCategory(id: number) {
  const response = await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  return (await response.json()) as { message: string };
}
