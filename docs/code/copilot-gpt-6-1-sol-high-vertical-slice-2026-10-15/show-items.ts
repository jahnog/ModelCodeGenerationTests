import type { CartItem, ShoppingCart } from "./cart";

/** Returns a snapshot in insertion order without exposing the cart's items. */
export function showItems(cart: ShoppingCart): readonly CartItem[] {
  return cart.items.map((item) => ({ ...item }));
}
