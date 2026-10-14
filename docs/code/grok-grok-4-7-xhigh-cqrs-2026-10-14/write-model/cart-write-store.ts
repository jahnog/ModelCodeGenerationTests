import type { ShoppingCart } from "./shopping-cart";

export interface CartWriteStore {
  load(cartId: string): ShoppingCart;
  save(cart: ShoppingCart): void;
}
