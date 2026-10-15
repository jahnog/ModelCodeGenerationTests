import { lineTotalCents } from "./CartItem";
import type { CartItem } from "./CartItem";
import type { CartFormatter } from "./CartFormatter";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export class TextCartFormatter implements CartFormatter {
  format(items: readonly CartItem[]): string {
    if (items.length === 0) {
      return "The shopping cart is empty.";
    }
    const lines = items.map(
      (item) =>
        `- [${item.id}] ${item.name} x${item.quantity} @ ${formatMoney(item.unitPriceCents)} = ${formatMoney(lineTotalCents(item))}`,
    );
    const total = items.reduce((sum, item) => sum + lineTotalCents(item), 0);
    return [...lines, `Total: ${formatMoney(total)}`].join("\n");
  }
}
