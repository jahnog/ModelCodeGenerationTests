import { Cart } from "./Cart";
import { CartId } from "./CartId";

/** Port implemented by the infrastructure layer. */
export interface CartRepository {
  findById(id: CartId): Cart | undefined;
  save(cart: Cart): void;
}
