import type { Cart } from "../../domain/cart";
import type { CartRepository } from "../../application/ports/out/cartRepository";

export class InMemoryCartRepository implements CartRepository {
  private readonly store = new Map<string, Cart>();

  async findById(cartId: string): Promise<Cart | undefined> {
    return this.store.get(cartId);
  }

  async save(cart: Cart): Promise<void> {
    this.store.set(cart.id, cart);
  }
}
