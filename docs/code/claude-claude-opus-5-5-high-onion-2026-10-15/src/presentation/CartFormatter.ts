import type { CartDto } from "../application/CartDto";

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCart(cart: CartDto): string {
  if (cart.items.length === 0) return `Cart "${cart.cartId}" is empty.`;
  const lines = cart.items.map(
    (item) =>
      `  - [${item.productId}] ${item.name} x${item.quantity} @ ${formatCents(item.unitPriceCents)} = ${formatCents(item.subtotalCents)}`,
  );
  return [`Cart "${cart.cartId}":`, ...lines, `  Total: ${formatCents(cart.totalCents)}`].join("\n");
}
