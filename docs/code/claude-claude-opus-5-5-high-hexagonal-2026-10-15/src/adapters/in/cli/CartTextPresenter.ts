import type { CartView } from "../../../application/ports/in/CartView";

export function formatCents(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `$${whole}.${fraction}`;
}

export function presentCart(cart: CartView): string {
  if (cart.items.length === 0) {
    return `Cart "${cart.cartId}" is empty.`;
  }
  const lines = cart.items.map(
    (item) =>
      `  - [${item.productId}] ${item.name}: ${item.quantity} x ${formatCents(item.unitPriceCents)}` +
      ` = ${formatCents(item.subtotalCents)}`,
  );
  return [
    `Cart "${cart.cartId}":`,
    ...lines,
    `  Total: ${cart.totalQuantity} item(s), ${formatCents(cart.totalCents)}`,
  ].join("\n");
}
