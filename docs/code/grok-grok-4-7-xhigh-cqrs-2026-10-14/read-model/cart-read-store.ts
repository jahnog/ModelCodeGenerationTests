import type { ShownCart } from "./shown-cart";

export interface CartReadStore {
  find(cartId: string): ShownCart;
  save(cart: ShownCart): void;
}
