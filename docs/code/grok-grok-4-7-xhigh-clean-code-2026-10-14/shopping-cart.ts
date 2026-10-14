import { CartError } from "./cart-error";
import { createItem, normalizeItemId, type Item } from "./item";

export class ShoppingCart {
  #items: readonly Item[] = [];

  addItem(input: Item): void {
    const item = createItem(input);
    const current = this.#find(item.id);
    if (current === undefined) {
      this.#append(item);
      return;
    }
    this.#replace(item.id, mergeItem(current, item));
  }

  showItems(): readonly Item[] {
    return [...this.#items];
  }

  removeItem(itemId: string): void {
    const id = normalizeItemId(itemId);
    if (this.#find(id) === undefined) {
      throw new CartError(`Item "${id}" is not in the cart.`);
    }
    this.#items = this.#items.filter((stored) => stored.id !== id);
  }

  #find(id: string): Item | undefined {
    return this.#items.find((stored) => stored.id === id);
  }

  #append(item: Item): void {
    this.#items = [...this.#items, item];
  }

  #replace(id: string, item: Item): void {
    this.#items = this.#items.map((stored) =>
      stored.id === id ? item : stored,
    );
  }
}

function mergeItem(current: Item, added: Item): Item {
  if (!sameProduct(current, added)) {
    throw new CartError(
      `Item "${current.id}" is already in the cart with a different name or price.`,
    );
  }
  return createItem({
    id: current.id,
    name: current.name,
    unitPriceInCents: current.unitPriceInCents,
    quantity: current.quantity + added.quantity,
  });
}

function sameProduct(current: Item, added: Item): boolean {
  return (
    current.name === added.name &&
    current.unitPriceInCents === added.unitPriceInCents
  );
}
