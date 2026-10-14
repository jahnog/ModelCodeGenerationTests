import { CartError } from "./cart-error";
import { copyCartItem, type CartItem } from "./cart-item";
import type { RemoveItemStore } from "./cart-store";

export class RemoveItemFromCart {
  readonly #store: RemoveItemStore;

  constructor(store: RemoveItemStore) {
    this.#store = store;
  }

  execute(id: string): CartItem {
    const itemId = id.trim();
    if (itemId.length === 0) {
      throw new CartError("Item id must not be empty.");
    }
    const removed = this.#store.take(itemId);
    if (removed === undefined) {
      throw new CartError(`Item "${itemId}" is not in the cart.`);
    }
    return copyCartItem(removed);
  }
}
