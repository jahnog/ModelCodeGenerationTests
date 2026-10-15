import type { CartRepository } from "./application";
import { ShoppingCart } from "./domain";
import type { CartItem } from "./domain";

export class InMemoryCartRepository implements CartRepository {
  private items: readonly CartItem[] = [];

  load(): ShoppingCart {
    return new ShoppingCart(this.items);
  }

  save(cart: ShoppingCart): void {
    this.items = cart.getItems();
  }
}
