import { lineTotal, type ShoppingCart } from "./cart";
import { formatCents } from "./money";
import type { RemoveResult } from "./types";

export function formatCart(cart: ShoppingCart): string {
  if (cart.isEmpty) {
    return "Your shopping cart is empty.";
  }

  const lines = cart.getItems().map(
    (item, index) =>
      `${index + 1}. ${item.product.name} x${item.quantity} ` +
      `@ ${formatCents(item.product.unitPrice)} = ${formatCents(lineTotal(item))}`,
  );

  return [
    "Shopping cart:",
    ...lines,
    `Total (${cart.totalQuantity} items): ${formatCents(cart.totalPrice)}`,
  ].join("\n");
}

export function formatRemoveResult(result: RemoveResult): string {
  switch (result.kind) {
    case "removed":
      return `Removed ${result.item.product.name} from the cart.`;
    case "decreased":
      return `Removed some ${result.item.product.name}; ${result.remaining} left in the cart.`;
    case "not-found":
      return `No item with id "${result.productId}" is in the cart.`;
    default: {
      const unreachable: never = result;
      return unreachable;
    }
  }
}
