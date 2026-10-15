export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  addItem(item: CartItem): void {
    this.validateItemId(item.id);

    if (item.name.trim().length === 0) {
      throw new TypeError("Item name must not be empty.");
    }

    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new RangeError("Item price must be a finite, non-negative number.");
    }

    if (this.items.has(item.id)) {
      throw new Error(`Item "${item.id}" is already in the cart.`);
    }

    this.items.set(item.id, { ...item });
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  /** Returns false if the item is not in the cart. */
  removeItem(itemId: string): boolean {
    this.validateItemId(itemId);
    return this.items.delete(itemId);
  }

  private validateItemId(itemId: string): void {
    if (itemId.trim().length === 0) {
      throw new TypeError("Item ID must not be empty.");
    }
  }
}
