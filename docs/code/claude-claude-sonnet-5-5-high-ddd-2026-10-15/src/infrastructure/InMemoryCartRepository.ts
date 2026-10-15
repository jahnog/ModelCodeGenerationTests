import { Cart } from "../domain/cart/Cart";
import { CartId } from "../domain/cart/CartId";
import { CartRepository } from "../domain/cart/CartRepository";

export class InMemoryCartRepository implements CartRepository {
  private readonly store = new Map<string, Cart>();

  findById(id: CartId): Cart | undefined {
    return this.store.get(id.value);
  }

  save(cart: Cart): void {
    this.store.set(cart.id.value, cart);
  }
}
