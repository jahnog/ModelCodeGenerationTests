import { ShoppingCartModel } from "./shopping-cart.model";
import type { Product } from "./shopping-cart.model";
import { ShoppingCartView } from "./shopping-cart.view";

export class ShoppingCartController {
  private readonly model: ShoppingCartModel;
  private readonly view: ShoppingCartView;

  constructor(model: ShoppingCartModel, view: ShoppingCartView) {
    this.model = model;
    this.view = view;
  }

  addItem(product: Product, quantity = 1): void {
    this.model.addItem(product, quantity);
  }

  showItems(): void {
    this.view.showItems(this.model.getItems(), this.model.getTotal());
  }

  removeItem(productId: string): boolean {
    const removed = this.model.removeItem(productId);
    this.view.showRemoval(productId, removed);
    return removed;
  }
}
