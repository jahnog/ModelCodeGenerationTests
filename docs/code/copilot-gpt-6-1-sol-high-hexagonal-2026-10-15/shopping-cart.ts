export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  constructor(items: readonly CartItem[] = []) {
    for (const item of items) {
      this.addItem(item);
    }
  }

  addItem(item: CartItem): void {
    const id = item.id.trim();
    const name = item.name.trim();

    if (id.length === 0 || name.length === 0) {
      throw new Error("Item ID and name must not be empty.");
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Item quantity must be a positive safe integer.");
    }

    const existing = this.items.get(id);
    if (existing !== undefined && existing.name !== name) {
      throw new Error(`Item "${id}" already exists with a different name.`);
    }

    const quantity = (existing?.quantity ?? 0) + item.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new Error("Combined item quantity exceeds the safe integer limit.");
    }

    this.items.set(id, { id, name, quantity });
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  removeItem(id: string): void {
    const normalizedId = id.trim();
    if (normalizedId.length === 0) {
      throw new Error("Item ID must not be empty.");
    }
    if (!this.items.delete(normalizedId)) {
      throw new Error(`Item "${normalizedId}" is not in the shopping cart.`);
    }
  }
}
