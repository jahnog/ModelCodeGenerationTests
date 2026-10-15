import type { CartItem } from "./shopping-cart";
import type { ShoppingCartUseCases } from "./shopping-cart-ports";

export class ShoppingCartConsole {
  constructor(
    private readonly cart: ShoppingCartUseCases,
    private readonly writeLine: (line: string) => void = (line) =>
      console.log(line),
  ) {}

  addItem(item: CartItem): void {
    this.cart.addItem(item);
    this.writeLine(`Added item "${item.id.trim()}".`);
  }

  showItems(): void {
    const items = this.cart.getItems();
    if (items.length === 0) {
      this.writeLine("The shopping cart is empty.");
      return;
    }

    this.writeLine("Shopping cart:");
    for (const item of items) {
      this.writeLine(`[${item.id}] ${item.name} x ${item.quantity}`);
    }
  }

  removeItem(id: string): void {
    this.cart.removeItem(id);
    this.writeLine(`Removed item "${id.trim()}".`);
  }
}
