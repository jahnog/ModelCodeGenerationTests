export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  addItem(item: CartItem): void {
    if (item.id.trim().length === 0 || item.name.trim().length === 0) {
      throw new Error("An item must have a nonempty ID and name.");
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new Error("An item's price must be a finite, nonnegative number.");
    }
    if (this.items.has(item.id)) {
      throw new Error(`An item with ID "${item.id}" is already in the cart.`);
    }

    this.items.set(item.id, { ...item });
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  removeItem(id: string): boolean {
    return this.items.delete(id);
  }
}
