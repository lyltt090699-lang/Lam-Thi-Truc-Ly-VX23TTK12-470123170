import { apiFetch } from "./client";
import type { ProductListItem } from "./catalog";

export type Wishlist = {
  items: ProductListItem[];
};

let savedIds = new Set<number>();

export function isSaved(productId: number) {
  return savedIds.has(productId);
}

export function wishlistCount() {
  return savedIds.size;
}

export function rememberWishlist(items: { id: number }[]) {
  savedIds = new Set(items.map((item) => item.id));
  window.dispatchEvent(new Event("wishlist-changed"));
}

export async function getWishlist() {
  const response = await apiFetch("/api/wishlist");
  return (await response.json()) as Wishlist;
}

export async function setWishlist(productId: number, saved: boolean) {
  const response = await apiFetch("/api/wishlist", {
    method: "PUT",
    body: JSON.stringify({ productId, saved }),
  });
  const wishlist = (await response.json()) as Wishlist;
  rememberWishlist(wishlist.items);
  return wishlist;
}
