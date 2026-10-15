import type { CartItem } from "./CartItem";

export class CartModel {
  private items: CartItem[] = [];
  private nextId = 1;

  addItem(name: string, price: number, quantity: number): CartItem {
    const index = this.items.findIndex(
      (item) => item.name === name && item.price === price,
    );
    const existing = this.items[index];

    if (existing !== undefined) {
      const merged: CartItem = {
        ...existing,
        quantity: existing.quantity + quantity,
      };
      this.items[index] = merged;
      return merged;
    }

    const item: CartItem = { id: this.nextId++, name, price, quantity };
    this.items.push(item);
    return item;
  }

  removeItem(id: number): CartItem | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return undefined;
    }
    const [removed] = this.items.splice(index, 1);
    return removed;
  }

  getItems(): readonly CartItem[] {
    return [...this.items];
  }

  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }
}
