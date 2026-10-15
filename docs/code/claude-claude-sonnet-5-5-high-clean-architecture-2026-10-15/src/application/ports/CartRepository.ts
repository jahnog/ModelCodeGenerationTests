import { Cart } from "../../domain/Cart";

export interface CartRepository {
  get(): Promise<Cart>;
  save(cart: Cart): Promise<void>;
}
