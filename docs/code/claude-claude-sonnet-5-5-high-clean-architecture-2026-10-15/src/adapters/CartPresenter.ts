import { CartView } from "../application/CartView";

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function presentCart(view: CartView): string {
  if (view.items.length === 0) {
    return "The shopping cart is empty.";
  }
  const lines = view.items.map(
    (item) =>
      `- ${item.name} (${item.productId}) x${item.quantity} @ ${formatMoney(item.unitPriceInCents)} = ${formatMoney(item.lineTotalInCents)}`,
  );
  return [...lines, `Total: ${formatMoney(view.totalInCents)}`].join("\n");
}
