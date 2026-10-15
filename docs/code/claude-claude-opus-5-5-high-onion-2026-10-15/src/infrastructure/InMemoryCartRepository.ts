import { CartItem } from "../domain/CartItem";
import type { CartRepository } from "../domain/CartRepository";
import { ShoppingCart } from "../domain/ShoppingCart";

/** Stores copies so callers cannot mutate saved state without calling save(). */
export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, ShoppingCart>();

  async findById(cartId: string): Promise<ShoppingCart | undefined> {
    const stored = this.carts.get(cartId);
    return stored === undefined ? undefined : copyCart(stored);
  }

  async save(cart: ShoppingCart): Promise<void> {
    this.carts.set(cart.id, copyCart(cart));
  }
}

function copyCart(cart: ShoppingCart): ShoppingCart {
  return new ShoppingCart(cart.id, cart.items.map((item) => CartItem.create(item)));
}
