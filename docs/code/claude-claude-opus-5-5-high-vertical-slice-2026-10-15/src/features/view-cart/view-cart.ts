// Feature slice: show the items in the cart.

import type { CartStore } from "../../shared/cart";
import { formatCents } from "../../shared/money";

export interface CartLine {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface CartView {
  readonly lines: readonly CartLine[];
  readonly itemCount: number;
  readonly totalCents: number;
}

export function viewCart(store: CartStore): CartView {
  const lines = store.list().map((item) => ({
    ...item,
    lineTotalCents: item.unitPriceCents * item.quantity,
  }));
  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
}

export function formatCart(view: CartView): string {
  if (view.lines.length === 0) return "The cart is empty.";

  const rows = view.lines.map(
    (line) =>
      `  ${line.quantity} x ${line.name} (${line.productId}) @ ${formatCents(line.unitPriceCents)}` +
      ` = ${formatCents(line.lineTotalCents)}`,
  );
  return [
    `Cart (${view.itemCount} item${view.itemCount === 1 ? "" : "s"}):`,
    ...rows,
    `  Total: ${formatCents(view.totalCents)}`,
  ].join("\n");
}
