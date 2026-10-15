import type { CartId } from "./CartId";
import type { ShoppingCart } from "./ShoppingCart";

/** Port for loading and storing ShoppingCart aggregates. */
export interface CartRepository {
  findById(id: CartId): Promise<ShoppingCart | undefined>;
  save(cart: ShoppingCart): Promise<void>;
}
