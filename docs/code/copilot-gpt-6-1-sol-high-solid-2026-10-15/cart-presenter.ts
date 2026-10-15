import type { CartContents } from "./cart-item";

export type WriteLine = (message: string) => void;

export class CartPresenter {
  constructor(
    private readonly cart: CartContents,
    private readonly writeLine: WriteLine,
  ) {}

  showItems(): void {
    const items = this.cart.getItems();
    if (items.length === 0) {
      this.writeLine("The shopping cart is empty.");
      return;
    }

    this.writeLine("Shopping cart (prices in cents):");
    for (const item of items) {
      this.writeLine(
        `${item.id}: ${item.name} | quantity: ${item.quantity} | unit price: ${item.unitPriceCents}`,
      );
    }
  }
}
