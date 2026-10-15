import type { CartItem } from "../model/CartItem";

export type Writer = (line: string) => void;

export class CartView {
  constructor(private readonly write: Writer = (line) => console.log(line)) {}

  showItems(items: readonly CartItem[], total: number): void {
    this.write("Shopping cart:");
    if (items.length === 0) {
      this.write("  (empty)");
      return;
    }
    for (const item of items) {
      const subtotal = item.price * item.quantity;
      this.write(
        `  #${item.id} ${item.name} x${item.quantity} @ ${formatMoney(item.price)} = ${formatMoney(subtotal)}`,
      );
    }
    this.write(`  Total: ${formatMoney(total)}`);
  }

  showAdded(item: CartItem): void {
    this.write(`Added: ${item.name} (now x${item.quantity})`);
  }

  showRemoved(item: CartItem): void {
    this.write(`Removed: ${item.name}`);
  }

  showError(message: string): void {
    this.write(`Error: ${message}`);
  }
}

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
