import type { ShoppingCart } from "../domain/cart";

export interface CartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
