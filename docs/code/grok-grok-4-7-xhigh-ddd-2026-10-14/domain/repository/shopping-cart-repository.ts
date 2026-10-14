import { type ShoppingCart } from "../entity/shopping-cart";
import { type CartId } from "../value/cart-id";

export interface ShoppingCartRepository {
  findById(id: CartId): ShoppingCart | undefined;
  save(cart: ShoppingCart): void;
}
