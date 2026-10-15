export interface CartItem {
  id: string;
  name: string;
  price: number;
}

export class ShoppingCart {
  #items = new Map<string, CartItem>();

  addItem(item: CartItem): void {
    if (item.id.trim().length === 0) {
      throw new Error("Item ID must not be blank.");
    }
    if (item.name.trim().length === 0) {
      throw new Error("Item name must not be blank.");
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new Error("Item price must be a finite, non-negative number.");
    }
    if (this.#items.has(item.id)) {
      throw new Error(`Item with ID "${item.id}" is already in the cart.`);
    }
    this.#items.set(item.id, { ...item });
  }

  getItems(): CartItem[] {
    return Array.from(this.#items.values(), (item) => ({ ...item }));
  }

  removeItem(id: string): boolean {
    return this.#items.delete(id);
  }

  showItems(): string {
    if (this.#items.size === 0) {
      return "Shopping cart is empty.";
    }
    return Array.from(
      this.#items.values(),
      (item) => `${item.id}: ${item.name} - ${item.price.toFixed(2)}`,
    ).join("\n");
  }
}
