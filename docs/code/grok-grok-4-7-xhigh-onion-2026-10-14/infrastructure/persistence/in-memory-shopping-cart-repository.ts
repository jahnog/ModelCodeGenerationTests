import { ShoppingCart } from "../../domain/model/shopping-cart";
import type { ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";

export class InMemoryShoppingCartRepository implements ShoppingCartRepository {
  #cart = ShoppingCart.empty();

  load(): ShoppingCart {
    return this.#cart.copy();
  }

  save(cart: ShoppingCart): void {
    this.#cart = cart.copy();
  }
}
