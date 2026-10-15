import type { CartProjection } from "./cartProjection";
import type { CartView } from "./cartView";
import type { GetCartQuery } from "./queries";

// Entry point of the read side: answers queries from the read model only.
export class CartQueryHandler {
  constructor(private readonly projection: CartProjection) {}

  handle(query: GetCartQuery): CartView {
    return (
      this.projection.find(query.cartId) ?? {
        cartId: query.cartId,
        items: [],
        totalQuantity: 0,
        totalCents: 0,
      }
    );
  }
}
