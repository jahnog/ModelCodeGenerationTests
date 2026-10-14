import type { ShoppingCart } from "../../../domain/shopping-cart";

export interface CartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
