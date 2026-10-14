import {
  CartError,
  copyCartItem,
  createCartItem,
  toCartLine,
  type CartItem,
  type CartLine,
  type NewCartItem,
} from "./cart-item";

export interface CartSnapshot {
  readonly lines: readonly CartLine[];
  readonly totalCents: number;
}

export type CartListener = () => void;

export interface CartReader {
  snapshot(): CartSnapshot;
  subscribe(listener: CartListener): () => void;
}

export class ShoppingCart implements CartReader {
  readonly #items: CartItem[] = [];
  readonly #listeners = new Set<CartListener>();

  addItem(input: NewCartItem): CartItem {
    const incoming = createCartItem(input);
    const next = this.#items.map((item) => copyCartItem(item));
    const index = next.findIndex((item) => item.id === incoming.id);
    if (index === -1) {
      next.push(incoming);
      this.#replace(next);
      return copyCartItem(incoming);
    }
    const current = next[index];
    if (current === undefined) {
      throw new CartError(`Item "${incoming.id}" is not in the cart.`);
    }
    const stored = mergeItems(current, incoming);
    next[index] = stored;
    this.#replace(next);
    return copyCartItem(stored);
  }

  removeItem(id: string): CartItem {
    const itemId = id.trim();
    if (itemId.length === 0) {
      throw new CartError("Item id must not be empty.");
    }
    const index = this.#items.findIndex((item) => item.id === itemId);
    const current = index === -1 ? undefined : this.#items[index];
    if (current === undefined) {
      throw new CartError(`Item "${itemId}" is not in the cart.`);
    }
    const next = this.#items
      .filter((item) => item.id !== itemId)
      .map((item) => copyCartItem(item));
    this.#replace(next);
    return copyCartItem(current);
  }

  snapshot(): CartSnapshot {
    const lines = this.#items.map((item) => toCartLine(item));
    return {
      lines,
      totalCents: totalCents(lines),
    };
  }

  subscribe(listener: CartListener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  #replace(items: readonly CartItem[]): void {
    assertSafeTotal(items);
    this.#items.length = 0;
    for (const item of items) {
      this.#items.push(item);
    }
    for (const listener of this.#listeners) {
      listener();
    }
  }
}

function mergeItems(current: CartItem, incoming: CartItem): CartItem {
  if (current.name !== incoming.name || current.unitPriceCents !== incoming.unitPriceCents) {
    throw new CartError(
      `Item "${incoming.id}" is already in the cart with a different name or price.`,
    );
  }
  const quantity = current.quantity + incoming.quantity;
  if (!Number.isSafeInteger(quantity)) {
    throw new CartError("Quantity is outside the safe integer range.");
  }
  return createCartItem({
    id: current.id,
    name: current.name,
    unitPriceCents: current.unitPriceCents,
    quantity,
  });
}

function totalCents(lines: readonly CartLine[]): number {
  let total = 0;
  for (const line of lines) {
    total += line.lineTotalCents;
    if (!Number.isSafeInteger(total)) {
      throw new CartError("Cart total is outside the safe integer range.");
    }
  }
  return total;
}

function assertSafeTotal(items: readonly CartItem[]): void {
  totalCents(items.map((item) => toCartLine(item)));
}
