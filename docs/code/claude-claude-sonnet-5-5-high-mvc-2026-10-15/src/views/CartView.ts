import type { CartItem } from "../models/CartItem";

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export class CartView {
  renderItems(items: readonly CartItem[], totalCents: number): string {
    if (items.length === 0) {
      return "Your shopping cart is empty.";
    }
    const lines = items.map(
      (item) =>
        `- [${item.id}] ${item.name} x${item.quantity} @ ${formatCents(item.priceCents)}` +
        ` = ${formatCents(item.priceCents * item.quantity)}`,
    );
    return ["Shopping cart:", ...lines, `Total: ${formatCents(totalCents)}`].join("\n");
  }

  showItems(items: readonly CartItem[], totalCents: number): void {
    console.log(this.renderItems(items, totalCents));
  }

  showMessage(message: string): void {
    console.log(message);
  }

  showError(message: string): void {
    console.error(`Error: ${message}`);
  }
}
