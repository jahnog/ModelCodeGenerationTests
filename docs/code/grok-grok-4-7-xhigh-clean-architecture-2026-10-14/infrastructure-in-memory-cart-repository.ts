// Frameworks and drivers. In-memory storage behind the application repository port.

import type { CartRepository } from "./application-port-cart-repository";
import {
  copyShoppingCart,
  createShoppingCart,
  type ShoppingCart,
} from "./domain-entity-shopping-cart";

export class InMemoryCartRepository implements CartRepository {
  private cart: ShoppingCart;

  constructor(initial?: ShoppingCart) {
    this.cart = copyShoppingCart(initial ?? createShoppingCart());
  }

  load(): ShoppingCart {
    return copyShoppingCart(this.cart);
  }

  save(cart: ShoppingCart): void {
    this.cart = copyShoppingCart(cart);
  }
}
