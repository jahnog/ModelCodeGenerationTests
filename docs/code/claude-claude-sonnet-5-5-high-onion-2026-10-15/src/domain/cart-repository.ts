import type { Cart } from "./cart";

export interface CartRepository {
  findById(cartId: string): Promise<Cart | undefined>;
  save(cart: Cart): Promise<void>;
}
