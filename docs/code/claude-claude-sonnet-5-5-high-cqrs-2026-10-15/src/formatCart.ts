import type { CartView } from "./read/cartView";

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export function formatCart(cart: CartView): string {
  const header = `Cart "${cart.cartId}"`;
  if (cart.items.length === 0) {
    return `${header}\n  (empty)`;
  }
  const lines = cart.items.map(
    (item) =>
      `  ${item.quantity} x ${item.name} @ ${money(item.unitPriceCents)} = ${money(item.lineTotalCents)}`,
  );
  return [header, ...lines, `  Total: ${cart.totalQuantity} item(s), ${money(cart.totalCents)}`].join(
    "\n",
  );
}
