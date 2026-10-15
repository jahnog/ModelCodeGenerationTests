import type { Cart } from "../../../domain/Cart";

export interface CartRepository {
  findById(cartId: string): Promise<Cart | undefined>;
  save(cart: Cart): Promise<void>;
}
