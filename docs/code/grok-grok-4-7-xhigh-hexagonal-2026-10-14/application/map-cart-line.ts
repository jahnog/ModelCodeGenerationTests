import type { CartItem } from "../domain/cart-item";
import type { CartLine } from "./model/cart-line";

export function toCartLine(item: CartItem): CartLine {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.unitPriceCents * item.quantity,
  };
}

export function toCartLines(items: readonly CartItem[]): readonly CartLine[] {
  return items.map((item) => toCartLine(item));
}
