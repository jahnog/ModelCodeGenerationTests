import type { ShoppingCartService } from "./application";
import type { AddCartItem } from "./domain";

export type WriteLine = (message: string) => void;

export class ShoppingCartController {
  constructor(
    private readonly service: ShoppingCartService,
    private readonly writeLine: WriteLine,
  ) {}

  addItem(item: AddCartItem): void {
    this.service.addItem(item);
    this.writeLine(`Added "${item.name.trim()}" to the shopping cart.`);
  }

  showItems(): void {
    const items = this.service.listItems();
    if (items.length === 0) {
      this.writeLine("The shopping cart is empty.");
      return;
    }

    this.writeLine("Shopping cart:");
    for (const item of items) {
      this.writeLine(
        `${item.quantity} x ${item.name} [${item.id}] - ${item.unitPriceCents} cents each`,
      );
    }
  }

  removeItem(id: string): void {
    this.service.removeItem(id);
    this.writeLine(`Removed "${id.trim()}" from the shopping cart.`);
  }
}
