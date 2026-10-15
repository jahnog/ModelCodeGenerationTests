import type { CartReadModel } from "./cartReadModel";
import type { CartView } from "./cartView";
import type { GetCartItems } from "./queries";

export class QueryBus {
  constructor(private readonly readModel: CartReadModel) {}

  ask(query: GetCartItems): CartView {
    return this.readModel.getCart(query.cartId);
  }
}
