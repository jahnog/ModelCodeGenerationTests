import type { CartRepository } from "./cart-repository";
import { ShoppingCart } from "./shopping-cart";
import type { CartItem } from "./shopping-cart";

export class InMemoryCartRepository implements CartRepository {
  private items: readonly CartItem[] = [];

  load(): ShoppingCart {
    return new ShoppingCart(this.items);
  }

  save(cart: ShoppingCart): void {
    this.items = cart.listItems();
  }
}
