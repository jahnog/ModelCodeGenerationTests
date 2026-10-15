export type CartItem = {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly quantity: number;
};

export type NewCartItem = {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly quantity?: number;
};

export class ShoppingCart {
  readonly #items = new Map<string, CartItem>();

  addItem(item: NewCartItem): void {
    const quantity = item.quantity ?? 1;
    if (item.id.trim() === "") throw new Error("Item id must not be empty");
    if (item.name.trim() === "") throw new Error("Item name must not be empty");
    if (!Number.isInteger(item.priceCents) || item.priceCents < 0) {
      throw new Error("Price must be a non-negative whole number of cents");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive whole number");
    }

    const existing = this.#items.get(item.id);
    if (existing === undefined) {
      this.#items.set(item.id, {
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity,
      });
      return;
    }
    if (existing.priceCents !== item.priceCents) {
      throw new Error(`Item "${item.id}" is already in the cart with a different price`);
    }
    this.#items.set(item.id, { ...existing, quantity: existing.quantity + quantity });
  }

  removeItem(id: string): void {
    if (!this.#items.delete(id)) {
      throw new Error(`Item "${id}" is not in the cart`);
    }
  }

  getItems(): readonly CartItem[] {
    return [...this.#items.values()].map((item) => ({ ...item }));
  }

  isEmpty(): boolean {
    return this.#items.size === 0;
  }

  totalCents(): number {
    let total = 0;
    for (const item of this.#items.values()) {
      total += item.priceCents * item.quantity;
    }
    return total;
  }
}
