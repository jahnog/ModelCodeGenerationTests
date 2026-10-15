import type { Cart } from "./cart";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

/** Renders the cart as a plain-text listing with line totals and a grand total. */
export function formatCart(cart: Cart): string {
  if (cart.isEmpty) {
    return "Your cart is empty.";
  }

  const lines = cart.list().map(({ product, quantity }) => {
    const lineTotal = formatCents(product.priceInCents * quantity);
    return `${quantity} x ${product.name} @ ${formatCents(product.priceInCents)} = ${lineTotal}`;
  });

  return [...lines, `Total: ${formatCents(cart.totalInCents)}`].join("\n");
}
