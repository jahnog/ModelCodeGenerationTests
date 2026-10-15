import { Cart } from "../models/Cart";
import { CartView } from "../views/CartView";

export class CartController {
  constructor(
    private readonly cart: Cart,
    private readonly view: CartView,
  ) {}

  addItem(id: string, name: string, priceCents: number, quantity = 1): void {
    try {
      this.cart.add({ id, name, priceCents, quantity });
      this.view.showMessage(`Added ${quantity} x ${name}.`);
    } catch (error) {
      this.view.showError(error instanceof Error ? error.message : String(error));
    }
  }

  showItems(): void {
    this.view.showItems(this.cart.items(), this.cart.totalCents());
  }

  removeItem(id: string): void {
    if (this.cart.remove(id)) {
      this.view.showMessage(`Removed item ${id}.`);
    } else {
      this.view.showError(`Item ${id} is not in the cart.`);
    }
  }
}
