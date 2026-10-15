import type { CartItem } from "./cart-item";

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  constructor(items: readonly CartItem[] = []) {
    for (const item of items) {
      this.addItem(item);
    }
  }

  addItem(item: CartItem): void {
    if (item.id.trim().length === 0 || item.name.trim().length === 0) {
      throw new Error("An item must have a non-empty ID and name.");
    }

    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new Error("An item price must be a finite, non-negative number.");
    }

    if (this.items.has(item.id)) {
      throw new Error(`Item "${item.id}" is already in the cart.`);
    }

    this.items.set(item.id, { ...item });
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  removeItem(itemId: string): void {
    if (!this.items.delete(itemId)) {
      throw new Error(`Item "${itemId}" is not in the cart.`);
    }
  }
}
