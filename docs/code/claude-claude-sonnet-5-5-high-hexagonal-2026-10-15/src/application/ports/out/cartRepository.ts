import type { Cart } from "../../../domain/cart";

/** Driven port: how the application stores carts. */
export interface CartRepository {
  /** Returns the stored cart, or undefined if none was saved yet. */
  findById(cartId: string): Promise<Cart | undefined>;
  save(cart: Cart): Promise<void>;
}
