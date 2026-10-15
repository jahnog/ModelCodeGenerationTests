import type { CartLine, CartStore } from "../../shared/cart-store";
import { formatCents, type Cents } from "../../shared/money";

export interface CartView {
  readonly lines: readonly (CartLine & { readonly lineTotalCents: Cents })[];
  readonly totalQuantity: number;
  readonly totalCents: Cents;
}

export const showCart = (store: CartStore): CartView => {
  const lines = store.load().map((line) => ({
    ...line,
    lineTotalCents: line.unitPriceCents * line.quantity,
  }));
  return {
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
};

export const renderCart = (view: CartView): string => {
  if (view.lines.length === 0) return "Your cart is empty.";

  const rows = view.lines.map(
    (line) =>
      `${line.quantity} x ${line.name} (${line.productId}) @ ${formatCents(line.unitPriceCents)}` +
      ` = ${formatCents(line.lineTotalCents)}`,
  );
  return [
    ...rows,
    `Items: ${view.totalQuantity}`,
    `Total: ${formatCents(view.totalCents)}`,
  ].join("\n");
};
