import { itemsOf, type Cart, type CartError } from "./cart";
import type { Item } from "./item";

export type ShownItem = {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
};

export type CartView = {
  readonly items: readonly ShownItem[];
  readonly totalCents: number;
  readonly text: string;
};

const toShownItem = (item: Item): ShownItem => ({
  id: item.id,
  name: item.name,
  unitPriceCents: item.unitPriceCents,
  quantity: item.quantity,
  lineTotalCents: item.unitPriceCents * item.quantity,
});

const formatLine = (item: ShownItem): string =>
  `${item.quantity} x ${item.name} (${item.id}): ${item.lineTotalCents} cents`;

export const showItems = (cart: Cart): CartView => {
  const items = itemsOf(cart).map(toShownItem);
  const totalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const lines = items.length === 0 ? ["The shopping cart is empty."] : items.map(formatLine);
  const text = ["Shopping cart", ...lines, `Total: ${totalCents} cents`].join("\n");
  return { items, totalCents, text };
};

export const describeCartError = (error: CartError): string => {
  switch (error.kind) {
    case "empty-id":
      return "Item id must not be empty.";
    case "empty-name":
      return "Item name must not be empty.";
    case "invalid-price":
      return "Unit price must be a non-negative integer number of cents.";
    case "invalid-quantity":
      return "Quantity must be a positive integer.";
    case "unsafe-line-total":
      return "Line total is outside the safe integer range.";
    case "unsafe-quantity":
      return "Quantity is outside the safe integer range.";
    case "conflicting-item":
      return `Item "${error.id}" is already in the cart with a different name or price.`;
    case "missing-item":
      return `Item "${error.id}" is not in the cart.`;
    default: {
      const unexpected: never = error;
      return unexpected;
    }
  }
};
