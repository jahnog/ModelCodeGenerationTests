import { lineTotalCents, type CartItem } from "../domain/cartItem";

export function formatMoney(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `$${whole}.${fraction}`;
}

/** Presentation layer: renders the cart as plain text. */
export function renderCart(items: readonly CartItem[], totalCents: number): string {
  if (items.length === 0) return "The shopping cart is empty.";
  const lines = items.map(
    (item) =>
      `- [${item.id}] ${item.name} x${item.quantity} @ ${formatMoney(item.unitPriceCents)} = ${formatMoney(lineTotalCents(item))}`,
  );
  return ["Shopping cart:", ...lines, `Total: ${formatMoney(totalCents)}`].join("\n");
}
