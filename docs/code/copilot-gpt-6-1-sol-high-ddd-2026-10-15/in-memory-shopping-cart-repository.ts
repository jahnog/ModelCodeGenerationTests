import { ShoppingCart } from "./shopping-cart";
import type { ShoppingCartRepository } from "./shopping-cart-repository";

/** Infrastructure adapter; stored state is isolated from unsaved changes. */
export class InMemoryShoppingCartRepository implements ShoppingCartRepository {
  private readonly carts = new Map<string, ShoppingCart>();

  findById(cartId: string): ShoppingCart | undefined {
    const cart = this.carts.get(cartId);
    return cart === undefined
      ? undefined
      : new ShoppingCart(cart.id, cart.items);
  }

  save(cart: ShoppingCart): void {
    this.carts.set(cart.id, new ShoppingCart(cart.id, cart.items));
  }
}
