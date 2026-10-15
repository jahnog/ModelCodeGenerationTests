import type { Cart } from "../../domain/entities/Cart";

/** Output port: the application needs carts persisted, but does not care how. */
export interface CartRepository {
  findById(cartId: string): Promise<Cart | undefined>;
  save(cart: Cart): Promise<void>;
}
