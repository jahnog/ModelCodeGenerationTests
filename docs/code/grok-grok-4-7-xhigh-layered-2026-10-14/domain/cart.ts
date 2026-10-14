import { AmountOverflowError, InvalidItemError, ItemConflictError, ItemNotFoundError } from "./errors";
import { createItem, lineTotalCents, normalizeItemId, type Item, type ItemDraft } from "./item";

export type CartSnapshot = {
  readonly items: readonly ItemDraft[];
};

export class ShoppingCart {
  readonly #items = new Map<string, Item>();

  static fromSnapshot(snapshot: CartSnapshot): ShoppingCart {
    const cart = new ShoppingCart();
    for (const draft of snapshot.items) {
      const item = createItem(draft);
      if (cart.#items.has(item.id)) {
        throw new InvalidItemError(`Snapshot contains a duplicate item id "${item.id}".`);
      }
      cart.addItem(item);
    }
    return cart;
  }

  addItem(draft: ItemDraft): Item {
    const item = createItem(draft);
    const current = this.#items.get(item.id);
    const stored = current === undefined ? item : mergeItems(current, item);
    const next = new Map(this.#items);
    next.set(item.id, stored);
    assertTotalIsSafe(next.values());
    this.#items.set(item.id, stored);
    return stored;
  }

  removeItem(id: string): Item {
    const itemId = normalizeItemId(id);
    const existing = this.#items.get(itemId);
    if (existing === undefined) {
      throw new ItemNotFoundError(`Item "${itemId}" is not in the cart.`);
    }
    this.#items.delete(itemId);
    return existing;
  }

  listItems(): readonly Item[] {
    return Object.freeze([...this.#items.values()]);
  }

  totalCents(): number {
    return totalCentsOf(this.#items.values());
  }

  toSnapshot(): CartSnapshot {
    const snapshot: CartSnapshot = { items: this.listItems() };
    Object.freeze(snapshot);
    return snapshot;
  }
}

function mergeItems(current: Item, incoming: Item): Item {
  if (current.name !== incoming.name || current.unitPriceCents !== incoming.unitPriceCents) {
    throw new ItemConflictError(
      `Item "${incoming.id}" is already in the cart with a different name or price.`,
    );
  }
  const quantity = current.quantity + incoming.quantity;
  if (!Number.isSafeInteger(quantity)) {
    throw new AmountOverflowError("Quantity is outside the safe integer range.");
  }
  return createItem({
    id: current.id,
    name: current.name,
    unitPriceCents: current.unitPriceCents,
    quantity,
  });
}

function totalCentsOf(items: Iterable<Item>): number {
  let total = 0;
  for (const item of items) {
    total += lineTotalCents(item);
    if (!Number.isSafeInteger(total)) {
      throw new AmountOverflowError("Cart total is outside the safe integer range.");
    }
  }
  return total;
}

function assertTotalIsSafe(items: Iterable<Item>): void {
  totalCentsOf(items);
}
