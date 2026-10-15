import { type CartItem, lineTotalInCents } from "./cart-item";
import type { ShoppingCart } from "./shopping-cart";

export function renderCart(cart: ShoppingCart): string {
  if (cart.isEmpty()) {
    return "Your shopping cart is empty.";
  }
  const lines = cart.getItems().map(renderItemLine);
  const totalLine = `Total: ${formatMoney(cart.getTotalInCents())}`;
  return [...lines, totalLine].join("\n");
}

function renderItemLine(item: CartItem): string {
  const unitPrice = formatMoney(item.unitPriceInCents);
  const lineTotal = formatMoney(lineTotalInCents(item));
  return `${item.quantity} x ${item.name} @ ${unitPrice} = ${lineTotal}`;
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
