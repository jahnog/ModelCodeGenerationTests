import { ShoppingCart } from "./shopping-cart";

/** Domain persistence contract; callers must save changes explicitly. */
export interface ShoppingCartRepository {
  findById(cartId: string): ShoppingCart | undefined;
  save(cart: ShoppingCart): void;
}
