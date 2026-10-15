import { ShoppingCart } from "./shopping-cart";
import type { ShoppingCartRepository } from "./shopping-cart-ports";

export class InMemoryCartRepository implements ShoppingCartRepository {
  private cart = new ShoppingCart();

  load(): ShoppingCart {
    return new ShoppingCart(this.cart.getItems());
  }

  save(cart: ShoppingCart): void {
    this.cart = new ShoppingCart(cart.getItems());
  }
}
