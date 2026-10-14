import { ShoppingCart, type CartSnapshot } from "../domain/cart";
import type { CartRepository } from "./cart-repository";

export class InMemoryCartRepository implements CartRepository {
  #snapshot: CartSnapshot = { items: [] };

  load(): ShoppingCart {
    return ShoppingCart.fromSnapshot(this.#snapshot);
  }

  save(cart: ShoppingCart): void {
    this.#snapshot = cart.toSnapshot();
  }
}
