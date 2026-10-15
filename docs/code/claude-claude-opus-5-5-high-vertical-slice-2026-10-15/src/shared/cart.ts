// Shared kernel: the cart's data model and its storage.
// Every feature slice depends on this file; slices never depend on each other.

export interface CartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartStore {
  find(productId: string): CartItem | undefined;
  save(item: CartItem): void;
  delete(productId: string): void;
  list(): readonly CartItem[];
}

export class InMemoryCartStore implements CartStore {
  readonly #items = new Map<string, CartItem>();

  find(productId: string): CartItem | undefined {
    return this.#items.get(productId);
  }

  save(item: CartItem): void {
    this.#items.set(item.productId, item);
  }

  delete(productId: string): void {
    this.#items.delete(productId);
  }

  list(): readonly CartItem[] {
    return [...this.#items.values()];
  }
}
