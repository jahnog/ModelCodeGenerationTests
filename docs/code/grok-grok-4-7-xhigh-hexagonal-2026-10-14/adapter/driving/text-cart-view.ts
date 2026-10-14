import type { CartLine } from "../../application/model/cart-line";

export function formatCartItems(items: readonly CartLine[]): string {
  if (items.length === 0) {
    return "The shopping cart is empty.";
  }
  const lines = items.map(
    (item) => `${item.quantity} x ${item.name} (${item.id}): ${item.lineTotalCents} cents`,
  );
  const total = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  if (!Number.isSafeInteger(total)) {
    throw new Error("Cart total is outside the safe integer range.");
  }
  return [...lines, `Total: ${total} cents`].join("\n");
}

export function formatRemovedItem(item: CartLine): string {
  return `Removed ${item.quantity} x ${item.name} (${item.id}).`;
}
