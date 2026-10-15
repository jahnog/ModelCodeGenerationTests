import type { CartId } from "../domain/cart/CartId";
import type { CartRepository } from "../domain/cart/CartRepository";
import { ShoppingCart, type ShoppingCartSnapshot } from "../domain/cart/ShoppingCart";

/**
 * Keeps carts in memory as snapshots, so a caller holding a loaded cart cannot
 * change the stored one without calling save, as with a real database.
 */
export class InMemoryCartRepository implements CartRepository {
  private readonly snapshots = new Map<string, ShoppingCartSnapshot>();

  async findById(id: CartId): Promise<ShoppingCart | undefined> {
    const snapshot = this.snapshots.get(id.value);
    return snapshot ? ShoppingCart.restore(snapshot) : undefined;
  }

  async save(cart: ShoppingCart): Promise<void> {
    this.snapshots.set(cart.id.value, cart.toSnapshot());
  }
}
