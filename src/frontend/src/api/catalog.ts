import { apiBaseUrl, apiFetch } from "./client";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
};

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isNew: boolean;
  primaryImageUrl: string | null;
  minPrice: number;
  maxPrice: number;
};

export type ProductImage = {
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: number;
  sku: string;
  colorName: string;
  colorHex: string;
  storage: string;
  price: number;
  stockQuantity: number;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isNew: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
};

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return money.format(value);
}

export function formatPriceRange(minPrice: number, maxPrice: number) {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `Từ ${formatPrice(minPrice)}`;
}

export function catalogImage(url: string | null | undefined) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${apiBaseUrl}${url}`;
}

export function colorSwatch(hex: string) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#d2d2d7";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="${safe}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

async function readJson<T>(path: string) {
  const response = await apiFetch(path);
  return (await response.json()) as T;
}

export function getCategories() {
  return readJson<Category[]>("/api/categories");
}

export type ProductListResult = {
  items: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  colors: string[];
  storages: string[];
};

export type ProductFilters = {
  q?: string;
  categorySlug?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  storage?: string;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export function getProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.categorySlug) {
    params.set("categorySlug", filters.categorySlug);
  }
  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }
  if (filters.color) {
    params.set("color", filters.color);
  }
  if (filters.storage) {
    params.set("storage", filters.storage);
  }
  if (filters.inStock) {
    params.set("inStock", "true");
  }
  if (filters.isNew) {
    params.set("isNew", "true");
  }
  if (filters.isFeatured) {
    params.set("isFeatured", "true");
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("pageSize", String(filters.pageSize));
  }

  const query = params.toString();
  return readJson<ProductListResult>(`/api/products${query ? `?${query}` : ""}`);
}

export function getProduct(slug: string) {
  return readJson<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
}

export type Promotion = {
  code: string;
  description: string;
  discountPercent: number;
  minSubtotal: number;
};

export type Bestseller = ProductListItem & {
  soldQuantity: number;
};

export function getPromotions() {
  return readJson<Promotion[]>("/api/products/promotions");
}

export function getBestsellers() {
  return readJson<Bestseller[]>("/api/products/bestsellers");
}
