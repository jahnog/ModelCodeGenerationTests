import type { ShoppingCart } from "../model/shopping-cart";

export interface ShoppingCartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
