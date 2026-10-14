import type { CommandAcknowledgement } from "../command/cart-command";
import type { ShownCart } from "../read-model/shown-cart";

export function formatAcknowledgement(result: CommandAcknowledgement): string {
  if (result.accepted) {
    return "Accepted.";
  }
  return `Rejected: ${result.reason}`;
}

export function formatShownCart(cart: ShownCart): string {
  if (cart.items.length === 0) {
    return "Shopping cart is empty.";
  }

  const lines = cart.items.map((item) => {
    const price = formatCents(item.unitPriceCents);
    const lineTotal = formatCents(item.lineTotalCents);
    return `${item.name} (${item.itemId}) x ${item.quantity} @ ${price} = ${lineTotal}`;
  });
  return [...lines, `Total ${formatCents(cart.totalCents)}`].join("\n");
}

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const centsText = remainder < 10 ? `0${remainder}` : `${remainder}`;
  return `${negative ? "-" : ""}$${dollars}.${centsText}`;
}
