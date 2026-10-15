import type { CartView } from "../application/cart-view-model";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function renderCart(cart: CartView): string {
  if (cart.items.length === 0) {
    return `Cart "${cart.cartId}" is empty.`;
  }
  const lines = cart.items.map(
    (item) =>
      `  ${item.quantity} x ${item.name} (${item.productId}) @ ${formatMoney(item.unitPriceInCents)} = ${formatMoney(item.lineTotalInCents)}`,
  );
  return [`Cart "${cart.cartId}":`, ...lines, `  Total: ${formatMoney(cart.totalInCents)}`].join("\n");
}
