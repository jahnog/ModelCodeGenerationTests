import type { ShowCartItemsQuery } from "../query/show-cart-items-query";
import type { CartReadStore } from "../read-model/cart-read-store";
import type { ShownCart } from "../read-model/shown-cart";

export class ShowCartItemsHandler {
  readonly kind = "ShowCartItems" as const;
  private readonly carts: CartReadStore;

  constructor(carts: CartReadStore) {
    this.carts = carts;
  }

  handle(query: ShowCartItemsQuery): ShownCart {
    return this.carts.find(query.cartId);
  }
}
