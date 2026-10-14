// Application output port. The use cases own this interface. Storage implementations live outside this layer.

import type { ShoppingCart } from "./domain-entity-shopping-cart";

export interface CartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
