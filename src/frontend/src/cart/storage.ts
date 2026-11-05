import { getCart, mergeCart, previewCart, setCartQuantity, type Cart, type CartInput } from "../api/cart";
import { getToken } from "../api/client";

const storageKey = "apple-store-cart";

export function readGuestCart(): CartInput[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as CartInput[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item.variantId > 0 && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartInput[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-changed"));
}

export async function addVariant(variantId: number, quantity: number, stock: number) {
  if (getToken()) {
    const cart = await getCart();
    const current = cart.items.find((item) => item.variantId === variantId)?.quantity ?? 0;
    const next = await setCartQuantity(variantId, Math.min(current + quantity, stock));
    window.dispatchEvent(new Event("cart-changed"));
    return next;
  }

  const items = readGuestCart();
  const existing = items.find((item) => item.variantId === variantId);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, stock);
  const next = items.filter((item) => item.variantId !== variantId);
  if (nextQuantity > 0) {
    next.push({ variantId, quantity: nextQuantity });
  }
  writeGuestCart(next);
  return previewCart(next);
}

export async function updateVariant(variantId: number, quantity: number) {
  if (getToken()) {
    const cart = await setCartQuantity(variantId, quantity);
    window.dispatchEvent(new Event("cart-changed"));
    return cart;
  }

  const next = readGuestCart().filter((item) => item.variantId !== variantId);
  if (quantity > 0) {
    next.push({ variantId, quantity });
  }
  writeGuestCart(next);
  return previewCart(next);
}

export async function loadCurrentCart(): Promise<Cart> {
  if (getToken()) {
    return getCart();
  }

  return previewCart(readGuestCart());
}

export async function mergeGuestCart() {
  const items = readGuestCart();
  if (!getToken() || items.length === 0) {
    return;
  }

  await mergeCart(items);
  writeGuestCart([]);
}

export async function cartCount() {
  if (getToken()) {
    const cart = await getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  return readGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}
