import type { ShoppingCart } from "./shopping-cart";

export interface CartRepository {
  /** Returns an independent cart; changes are persisted only by save(). */
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
