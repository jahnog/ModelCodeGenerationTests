import type { CartItem } from "./cart-item";

/** Storage used to add an item. It cannot remove a line. */
export interface AddItemStore {
  /** Returns a copy of the item with this id, or undefined when it is absent. */
  find(id: string): CartItem | undefined;

  /** Returns copies of the items in insertion order. */
  list(): readonly CartItem[];

  /** Inserts a copy, or replaces the item with the same id in place. */
  put(item: CartItem): void;
}

/** Storage used to remove an item. It cannot list or insert. */
export interface RemoveItemStore {
  /** Removes the item with this id and returns a copy, or undefined when it is absent. */
  take(id: string): CartItem | undefined;
}

/** Storage used to show items. It cannot change the cart. */
export interface ShowItemsStore {
  /** Returns copies of the items in insertion order. */
  list(): readonly CartItem[];
}
