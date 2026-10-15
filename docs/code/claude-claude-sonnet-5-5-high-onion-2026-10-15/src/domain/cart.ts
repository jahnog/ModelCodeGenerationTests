import { type CartItem, lineTotalInCents } from "./cart-item";
import { ItemNotInCartError } from "./errors";

/** Immutable aggregate: every change returns a new Cart. */
export class Cart {
  readonly id: string;
  readonly items: readonly CartItem[];

  private constructor(id: string, items: readonly CartItem[]) {
    this.id = id;
    this.items = items;
  }

  static empty(id: string): Cart {
    return new Cart(id, []);
  }

  addItem(newItem: CartItem): Cart {
    const existing = this.items.find((item) => item.productId === newItem.productId);
    if (existing === undefined) {
      return new Cart(this.id, [...this.items, newItem]);
    }
    const merged: CartItem = { ...existing, quantity: existing.quantity + newItem.quantity };
    return new Cart(
      this.id,
      this.items.map((item) => (item.productId === merged.productId ? merged : item)),
    );
  }

  removeItem(productId: string): Cart {
    if (!this.items.some((item) => item.productId === productId)) {
      throw new ItemNotInCartError(productId);
    }
    return new Cart(
      this.id,
      this.items.filter((item) => item.productId !== productId),
    );
  }

  totalInCents(): number {
    return this.items.reduce((sum, item) => sum + lineTotalInCents(item), 0);
  }
}
