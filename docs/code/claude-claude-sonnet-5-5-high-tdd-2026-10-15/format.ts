import type { CartItem } from "./cart";

export const formatCents = (cents: number): string => {
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `$${dollars}.${rest}`;
};

export const formatCart = (items: readonly CartItem[]): string => {
  if (items.length === 0) return "Your cart is empty.";

  const lines = items.map(
    (item) =>
      `${item.quantity} x ${item.name} @ ${formatCents(item.priceCents)} = ${formatCents(item.priceCents * item.quantity)}`,
  );
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  lines.push(`Total: ${formatCents(total)}`);
  return lines.join("\n");
};
