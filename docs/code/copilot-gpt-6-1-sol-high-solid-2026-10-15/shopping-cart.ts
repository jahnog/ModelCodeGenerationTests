import type { CartContents, CartItem } from "./cart-item";
import type { CartStore } from "./cart-store";

export class ShoppingCart implements CartContents {
  constructor(private readonly store: CartStore) {}

  addItem(item: CartItem): void {
    this.validateId(item.id);
    if (item.name.trim().length === 0) {
      throw new Error("Item name must not be blank.");
    }
    if (!Number.isSafeInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
      throw new Error("Unit price must be a non-negative safe integer in cents.");
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be a positive safe integer.");
    }

    const existing = this.store.findById(item.id);
    if (
      existing !== undefined &&
      (existing.name !== item.name ||
        existing.unitPriceCents !== item.unitPriceCents)
    ) {
      throw new Error(`Item "${item.id}" already exists with different details.`);
    }

    const quantity = (existing?.quantity ?? 0) + item.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new Error("Combined quantity exceeds the safe integer limit.");
    }

    this.store.save({ ...item, quantity });
  }

  getItems(): readonly CartItem[] {
    return this.store.getAll();
  }

  removeItem(id: string): void {
    this.validateId(id);
    if (!this.store.delete(id)) {
      throw new Error(`Item "${id}" is not in the cart.`);
    }
  }

  private validateId(id: string): void {
    if (id.trim().length === 0) {
      throw new Error("Item ID must not be blank.");
    }
  }
}
