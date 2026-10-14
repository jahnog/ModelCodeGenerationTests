// Application response model. Use cases return this shape. Presenters turn it into a view.

import type { CartItem } from "./domain-entity-cart-item";
import {
  listCartItems,
  type ShoppingCart,
} from "./domain-entity-shopping-cart";

export interface CartLine {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface ShownCart {
  readonly lines: readonly CartLine[];
  readonly totalCents: number;
}

export function toCartLine(item: CartItem): CartLine {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.unitPriceCents * item.quantity,
  };
}

export function toShownCart(cart: ShoppingCart): ShownCart {
  const lines = listCartItems(cart).map((item) => toCartLine(item));
  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return { lines, totalCents };
}
