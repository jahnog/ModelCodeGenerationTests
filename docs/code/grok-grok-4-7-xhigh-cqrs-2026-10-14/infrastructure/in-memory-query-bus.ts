import type { QueryBus } from "../query/query-bus";
import type { ShowCartItemsQuery } from "../query/show-cart-items-query";
import type { ShownCart } from "../read-model/shown-cart";

export class InMemoryQueryBus implements QueryBus {
  private showCartItems: ((query: ShowCartItemsQuery) => ShownCart) | undefined;

  registerShowCartItems(handle: (query: ShowCartItemsQuery) => ShownCart): void {
    if (this.showCartItems !== undefined) {
      throw new Error("A query handler for ShowCartItems is already registered.");
    }
    this.showCartItems = handle;
  }

  ask(query: ShowCartItemsQuery): ShownCart {
    if (this.showCartItems === undefined) {
      throw new Error("No query handler is registered for ShowCartItems.");
    }
    return this.showCartItems(query);
  }
}
