import type { CartRepository } from "./cart-repository";
import { ShoppingCart } from "./shopping-cart";

export class InMemoryCartRepository implements CartRepository {
  private cart = new ShoppingCart();

  load(): ShoppingCart {
    return new ShoppingCart(this.cart.getItems());
  }

  save(cart: ShoppingCart): void {
    this.cart = new ShoppingCart(cart.getItems());
  }
}
