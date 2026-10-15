import type { CartItem } from "./shopping-cart.model";

export type Output = (message: string) => void;

export class ShoppingCartView {
  private readonly output: Output;

  constructor(output: Output = (message) => console.log(message)) {
    this.output = output;
  }

  showItems(items: readonly CartItem[], total: number): void {
    if (items.length === 0) {
      this.output("Your shopping cart is empty.");
      return;
    }

    this.output("Shopping cart:");
    for (const item of items) {
      this.output(
        `${item.id}: ${item.name} | Quantity: ${item.quantity} | Unit price: $${item.price.toFixed(2)}`,
      );
    }
    this.output(`Total: $${total.toFixed(2)}`);
  }

  showRemoval(productId: string, removed: boolean): void {
    this.output(
      removed
        ? `Removed product "${productId}" from the cart.`
        : `Product "${productId}" was not found in the cart.`,
    );
  }
}
