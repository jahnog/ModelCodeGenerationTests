import { assertSafeCartTotal, copyCartItem, createCartItem, type CartItem } from "./cart-item";
import type { AddItemStore } from "./cart-store";
import type { LineMergePolicy } from "./line-merge-policy";

export class AddItemToCart {
  readonly #store: AddItemStore;
  readonly #merge: LineMergePolicy;

  constructor(store: AddItemStore, merge: LineMergePolicy) {
    this.#store = store;
    this.#merge = merge;
  }

  execute(input: CartItem): CartItem {
    const incoming = createCartItem(input);
    const current = this.#store.find(incoming.id);
    const stored = current === undefined ? incoming : this.#merge.merge(current, incoming);
    assertSafeCartTotal(project(this.#store.list(), stored));
    this.#store.put(stored);
    return copyCartItem(stored);
  }
}

function project(items: readonly CartItem[], stored: CartItem): CartItem[] {
  let replaced = false;
  const next = items.map((item) => {
    if (item.id !== stored.id) {
      return item;
    }
    replaced = true;
    return stored;
  });
  if (!replaced) {
    next.push(stored);
  }
  return next;
}
