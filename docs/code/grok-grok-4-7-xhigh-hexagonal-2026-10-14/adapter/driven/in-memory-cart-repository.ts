import type { CartItem } from "../../domain/cart-item";
import { ShoppingCart } from "../../domain/shopping-cart";
import type { CartRepository } from "../../application/port/driven/cart-repository";

export class InMemoryCartRepository implements CartRepository {
  #items: readonly CartItem[] = [];

  load(): ShoppingCart {
    return ShoppingCart.fromItems(this.#items);
  }

  save(cart: ShoppingCart): void {
    this.#items = cart.items();
  }
}
