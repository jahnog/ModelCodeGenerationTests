import type { CartModel } from "../model/CartModel";
import type { CartView } from "../view/CartView";

export class CartController {
  constructor(
    private readonly model: CartModel,
    private readonly view: CartView,
  ) {}

  addItem(name: string, price: number, quantity = 1): void {
    const trimmedName = name.trim();
    if (trimmedName === "") {
      this.view.showError("Item name must not be empty.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      this.view.showError(`Invalid price for "${trimmedName}": ${price}.`);
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      this.view.showError(
        `Invalid quantity for "${trimmedName}": ${quantity}.`,
      );
      return;
    }

    const item = this.model.addItem(trimmedName, price, quantity);
    this.view.showAdded(item);
  }

  showItems(): void {
    this.view.showItems(this.model.getItems(), this.model.getTotal());
  }

  removeItem(id: number): void {
    const removed = this.model.removeItem(id);
    if (removed === undefined) {
      this.view.showError(`No item with id #${id} in the cart.`);
      return;
    }
    this.view.showRemoved(removed);
  }
}
