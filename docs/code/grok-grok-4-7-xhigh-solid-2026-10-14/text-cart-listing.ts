import type { CartListing, ShownCartItem } from "./shown-cart";

export class TextCartListing implements CartListing {
  format(items: readonly ShownCartItem[], totalCents: number): string {
    if (items.length === 0) {
      return "The shopping cart is empty.";
    }
    const lines = items.map((item) => {
      return `${item.quantity} x ${item.name} (${item.id}) at ${item.unitPriceCents} cents: ${item.lineTotalCents} cents`;
    });
    return ["Shopping cart", ...lines, `Total: ${totalCents} cents`].join("\n");
  }
}
