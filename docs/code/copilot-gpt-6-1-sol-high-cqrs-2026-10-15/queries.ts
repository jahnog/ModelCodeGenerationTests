import type { CartItem, CartReadStore } from "./cart-store";

export class GetCartItemsHandler {
  private readonly store: CartReadStore;

  constructor(store: CartReadStore) {
    this.store = store;
  }

  execute(): readonly CartItem[] {
    return this.store.getItems();
  }
}
