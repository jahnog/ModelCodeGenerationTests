import type { ShoppingCart } from "./ShoppingCart";

/** Port defined by the core; implemented by the infrastructure layer. */
export interface CartRepository {
  findById(cartId: string): Promise<ShoppingCart | undefined>;
  save(cart: ShoppingCart): Promise<void>;
}
