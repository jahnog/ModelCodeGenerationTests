import { ShoppingCart } from "./cart";
import { createItem, type CartItem } from "./item";

export interface CartDemo {
  readonly shown: readonly CartItem[];
  readonly listing: string;
  readonly removed: CartItem;
  readonly remaining: readonly CartItem[];
  readonly remainingListing: string;
}

export function runShoppingCart(): CartDemo {
  const cart = new ShoppingCart();
  cart.addItem(createItem("pen", "Blue pen", 150, 2));
  cart.addItem(createItem("notebook", "Notebook", 499, 1));
  cart.addItem(createItem("pen", "Blue pen", 150, 1));

  const shown = cart.showItems();
  const removed = cart.removeItem("pen");
  if (removed === undefined) {
    throw new Error("Expected the pen to be in the cart.");
  }
  const remaining = cart.showItems();

  return {
    shown,
    listing: formatItems(shown),
    removed,
    remaining,
    remainingListing: formatItems(remaining),
  };
}

export function formatItems(items: readonly CartItem[]): string {
  if (items.length === 0) {
    return "The shopping cart is empty.";
  }
  const lines = items.map((item) => {
    const lineTotal = item.quantity * item.unitPriceCents;
    return `${item.quantity} x ${item.name} (${item.id}): ${lineTotal} cents`;
  });
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  return ["Shopping cart", ...lines, `Total: ${total} cents`].join("\n");
}

export const demo = runShoppingCart();
