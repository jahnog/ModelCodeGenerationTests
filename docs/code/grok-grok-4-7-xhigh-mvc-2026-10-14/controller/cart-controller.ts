import type { NewCartItem } from "../model/cart-item";
import type { ShoppingCart } from "../model/shopping-cart";
import { CartView } from "../view/cart-view";

export class CartController {
  readonly #cart: ShoppingCart;
  readonly #view: CartView;

  constructor(cart: ShoppingCart, view: CartView) {
    this.#cart = cart;
    this.#view = view;
  }

  addItem(item: NewCartItem): string {
    try {
      this.#cart.addItem(item);
      return this.#view.showItems();
    } catch (error: unknown) {
      return this.#view.showError(error);
    }
  }

  showItems(): string {
    return this.#view.showItems();
  }

  removeItem(id: string): string {
    try {
      this.#cart.removeItem(id);
      return this.#view.showItems();
    } catch (error: unknown) {
      return this.#view.showError(error);
    }
  }
}
