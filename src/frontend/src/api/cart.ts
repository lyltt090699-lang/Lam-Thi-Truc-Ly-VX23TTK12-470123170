import { apiFetch } from "./client";

export type CartLine = {
  variantId: number;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  colorName: string;
  storage: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  lineTotal: number;
};

export type Cart = {
  items: CartLine[];
  subtotal: number;
};

export type CartInput = {
  variantId: number;
  quantity: number;
};

export async function getCart() {
  const response = await apiFetch("/api/cart");
  return (await response.json()) as Cart;
}

export async function setCartQuantity(variantId: number, quantity: number) {
  const response = await apiFetch("/api/cart", {
    method: "PUT",
    body: JSON.stringify({ variantId, quantity }),
  });
  return (await response.json()) as Cart;
}

export async function mergeCart(items: CartInput[]) {
  const response = await apiFetch("/api/cart/merge", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return (await response.json()) as Cart;
}

export async function previewCart(items: CartInput[]) {
  const response = await apiFetch("/api/cart/preview", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return (await response.json()) as Cart;
}
