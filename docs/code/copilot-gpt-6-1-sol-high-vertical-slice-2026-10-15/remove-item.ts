import type { ShoppingCart } from "./cart";

/** Removes the entire item, including all of its quantity. */
export function removeItem(cart: ShoppingCart, itemId: string): ShoppingCart {
  if (itemId.trim().length === 0) {
    throw new Error("Item ID must not be empty.");
  }
  if (!cart.items.some((item) => item.id === itemId)) {
    throw new Error(`Item "${itemId}" is not in the shopping cart.`);
  }

  return { items: cart.items.filter((item) => item.id !== itemId) };
}
