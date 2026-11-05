import { apiBaseUrl, apiFetch, getToken } from "./client";
import type { AdminCategory } from "./adminCategories";

export type AdminProductListItem = {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  categoryId: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  variantCount: number;
  stockQuantity: number;
  minPrice: number;
};

export type AdminProductList = {
  items: AdminProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ProductImageDraft = {
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariantDraft = {
  id?: number;
  sku: string;
  colorName: string;
  colorHex: string;
  storage: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

export type AdminProductDetail = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  images: ProductImageDraft[];
  variants: ProductVariantDraft[];
};

export async function getAdminProducts(query: string, categoryId: string, sort: string, page: number) {
  const params = new URLSearchParams({ page: String(page), pageSize: "8" });
  if (query) {
    params.set("q", query);
  }
  if (categoryId) {
    params.set("categoryId", categoryId);
  }
  if (sort) {
    params.set("sort", sort);
  }

  const response = await apiFetch(`/api/admin/products?${params.toString()}`);
  return (await response.json()) as AdminProductList;
}

export async function getAdminProduct(id: number) {
  const response = await apiFetch(`/api/admin/products/${id}`);
  return (await response.json()) as AdminProductDetail;
}

export async function saveAdminProduct(id: number | null, input: Omit<AdminProductDetail, "id">) {
  const response = await apiFetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as { message: string; id: number };
}

export async function deleteAdminProduct(id: number) {
  const response = await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
  return (await response.json()) as { message: string };
}

export async function uploadProductImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/products/images`, {
    method: "POST",
    headers,
    body,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Không tải được ảnh.");
  }

  return (await response.json()) as { imageUrl: string };
}

export type { AdminCategory };
