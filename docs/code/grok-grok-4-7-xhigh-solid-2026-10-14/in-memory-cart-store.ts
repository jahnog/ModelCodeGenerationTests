import { copyCartItem, type CartItem } from "./cart-item";
import type { AddItemStore, RemoveItemStore, ShowItemsStore } from "./cart-store";

export class InMemoryCartStore implements AddItemStore, RemoveItemStore, ShowItemsStore {
  readonly #items: CartItem[] = [];

  find(id: string): CartItem | undefined {
    const found = this.#items.find((item) => item.id === id);
    return found === undefined ? undefined : copyCartItem(found);
  }

  list(): readonly CartItem[] {
    return Object.freeze(this.#items.map((item) => copyCartItem(item)));
  }

  put(item: CartItem): void {
    const stored = copyCartItem(item);
    const index = this.#items.findIndex((entry) => entry.id === stored.id);
    if (index < 0) {
      this.#items.push(stored);
      return;
    }
    this.#items[index] = stored;
  }

  take(id: string): CartItem | undefined {
    const index = this.#items.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return undefined;
    }
    const removed = this.#items[index];
    if (removed === undefined) {
      return undefined;
    }
    this.#items.splice(index, 1);
    return copyCartItem(removed);
  }
}
