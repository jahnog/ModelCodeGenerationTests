import { assertValidItem, type CartItem } from "./item";

export class ShoppingCart {
  readonly #items: CartItem[] = [];

  addItem(item: CartItem): void {
    assertValidItem(item);
    const stored = copyItem(item);
    const index = this.#items.findIndex((entry) => entry.id === stored.id);
    if (index === -1) {
      this.#items.push(stored);
      return;
    }
    const current = this.#items[index];
    if (current === undefined) {
      this.#items.push(stored);
      return;
    }
    if (current.name !== stored.name || current.unitPriceCents !== stored.unitPriceCents) {
      throw new Error(
        `Item "${stored.id}" is already in the cart with a different name or price.`,
      );
    }
    const quantity = current.quantity + stored.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new Error("Quantity is outside the safe integer range.");
    }
    const merged = copyItem({ ...current, quantity });
    assertValidItem(merged);
    this.#items[index] = merged;
  }

  showItems(): readonly CartItem[] {
    return this.#items.map((item) => copyItem(item));
  }

  removeItem(id: string): CartItem | undefined {
    const index = this.#items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return undefined;
    }
    const removed = this.#items[index];
    if (removed === undefined) {
      return undefined;
    }
    this.#items.splice(index, 1);
    return copyItem(removed);
  }
}

function copyItem(item: CartItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
  };
}
