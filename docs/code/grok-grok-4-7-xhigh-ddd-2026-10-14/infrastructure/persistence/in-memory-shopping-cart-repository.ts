import { ShoppingCart } from "../../domain/entity/shopping-cart";
import { type ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { type CartId } from "../../domain/value/cart-id";

export class InMemoryShoppingCartRepository implements ShoppingCartRepository {
  readonly #stored = new Map<string, ShoppingCart>();

  findById(id: CartId): ShoppingCart | undefined {
    const stored = this.#stored.get(id.value);
    if (stored === undefined) {
      return undefined;
    }
    return ShoppingCart.restore(stored.id, stored.items());
  }

  save(cart: ShoppingCart): void {
    this.#stored.set(cart.id.value, ShoppingCart.restore(cart.id, cart.items()));
  }
}
