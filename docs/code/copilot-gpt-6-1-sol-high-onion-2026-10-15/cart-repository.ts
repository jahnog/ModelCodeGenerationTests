import type { ShoppingCart } from "./shopping-cart";

export interface CartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
