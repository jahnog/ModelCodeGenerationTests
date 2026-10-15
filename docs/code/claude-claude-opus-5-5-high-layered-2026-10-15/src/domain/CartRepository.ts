import type { Cart } from "./Cart";

/** Persistence port. The domain defines it; the infrastructure layer implements it. */
export interface CartRepository {
  load(): Cart;
  save(cart: Cart): void;
}
