import type { CartRepository } from "../../application/ports/CartRepository";
import type { Cart } from "../../domain/entities/Cart";

/** Keeps carts in memory for the lifetime of the program. Swap for a database-backed adapter later. */
export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Cart>();

  async findById(cartId: string): Promise<Cart | undefined> {
    return this.carts.get(cartId);
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.id, cart);
  }
}
